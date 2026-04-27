import { useState, useEffect } from 'react';
import DomeGallery from './DomeGallery';

export default function DomeWithData() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch('/api/photos');
        const data = await res.json();
        setPhotos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      }
    };
    
    // Traer las fotos al entrar
    fetchPhotos();
    
    // Actualizar automáticamente cada 30 segundos (útil para eventos en vivo)
    const interval = setInterval(fetchPhotos, 30000);
    return () => clearInterval(interval);
  }, []);

  const grouped = photos
    .filter((p: any) => p.type === 'image')
    .reduce((acc: any, p: any) => {
      const key = p.guest_name || 'Anónimo';
      if (!acc[key]) acc[key] = { guest_name: key, photos: [] };
      acc[key].photos.push({
        src: `/${p.path}`,
        alt: p.guest_name || 'Foto',
        type: p.type || 'image'
      });
      return acc;
    }, {});

  const userAlbums = Object.values(grouped);

  return <DomeGallery userAlbums={userAlbums.length > 0 ? userAlbums : undefined} />;
}
