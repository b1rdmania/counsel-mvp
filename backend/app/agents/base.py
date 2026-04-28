"""Base agent class — wraps Claude API calls with logging, timeouts, and structured output.

Two output paths:
  * Tool-use (default): the agent declares a JSON output schema and the model
    is forced to invoke it. This eliminates JSON-parsing errors entirely.
  * Plain text: agents that produce free-form output (e.g. a letter draft)
    override ``output_format = "text"`` and override ``parse_response``.
"""

import hashlib
import json
import logging
import time
import uuid
from datetime import datetime, timezone

import anthropic

from ..config import ANTHROPIC_API_KEY, DEFAULT_MODEL
from ..database import db_connection


logger = logging.getLogger(__name__)
client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)


class AgentResult:
    def __init__(self, data: dict, tokens_in: int = 0, tokens_out: int = 0, duration_ms: int = 0):
        self.data = data
        self.tokens_in = tokens_in
        self.tokens_out = tokens_out
        self.duration_ms = duration_ms


class BaseAgent:
    agent_id: str = "base"
    model: str = DEFAULT_MODEL
    timeout: int = 60
    max_tokens: int = 8192

    # "tool" → force a tool_use call with output_schema (default; JSON-safe)
    # "text" → return raw text via parse_response (used for letter drafting)
    output_format: str = "tool"
    output_schema: dict | None = None
    output_tool_name: str = "emit_result"
    output_tool_description: str = "Emit the structured agent result."

    # Mark the system prompt for prompt caching. System prompts are long and
    # repeated verbatim across thousands of pipeline runs, so this is high-value.
    cache_system_prompt: bool = True

    def build_system_prompt(self) -> str:
        raise NotImplementedError

    def build_user_prompt(self, input_data: dict) -> str:
        raise NotImplementedError

    def parse_response(self, text: str) -> dict:
        """Override for plain-text agents. Default uses tool_use, so this is unused."""
        # Best-effort fallback — strip any code-fence wrapping and parse JSON.
        cleaned = text.strip()
        if cleaned.startswith("```"):
            # Strip leading fence (```json or ```) and trailing fence if present.
            first_newline = cleaned.find("\n")
            if first_newline != -1:
                cleaned = cleaned[first_newline + 1:]
            if cleaned.endswith("```"):
                cleaned = cleaned[: -3]
            cleaned = cleaned.strip()
        return json.loads(cleaned)

    def _system_param(self):
        prompt = self.build_system_prompt()
        if self.cache_system_prompt:
            return [{
                "type": "text",
                "text": prompt,
                "cache_control": {"type": "ephemeral"},
            }]
        return prompt

    def _tools_param(self):
        if self.output_format != "tool" or not self.output_schema:
            return None
        return [{
            "name": self.output_tool_name,
            "description": self.output_tool_description,
            "input_schema": self.output_schema,
        }]

    async def execute(self, input_data: dict, document_id: str) -> AgentResult:
        user_prompt = self.build_user_prompt(input_data)
        input_hash = hashlib.sha256(user_prompt.encode()).hexdigest()[:16]

        start_time = time.time()
        error_msg: str | None = None
        status = "success"
        tokens_in = 0
        tokens_out = 0
        result_data: dict = {}
        raw_text = ""

        try:
            kwargs = {
                "model": self.model,
                "max_tokens": self.max_tokens,
                "system": self._system_param(),
                "messages": [{"role": "user", "content": user_prompt}],
                "timeout": self.timeout,
            }
            tools = self._tools_param()
            if tools:
                kwargs["tools"] = tools
                kwargs["tool_choice"] = {"type": "tool", "name": self.output_tool_name}

            response = await client.messages.create(**kwargs)
            tokens_in = response.usage.input_tokens
            tokens_out = response.usage.output_tokens

            if tools:
                # Find the tool_use block and use its parsed input directly.
                for block in response.content:
                    if getattr(block, "type", None) == "tool_use":
                        result_data = dict(block.input)
                        break
                else:
                    raise RuntimeError("Model did not return a tool_use block")
            else:
                # Plain-text path: take the first text block and run parse_response.
                for block in response.content:
                    if getattr(block, "type", None) == "text":
                        raw_text = block.text
                        break
                result_data = self.parse_response(raw_text)

        except json.JSONDecodeError as e:
            status = "failed"
            error_msg = f"Failed to parse JSON response: {e}"
            result_data = {"error": error_msg, "raw": raw_text}
        except anthropic.APITimeoutError:
            status = "timeout"
            error_msg = f"Agent {self.agent_id} timed out after {self.timeout}s"
            result_data = {"error": error_msg}
        except Exception as e:
            status = "failed"
            error_msg = str(e)
            result_data = {"error": error_msg}

        duration_ms = int((time.time() - start_time) * 1000)
        output_hash = hashlib.sha256(json.dumps(result_data, default=str).encode()).hexdigest()[:16]

        async with db_connection() as db:
            await db.execute(
                """INSERT INTO audit_log
                   (id, document_id, agent_id, action, input_hash, output_hash, model, tokens_in, tokens_out, duration_ms, status, error_msg, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    str(uuid.uuid4()),
                    document_id,
                    self.agent_id,
                    f"{self.agent_id}_execution",
                    input_hash,
                    output_hash,
                    self.model,
                    tokens_in,
                    tokens_out,
                    duration_ms,
                    status,
                    error_msg,
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
            await db.commit()

        if status != "success":
            logger.error("Agent %s failed: %s", self.agent_id, error_msg)
            raise RuntimeError(error_msg)

        return AgentResult(
            data=result_data,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            duration_ms=duration_ms,
        )
