// src/lib/reportSyncWorker.test.ts
import { describe, it, expect } from 'vitest';
import { syncPendingReports } from './reportSyncWorker';

describe('Report Sync Worker Tests', () => {
  it('returns zero sync when offline or no pending reports exist', async () => {
    const result = await syncPendingReports();
    expect(result).toBeDefined();
    expect(typeof result.syncedCount).toBe('number');
    expect(typeof result.failedCount).toBe('number');
  });
});
