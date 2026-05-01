import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTableStore } from '../store/tableStore';
import { downloadJson, generateSnapshotName, importJsonFile } from '../utils/exportImport';
import { ShipDetailModal } from './ShipDetailModal';
import { Download, Trash2, Edit3, FileJson, Eye, Upload, AlertCircle } from 'lucide-react';
import type { ShipDesign } from '../types';

export function ShipLibrary() {
  const navigate = useNavigate();
  const ships = useTableStore((s) => s.ships);
  const deleteShip = useTableStore((s) => s.deleteShip);
  const addShip = useTableStore((s) => s.addShip);
  const setCurrentShip = useTableStore((s) => s.setCurrentShip);
  const [detailShip, setDetailShip] = useState<ShipDesign | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          <p className="text-sm mt-1" style={{ color: 'var(--sh-ink-dim)' }}>{ships.length} ship{ships.length !== 1 ? 's' : ''} saved</p>
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
        </div>
      </div>

      {importError && (
        <div className="mb-4 p-3 rounded flex items-center gap-2" style={{ background: 'rgba(255,122,90,0.12)', border: '1px solid var(--sh-warn)', color: 'var(--sh-warn)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{importError}</span>
        </div>
      )}

      {ships.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--sh-ink-dim)' }}>
          <p>No ships saved yet.</p>
          <p className="text-sm mt-2">Go to the Design tab to create your first ship.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ships.map((ship) => (
            <div key={ship.id} className="tile">
              <div className="tile-content">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--sh-ink)' }}>{ship.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--sh-ink-dim)' }}>TL {ship.tl} | {ship.hullDtons} DT</p>
                  </div>
                  <div className="flex gap-1">
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
    </div>
  );
}
