import { SectionReveal } from './SectionReveal';
import { MapPin, Filter, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapLayerFilter } from './MapLayerFilter';

export function MapSection() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isFullscreen]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.6));
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <section id="peta" className="relative py-24 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #F9FCFF 0%, #FFFFFF 100%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-brand-mint rounded-full mb-4">
              <span className="text-brand-green" style={{ fontSize: '14px', fontWeight: 600 }}>
                Peta Kesehatan
              </span>
            </div>
            <h2
              className="text-ink-900 tracking-tight mb-4"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700 }}
            >
              Peta Interaktif Kesehatan
            </h2>
            <p className="text-ink-700 max-w-3xl mx-auto" style={{ fontSize: '18px' }}>
              Visualisasi distribusi fasilitas kesehatan dan indikator kesehatan masyarakat Banjarbaru
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          <div className="relative">
            {/* Layout Container */}
            <div className="flex gap-6 lg:gap-8">
              {/* Filter Panel - Desktop Only */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-32">
                  <MapLayerFilter />
                </div>
              </div>

              {/* Map Container */}
              <div className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.005 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-3xl overflow-hidden bg-white"
                  style={{
                    boxShadow: '0 6px 24px rgba(0,0,0,0.05)',
                    height: 'clamp(480px, 60vh, 760px)',
                  }}
                  role="region"
                  aria-label="Interactive health map"
                >
                  {/* Map Placeholder */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(135deg, #E8FFF9 0%, #EAF7FF 100%)',
                      scale: zoomLevel,
                    }}
                    animate={{ scale: zoomLevel }}
                    transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <motion.div
                          className="w-20 h-20 mx-auto rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <MapPin size={36} className="text-brand-green" />
                        </motion.div>
                        <div>
                          <h3 className="text-ink-900 mb-2" style={{ fontSize: '24px', fontWeight: 700 }}>
                            Peta Kesehatan Banjarbaru
                          </h3>
                          <p className="text-ink-700" style={{ fontSize: '16px' }}>
                            Integrasi data geospasial kesehatan
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Filter Button - Mobile & Tablet */}
                  <motion.button
                    onClick={() => setIsFilterOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="lg:hidden absolute top-4 left-4 bg-white rounded-full p-3 md:p-3.5 shadow-lg z-20 backdrop-blur-sm"
                    style={{ 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    }}
                    aria-label="Open filter"
                  >
                    <Filter size={20} className="text-brand-green md:w-[22px] md:h-[22px]" strokeWidth={2.5} />
                  </motion.button>

                  {/* Map Controls - Desktop & Tablet */}
                  <div className="hidden md:block absolute bottom-6 right-6 z-10">
                    <div className="flex flex-col gap-3">
                      {/* Zoom In */}
                      <motion.button
                        onClick={handleZoomIn}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group w-12 h-12 rounded-full bg-white flex items-center justify-center transition-all duration-200"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        aria-label="Zoom in"
                      >
                        <ZoomIn
                          size={20}
                          className="text-ink-700 group-hover:text-white transition-colors"
                          strokeWidth={2.5}
                        />
                        <div
                          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{
                            background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
                          }}
                        />
                        <ZoomIn
                          size={20}
                          className="absolute text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          strokeWidth={2.5}
                        />
                      </motion.button>

                      {/* Zoom Out */}
                      <motion.button
                        onClick={handleZoomOut}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group w-12 h-12 rounded-full bg-white flex items-center justify-center transition-all duration-200"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        aria-label="Zoom out"
                      >
                        <ZoomOut
                          size={20}
                          className="text-ink-700 group-hover:text-white transition-colors"
                          strokeWidth={2.5}
                        />
                        <div
                          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{
                            background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
                          }}
                        />
                        <ZoomOut
                          size={20}
                          className="absolute text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          strokeWidth={2.5}
                        />
                      </motion.button>

                      {/* Fullscreen */}
                      <motion.button
                        onClick={toggleFullscreen}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group w-12 h-12 rounded-full bg-white flex items-center justify-center transition-all duration-200"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        aria-label="Toggle fullscreen"
                      >
                        <Maximize2
                          size={20}
                          className="text-ink-700 group-hover:text-white transition-colors"
                          strokeWidth={2.5}
                        />
                        <div
                          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{
                            background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
                          }}
                        />
                        <Maximize2
                          size={20}
                          className="absolute text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          strokeWidth={2.5}
                        />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Map Controls - Mobile Only (Horizontal below map) */}
                <div className="md:hidden mt-4 flex justify-center gap-2.5 px-4">
                  {/* Zoom In */}
                  <motion.button
                    onClick={handleZoomIn}
                    whileTap={{ scale: 0.96 }}
                    className="relative flex-1 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden active:shadow-lg transition-shadow duration-200"
                    style={{ 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      maxWidth: '80px',
                    }}
                    aria-label="Zoom in map"
                  >
                    <ZoomIn
                      size={20}
                      className="relative z-10 text-ink-700 transition-colors"
                      strokeWidth={2.5}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
                        opacity: 0,
                      }}
                      whileTap={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    />
                  </motion.button>

                  {/* Fullscreen */}
                  <motion.button
                    onClick={toggleFullscreen}
                    whileTap={{ scale: 0.96 }}
                    className="relative flex-1 h-12 rounded-xl bg-white flex items-center justify-center gap-2 overflow-hidden active:shadow-lg transition-shadow duration-200"
                    style={{ 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                    aria-label="Toggle fullscreen"
                  >
                    <Maximize2
                      size={18}
                      className="relative z-10 text-ink-700 transition-colors flex-shrink-0"
                      strokeWidth={2.5}
                    />
                    <span
                      className="relative z-10 text-ink-700 transition-colors text-sm font-semibold"
                    >
                      Layar Penuh
                    </span>
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
                        opacity: 0,
                      }}
                      whileTap={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    />
                  </motion.button>

                  {/* Zoom Out */}
                  <motion.button
                    onClick={handleZoomOut}
                    whileTap={{ scale: 0.96 }}
                    className="relative flex-1 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden active:shadow-lg transition-shadow duration-200"
                    style={{ 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      maxWidth: '80px',
                    }}
                    aria-label="Zoom out map"
                  >
                    <ZoomOut
                      size={20}
                      className="relative z-10 text-ink-700 transition-colors"
                      strokeWidth={2.5}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
                        opacity: 0,
                      }}
                      whileTap={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Filter Drawer */}
            <MapLayerFilter
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              isMobile={isMobile}
            />
          </div>
        </SectionReveal>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
            onClick={toggleFullscreen}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
              className="w-full h-full p-2 sm:p-4 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white">
                {/* Map Content - Fullscreen */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, #E8FFF9 0%, #EAF7FF 100%)',
                    scale: zoomLevel,
                  }}
                  animate={{ scale: zoomLevel }}
                  transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
                >
                  <div className="absolute inset-0 flex items-center justify-center px-4">
                    <div className="text-center space-y-4 sm:space-y-6">
                      <motion.div
                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-sm flex items-center justify-center"
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <MapPin size={36} className="text-brand-green sm:w-10 sm:h-10 md:w-12 md:h-12" />
                      </motion.div>
                      <div>
                        <h3 className="text-ink-900 mb-2 sm:mb-3 px-4" style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700 }}>
                          Peta Kesehatan Banjarbaru
                        </h3>
                        <p className="text-ink-700 px-4" style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}>
                          Integrasi data geospasial kesehatan dalam pengembangan
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Fullscreen Controls - Desktop & Tablet */}
                <div className="hidden sm:block absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-10">
                  <div className="flex flex-col gap-2.5 sm:gap-3">
                    {/* Zoom In */}
                    <motion.button
                      onClick={handleZoomIn}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center transition-all duration-200"
                      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                      aria-label="Zoom in"
                    >
                      <ZoomIn
                        size={22}
                        className="text-ink-700 group-hover:text-white transition-colors sm:w-6 sm:h-6"
                        strokeWidth={2.5}
                      />
                      <div
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{
                          background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
                        }}
                      />
                      <ZoomIn
                        size={22}
                        className="absolute text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 sm:w-6 sm:h-6"
                        strokeWidth={2.5}
                      />
                    </motion.button>

                    {/* Zoom Out */}
                    <motion.button
                      onClick={handleZoomOut}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center transition-all duration-200"
                      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                      aria-label="Zoom out"
                    >
                      <ZoomOut
                        size={22}
                        className="text-ink-700 group-hover:text-white transition-colors sm:w-6 sm:h-6"
                        strokeWidth={2.5}
                      />
                      <div
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{
                          background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
                        }}
                      />
                      <ZoomOut
                        size={22}
                        className="absolute text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 sm:w-6 sm:h-6"
                        strokeWidth={2.5}
                      />
                    </motion.button>
                  </div>
                </div>

                {/* Fullscreen Controls - Mobile Bottom Bar */}
                <div className="sm:hidden absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/40 to-transparent">
                  <div className="flex items-center justify-center gap-3">
                    {/* Zoom Out */}
                    <motion.button
                      onClick={handleZoomOut}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg active:shadow-xl transition-shadow"
                      aria-label="Zoom out"
                    >
                      <ZoomOut size={20} className="text-ink-700" strokeWidth={2.5} />
                    </motion.button>

                    {/* Close */}
                    <motion.button
                      onClick={toggleFullscreen}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 h-12 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center gap-2 shadow-lg active:shadow-xl transition-shadow"
                      aria-label="Close fullscreen"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-ink-700"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <span className="text-ink-900 font-semibold text-sm">Tutup</span>
                    </motion.button>

                    {/* Zoom In */}
                    <motion.button
                      onClick={handleZoomIn}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg active:shadow-xl transition-shadow"
                      aria-label="Zoom in"
                    >
                      <ZoomIn size={20} className="text-ink-700" strokeWidth={2.5} />
                    </motion.button>
                  </div>
                </div>

                {/* Close Fullscreen Button - Desktop & Tablet Top Right */}
                <motion.button
                  onClick={toggleFullscreen}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex absolute top-4 sm:top-6 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm items-center justify-center transition-all duration-200"
                  style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  aria-label="Close fullscreen"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-ink-700 sm:w-6 sm:h-6"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
