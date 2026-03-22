"""PDF and DOCX text extraction."""

from pathlib import Path

import fitz  # PyMuPDF
from docx import Document as DocxDocument


def extract_text(file_path: Path) -> str:
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        return _extract_pdf(file_path)
    elif suffix in (".docx", ".doc"):
        return _extract_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {suffix}")


def _extract_pdf(file_path: Path) -> str:
    doc = fitz.open(str(file_path))
    pages: list[str] = []
    for page_num, page in enumerate(doc, 1):
        text = page.get_text("text")
        if text.strip():
            pages.append(f"--- Page {page_num} ---\n{text}")
    doc.close()
    return "\n\n".join(pages)


def _extract_docx(file_path: Path) -> str:
    doc = DocxDocument(str(file_path))
    paragraphs: list[str] = []
    for para in doc.paragraphs:
        if para.text.strip():
            prefix = ""
            if para.style and para.style.name:
                style = para.style.name.lower()
                if "heading" in style:
                    prefix = f"[{para.style.name}] "
            paragraphs.append(f"{prefix}{para.text}")
    return "\n\n".join(paragraphs)
