import { describe, expect, it } from 'vitest';
import {
  parseCoordinates,
  REPORT_COMMENT_MAX_LENGTH,
  REPORT_DESCRIPTION_MAX_LENGTH,
  validateReportComment,
  validateReportDescription,
  validateReportPhoto,
} from './reportValidation';

describe('parseCoordinates', () => {
  it('parses valid coordinates', () => {
    expect(parseCoordinates('-3.4543, 114.8419')).toEqual({
      latitude: -3.4543,
      longitude: 114.8419,
    });
  });

  it('rejects malformed and out-of-range coordinates', () => {
    expect(parseCoordinates('Banjarbaru')).toBeNull();
    expect(parseCoordinates('-91, 114')).toBeNull();
    expect(parseCoordinates('-3, 181')).toBeNull();
  });
});

describe('validateReportDescription', () => {
  it('enforces database-compatible length limits', () => {
    expect(validateReportDescription('pendek')).toContain('minimal');
    expect(validateReportDescription('Genangan air menutup jalan.')).toBeNull();
    expect(validateReportDescription('a'.repeat(REPORT_DESCRIPTION_MAX_LENGTH + 1))).toContain('maksimal');
  });
});

describe('validateReportComment', () => {
  it('rejects blank comments and enforces the server limit', () => {
    expect(validateReportComment('   ')).toContain('kosong');
    expect(validateReportComment('Komentar yang valid.')).toBeNull();
    expect(validateReportComment('a'.repeat(REPORT_COMMENT_MAX_LENGTH + 1))).toContain('maksimal');
  });
});

describe('validateReportPhoto', () => {
  it('accepts supported images up to five megabytes', () => {
    expect(validateReportPhoto({ type: 'image/jpeg', size: 1024 })).toBeNull();
  });

  it('rejects unsupported formats and oversized images', () => {
    expect(validateReportPhoto({ type: 'image/svg+xml', size: 1024 })).toContain('Format');
    expect(validateReportPhoto({ type: 'image/png', size: 6 * 1024 * 1024 })).toContain('5 MB');
  });
});
