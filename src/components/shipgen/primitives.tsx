// Low-level UI primitives for the ShipGen UI.
// All take className / style overrides so consumers can tweak as needed.

import * as React from 'react';
import { colors, fonts } from './theme';

type Span = React.HTMLAttributes<HTMLSpanElement>;

interface LabelProps extends Span {
  size?: number;
  dim?: boolean;
  accent?: boolean;
  weight?: number;
}
export function ShLabel({
  size = 13, dim, accent, weight = 600, style, children, ...rest
}: LabelProps) {
  return (
    <span
      {...rest}
      style={{
        fontFamily: fonts.mono,
        fontSize: size,
        fontWeight: weight,
        color: dim ? colors.inkDim : accent ? colors.glow : colors.inkSoft,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

interface DataProps extends Span {
  size?: number;
  glow?: boolean;
  dim?: boolean;
  warn?: boolean;
  good?: boolean;
  amber?: boolean;
  weight?: number;
}
export function ShData({
  size = 18, glow, dim, warn, good, amber, weight = 400, style, children, ...rest
}: DataProps) {
  const c = warn ? colors.warn
          : good ? colors.good
          : amber ? colors.amber
          : dim   ? colors.inkDim
          : colors.ink;
  return (
    <span
      {...rest}
      style={{
        fontFamily: fonts.mono,
        fontSize: size,
        fontWeight: weight,
        color: c,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.02em',
        textShadow: glow ? `0 0 6px ${c}99, 0 0 14px ${c}44` : 'none',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

interface NumProps extends Span {
  size?: number;
  color?: string;
  glow?: boolean;
}
export function ShNum({
  size = 30, color, glow = true, style, children, ...rest
}: NumProps) {
  const c = color || colors.glow;
  return (
    <span
      {...rest}
      style={{
        fontFamily: fonts.display,
        fontSize: size,
        color: c,
        textShadow: glow ? `0 0 8px ${c}cc, 0 0 18px ${c}55` : 'none',
        letterSpacing: '0.04em',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

interface PanelProps {
  no?: string;
  title?: string;
  kw?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}
export function ShPanel({ no, title, kw, children, className, style, contentStyle }: PanelProps) {
  const ticks = [
    { top: -1, left: 10, w: 12, h: 1 }, { top: 10, left: -1, w: 1, h: 12 },
    { top: -1, right: 10, w: 12, h: 1 }, { top: 10, right: -1, w: 1, h: 12 },
    { bottom: -1, left: 10, w: 12, h: 1 }, { bottom: 10, left: -1, w: 1, h: 12 },
    { bottom: -1, right: 10, w: 12, h: 1 }, { bottom: 10, right: -1, w: 1, h: 12 },
  ] as const;
  return (
    <section
      className={className}
      style={{
        position: 'relative',
        background: colors.panel,
        border: `1px solid ${colors.hair}`,
        ...style,
      }}
    >
      {ticks.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', background: colors.glow, opacity: 0.6,
          width: p.w, height: p.h,
          top: 'top' in p ? p.top : undefined,
          bottom: 'bottom' in p ? p.bottom : undefined,
          left: 'left' in p ? p.left : undefined,
          right: 'right' in p ? p.right : undefined,
        }} />
      ))}
      {(no || title) && (
        <header style={{
          padding: '12px 18px',
          borderBottom: `1px solid ${colors.hair}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: colors.panelAlt,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {no && <ShData size={14} dim weight={500}>{no}</ShData>}
            {no && title && <div style={{ width: 1, height: 14, background: colors.hair }} />}
            {title && (
              <ShLabel size={14} weight={600} style={{ color: colors.glow, letterSpacing: '0.18em' }}>
                {title}
              </ShLabel>
            )}
          </div>
          {kw && <ShData size={12} dim>{kw}</ShData>}
        </header>
      )}
      <div style={{ padding: 18, ...contentStyle }}>{children}</div>
    </section>
  );
}

interface FieldProps {
  label: string;
  value: string | number | null;
  onChange: (value: string | null) => void;
  options?: Array<{ value: string; label: string }>;
  hint?: string;
  type?: string;
  flex?: number | string;
}
export function ShField({
  label, value, onChange, options, hint, type = 'text', flex = 1,
}: FieldProps) {
  return (
    <label style={{ display: 'block', flex }}>
      <div style={{ marginBottom: 8 }}>
        <ShLabel size={12} dim>{label}</ShLabel>
      </div>
      <div style={{
        position: 'relative',
        background: colors.panelAlt,
        border: `1px solid ${colors.hair}`,
        transition: 'border-color .15s',
      }}>
        {options ? (
          <>
            <select
              value={value ?? ''}
              onChange={e => onChange(e.target.value || null)}
              onFocus={e => (e.currentTarget.parentElement!.style.borderColor = colors.glow)}
              onBlur={e => (e.currentTarget.parentElement!.style.borderColor = colors.hair)}
              style={{
                width: '100%', padding: '12px 36px 12px 14px',
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: fonts.mono, fontSize: 16, color: colors.ink, fontWeight: 500,
                appearance: 'none', cursor: 'pointer', letterSpacing: '0.02em',
              }}
            >
              <option value="" style={{ background: colors.panel }}>—</option>
              {options.map(o => (
                <option key={o.value} value={o.value} style={{ background: colors.panel, color: colors.ink }}>
                  {o.label}
                </option>
              ))}
            </select>
            <div style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              color: colors.glow, fontSize: 13, pointerEvents: 'none',
              textShadow: `0 0 4px ${colors.glow}aa`,
            }}>▼</div>
          </>
        ) : (
          <input
            type={type}
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            onFocus={e => (e.currentTarget.parentElement!.style.borderColor = colors.glow)}
            onBlur={e => (e.currentTarget.parentElement!.style.borderColor = colors.hair)}
            style={{
              width: '100%', padding: '12px 14px',
              background: 'transparent', border: 'none', outline: 'none',
              fontFamily: fonts.mono, fontSize: 16, color: colors.ink, fontWeight: 500,
            }}
          />
        )}
      </div>
      {hint && (
        <div style={{ marginTop: 6 }}>
          <ShData size={12} dim>// {hint}</ShData>
        </div>
      )}
    </label>
  );
}
