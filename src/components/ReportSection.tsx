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

  // Get user's current GPS coordinates on component mount
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
        
        // Set default coordinates for Banjarbaru as fallback
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
        maximumAge: 300000, // Accept cached position up to 5 minutes old
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

    // Parse coordinate input (format: "latitude, longitude")
    const parts = value.split(',').map(p => p.trim());
    
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);

      // Validate latitude and longitude ranges
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
      // Allow empty for optional field
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

    // Simulate API submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setShowSuccess(true);

    // Reset form after success
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
    <section id="laporan" className="relative py-24 overflow-hidden bg-white">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: '#FFFFFF',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-brand-mint rounded-full mb-4">
              <span className="text-brand-green" style={{ fontSize: '14px', fontWeight: 600 }}>
                Partisipasi Warga
              </span>
            </div>
            <h2
              className="text-ink-900 tracking-tight mb-4"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700 }}
            >
              Laporan Kesehatan Lingkungan
            </h2>
            <p className="text-ink-700 max-w-2xl mx-auto" style={{ fontSize: '18px' }}>
              Laporkan masalah lingkungan dan kesehatan publik seperti sampah ilegal, kerusakan jalan, atau polusi
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          {/* Glassmorphism Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.8, 0.25, 1],
            }}
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            <div className="p-6 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Image Upload Section */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-ink-900" style={{ fontSize: '16px', fontWeight: 600 }}>
                    <Camera className="text-brand-green" size={20} strokeWidth={2.5} />
                    Upload Foto
                  </label>

                  {/* Image Preview */}
                  <AnimatePresence mode="wait">
                    {selectedImage ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="relative rounded-2xl overflow-hidden"
                        style={{
                          background: 'rgba(255, 255, 255, 0.6)',
                          border: '2px solid rgba(26, 163, 81, 0.2)',
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
                          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
                          aria-label="Hapus foto"
                        >
                          <X size={20} className="text-ink-700" strokeWidth={2.5} />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 sm:grid-cols-2 gap-3"
                      >
                        {/* Upload from Files */}
                        <motion.button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(26, 163, 81, 0.15)' }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className="relative rounded-2xl p-8 flex flex-col items-center justify-center gap-3 overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, rgba(26, 163, 81, 0.05) 0%, rgba(90, 200, 250, 0.05) 100%)',
                            border: '2px dashed rgba(26, 163, 81, 0.3)',
                            minHeight: '160px',
                          }}
                        >
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
                            }}
                          >
                            <Upload size={24} className="text-white" strokeWidth={2.5} />
                          </div>
                          <div className="text-center">
                            <p className="text-ink-900 mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
                              Upload dari File
                            </p>
                            <p className="text-ink-500" style={{ fontSize: '14px' }}>
                              JPG, PNG, atau HEIC
                            </p>
                          </div>
                        </motion.button>

                        {/* Take Photo with Camera */}
                        <motion.button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(90, 200, 250, 0.15)' }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className="relative rounded-2xl p-8 flex flex-col items-center justify-center gap-3 overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, rgba(90, 200, 250, 0.05) 0%, rgba(26, 163, 81, 0.05) 100%)',
                            border: '2px dashed rgba(90, 200, 250, 0.3)',
                            minHeight: '160px',
                          }}
                        >
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, #5AC8FA 0%, #1BA351 100%)',
                            }}
                          >
                            <Camera size={24} className="text-white" strokeWidth={2.5} />
                          </div>
                          <div className="text-center">
                            <p className="text-ink-900 mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
                              Ambil Foto
                            </p>
                            <p className="text-ink-500" style={{ fontSize: '14px' }}>
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
                  <label className="flex items-center gap-2 text-ink-900" style={{ fontSize: '16px', fontWeight: 600 }}>
                    <FileText className="text-brand-green" size={20} strokeWidth={2.5} />
                    Keterangan
                  </label>
                  <motion.div
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Deskripsikan masalah yang Anda temukan (contoh: Tumpukan sampah di pinggir jalan, air tergenang, dll)"
                      rows={4}
                      className="w-full px-5 py-4 rounded-2xl resize-none focus:outline-none transition-all duration-300"
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        border: '2px solid rgba(26, 163, 81, 0.15)',
                        fontSize: '16px',
                        lineHeight: '1.6',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(26, 163, 81, 0.4)';
                        e.target.style.boxShadow = '0 4px 12px rgba(26, 163, 81, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(26, 163, 81, 0.15)';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </motion.div>
                </div>

                {/* GPS Coordinates */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-ink-900" style={{ fontSize: '16px', fontWeight: 600 }}>
                      <MapPin className="text-brand-blue" size={20} strokeWidth={2.5} />
                      Koordinat Lokasi
                    </label>
                    <span className="text-ink-500" style={{ fontSize: '13px' }}>
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
                        className="w-full px-5 py-4 rounded-2xl transition-all duration-300"
                        style={{
                          background: isLoadingLocation ? 'rgba(100, 116, 139, 0.08)' : 'rgba(255, 255, 255, 0.8)',
                          border: coordinateError 
                            ? '2px solid rgba(239, 68, 68, 0.4)' 
                            : '2px solid rgba(90, 200, 250, 0.15)',
                          color: isLoadingLocation ? '#64748B' : '#0F172A',
                          fontSize: '15px',
                          cursor: isLoadingLocation ? 'not-allowed' : 'text',
                        }}
                        onFocus={(e) => {
                          if (!isLoadingLocation && !coordinateError) {
                            e.target.style.borderColor = 'rgba(90, 200, 250, 0.4)';
                            e.target.style.boxShadow = '0 4px 12px rgba(90, 200, 250, 0.1)';
                          }
                        }}
                        onBlur={(e) => {
                          if (!coordinateError) {
                            e.target.style.borderColor = 'rgba(90, 200, 250, 0.15)';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      />
                      {!isLoadingLocation && !coordinateError && (
                        <p className="mt-2 text-ink-500 flex items-center gap-1.5" style={{ fontSize: '12px' }}>
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
                          ? 'rgba(100, 116, 139, 0.2)'
                          : 'linear-gradient(135deg, #5AC8FA 0%, #1BA351 100%)',
                        boxShadow: isLoadingLocation 
                          ? 'none' 
                          : '0 4px 12px rgba(90, 200, 250, 0.3)',
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
                        background: 'rgba(254, 202, 202, 0.3)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      <p className="text-red-700 flex items-start gap-2" style={{ fontSize: '13px', lineHeight: '1.5' }}>
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
                        background: 'rgba(254, 243, 199, 0.4)',
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
                      : { scale: 1.02, y: -2 }
                  }
                  whileTap={
                    !selectedImage || !description || isSubmitting ? {} : { scale: 0.98 }
                  }
                  transition={{ duration: 0.2 }}
                  className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300"
                  style={{
                    background:
                      !selectedImage || !description || isSubmitting
                        ? 'rgba(100, 116, 139, 0.3)'
                        : 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
                    boxShadow:
                      !selectedImage || !description || isSubmitting
                        ? 'none'
                        : '0 8px 24px rgba(26, 163, 81, 0.3)',
                    cursor:
                      !selectedImage || !description || isSubmitting
                        ? 'not-allowed'
                        : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span className="text-white" style={{ fontSize: '17px', fontWeight: 600 }}>
                        Mengirim...
                      </span>
                    </>
                  ) : (
                    <>
                      <Send size={20} className="text-white" strokeWidth={2.5} />
                      <span className="text-white" style={{ fontSize: '17px', fontWeight: 600 }}>
                        Kirim Laporan
                      </span>
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
                background: 'linear-gradient(135deg, rgba(26, 163, 81, 0.15) 0%, rgba(90, 200, 250, 0.15) 100%)',
                border: '2px solid rgba(26, 163, 81, 0.3)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
                }}
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
                <p className="text-ink-900 mb-1" style={{ fontSize: '17px', fontWeight: 600 }}>
                  Laporan Berhasil Dikirim!
                </p>
                <p className="text-ink-700" style={{ fontSize: '15px' }}>
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
            className="mt-8 p-5 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(26, 163, 81, 0.1)',
            }}
          >
            <p className="text-ink-700 text-center" style={{ fontSize: '14px', lineHeight: '1.6' }}>
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
