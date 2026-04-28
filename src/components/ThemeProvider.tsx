import { createContext, useContext, useEffect, useState } from 'react';

type LayoutMode = 'desktop' | 'phone';

interface Settings {
  scanlines: boolean;
  layoutMode: LayoutMode;
}

interface SettingsContextType {
  scanlines: boolean;
  layoutMode: LayoutMode;
  setScanlines: (v: boolean) => void;
  setLayoutMode: (m: LayoutMode) => void;
  toggleScanlines: () => void;
  toggleLayout: () => void;
}

const SETTINGS_KEY = 'ce_shipgen_settings';

const defaultSettings: Settings = {
  scanlines: true,
  layoutMode: 'desktop',
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultSettings;
}

function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const value: SettingsContextType = {
    scanlines: settings.scanlines,
    layoutMode: settings.layoutMode,
    setScanlines: (scanlines) => setSettings(s => ({ ...s, scanlines })),
    setLayoutMode: (layoutMode) => setSettings(s => ({ ...s, layoutMode })),
    toggleScanlines: () => setSettings(s => ({ ...s, scanlines: !s.scanlines })),
    toggleLayout: () => setSettings(s => ({ ...s, layoutMode: s.layoutMode === 'desktop' ? 'phone' : 'desktop' })),
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
