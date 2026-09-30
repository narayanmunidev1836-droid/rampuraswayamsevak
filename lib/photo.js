const MAX_W = 600;
const MAX_H = 800;

export async function resizePhoto(file, maxBytes = 5 * 1024 * 1024) {
  if (file.size > maxBytes) throw new Error('PHOTO_TOO_LARGE');

  const url = URL.createObjectURL(file);

  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('PHOTO_INVALID'));
      i.src = url;
    });

    const scale = Math.min(MAX_W / img.naturalWidth, MAX_H / img.naturalHeight, 1);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}
