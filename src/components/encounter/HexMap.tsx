import { useRef, useEffect, useCallback, useState } from 'react';
import type { EncounterShip } from '../../types/encounter';
import { colors, fonts } from '../shipgen/theme';

// ─── Hex Geometry ───

const SQRT3 = Math.sqrt(3);

interface Axial {
  q: number;
  r: number;
}

function hexToPixel(hex: Axial, size: number): { x: number; y: number } {
  const x = size * (SQRT3 * hex.q + SQRT3 / 2 * hex.r);
  const y = size * (1.5 * hex.r);
  return { x, y };
}

function pixelToHex(x: number, y: number, size: number): Axial {
  const q = (SQRT3 / 3 * x - 1 / 3 * y) / size;
  const r = (2 / 3 * y) / size;
  return { q, r };
}

function hexRound(hex: Axial): Axial {
  const s = -hex.q - hex.r;
  let rq = Math.round(hex.q);
  let rr = Math.round(hex.r);
  let rs = Math.round(s);

  const dq = Math.abs(rq - hex.q);
  const dr = Math.abs(rr - hex.r);
  const ds = Math.abs(rs - s);

  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;

  return { q: rq, r: rr };
}

function hexCorners(center: { x: number; y: number }, size: number): { x: number; y: number }[] {
  const corners: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    corners.push({
      x: center.x + size * Math.cos(angle),
      y: center.y + size * Math.sin(angle),
    });
  }
  return corners;
}

// ─── Starfield ───

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

function generateStars(
  count: number,
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
      y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
      radius: 0.5 + Math.random() * 2.5,
      opacity: 0.3 + Math.random() * 0.7,
      twinkleSpeed: 0.5 + Math.random() * 2,
      twinklePhase: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}

// ─── View State ───

interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

// ─── Component Props ───

interface HexMapProps {
  ships: EncounterShip[];
  selectedShipId?: string;
  onHexClick?: (hex: { x: number; y: number }) => void;
  onShipClick?: (ship: EncounterShip) => void;
  width?: number;
  height?: number;
  hexSize?: number;
  gridRadius?: number;
  showControls?: boolean;
}

export default function HexMap({
  ships,
  selectedShipId,
  onHexClick,
  onShipClick,
  width = 800,
  height = 600,
  hexSize = 24,
  gridRadius = 12,
  showControls = true,
}: HexMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<ViewState>({ scale: 1, offsetX: width / 2, offsetY: height / 2 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  // UI options state
  const [showGrid, setShowGrid] = useState(true);
  const [showStars, setShowStars] = useState(true);
  const [starDensity, setStarDensity] = useState(200);
  const [showLabels, setShowLabels] = useState(false);
  const [showRangeBands, setShowRangeBands] = useState(true);

  // Generate stars once
  const starsRef = useRef<Star[]>([]);
  if (starsRef.current.length === 0) {
    const bounds = {
      minX: -gridRadius * hexSize * SQRT3 * 2,
      maxX: gridRadius * hexSize * SQRT3 * 2,
      minY: -gridRadius * hexSize * 2 * 2,
      maxY: gridRadius * hexSize * 2 * 2,
    };
    starsRef.current = generateStars(starDensity, bounds);
  }

  // Regenerate stars when density changes
  useEffect(() => {
    const bounds = {
      minX: -gridRadius * hexSize * SQRT3 * 2,
      maxX: gridRadius * hexSize * SQRT3 * 2,
      minY: -gridRadius * hexSize * 2 * 2,
      maxY: gridRadius * hexSize * 2 * 2,
    };
    starsRef.current = generateStars(starDensity, bounds);
  }, [starDensity, gridRadius, hexSize]);

  // ─── Rendering ───

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const view = viewRef.current;
    const dpr = window.devicePixelRatio || 1;
    const w = width;
    const h = height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const t = timeRef.current;

    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(view.offsetX, view.offsetY);
    ctx.scale(view.scale, view.scale);

    // Stars
    if (showStars) {
      for (const star of starsRef.current) {
        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinklePhase);
        const alpha = star.opacity * (0.7 + 0.3 * twinkle);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius / view.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`;
        ctx.fill();

        // Glow for bright stars
        if (star.radius > 1.5 && alpha > 0.6) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, (star.radius * 3) / view.scale, 0, Math.PI * 2);
          const g = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, (star.radius * 3) / view.scale);
          g.addColorStop(0, `rgba(200, 210, 255, ${alpha * 0.3})`);
          g.addColorStop(1, 'rgba(200, 210, 255, 0)');
          ctx.fillStyle = g;
          ctx.fill();
        }
      }
    }

    // Hex grid
    if (showGrid) {
      ctx.lineWidth = 0.5 / view.scale;
      ctx.strokeStyle = 'rgba(100, 140, 180, 0.15)';

      for (let q = -gridRadius; q <= gridRadius; q++) {
        for (let r = -gridRadius; r <= gridRadius; r++) {
          if (Math.abs(q + r) > gridRadius) continue;
          const center = hexToPixel({ q, r }, hexSize);
          const corners = hexCorners(center, hexSize);

          ctx.beginPath();
          ctx.moveTo(corners[0].x, corners[0].y);
          for (let i = 1; i < 6; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    }

    // Range band circles (concentric, centered on origin)
    if (showRangeBands) {
      const ranges = [
        { r: hexSize * 1, label: 'AD', color: 'rgba(255, 100, 100, 0.12)' },
        { r: hexSize * 3, label: 'CL', color: 'rgba(255, 180, 80, 0.10)' },
        { r: hexSize * 6, label: 'SH', color: 'rgba(255, 255, 100, 0.08)' },
        { r: hexSize * 10, label: 'M', color: 'rgba(100, 255, 100, 0.06)' },
        { r: hexSize * 15, label: 'L', color: 'rgba(100, 200, 255, 0.05)' },
      ];

      for (const range of ranges) {
        ctx.beginPath();
        ctx.arc(0, 0, range.r, 0, Math.PI * 2);
        ctx.fillStyle = range.color;
        ctx.fill();
        ctx.strokeStyle = range.color.replace(/[\d.]+\)$/, '0.2)');
        ctx.lineWidth = 0.5 / view.scale;
        ctx.stroke();

        if (showLabels && view.scale > 0.6) {
          ctx.fillStyle = 'rgba(150, 170, 200, 0.4)';
          ctx.font = `${10 / view.scale}px ${fonts.mono}`;
          ctx.textAlign = 'center';
          ctx.fillText(range.label, 0, -range.r + 14 / view.scale);
        }
      }
    }

    // Coordinate labels
    if (showLabels && view.scale > 0.5) {
      ctx.fillStyle = 'rgba(100, 140, 180, 0.25)';
      ctx.font = `${8 / view.scale}px ${fonts.mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let q = -gridRadius; q <= gridRadius; q++) {
        for (let r = -gridRadius; r <= gridRadius; r++) {
          if (Math.abs(q + r) > gridRadius) continue;
          const center = hexToPixel({ q, r }, hexSize);
          ctx.fillText(`${q},${r}`, center.x, center.y);
        }
      }
    }

    // Ship tokens
    for (const ship of ships) {
      if (ship.status === 'destroyed' || ship.status === 'fled') continue;

      const pos = hexToPixel({ q: ship.position.x, r: ship.position.y }, hexSize);
      const isSelected = ship.id === selectedShipId;
      const isPlayer = ship.side === 'player';
      const isAlly = ship.side === 'ally';

      // Selection ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, (hexSize * 0.75), 0, Math.PI * 2);
        ctx.strokeStyle = colors.glow;
        ctx.lineWidth = 2 / view.scale;
        ctx.stroke();

        // Pulsing glow
        const pulse = 0.5 + 0.5 * Math.sin(t * 3);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, (hexSize * 0.9) + pulse * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 200, 255, ${0.3 * pulse})`;
        ctx.lineWidth = 1 / view.scale;
        ctx.stroke();
      }

      // Token body
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, hexSize * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = isPlayer
        ? 'rgba(60, 180, 120, 0.85)'
        : isAlly
        ? 'rgba(80, 160, 220, 0.85)'
        : 'rgba(220, 80, 80, 0.85)';
      ctx.fill();

      // Border
      ctx.strokeStyle = isSelected ? colors.glow : 'rgba(255,255,255,0.4)';
      ctx.lineWidth = (isSelected ? 2 : 1) / view.scale;
      ctx.stroke();

      // Heading indicator
      const headRad = (ship.heading - 90) * (Math.PI / 180);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(
        pos.x + Math.cos(headRad) * hexSize * 0.6,
        pos.y + Math.sin(headRad) * hexSize * 0.6
      );
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1.5 / view.scale;
      ctx.stroke();

      // Ship name (if zoomed in enough)
      if (view.scale > 0.8) {
        ctx.fillStyle = 'rgba(220, 230, 255, 0.9)';
        ctx.font = `${10 / view.scale}px ${fonts.mono}`;
        ctx.textAlign = 'center';
        ctx.fillText(ship.name.slice(0, 12), pos.x, pos.y + hexSize * 0.9);
      }

      // Hull bar
      if (view.scale > 0.6) {
        const barW = hexSize * 1.2;
        const barH = 3 / view.scale;
        const barY = pos.y - hexSize * 0.7;
        const hullPct = ship.currentHull / Math.max(1, ship.hullPoints);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(pos.x - barW / 2, barY, barW, barH);

        ctx.fillStyle = hullPct > 0.5 ? colors.good : hullPct > 0.25 ? colors.amber : colors.warn;
        ctx.fillRect(pos.x - barW / 2, barY, barW * hullPct, barH);
      }
    }

    ctx.restore();

    // Overlay info
    ctx.fillStyle = 'rgba(10, 10, 15, 0.7)';
    ctx.fillRect(8, 8, 180, 55);
    ctx.strokeStyle = 'rgba(100, 140, 180, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, 180, 55);

    ctx.fillStyle = colors.inkSoft;
    ctx.font = `11px ${fonts.mono}`;
    ctx.textAlign = 'left';
    ctx.fillText(`ZOOM: ${(view.scale * 100).toFixed(0)}%`, 14, 24);
    ctx.fillText(`PAN: ${Math.round(view.offsetX)}, ${Math.round(view.offsetY)}`, 14, 40);
    ctx.fillText(`SHIPS: ${ships.filter(s => s.status === 'active').length}`, 14, 56);
  }, [ships, selectedShipId, width, height, hexSize, gridRadius, showGrid, showStars, showLabels, showRangeBands]);

  // ─── Animation Loop ───

  useEffect(() => {
    let running = true;
    const loop = (ts: number) => {
      if (!running) return;
      timeRef.current = ts / 1000;
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  // ─── Mouse / Touch Events ───

  const screenToWorld = useCallback((sx: number, sy: number) => {
    const v = viewRef.current;
    return {
      x: (sx - v.offsetX) / v.scale,
      y: (sy - v.offsetY) / v.scale,
    };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldBefore = screenToWorld(mouseX, mouseY);
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.2, Math.min(5, viewRef.current.scale * zoomFactor));

    viewRef.current.scale = newScale;
    viewRef.current.offsetX = mouseX - worldBefore.x * newScale;
    viewRef.current.offsetY = mouseY - worldBefore.y * newScale;
  }, [screenToWorld]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    viewRef.current.offsetX += dx;
    viewRef.current.offsetY += dy;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const world = screenToWorld(x, y);
    const hex = hexRound(pixelToHex(world.x, world.y, hexSize));

    // Check if clicked on a ship
    for (const ship of ships) {
      if (ship.status === 'destroyed' || ship.status === 'fled') continue;
      const sp = hexToPixel({ q: ship.position.x, r: ship.position.y }, hexSize);
      const dist = Math.hypot(sp.x - world.x, sp.y - world.y);
      if (dist < hexSize * 0.6) {
        onShipClick?.(ship);
        return;
      }
    }

    onHexClick?.({ x: hex.q, y: hex.r });
  }, [ships, hexSize, onHexClick, onShipClick, screenToWorld]);

  // ─── Control Actions ───

  const zoomIn = () => {
    viewRef.current.scale = Math.min(5, viewRef.current.scale * 1.3);
  };

  const zoomOut = () => {
    viewRef.current.scale = Math.max(0.2, viewRef.current.scale / 1.3);
  };

  const resetView = () => {
    viewRef.current = { scale: 1, offsetX: width / 2, offsetY: height / 2 };
  };

  const centerOnShip = (ship: EncounterShip) => {
    const pos = hexToPixel({ q: ship.position.x, r: ship.position.y }, hexSize);
    viewRef.current.offsetX = width / 2 - pos.x * viewRef.current.scale;
    viewRef.current.offsetY = height / 2 - pos.y * viewRef.current.scale;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width,
        height,
        border: `1px solid ${colors.hair}`,
        background: '#0a0a0f',
        overflow: 'hidden',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        style={{ display: 'block', width, height }}
      />

      {/* Controls overlay */}
      {showControls && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: 10,
            background: 'rgba(10, 10, 15, 0.85)',
            border: `1px solid ${colors.hair}`,
            backdropFilter: 'blur(4px)',
            fontFamily: fonts.mono,
            fontSize: 11,
            color: colors.inkSoft,
            zIndex: 10,
            maxHeight: height - 20,
            overflowY: 'auto',
          }}
        >
          <div style={{ fontWeight: 600, color: colors.glow, letterSpacing: '0.1em', marginBottom: 4 }}>
            MAP CTL
          </div>

          {/* Zoom buttons */}
          <div style={{ display: 'flex', gap: 4 }}>
            <ControlBtn onClick={zoomIn} title="Zoom In">+</ControlBtn>
            <ControlBtn onClick={zoomOut} title="Zoom Out">−</ControlBtn>
            <ControlBtn onClick={resetView} title="Reset View">⌖</ControlBtn>
          </div>

          {/* Toggles */}
          <ToggleRow label="Grid" value={showGrid} onChange={setShowGrid} />
          <ToggleRow label="Stars" value={showStars} onChange={setShowStars} />
          <ToggleRow label="Labels" value={showLabels} onChange={setShowLabels} />
          <ToggleRow label="Ranges" value={showRangeBands} onChange={setShowRangeBands} />

          {/* Star density */}
          {showStars && (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 9, color: colors.inkDim, marginBottom: 2 }}>STAR DENSITY</div>
              <input
                type="range"
                min={50}
                max={800}
                step={50}
                value={starDensity}
                onChange={(e) => setStarDensity(Number(e.target.value))}
                style={{ width: 100, accentColor: colors.glow }}
              />
              <div style={{ fontSize: 9, color: colors.inkDim, textAlign: 'right' }}>{starDensity}</div>
            </div>
          )}

          {/* Ship list */}
          {ships.length > 0 && (
            <div style={{ marginTop: 6, borderTop: `1px solid ${colors.hair}`, paddingTop: 6 }}>
              <div style={{ fontSize: 9, color: colors.inkDim, marginBottom: 4 }}>SHIPS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {ships.map((ship) => (
                  <button
                    key={ship.id}
                    onClick={() => centerOnShip(ship)}
                    title={`Center on ${ship.name}`}
                    style={{
                      padding: '3px 6px',
                      fontFamily: fonts.mono,
                      fontSize: 10,
                      background: ship.side === 'player' ? 'rgba(60, 180, 120, 0.2)' : ship.side === 'ally' ? 'rgba(80, 160, 220, 0.2)' : 'rgba(220, 80, 80, 0.2)',
                      color: colors.ink,
                      border: `1px solid ${ship.id === selectedShipId ? colors.glow : colors.hair}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {ship.name.slice(0, 14)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───

function ControlBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: '4px 10px',
        fontFamily: fonts.mono,
        fontSize: 14,
        fontWeight: 600,
        background: 'rgba(30, 40, 60, 0.8)',
        color: colors.inkSoft,
        border: `1px solid ${colors.hair}`,
        cursor: 'pointer',
        lineHeight: 1,
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLButtonElement).style.borderColor = colors.glow;
        (e.target as HTMLButtonElement).style.color = colors.glow;
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.borderColor = colors.hair;
        (e.target as HTMLButtonElement).style.color = colors.inkSoft;
      }}
    >
      {children}
    </button>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        cursor: 'pointer',
        fontSize: 10,
      }}
    >
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: colors.glow, cursor: 'pointer' }}
      />
    </label>
  );
}
