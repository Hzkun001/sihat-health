// src/lib/imageCompression.ts
/**
 * Utilitas kompresi gambar di sisi klien (Canvas API)
 * Mereduksi foto kamera HP (5MB-15MB) menjadi ~150KB-300KB
 * untuk mencegah QuotaExceededError di localStorage dan mempercepat upload.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp';
}

const DEFAULT_MAX_WIDTH = 1280;
const DEFAULT_MAX_HEIGHT = 1280;
const DEFAULT_QUALITY = 0.82;
const DEFAULT_MIME_TYPE = 'image/jpeg';

/**
 * Hitung dimensi baru proporsional agar tidak melebihi batas maksimum
 */
export function calculateTargetDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth = DEFAULT_MAX_WIDTH,
  maxHeight = DEFAULT_MAX_HEIGHT
): { width: number; height: number } {
  if (srcWidth <= 0 || srcHeight <= 0) {
    return { width: maxWidth, height: maxHeight };
  }

  let width = srcWidth;
  let height = srcHeight;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  return { width, height };
}

/**
 * Kompres file gambar menjadi data URL (Base64 JPEG/WebP) dengan resolusi optimal
 */
export async function compressImageFile(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    quality = DEFAULT_QUALITY,
    mimeType = DEFAULT_MIME_TYPE,
  } = options;

  return new Promise<string>((resolve, reject) => {
    // Jika di lingkungan non-browser (misal saat SSR/testing tanpa canvas), fallback ke FileReader standar
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        const { width, height } = calculateTargetDimensions(
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
          maxWidth,
          maxHeight
        );

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Gagal menginisialisasi context canvas 2D');
        }

        // Gambar ulang dengan smoothing aktif
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal memuat gambar untuk kompresi: ' + String(err)));
    };

    img.src = objectUrl;
  });
}
