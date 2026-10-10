import { useEffect, useRef, useState } from 'react';

type Photo = { url: string; name: string };
async function compressPhoto(file: File): Promise<Blob> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG, or WebP image.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Choose images smaller than 15 MB each.');
  const bitmap = await createImageBitmap(file);
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 50_000_000) throw new Error('This image is too large. Choose a smaller photo.');
    const ratio = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * ratio); canvas.height = Math.round(bitmap.height * ratio);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Photo preview is unavailable. Continue with the checklist.');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not read the image.')), 'image/jpeg', 0.8));
  } finally { bitmap.close(); }
}

export function PhotoPicker({ consent }: { consent: boolean }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const urls = useRef<string[]>([]);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; urls.current.forEach(URL.revokeObjectURL); urls.current = []; };
  }, []);
  useEffect(() => {
    if (!consent) { urls.current.forEach(URL.revokeObjectURL); urls.current = []; setPhotos([]); }
  }, [consent]);
  return <div className="photo-section">
    <div className="field-heading"><span>Device photos</span><span className="optional">Optional · up to 3</span></div>
    <p className="help">Front, back, or model label. Keep names, contacts, and serial numbers out of frame. Photos stay in this tab and are not uploaded in this preview.</p>
    <label className={`upload-box ${!consent ? 'disabled' : ''}`}>
      <span aria-hidden="true" className="upload-icon">+</span><strong>{busy ? 'Preparing photos…' : 'Choose photos'}</strong><span>JPEG, PNG, or WebP · camera or library</span>
      <input aria-label="Choose device photos" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={!consent || busy} onChange={async event => {
        const files = Array.from(event.target.files ?? []); event.target.value = ''; setError('');
        if (files.length + photos.length > 3) { setError('Choose no more than three photos in total.'); return; }
        setBusy(true);
        const next: Photo[] = [];
        try {
          for (const file of files) next.push({ name: file.name, url: URL.createObjectURL(await compressPhoto(file)) });
          if (active.current) { urls.current.push(...next.map(photo => photo.url)); setPhotos(previous => [...previous, ...next]); }
          else next.forEach(photo => URL.revokeObjectURL(photo.url));
        } catch (e) { next.forEach(photo => URL.revokeObjectURL(photo.url)); if (active.current) setError(e instanceof Error ? e.message : 'Could not read the photo. Choose another image or continue manually.'); }
        finally { if (active.current) setBusy(false); }
      }} />
    </label>
    {!consent && <p className="help">Confirm consent below to enable photo selection, or continue without photos.</p>}
    {error && <p role="alert" className="error-text">{error}</p>}
    <div className="photo-grid">{photos.map(photo => <figure key={photo.url}><img src={photo.url} alt="Selected device preview" /><button type="button" onClick={() => { URL.revokeObjectURL(photo.url); urls.current = urls.current.filter(url => url !== photo.url); setPhotos(previous => previous.filter(p => p !== photo)); }} aria-label={`Remove ${photo.name}`}>Remove</button></figure>)}</div>
  </div>;
}
