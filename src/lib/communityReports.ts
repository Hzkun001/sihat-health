import { ensureAnonymousSession, isSupabaseConfigured, supabase } from '@/lib/supabase';

export type ReportStatus = 'baru' | 'diverifikasi' | 'diproses' | 'selesai' | 'ditolak';
export type ReportPriority = 'rendah' | 'normal' | 'tinggi' | 'darurat';

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
  priority: ReportPriority;
  dueAt?: string;
  assignedTo?: string;
  isPublic: boolean;
  photoPath?: string;
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

export interface ReportInternalNote {
  id: string;
  reportId: string;
  authorId: string;
  authorName: string;
  message: string;
  createdAt: string;
}

export interface ReportAuditEvent {
  id: string;
  reportId: string;
  actorId?: string;
  actorName: string;
  action: string;
  changes: Record<string, { before: unknown; after: unknown }>;
  createdAt: string;
}

export interface StaffReportQuery {
  page?: number;
  pageSize?: number;
  status?: ReportStatus | 'semua';
  search?: string;
}

export interface StaffReportPage {
  reports: CommunityReport[];
  total: number;
  page: number;
  pageSize: number;
}

export type ReportStatusCounts = Record<ReportStatus, number>;


const REPORT_PRIORITIES: readonly ReportPriority[] = ['rendah', 'normal', 'tinggi', 'darurat'];
const STORAGE_KEY = 'sihat-community-reports-v1';
const REPORTS_UPDATED_EVENT = 'sihat:community-reports-updated';
const PHOTO_BUCKET = 'report-photos';
const REPORT_QUERY_LIMIT = 200;
const SIGNED_PHOTO_URL_TTL_SECONDS = 60 * 60;

class ReportLoadError extends Error {
  cause: unknown;

  constructor(message: string, cause: unknown) {
    super(message);
    this.name = 'ReportLoadError';
    this.cause = cause;
  }
}

let reportsCache: CommunityReport[] = [];
let reportsCacheSource: 'local' | 'public' | null = null;

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePriority(value: unknown): ReportPriority {
  return REPORT_PRIORITIES.includes(value as ReportPriority)
    ? value as ReportPriority
    : 'normal';
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
    priority: normalizePriority(item.priority),
    dueAt: typeof item.dueAt === 'string' ? item.dueAt : undefined,
    assignedTo: typeof item.assignedTo === 'string' ? item.assignedTo : undefined,
    isPublic: item.isPublic === true,
    photoPath: typeof item.photoPath === 'string' ? item.photoPath : undefined,
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

export function clearCommunityReportCache() {
  reportsCache = [];
  reportsCacheSource = null;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REPORTS_UPDATED_EVENT, { detail: [] }));
  }
}

function setReportsCache(
  reports: CommunityReport[],
  emitEvent = true,
  source: 'local' | 'public' | null = reportsCacheSource,
) {
  reportsCache = [...reports].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  reportsCacheSource = source;
  if (emitEvent && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REPORTS_UPDATED_EVENT, { detail: reportsCache }));
  }
}

function saveLocalReports(reports: CommunityReport[]) {
  if (!canUseBrowserStorage()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new ReportLoadError(
        'Penyimpanan lokal penuh. Hapus data situs atau kirim laporan setelah Supabase dikonfigurasi.',
        error,
      );
    }
    throw error;
  }

  setReportsCache(reports, true, 'local');
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
    photoPath: row.photo_path || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: normalizeStatus(row.status),
    priority: normalizePriority(row.priority),
    dueAt: row.due_at || undefined,
    assignedTo: row.assigned_to || undefined,
    isPublic: row.is_public === true,
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
  photo_path,
  status,
  is_public,
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


const STAFF_REPORT_SELECT = REPORT_SELECT.replace(
  '  updated_at,',
  '  updated_at,\n  priority,\n  due_at,\n  assigned_to,',
);

function requiresPrivacyMigration(error: { code?: string; message?: string } | null) {
  return error?.code === '42703' && error.message?.includes('is_public');
}

function requiresOperationsMigration(error: { code?: string; message?: string } | null) {
  return (
    (error?.code === '42703' && (
      error.message?.includes('priority')
      || error.message?.includes('due_at')
      || error.message?.includes('assigned_to')
    ))
    || (error?.code === 'PGRST205' && (
      error.message?.includes('report_internal_notes')
      || error.message?.includes('report_audit_log')
    ))
  );
}

async function attachSignedPhotoUrls(reports: CommunityReport[]) {
  if (!supabase) return reports;
  const paths = reports
    .map((report) => report.photoPath)
    .filter((path): path is string => Boolean(path));
  if (!paths.length) return reports;

  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(paths, SIGNED_PHOTO_URL_TTL_SECONDS);

  if (error || !data) {
    console.warn('[Reports] Gagal membuat signed URL foto:', error);
    return reports;
  }

  const signedUrls = new Map(
    data
      .filter((item) => item.path && item.signedUrl)
      .map((item) => [item.path as string, item.signedUrl as string]),
  );

  return reports.map((report) => ({
    ...report,
    photoDataUrl: report.photoPath ? signedUrls.get(report.photoPath) : report.photoDataUrl,
  }));
}

export function getCommunityReports(): CommunityReport[] {
  if (!reportsCache.length || reportsCacheSource === null) {
    const localReports = getLocalReports();
    setReportsCache(localReports, false, 'local');
  }
  return reportsCache;
}

export async function loadCommunityReports(): Promise<CommunityReport[]> {
  if (!isSupabaseConfigured || !supabase) {
    const localReports = getLocalReports();
    setReportsCache(localReports, true, 'local');
    return localReports;
  }

  const primaryResult = await supabase
    .from('reports')
    .select(REPORT_SELECT)
    .order('created_at', { ascending: false })
    .limit(REPORT_QUERY_LIMIT);
  const data = primaryResult.data as any[] | null;
  const error = primaryResult.error;

  if (requiresPrivacyMigration(error)) {
    throw new Error('Migration privasi laporan belum dijalankan. Terapkan migration 202606060002_report_privacy.sql.');
  }
  if (error) throw error;

  const reports = await attachSignedPhotoUrls((data ?? []).map(mapDatabaseReport));
  setReportsCache(reports, true, 'public');
  return reports;
}

function sanitizeSearchQuery(value: string) {
  return value
    .trim()
    .replace(/[,%()]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 120);
}

export async function loadStaffReportsPage(
  options: StaffReportQuery = {},
): Promise<StaffReportPage> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');

  const pageSize = Math.min(Math.max(options.pageSize ?? 20, 5), 100);
  const page = Math.max(options.page ?? 1, 1);
  const from = (page - 1) * pageSize;
  const search = sanitizeSearchQuery(options.search ?? '');

  let query = supabase
    .from('reports')
    .select(STAFF_REPORT_SELECT, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (options.status && options.status !== 'semua') {
    query = query.eq('status', options.status);
  }

  if (search) {
    query = query.or(
      `ticket_number.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query;
  if (requiresOperationsMigration(error)) {
    throw new Error(
      'Migration operasional belum dijalankan. Terapkan migration 202606060003_report_operations.sql.',
    );
  }
  if (error) throw error;

  const reports = await attachSignedPhotoUrls((data ?? []).map(mapDatabaseReport));
  return { reports, total: count ?? 0, page, pageSize };
}

export async function loadReportStatusCounts(): Promise<ReportStatusCounts> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  const client = supabase;

  const statuses: ReportStatus[] = ['baru', 'diverifikasi', 'diproses', 'selesai', 'ditolak'];
  const results = await Promise.all(
    statuses.map(async (status) => {
      const { count, error } = await client
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', status);
      if (error) throw error;
      return [status, count ?? 0] as const;
    }),
  );

  return Object.fromEntries(results) as ReportStatusCounts;
}

export async function loadStaffProfiles(): Promise<StaffProfile[]> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');

  const { data, error } = await supabase
    .from('staff_profiles')
    .select('user_id, display_name, role')
    .order('display_name');

  if (error) throw error;
  return (data ?? []).map((profile) => ({
    userId: profile.user_id,
    displayName: profile.display_name,
    role: profile.role,
  }));
}

export async function loadReportInternalNotes(reportId: string): Promise<ReportInternalNote[]> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');

  const [{ data, error }, profiles] = await Promise.all([
    supabase
      .from('report_internal_notes')
      .select('id, report_id, author_id, message, created_at')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false }),
    loadStaffProfiles(),
  ]);

  if (requiresOperationsMigration(error)) {
    throw new Error(
      'Migration operasional belum dijalankan. Terapkan migration 202606060003_report_operations.sql.',
    );
  }
  if (error) throw error;

  const names = new Map(profiles.map((profile) => [profile.userId, profile.displayName]));
  return (data ?? []).map((note) => ({
    id: note.id,
    reportId: note.report_id,
    authorId: note.author_id,
    authorName: names.get(note.author_id) ?? 'Petugas',
    message: note.message,
    createdAt: note.created_at,
  }));
}

export async function loadReportAuditLog(reportId: string): Promise<ReportAuditEvent[]> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');

  const [{ data, error }, profiles] = await Promise.all([
    supabase
      .from('report_audit_log')
      .select('id, report_id, actor_id, action, changes, created_at')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false })
      .limit(100),
    loadStaffProfiles(),
  ]);

  if (requiresOperationsMigration(error)) {
    throw new Error(
      'Migration operasional belum dijalankan. Terapkan migration 202606060003_report_operations.sql.',
    );
  }
  if (error) throw error;

  const names = new Map(profiles.map((profile) => [profile.userId, profile.displayName]));
  return (data ?? []).map((event) => ({
    id: event.id,
    reportId: event.report_id,
    actorId: event.actor_id || undefined,
    actorName: event.actor_id ? names.get(event.actor_id) ?? 'Petugas' : 'Sistem',
    action: event.action,
    changes: event.changes as ReportAuditEvent['changes'],
    createdAt: event.created_at,
  }));
}

export async function loadCommunityReportById(reportId: string): Promise<CommunityReport | null> {
  if (!isSupabaseConfigured || !supabase) return getCommunityReportById(reportId);

  const primaryResult = await supabase
    .from('reports')
    .select(REPORT_SELECT)
    .eq('id', reportId)
    .maybeSingle();
  const data = primaryResult.data as any;
  const error = primaryResult.error;

  if (requiresPrivacyMigration(error)) {
    throw new Error(
      'Migration privasi belum dijalankan. Terapkan migration 202606060002_report_privacy.sql.',
    );
  }

  if (error) {
    console.warn(`[Reports] Gagal memuat laporan ${reportId}:`, error);
    throw new ReportLoadError(`Gagal memuat laporan ${reportId}.`, error);
  }

  if (!data) return null;
  const [report] = await attachSignedPhotoUrls([mapDatabaseReport(data)]);
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
    priority: 'normal',
    isPublic: false,
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
  let reportInserted = false;

  try {
    const session = await ensureAnonymousSession();
    const reportId = crypto.randomUUID();
    if (input.photoDataUrl) {
      const { blob, mimeType } = dataUrlToBlob(input.photoDataUrl);
      photoPath = `${session.user.id}/${reportId}/${crypto.randomUUID()}.${extensionForMimeType(mimeType)}`;
      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(photoPath, blob, { contentType: mimeType, upsert: false });

      if (uploadError) throw uploadError;
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
        photo_url: null,
        is_public: false,
        privacy_consent_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (requiresPrivacyMigration(insertError)) {
      throw new Error('Migration privasi laporan belum dijalankan. Terapkan migration 202606060002_report_privacy.sql.');
    }
    if (insertError) throw insertError;
    reportInserted = true;

    const report = await loadCommunityReportById(inserted.id);
    if (!report) throw new Error('Laporan berhasil dikirim tetapi gagal dimuat kembali');
    return report;
  } catch (error) {
    if (photoPath && !reportInserted) {
      const { error: cleanupError } = await supabase.storage.from(PHOTO_BUCKET).remove([photoPath]);
      if (cleanupError) console.warn('[Reports] Gagal membersihkan foto setelah insert gagal:', cleanupError);
    }

    if (error instanceof Error && error.message?.toLowerCase().includes('load failed')) {
      const connectionError = new Error(
        'Gagal mengirim laporan karena request ke Supabase tidak bisa dijangkau. Periksa VITE_SUPABASE_URL, CORS/allowed origins, dan aktifkan Anonymous Sign-Ins.',
      );
      Object.defineProperty(connectionError, 'cause', { value: error });
      throw connectionError;
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
  clearCommunityReportCache();
  if (supabase) await supabase.auth.signOut();
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  rejectionReason?: string,
) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');

  const { error } = await supabase.rpc('update_report_status', {
    p_report_id: reportId,
    p_status: status,
    p_rejection_reason: rejectionReason?.trim() || null,
  });

  if (error) throw error;
  return loadCommunityReportById(reportId);
}

export async function updateReportPublication(reportId: string, isPublic: boolean) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');

  const { error } = await supabase.rpc('update_report_publication', {
    p_report_id: reportId,
    p_is_public: isPublic,
  });

  if (error) throw error;
  return loadCommunityReportById(reportId);
}

export async function updateReportOperations(
  reportId: string,
  changes: {
    priority?: ReportPriority;
    assignedTo?: string | null;
    dueAt?: string | null;
  },
) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');

  const { error } = await supabase.rpc('update_report_operations', {
    p_report_id: reportId,
    p_priority: changes.priority ?? null,
    p_assigned_to: changes.assignedTo ?? null,
    p_due_at: changes.dueAt ?? null,
    p_clear_priority: false,
    p_clear_assigned_to: 'assignedTo' in changes && changes.assignedTo === null,
    p_clear_due_at: 'dueAt' in changes && changes.dueAt === null,
  });

  if (error) throw error;
}

export async function addReportInternalNote(reportId: string, message: string) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user.id;
  if (!userId) throw new Error('Sesi petugas tidak ditemukan');

  const { error } = await supabase.from('report_internal_notes').insert({
    report_id: reportId,
    author_id: userId,
    message: message.trim(),
  });

  if (requiresOperationsMigration(error)) {
    throw new Error(
      'Migration operasional belum dijalankan. Terapkan migration 202606060003_report_operations.sql.',
    );
  }
  if (error) throw error;
}

export function subscribeToStaffReportChanges(listener: () => void) {
  if (!supabase) return () => undefined;
  const client = supabase;

  const channel = client
    .channel(`staff-reports-${createId('subscription')}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, listener)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'report_comments' }, listener)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'report_updates' }, listener)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'report_internal_notes' }, listener)
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
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

export function reportsToFeatureCollection(
  reports = getCommunityReports(),
  includeInternal = false,
): GeoJSON.FeatureCollection {
  const visibleReports = includeInternal ? reports : reports.filter((report) => report.isPublic);
  return {
    type: 'FeatureCollection',
    features: visibleReports.map((report) => ({
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
        isPublic: report.isPublic,
        hasPhoto: Boolean(report.photoDataUrl),
        photoDataUrl: report.photoDataUrl ?? '',
        commentsCount: report.comments.length,
      },
    })),
  };
}
