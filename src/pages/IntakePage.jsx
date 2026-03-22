import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../api/client';

const customStyles = {
  mainWorkspace: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    background: 'radial-gradient(circle at center, #252528 0%, #1C1C1E 100%)',
  },
  intakeCard: {
    width: '100%',
    maxWidth: '840px',
    backgroundColor: '#262628',
    border: '1px solid #48484A',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  intakeBody: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    minHeight: '520px',
  },
  uploadSection: {
    padding: '40px',
    borderRight: '1px solid #38383A',
    display: 'flex',
    flexDirection: 'column',
  },
  dropZone: {
    flex: 1,
    border: '2px dashed #48484A',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  dropZoneHover: {
    borderColor: '#0A84FF',
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
  },
  uploadIcon: {
    width: '48px',
    height: '48px',
    color: 'rgba(235, 235, 245, 0.3)',
  },
  uploadIconHover: {
    color: '#0A84FF',
  },
  uploadTextH3: {
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: '4px',
    color: '#EBEBF5',
  },
  uploadTextP: {
    color: 'rgba(235, 235, 245, 0.6)',
    fontSize: '12px',
  },
  configSection: {
    padding: '32px 24px',
    backgroundColor: 'rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  configGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  configLabel: {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'rgba(235, 235, 245, 0.6)',
    fontWeight: 600,
  },
  optionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '8px',
  },
  optionCard: {
    backgroundColor: '#1E1E20',
    border: '1px solid #48484A',
    borderRadius: '6px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.1s',
  },
  optionCardHover: {
    borderColor: '#0A84FF',
  },
  optionCardActive: {
    borderColor: '#0A84FF',
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
  },
  optionTitle: {
    fontWeight: 600,
    fontSize: '12px',
    marginBottom: '2px',
    color: '#EBEBF5',
  },
  optionDesc: {
    fontSize: '11px',
    color: 'rgba(235, 235, 245, 0.6)',
    lineHeight: '1.3',
  },
  selectBox: {
    backgroundColor: '#1E1E20',
    border: '1px solid #48484A',
    borderRadius: '6px',
    padding: '10px 12px',
    color: '#EBEBF5',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 0',
  },
  toggleSwitch: {
    width: '32px',
    height: '18px',
    backgroundColor: '#48484A',
    borderRadius: '10px',
    position: 'relative',
    cursor: 'pointer',
    flexShrink: 0,
  },
  toggleSwitchOn: {
    backgroundColor: '#32D74B',
  },
  toggleKnob: {
    position: 'absolute',
    width: '14px',
    height: '14px',
    backgroundColor: 'white',
    borderRadius: '50%',
    top: '2px',
    left: '2px',
    transition: 'transform 0.2s',
  },
  toggleKnobOn: {
    transform: 'translateX(14px)',
  },
  footerActions: {
    padding: '20px 24px',
    borderTop: '1px solid #48484A',
    backgroundColor: '#262628',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  btn: {
    padding: '10px 24px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.1s',
  },
  btnGhost: {
    color: 'rgba(235, 235, 245, 0.6)',
    background: 'transparent',
    border: '1px solid transparent',
  },
  btnPrimary: {
    backgroundColor: '#0A84FF',
    color: 'white',
    minWidth: '160px',
    border: '1px solid transparent',
  },
  btnPrimaryDisabled: {
    backgroundColor: '#0A84FF',
    color: 'white',
    minWidth: '160px',
    border: '1px solid transparent',
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

const ToggleSwitch = ({ isOn, onToggle }) => {
  return (
    <div
      style={{ ...customStyles.toggleSwitch, ...(isOn ? customStyles.toggleSwitchOn : {}) }}
      onClick={onToggle}
    >
      <div style={{ ...customStyles.toggleKnob, ...(isOn ? customStyles.toggleKnobOn : {}) }} />
    </div>
  );
};

const OptionCard = ({ title, description, isActive, onClick, onMouseEnter, onMouseLeave, isHovered }) => {
  const cardStyle = {
    ...customStyles.optionCard,
    ...(isActive ? customStyles.optionCardActive : {}),
    ...(isHovered && !isActive ? customStyles.optionCardHover : {}),
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div style={customStyles.optionTitle}>{title}</div>
      <div style={customStyles.optionDesc}>{description}</div>
    </div>
  );
};

const IntakePage = () => {
  const navigate = useNavigate();
  const [activeOption, setActiveOption] = useState('ma');
  const [hoveredOption, setHoveredOption] = useState(null);
  const [isDropZoneHovered, setIsDropZoneHovered] = useState(false);
  const [isGhostHovered, setIsGhostHovered] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [toggleFlagMarket, setToggleFlagMarket] = useState(true);
  const [toggleAutoSuggest, setToggleAutoSuggest] = useState(true);
  const [toggleComparePlaybook, setToggleComparePlaybook] = useState(false);

  const [posture, setPosture] = useState('Balanced / Market Standard');
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const postureOptions = [
    'Balanced / Market Standard',
    'Aggressive / Seller Favorable',
    'Conservative / Buyer Favorable',
    'Neutral',
  ];

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setFileUploaded(true);
      setUploadError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDropZoneClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.onchange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        setSelectedFile(e.target.files[0]);
        setFileUploaded(true);
        setUploadError(null);
      }
    };
    input.click();
  };

  const isDropHovered = isDropZoneHovered || isDraggingOver;

  const dropZoneStyle = {
    ...customStyles.dropZone,
    ...(isDropHovered ? customStyles.dropZoneHover : {}),
  };

  const uploadIconStyle = {
    ...customStyles.uploadIcon,
    ...(isDropHovered ? customStyles.uploadIconHover : {}),
  };

  return (
    <main style={customStyles.mainWorkspace}>
      <div style={customStyles.intakeCard}>
        <div style={customStyles.intakeBody}>
          {/* Upload Section */}
          <section style={customStyles.uploadSection}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#EBEBF5' }}>
                Analyze New Document
              </h2>
              <p style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                Upload a PDF or Word document to begin neural extraction and risk mapping.
              </p>
            </div>

            <div
              style={dropZoneStyle}
              onMouseEnter={() => setIsDropZoneHovered(true)}
              onMouseLeave={() => setIsDropZoneHovered(false)}
              onClick={handleDropZoneClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {fileUploaded ? (
                <>
                  <svg style={{ ...uploadIconStyle, color: '#32D74B' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={customStyles.uploadTextH3}>File uploaded</h3>
                    <p style={customStyles.uploadTextP}>Click to replace or drop another file</p>
                  </div>
                </>
              ) : (
                <>
                  <svg style={uploadIconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={customStyles.uploadTextH3}>Drop contract here</h3>
                    <p style={customStyles.uploadTextP}>or click to browse files</p>
                  </div>
                </>
              )}
            </div>

            <div style={{ marginTop: '24px', fontSize: '11px', color: 'rgba(235, 235, 245, 0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg style={{ width: '12px', height: '12px', fill: 'rgba(235,235,245,0.3)', flexShrink: 0 }} viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z" />
              </svg>
              Secure AES-256 encrypted processing
            </div>
          </section>

          {/* Config Section */}
          <aside style={customStyles.configSection}>
            <div style={customStyles.configGroup}>
              <label style={customStyles.configLabel}>Analysis Type</label>
              <div style={customStyles.optionGrid}>
                <OptionCard
                  title="M&A Acquisition"
                  description="Comprehensive due diligence, liability caps, and survival periods."
                  isActive={activeOption === 'ma'}
                  isHovered={hoveredOption === 'ma'}
                  onClick={() => setActiveOption('ma')}
                  onMouseEnter={() => setHoveredOption('ma')}
                  onMouseLeave={() => setHoveredOption(null)}
                />
                <OptionCard
                  title="SaaS MSA"
                  description="Service levels, data privacy, IP ownership, and indemnities."
                  isActive={activeOption === 'saas'}
                  isHovered={hoveredOption === 'saas'}
                  onClick={() => setActiveOption('saas')}
                  onMouseEnter={() => setHoveredOption('saas')}
                  onMouseLeave={() => setHoveredOption(null)}
                />
                <OptionCard
                  title="Standard NDA"
                  description="Fast-track review for confidentiality and non-solicit."
                  isActive={activeOption === 'nda'}
                  isHovered={hoveredOption === 'nda'}
                  onClick={() => setActiveOption('nda')}
                  onMouseEnter={() => setHoveredOption('nda')}
                  onMouseLeave={() => setHoveredOption(null)}
                />
              </div>
            </div>

            <div style={customStyles.configGroup}>
              <label style={customStyles.configLabel}>Review Posture</label>
              <div style={{ position: 'relative' }}>
                <div
                  style={customStyles.selectBox}
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                >
                  <span>{posture}</span>
                  <svg style={{ width: '12px', height: '12px', fill: '#EBEBF5' }} viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5H7z" />
                  </svg>
                </div>
                {isSelectOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#1E1E20',
                    border: '1px solid #48484A',
                    borderRadius: '6px',
                    marginTop: '4px',
                    zIndex: 10,
                    overflow: 'hidden',
                  }}>
                    {postureOptions.map((option) => (
                      <div
                        key={option}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          color: option === posture ? '#0A84FF' : '#EBEBF5',
                          fontSize: '13px',
                          backgroundColor: option === posture ? 'rgba(10,132,255,0.1)' : 'transparent',
                        }}
                        onClick={() => {
                          setPosture(option);
                          setIsSelectOpen(false);
                        }}
                        onMouseEnter={(e) => {
                          if (option !== posture) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                        }}
                        onMouseLeave={(e) => {
                          if (option !== posture) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={customStyles.configGroup}>
              <label style={customStyles.configLabel}>Preferences</label>
              <div style={customStyles.toggleRow}>
                <span style={{ fontSize: '12px', color: '#EBEBF5' }}>Flag Market Deviations</span>
                <ToggleSwitch isOn={toggleFlagMarket} onToggle={() => setToggleFlagMarket(!toggleFlagMarket)} />
              </div>
              <div style={customStyles.toggleRow}>
                <span style={{ fontSize: '12px', color: '#EBEBF5' }}>Auto-Suggest Revisions</span>
                <ToggleSwitch isOn={toggleAutoSuggest} onToggle={() => setToggleAutoSuggest(!toggleAutoSuggest)} />
              </div>
              <div style={customStyles.toggleRow}>
                <span style={{ fontSize: '12px', color: '#EBEBF5' }}>Compare to Playbook</span>
                <ToggleSwitch isOn={toggleComparePlaybook} onToggle={() => setToggleComparePlaybook(!toggleComparePlaybook)} />
              </div>
            </div>
          </aside>
        </div>

        <div style={customStyles.footerActions}>
          <button
            style={{
              ...customStyles.btn,
              ...customStyles.btnGhost,
              ...(isGhostHovered ? { color: '#EBEBF5' } : {}),
            }}
            onMouseEnter={() => setIsGhostHovered(true)}
            onMouseLeave={() => setIsGhostHovered(false)}
          >
            Cancel
          </button>
          <button
            style={fileUploaded && !uploading ? customStyles.btnPrimary : customStyles.btnPrimaryDisabled}
            disabled={!fileUploaded || uploading}
            onClick={async () => {
              if (!selectedFile) return;
              setUploading(true);
              setUploadError(null);
              try {
                const postureMap = {
                  'Balanced / Market Standard': 'balanced',
                  'Aggressive / Seller Favorable': 'aggressive',
                  'Conservative / Buyer Favorable': 'conservative',
                  'Neutral': 'balanced',
                };
                const doc = await uploadDocument(
                  selectedFile,
                  activeOption,
                  postureMap[posture] || 'balanced'
                );
                navigate(`/processing/${doc.id}`);
              } catch (err) {
                setUploadError(err.message);
                setUploading(false);
              }
            }}
          >
            {uploading ? 'Uploading...' : 'Begin Analysis'}
          </button>
          {uploadError && (
            <div style={{ color: '#FF453A', fontSize: '12px', marginTop: '8px' }}>{uploadError}</div>
          )}
        </div>
      </div>
    </main>
  );
};

export default IntakePage;
