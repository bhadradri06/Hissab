const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const MAX_DIMENSION = 1100;

export function isAcceptedScreenshotFile(file: File): boolean {
  if (ALLOWED_TYPES.has(file.type.toLowerCase())) return true;
  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

/**
 * Compresses and resizes a payment screenshot cleanly while preserving text legibility
 * for OCR and ledger thumbnail viewing.
 */
export async function processScreenshotFile(file: File): Promise<string> {
  if (!isAcceptedScreenshotFile(file)) {
    throw new Error('Please upload a JPG, JPEG, PNG, or WEBP image.');
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('Image is too large (max 12 MB).');
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
      const targetW = Math.max(1, Math.round(width * scale));
      const targetH = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(rawDataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const compressed = canvas.toDataURL(outputMime, 0.82);
      resolve(compressed.length < rawDataUrl.length ? compressed : rawDataUrl);
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });
}
