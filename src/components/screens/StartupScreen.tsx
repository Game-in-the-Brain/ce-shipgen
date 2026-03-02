import { useState, useEffect } from 'react'
import { Plus, Library, Settings, HelpCircle, Rocket, ExternalLink, Heart, Download } from 'lucide-react'

interface StartupScreenProps {
  onGenerate: () => void
  onLibrary: () => void
  onSettings: () => void
}

export default function StartupScreen({ onGenerate, onLibrary, onSettings }: StartupScreenProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
  )
  const [isIOS] = useState(/iphone|ipad|ipod/i.test(navigator.userAgent))
  const [showIOSHelp, setShowIOSHelp] = useState(false)

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-space-900 via-space-800 to-space-900 relative">
      {/* GI7B Logo - Upper Right */}
      <a
        href="https://gi7b.org"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-4 z-10"
      >
        <img
          src="/ce-shipgen/gi7b-logo.png"
          alt="Game in the Brain"
          className="h-16 w-auto opacity-80 hover:opacity-100 transition-opacity"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </a>

      {/* Logo Area */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-accent-cyan/10 rounded-2xl border-2 border-accent-cyan/30">
          <Rocket size={48} className="text-accent-cyan" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
          CE ShipGen
        </h1>
        <p className="text-gray-400 text-lg">
          Cepheus Engine Ship Generator
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Design starships with ease
        </p>
      </div>

      {/* Main Actions */}
      <div className="w-full max-w-md space-y-4">
        {/* Primary: Generate Ship */}
        <button
          onClick={onGenerate}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-accent-cyan hover:bg-cyan-400 text-space-900 font-bold text-lg rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent-cyan/20"
        >
          <Plus size={24} />
          Generate Ship
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onLibrary}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-space-800 hover:bg-space-700 text-gray-200 font-medium rounded-xl transition-colors border border-space-700 hover:border-space-600"
          >
            <Library size={20} />
            <span>Library</span>
          </button>

          <button
            onClick={onSettings}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-space-800 hover:bg-space-700 text-gray-200 font-medium rounded-xl transition-colors border border-space-700 hover:border-space-600"
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>

        {/* Help */}
        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 text-gray-500 hover:text-gray-300 transition-colors">
          <HelpCircle size={18} />
          <span className="text-sm">Help & About</span>
        </button>

        {/* PWA Install Prompt (Chrome/Edge) */}
        {!isStandalone && deferredPrompt && (
          <button
            onClick={() => void handleInstall()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-space-800 hover:bg-space-700 text-gray-200 font-medium rounded-xl transition-colors border border-space-700 hover:border-space-600 btn-secondary"
          >
            <Download size={18} />
            <span>Install App</span>
          </button>
        )}

        {/* iOS Add to Home Screen hint */}
        {!isStandalone && isIOS && !deferredPrompt && (
          <div className="text-center">
            <button
              onClick={() => setShowIOSHelp(v => !v)}
              className="text-sm text-accent-cyan hover:text-cyan-300 transition-colors"
            >
              Add to Home Screen
            </button>
          </div>
        )}

        {/* iOS Instructions */}
        {showIOSHelp && (
          <div className="p-4 bg-space-800 border border-space-700 rounded-xl text-sm text-gray-300 relative">
            <button
              onClick={() => setShowIOSHelp(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-300 text-lg leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
            In Safari: tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
          </div>
        )}
      </div>

      {/* Version */}
      <div className="mt-8 text-gray-600 text-sm">
        Version 0.2.5 (Milestone 2.5)
      </div>

      {/* Attribution & Links */}
      <div className="mt-8 max-w-lg text-center">
        <div className="p-4 bg-space-800/50 rounded-xl border border-space-700">
          <p className="text-sm text-gray-400 mb-3">
            Referring to{' '}
            <a
              href="https://www.drivethrurpg.com/en/product/186894/cepheus-engine-system-reference-document"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-cyan hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
            >
              Cepheus Engine <ExternalLink size={12} />
            </a>
          </p>

          <div className="border-t border-space-700 my-3"></div>

          <p className="text-sm text-gray-400 mb-2">
            This App is brought to you by{' '}
            <a
              href="https://www.drivethrurpg.com/en/publisher/17858/game-in-the-brain"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-purple hover:text-purple-300 inline-flex items-center gap-1 transition-colors"
            >
              Game in the Brain <ExternalLink size={12} />
            </a>
          </p>

          <p className="text-sm text-gray-500 leading-relaxed">
            Help support us making free apps to automate your games by patronizing our products and leaving a positive review and feedback! Check us out at{' '}
            <a
              href="https://gi7b.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-cyan hover:text-cyan-300 transition-colors"
            >
              gi7b.org
            </a>
            {' '}and our wiki at{' '}
            <a
              href="https://wiki.gi7b.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-cyan hover:text-cyan-300 transition-colors"
            >
              wiki.gi7b.org
            </a>
          </p>

          <div className="mt-3 flex items-center justify-center gap-1 text-sm text-accent-orange">
            <Heart size={14} className="fill-current" />
            <span>Support open gaming tools</span>
          </div>
        </div>
      </div>
    </div>
  )
}
