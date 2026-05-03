import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Image, LayoutTemplate } from 'lucide-react';
import { colors, fonts } from './shipgen/theme';
import type { ShipImageSet } from '../utils/shipImages';

interface ShipImageViewerProps {
  shipName: string;
  images: ShipImageSet;
  onClose: () => void;
}

type ImageTab = 'token' | 'deckplan';

export function ShipImageViewer({ shipName, images, onClose }: ShipImageViewerProps) {
  const [activeTab, setActiveTab] = useState<ImageTab>(images.hasToken ? 'token' : 'deckplan');
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentList = activeTab === 'token' ? images.tokens : images.deckplans;
  const currentImage = currentList[currentIndex];
  const hasMultiple = currentList.length > 1;

  const nextImage = () => setCurrentIndex((i) => (i + 1) % currentList.length);
  const prevImage = () => setCurrentIndex((i) => (i - 1 + currentList.length) % currentList.length);

  const tabBtn = (tab: ImageTab, label: string, icon: React.ReactNode, count: number) => (
    <button
      onClick={() => { setActiveTab(tab); setCurrentIndex(0); }}
      style={{
        padding: '10px 16px',
        fontFamily: fonts.mono,
        fontSize: 12,
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        border: 'none',
        borderBottom: `2px solid ${activeTab === tab ? colors.glow : 'transparent'}`,
        background: 'transparent',
        color: activeTab === tab ? colors.glow : colors.inkDim,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {icon}
      {label}
      <span style={{
        fontSize: 10,
        padding: '2px 6px',
        borderRadius: 10,
        background: activeTab === tab ? `${colors.glow}22` : colors.panelAlt,
        color: activeTab === tab ? colors.glow : colors.inkDim,
      }}>
        {count}
      </span>
    </button>
  );

  const imageName = currentImage?.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
  const displayName = activeTab === 'deckplan'
    ? `${imageName} [DECKPLAN]`
    : imageName;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,16,12,0.92)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.panel,
          border: `1px solid ${colors.hair}`,
          maxWidth: 900,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: `1px solid ${colors.hair}`,
          background: colors.panelAlt,
        }}>
          <div>
            <div style={{
              fontFamily: fonts.display,
              fontSize: 16,
              color: colors.glow,
              letterSpacing: '0.12em',
            }}>
              {shipName}
            </div>
            <div style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: colors.inkDim,
              marginTop: 2,
            }}>
              {displayName}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ padding: 8, background: 'transparent', border: 'none', color: colors.inkDim, cursor: 'pointer' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 4,
          padding: '0 18px',
          borderBottom: `1px solid ${colors.hair}`,
        }}>
          {images.hasToken && tabBtn('token', 'Tokens', <Image className="w-3.5 h-3.5" />, images.tokens.length)}
          {images.hasDeckplan && tabBtn('deckplan', 'Deckplans', <LayoutTemplate className="w-3.5 h-3.5" />, images.deckplans.length)}
        </div>

        {/* Image Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          position: 'relative',
          minHeight: 400,
          overflow: 'hidden',
        }}>
          {currentImage ? (
            <>
              <img
                src={currentImage}
                alt={displayName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                  imageRendering: 'auto',
                }}
              />
              {hasMultiple && (
                <>
                  <button
                    onClick={prevImage}
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '12px 8px',
                      background: `${colors.panelAlt}dd`,
                      border: `1px solid ${colors.hair}`,
                      color: colors.inkSoft,
                      cursor: 'pointer',
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '12px 8px',
                      background: `${colors.panelAlt}dd`,
                      border: `1px solid ${colors.hair}`,
                      color: colors.inkSoft,
                      cursor: 'pointer',
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div style={{
                    position: 'absolute',
                    bottom: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '4px 12px',
                    background: `${colors.panelAlt}dd`,
                    border: `1px solid ${colors.hair}`,
                    fontFamily: fonts.mono,
                    fontSize: 11,
                    color: colors.inkDim,
                  }}>
                    {currentIndex + 1} / {currentList.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ color: colors.inkDim, fontFamily: fonts.mono, fontSize: 14 }}>
              No images available
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {currentList.length > 1 && (
          <div style={{
            display: 'flex',
            gap: 8,
            padding: '12px 18px',
            borderTop: `1px solid ${colors.hair}`,
            overflowX: 'auto',
          }}>
            {currentList.map((img, idx) => (
              <button
                key={img}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  flexShrink: 0,
                  width: 64,
                  height: 64,
                  padding: 2,
                  background: idx === currentIndex ? `${colors.glow}33` : 'transparent',
                  border: `1px solid ${idx === currentIndex ? colors.glow : colors.hair}`,
                  cursor: 'pointer',
                }}
              >
                <img
                  src={img}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
