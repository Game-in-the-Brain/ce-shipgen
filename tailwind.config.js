/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#061523',
        },
        sh: {
          bg:        'var(--sh-bg)',
          panel:     'var(--sh-panel)',
          panelAlt:  'var(--sh-panel-alt)',
          ink:       'var(--sh-ink)',
          inkSoft:   'var(--sh-ink-soft)',
          inkDim:    'var(--sh-ink-dim)',
          glow:      'var(--sh-glow)',
          glowSoft:  'var(--sh-glow-soft)',
          amber:     'var(--sh-amber)',
          warn:      'var(--sh-warn)',
          good:      'var(--sh-good)',
        },
      },
      borderColor: {
        hair:      'var(--sh-hair)',
        hairFaint: 'var(--sh-hair-faint)',
      },
      fontFamily: {
        shDisplay: ['VT323', 'JetBrains Mono', 'monospace'],
        shMono:    ['"JetBrains Mono"', '"IBM Plex Mono"', '"Courier New"', 'monospace'],
      },
      letterSpacing: {
        sh: '0.14em',
        shWide: '0.18em',
        shXwide: '0.32em',
      },
    },
  },
  plugins: [],
}
