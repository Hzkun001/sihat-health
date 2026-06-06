import {
  getCurrentStaffProfile,
  loadCommunityReports,
  signInStaff,
  signOutStaff,
  subscribeToCommunityReports,
  updateReportStatus,
  type CommunityReport,
  type ReportStatus,
  type StaffProfile,
} from '@/lib/communityReports';
import { isSupabaseConfigured } from '@/lib/supabase';
import { CheckCircle2, Loader2, LockKeyhole, LogOut, MapPin, RefreshCw, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

const STATUS_OPTIONS: Array<{ value: ReportStatus; label: string }> = [
  { value: 'baru', label: 'Baru' },
  { value: 'diverifikasi', label: 'Diverifikasi' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'ditolak', label: 'Ditolak' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

export function StaffDashboardPage() {
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'semua'>('semua');

  const refreshReports = async () => {
    const nextReports = await loadCommunityReports();
    setReports(nextReports);
  };

  useEffect(() => {
    let active = true;

    void getCurrentStaffProfile().then(async (profile) => {
      if (!active) return;
      setStaff(profile);
      if (profile) await refreshReports();
      if (active) setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!staff) return;
    return subscribeToCommunityReports(setReports);
  }, [staff]);

  const filteredReports = useMemo(
    () => reports.filter((report) => statusFilter === 'semua' || report.status === statusFilter),
    [reports, statusFilter],
  );

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    try {
      const profile = await signInStaff(email, password);
      setStaff(profile);
      await refreshReports();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login petugas gagal');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (report: CommunityReport, status: ReportStatus) => {
    setUpdatingId(report.id);
    try {
      await updateReportStatus(report.id, status);
      await refreshReports();
    } catch (error) {
      console.warn('[Reports] Gagal memperbarui status:', error);
      window.alert('Status gagal diperbarui. Periksa hak akses akun petugas.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    await signOutStaff();
    setStaff(null);
    setReports([]);
    setPassword('');
  };

  if (!isSupabaseConfigured) {
    return (
      <main className="min-h-screen bg-surface-0 px-6 pb-20 pt-32">
        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-8">
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
          className="mx-auto max-w-md rounded-2xl border border-surface-200 bg-white p-7 shadow-[0_18px_48px_rgba(15,23,42,0.07)]"
        >
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-mint text-brand-green">
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
                className="h-12 w-full rounded-xl border border-surface-200 bg-surface-alt px-4 outline-none focus:border-brand-green"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-ink-900">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-xl border border-surface-200 bg-surface-alt px-4 outline-none focus:border-brand-green"
                required
              />
            </label>
          </div>

          {loginError && <p className="mt-4 text-sm font-semibold text-red-600">{loginError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-green font-bold text-white disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={17} className="animate-spin" />}
            Masuk
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-0 px-6 pb-20 pt-32">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-mint px-3 py-1.5 text-xs font-bold uppercase text-brand-green">
              <ShieldCheck size={15} />
              {staff.role}
            </div>
            <h1 className="text-3xl font-bold text-ink-900">Laporan masuk</h1>
            <p className="mt-2 text-ink-500">Halo, {staff.displayName}. Verifikasi dan pantau tindak lanjut laporan warga.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refreshReports()}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-200 bg-white text-ink-700"
              title="Muat ulang laporan"
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

        <div className="mb-5 flex flex-wrap gap-2">
          {(['semua', ...STATUS_OPTIONS.map((item) => item.value)] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`h-9 rounded-lg px-3 text-sm font-bold ${
                statusFilter === status ? 'bg-brand-green text-white' : 'bg-white text-ink-700 ring-1 ring-surface-200'
              }`}
            >
              {status === 'semua' ? `Semua (${reports.length})` : STATUS_OPTIONS.find((item) => item.value === status)?.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredReports.map((report) => (
            <article
              key={report.id}
              className="grid gap-5 rounded-xl border border-surface-200 bg-white p-5 md:grid-cols-[1fr_220px] md:items-center"
            >
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="text-brand-green">{report.ticketNumber ?? report.id}</span>
                  <span className="text-ink-500">{formatDate(report.createdAt)}</span>
                </div>
                <p className="font-semibold leading-7 text-ink-900">{report.description}</p>
                <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink-500">
                  <MapPin size={15} />
                  {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-ink-500">Status penanganan</label>
                <div className="relative">
                  <select
                    value={report.status}
                    onChange={(event) => void handleStatusChange(report, event.target.value as ReportStatus)}
                    disabled={updatingId === report.id}
                    className="h-11 w-full appearance-none rounded-lg border border-surface-200 bg-surface-alt px-3 text-sm font-bold text-ink-900 outline-none disabled:opacity-60"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {updatingId === report.id && (
                    <Loader2 size={16} className="absolute right-3 top-3.5 animate-spin text-brand-green" />
                  )}
                </div>
                {report.status === 'selesai' && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-green-700">
                    <CheckCircle2 size={14} />
                    Penanganan selesai
                  </p>
                )}
              </div>
            </article>
          ))}

          {!filteredReports.length && (
            <div className="rounded-xl border border-dashed border-surface-200 bg-white p-10 text-center font-semibold text-ink-500">
              Tidak ada laporan pada status ini.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
