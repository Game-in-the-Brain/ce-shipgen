import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useTableStore } from './store/tableStore';
import { SettingsProvider, useSettings } from './components/ThemeProvider';
import { SettingsPanel } from './components/SettingsPanel';
import { StartupScreen } from './components/StartupScreen';
import { TableManager } from './components/TableManager';
import { ShipDesigner } from './components/ShipDesigner';
import { ShipLibrary } from './components/ShipLibrary';
import { VariantGenerator } from './components/VariantGenerator';
import { colors, fonts } from './components/shipgen/theme';

function AppContent() {
  const loadTables = useTableStore((s) => s.loadTables);
  const loaded = useTableStore((s) => s.loaded);
  const { scanlines, layoutMode, toggleScanlines, toggleLayout } = useSettings();
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    if (!loaded) loadTables();
  }, [loaded, loadTables]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}version.json`)
      .then(r => r.json())
      .then((data: { version: string }) => setVersion(data.version))
      .catch(() => setVersion(''));
  }, []);

  const navBase: React.CSSProperties = {
    padding: '6px 14px',
    fontFamily: fonts.mono,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    border: `1px solid transparent`,
    transition: 'all 0.15s',
    textDecoration: 'none',
  };

  const navInactive: React.CSSProperties = {
    ...navBase,
    color: colors.inkDim,
    background: 'transparent',
  };

  const navActive: React.CSSProperties = {
    ...navBase,
    color: colors.bg,
    background: colors.glow,
    borderColor: colors.glow,
    boxShadow: `0 0 10px ${colors.glow}55`,
  };

  return (
    <div
      className={scanlines ? 'sh-scanlines' : undefined}
      style={{ position: 'relative', minHeight: '100vh', background: colors.bg, color: colors.ink, fontFamily: fonts.mono, overflow: 'hidden' }}
    >
      {/* faint grid backdrop */}
      <div className="sh-grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* HEADER */}
      <header style={{
        position: 'relative', zIndex: 20, height: 56, padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.hair}`, background: colors.panelAlt,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 32, height: 32, border: `1.5px solid ${colors.glow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 6px ${colors.glow}44, inset 0 0 6px ${colors.glow}22`,
          }}>
            <span style={{ fontFamily: fonts.display, fontSize: 18, color: colors.glow }}>◆</span>
          </div>
          <div>
            <div style={{ fontFamily: fonts.display, fontSize: 22, color: colors.glow, letterSpacing: '0.28em', lineHeight: 1 }}>
              CE · SHIPGEN
            </div>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.inkDim, letterSpacing: '0.12em', marginTop: 2 }}>
              MAINFRAME · {version ? `v${version}` : 'v0.02'} · {layoutMode === 'phone' ? 'PHONE MODE' : 'DESKTOP'}
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavLink to="/tables" style={({ isActive }) => isActive ? navActive : navInactive}>Tables</NavLink>
          <NavLink to="/design" style={({ isActive }) => isActive ? navActive : navInactive}>Design</NavLink>
          <NavLink to="/library" style={({ isActive }) => isActive ? navActive : navInactive}>Library</NavLink>
          <NavLink to="/variants" style={({ isActive }) => isActive ? navActive : navInactive}>Variants</NavLink>

          <div style={{ width: 1, height: 20, background: colors.hair, margin: '0 4px' }} />

          <button
            onClick={toggleScanlines}
            title="Toggle Scanlines"
            style={{
              padding: '6px 10px', fontFamily: fonts.mono, fontSize: 11,
              color: scanlines ? colors.glow : colors.inkDim,
              background: scanlines ? `${colors.glow}15` : 'transparent',
              border: `1px solid ${scanlines ? colors.glow : colors.hair}`,
              cursor: 'pointer', letterSpacing: '0.08em',
            }}
          >
            {scanlines ? 'SCAN ON' : 'SCAN OFF'}
          </button>
          <button
            onClick={toggleLayout}
            title="Toggle Layout"
            style={{
              padding: '6px 10px', fontFamily: fonts.mono, fontSize: 11,
              color: colors.inkSoft, background: 'transparent',
              border: `1px solid ${colors.hair}`, cursor: 'pointer', letterSpacing: '0.08em',
            }}
          >
            {layoutMode === 'desktop' ? 'DESK' : 'PHONE'}
          </button>
          <SettingsPanel />
        </nav>
      </header>

      {/* MAIN */}
      <main style={{
        position: 'relative', zIndex: 10,
        maxWidth: layoutMode === 'phone' ? 480 : 1400,
        margin: '0 auto',
        padding: layoutMode === 'phone' ? '12px 12px 40px' : '20px 28px 60px',
      }}>
        <Routes>
          <Route path="/" element={<Navigate to="/design" replace />} />
          <Route path="/tables" element={<TableManager />} />
          <Route path="/design" element={<ShipDesigner />} />
          <Route path="/library" element={<ShipLibrary />} />
          <Route path="/variants" element={<VariantGenerator />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [showStartup, setShowStartup] = useState(false);

  useEffect(() => {
    const seenVersion = localStorage.getItem('ce_shipgen_seen_version');
    fetch(`${import.meta.env.BASE_URL}version.json`)
      .then(r => r.json())
      .then((data: { version: string }) => {
        if (!seenVersion || seenVersion !== data.version) {
          setShowStartup(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SettingsProvider>
      {showStartup && <StartupScreen onDismiss={() => setShowStartup(false)} />}
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
