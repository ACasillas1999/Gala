'use client';
import { useState, useRef } from 'react';

export default function UploadForm() {
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : '');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        if (data.file) {
          const existing = JSON.parse(localStorage.getItem('my_uploads') || '[]');
          existing.unshift(data.file); // Guardar historial en el dispositivo (cookie local)
          localStorage.setItem('my_uploads', JSON.stringify(existing));
        }
        setStatus('success');
        setMessage('¡Contenido subido con éxito! 🎉');
        setFileName('');
        formRef.current?.reset();
      } else {
        setStatus('error');
        setMessage(data.error || 'Ocurrió un error.');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexión. Intenta de nuevo.');
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ width: '100%' }}>
      {status === 'success' && (
        <div className="alert-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          {message}
        </div>
      )}
      {status === 'error' && (
        <div className="alert-error">{message}</div>
      )}

      <div className="form-group">
        <label className="label-premium" htmlFor="guest_name">¿Quién comparte este momento?</label>
        <input type="text" name="guest_name" id="guest_name" className="input-premium" placeholder="Tu nombre artístico o real..." autoComplete="off" />
      </div>

      <div className="form-group">
        <label className="label-premium" htmlFor="caption">Dedicatoría o Comentario (Opcional)</label>
        <textarea name="caption" id="caption" className="input-premium" placeholder="Escribe algo especial aquí..." rows={3} style={{ resize: 'none' }}></textarea>
      </div>

      <div className="form-group">
        <label className="label-premium">Captura el Momento</label>
        <div className="file-upload-area" onClick={() => fileRef.current?.click()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <p id="upload-text">{fileName || 'Toca para seleccionar fotos o videos'}</p>
          <input ref={fileRef} type="file" name="photo" id="photo" accept="image/*,video/*" capture="environment" required onChange={handleFileChange} style={{ display: 'none' }} />
        </div>
        <p className="file-hint">Formatos permitidos: JPG, PNG, MP4 (Máx. 50MB)</p>
      </div>

      <button type="submit" className="btn-gold btn-submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Subiendo...' : 'Enviar a la Galería'}
      </button>
    </form>
  );
}
