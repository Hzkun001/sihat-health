import { describe, expect, it } from 'vitest';
import { reportsToFeatureCollection, type CommunityReport } from './communityReports';

function createReport(id: string, isPublic: boolean): CommunityReport {
  return {
    id,
    category: 'lingkungan',
    description: 'Laporan pengujian privasi.',
    latitude: -3.45,
    longitude: 114.84,
    createdAt: '2026-06-06T00:00:00.000Z',
    status: 'baru',
    priority: 'normal',
    isPublic,
    comments: [],
    updates: [],
  };
}

describe('reportsToFeatureCollection', () => {
  it('excludes internal reports from the public map', () => {
    const collection = reportsToFeatureCollection([
      createReport('internal', false),
      createReport('public', true),
    ]);

    expect(collection.features).toHaveLength(1);
    expect(collection.features[0].id).toBe('public');
  });

  it('can include internal reports for explicit staff-only use', () => {
    const collection = reportsToFeatureCollection(
      [createReport('internal', false)],
      true,
    );

    expect(collection.features).toHaveLength(1);
  });
});
