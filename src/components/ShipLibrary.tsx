import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTableStore } from '../store/tableStore';
import { downloadJson, generateSnapshotName, importJsonFile } from '../utils/exportImport';
import { classifyShip } from '../utils/shipClassifier';
import { auditShip, correctShip, type AuditReport } from '../utils/shipAuditor';
import { ShipDetailModal } from './ShipDetailModal';
import { Download, Trash2, Edit3, FileJson, Eye, Upload, AlertCircle, Search, Filter, X, ShieldAlert, Check } from 'lucide-react';
import type { ShipDesign } from '../types';

export function ShipLibrary() {
  const navigate = useNavigate();
  const ships = useTableStore((s) => s.ships);
  const deleteShip = useTableStore((s) => s.deleteShip);
  const addShip = useTableStore((s) => s.addShip);
  const updateShip = useTableStore((s) => s.updateShip);
  const setCurrentShip = useTableStore((s) => s.setCurrentShip);
  const [detailShip, setDetailShip] = useState<ShipDesign | null>(null);
  const [auditShipDetail, setAuditShipDetail] = useState<AuditReport | null>(null);
  const [batchAuditOpen, setBatchAuditOpen] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<{ updated: number; message: string } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Filter State ───
  const [searchQuery, setSearchQuery] = useState('');
  const [tlFilter, setTlFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [sizeClassFilter, setSizeClassFilter] = useState<string>('');
  const [minDtons, setMinDtons] = useState<string>('');
  const [maxDtons, setMaxDtons] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // ─── Get reference tables for auditing ───
  const tables = useTableStore((s) => s.tables);

  // ─── Compute classifications for all ships ───
  const classifiedShips = useMemo(() => {
    return ships.map(ship => {
      let s = ship;
      if (!s.classification) {
        s = { ...s, classification: classifyShip(s) };
      }
      return s;
    });
  }, [ships]);

  // ─── Audit reports for all ships ───
  const auditReports = useMemo(() => {
    const reports = new Map<string, AuditReport>();
    for (const ship of classifiedShips) {
      reports.set(ship.id, auditShip(ship, tables));
    }
    return reports;
  }, [classifiedShips, tables]);

  const shipsWithViolations = useMemo(() => {
    return classifiedShips.filter(s => {
      const r = auditReports.get(s.id);
      return r && r.hasViolations;
    }).length;
  }, [classifiedShips, auditReports]);

  // ─── Derive filter options from data ───
  const { uniqueTls, uniqueRoles, uniqueSizeClasses } = useMemo(() => {
    const tls = new Set<number>();
    const roles = new Set<string>();
    const sizes = new Set<string>();
    classifiedShips.forEach(s => {
      tls.add(s.tl);
      if (s.classification) {
        roles.add(s.classification.role);
        sizes.add(s.classification.sizeClass);
      }
    });
    return {
      uniqueTls: Array.from(tls).sort((a, b) => a - b),
      uniqueRoles: Array.from(roles).sort(),
      uniqueSizeClasses: Array.from(sizes).sort(),
    };
  }, [classifiedShips]);

  // ─── Apply filters ───
  const filteredShips = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const min = minDtons ? Number(minDtons) : 0;
    const max = maxDtons ? Number(maxDtons) : Infinity;
    return classifiedShips.filter(ship => {
      if (q && !ship.name.toLowerCase().includes(q)) return false;
      if (tlFilter && String(ship.tl) !== tlFilter) return false;
      if (roleFilter && ship.classification?.role !== roleFilter) return false;
      if (sizeClassFilter && ship.classification?.sizeClass !== sizeClassFilter) return false;
      if (ship.hullDtons < min || ship.hullDtons > max) return false;
      if (tagFilter && !(ship.tags || []).includes(tagFilter)) return false;
      return true;
    });
  }, [classifiedShips, searchQuery, tlFilter, roleFilter, sizeClassFilter, minDtons, maxDtons, tagFilter]);

  // ─── Derive unique tags from data ───
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    classifiedShips.forEach(s => (s.tags || []).forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [classifiedShips]);

  const hasActiveFilters = searchQuery || tlFilter || roleFilter || sizeClassFilter || minDtons || maxDtons || tagFilter;

  const clearFilters = () => {
    setSearchQuery('');
    setTlFilter('');
    setRoleFilter('');
    setSizeClassFilter('');
    setMinDtons('');
    setMaxDtons('');
    setTagFilter('');
  };

  const exportAll = () => {
    downloadJson(JSON.stringify(ships, null, 2), `ce-shipgen-library-${generateSnapshotName()}.json`);
  };

  const exportShip = (ship: ShipDesign) => {
    downloadJson(JSON.stringify(ship, null, 2), `ship-${ship.name.replace(/\s+/g, '_')}.json`);
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const data = await importJsonFile(file);
      // Support single ship or array of ships
      const shipArray: unknown[] = Array.isArray(data) ? data : [data];
      for (const raw of shipArray) {
        const s = raw as Record<string, unknown>;
        // Minimal validation
        if (!s.id || !s.name || typeof s.hullDtons !== 'number') {
          throw new Error(`Invalid ship data: missing id, name, or hullDtons`);
        }
        // Ensure fresh id to avoid collisions
        const ship: ShipDesign = {
          ...(s as unknown as ShipDesign),
          id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        };
        addShip(ship);
      }
    } catch (err) {
      setImportError((err as Error).message);
    } finally {
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--sh-ink)', fontFamily: 'var(--font-sh-display), monospace', letterSpacing: '0.12em' }}>SHIP LIBRARY</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--sh-ink-dim)' }}>
            {filteredShips.length} of {ships.length} ship{ships.length !== 1 ? 's' : ''} displayed
            {shipsWithViolations > 0 && (
              <span className="ml-2" style={{ color: 'var(--sh-warn)' }}>
                · {shipsWithViolations} with audit issues
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button onClick={handleImportClick} className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import
          </button>
          {ships.length > 0 && (
            <button onClick={exportAll} className="btn-secondary flex items-center gap-2">
              <FileJson className="w-4 h-4" /> Export Library
            </button>
          )}
          {ships.length > 0 && (
            <button
              onClick={() => setBatchAuditOpen(true)}
              className="btn-secondary flex items-center gap-2"
              style={{ color: shipsWithViolations > 0 ? 'var(--sh-warn)' : undefined }}
            >
              <ShieldAlert className="w-4 h-4" />
              Audit All
              {shipsWithViolations > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--sh-warn)', color: 'var(--sh-bg)' }}>
                  {shipsWithViolations}
                </span>
              )}
            </button>
          )}
          {shipsWithViolations > 0 && (
            <button
              onClick={() => {
                let updated = 0;
                classifiedShips.forEach(ship => {
                  const report = auditReports.get(ship.id);
                  if (report && report.hasViolations) {
                    const corrected = correctShip(ship, tables);
                    updateShip(corrected);
                    updated++;
                  }
                });
                setReconcileResult({
                  updated,
                  message: `Updated ${updated} ship${updated !== 1 ? 's' : ''} from reference tables.`,
                });
                setTimeout(() => setReconcileResult(null), 4000);
              }}
              className="btn-secondary flex items-center gap-2"
              style={{ color: 'var(--sh-glow)', borderColor: 'var(--sh-glow)' }}
            >
              <Edit3 className="w-4 h-4" />
              Reconcile from Tables
            </button>
          )}
        </div>
      </div>

      {importError && (
        <div className="mb-4 p-3 rounded flex items-center gap-2" style={{ background: 'rgba(255,122,90,0.12)', border: '1px solid var(--sh-warn)', color: 'var(--sh-warn)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{importError}</span>
        </div>
      )}
      {reconcileResult && (
        <div className="mb-4 p-3 rounded flex items-center gap-2" style={{ background: 'rgba(60,220,130,0.12)', border: '1px solid var(--sh-success)', color: 'var(--sh-success)' }}>
          <Check className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{reconcileResult.message}</span>
        </div>
      )}

      {/* ─── Search & Filter Bar ─── */}
      <div className="mb-4 p-3 rounded" style={{ background: 'var(--sh-panel-alt)', border: '1px solid var(--sh-hair)' }}>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--sh-ink-dim)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded"
              style={{
                background: 'var(--sh-bg)',
                border: '1px solid var(--sh-hair)',
                color: 'var(--sh-ink)',
                fontFamily: 'var(--font-sh-mono), monospace',
              }}
            />
          </div>

          {/* Toggle Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded"
            style={{
              background: showFilters ? 'var(--sh-glow)' : 'var(--sh-bg)',
              color: showFilters ? 'var(--sh-bg)' : 'var(--sh-ink-soft)',
              border: '1px solid var(--sh-hair)',
            }}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full" style={{ background: showFilters ? 'var(--sh-bg)' : 'var(--sh-glow)', color: showFilters ? 'var(--sh-glow)' : 'var(--sh-bg)' }}>
                {[tlFilter, roleFilter, sizeClassFilter, minDtons, maxDtons, tagFilter].filter(Boolean).length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded"
              style={{ background: 'var(--sh-bg)', color: 'var(--sh-ink-dim)', border: '1px solid var(--sh-hair)' }}
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Expanded Filter Controls */}
        {showFilters && (
          <div className="mt-3 pt-3 flex flex-wrap gap-3" style={{ borderTop: '1px solid var(--sh-hair)' }}>
            {/* TL Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: 'var(--sh-ink-dim)', letterSpacing: '0.08em' }}>TECH LEVEL</label>
              <select
                value={tlFilter}
                onChange={(e) => setTlFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded cursor-pointer"
                style={{
                  background: 'var(--sh-bg)',
                  border: '1px solid var(--sh-hair)',
                  color: 'var(--sh-ink)',
                  fontFamily: 'var(--font-sh-mono), monospace',
                  minWidth: 120,
                }}
              >
                <option value="">All TLs</option>
                {uniqueTls.map(tl => (
                  <option key={tl} value={String(tl)}>TL {tl}</option>
                ))}
              </select>
            </div>

            {/* Role Filter (Primary Type) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: 'var(--sh-ink-dim)', letterSpacing: '0.08em' }}>ROLE</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded cursor-pointer"
                style={{
                  background: 'var(--sh-bg)',
                  border: '1px solid var(--sh-hair)',
                  color: 'var(--sh-ink)',
                  fontFamily: 'var(--font-sh-mono), monospace',
                  minWidth: 140,
                }}
              >
                <option value="">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Size Class Filter (Sub-Type) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: 'var(--sh-ink-dim)', letterSpacing: '0.08em' }}>SIZE CLASS</label>
              <select
                value={sizeClassFilter}
                onChange={(e) => setSizeClassFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded cursor-pointer"
                style={{
                  background: 'var(--sh-bg)',
                  border: '1px solid var(--sh-hair)',
                  color: 'var(--sh-ink)',
                  fontFamily: 'var(--font-sh-mono), monospace',
                  minWidth: 140,
                }}
              >
                <option value="">All Sizes</option>
                {uniqueSizeClasses.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: 'var(--sh-ink-dim)', letterSpacing: '0.08em' }}>TAG</label>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded cursor-pointer"
                style={{
                  background: 'var(--sh-bg)',
                  border: '1px solid var(--sh-hair)',
                  color: 'var(--sh-ink)',
                  fontFamily: 'var(--font-sh-mono), monospace',
                  minWidth: 140,
                }}
              >
                <option value="">All Tags</option>
                {uniqueTags.map(tag => (
                  <option key={tag} value={tag}>{tag[0].toUpperCase() + tag.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Hull Dtons Range */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: 'var(--sh-ink-dim)', letterSpacing: '0.08em' }}>HULL DT (MIN–MAX)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minDtons}
                  onChange={(e) => setMinDtons(e.target.value)}
                  placeholder="Min"
                  className="px-3 py-2 text-sm rounded w-20"
                  style={{
                    background: 'var(--sh-bg)',
                    border: '1px solid var(--sh-hair)',
                    color: 'var(--sh-ink)',
                    fontFamily: 'var(--font-sh-mono), monospace',
                  }}
                />
                <span style={{ color: 'var(--sh-ink-dim)' }}>–</span>
                <input
                  type="number"
                  value={maxDtons}
                  onChange={(e) => setMaxDtons(e.target.value)}
                  placeholder="Max"
                  className="px-3 py-2 text-sm rounded w-20"
                  style={{
                    background: 'var(--sh-bg)',
                    border: '1px solid var(--sh-hair)',
                    color: 'var(--sh-ink)',
                    fontFamily: 'var(--font-sh-mono), monospace',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {ships.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--sh-ink-dim)' }}>
          <p>No ships saved yet.</p>
          <p className="text-sm mt-2">Go to the Design tab to create your first ship.</p>
        </div>
      ) : filteredShips.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--sh-ink-dim)' }}>
          <p>No ships match the current filters.</p>
          <button onClick={clearFilters} className="btn-secondary mt-3">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShips.map((ship) => (
            <div key={ship.id} className="tile">
              <div className="tile-content">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg truncate" style={{ color: 'var(--sh-ink)' }}>{ship.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--sh-ink-dim)' }}>TL {ship.tl} | {ship.hullDtons} DT</p>
                    {ship.classification && (
                      <p className="text-xs mt-1" style={{ color: 'var(--sh-glow)' }}>
                        {ship.classification.className} · {ship.classification.role} · {ship.classification.sizeClass}
                      </p>
                    )}
                    {(ship.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {ship.tags!.map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              background: 'var(--sh-bg)',
                              border: '1px solid var(--sh-hair)',
                              color: 'var(--sh-ink-dim)',
                              fontFamily: 'var(--font-sh-mono), monospace',
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {(() => {
                      const report = auditReports.get(ship.id);
                      if (!report || !report.hasViolations) return null;
                      const color = report.criticalCount > 0 ? 'var(--sh-warn)' : 'var(--sh-ink-dim)';
                      return (
                        <button
                          onClick={() => setAuditShipDetail(report)}
                          className="flex items-center gap-1 mt-1.5 text-xs"
                          style={{ color, fontFamily: 'var(--font-sh-mono), monospace' }}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {report.violations.length} issue{report.violations.length !== 1 ? 's' : ''}
                          {report.criticalCount > 0 && ` (${report.criticalCount} critical)`}
                        </button>
                      );
                    })()}
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <button 
                      onClick={() => setDetailShip(ship)}
                      className="p-1.5 rounded"
                      style={{ color: 'var(--sh-ink-dim)' }} onMouseEnter={(e)=>{(e.currentTarget as HTMLButtonElement).style.background='var(--sh-panel-alt)';(e.currentTarget as HTMLButtonElement).style.color='var(--sh-glow)'}} onMouseLeave={(e)=>{(e.currentTarget as HTMLButtonElement).style.background='transparent';(e.currentTarget as HTMLButtonElement).style.color='var(--sh-ink-dim)'}}
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentShip(ship);
                        navigate('/design');
                      }}
                      className="p-1.5 rounded"
                      style={{ color: 'var(--sh-ink-dim)' }} onMouseEnter={(e)=>{(e.currentTarget as HTMLButtonElement).style.background='var(--sh-panel-alt)';(e.currentTarget as HTMLButtonElement).style.color='var(--sh-glow)'}} onMouseLeave={(e)=>{(e.currentTarget as HTMLButtonElement).style.background='transparent';(e.currentTarget as HTMLButtonElement).style.color='var(--sh-ink-dim)'}}
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => exportShip(ship)}
                      className="p-1.5 rounded"
                      style={{ color: 'var(--sh-ink-dim)' }} onMouseEnter={(e)=>{(e.currentTarget as HTMLButtonElement).style.background='var(--sh-panel-alt)';(e.currentTarget as HTMLButtonElement).style.color='var(--sh-good)'}} onMouseLeave={(e)=>{(e.currentTarget as HTMLButtonElement).style.background='transparent';(e.currentTarget as HTMLButtonElement).style.color='var(--sh-ink-dim)'}}
                      title="Export"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteShip(ship.id)}
                      className="p-1.5 rounded"
                      style={{ color: 'var(--sh-ink-dim)' }} onMouseEnter={(e)=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(255,122,90,0.12)';(e.currentTarget as HTMLButtonElement).style.color='var(--sh-warn)'}} onMouseLeave={(e)=>{(e.currentTarget as HTMLButtonElement).style.background='transparent';(e.currentTarget as HTMLButtonElement).style.color='var(--sh-ink-dim)'}}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2" style={{ background: 'var(--sh-panel-alt)', border: '1px solid var(--sh-hair)' }}>
                    <div className="text-xs" style={{ color: 'var(--sh-ink-dim)' }}>Cost</div>
                    <div className="font-medium" style={{ color: 'var(--sh-ink-soft)' }}>{(ship.totalCost / 1e6).toFixed(2)} MCr</div>
                  </div>
                  <div className="p-2" style={{ background: 'var(--sh-panel-alt)', border: '1px solid var(--sh-hair)' }}>
                    <div className="text-xs" style={{ color: 'var(--sh-ink-dim)' }}>Cargo</div>
                    <div className="font-medium" style={{ color: 'var(--sh-ink-soft)' }}>{ship.cargo} DT</div>
                  </div>
                  <div className="p-2" style={{ background: 'var(--sh-panel-alt)', border: '1px solid var(--sh-hair)' }}>
                    <div className="text-xs" style={{ color: 'var(--sh-ink-dim)' }}>Config</div>
                    <div className="font-medium" style={{ color: 'var(--sh-ink-soft)' }}>{ship.configuration}</div>
                  </div>
                  <div className="p-2" style={{ background: 'var(--sh-panel-alt)', border: '1px solid var(--sh-hair)' }}>
                    <div className="text-xs" style={{ color: 'var(--sh-ink-dim)' }}>Drive</div>
                    <div className="font-medium" style={{ color: 'var(--sh-ink-soft)' }}>{ship.mDrive || '—'} / {ship.jDrive || '—'}</div>
                  </div>
                </div>

                <div className="mt-3 text-xs" style={{ color: 'var(--sh-ink-dim)' }}>
                  {ship.components.length} components | Created {new Date(ship.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailShip && (
        <ShipDetailModal
          ship={detailShip}
          onClose={() => setDetailShip(null)}
          onEdit={(ship) => {
            setCurrentShip(ship);
            setDetailShip(null);
            navigate('/design');
          }}
          onDelete={deleteShip}
          onExport={exportShip}
        />
      )}

      {/* ─── Audit Detail Modal ─── */}
      {auditShipDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-lg overflow-hidden" style={{ background: 'var(--sh-panel)', border: '1px solid var(--sh-hair)' }}>
            <div className="p-4 flex items-center justify-between" style={{ background: 'var(--sh-panel-alt)', borderBottom: '1px solid var(--sh-hair)' }}>
              <div>
                <h3 className="font-bold" style={{ color: 'var(--sh-ink)', fontFamily: 'var(--font-sh-display), monospace', letterSpacing: '0.08em' }}>
                  AUDIT REPORT
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--sh-ink-dim)' }}>{auditShipDetail.shipName}</p>
              </div>
              <button
                onClick={() => setAuditShipDetail(null)}
                className="p-1.5 rounded"
                style={{ color: 'var(--sh-ink-dim)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {auditShipDetail.violations.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'var(--sh-good)' }}>
                  <p className="font-medium">✅ No violations found</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--sh-ink-dim)' }}>All values match reference tables</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-4 text-xs mb-3" style={{ fontFamily: 'var(--font-sh-mono), monospace' }}>
                    {auditShipDetail.criticalCount > 0 && (
                      <span style={{ color: 'var(--sh-warn)' }}>🔴 {auditShipDetail.criticalCount} critical</span>
                    )}
                    {auditShipDetail.warningCount > 0 && (
                      <span style={{ color: 'var(--sh-ink-dim)' }}>🟡 {auditShipDetail.warningCount} warning</span>
                    )}
                    {auditShipDetail.infoCount > 0 && (
                      <span style={{ color: 'var(--sh-ink-dim)' }}>🔵 {auditShipDetail.infoCount} info</span>
                    )}
                  </div>

                  {auditShipDetail.violations.map((v, i) => (
                    <div
                      key={i}
                      className="p-3 rounded text-sm"
                      style={{
                        background: v.severity === 'critical' ? 'rgba(255,122,90,0.08)' : 'var(--sh-panel-alt)',
                        border: `1px solid ${v.severity === 'critical' ? 'var(--sh-warn)' : 'var(--sh-hair)'}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{
                          background: v.severity === 'critical' ? 'var(--sh-warn)' : v.severity === 'warning' ? 'var(--sh-ink-dim)' : 'var(--sh-hair)',
                          color: v.severity === 'critical' ? 'var(--sh-bg)' : 'var(--sh-ink)',
                        }}>
                          {v.severity.toUpperCase()}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--sh-ink-dim)' }}>{v.category}</span>
                      </div>
                      <p style={{ color: 'var(--sh-ink-soft)' }}>{v.message}</p>
                      {v.field !== 'table-lookup' && (
                        <p className="text-xs mt-1" style={{ color: 'var(--sh-ink-dim)' }}>
                          Expected: {v.expected.toLocaleString()} · Stored: {v.actual.toLocaleString()} · Delta: {v.delta > 0 ? '+' : ''}{v.delta.toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 flex gap-3" style={{ borderTop: '1px solid var(--sh-hair)', background: 'var(--sh-panel-alt)' }}>
              <button
                onClick={() => {
                  // Replace ship with corrected version
                  const corrected = correctShip(auditShipDetail.correctedShip, tables);
                  updateShip(corrected);
                  setAuditShipDetail(null);
                }}
                disabled={!auditShipDetail.hasViolations}
                className="btn-secondary flex-1"
                style={{ opacity: auditShipDetail.hasViolations ? 1 : 0.5 }}
              >
                Auto-Correct from Tables
              </button>
              <button
                onClick={() => setAuditShipDetail(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Batch Audit Modal ─── */}
      {batchAuditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-2xl rounded-lg overflow-hidden" style={{ background: 'var(--sh-panel)', border: '1px solid var(--sh-hair)' }}>
            <div className="p-4 flex items-center justify-between" style={{ background: 'var(--sh-panel-alt)', borderBottom: '1px solid var(--sh-hair)' }}>
              <div>
                <h3 className="font-bold" style={{ color: 'var(--sh-ink)', fontFamily: 'var(--font-sh-display), monospace', letterSpacing: '0.08em' }}>
                  BATCH AUDIT — ALL SHIPS
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--sh-ink-dim)' }}>
                  {ships.length} ships audited against reference tables
                </p>
              </div>
              <button
                onClick={() => setBatchAuditOpen(false)}
                className="p-1.5 rounded"
                style={{ color: 'var(--sh-ink-dim)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {shipsWithViolations === 0 ? (
                <div className="text-center py-8" style={{ color: 'var(--sh-good)' }}>
                  <p className="font-medium text-lg">✅ All Ships Clean</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--sh-ink-dim)' }}>
                    No violations found across {ships.length} ships
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {(() => {
                      const totalCrit = Array.from(auditReports.values()).reduce((s, r) => s + r.criticalCount, 0);
                      const totalWarn = Array.from(auditReports.values()).reduce((s, r) => s + r.warningCount, 0);
                      const totalInfo = Array.from(auditReports.values()).reduce((s, r) => s + r.infoCount, 0);
                      return (
                        <>
                          <div className="p-3 rounded text-center" style={{ background: 'rgba(255,122,90,0.08)', border: '1px solid var(--sh-warn)' }}>
                            <div className="text-2xl font-bold" style={{ color: 'var(--sh-warn)' }}>{totalCrit}</div>
                            <div className="text-xs" style={{ color: 'var(--sh-ink-dim)' }}>Critical</div>
                          </div>
                          <div className="p-3 rounded text-center" style={{ background: 'var(--sh-panel-alt)', border: '1px solid var(--sh-hair)' }}>
                            <div className="text-2xl font-bold" style={{ color: 'var(--sh-ink)' }}>{totalWarn}</div>
                            <div className="text-xs" style={{ color: 'var(--sh-ink-dim)' }}>Warnings</div>
                          </div>
                          <div className="p-3 rounded text-center" style={{ background: 'var(--sh-panel-alt)', border: '1px solid var(--sh-hair)' }}>
                            <div className="text-2xl font-bold" style={{ color: 'var(--sh-ink)' }}>{totalInfo}</div>
                            <div className="text-xs" style={{ color: 'var(--sh-ink-dim)' }}>Info</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Per-ship violations */}
                  {classifiedShips
                    .filter(s => {
                      const r = auditReports.get(s.id);
                      return r && r.hasViolations;
                    })
                    .map(ship => {
                      const report = auditReports.get(ship.id)!;
                      return (
                        <div key={ship.id} className="p-3 rounded" style={{ background: 'var(--sh-panel-alt)', border: '1px solid var(--sh-hair)' }}>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-medium text-sm" style={{ color: 'var(--sh-ink)' }}>{ship.name}</span>
                              <span className="text-xs ml-2" style={{ color: 'var(--sh-ink-dim)' }}>{ship.hullDtons} DT</span>
                            </div>
                            <div className="flex gap-2">
                              {report.criticalCount > 0 && (
                                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--sh-warn)', color: 'var(--sh-bg)' }}>
                                  {report.criticalCount} crit
                                </span>
                              )}
                              <span className="text-xs" style={{ color: 'var(--sh-ink-dim)' }}>
                                {report.violations.length} issue{report.violations.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            {report.violations.slice(0, 3).map((v, i) => (
                              <div key={i} className="text-xs" style={{ color: v.severity === 'critical' ? 'var(--sh-warn)' : 'var(--sh-ink-dim)' }}>
                                {v.severity === 'critical' ? '🔴' : '🟡'} [{v.category}] {v.message}
                              </div>
                            ))}
                            {report.violations.length > 3 && (
                              <div className="text-xs" style={{ color: 'var(--sh-ink-dim)' }}>
                                ... and {report.violations.length - 3} more
                              </div>
                            )}
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => {
                                setBatchAuditOpen(false);
                                setAuditShipDetail(report);
                              }}
                              className="text-xs px-2 py-1 rounded"
                              style={{ background: 'var(--sh-bg)', border: '1px solid var(--sh-hair)', color: 'var(--sh-ink-soft)' }}
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                const corrected = correctShip(ship, tables);
                                updateShip(corrected);
                              }}
                              className="text-xs px-2 py-1 rounded"
                              style={{ background: 'var(--sh-bg)', border: '1px solid var(--sh-hair)', color: 'var(--sh-glow)' }}
                            >
                              Auto-Correct
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="p-4 flex gap-3" style={{ borderTop: '1px solid var(--sh-hair)', background: 'var(--sh-panel-alt)' }}>
              {shipsWithViolations > 0 && (
                <button
                  onClick={() => {
                    classifiedShips.forEach(ship => {
                      const report = auditReports.get(ship.id);
                      if (report && report.hasViolations) {
                        const corrected = correctShip(ship, tables);
                        updateShip(corrected);
                      }
                    });
                  }}
                  className="btn-secondary flex-1"
                  style={{ color: 'var(--sh-warn)' }}
                >
                  Auto-Correct All {shipsWithViolations} Ships
                </button>
              )}
              <button
                onClick={() => setBatchAuditOpen(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
