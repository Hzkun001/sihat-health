import { SectionReveal } from './SectionReveal';
import { Camera, MapPin, Send, X, Upload, FileText } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCurrentLocation();
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
        let errorMessage = 'Tidak dapat mengakses lokasi';
        
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
        
        const defaultCoords = {
          latitude: -3.4543,
          longitude: 114.8419,
        };
        setCoordinates(defaultCoords);
        setCoordinateInput(`${defaultCoords.latitude.toFixed(6)}, ${defaultCoords.longitude.toFixed(6)}`);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleCoordinateChange = (value: string) => {
    setCoordinateInput(value);
    setCoordinateError(null);

    const parts = value.split(',').map(p => p.trim());
    
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);

      if (!isNaN(lat) && !isNaN(lng)) {
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          setCoordinates({ latitude: lat, longitude: lng });
          setCoordinateError(null);
        } else {
          setCoordinateError('Latitude: -90 hingga 90, Longitude: -180 hingga 180');
          setCoordinates(null);
        }
      } else {
        setCoordinateError('Format tidak valid');
        setCoordinates(null);
      }
    } else if (value.trim() === '') {
      setCoordinates(null);
      setCoordinateError(null);
    } else {
      setCoordinateError('Format: latitude, longitude (contoh: -3.454300, 114.841900)');
      setCoordinates(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage || !description) {
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => {
      setSelectedImage(null);
      setDescription('');
      setShowSuccess(false);
      setLocationError(null);
      setCoordinateError(null);
      setCoordinateInput('');
      getCurrentLocation();
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }, 3000);
  };

  return (
    <section id="laporan" className="relative py-24 sm:py-28 lg:py-32 overflow-hidden" style={{ backgroundColor: 'var(--surface-0)' }}>
      <div className="relative max-w-3xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full mb-4" style={{ backgroundColor: 'var(--surface-100)', border: '1px solid var(--surface-200)' }}>
              <span style={{ color: 'var(--brand-green)', fontSize: '14px', fontWeight: 600 }}>
                Partisipasi Warga
              </span>
            </div>
            <h2
              className="tracking-tight mb-4"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}
            >
              Laporan Masalah Lingkungan
            </h2> 
            <p className="max-w-2xl mx-auto" style={{ fontSize: '18px', color: 'var(--ink-500)' }}>
              Laporkan masalah lingkungan dan kesehatan publik seperti sampah ilegal, kerusakan jalan, atau polusi
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              backgroundColor: 'var(--surface-0)',
              border: '1px solid var(--surface-200)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div className="p-6 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Image Upload Section */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink-900)' }}>
                    <Camera style={{ color: 'var(--brand-green)' }} size={20} strokeWidth={2.5} />
                    Upload Foto
                  </label>

                  <AnimatePresence mode="wait">
                    {selectedImage ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="relative rounded-xl overflow-hidden"
                        style={{
                          border: '1px solid var(--surface-200)',
                          aspectRatio: '16/9',
                        }}
                      >
                        <img
                          src={selectedImage}
                          alt="Preview laporan"
                          className="w-full h-full object-cover"
                        />
                        <motion.button
                          type="button"
                          onClick={handleRemoveImage}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                          aria-label="Hapus foto"
                        >
                          <X size={20} style={{ color: 'var(--ink-700)' }} strokeWidth={2.5} />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 gap-3"
                      >
                        {/* Upload from Files */}
                        <motion.button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className="relative rounded-xl p-6 flex flex-col items-center justify-center gap-3 overflow-hidden"
                          style={{
                            border: '2px dashed var(--surface-200)',
                            backgroundColor: 'var(--surface-alt)',
                            minHeight: '140px',
                          }}
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: 'var(--brand-mint)' }}
                          >
                            <Upload size={22} style={{ color: 'var(--brand-green)' }} strokeWidth={2.5} />
                          </div>
                          <div className="text-center">
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-900)' }}>
                              Upload dari File
                            </p>
                            <p style={{ fontSize: '12px', color: 'var(--ink-500)' }}>
                              JPG, PNG, atau HEIC
                            </p>
                          </div>
                        </motion.button>

                        {/* Take Photo with Camera */}
                        <motion.button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className="relative rounded-xl p-6 flex flex-col items-center justify-center gap-3 overflow-hidden"
                          style={{
                            border: '2px dashed var(--surface-200)',
                            backgroundColor: 'var(--surface-alt)',
                            minHeight: '140px',
                          }}
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: 'var(--brand-mint)' }}
                          >
                            <Camera size={22} style={{ color: 'var(--brand-green)' }} strokeWidth={2.5} />
                          </div>
                          <div className="text-center">
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-900)' }}>
                              Ambil Foto
                            </p>
                            <p style={{ fontSize: '12px', color: 'var(--ink-500)' }}>
                              Gunakan kamera
                            </p>
                          </div>
                        </motion.button>

                        {/* Hidden File Inputs */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          aria-label="Upload foto dari file"
                        />
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageSelect}
                          className="hidden"
                          aria-label="Ambil foto dengan kamera"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Description Input */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink-900)' }}>
                    <FileText style={{ color: 'var(--brand-green)' }} size={20} strokeWidth={2.5} />
                    Keterangan
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsikan masalah yang Anda temukan (contoh: Tumpukan sampah di pinggir jalan, air tergenang, dll)"
                    rows={4}
                    className="w-full px-5 py-4 rounded-xl resize-none transition-all duration-300 outline-none"
                    style={{
                      backgroundColor: 'var(--surface-100)',
                      border: '2px solid transparent',
                      fontSize: '16px',
                      lineHeight: '1.6',
                      color: 'var(--ink-900)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(5, 150, 105, 0.3)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'transparent';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                {/* GPS Coordinates */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink-900)' }}>
                      <MapPin style={{ color: 'var(--brand-blue)' }} size={20} strokeWidth={2.5} />
                      Koordinat Lokasi
                    </label>
                    <span style={{ fontSize: '13px', color: 'var(--ink-500)' }}>
                      Otomatis / Manual
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={isLoadingLocation ? 'Mengambil lokasi...' : coordinateInput}
                        onChange={(e) => handleCoordinateChange(e.target.value)}
                        disabled={isLoadingLocation}
                        placeholder="Contoh: -3.454300, 114.841900"
                        className="w-full px-5 py-4 rounded-xl transition-all duration-300 outline-none"
                        style={{
                          backgroundColor: isLoadingLocation ? 'var(--surface-200)' : 'var(--surface-100)',
                          border: coordinateError 
                            ? '2px solid rgba(239, 68, 68, 0.4)' 
                            : '2px solid transparent',
                          color: isLoadingLocation ? 'var(--ink-500)' : 'var(--ink-900)',
                          fontSize: '15px',
                          cursor: isLoadingLocation ? 'not-allowed' : 'text',
                        }}
                        onFocus={(e) => {
                          if (!isLoadingLocation && !coordinateError) {
                            e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.08)';
                          }
                        }}
                        onBlur={(e) => {
                          if (!coordinateError) {
                            e.target.style.borderColor = 'transparent';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      />
                      {!isLoadingLocation && !coordinateError && (
                        <p className="mt-2 flex items-center gap-1.5" style={{ fontSize: '12px', color: 'var(--ink-500)' }}>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                          Format: latitude, longitude (atau klik tombol GPS untuk otomatis)
                        </p>
                      )}
                    </div>
                    <motion.button
                      type="button"
                      onClick={getCurrentLocation}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoadingLocation}
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: isLoadingLocation
                          ? 'var(--surface-200)'
                          : 'var(--brand-blue)',
                        boxShadow: isLoadingLocation 
                          ? 'none' 
                          : '0 4px 12px rgba(59, 130, 246, 0.25)',
                        cursor: isLoadingLocation ? 'not-allowed' : 'pointer',
                      }}
                      aria-label="Deteksi lokasi otomatis"
                      title="Deteksi lokasi otomatis"
                    >
                      <motion.div
                        animate={isLoadingLocation ? { rotate: 360 } : {}}
                        transition={isLoadingLocation ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                      >
                        <MapPin size={20} className="text-white" strokeWidth={2.5} />
                      </motion.div>
                    </motion.button>
                  </div>

                  {/* Coordinate Error */}
                  {coordinateError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl"
                      style={{
                        background: 'rgba(254, 202, 202, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      <p className="text-red-600 flex items-start gap-2" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="flex-shrink-0 mt-0.5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{coordinateError}</span>
                      </p>
                    </motion.div>
                  )}

                  {/* Location Error (GPS) */}
                  {locationError && !coordinateError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl"
                      style={{
                        background: 'rgba(254, 243, 199, 0.3)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                      }}
                    >
                      <p className="text-amber-700 flex items-start gap-2" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="flex-shrink-0 mt-0.5"
                        >
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>
                          {locationError} Anda dapat memasukkan koordinat secara manual.
                        </span>
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!selectedImage || !description || isSubmitting}
                  whileHover={
                    !selectedImage || !description || isSubmitting
                      ? {}
                      : { scale: 1.01, y: -1 }
                  }
                  whileTap={
                    !selectedImage || !description || isSubmitting ? {} : { scale: 0.98 }
                  }
                  transition={{ duration: 0.2 }}
                  className="w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300"
                  style={{
                    backgroundColor:
                      !selectedImage || !description || isSubmitting
                        ? 'var(--surface-200)'
                        : 'var(--brand-green)',
                    color:
                      !selectedImage || !description || isSubmitting
                        ? 'var(--ink-500)'
                        : '#ffffff',
                    boxShadow:
                      !selectedImage || !description || isSubmitting
                        ? 'none'
                        : '0 4px 16px rgba(5, 150, 105, 0.25)',
                    cursor:
                      !selectedImage || !description || isSubmitting
                        ? 'not-allowed'
                        : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} strokeWidth={2.5} />
                      <span>Kirim Laporan</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </SectionReveal>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
              className="mt-6 p-6 rounded-2xl flex items-center gap-4"
              style={{
                backgroundColor: 'var(--brand-mint)',
                border: '1px solid var(--brand-green-light)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--brand-green)' }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>
              <div>
                <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink-900)' }}>
                  Laporan Berhasil Dikirim!
                </p>
                <p style={{ fontSize: '15px', color: 'var(--ink-700)' }}>
                  Terima kasih atas partisipasi Anda dalam menjaga kesehatan lingkungan Banjarbaru.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Note */}
        <SectionReveal delay={0.3}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
            className="mt-8 p-5 rounded-xl text-center"
            style={{
              backgroundColor: 'var(--surface-alt)',
              border: '1px solid var(--surface-200)',
            }}
          >
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--ink-500)' }}>
              <span style={{ fontWeight: 600 }}>Catatan:</span> Laporan Anda akan diintegrasikan ke dalam peta
              kesehatan real-time SIHAT untuk membantu monitoring dan respon cepat terhadap isu kesehatan lingkungan
              di Banjarbaru. {locationError && 'Koordinat GPS bersifat opsional jika lokasi tidak dapat diakses.'}
            </p>
          </motion.div>
        </SectionReveal>
      </div>
    </section>
  );
}
