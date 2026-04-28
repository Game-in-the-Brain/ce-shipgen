import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { colors, fonts } from './shipgen/theme';

interface Props {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
  actions?: ReactNode;
}

export function CollapsibleSection({ title, children, defaultOpen = false, badge, actions }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="tile mb-3">
      <div
        className="tile-header"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(!open); }}
        role="button"
        tabIndex={0}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {open
            ? <ChevronDown className="w-4 h-4" style={{ color: colors.inkDim }} />
            : <ChevronRight className="w-4 h-4" style={{ color: colors.inkDim }} />
          }
          <span style={{ fontFamily: fonts.mono, fontSize: 14, fontWeight: 600, color: colors.inkSoft, letterSpacing: '0.06em' }}>{title}</span>
          {badge !== undefined && (
            <span style={{
              fontFamily: fonts.mono, fontSize: 11,
              background: colors.panelAlt, color: colors.inkDim,
              padding: '2px 8px', border: `1px solid ${colors.hair}`,
            }}>{badge}</span>
          )}
        </div>
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>{actions}</div>}
      </div>
      {open && (
        <div className="tile-content">
          {children}
        </div>
      )}
    </div>
  );
}
