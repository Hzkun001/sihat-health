import { ensureAnonymousSession, isSupabaseConfigured, supabase } from '@/lib/supabase';

export type ReportStatus = 'baru' | 'diverifikasi' | 'diproses' | 'selesai' | 'ditolak';

export interface ReportComment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
}

export interface ReportUpdate {
  id: string;
  status: ReportStatus;
  title: string;
  note?: string;
  createdAt: string;
}

export interface CommunityReport {
  id: string;
  ticketNumber?: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  photoDataUrl?: string;
  createdAt: string;
  updatedAt?: string;
  status: ReportStatus;
  comments: ReportComment[];
  updates: ReportUpdate[];
}

export interface NewCommunityReportInput {
  description: string;
  latitude: number;
  longitude: number;
  photoDataUrl?: string | null;
  category?: string;
}

export interface StaffProfile {
  userId: string;
  displayName: string;
  role: 'admin' | 'verifikator' | 'petugas';
}

const STORAGE_KEY = 'sihat-community-reports-v1';
const REPORTS_UPDATED_EVENT = 'sihat:community-reports-updated';
const PHOTO_BUCKET = 'report-photos';

let reportsCache: CommunityReport[] = [];

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeStatus(value: unknown): ReportStatus {
  if (
    value === 'diverifikasi'
    || value === 'diproses'
    || value === 'selesai'
    || value === 'ditolak'
  ) {
    return value;
  }
  if (value === 'ditinjau') return 'diverifikasi';
  return 'baru';
}

function normalizeReport(value: unknown): CommunityReport | null {
  const item = value as Partial<CommunityReport> | null;
  if (!item || typeof item !== 'object') return null;
  if (typeof item.description !== 'string') return null;
  if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') return null;
  if (!Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)) return null;

  return {
    id: typeof item.id === 'string' ? item.id : createId('report'),
    ticketNumber: typeof item.ticketNumber === 'string' ? item.ticketNumber : undefined,
    category: typeof item.category === 'string' && item.category.trim() ? item.category : 'lingkungan',
    description: item.description,
    latitude: item.latitude,
    longitude: item.longitude,
    photoDataUrl: typeof item.photoDataUrl === 'string' ? item.photoDataUrl : undefined,
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : undefined,
    status: normalizeStatus(item.status),
    comments: Array.isArray(item.comments)
      ? item.comments
        .map((comment) => {
          const normalized = comment as Partial<ReportComment>;
          if (typeof normalized.message !== 'string' || !normalized.message.trim()) return null;
          return {
            id: typeof normalized.id === 'string' ? normalized.id : createId('comment'),
            author: typeof normalized.author === 'string' && normalized.author.trim() ? normalized.author : 'Warga',
            message: normalized.message,
            createdAt: typeof normalized.createdAt === 'string' ? normalized.createdAt : new Date().toISOString(),
          };
        })
        .filter((comment): comment is ReportComment => Boolean(comment))
      : [],
    updates: Array.isArray(item.updates)
      ? item.updates
        .map<ReportUpdate | null>((update) => {
          const normalized = update as Partial<ReportUpdate>;
          if (typeof normalized.title !== 'string' || !normalized.title.trim()) return null;
          return {
            id: typeof normalized.id === 'string' ? normalized.id : createId('update'),
            status: normalizeStatus(normalized.status),
            title: normalized.title,
            note: typeof normalized.note === 'string' ? normalized.note : undefined,
            createdAt: typeof normalized.createdAt === 'string' ? normalized.createdAt : new Date().toISOString(),
          };
        })
        .filter((update): update is ReportUpdate => update !== null)
      : [],
  };
}

function getLocalReports(): CommunityReport[] {
  if (!canUseBrowserStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeReport)
      .filter((report): report is CommunityReport => Boolean(report))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  } catch (error) {
    console.warn('[Reports] Gagal membaca laporan lokal:', error);
    return [];
  }
}

function setReportsCache(reports: CommunityReport[], emitEvent = true) {
  reportsCache = [...reports].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  if (emitEvent && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REPORTS_UPDATED_EVENT, { detail: reportsCache }));
  }
}

function saveLocalReports(reports: CommunityReport[]) {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  setReportsCache(reports);
}

function mapDatabaseReport(row: any): CommunityReport {
  const comments = Array.isArray(row.report_comments) ? row.report_comments : [];
  const updates = Array.isArray(row.report_updates) ? row.report_updates : [];

  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    category: row.category || 'lingkungan',
    description: row.description,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    photoDataUrl: row.photo_url || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: normalizeStatus(row.status),
    comments: comments
      .map((comment: any) => ({
        id: comment.id,
        author: comment.author_name || 'Warga',
        message: comment.message,
        createdAt: comment.created_at,
      }))
      .sort((a: ReportComment, b: ReportComment) => Date.parse(a.createdAt) - Date.parse(b.createdAt)),
    updates: updates
      .map((update: any) => ({
        id: update.id,
        status: normalizeStatus(update.status),
        title: update.title,
        note: update.note || undefined,
        createdAt: update.created_at,
      }))
      .sort((a: ReportUpdate, b: ReportUpdate) => Date.parse(a.createdAt) - Date.parse(b.createdAt)),
  };
}

const REPORT_SELECT = `
  id,
  ticket_number,
  category,
  description,
  latitude,
  longitude,
  photo_url,
  status,
  created_at,
  updated_at,
  report_comments (
    id,
    author_name,
    message,
    created_at
  ),
  report_updates (
    id,
    status,
    title,
    note,
    created_at
  )
`;

export function getCommunityReports(): CommunityReport[] {
  if (!reportsCache.length) reportsCache = getLocalReports();
  return reportsCache;
}

export async function loadCommunityReports(): Promise<CommunityReport[]> {
  if (!isSupabaseConfigured || !supabase) {
    const localReports = getLocalReports();
    setReportsCache(localReports);
    return localReports;
  }

  const { data, error } = await supabase
    .from('reports')
    .select(REPORT_SELECT)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[Reports] Gagal memuat laporan Supabase:', error);
    return getCommunityReports();
  }

  const reports = (data ?? []).map(mapDatabaseReport);
  setReportsCache(reports);
  return reports;
}

export async function loadCommunityReportById(reportId: string): Promise<CommunityReport | null> {
  if (!isSupabaseConfigured || !supabase) return getCommunityReportById(reportId);

  const { data, error } = await supabase
    .from('reports')
    .select(REPORT_SELECT)
    .eq('id', reportId)
    .maybeSingle();

  if (error) {
    console.warn(`[Reports] Gagal memuat laporan ${reportId}:`, error);
    return getCommunityReportById(reportId);
  }

  if (!data) return null;
  const report = mapDatabaseReport(data);
  setReportsCache([report, ...getCommunityReports().filter((item) => item.id !== report.id)], false);
  return report;
}

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

function addLocalCommunityReport(input: NewCommunityReportInput): CommunityReport {
  const report: CommunityReport = {
    id: createId('report'),
    category: input.category?.trim() || 'lingkungan',
    description: input.description.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    photoDataUrl: input.photoDataUrl || undefined,
    createdAt: new Date().toISOString(),
    status: 'baru',
    comments: [],
    updates: [
      {
        id: createId('update'),
        status: 'baru',
        title: 'Laporan diterima',
        note: 'Laporan tersimpan secara lokal dan menunggu sinkronisasi.',
        createdAt: new Date().toISOString(),
      },
    ],
  };

  saveLocalReports([report, ...getLocalReports()]);
  return report;
}

export async function addCommunityReport(input: NewCommunityReportInput): Promise<CommunityReport> {
  if (!isSupabaseConfigured || !supabase) return addLocalCommunityReport(input);

  let photoPath: string | null = null;

  try {
    const session = await ensureAnonymousSession();
    const reportId = crypto.randomUUID();
    let photoUrl: string | null = null;

    if (input.photoDataUrl) {
      const { blob, mimeType } = dataUrlToBlob(input.photoDataUrl);
      photoPath = `${session.user.id}/${reportId}/${crypto.randomUUID()}.${extensionForMimeType(mimeType)}`;
      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(photoPath, blob, { contentType: mimeType, upsert: false });

      if (uploadError) throw uploadError;
      photoUrl = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(photoPath).data.publicUrl;
    }

    const { data: inserted, error: insertError } = await supabase
      .from('reports')
      .insert({
        id: reportId,
        reporter_id: session.user.id,
        category: input.category?.trim() || 'lingkungan',
        description: input.description.trim(),
        latitude: input.latitude,
        longitude: input.longitude,
        photo_path: photoPath,
        photo_url: photoUrl,
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    const report = await loadCommunityReportById(inserted.id);
    if (!report) throw new Error('Laporan berhasil dikirim tetapi gagal dimuat kembali');
    return report;
  } catch (error) {
    if (photoPath) {
      const { error: cleanupError } = await supabase.storage.from(PHOTO_BUCKET).remove([photoPath]);
      if (cleanupError) console.warn('[Reports] Gagal membersihkan foto setelah insert gagal:', cleanupError);
    }

    if (error instanceof Error && error.message?.toLowerCase().includes('load failed')) {
      throw new Error(
        'Gagal mengirim laporan karena request ke Supabase tidak bisa dijangkau. Periksa VITE_SUPABASE_URL, CORS/allowed origins, dan aktifkan Anonymous Sign-Ins.',
      );
    }

    throw error;
  }
}

export function getCommunityReportById(reportId: string): CommunityReport | null {
  return getCommunityReports().find((report) => report.id === reportId) ?? null;
}

function addLocalReportComment(reportId: string, message: string, author = 'Warga') {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) return getCommunityReportById(reportId);

  let updatedReport: CommunityReport | null = null;
  const nextReports = getLocalReports().map((report) => {
    if (report.id !== reportId) return report;
    updatedReport = {
      ...report,
      comments: [
        ...report.comments,
        {
          id: createId('comment'),
          author: author.trim() || 'Warga',
          message: trimmedMessage,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    return updatedReport;
  });

  saveLocalReports(nextReports);
  return updatedReport;
}

export async function addReportComment(
  reportId: string,
  message: string,
  author = 'Warga',
): Promise<CommunityReport | null> {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) return getCommunityReportById(reportId);
  if (!isSupabaseConfigured || !supabase) return addLocalReportComment(reportId, trimmedMessage, author);

  const session = await ensureAnonymousSession();
  const { error } = await supabase.from('report_comments').insert({
    report_id: reportId,
    author_id: session.user.id,
    author_name: author.trim() || 'Warga',
    message: trimmedMessage,
  });

  if (error) throw error;
  return loadCommunityReportById(reportId);
}

export async function signInStaff(email: string, password: string): Promise<StaffProfile> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Login petugas gagal');

  const profile = await getCurrentStaffProfile();
  if (!profile) {
    await supabase.auth.signOut();
    throw new Error('Akun ini belum terdaftar sebagai petugas SIHAT');
  }
  return profile;
}

export async function getCurrentStaffProfile(): Promise<StaffProfile | null> {
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session || session.user.is_anonymous) return null;

  const { data, error } = await supabase
    .from('staff_profiles')
    .select('user_id, display_name, role')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    console.warn('[Reports] Gagal memuat profil petugas:', error);
    return null;
  }

  return data
    ? {
      userId: data.user_id,
      displayName: data.display_name,
      role: data.role,
    }
    : null;
}

export async function signOutStaff() {
  if (supabase) await supabase.auth.signOut();
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  rejectionReason?: string,
) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');

  const { error } = await supabase
    .from('reports')
    .update({
      status,
      rejection_reason: status === 'ditolak' ? rejectionReason?.trim() || 'Tidak memenuhi kriteria laporan' : null,
    })
    .eq('id', reportId);

  if (error) throw error;
  return loadCommunityReportById(reportId);
}

export function subscribeToCommunityReports(listener: (reports: CommunityReport[]) => void) {
  if (typeof window === 'undefined') return () => undefined;

  const notify = () => listener(getCommunityReports());
  const refresh = () => {
    void loadCommunityReports().then(listener);
  };

  window.addEventListener(REPORTS_UPDATED_EVENT, notify);
  window.addEventListener('storage', refresh);
  refresh();

  const channel = supabase
    ?.channel(`community-reports-${createId('subscription')}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, refresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'report_comments' }, refresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'report_updates' }, refresh)
    .subscribe();

  return () => {
    window.removeEventListener(REPORTS_UPDATED_EVENT, notify);
    window.removeEventListener('storage', refresh);
    if (channel && supabase) void supabase.removeChannel(channel);
  };
}

export function reportsToFeatureCollection(reports = getCommunityReports()): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: reports.map((report) => ({
      type: 'Feature',
      id: report.id,
      geometry: {
        type: 'Point',
        coordinates: [report.longitude, report.latitude],
      },
      properties: {
        id: report.id,
        ticketNumber: report.ticketNumber ?? '',
        description: report.description,
        createdAt: report.createdAt,
        status: report.status,
        hasPhoto: Boolean(report.photoDataUrl),
        photoDataUrl: report.photoDataUrl ?? '',
        commentsCount: report.comments.length,
      },
    })),
  };
}
