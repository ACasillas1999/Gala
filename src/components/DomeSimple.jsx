import { useMemo } from 'react';
import './DomeGallery.css'; // Reusing old CSS for gradients/bg, but we'll override item inline.

const DEFAULT_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774' },
  { src: 'https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772' },
  { src: 'https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774' },
  { src: 'https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774' },
  { src: 'https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774' },
  { src: 'https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774' },
  { src: 'https://pbs.twimg.com/media/Gyla7NnXMAAXSo_?format=jpg&name=large' }
];

function buildItems(seg) {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];
  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });
  return coords.map((c, i) => ({
    ...c,
    src: DEFAULT_IMAGES[i % DEFAULT_IMAGES.length].src
  }));
}

export default function DomeSimple() {
  const segments = 35;
  const radius = 600;
  const circ = radius * Math.PI; // approx
  
  const items = useMemo(() => buildItems(segments), []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0a0a0a' }}>
      <main style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', perspective: `${radius * 2}px` }}>
        <div style={{ transformStyle: 'preserve-3d', transform: `translateZ(-${radius}px)` }}>
          {items.map((it, i) => {
            const rotYBase = 360 / segments / 2;
            const rotXBase = 360 / segments / 2;
            
            const itemWidth = (circ / segments) * it.sizeX;
            const itemHeight = (circ / segments) * it.sizeY;
            
            const rotY = rotYBase * (it.x + (it.sizeX - 1) / 2);
            const rotX = rotXBase * (it.y - (it.sizeY - 1) / 2);

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '-999px', bottom: '-999px',
                  left: '-999px', right: '-999px',
                  margin: 'auto',
                  width: `${itemWidth}px`,
                  height: `${itemHeight}px`,
                  transform: `rotateY(${rotY}deg) rotateX(${rotX}deg) translateZ(${radius}px)`,
                  transformStyle: 'preserve-3d',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                  <img src={it.src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            );
          })}
        </div>
      </main>
      <div style={{ position: 'absolute', zIndex: 9999, color: 'lime', top: 10, left: 10, fontSize: 24, fontWeight: 'bold' }}>
        DOME SIMPLE LOADED
      </div>
    </div>
  );
}
