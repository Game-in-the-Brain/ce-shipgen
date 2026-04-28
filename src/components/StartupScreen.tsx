import { useState, useEffect } from 'react';
import { colors, fonts } from './shipgen/theme';

interface VersionInfo {
  version: string;
  name: string;
  date: string;
  changelog: string[];
}

interface StartupScreenProps {
  onDismiss: () => void;
}

const SEEN_VERSION_KEY = 'ce_shipgen_seen_version';

export function StartupScreen({ onDismiss }: StartupScreenProps) {
  const [version, setVersion] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}version.json`)
      .then(r => r.json())
      .then((data: VersionInfo) => {
        setVersion(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleDismiss = () => {
    if (dontShow && version) {
      localStorage.setItem(SEEN_VERSION_KEY, version.version);
    }
    onDismiss();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: colors.bg }}>
        <div style={{
          width: 40, height: 40,
          border: `2px solid ${colors.hair}`,
          borderTopColor: colors.glow,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!version) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: `${colors.bg}ee`, backdropFilter: 'blur(4px)' }}>
      <div style={{
        background: colors.panel,
        border: `1px solid ${colors.hair}`,
        maxWidth: 520,
        width: '100%',
        position: 'relative',
      }}>
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

        {/* Header */}
        <div style={{ padding: '24px 24px 18px', borderBottom: `1px solid ${colors.hair}`, background: colors.panelAlt }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 44, height: 44, border: `1.5px solid ${colors.glow}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 10px ${colors.glow}55, inset 0 0 10px ${colors.glow}22`,
            }}>
              <span style={{ fontFamily: fonts.display, fontSize: 24, color: colors.glow }}>◆</span>
            </div>
            <div>
              <div style={{ fontFamily: fonts.display, fontSize: 28, color: colors.ink, letterSpacing: '0.24em', lineHeight: 1 }}>
                {version.name}
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.glow, letterSpacing: '0.12em', marginTop: 4 }}>
                VERSION {version.version} · {version.date}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 12, fontWeight: 600, color: colors.inkSoft, letterSpacing: '0.14em', marginBottom: 10 }}>
              CHANGELOG
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
              {version.changelog.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontFamily: fonts.mono, fontSize: 13, color: colors.inkSoft }}>
                  <span style={{ color: colors.glow, fontSize: 16, lineHeight: 1 }}>›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: fonts.mono, fontSize: 12, color: colors.inkDim }}>
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              style={{ accentColor: colors.glow }}
            />
            Don't show again until next update
          </label>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${colors.hair}`, display: 'flex', justifyContent: 'flex-end', background: colors.panelAlt }}>
          <button
            onClick={handleDismiss}
            style={{
              padding: '10px 28px',
              fontFamily: fonts.mono,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.12em',
              background: colors.glow,
              color: colors.bg,
              border: `1px solid ${colors.glow}`,
              cursor: 'pointer',
              boxShadow: `0 0 12px ${colors.glow}55`,
            }}
          >
            INITIALIZE
          </button>
        </div>
      </div>
    </div>
  );
}

export function shouldShowStartup(): boolean {
  try {
    localStorage.getItem(SEEN_VERSION_KEY);
    return true;
  } catch {
    return true;
  }
}
