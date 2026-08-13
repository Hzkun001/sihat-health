import {
  addReportInternalNote,
  getCurrentStaffProfile,
  loadReportAuditLog,
  loadReportInternalNotes,
  loadReportStatusCounts,
  loadStaffProfiles,
  loadStaffReportsPage,
  signInStaff,
  signOutStaff,
  subscribeToStaffReportChanges,
  updateReportOperations,
  updateReportPublication,
  updateReportStatus,
  type CommunityReport,
  type ReportAuditEvent,
  type ReportInternalNote,
  type ReportPriority,
  type ReportStatus,
  type ReportStatusCounts,
  type StaffProfile,
} from '@/lib/communityReports';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  Camera,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DatabaseBackup,
  Download,
  ExternalLink,
  FileJson,
  Loader2,
  LockKeyhole,
  LogOut,
  MapPin,
  MessageCircle,
  Globe2,
  History,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  StickyNote,
  UserRound,
  X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const STATUS_OPTIONS: Array<{ value: ReportStatus; label: string }> = [
  { value: 'baru', label: 'Baru' },
  { value: 'diverifikasi', label: 'Diverifikasi' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'ditolak', label: 'Ditolak' },
];

const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((status) => [status.value, status.label]),
) as Record<ReportStatus, string>;

const STATUS_STYLES: Record<ReportStatus, string> = {
  baru: 'bg-amber-50 text-amber-700',
  diverifikasi: 'bg-teal-50 text-teal-700',
  diproses: 'bg-green-50 text-green-700',
  selesai: 'bg-emerald-50 text-emerald-700',
  ditolak: 'bg-red-50 text-red-700',
};

const PRIORITY_OPTIONS: Array<{ value: ReportPriority; label: string }> = [
  { value: 'rendah', label: 'Rendah' },
  { value: 'normal', label: 'Normal' },
  { value: 'tinggi', label: 'Tinggi' },
  { value: 'darurat', label: 'Darurat' },
];

const PRIORITY_STYLES: Record<ReportPriority, string> = {
  rendah: 'bg-surface-100 text-ink-600',
  normal: 'bg-blue-50 text-blue-700',
  tinggi: 'bg-amber-50 text-amber-700',
  darurat: 'bg-red-50 text-red-700',
};

const EMPTY_COUNTS: ReportStatusCounts = {
  baru: 0,
  diverifikasi: 0,
  diproses: 0,
  selesai: 0,
  ditolak: 0,
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatAuditField(field: string) {
  const labels: Record<string, string> = {
    status: 'Status',
    priority: 'Prioritas',
    assigned_to: 'Petugas',
    due_at: 'Tenggat SLA',
    is_public: 'Publikasi',
    rejection_reason: 'Alasan penolakan',
  };
  return labels[field] ?? field;
}

function formatAuditValue(value: unknown, staffProfiles: StaffProfile[]) {
  if (value === null || value === undefined || value === '') return 'Kosong';
  if (typeof value === 'boolean') return value ? 'Publik' : 'Internal';
  const staff = staffProfiles.find((profile) => profile.userId === value);
  if (staff) return staff.displayName;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return formatDate(value);
  return String(value);
}

function toDateTimeLocalValue(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function escapeCsv(value: unknown) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadFile(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function getSupabaseBackupsUrl() {
  const projectRef = import.meta.env.VITE_SUPABASE_URL
    ?.replace(/^https?:\/\//, '')
    .split('.')[0];
  return projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/database/backups`
    : 'https://supabase.com/dashboard';
}

export function StaffDashboardPage() {
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [reportCounts, setReportCounts] = useState<ReportStatusCounts>(EMPTY_COUNTS);
  const [totalReports, setTotalReports] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'semua'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [rejectionReport, setRejectionReport] = useState<CommunityReport | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [operationId, setOperationId] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState<ReportInternalNote[]>([]);
  const [auditEvents, setAuditEvents] = useState<ReportAuditEvent[]>([]);
  const [noteMessage, setNoteMessage] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const refreshReports = useCallback(async () => {
    const [reportPage, counts] = await Promise.all([
      loadStaffReportsPage({
        page,
        pageSize,
        status: statusFilter,
        search: searchQuery,
      }),
      loadReportStatusCounts(),
    ]);
    setReports(reportPage.reports);
    setTotalReports(reportPage.total);
    setReportCounts(counts);
  }, [page, searchQuery, statusFilter]);

  const refreshSelectedReportData = useCallback(async (reportId: string) => {
    const [notes, audit] = await Promise.all([
      loadReportInternalNotes(reportId),
      loadReportAuditLog(reportId),
    ]);
    setInternalNotes(notes);
    setAuditEvents(audit);
  }, []);

  useEffect(() => {
    let active = true;

    void getCurrentStaffProfile()
      .then((profile) => {
        if (!active) return;
        setStaff(profile);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!active) return;
        console.warn('[Reports] Gagal memeriksa sesi petugas:', error);
        setLoginError('Sesi petugas gagal diperiksa. Silakan coba masuk kembali.');
        setStaff(null);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!staff) return;
    void loadStaffProfiles().then(setStaffProfiles).catch((error) => {
      console.warn('[Reports] Gagal memuat daftar petugas:', error);
    });
  }, [staff]);

  useEffect(() => {
    if (!staff) return;
    const timer = window.setTimeout(() => {
      void refreshReports().catch((error) => {
        console.warn('[Reports] Gagal memuat halaman laporan:', error);
        setActionError(error instanceof Error ? error.message : 'Laporan gagal dimuat.');
      });
    }, searchQuery ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [refreshReports, searchQuery, staff]);

  useEffect(() => {
    if (!staff) return;
    return subscribeToStaffReportChanges(() => {
      void refreshReports();
      if (selectedReportId) void refreshSelectedReportData(selectedReportId);
    });
  }, [refreshReports, refreshSelectedReportData, selectedReportId, staff]);

  useEffect(() => {
    if (!selectedReportId) {
      setInternalNotes([]);
      setAuditEvents([]);
      return;
    }
    void refreshSelectedReportData(selectedReportId).catch((error) => {
      console.warn('[Reports] Gagal memuat data internal laporan:', error);
      setActionError(error instanceof Error ? error.message : 'Data internal gagal dimuat.');
    });
  }, [refreshSelectedReportData, selectedReportId]);

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? null,
    [reports, selectedReportId],
  );
  const totalPages = Math.max(Math.ceil(totalReports / pageSize), 1);
  const selectedReportCanBePublished = Boolean(
    selectedReport
    && !selectedReport.isPublic
    && ['diverifikasi', 'diproses', 'selesai'].includes(selectedReport.status),
  );

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    try {
      const profile = await signInStaff(email, password);
      setStaff(profile);
      setStaffProfiles(await loadStaffProfiles());
      await refreshReports();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login petugas gagal');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const applyStatusChange = async (
    report: CommunityReport,
    status: ReportStatus,
    reason?: string,
  ) => {
    setUpdatingId(report.id);
    setActionError('');
    try {
      await updateReportStatus(report.id, status, reason);
      await refreshReports();
      return true;
    } catch (error) {
      console.warn('[Reports] Gagal memperbarui status:', error);
      setActionError('Status gagal diperbarui. Periksa koneksi dan hak akses akun petugas.');
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = (report: CommunityReport, status: ReportStatus) => {
    if (status === 'ditolak') {
      setRejectionReport(report);
      setRejectionReason('');
      return;
    }
    void applyStatusChange(report, status);
  };

  const handleReject = async (event: FormEvent) => {
    event.preventDefault();
    if (!rejectionReport || !rejectionReason.trim()) return;
    const updated = await applyStatusChange(rejectionReport, 'ditolak', rejectionReason);
    if (updated) {
      setRejectionReport(null);
      setRejectionReason('');
    }
  };

  const handleLogout = async () => {
    await signOutStaff();
    setStaff(null);
    setReports([]);
    setPassword('');
    setSelectedReportId(null);
  };

  const handlePublicationChange = async (report: CommunityReport) => {
    setPublishingId(report.id);
    setActionError('');
    try {
      await updateReportPublication(report.id, !report.isPublic);
      await refreshReports();
    } catch (error) {
      console.warn('[Reports] Gagal mengubah publikasi:', error);
      setActionError('Status publikasi gagal diperbarui. Pastikan migration privasi sudah dijalankan.');
    } finally {
      setPublishingId(null);
    }
  };

  const handleOperationsChange = async (
    report: CommunityReport,
    changes: Parameters<typeof updateReportOperations>[1],
  ) => {
    setOperationId(report.id);
    setActionError('');
    try {
      await updateReportOperations(report.id, changes);
      await refreshReports();
      await refreshSelectedReportData(report.id);
    } catch (error) {
      console.warn('[Reports] Gagal memperbarui operasional:', error);
      setActionError(error instanceof Error ? error.message : 'Data operasional gagal diperbarui.');
    } finally {
      setOperationId(null);
    }
  };

  const handleAddInternalNote = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedReport || noteMessage.trim().length < 2) return;
    setIsAddingNote(true);
    setActionError('');
    try {
      await addReportInternalNote(selectedReport.id, noteMessage);
      setNoteMessage('');
      await refreshSelectedReportData(selectedReport.id);
    } catch (error) {
      console.warn('[Reports] Gagal menambah catatan internal:', error);
      setActionError(error instanceof Error ? error.message : 'Catatan internal gagal disimpan.');
    } finally {
      setIsAddingNote(false);
    }
  };

  const exportReports = (format: 'csv' | 'json') => {
    const date = new Date().toISOString().slice(0, 10);
    if (format === 'json') {
      downloadFile(
        JSON.stringify({ exportedAt: new Date().toISOString(), reports }, null, 2),
        `sihat-laporan-${date}.json`,
        'application/json',
      );
      return;
    }

    const rows = reports.map((report) => [
      report.ticketNumber ?? report.id,
      report.status,
      report.category,
      report.description,
      report.latitude,
      report.longitude,
      report.createdAt,
      report.updatedAt ?? '',
      report.comments.length,
      report.photoDataUrl ?? '',
    ]);
    const csv = [
      ['nomor_tiket', 'status', 'kategori', 'deskripsi', 'latitude', 'longitude', 'dibuat', 'diperbarui', 'jumlah_komentar', 'url_foto'],
      ...rows,
    ].map((row) => row.map(escapeCsv).join(',')).join('\n');
    downloadFile(csv, `sihat-laporan-${date}.csv`, 'text/csv;charset=utf-8');
  };

  if (!isSupabaseConfigured) {
    return (
      <main className="min-h-screen bg-surface-0 px-6 pb-20 pt-32">
        <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-8">
          <h1 className="text-2xl font-bold text-ink-900">Supabase belum dikonfigurasi</h1>
          <p className="mt-3 leading-7 text-ink-700">
            Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` di `.env.local`, lalu jalankan migration laporan.
          </p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-0">
        <Loader2 size={24} className="animate-spin text-brand-green" />
      </main>
    );
  }

  if (!staff) {
    return (
      <main className="min-h-screen bg-surface-0 px-6 pb-20 pt-32">
        <form
          onSubmit={handleLogin}
          className="mx-auto max-w-md rounded-xl border border-surface-200 bg-white p-7 shadow-[0_18px_48px_rgba(15,23,42,0.07)]"
        >
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-mint text-brand-green">
            <LockKeyhole size={22} />
          </div>
          <h1 className="text-2xl font-bold text-ink-900">Portal Petugas SIHAT</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-ink-500">Masuk menggunakan akun petugas Supabase.</p>

          <div className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-ink-900">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-lg border border-surface-200 bg-surface-alt px-4 outline-none focus:border-brand-green"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-ink-900">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-lg border border-surface-200 bg-surface-alt px-4 outline-none focus:border-brand-green"
                required
              />
            </label>
          </div>

          {loginError && <p className="mt-4 text-sm font-semibold text-red-600">{loginError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-green font-bold text-white disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={17} className="animate-spin" />}
            Masuk
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-0 px-4 pb-20 pt-28 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-mint px-3 py-1.5 text-xs font-bold uppercase text-brand-green">
              <ShieldCheck size={15} />
              {staff.role}
            </div>
            <h1 className="text-3xl font-bold text-ink-900">Operasional laporan</h1>
            <p className="mt-2 text-ink-500">Halo, {staff.displayName}. Verifikasi, tindak lanjuti, dan pantau laporan warga.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refreshReports()}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-200 bg-white text-ink-700"
              title="Muat ulang laporan"
              aria-label="Muat ulang laporan"
            >
              <RefreshCw size={17} />
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 text-sm font-bold text-ink-700"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => {
                setStatusFilter(status.value);
                setPage(1);
              }}
              className={`flex min-h-24 items-end justify-between rounded-lg border p-4 text-left transition-colors ${
                statusFilter === status.value
                  ? 'border-brand-green bg-brand-mint'
                  : 'border-surface-200 bg-white hover:border-brand-green/40'
              }`}
            >
              <span className="text-sm font-bold text-ink-700">{status.label}</span>
              <span className="text-3xl font-bold text-ink-900">{reportCounts[status.value]}</span>
            </button>
          ))}
        </section>

        <section className="mb-6 grid gap-4 border-y border-surface-200 py-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="relative max-w-xl">
              <Search size={18} className="pointer-events-none absolute left-4 top-3.5 text-ink-500" />
              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari nomor tiket, deskripsi, atau kategori"
                className="h-11 w-full rounded-lg border border-surface-200 bg-white pl-11 pr-4 text-sm font-semibold text-ink-900 outline-none focus:border-brand-green"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('semua');
                  setPage(1);
                }}
                className={`h-8 rounded-lg px-3 text-xs font-bold ${
                  statusFilter === 'semua' ? 'bg-brand-green text-white' : 'bg-white text-ink-700 ring-1 ring-surface-200'
                }`}
              >
                Semua ({Object.values(reportCounts).reduce((sum, count) => sum + count, 0)})
              </button>
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status.value);
                    setPage(1);
                  }}
                  className={`h-8 rounded-lg px-3 text-xs font-bold ${
                    statusFilter === status.value ? 'bg-brand-green text-white' : 'bg-white text-ink-700 ring-1 ring-surface-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => exportReports('csv')}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 text-sm font-bold text-ink-700"
            >
              <Download size={16} />
              CSV
            </button>
            <button
              type="button"
              onClick={() => exportReports('json')}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 text-sm font-bold text-ink-700"
            >
              <FileJson size={16} />
              JSON
            </button>
          </div>
        </section>

        {actionError && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {actionError}
            <button type="button" onClick={() => setActionError('')} aria-label="Tutup pesan">
              <X size={17} />
            </button>
          </div>
        )}

        <div className={`grid gap-5 ${selectedReport ? 'xl:grid-cols-[minmax(0,1fr)_400px]' : ''}`}>
          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-ink-700">
                {totalReports} laporan ditemukan - halaman {page} dari {totalPages}
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-surface-200 bg-white">
              {reports.map((report, index) => (
                <article
                  key={report.id}
                  className={`grid gap-4 p-4 md:grid-cols-[1fr_180px] md:items-center ${
                    index ? 'border-t border-surface-200' : ''
                  } ${selectedReportId === report.id ? 'bg-brand-mint/50' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedReportId(report.id)}
                    className="min-w-0 text-left"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="text-brand-green">{report.ticketNumber ?? report.id}</span>
                      <span className={`rounded-md px-2 py-1 ${STATUS_STYLES[report.status]}`}>
                        {STATUS_LABELS[report.status]}
                      </span>
                      <span className={`rounded-md px-2 py-1 ${PRIORITY_STYLES[report.priority]}`}>
                        {PRIORITY_OPTIONS.find((item) => item.value === report.priority)?.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${
                        report.isPublic ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-100 text-ink-600'
                      }`}>
                        {report.isPublic ? <Globe2 size={12} /> : <Lock size={12} />}
                        {report.isPublic ? 'Publik' : 'Internal'}
                      </span>
                      <span className="text-ink-500">{formatDate(report.createdAt)}</span>
                    </div>
                    <p className="line-clamp-2 font-semibold leading-6 text-ink-900">{report.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-ink-500">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} />
                        {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MessageCircle size={14} />
                        {report.comments.length}
                      </span>
                      {report.dueAt && (
                        <span className={`inline-flex items-center gap-1.5 ${
                          Date.parse(report.dueAt) < Date.now() && report.status !== 'selesai'
                            ? 'text-red-600'
                            : ''
                        }`}>
                          <CalendarClock size={14} />
                          {formatDate(report.dueAt)}
                        </span>
                      )}
                      {report.photoDataUrl && (
                        <span className="inline-flex items-center gap-1.5">
                          <Camera size={14} />
                          Foto
                        </span>
                      )}
                    </div>
                  </button>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-ink-500">Status penanganan</label>
                    <div className="relative">
                      <select
                        value={report.status}
                        onChange={(event) => handleStatusChange(report, event.target.value as ReportStatus)}
                        disabled={updatingId === report.id}
                        className="h-10 w-full appearance-none rounded-lg border border-surface-200 bg-surface-alt px-3 text-sm font-bold text-ink-900 outline-none disabled:opacity-60"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {updatingId === report.id && (
                        <Loader2 size={16} className="absolute right-3 top-3 animate-spin text-brand-green" />
                      )}
                    </div>
                  </div>
                </article>
              ))}

              {!reports.length && (
                <div className="p-10 text-center font-semibold text-ink-500">
                  Tidak ada laporan yang sesuai pencarian.
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  disabled={page === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-200 bg-white disabled:opacity-40"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="min-w-24 text-center text-sm font-bold text-ink-700">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                  disabled={page === totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-200 bg-white disabled:opacity-40"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </section>

          {selectedReport && (
            <aside className="h-fit rounded-lg border border-surface-200 bg-white p-5 xl:sticky xl:top-28">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-brand-green">{selectedReport.ticketNumber ?? selectedReport.id}</p>
                  <h2 className="mt-1 text-xl font-bold text-ink-900">Detail laporan</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReportId(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 text-ink-700"
                  aria-label="Tutup detail"
                >
                  <X size={17} />
                </button>
              </div>

              {selectedReport.photoDataUrl && (
                <img
                  src={selectedReport.photoDataUrl}
                  alt="Dokumentasi laporan"
                  className="mb-5 aspect-video w-full rounded-lg object-cover"
                />
              )}

              <p className="leading-7 text-ink-800">{selectedReport.description}</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-surface-100 p-3">
                  <p className="text-xs font-bold text-ink-500">Status</p>
                  <p className="mt-1 text-sm font-bold text-ink-900">{STATUS_LABELS[selectedReport.status]}</p>
                </div>
                <div className="rounded-lg bg-surface-100 p-3">
                  <p className="text-xs font-bold text-ink-500">Komentar</p>
                  <p className="mt-1 text-sm font-bold text-ink-900">{selectedReport.comments.length}</p>
                </div>
              </div>

              <div className="mt-5 border-t border-surface-200 pt-5">
                <div className="mb-4 flex items-center gap-2">
                  <UserRound size={16} className="text-brand-green" />
                  <h3 className="text-sm font-bold text-ink-900">Penugasan dan SLA</h3>
                  {operationId === selectedReport.id && (
                    <Loader2 size={14} className="ml-auto animate-spin text-brand-green" />
                  )}
                </div>
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-ink-500">Petugas penanggung jawab</span>
                    <select
                      value={selectedReport.assignedTo ?? ''}
                      onChange={(event) => void handleOperationsChange(selectedReport, {
                        assignedTo: event.target.value || null,
                      })}
                      disabled={operationId === selectedReport.id}
                      className="h-10 w-full rounded-lg border border-surface-200 bg-surface-alt px-3 text-sm font-bold text-ink-900 outline-none"
                    >
                      <option value="">Belum ditugaskan</option>
                      {staffProfiles.map((profile) => (
                        <option key={profile.userId} value={profile.userId}>
                          {profile.displayName} - {profile.role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-ink-500">Prioritas</span>
                      <select
                        value={selectedReport.priority}
                        onChange={(event) => void handleOperationsChange(selectedReport, {
                          priority: event.target.value as ReportPriority,
                        })}
                        disabled={operationId === selectedReport.id}
                        className="h-10 w-full rounded-lg border border-surface-200 bg-surface-alt px-3 text-sm font-bold text-ink-900 outline-none"
                      >
                        {PRIORITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-ink-500">Tenggat SLA</span>
                      <input
                        type="datetime-local"
                        value={toDateTimeLocalValue(selectedReport.dueAt)}
                        onChange={(event) => void handleOperationsChange(selectedReport, {
                          dueAt: event.target.value ? new Date(event.target.value).toISOString() : null,
                        })}
                        disabled={operationId === selectedReport.id}
                        className="h-10 w-full rounded-lg border border-surface-200 bg-surface-alt px-2 text-xs font-bold text-ink-900 outline-none"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <a
                  href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-surface-200 text-sm font-bold text-ink-700"
                >
                  <MapPin size={16} />
                  Buka lokasi
                </a>
                <a
                  href={`#/laporan/${encodeURIComponent(selectedReport.id)}`}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-green text-sm font-bold text-white"
                >
                  Detail publik
                  <ExternalLink size={15} />
                </a>
              </div>

              <button
                type="button"
                onClick={() => void handlePublicationChange(selectedReport)}
                disabled={
                  publishingId === selectedReport.id
                  || (!selectedReport.isPublic && !selectedReportCanBePublished)
                }
                className={`mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold disabled:opacity-60 ${
                  selectedReport.isPublic
                    ? 'border border-surface-200 bg-white text-ink-700'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {publishingId === selectedReport.id
                  ? <Loader2 size={16} className="animate-spin" />
                  : selectedReport.isPublic ? <Lock size={16} /> : <Globe2 size={16} />}
                {selectedReport.isPublic
                  ? 'Tarik dari publik'
                  : selectedReportCanBePublished
                    ? 'Terbitkan ke peta publik'
                    : 'Verifikasi sebelum publikasi'}
              </button>

              <div className="mt-6 border-t border-surface-200 pt-5">
                <div className="mb-4 flex items-center gap-2">
                  <Clock3 size={16} className="text-brand-green" />
                  <h3 className="text-sm font-bold text-ink-900">Riwayat penanganan</h3>
                </div>
                <div className="space-y-4">
                  {selectedReport.updates.map((update) => (
                    <div key={update.id} className="border-l-2 border-brand-mint pl-3">
                      <p className="text-sm font-bold text-ink-900">{update.title}</p>
                      <p className="mt-1 text-xs font-semibold text-ink-500">{formatDate(update.createdAt)}</p>
                      {update.note && <p className="mt-1 text-sm leading-6 text-ink-600">{update.note}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-surface-200 pt-5">
                <div className="mb-4 flex items-center gap-2">
                  <StickyNote size={16} className="text-brand-green" />
                  <h3 className="text-sm font-bold text-ink-900">Catatan internal</h3>
                </div>
                <form onSubmit={handleAddInternalNote}>
                  <textarea
                    value={noteMessage}
                    onChange={(event) => setNoteMessage(event.target.value)}
                    rows={3}
                    minLength={2}
                    maxLength={2000}
                    placeholder="Catatan koordinasi yang hanya terlihat oleh petugas"
                    className="w-full resize-none rounded-lg border border-surface-200 bg-surface-alt p-3 text-sm font-semibold leading-6 outline-none focus:border-brand-green"
                  />
                  <button
                    type="submit"
                    disabled={noteMessage.trim().length < 2 || isAddingNote}
                    className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-ink-900 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {isAddingNote && <Loader2 size={14} className="animate-spin" />}
                    Simpan catatan
                  </button>
                </form>
                <div className="mt-4 space-y-3">
                  {internalNotes.map((note) => (
                    <div key={note.id} className="rounded-lg bg-surface-100 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-bold text-ink-900">{note.authorName}</p>
                        <p className="text-[11px] font-semibold text-ink-500">{formatDate(note.createdAt)}</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-ink-700">{note.message}</p>
                    </div>
                  ))}
                  {!internalNotes.length && (
                    <p className="text-sm font-semibold text-ink-500">Belum ada catatan internal.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-surface-200 pt-5">
                <div className="mb-4 flex items-center gap-2">
                  <History size={16} className="text-brand-green" />
                  <h3 className="text-sm font-bold text-ink-900">Audit aktivitas</h3>
                </div>
                <div className="space-y-4">
                  {auditEvents.map((event) => (
                    <div key={event.id} className="border-l-2 border-surface-200 pl-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-bold text-ink-900">{event.actorName}</p>
                        <p className="text-[11px] font-semibold text-ink-500">{formatDate(event.createdAt)}</p>
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {Object.entries(event.changes).map(([field, change]) => (
                          <p key={field} className="text-xs leading-5 text-ink-600">
                            <strong>{formatAuditField(field)}:</strong>{' '}
                            {formatAuditValue(change.before, staffProfiles)} menjadi{' '}
                            {formatAuditValue(change.after, staffProfiles)}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                  {!auditEvents.length && (
                    <p className="text-sm font-semibold text-ink-500">Belum ada perubahan yang tercatat.</p>
                  )}
                </div>
              </div>
            </aside>
          )}
        </div>

        <section className="mt-8 border-t border-surface-200 pt-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-brand-mint text-brand-green">
                <DatabaseBackup size={21} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink-900">Backup dan pemulihan</h2>
                <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-ink-500">
                  Backup database penuh dikelola dari Supabase, bukan dari browser petugas. Ekspor CSV/JSON di atas adalah snapshot operasional dan tidak menggantikan backup PostgreSQL. File foto pada Storage juga perlu strategi backup terpisah.
                </p>
              </div>
            </div>
            <a
              href={getSupabaseBackupsUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-bold text-white"
            >
              <DatabaseBackup size={17} />
              Buka backup Supabase
              <ExternalLink size={15} />
            </a>
          </div>
        </section>
      </div>

      {rejectionReport && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">
          <form onSubmit={handleReject} className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-red-600">{rejectionReport.ticketNumber ?? rejectionReport.id}</p>
                <h2 className="mt-1 text-xl font-bold text-ink-900">Tolak laporan</h2>
              </div>
              <button
                type="button"
                onClick={() => setRejectionReport(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200"
                aria-label="Tutup dialog"
              >
                <X size={17} />
              </button>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-ink-500">
              Alasan akan tampil pada riwayat laporan agar keputusan petugas dapat ditelusuri.
            </p>
            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-bold text-ink-900">Alasan penolakan</span>
              <textarea
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                rows={4}
                minLength={10}
                required
                placeholder="Jelaskan alasan laporan tidak dapat diproses"
                className="w-full resize-none rounded-lg border border-surface-200 bg-surface-alt p-3 text-sm font-semibold leading-6 outline-none focus:border-brand-green"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectionReport(null)}
                className="h-10 rounded-lg border border-surface-200 px-4 text-sm font-bold text-ink-700"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!rejectionReason.trim() || updatingId === rejectionReport.id}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                {updatingId === rejectionReport.id && <Loader2 size={15} className="animate-spin" />}
                Tolak laporan
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
