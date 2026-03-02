import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Smartphone, Monitor, Settings, Plus, Library } from 'lucide-react'
import StartupScreen from './components/screens/StartupScreen'
import SettingsScreen from './components/screens/SettingsScreen'
import LibraryView from './components/screens/LibraryView'
import ShipDesignView from './components/screens/ShipDesignView'

export type LayoutMode = 'desktop' | 'phone'

function LayoutToggle({ mode, onChange }: { mode: LayoutMode; onChange: (mode: LayoutMode) => void }) {
  return (
    <button
      onClick={() => onChange(mode === 'desktop' ? 'phone' : 'desktop')}
      className="flex items-center gap-2 px-3 py-1.5 bg-space-700 rounded-lg hover:bg-space-600 transition-colors"
      title={`Switch to ${mode === 'desktop' ? 'Phone' : 'Desktop'} mode`}
    >
      {mode === 'desktop' ? (
        <><Smartphone size={18} /><span className="hidden sm:inline text-sm">Phone</span></>
      ) : (
        <><Monitor size={18} /><span className="hidden sm:inline text-sm">Desktop</span></>
      )}
    </button>
  )
}

function Header({ layoutMode, setLayoutMode }: { layoutMode: LayoutMode; setLayoutMode: (m: LayoutMode) => void }) {
  const location = useLocation()
  const isStartup = location.pathname === '/'
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isStandalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
  )

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  if (isStartup) return null

  return (
    <header className="h-14 bg-space-800 border-b border-space-700 flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="text-accent-cyan hover:text-cyan-300 transition-colors font-semibold text-lg"
        >
          CE ShipGen
        </Link>
        {isStandalone && (
          <span className="flex items-center gap-1 text-xs text-accent-green">
            <span className="w-2 h-2 rounded-full bg-accent-green" /> Installed
          </span>
        )}
        {!isOnline && (
          <span className="flex items-center gap-1 text-xs text-accent-orange">
            <span className="w-2 h-2 rounded-full bg-accent-orange" /> Offline
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <LayoutToggle mode={layoutMode} onChange={setLayoutMode} />

        <Link
          to="/design"
          className={`p-2 rounded-lg transition-colors ${location.pathname === '/design' ? 'bg-accent-cyan text-space-900' : 'hover:bg-space-700'}`}
          title="Design Ship"
        >
          <Plus size={20} />
        </Link>
        <Link
          to="/library"
          className={`p-2 rounded-lg transition-colors ${location.pathname === '/library' ? 'bg-accent-cyan text-space-900' : 'hover:bg-space-700'}`}
          title="Library"
        >
          <Library size={20} />
        </Link>
        <Link
          to="/settings"
          className={`p-2 rounded-lg transition-colors ${location.pathname === '/settings' ? 'bg-accent-cyan text-space-900' : 'hover:bg-space-700'}`}
          title="Settings"
        >
          <Settings size={20} />
        </Link>
      </div>
    </header>
  )
}

function App() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('desktop')
  const navigate = useNavigate()

  // Load saved layout preference
  useEffect(() => {
    const saved = localStorage.getItem('ce_shipgen_layout')
    if (saved === 'desktop' || saved === 'phone') {
      setLayoutMode(saved)
    }
  }, [])

  // Save layout preference
  useEffect(() => {
    localStorage.setItem('ce_shipgen_layout', layoutMode)
  }, [layoutMode])

  return (
    <div className="min-h-screen bg-space-900">
      <Header layoutMode={layoutMode} setLayoutMode={setLayoutMode} />

      <main className="h-[calc(100vh-3.5rem)]">
        <Routes>
          <Route
            path="/"
            element={
              <StartupScreen
                onGenerate={() => navigate('/design')}
                onLibrary={() => navigate('/library')}
                onSettings={() => navigate('/settings')}
              />
            }
          />
          <Route
            path="/design"
            element={<ShipDesignView layoutMode={layoutMode} />}
          />
          <Route
            path="/library"
            element={
              <LibraryView
                onBack={() => navigate('/')}
                onLoad={() => navigate('/design')}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsScreen
                layoutMode={layoutMode}
                onLayoutChange={setLayoutMode}
                onBack={() => navigate('/')}
              />
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
