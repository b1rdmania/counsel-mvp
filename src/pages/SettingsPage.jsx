import React, { useState } from 'react';

const Toggle = ({ checked, onChange }) => {
  const sliderStyle = {
    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: checked ? '#0A84FF' : '#48484A', transition: '.2s', borderRadius: '20px',
  };
  const knobStyle = {
    position: 'absolute', height: '16px', width: '16px',
    left: checked ? '18px' : '2px', bottom: '2px',
    backgroundColor: 'white', transition: '.2s', borderRadius: '50%',
  };
  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px', flexShrink: 0 }} onClick={onChange}>
      <div style={sliderStyle}><div style={knobStyle}></div></div>
    </div>
  );
};

const SettingsIcon = () => (
  <svg style={{ width: '14px', height: '14px', fill: 'currentColor', flexShrink: 0 }} viewBox="0 0 24 24">
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.13,5.91,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.84,9.48l2.03,1.58C4.84,11.36,4.81,11.69,4.81,12c0,0.31,0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.5c-1.93,0-3.5-1.57-3.5-3.5 s1.57-3.5,3.5-3.5s3.5,1.57,3.5,3.5S13.93,15.5,12,15.5z"/>
  </svg>
);

const PlaybookIcon = () => (
  <svg style={{ width: '14px', height: '14px', fill: 'currentColor', flexShrink: 0 }} viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
);

const FirmIcon = () => (
  <svg style={{ width: '14px', height: '14px', fill: 'currentColor', flexShrink: 0 }} viewBox="0 0 24 24">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
  </svg>
);

const NotifIcon = () => (
  <svg style={{ width: '14px', height: '14px', fill: 'currentColor', flexShrink: 0 }} viewBox="0 0 24 24">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
  </svg>
);

const fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const Sidebar = ({ activeNav, setActiveNav }) => {
  const navItems = [
    { label: 'AI Analysis Rules', icon: <SettingsIcon /> },
    { label: 'Playbook Templates', icon: <PlaybookIcon /> },
    { label: 'Firm Standards', icon: <FirmIcon /> },
    { label: 'Notifications', icon: <NotifIcon /> },
  ];

  return (
    <aside style={{ width: '240px', backgroundColor: '#262628', borderRight: '1px solid #48484A', display: 'flex', flexDirection: 'column', padding: '16px 0', flexShrink: 0 }}>
      {navItems.map((item) => {
        const isActive = activeNav === item.label;
        return (
          <div
            key={item.label}
            onClick={() => setActiveNav(item.label)}
            style={{
              padding: '8px 20px', color: isActive ? '#0A84FF' : 'rgba(235, 235, 245, 0.6)',
              fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              borderRight: isActive ? '2px solid #0A84FF' : '2px solid transparent', transition: 'all 0.1s',
            }}
            onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#EBEBF5'; }}}
            onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(235, 235, 245, 0.6)'; }}}
          >
            {item.icon}
            {item.label}
          </div>
        );
      })}
    </aside>
  );
};

const inputStyle = {
  backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #48484A', color: '#EBEBF5',
  padding: '6px 12px', borderRadius: '4px', fontSize: '12px', width: '220px', outline: 'none', fontFamily,
};

const btnStyle = {
  background: 'transparent', border: '1px solid #48484A', color: '#EBEBF5',
  padding: '8px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily,
};

const primaryBtnStyle = {
  backgroundColor: '#0A84FF', color: 'white', border: '1px solid transparent',
  padding: '8px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily,
};

const AIAnalysisRules = () => {
  const [semanticSearch, setSemanticSearch] = useState(true);
  const [draftingStyle, setDraftingStyle] = useState('Balanced Commercial');
  const [crossReference, setCrossReference] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#EBEBF5' }}>AI Analysis Engine</h1>
        <p style={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '13px' }}>
          Configure how the Stella neural extraction engine identifies risks and suggests revisions across your document portfolio.
        </p>
      </div>

      <div style={{ marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid #38383A' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#EBEBF5' }}>Extraction Parameters</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, color: '#EBEBF5', display: 'block', marginBottom: '2px', fontSize: '13px' }}>Contextual Semantic Search</label>
              <span style={{ fontSize: '11px', color: 'rgba(235, 235, 245, 0.6)' }}>Allow AI to identify risks based on intent rather than exact keyword matches.</span>
            </div>
            <Toggle checked={semanticSearch} onChange={() => setSemanticSearch(!semanticSearch)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, color: '#EBEBF5', display: 'block', marginBottom: '2px', fontSize: '13px' }}>Drafting Style Preference</label>
              <span style={{ fontSize: '11px', color: 'rgba(235, 235, 245, 0.6)' }}>Set the tone for AI-suggested revisions.</span>
            </div>
            <select value={draftingStyle} onChange={(e) => setDraftingStyle(e.target.value)} style={inputStyle}>
              <option>Strict / Defensive</option>
              <option>Balanced Commercial</option>
              <option>Conciliatory</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid #38383A' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#EBEBF5' }}>Risk Severity Thresholds</h2>
        <p style={{ fontSize: '11px', color: 'rgba(235, 235, 245, 0.6)', marginBottom: '20px' }}>Define the confidence level and deviation impact required to trigger automated alerts.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { dot: '#FF453A', label: 'Critical Flag (High)', desc: 'Deviations exceeding 40% from firm standard playbook.', tag: 'Immediate Alert' },
            { dot: '#FF9F0A', label: 'Cautionary Flag (Medium)', desc: 'Unusual language or non-standard commercial terms.', tag: 'Digest Summary' },
          ].map(t => (
            <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.15)', padding: '10px 16px', borderRadius: '6px', border: '1px solid #38383A' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.dot, flexShrink: 0 }}></div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 500, color: '#EBEBF5', display: 'block', marginBottom: '2px', fontSize: '13px' }}>{t.label}</span>
                <span style={{ fontSize: '11px', color: 'rgba(235, 235, 245, 0.6)' }}>{t.desc}</span>
              </div>
              <div style={{ background: '#262628', border: '1px solid #48484A', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', color: 'rgba(235, 235, 245, 0.6)', whiteSpace: 'nowrap' }}>{t.tag}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#EBEBF5' }}>Active Playbooks</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '6px', border: '1px dashed #48484A' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, color: '#EBEBF5', display: 'block', marginBottom: '2px', fontSize: '13px' }}>M&A Buy-Side Master Playbook v4.2</label>
              <span style={{ fontSize: '11px', color: 'rgba(235, 235, 245, 0.6)' }}>Primary source for IP, Liability, and Indemnity standards.</span>
            </div>
            <button style={btnStyle}>Configure</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, color: '#EBEBF5', display: 'block', marginBottom: '2px', fontSize: '13px' }}>Cross-Reference Verification</label>
              <span style={{ fontSize: '11px', color: 'rgba(235, 235, 245, 0.6)' }}>Flag inconsistencies between defined terms and usage across documents.</span>
            </div>
            <Toggle checked={crossReference} onChange={() => setCrossReference(!crossReference)} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
        {resetSuccess && <span style={{ fontSize: '12px', color: '#32D74B' }}>Reset to defaults!</span>}
        {saveSuccess && <span style={{ fontSize: '12px', color: '#32D74B' }}>Engine updated!</span>}
        <button onClick={() => { setResetSuccess(true); setTimeout(() => setResetSuccess(false), 2000); }} style={btnStyle}>Reset to Defaults</button>
        <button onClick={() => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2000); }} style={primaryBtnStyle}>Update Analysis Engine</button>
      </div>
    </div>
  );
};

const PlaybookTemplates = () => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const templates = [
    { name: 'M&A Buy-Side Master Playbook v4.2', category: 'M&A', clauses: 124, lastUpdated: '2 days ago' },
    { name: 'Employment Agreements Standard v2.1', category: 'Employment', clauses: 67, lastUpdated: '1 week ago' },
    { name: 'SaaS License Agreement Template v3.0', category: 'Technology', clauses: 89, lastUpdated: '3 weeks ago' },
    { name: 'NDA Mutual & One-Way Templates', category: 'Confidentiality', clauses: 32, lastUpdated: '1 month ago' },
  ];
  const categoryColors = { 'M&A': '#0A84FF', 'Employment': '#32D74B', 'Technology': '#FF9F0A', 'Confidentiality': '#BF5AF2' };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#EBEBF5' }}>Playbook Templates</h1>
        <p style={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '13px' }}>Manage and configure your firm's contract playbook templates used for risk analysis and drafting guidance.</p>
      </div>
      <div style={{ marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid #38383A' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: '#EBEBF5' }}>Available Templates</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {templates.map((t) => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', background: 'rgba(0,0,0,0.15)', padding: '14px 16px', borderRadius: '6px', border: '1px solid #38383A' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500, color: '#EBEBF5', fontSize: '13px' }}>{t.name}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: categoryColors[t.category], backgroundColor: `${categoryColors[t.category]}20`, padding: '2px 8px', borderRadius: '10px' }}>{t.category}</span>
                </div>
                <span style={{ fontSize: '11px', color: 'rgba(235, 235, 245, 0.6)' }}>{t.clauses} standard clauses · Updated {t.lastUpdated}</span>
              </div>
              <button style={{ ...btnStyle, padding: '6px 14px' }}>Edit</button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
        {saveSuccess && <span style={{ fontSize: '12px', color: '#32D74B' }}>New template created!</span>}
        <button onClick={() => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2000); }} style={primaryBtnStyle}>+ New Template</button>
      </div>
    </div>
  );
};

const FirmStandards = () => {
  const [jurisdiction, setJurisdiction] = useState('England & Wales');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#EBEBF5' }}>Firm Standards</h1>
        <p style={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '13px' }}>Define jurisdiction defaults, regulatory references, and standard compliance benchmarks for your firm.</p>
      </div>
      <div style={{ marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid #38383A' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: '#EBEBF5' }}>Jurisdiction & Compliance</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, color: '#EBEBF5', display: 'block', marginBottom: '2px', fontSize: '13px' }}>Primary Jurisdiction</label>
              <span style={{ fontSize: '11px', color: 'rgba(235, 235, 245, 0.6)' }}>Default legal framework for contract interpretation.</span>
            </div>
            <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} style={inputStyle}>
              <option>England & Wales</option>
              <option>New York State</option>
              <option>Delaware</option>
              <option>Singapore</option>
              <option>EU (GDPR Applicable)</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, color: '#EBEBF5', display: 'block', marginBottom: '2px', fontSize: '13px' }}>Auto-Update Regulatory References</label>
              <span style={{ fontSize: '11px', color: 'rgba(235, 235, 245, 0.6)' }}>Automatically sync with latest statutory changes and case law updates.</span>
            </div>
            <Toggle checked={autoUpdate} onChange={() => setAutoUpdate(!autoUpdate)} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
        {saveSuccess && <span style={{ fontSize: '12px', color: '#32D74B' }}>Standards saved!</span>}
        <button onClick={() => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2000); }} style={primaryBtnStyle}>Save Standards</button>
      </div>
    </div>
  );
};

const Notifications = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [digestEmails, setDigestEmails] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [slackIntegration, setSlackIntegration] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#EBEBF5' }}>Notifications</h1>
        <p style={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '13px' }}>Configure alert delivery preferences for risk flags, document updates, and system events.</p>
      </div>
      <div style={{ marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid #38383A' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: '#EBEBF5' }}>Alert Channels</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { label: 'Email Alerts (Critical)', desc: 'Send immediate email notifications for high-severity risk flags.', state: emailAlerts, toggle: () => setEmailAlerts(!emailAlerts) },
            { label: 'Digest Emails', desc: 'Daily summary of medium-severity flags and document activity.', state: digestEmails, toggle: () => setDigestEmails(!digestEmails) },
            { label: 'In-App Notifications', desc: 'Show banner alerts within the Stella Counsel workspace.', state: inAppAlerts, toggle: () => setInAppAlerts(!inAppAlerts) },
            { label: 'Slack Integration', desc: 'Post critical flags to a designated Slack channel.', state: slackIntegration, toggle: () => setSlackIntegration(!slackIntegration) },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, color: '#EBEBF5', display: 'block', marginBottom: '2px', fontSize: '13px' }}>{item.label}</label>
                <span style={{ fontSize: '11px', color: 'rgba(235, 235, 245, 0.6)' }}>{item.desc}</span>
              </div>
              <Toggle checked={item.state} onChange={item.toggle} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
        {saveSuccess && <span style={{ fontSize: '12px', color: '#32D74B' }}>Preferences saved!</span>}
        <button onClick={() => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2000); }} style={primaryBtnStyle}>Save Preferences</button>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const [activeNav, setActiveNav] = useState('AI Analysis Rules');

  const renderContent = () => {
    switch (activeNav) {
      case 'AI Analysis Rules': return <AIAnalysisRules />;
      case 'Playbook Templates': return <PlaybookTemplates />;
      case 'Firm Standards': return <FirmStandards />;
      case 'Notifications': return <Notifications />;
      default: return <AIAnalysisRules />;
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      <main style={{ flex: 1, backgroundColor: '#1E1E20', overflowY: 'auto', padding: '40px 60px' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default SettingsPage;
