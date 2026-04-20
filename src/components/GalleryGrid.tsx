'use client';
import { useState, useEffect } from 'react';
import DomeGallery from './DomeGallery';

interface Photo {
  id: number;
  path: string;
  guest_name: string | null;
  caption: string | null;
  type: 'image' | 'video';
}

type TabFilter = 'all' | 'image' | 'video';

export default function GalleryGrid() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tab, setTab] = useState<TabFilter>('all');
  const [modalMedia, setModalMedia] = useState<Photo | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWin = () => setIsMobile(window.innerWidth < 768);
    checkWin();
    window.addEventListener('resize', checkWin);
    return () => window.removeEventListener('resize', checkWin);
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/photos');
      const data = await res.json();
      setPhotos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPhotos();
    const interval = setInterval(fetchPhotos, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = photos.filter(p => tab === 'all' || p.type === tab);

  const domeImages = filtered.map(p => ({
    src: `/${p.path}`,
    alt: p.guest_name || 'Foto',
    type: p.type,
    photo: p // Keep original photo object
  }));

  return (
    <>
      {/* Tabs */}
      <div className="gallery-tabs">
        {(['all', 'image', 'video'] as TabFilter[]).map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'all' && (
              <svg fill="none" height="14" viewBox="0 0 24 24" width="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            )}
            {t === 'image' && (
              <svg fill="none" height="14" viewBox="0 0 24 24" width="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
            {t === 'video' && (
              <svg fill="none" height="14" viewBox="0 0 24 24" width="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            )}
            {t === 'all' ? 'Todas' : t === 'image' ? 'Imágenes' : 'Reels'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>Todavía no hay contenido en esta sección.</p>
        </div>
      ) : tab === 'all' ? (
        <div style={{ width: '100%', height: 'calc(100vh - 120px)' }}>
          <DomeGallery 
            images={domeImages.length > 0 ? domeImages : undefined} 
            grayscale={false} 
            fit={isMobile ? 1.4 : 1.2} 
            segments={isMobile ? 32 : 60} 
            autoRotate={true} 
            autoRotateSpeed={0.05}
            onMediaClick={setModalMedia}
            imageBorderRadius={isMobile ? '12px' : '30px'}
            minRadius={isMobile ? 350 : 600}
          />
        </div>
      ) : (
        <div className="media-grid" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {filtered.map(p => (
            <div key={p.id} className="photo-card" onClick={() => setModalMedia(p)}>
              {p.type === 'video' ? (
                <>
                  <video src={`/${p.path}`} preload="metadata" />
                  <svg className="video-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon>
                  </svg>
                </>
              ) : (
                <img src={`/${p.path}`} alt={p.guest_name || 'Foto'} loading="lazy" />
              )}
            </div>
          ))}
        </div>
      )}

      {modalMedia && (
        <div className="modal-backdrop" onClick={() => setModalMedia(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setModalMedia(null)} aria-label="Cerrar">&times;</button>
            <div className="modal-content-split">
              <div className="modal-left">
                {modalMedia.type === 'video' ? (
                  <video src={`/${modalMedia.path}`} controls autoPlay playsInline loop></video>
                ) : (
                  <img src={`/${modalMedia.path}`} alt={modalMedia.guest_name || 'Media'} />
                )}
              </div>
              <div className="modal-right">
                <div className="modal-info-header">
                  <div className="guest-avatar">
                    {(modalMedia.guest_name || 'A')[0].toUpperCase()}
                  </div>
                  <div className="modal-right-name">
                    {modalMedia.guest_name || 'Anónimo'}
                  </div>
                </div>
                <div className="modal-info-body">
                  {modalMedia.caption ? (
                    <div className="modal-dedication">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                      {modalMedia.caption}
                    </div>
                  ) : (
                    <p style={{ opacity: 0.3, fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>Sin descripción adicional.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
