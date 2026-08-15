// src/lib/statsData.test.ts
import { describe, it, expect } from 'vitest';
import {
  DEFAULT_VERIFIED_STATS,
  buildStatCardsList,
} from './statsData';

describe('Stats Data Utilities', () => {
  it('contains valid default verified statistics matching dataset counts', () => {
    expect(DEFAULT_VERIFIED_STATS.hospitals).toBe(17);
    expect(DEFAULT_VERIFIED_STATS.puskesmas).toBe(32);
    expect(DEFAULT_VERIFIED_STATS.clinics).toBe(68);
    expect(DEFAULT_VERIFIED_STATS.pharmacies).toBe(176);
    expect(DEFAULT_VERIFIED_STATS.homecares).toBe(30);
    expect(DEFAULT_VERIFIED_STATS.tpsCount).toBe(19);
  });

  it('generates complete stat card items with icons and descriptions', () => {
    const cards = buildStatCardsList(DEFAULT_VERIFIED_STATS);
    expect(cards.length).toBe(9);

    const rsCard = cards.find((c) => c.label.includes('Rumah Sakit'));
    expect(rsCard).toBeDefined();
    expect(rsCard?.value).toBe('17');

    const puskesmasCard = cards.find((c) => c.label.includes('Puskesmas'));
    expect(puskesmasCard).toBeDefined();
    expect(puskesmasCard?.value).toBe('32');
  });
});
