// src/lib/searchEngine.test.ts
import { describe, it, expect } from 'vitest';
import {
  calculateMatchScore,
  levenshteinDistance,
  normalizeSearchString,
  calculateDistanceMeters,
  formatDistanceString,
  querySearchIndex,
  SearchItem,
} from './searchEngine';

describe('Search Engine Unit Tests', () => {
  it('normalizes search strings properly', () => {
    expect(normalizeSearchString('  Rumah Sakit, Umum!  ')).toBe('rumah sakit umum');
    expect(normalizeSearchString('Puskesmas Cempaka')).toBe('puskesmas cempaka');
  });

  it('calculates levenshtein distance accurately', () => {
    expect(levenshteinDistance('puskesmas', 'puskesmas')).toBe(0);
    expect(levenshteinDistance('puskesma', 'puskesmas')).toBe(1);
    expect(levenshteinDistance('ansari', 'ansary')).toBe(1);
  });

  it('scores exact and prefix matches highest', () => {
    const exactScore = calculateMatchScore('rsud ulin', 'rsud ulin banjarmasin', 'RSUD Ulin');
    const substringScore = calculateMatchScore('ulin', 'rsud ulin banjarmasin', 'RSUD Ulin');
    const fuzzyScore = calculateMatchScore('ulinn', 'rsud ulin banjarmasin', 'RSUD Ulin');

    expect(exactScore).toBe(100);
    expect(substringScore).toBeGreaterThan(fuzzyScore);
    expect(fuzzyScore).toBeGreaterThan(0);
  });

  it('handles multi-word token matches in target text', () => {
    const score = calculateMatchScore(
      'cempaka lansia',
      'homecare lansia cempaka banjarbaru',
      'HomeCare Cempaka'
    );
    expect(score).toBeGreaterThanOrEqual(50);
  });

  it('calculates geographic distance in meters', () => {
    // Banjarmasin: ~ [114.59, -3.32], Banjarbaru: ~ [114.83, -3.44]
    const bjm: [number, number] = [114.59, -3.32];
    const bjb: [number, number] = [114.83, -3.44];
    const distance = calculateDistanceMeters(bjm, bjb);

    expect(distance).toBeGreaterThan(25000); // ~30 km
    expect(distance).toBeLessThan(40000);
  });

  it('formats distance string properly', () => {
    expect(formatDistanceString(350)).toBe('350 m');
    expect(formatDistanceString(1500)).toBe('1,5 km');
    expect(formatDistanceString(12400)).toBe('12,4 km');
  });

  it('queries and filters items by category and score ranking', () => {
    const mockIndex: SearchItem[] = [
      {
        id: '1',
        title: 'RSUD Ulin',
        category: 'rumahsakit',
        categoryLabel: 'Rumah Sakit',
        searchableText: 'rsud ulin banjarmasin rumah sakit umum daerah',
      },
      {
        id: '2',
        title: 'Puskesmas Cempaka',
        category: 'puskesmas',
        categoryLabel: 'Puskesmas',
        searchableText: 'puskesmas cempaka banjarbaru',
      },
      {
        id: '3',
        title: 'Apotek Kimia Farma Ulin',
        category: 'apotek',
        categoryLabel: 'Apotek',
        searchableText: 'apotek kimia farma ulin',
      },
    ];

    const resultsAll = querySearchIndex(mockIndex, 'ulin');
    expect(resultsAll.length).toBe(2);
    expect(resultsAll[0].title).toBe('RSUD Ulin'); // Highest score because 'ulin' is in title

    const resultsFaskesRS = querySearchIndex(mockIndex, 'ulin', { categoryFilter: 'rumahsakit' });
    expect(resultsFaskesRS.length).toBe(1);
    expect(resultsFaskesRS[0].title).toBe('RSUD Ulin');
  });
});
