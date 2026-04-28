import { colors, fonts } from './theme';
import type { ShipSpec } from './data';
import type { ShipTotals } from './compute';

interface Props {
  ship:   ShipSpec;
  totals: ShipTotals;
  height?: number;
}

/** Top-down deck plan — capsule hull outline, allocated cells by type. */
export function DeckPlan({ ship, totals, height = 240 }: Props) {
  const W = 480, H = height;
  const dt = totals.hullDt || 100;
  const cells = Math.min(64, Math.max(8, Math.round(dt / 6)));
  const cols = Math.ceil(Math.sqrt(cells * 2.5));
  const rows = Math.ceil(cells / cols);
  const padX = 70, padY = 40;
  const cw = (W - padX * 2) / cols;
  const ch = (H - padY * 2) / rows;

  const blocks: Array<{ x: number; y: number; kind: string; color: string }> = [];
  let i = 0;
  const add = (kind: string, color: string, count: number) => {
    for (let c = 0; c < count && i < cols * rows; c++, i++) {
      blocks.push({ x: i % cols, y: Math.floor(i / cols), kind, color });
    }
  };
  const bridgeCells = ship.bridge ? Math.max(1, Math.round(cells * 0.07)) : 0;
  const drivesCells = (ship.mdrive ? 2 : 0) + (ship.jdrive ? 2 : 0) + (ship.power ? 2 : 0);
  const crewCells = Math.round(cells * 0.10);
  const cargoCells = Math.max(0, cells - bridgeCells - drivesCells - crewCells);
  add('bridge', colors.glow,     bridgeCells);
  add('drives', colors.amber,    drivesCells);
  add('crew',   colors.glowSoft, crewCells);
  add('cargo',  colors.inkDim,   cargoCells);

  const hullPath =
    `M ${padX-10} ${H/2} L ${padX+10} ${padY-10} L ${W-padX-10} ${padY-10} ` +
    `L ${W-padX+10} ${H/2} L ${W-padX-10} ${H-padY+10} L ${padX+10} ${H-padY+10} Z`;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <pattern id="shGrid" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M 12 0 L 0 0 0 12" fill="none" stroke={colors.hairFaint} strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="url(#shGrid)" />

      {/* hull */}
      <path d={hullPath} fill="none" stroke={colors.glow} strokeWidth="1.6"
            style={{ filter: `drop-shadow(0 0 4px ${colors.glow}88)` }} />
      <path d={hullPath} fill={`${colors.glow}08`} />

      {/* center axis */}
      <line x1={padX-10} y1={H/2} x2={W-padX+10} y2={H/2} stroke={colors.hair} strokeDasharray="4 4" />

      {/* dimension line */}
      <line x1={padX+10} y1={padY-22} x2={W-padX-10} y2={padY-22} stroke={colors.inkDim} strokeWidth="0.8" />
      <line x1={padX+10} y1={padY-26} x2={padX+10} y2={padY-18} stroke={colors.inkDim} strokeWidth="0.8" />
      <line x1={W-padX-10} y1={padY-26} x2={W-padX-10} y2={padY-18} stroke={colors.inkDim} strokeWidth="0.8" />
      <text x={W/2} y={padY-25} fill={colors.inkSoft} fontFamily={fonts.mono} fontSize="13"
            textAnchor="middle" letterSpacing="2">{dt} DT · L=AXIS</text>

      {/* deck cells */}
      {blocks.map((b, idx) => {
        const x = padX + 10 + b.x * cw;
        const y = padY + b.y * ch;
        return (
          <rect key={idx} x={x} y={y} width={cw - 2} height={ch - 2}
                fill={`${b.color}30`} stroke={b.color} strokeWidth="0.8"
                style={{ filter: `drop-shadow(0 0 2px ${b.color}66)` }} />
        );
      })}

      {/* fore/aft markers */}
      <text x={padX-22} y={H/2 + 5} fill={colors.glow} fontFamily={fonts.display} fontSize="20"
            letterSpacing="3" style={{ filter: `drop-shadow(0 0 3px ${colors.glow}aa)` }}>F</text>
      <text x={W-padX+12} y={H/2 + 5} fill={colors.glow} fontFamily={fonts.display} fontSize="20"
            letterSpacing="3" style={{ filter: `drop-shadow(0 0 3px ${colors.glow}aa)` }}>A</text>

      {/* legend */}
      <g fontFamily={fonts.mono} fontSize="12" letterSpacing="1.5">
        {([
          ['BRIDGE', colors.glow,     padX-10],
          ['DRIVES', colors.amber,    padX+80],
          ['CREW',   colors.glowSoft, padX+170],
          ['CARGO',  colors.inkDim,   padX+240],
        ] as const).map(([label, c, x], idx) => (
          <g key={idx}>
            <rect x={x} y={H - 18} width="12" height="10" fill={`${c}33`} stroke={c} />
            <text x={Number(x) + 18} y={H - 9} fill={c}>{label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
