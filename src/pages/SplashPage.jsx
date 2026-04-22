import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const serif = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';

const bodyStyle = {
  backgroundColor: '#0F0F10',
  color: '#EBEBF5',
  fontFamily,
  fontSize: '14px',
  lineHeight: 1.6,
  width: '100vw',
  minHeight: '100vh',
  overflowY: 'auto',
  overflowX: 'hidden',
  WebkitFontSmoothing: 'antialiased',
};

const topBar = {
  position: 'sticky', top: 0, zIndex: 20,
  backgroundColor: 'rgba(15, 15, 16, 0.85)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(235, 235, 245, 0.06)',
  padding: '16px 40px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
};

const section = (bg = 'transparent', pad = '80px 40px') => ({
  padding: pad,
  backgroundColor: bg,
  borderBottom: '1px solid rgba(235, 235, 245, 0.06)',
});

const inner = {
  maxWidth: '1100px',
  margin: '0 auto',
};

const eyebrow = {
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.8px',
  color: 'rgba(235, 235, 245, 0.4)', fontWeight: 600, marginBottom: '16px',
};

const h1 = {
  fontFamily: serif,
  fontSize: 'clamp(42px, 6vw, 68px)',
  fontWeight: 500,
  lineHeight: 1.1,
  letterSpacing: '-1.5px',
  color: '#EBEBF5',
  marginBottom: '24px',
};

const h2 = {
  fontFamily: serif,
  fontSize: 'clamp(28px, 4vw, 40px)',
  fontWeight: 500,
  lineHeight: 1.2,
  letterSpacing: '-0.8px',
  color: '#EBEBF5',
  marginBottom: '16px',
};

const sub = {
  fontSize: '17px',
  color: 'rgba(235, 235, 245, 0.7)',
  lineHeight: 1.6,
  maxWidth: '680px',
};

const paragraph = {
  fontSize: '15px',
  color: 'rgba(235, 235, 245, 0.68)',
  lineHeight: 1.7,
};

const SplashPage = () => {
  const navigate = useNavigate();
  const [ctaHover, setCtaHover] = useState(false);
  const [footerCtaHover, setFooterCtaHover] = useState(false);
  const [topCtaHover, setTopCtaHover] = useState(false);

  const enterDemo = () => navigate('/workspace');

  const primaryCtaStyle = (hovered) => ({
    display: 'inline-flex', alignItems: 'center', gap: '10px',
    backgroundColor: hovered ? '#0077e6' : '#0A84FF',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '8px',
    fontSize: '14px', fontWeight: 600,
    cursor: 'pointer',
    fontFamily,
    transition: 'all 0.15s ease',
    transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: hovered ? '0 8px 24px rgba(10, 132, 255, 0.3)' : '0 2px 8px rgba(10, 132, 255, 0.15)',
  });

  const ghostCtaStyle = (hovered) => ({
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    backgroundColor: hovered ? 'rgba(235, 235, 245, 0.08)' : 'transparent',
    color: '#EBEBF5',
    border: '1px solid rgba(235, 235, 245, 0.15)',
    padding: '9px 18px',
    borderRadius: '6px',
    fontSize: '12px', fontWeight: 500,
    cursor: 'pointer', fontFamily,
    transition: 'all 0.15s ease',
  });

  return (
    <div style={bodyStyle}>
      {/* Top bar */}
      <div style={topBar}>
        <div style={{ fontWeight: 700, letterSpacing: '-0.5px', color: '#EBEBF5', fontSize: '15px' }}>
          BIRD <span style={{ color: 'rgba(235, 235, 245, 0.55)', fontWeight: 500 }}>LEGAL</span>
        </div>
        <button
          onClick={enterDemo}
          onMouseEnter={() => setTopCtaHover(true)}
          onMouseLeave={() => setTopCtaHover(false)}
          style={ghostCtaStyle(topCtaHover)}
        >
          Enter Demo →
        </button>
      </div>

      {/* HERO */}
      <section style={{ ...section('transparent', 'clamp(80px, 12vh, 140px) 40px') }}>
        <div style={inner}>
          <div style={eyebrow}>AI for UK law firms</div>
          <h1 style={h1}>
            Legal AI that doesn't<br />
            leave your office.
          </h1>
          <p style={{ ...sub, marginBottom: '40px' }}>
            Runs on your own models. Lives inside your office — not on servers in San Francisco.
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={enterDemo}
              onMouseEnter={() => setCtaHover(true)}
              onMouseLeave={() => setCtaHover(false)}
              style={primaryCtaStyle(ctaHover)}
            >
              Enter the demo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <div style={{ fontSize: '12px', color: 'rgba(235, 235, 245, 0.4)', marginLeft: '8px' }}>
              No sign-up. Four pre-loaded matters.
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div style={{ ...inner, marginTop: '80px', borderTop: '1px solid rgba(235, 235, 245, 0.06)', paddingTop: '28px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px 40px', fontSize: '12px', color: 'rgba(235, 235, 245, 0.55)',
          }}>
            {[
              'Privilege-preserving architecture',
              'Local-model capable',
              'Full audit trail',
              'Built on UK law',
            ].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#32D74B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={section('#131314')}>
        <div style={inner}>
          <div style={eyebrow}>The problem</div>
          <h2 style={h2}>Your firm has two bad AI options.</h2>
          <p style={{ ...sub, marginBottom: '48px' }}>
            Consumer AI is cheap and compromises everything. Enterprise AI is priced for the Magic Circle. Neither is built for a 15-lawyer commercial firm. So we built the third option.
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
          }}>
            <ProblemCard
              tag="Option 1 — Consumer AI"
              title="ChatGPT. Consumer Claude."
              subtitle="Fast and cheap. Also catastrophic."
              points={[
                'Heppner v. US (Feb 2026) confirmed consumer AI terms waive attorney-client privilege.',
                'Opposing counsel will subpoena your chat logs. The SRA will want words.',
                'You cannot run a firm on a tool that deletes privilege the moment you use it.',
              ]}
              accent="#FF453A"
            />
            <ProblemCard
              tag="Option 2 — Enterprise AI"
              title="Harvey. Eudia. Legora."
              subtitle="Built for Davis Polk. Priced accordingly."
              points={[
                'Harvey: average contract value reportedly above £200K per year.',
                'Workflows designed around US BigLaw, not UK commercial practice.',
                'Your client data still traverses their cloud, not your infrastructure.',
              ]}
              accent="#FF9F0A"
            />
            <ProblemCard
              tag="Option 3 — Bird Legal"
              title="The one we built."
              subtitle="Matter-first. Local-capable. Built for you."
              points={[
                'Self-hostable on Gemma 3, Llama, or Hermes — zero third-party data egress.',
                'Every AI call logged with input/output hashes. SOC 2 roadmap in place.',
                'Priced for independent firms. Configured for UK law by default.',
              ]}
              accent="#32D74B"
              featured
            />
          </div>
        </div>
      </section>

      {/* HOW IT'S DIFFERENT */}
      <section style={section('transparent')}>
        <div style={inner}>
          <div style={eyebrow}>What we built</div>
          <h2 style={h2}>Three things wired in from day one.</h2>
          <p style={{ ...sub, marginBottom: '64px' }}>
            Most legal AI tools treat you like a prompt engineer. We treat you like a solicitor who has a client meeting in an hour and a deadline at five.
          </p>

          <div style={{ display: 'grid', gap: '40px' }}>
            <Pillar
              number="01"
              title="Privilege-preserving by design."
              body={
                <>
                  Run Bird Legal entirely on your own infrastructure — Gemma 3, Llama, Mistral, or Hermes — and client documents never touch a third-party cloud. Every agent call is audit-logged with input/output hashes, model identifiers, and timestamps. The architecture was designed in explicit response to <em>Heppner v. US</em> (SDNY, February 2026), which confirmed that consumer AI terms destroy the confidentiality element of privilege.
                  <br /><br />
                  If your firm prefers a commercial API, Bird Legal also supports Claude and Bedrock with Zero Data Retention configured. The point is: the choice stays with you.
                </>
              }
            />
            <Pillar
              number="02"
              title="Matter-first, not prompt-first."
              body={
                <>
                  Every module knows what every other module knows. Add a party once, it flows into your Letter Before Action. Save a precedent from case law research, it appears in your strategy analysis. Extract a chronology from disclosure bundles, and your draft response references the dates. A persistent AI assistant lives inside every matter and has access to all of it.
                  <br /><br />
                  No more copy-paste between six different AI chats. No more re-explaining the case to the tool every morning.
                </>
              }
            />
            <Pillar
              number="03"
              title="UK law as default — not an afterthought."
              body={
                <>
                  Live integration with The National Archives' Find Case Law API gives you 4,700+ UK judgments with proper neutral citations. Letter templates are CPR-compliant by construction — Part 36 offers strictly follow CPR 36.5. Dates render as DD Month YYYY. Spelling is UK English, not American.
                  <br /><br />
                  Currently scoped to England & Wales with Supreme Court coverage. Jurisdiction packs for Scotland, Northern Ireland, Ireland, Singapore, Hong Kong, and the EU are straightforward to add — the architecture separates jurisdiction from engine.
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section style={section('#131314')}>
        <div style={inner}>
          <div style={eyebrow}>The platform</div>
          <h2 style={h2}>Five modules. One matter. One intelligence.</h2>
          <p style={{ ...sub, marginBottom: '48px' }}>
            Each built to replace several hours of weekly busy work. All of them wired together.
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '14px',
          }}>
            <ModuleCard
              name="Case Law Research"
              accent="#0A84FF"
              oneLine="Search 4,700+ UK judgments. AI ratio decidendi, distinguishing analysis, saved to your matter."
              painPoint="Westlaw has not had its UX updated since 2003."
            />
            <ModuleCard
              name="Litigation Advisor"
              accent="#BF5AF2"
              oneLine="Structure a case, run Nash-equilibrium settlement analysis, and chat to a senior advisor that knows your matter end to end."
              painPoint="Game theory for settlement strategy — nobody else is building this."
            />
            <ModuleCard
              name="Timeline Builder"
              accent="#32D74B"
              oneLine="Upload disclosure bundles. AI extracts every date, ranks by significance, builds the chronology automatically."
              painPoint="Half a day's paralegal work in ninety seconds."
            />
            <ModuleCard
              name="Letter Drafting"
              accent="#FF9F0A"
              oneLine="Letter Before Action. Part 36 Offer. Without Prejudice. Response to Claim. Pre-filled from your matter. CPR-compliant."
              painPoint="You bill for letters. Now you can write them faster."
            />
            <ModuleCard
              name="Contract Scanner"
              accent="rgba(235, 235, 245, 0.6)"
              oneLine="Drop an NDA, MSA, or acquisition agreement. Four-agent pipeline parses clauses, flags risks, drafts redlines."
              painPoint="NDA triage in ninety seconds. Full diligence in under ten minutes."
            />
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section style={section('transparent')}>
        <div style={inner}>
          <div style={eyebrow}>The demo</div>
          <h2 style={h2}>Four real matters. Wired end to end.</h2>
          <p style={{ ...sub, marginBottom: '48px' }}>
            Rather than ask you to create a test matter and figure out the workflow cold, we've pre-loaded four realistic cases. Each has full parties, issues, timeline events, and strategy analysis ready to explore. Walk through one and the whole platform's value becomes obvious in five minutes.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '12px', marginBottom: '40px' }}>
            <MatterRow
              title="Wellington Holdings v Sterling Bank"
              type="Commercial · High Court"
              blurb="£12M commercial loan. Sterling called the facility in January 2026 citing a covenant breach. Wellington says Sterling waived the covenant in November 2025 correspondence. CMC scheduled May 2026."
            />
            <MatterRow
              title="Mercer IP v TechCorp USA"
              type="IP · Patents Court"
              blurb="European patent EP3482910 covering battery thermal management. Infringement claim against TechCorp's European EV imports. Parallel proceedings in Germany. Validity counterclaim citing Japanese prior art."
            />
            <MatterRow
              title="Foxbridge Partners"
              type="Employment · Tribunal"
              blurb="Equality Act claim by a former equity partner alleging sex discrimination, equal pay breach, and unfair dismissal after a failed managing-partner bid. Clyde & Co v Bates van Winkelhof territory."
            />
            <MatterRow
              title="Kensington Trust"
              type="Property · LTA 1954"
              blurb="Commercial lease renewal under the 1954 Act. Rent review dispute: tenant proposes £185K, landlord's surveyor values at £245K. Lease expires 30 June 2026."
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ ...section('#131314', '80px 40px 120px') }}>
        <div style={{ ...inner, textAlign: 'center' }}>
          <div style={eyebrow}>Go have a look.</div>
          <h2 style={{ ...h2, marginBottom: '24px' }}>
            Five minutes in one matter<br />tells you the whole story.
          </h2>
          <p style={{ ...sub, margin: '0 auto 40px', textAlign: 'center' }}>
            No sign-up. No sales call. Just the product, four matters, and an AI that actually knows what it's looking at.
          </p>
          <button
            onClick={enterDemo}
            onMouseEnter={() => setFooterCtaHover(true)}
            onMouseLeave={() => setFooterCtaHover(false)}
            style={primaryCtaStyle(footerCtaHover)}
          >
            Enter the demo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 40px', borderTop: '1px solid rgba(235, 235, 245, 0.06)' }}>
        <div style={{ ...inner, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(235, 235, 245, 0.4)' }}>
            BIRD LEGAL · Built in England · Runs on whatever model you trust
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(235, 235, 245, 0.4)' }}>
            Open to partnership with firms and legal consultancies
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Sub-components ---

const ProblemCard = ({ tag, title, subtitle, points, accent, featured = false }) => (
  <div style={{
    backgroundColor: featured ? 'rgba(50, 215, 75, 0.04)' : '#1A1A1C',
    border: featured ? `1px solid ${accent}40` : '1px solid rgba(235, 235, 245, 0.06)',
    borderRadius: '12px',
    padding: '28px 24px',
    position: 'relative',
  }}>
    <div style={{
      fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px',
      color: accent, fontWeight: 700, marginBottom: '16px',
    }}>
      {tag}
    </div>
    <div style={{ fontFamily: serif, fontSize: '22px', fontWeight: 500, color: '#EBEBF5', marginBottom: '4px', letterSpacing: '-0.3px' }}>
      {title}
    </div>
    <div style={{ fontSize: '13px', color: 'rgba(235, 235, 245, 0.5)', marginBottom: '20px', fontStyle: 'italic' }}>
      {subtitle}
    </div>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {points.map((p, i) => (
        <li key={i} style={{
          fontSize: '13px', color: 'rgba(235, 235, 245, 0.7)',
          lineHeight: 1.6, marginBottom: '10px',
          paddingLeft: '16px', position: 'relative',
        }}>
          <span style={{
            position: 'absolute', left: 0, top: '9px',
            width: '4px', height: '4px', borderRadius: '50%',
            backgroundColor: accent,
          }} />
          {p}
        </li>
      ))}
    </ul>
  </div>
);

const Pillar = ({ number, title, body }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '80px 1fr',
    gap: '24px',
    padding: '28px 0',
    borderTop: '1px solid rgba(235, 235, 245, 0.06)',
  }}>
    <div style={{
      fontFamily: serif, fontSize: '28px', fontWeight: 400,
      color: 'rgba(235, 235, 245, 0.3)',
      letterSpacing: '-0.3px',
    }}>
      {number}
    </div>
    <div>
      <div style={{
        fontFamily: serif, fontSize: '22px', fontWeight: 500, color: '#EBEBF5',
        marginBottom: '12px', letterSpacing: '-0.3px',
      }}>
        {title}
      </div>
      <div style={{ ...paragraph, maxWidth: '700px' }}>
        {body}
      </div>
    </div>
  </div>
);

const ModuleCard = ({ name, oneLine, painPoint, accent }) => (
  <div style={{
    backgroundColor: '#1A1A1C',
    border: '1px solid rgba(235, 235, 245, 0.06)',
    borderRadius: '12px',
    padding: '24px',
    transition: 'all 0.2s ease',
    cursor: 'default',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px',
    }}>
      <div style={{
        width: '8px', height: '8px', borderRadius: '2px',
        backgroundColor: accent,
      }} />
      <div style={{
        fontSize: '13px', fontWeight: 600, color: '#EBEBF5',
        letterSpacing: '-0.1px',
      }}>
        {name}
      </div>
    </div>
    <div style={{ fontSize: '13px', color: 'rgba(235, 235, 245, 0.72)', lineHeight: 1.6, marginBottom: '14px' }}>
      {oneLine}
    </div>
    <div style={{
      fontSize: '12px', color: accent, fontWeight: 500,
      fontStyle: 'italic',
    }}>
      {painPoint}
    </div>
  </div>
);

const MatterRow = ({ title, type, blurb }) => (
  <div style={{
    backgroundColor: '#1A1A1C',
    border: '1px solid rgba(235, 235, 245, 0.06)',
    borderRadius: '10px',
    padding: '20px 24px',
  }}>
    <div style={{
      fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px',
      color: 'rgba(235, 235, 245, 0.4)', fontWeight: 600, marginBottom: '8px',
    }}>
      {type}
    </div>
    <div style={{
      fontFamily: serif, fontSize: '18px', fontWeight: 500, color: '#EBEBF5',
      marginBottom: '10px', letterSpacing: '-0.2px',
    }}>
      {title}
    </div>
    <div style={{ fontSize: '13px', color: 'rgba(235, 235, 245, 0.6)', lineHeight: 1.6 }}>
      {blurb}
    </div>
  </div>
);

export default SplashPage;
