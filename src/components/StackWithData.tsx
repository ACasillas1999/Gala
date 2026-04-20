import { useState, useEffect } from 'react';
import Stack from './Stack.jsx';

export default function StackWithData(props) {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const localUploads = JSON.parse(localStorage.getItem('my_uploads') || '[]');
    if (localUploads.length > 0) {
      setPhotos(localUploads);
      return; // Si el dispositivo ya subió cosas, mostramos solo sus aportes
    }

    const fetchPhotos = async () => {
      try {
        const res = await fetch('/api/photos');
        const data = await res.json();
        setPhotos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error fetching photos for stack", e);
      }
    };
    
    fetchPhotos();
    const interval = setInterval(fetchPhotos, 30000);
    return () => clearInterval(interval);
  }, []);

  // Limit to the latest 8 photos so the stack doesn't get ridiculously heavy 
  // (a stack is meant for a few items, unlike the dome which takes 170+)
  const recentPhotos = photos.slice(0, 8);

  const cards = recentPhotos.map((p, i) => {
    return p.type === 'video' ? (
      <video 
        key={i} 
        src={`/${p.path}`} 
        className="card-image" 
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }} 
        autoPlay muted loop playsInline 
      />
    ) : (
      <img 
        key={i} 
        src={`/${p.path}`} 
        alt={p.guest_name || 'Foto'} 
        className="card-image" 
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem', pointerEvents: 'none' }} 
      />
    );
  });

  return (
    <Stack 
      cards={cards.length > 0 ? cards : undefined} 
      {...props} 
    />
  );
}
