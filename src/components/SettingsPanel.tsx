import { useState } from 'react';
import { useSettings } from './ThemeProvider';
import { Settings, Monitor, Smartphone, X } from 'lucide-react';
import { colors, fonts } from './shipgen/theme';

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const { scanlines, layoutMode, setScanlines, setLayoutMode } = useSettings();

  const btnBase: React.CSSProperties = {
    padding: '8px 12px',
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: '0.06em',
    border: `1px solid ${colors.hair}`,
    background: 'transparent',
    color: colors.inkDim,
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const btnActive: React.CSSProperties = {
    ...btnBase,
    borderColor: colors.glow,
    color: colors.glow,
    background: `${colors.glow}15`,
    boxShadow: `0 0 8px ${colors.glow}33`,
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Settings"
        style={{
          padding: '6px 10px', fontFamily: fonts.mono, fontSize: 11,
          color: colors.inkDim, background: 'transparent',
          border: `1px solid ${colors.hair}`, cursor: 'pointer', letterSpacing: '0.08em',
        }}
      >
        <Settings className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ background: 'rgba(6,16,12,0.85)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.panel,
              border: `1px solid ${colors.hair}`,
              maxWidth: 420,
              width: '100%',
              position: 'relative',
            }}
          >
            {/* corner ticks */}
            {[
              { top: -1, left: 10 }, { top: 10, left: -1 },
              { top: -1, right: 10 }, { top: 10, right: -1 },
              { bottom: -1, left: 10 }, { bottom: 10, left: -1 },
              { bottom: -1, right: 10 }, { bottom: 10, right: -1 },
            ].map((p, i) => (
              <div key={i} style={{
                position: 'absolute', background: colors.glow, opacity: 0.6,
                width: 'left' in p || 'right' in p ? (i % 2 === 0 ? 12 : 1) : (i % 2 === 0 ? 1 : 12),
                height: 'top' in p || 'bottom' in p ? (i % 2 === 0 ? 1 : 12) : (i % 2 === 0 ? 12 : 1),
                top: 'top' in p ? p.top : undefined,
                bottom: 'bottom' in p ? p.bottom : undefined,
                left: 'left' in p ? p.left : undefined,
                right: 'right' in p ? p.right : undefined,
              }} />
            ))}

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: `1px solid ${colors.hair}`, background: colors.panelAlt,
            }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 14, fontWeight: 600, color: colors.glow, letterSpacing: '0.18em' }}>
                SETTINGS
              </span>
              <button onClick={() => setOpen(false)} style={{ padding: 4, background: 'transparent', border: 'none', color: colors.inkDim, cursor: 'pointer' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Scanlines */}
              <div>
                <div style={{ fontFamily: fonts.mono, fontSize: 12, fontWeight: 600, color: colors.inkSoft, letterSpacing: '0.14em', marginBottom: 10 }}>
                  DISPLAY
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setScanlines(true)}
                    style={scanlines ? btnActive : btnBase}
                  >
                    SCANLINES ON
                  </button>
                  <button
                    onClick={() => setScanlines(false)}
                    style={!scanlines ? btnActive : btnBase}
                  >
                    SCANLINES OFF
                  </button>
                </div>
              </div>

              {/* Layout */}
              <div>
                <div style={{ fontFamily: fonts.mono, fontSize: 12, fontWeight: 600, color: colors.inkSoft, letterSpacing: '0.14em', marginBottom: 10 }}>
                  LAYOUT
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setLayoutMode('desktop')}
                    style={layoutMode === 'desktop' ? btnActive : btnBase}
                  >
                    <Monitor className="w-4 h-4" /> DESKTOP
                  </button>
                  <button
                    onClick={() => setLayoutMode('phone')}
                    style={layoutMode === 'phone' ? btnActive : btnBase}
                  >
                    <Smartphone className="w-4 h-4" /> PHONE
                  </button>
                </div>
              </div>

              {/* Data Management */}
              <div style={{ paddingTop: 14, borderTop: `1px solid ${colors.hair}` }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 12, fontWeight: 600, color: colors.inkSoft, letterSpacing: '0.14em', marginBottom: 10 }}>
                  DATA
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={() => {
                      if (confirm('Clear all saved ships? This cannot be undone.')) {
                        localStorage.removeItem('ce-shipgen-tables');
                        window.location.reload();
                      }
                    }}
                    style={{ ...btnBase, color: colors.warn, borderColor: `${colors.warn}44`, justifyContent: 'flex-start' }}
                  >
                    Clear All Saved Ships
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Reset all tables to defaults? Custom edits will be lost.')) {
                        const store = JSON.parse(localStorage.getItem('ce-shipgen-tables') || '{}');
                        store.state = { ...store.state, tables: store.state?.defaults || {} };
                        localStorage.setItem('ce-shipgen-tables', JSON.stringify(store));
                        window.location.reload();
                      }
                    }}
                    style={{ ...btnBase, color: colors.amber, borderColor: `${colors.amber}44`, justifyContent: 'flex-start' }}
                  >
                    Reset Tables to Defaults
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
