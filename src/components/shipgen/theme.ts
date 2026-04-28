// Theme tokens — these mirror the CSS variables in styles/shipgen.css.
// Use `colors` for inline-style fallbacks (SVG fills, dynamic shadows).
// For most React UI, prefer Tailwind utilities (bg-sh-panel, text-sh-ink, etc).

export const colors = {
  bg:         'var(--sh-bg)',
  panel:      'var(--sh-panel)',
  panelAlt:   'var(--sh-panel-alt)',
  ink:        'var(--sh-ink)',
  inkSoft:    'var(--sh-ink-soft)',
  inkDim:     'var(--sh-ink-dim)',
  glow:       'var(--sh-glow)',
  glowSoft:   'var(--sh-glow-soft)',
  amber:      'var(--sh-amber)',
  warn:       'var(--sh-warn)',
  good:       'var(--sh-good)',
  hair:       'var(--sh-hair)',
  hairFaint:  'var(--sh-hair-faint)',
  hairBright: 'var(--sh-hair-bright)',
} as const;

export const fonts = {
  display: '"VT323", "JetBrains Mono", monospace',
  mono:    '"JetBrains Mono", "IBM Plex Mono", "Courier New", monospace',
} as const;

export type ThemeName = 'mainframe' | 'amber' | 'blueprint';
