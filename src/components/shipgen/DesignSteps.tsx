import * as React from 'react';
import { colors } from './theme';
import { ShLabel, ShNum, ShData, ShField } from './primitives';
import {
  HULLS, CONFIGS, ARMOR, MDRIVES, JDRIVES, POWER, BRIDGES, COMPUTERS,
  STARTER_LIBRARY, type ShipSpec,
} from './data';
import type { ComputedShip } from './compute';

interface Props {
  ship: ShipSpec;
  computed: ComputedShip;
  onChange: (patch: Partial<ShipSpec>) => void;
  onLoad?: (id: string) => void;
}

interface StepProps {
  num: number;
  title: string;
  kw?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Step({ num, title, kw, children, defaultOpen = true }: StepProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <section style={{ marginBottom: 14, background: colors.panel, border: `1px solid ${colors.hair}` }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px', background: 'transparent', border: 'none',
          cursor: 'pointer', borderBottom: open ? `1px solid ${colors.hair}` : 'none',
          textAlign: 'left',
        }}
      >
        <ShNum size={22} color={colors.glow}>{String(num).padStart(2, '0')}</ShNum>
        <div style={{ width: 1, height: 18, background: colors.hair }} />
        <ShLabel size={15} weight={600} style={{ color: colors.ink, letterSpacing: '0.16em', flex: 1 }}>
          {title}
        </ShLabel>
        {kw && <ShData size={12} dim>{kw}</ShData>}
        <ShData size={18} dim style={{ color: colors.glow }}>{open ? '−' : '+'}</ShData>
      </button>
      {open && <div style={{ padding: 18 }}>{children}</div>}
    </section>
  );
}

export function DesignSteps({ ship, computed, onChange, onLoad }: Props) {
  const t = computed.totals;

  const hullOpts = HULLS.map(h => ({ value: h.code, label: `${h.code} · ${h.dt} DT · ${h.cost} MCr` }));
  const cfgOpts  = CONFIGS.map(c => ({ value: c.id, label: `${c.label} (×${c.pct.toFixed(2)})` }));
  const armOpts  = ARMOR.map(a => ({ value: a.id, label: `${a.label} · P${a.protection}` }));
  const mdOpts   = MDRIVES.map(d => ({ value: d.code, label: `${d.code} · Thrust-${d.thrust} · ${d.dt} DT` }));
  const jdOpts   = JDRIVES.map(d => ({ value: d.code, label: `${d.code} · Jump-${d.jump} · ${d.dt} DT` }));
  const ppOpts   = POWER.map(p => ({ value: p.code, label: `${p.code} · ${p.dt} DT · ${p.cost} MCr` }));
  const brOpts   = BRIDGES.map(b => ({ value: b.id, label: `${b.label} · ${b.dt} DT` }));
  const cmOpts   = COMPUTERS.map(c => ({ value: c.id, label: `${c.label} · R${c.rating}` }));

  const libOpts = STARTER_LIBRARY.map(s => ({
    value: s.id, label: `${s.name.toUpperCase()}.SHP · ${HULLS.find(h => h.code === s.hull)!.dt} DT · TL${s.tl}`,
  }));

  return (
    <div>
      {onLoad && (
        <div style={{ marginBottom: 14 }}>
          <ShField label="Load From Library" value="" onChange={v => v && onLoad(v)} options={libOpts} />
        </div>
      )}

      <Step num={1} title="Basic Info" kw="ID">
        <div style={{ display: 'flex', gap: 14 }}>
          <ShField label="Ship Designation" value={ship.name} onChange={v => onChange({ name: v ?? '' })} />
          <ShField label="Tech Level" value={ship.tl} type="number" flex={0.4}
            onChange={v => onChange({ tl: Number(v) || 0 })} />
        </div>
      </Step>

      <Step num={2} title="Hull & Configuration" kw="HUL/CFG">
        <div style={{ display: 'flex', gap: 14 }}>
          <ShField
            label="Hull Size" value={ship.hull} options={hullOpts}
            onChange={v => onChange({ hull: v })}
            hint={t.hullDt ? `HP ${t.hp} · SP ${t.sp} · Hardpoints ${Math.floor(t.hullDt / 100)}` : 'Select hull to begin'}
          />
          <ShField
            label="Configuration" value={ship.config} options={cfgOpts}
            onChange={v => onChange({ config: v ?? 'standard' })}
          />
        </div>
      </Step>

      <Step num={3} title="Armor" kw="ARM">
        <ShField
          label="Armor Type" value={ship.armor} options={armOpts}
          onChange={v => onChange({ armor: v })}
          hint={
            computed.armor
              ? `Protection +${computed.armor.protection} · ${(t.hullDt * 0.05).toFixed(1)} DT`
              : 'Unarmored — open hull'
          }
        />
      </Step>

      <Step num={4} title="Drives & Power" kw="PRP/PWR">
        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <ShField
            label="M-Drive (Thrust)" value={ship.mdrive} options={mdOpts}
            onChange={v => onChange({ mdrive: v })}
            hint={t.thrust ? `${t.thrust}G THRUST` : 'no maneuver drive'}
          />
          <ShField
            label="J-Drive (Jump)" value={ship.jdrive} options={jdOpts}
            onChange={v => onChange({ jdrive: v })}
            hint={t.jump ? `JUMP-${t.jump} · ${(t.hullDt * 0.1 * t.jump).toFixed(1)} DT FUEL` : 'sublight only'}
          />
        </div>
        <ShField
          label="Power Plant" value={ship.power} options={ppOpts}
          onChange={v => onChange({ power: v })}
          hint={computed.pp ? `${computed.pp.dt} DT · ${computed.pp.cost} MCr` : '—'}
        />
      </Step>

      <Step num={5} title="Command & Control" kw="C&C">
        <div style={{ display: 'flex', gap: 14 }}>
          <ShField
            label="Bridge / Cockpit" value={ship.bridge} options={brOpts}
            onChange={v => onChange({ bridge: v ?? 'cockpit' })}
          />
          <ShField
            label="Computer" value={ship.computer} options={cmOpts}
            onChange={v => onChange({ computer: v ?? 'm1' })}
          />
        </div>
      </Step>

      <Step num={6} title="Crew · Cargo (auto)" kw="DERIVED" defaultOpen={false}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {([
            ['CREW',     t.crew],
            ['THRUST',   `${t.thrust}G`],
            ['JUMP',     t.jump],
            ['CARGO DT', t.cargo.toFixed(0)],
          ] as const).map(([l, v]) => (
            <div key={l} style={{ border: `1px solid ${colors.hair}`, padding: '12px 14px', background: colors.panelAlt }}>
              <ShLabel size={11} dim>{l}</ShLabel>
              <div style={{ marginTop: 4 }}><ShNum size={32}>{v}</ShNum></div>
            </div>
          ))}
        </div>
      </Step>
    </div>
  );
}
