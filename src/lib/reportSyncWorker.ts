// src/lib/reportSyncWorker.ts
import { isSupabaseConfigured, supabase, ensureAnonymousSession } from './supabase';
import {
  getLocalReports,
  saveLocalReports,
  CommunityReport,
  REPORTS_UPDATED_EVENT,
} from './communityReports';

const PHOTO_BUCKET = 'report-photos';

function dataUrlToBlob(dataUrl: string) {
  const [metadata, base64] = dataUrl.split(',');
  if (!metadata || !base64) throw new Error('Format foto tidak valid');
  const mimeType = metadata.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  return { blob: new Blob([bytes], { type: mimeType }), mimeType };
}

function extensionForMimeType(mimeType: string) {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return 'jpg';
}

export interface SyncResult {
  syncedCount: number;
  failedCount: number;
  remainingCount: number;
}

let isSyncInProgress = false;

/**
 * Sinkronisasi seluruh laporan lokal yang berstatus pending (dibuat saat offline) ke Supabase
 */
export async function syncPendingReports(): Promise<SyncResult> {
  if (isSyncInProgress) {
    return { syncedCount: 0, failedCount: 0, remainingCount: 0 };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { syncedCount: 0, failedCount: 0, remainingCount: 0 };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { syncedCount: 0, failedCount: 0, remainingCount: 0 };
  }

  const localReports = getLocalReports();
  const pendingReports = localReports.filter((r) => r.isLocalPending || r.id.startsWith('report-'));

  if (!pendingReports.length) {
    return { syncedCount: 0, failedCount: 0, remainingCount: 0 };
  }

  isSyncInProgress = true;
  let syncedCount = 0;
  let failedCount = 0;

  try {
    const session = await ensureAnonymousSession();
    const currentLocal = getLocalReports();
    const updatedReports: CommunityReport[] = [];

    for (const report of currentLocal) {
      if (!report.isLocalPending && !report.id.startsWith('report-')) {
        updatedReports.push(report);
        continue;
      }

      try {
        let photoPath: string | null = null;
        const reportId = crypto.randomUUID();

        // 1. Upload foto jika ada
        if (report.photoDataUrl) {
          try {
            const { blob, mimeType } = dataUrlToBlob(report.photoDataUrl);
            photoPath = `${session.user.id}/${reportId}/${crypto.randomUUID()}.${extensionForMimeType(mimeType)}`;
            const { error: uploadErr } = await supabase.storage
              .from(PHOTO_BUCKET)
              .upload(photoPath, blob, { contentType: mimeType, upsert: false });

            if (uploadErr) {
              console.warn('[SyncWorker] Gagal mengunggah foto laporan, melanjutkan tanpa foto:', uploadErr);
              photoPath = null;
            }
          } catch (photoErr) {
            console.warn('[SyncWorker] Error parsing foto laporan:', photoErr);
            photoPath = null;
          }
        }

        // 2. Insert record laporan ke database Supabase
        const { data: inserted, error: insertErr } = await supabase
          .from('reports')
          .insert({
            id: reportId,
            reporter_id: session.user.id,
            category: report.category || 'lingkungan',
            description: report.description,
            latitude: report.latitude,
            longitude: report.longitude,
            photo_path: photoPath,
            photo_url: null,
            is_public: false,
            privacy_consent_at: new Date().toISOString(),
          })
          .select('id, ticket_number')
          .single();

        if (insertErr) throw insertErr;

        syncedCount++;
        updatedReports.push({
          ...report,
          id: inserted.id,
          ticketNumber: inserted.ticket_number,
          isLocalPending: false,
          updates: [
            ...report.updates,
            {
              id: `update-${Date.now()}`,
              status: 'baru',
              title: 'Tersinkronisasi ke server',
              note: 'Laporan berhasil disinkronkan ke server petugas SIHAT.',
              createdAt: new Date().toISOString(),
            },
          ],
        });
      } catch (err) {
        failedCount++;
        console.warn('[SyncWorker] Gagal menyinkronkan laporan:', report.id, err);
        updatedReports.push(report);
      }
    }

    saveLocalReports(updatedReports);

    if (syncedCount > 0 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(REPORTS_UPDATED_EVENT, { detail: updatedReports }));
    }

    return {
      syncedCount,
      failedCount,
      remainingCount: updatedReports.filter((r) => r.isLocalPending || r.id.startsWith('report-')).length,
    };
  } finally {
    isSyncInProgress = false;
  }
}

/**
 * Inisialisasi background sync worker saat aplikasi berjalan
 */
export function startAutoSyncWorker(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    void syncPendingReports();
  };

  // Coba sinkronisasi saat koneksi online terdeteksi
  window.addEventListener('online', handleOnline);

  // Jalankan interval berkala setiap 45 detik
  const intervalId = window.setInterval(() => {
    if (navigator.onLine && isSupabaseConfigured) {
      void syncPendingReports();
    }
  }, 45000);

  // Trigger satu kali saat worker dimulai
  if (navigator.onLine && isSupabaseConfigured) {
    void syncPendingReports();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    window.clearInterval(intervalId);
  };
}
