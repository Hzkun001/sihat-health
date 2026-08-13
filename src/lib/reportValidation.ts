export const REPORT_DESCRIPTION_MIN_LENGTH = 10;
export const REPORT_DESCRIPTION_MAX_LENGTH = 2000;
export const REPORT_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const REPORT_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const REPORT_COMMENT_MAX_LENGTH = 1000;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function validateReportDescription(value: string) {
  const length = value.trim().length;
  if (length < REPORT_DESCRIPTION_MIN_LENGTH) {
    return `Keterangan minimal ${REPORT_DESCRIPTION_MIN_LENGTH} karakter.`;
  }
  if (length > REPORT_DESCRIPTION_MAX_LENGTH) {
    return `Keterangan maksimal ${REPORT_DESCRIPTION_MAX_LENGTH} karakter.`;
  }
  return null;
}

export function parseCoordinates(value: string): Coordinates | null {
  const parts = value.split(',').map((part) => part.trim());
  if (parts.length !== 2) return null;

  const latitude = Number(parts[0]);
  const longitude = Number(parts[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}

export function validateReportComment(value: string) {
  const length = value.trim().length;
  if (!length) return 'Komentar tidak boleh kosong.';
  if (length > REPORT_COMMENT_MAX_LENGTH) {
    return `Komentar maksimal ${REPORT_COMMENT_MAX_LENGTH} karakter.`;
  }
  return null;
}

export function validateReportPhoto(file: Pick<File, 'size' | 'type'>) {
  if (!REPORT_PHOTO_TYPES.includes(file.type as (typeof REPORT_PHOTO_TYPES)[number])) {
    return 'Format foto harus JPG, PNG, atau WebP.';
  }
  if (file.size > REPORT_PHOTO_MAX_BYTES) {
    return 'Ukuran foto maksimal 5 MB.';
  }
  return null;
}
