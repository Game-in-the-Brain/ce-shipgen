import { Plus, Library, Settings, HelpCircle, Rocket, ExternalLink, Heart } from 'lucide-react'

interface StartupScreenProps {
  onGenerate: () => void
  onLibrary: () => void
  onSettings: () => void
}

export default function StartupScreen({ onGenerate, onLibrary, onSettings }: StartupScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-space-900 via-space-800 to-space-900">
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
      </div>

      {/* Version */}
      <div className="mt-8 text-gray-600 text-sm">
        Version 0.2.0 (Milestone 2)
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
