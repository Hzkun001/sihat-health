import { SectionReveal } from '@/components/shared/SectionReveal';
import { addCommunityReport } from '@/lib/communityReports';
import {
  parseCoordinates,
  REPORT_DESCRIPTION_MAX_LENGTH,
  REPORT_DESCRIPTION_MIN_LENGTH,
  REPORT_PHOTO_TYPES,
  validateReportDescription,
  validateReportPhoto,
} from '@/lib/reportValidation';
import {
  AlertTriangle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  LocateFixed,
  MapPinned,
  MessageSquareText,
  Paperclip,
  Send,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export function ReportSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [coordinateInput, setCoordinateInput] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coordinateError, setCoordinateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [submittedTicketNumber, setSubmittedTicketNumber] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const resetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolokasi tidak didukung oleh browser Anda');
      setIsLoadingLocation(false);
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoordinates(coords);
        setCoordinateInput(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
        setIsLoadingLocation(false);
        setLocationError(null);
        setCoordinateError(null);
      },
      (error) => {
        let errorMessage: string;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Izin lokasi ditolak. Aktifkan izin lokasi di browser Anda.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informasi lokasi tidak tersedia.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Waktu permintaan lokasi habis. Coba lagi.';
            break;
          default:
            errorMessage = 'Terjadi kesalahan saat mengambil lokasi.';
        }

        setLocationError(errorMessage);
        setIsLoadingLocation(false);
        setCoordinates(null);
        setCoordinateInput('');
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validationError = validateReportPhoto(file);
    if (validationError) {
      setImageError(validationError);
      event.target.value = '';
      return;
    }

    setImageError(null);
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleCoordinateChange = (value: string) => {
    setCoordinateInput(value);
    setCoordinateError(null);

    const parsed = parseCoordinates(value);
    if (parsed) {
      setCoordinates(parsed);
      setCoordinateError(null);
    } else if (value.trim() === '') {
      setCoordinates(null);
      setCoordinateError(null);
    } else {
      setCoordinateError('Gunakan latitude, longitude yang valid.');
      setCoordinates(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const descriptionError = validateReportDescription(description);
    if (descriptionError) {
      setSubmitError(descriptionError);
      return;
    }
    if (!coordinates || coordinateError || !privacyConsent) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const report = await addCommunityReport({
        description,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        photoDataUrl: selectedImage,
      });

      setShowSuccess(true);
      setSubmittedReportId(report.id);
      setSubmittedTicketNumber(report.ticketNumber ?? null);

      if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);

      resetTimeoutRef.current = window.setTimeout(() => {
        setSelectedImage(null);
        setDescription('');
        setShowSuccess(false);
        setSubmittedReportId(null);
        setSubmittedTicketNumber(null);
        setLocationError(null);
        setCoordinateError(null);
        setCoordinateInput('');
        setCoordinates(null);
        setPrivacyConsent(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
      }, 5000);
    } catch (error) {
      console.warn('[Reports] Gagal mengirim laporan:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Laporan gagal dikirim. Periksa koneksi lalu coba kembali.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const descriptionError = description ? validateReportDescription(description) : null;
  const canSubmit = Boolean(
    !descriptionError
    && coordinates
    && !coordinateError
    && !imageError
    && privacyConsent
    && !isSubmitting,
  );

  return (
    <section id="laporan" className="relative overflow-hidden bg-surface-0 py-20 sm:py-24 lg:py-28">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <SectionReveal>
          <div className="mb-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-surface-200 bg-surface-100 px-3 py-1.5 text-sm font-bold text-brand-green">
                <MapPinned size={15} />
                Partisipasi Warga
              </div>
              <h2 className="max-w-xl text-[clamp(32px,4vw,48px)] font-bold leading-tight text-ink-900">
                Laporkan titik masalah lingkungan
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-ink-500 sm:text-lg">
              Tulis temuan, pastikan koordinatnya tepat, lalu kirim. Foto bersifat opsional dan akan membuka halaman detail laporan.
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.15}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease: [0.25, 0.8, 0.25, 1] }}
            className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]"
          >
            <form onSubmit={handleSubmit} className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6 p-5 sm:p-7 lg:p-8">
                <div>
                  <label className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-900">
                    <MessageSquareText size={18} className="text-brand-green" />
                    Keterangan
                  </label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Contoh: drainase tersumbat di tepi jalan, sampah menumpuk, genangan air..."
                    rows={6}
                    minLength={REPORT_DESCRIPTION_MIN_LENGTH}
                    maxLength={REPORT_DESCRIPTION_MAX_LENGTH}
                    className="min-h-[180px] w-full resize-none rounded-xl border border-surface-200 bg-surface-alt px-4 py-3 text-base leading-7 text-ink-900 outline-none transition-shadow placeholder:text-ink-500 focus:border-brand-green focus:bg-white focus:shadow-[0_0_0_4px_rgba(70,80,71,0.12)]"
                    required
                  />
                  <div className="mt-2 flex justify-between gap-4 text-xs font-semibold">
                    <span className={descriptionError ? 'text-red-600' : 'text-ink-500'}>
                      {descriptionError ?? `Minimal ${REPORT_DESCRIPTION_MIN_LENGTH} karakter`}
                    </span>
                    <span className="text-ink-500">{description.length}/{REPORT_DESCRIPTION_MAX_LENGTH}</span>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-ink-900">
                      <MapPinned size={18} className="text-brand-green" />
                      Koordinat
                    </label>
                    <span className="text-xs font-semibold text-ink-500">Latitude, longitude</span>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={isLoadingLocation ? 'Mengambil lokasi...' : coordinateInput}
                      onChange={(event) => handleCoordinateChange(event.target.value)}
                      disabled={isLoadingLocation}
                      placeholder="-3.454300, 114.841900"
                      className={`h-12 min-w-0 flex-1 rounded-xl border bg-surface-alt px-4 text-sm font-semibold text-ink-900 outline-none transition-shadow placeholder:text-ink-500 disabled:cursor-wait disabled:bg-surface-100 disabled:text-ink-500 ${
                        coordinateError
                          ? 'border-red-300 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.10)]'
                          : 'border-surface-200 focus:border-brand-green focus:bg-white focus:shadow-[0_0_0_4px_rgba(70,80,71,0.12)]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isLoadingLocation}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-wait disabled:bg-surface-200 disabled:text-ink-500"
                    >
                      {isLoadingLocation ? <Loader2 size={17} className="animate-spin" /> : <LocateFixed size={17} />}
                      Deteksi
                    </button>
                  </div>

                  <AnimatePresence>
                    {(coordinateError || locationError) && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm font-semibold leading-6 ${
                          coordinateError
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : 'border-amber-200 bg-amber-50 text-amber-800'
                        }`}
                      >
                        <AlertTriangle size={16} className="mt-1 flex-shrink-0" />
                        <span>{coordinateError || `${locationError} Anda dapat mengisi koordinat manual.`}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <aside className="border-t border-surface-200 bg-surface-alt p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink-900">Dokumentasi</p>
                    <p className="mt-1 text-xs font-semibold text-ink-500">Opsional</p>
                  </div>
                  {selectedImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-3 text-xs font-bold text-ink-700 shadow-sm hover:text-ink-900"
                    >
                      <X size={14} />
                      Hapus
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {selectedImage ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="overflow-hidden rounded-xl border border-surface-200 bg-white"
                    >
                      <img src={selectedImage} alt="Preview laporan" className="aspect-[4/3] w-full object-cover" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="rounded-xl border border-dashed border-surface-200 bg-white p-4"
                    >
                      <div className="mb-4 flex aspect-[4/3] items-center justify-center rounded-lg bg-surface-100">
                        <ImagePlus size={36} className="text-ink-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink-900 px-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
                        >
                          <Paperclip size={16} />
                          File
                        </button>
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-ink-700 ring-1 ring-inset ring-surface-200 transition-colors hover:text-ink-900"
                        >
                          <ImagePlus size={16} />
                          Foto
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={REPORT_PHOTO_TYPES.join(',')}
                  onChange={handleImageSelect}
                  className="hidden"
                  aria-label="Upload foto dari file"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept={REPORT_PHOTO_TYPES.join(',')}
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                  aria-label="Ambil foto"
                />
                {imageError && (
                  <p className="mt-3 text-sm font-semibold text-red-600">{imageError}</p>
                )}

                <label className="mt-5 flex items-start gap-3 rounded-lg border border-surface-200 bg-white p-3">
                  <input
                    type="checkbox"
                    checked={privacyConsent}
                    onChange={(event) => setPrivacyConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-brand-green"
                    required
                  />
                  <span className="text-xs font-semibold leading-5 text-ink-600">
                    Saya menyetujui lokasi, deskripsi, dan foto diproses oleh petugas. Laporan tidak tampil di peta publik sebelum diverifikasi dan diterbitkan petugas.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(48,56,50,0.22)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-surface-200 disabled:text-ink-500 disabled:shadow-none"
                >
                  {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                  {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </aside>
            </form>
          </motion.div>
        </SectionReveal>

        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Laporan belum terkirim.</p>
                <p className="mt-1 text-sm font-semibold leading-6">{submitError}</p>
              </div>
            </motion.div>
          )}

          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-5 flex flex-col gap-3 rounded-2xl border border-brand-green-light bg-brand-mint p-4 sm:flex-row sm:items-center"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-green text-white">
                <CheckCircle2 size={21} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink-900">Laporan tersimpan.</p>
                <p className="text-sm font-semibold leading-6 text-ink-700">
                  {submittedTicketNumber
                    ? `Nomor tiket ${submittedTicketNumber}. Laporan menunggu verifikasi sebelum dapat diterbitkan ke peta.`
                    : 'Laporan menunggu verifikasi petugas sebelum dapat diterbitkan ke peta.'}
                </p>
              </div>
              {submittedReportId && (
                <a
                  href={`#/laporan/${encodeURIComponent(submittedReportId)}`}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-bold text-brand-green"
                >
                  Buka detail
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
