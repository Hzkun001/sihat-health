import { addReportComment, getCommunityReportById, subscribeToCommunityReports } from '@/lib/communityReports';
import { ArrowLeft, Camera, MapPin, MessageCircle, Send } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

interface ReportDetailPageProps {
  reportId: string;
  onClose: () => void;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function ReportDetailPage({ reportId, onClose }: ReportDetailPageProps) {
  const [report, setReport] = useState(() => getCommunityReportById(reportId));
  const [comment, setComment] = useState('');

  useEffect(() => {
    setReport(getCommunityReportById(reportId));
    return subscribeToCommunityReports(() => {
      setReport(getCommunityReportById(reportId));
    });
  }, [reportId]);

  const coordinateText = useMemo(() => {
    if (!report) return '-';
    return `${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`;
  }, [report]);

  const handleSubmitComment = (event: FormEvent) => {
    event.preventDefault();
    if (!report || !comment.trim()) return;
    const updated = addReportComment(report.id, comment);
    setReport(updated);
    setComment('');
  };

  if (!report) {
    return (
      <main className="min-h-screen bg-surface-0 px-6 py-28">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={onClose}
            className="mb-8 inline-flex h-11 items-center gap-2 rounded-xl bg-surface-100 px-4 text-sm font-bold text-ink-700 transition-colors hover:bg-brand-mint hover:text-brand-green"
          >
            <ArrowLeft size={17} />
            Kembali
          </button>
          <div className="rounded-2xl border border-surface-200 bg-white p-8">
            <h1 className="text-2xl font-bold text-ink-900">Laporan tidak ditemukan</h1>
            <p className="mt-2 text-ink-500">Data laporan mungkin sudah dihapus dari penyimpanan browser ini.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-0 px-6 pb-16 pt-28">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onClose}
          className="mb-8 inline-flex h-11 items-center gap-2 rounded-xl bg-surface-100 px-4 text-sm font-bold text-ink-700 transition-colors hover:bg-brand-mint hover:text-brand-green"
        >
          <ArrowLeft size={17} />
          Kembali ke SIHAT
        </button>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <section className="overflow-hidden rounded-2xl border border-surface-200 bg-white">
            {report.photoDataUrl ? (
              <img
                src={report.photoDataUrl}
                alt="Foto laporan warga"
                className="h-[320px] w-full object-cover sm:h-[460px]"
              />
            ) : (
              <div className="flex h-[320px] items-center justify-center bg-surface-100 sm:h-[460px]">
                <div className="text-center">
                  <Camera size={42} className="mx-auto text-ink-500" />
                  <p className="mt-3 text-sm font-semibold text-ink-500">Laporan ini tidak menyertakan foto.</p>
                </div>
              </div>
            )}

            <div className="p-6 sm:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-mint px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-brand-green">
                  Laporan warga
                </span>
                <span className="rounded-full bg-surface-100 px-3 py-1 text-xs font-bold capitalize text-ink-700">
                  Status {report.status}
                </span>
              </div>

              <h1 className="text-2xl font-bold leading-tight text-ink-900 sm:text-3xl">
                Detail Laporan Lingkungan
              </h1>
              <p className="mt-4 text-base leading-7 text-ink-700">{report.description}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-surface-100 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-900">
                    <MapPin size={16} className="text-brand-green" />
                    Koordinat
                  </div>
                  <p className="break-words text-sm font-semibold text-ink-700">{coordinateText}</p>
                </div>
                <div className="rounded-xl bg-surface-100 p-4">
                  <p className="mb-2 text-sm font-bold text-ink-900">Waktu laporan</p>
                  <p className="text-sm font-semibold text-ink-700">{formatDateTime(report.createdAt)}</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-surface-200 bg-white p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand-green">Diskusi</p>
                <h2 className="mt-1 text-xl font-bold text-ink-900">Komentar Pelaporan</h2>
              </div>
              <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-brand-mint px-3 text-sm font-bold text-brand-green">
                {report.comments.length}
              </span>
            </div>

            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {report.comments.length ? (
                report.comments.map((item) => (
                  <article key={item.id} className="rounded-xl bg-surface-100 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-ink-900">{item.author}</p>
                      <time className="flex-shrink-0 text-xs font-semibold text-ink-500">{formatDateTime(item.createdAt)}</time>
                    </div>
                    <p className="text-sm leading-6 text-ink-700">{item.message}</p>
                  </article>
                ))
              ) : (
                <div className="rounded-xl bg-surface-100 p-5 text-center">
                  <MessageCircle size={28} className="mx-auto text-ink-500" />
                  <p className="mt-3 text-sm font-semibold text-ink-500">Belum ada komentar untuk laporan ini.</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitComment} className="mt-6 space-y-3">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                placeholder="Tambahkan komentar atau tindak lanjut..."
                className="w-full resize-none rounded-xl bg-surface-100 px-4 py-3 text-sm font-semibold leading-6 text-ink-900 outline-none transition-shadow placeholder:text-ink-500 focus:shadow-[0_0_0_3px_rgba(70,80,71,0.12)]"
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-4 text-sm font-bold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:bg-surface-200 disabled:text-ink-500"
              >
                <Send size={16} />
                Kirim Komentar
              </button>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}
