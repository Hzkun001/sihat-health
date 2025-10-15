import { useState, useCallback } from 'react';
import { SectionReveal } from './SectionReveal';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface InfoSlide {
  id: number;
  title: string;
  content: string;
}

const infoSlides: InfoSlide[] = [
  {
    id: 1,
    title: 'Platform Data Kesehatan untuk Banjarbaru',
    content: 'SIHAT mengintegrasikan data kesehatan masyarakat dengan fokus pada pencapaian SDG 3, menyediakan visualisasi komprehensif dan analisis untuk pengambilan keputusan berbasis data.',
  },
  {
    id: 2,
    title: 'Integrasi Data untuk Pembangunan Berkelanjutan',
    content: 'Melalui integrasi data geospasial dan indikator kesehatan, SIHAT mendukung transparansi serta perencanaan berbasis bukti untuk mendorong kolaborasi lintas sektor.',
  },
  {
    id: 3,
    title: 'Kolaborasi dan Inovasi Digital Kesehatan',
    content: 'Berkolaborasi dengan Dinas Kesehatan, BPS, dan lembaga nasional untuk menyediakan data akurat, mendorong inovasi layanan publik dan analisis spasial interaktif.',
  },
];

function AboutInfoSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = infoSlides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.04 }}
      viewport={{ once: true }}
      className="mt-2"
    >
      {/* Slides Container */}
      <div className="relative overflow-hidden min-h-[240px] md:min-h-[220px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
          >
            {/* Title */}
            <h2
              className="text-ink-900 mb-4"
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {infoSlides[currentSlide].title}
            </h2>

            {/* Content */}
            <p
              className="text-ink-700 leading-relaxed"
              style={{
                fontSize: 'clamp(16px, 2vw, 18px)',
                fontWeight: 400,
                lineHeight: 1.7,
              }}
            >
              {infoSlides[currentSlide].content}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-6">
        {/* Arrow Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={prevSlide}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all duration-200 hover:bg-brand-mint border border-gray-200"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} className="text-ink-700" strokeWidth={2.5} />
          </motion.button>

          <motion.button
            onClick={nextSlide}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all duration-200 hover:bg-brand-mint border border-gray-200"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            aria-label="Next slide"
          >
            <ChevronRight size={20} className="text-ink-700" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center gap-2">
          {infoSlides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-full transition-all duration-300"
              style={{
                width: currentSlide === index ? '24px' : '8px',
                height: '8px',
                backgroundColor: currentSlide === index ? '#1BA351' : '#D1EDE3',
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function AboutSection() {
  return (
    <section id="tentang" className="relative py-24 overflow-hidden">
      {/* Wave Divider */}
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
        viewport={{ once: true }}
        className="absolute top-0 left-0 right-0 h-24 -translate-y-full"
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C300,80 600,80 900,0 C1050,40 1150,40 1200,0 L1200,120 L0,120 Z"
            fill="#D8F3DC"
            opacity="0.3"
          />
        </svg>
      </motion.div>

      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: 'linear-gradient(180deg, #E6F8EF 0%, #F9FCFF 100%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text Content */}
          <SectionReveal>
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 bg-brand-mint rounded-full"
              >
                <span className="text-brand-green" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Good Health & Well-Being
                </span>
              </motion.div>

              {/* Info Slider */}
              <AboutInfoSlider />
            </div>
          </SectionReveal>

          {/* Right - Animated Diagram */}
          <SectionReveal delay={0.2}>
            <div className="relative">
              {/* Desktop: Static diagram with initial animation only */}
              <motion.div 
                className="hidden lg:block relative"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
                viewport={{ once: true }}
              >
                <div
                  className="relative bg-white rounded-2xl p-12 shadow-lg"
                  style={{ 
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  }}
                >
                <img src="assets/sdg3.jpg" alt="Logo" className="w-full h-full object-contain" />
                </div>
              </motion.div>

              {/* Mobile/Tablet: Static with subtle scale */}
              <motion.div
                className="lg:hidden relative"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="relative bg-white rounded-2xl p-6 md:p-8 shadow-lg mx-auto max-w-[500px]">
                  {/* Network Visualization - Mobile */}
                  <svg className="w-full h-auto" viewBox="0 0 400 300" fill="none" preserveAspectRatio="xMidYMid meet">
                    {/* Connections */}
                    <motion.line
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      viewport={{ once: true }}
                      x1="200" y1="150" x2="80" y2="80"
                      stroke="#1BA351" strokeWidth="2" strokeDasharray="4 4" opacity="0.3"
                    />
                    <motion.line
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      viewport={{ once: true }}
                      x1="200" y1="150" x2="320" y2="80"
                      stroke="#5AC8FA" strokeWidth="2" strokeDasharray="4 4" opacity="0.3"
                    />
                    <motion.line
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      viewport={{ once: true }}
                      x1="200" y1="150" x2="80" y2="220"
                      stroke="#1BA351" strokeWidth="2" strokeDasharray="4 4" opacity="0.3"
                    />
                    <motion.line
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      viewport={{ once: true }}
                      x1="200" y1="150" x2="320" y2="220"
                      stroke="#5AC8FA" strokeWidth="2" strokeDasharray="4 4" opacity="0.3"
                    />

                    {/* Central Node */}
                    <motion.circle
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                      cx="200" cy="150" r="40"
                      fill="url(#gradient1-mobile)"
                    />
                    <text x="200" y="155" textAnchor="middle" fill="white" fontSize="14" fontWeight="600" className="select-none">
                      SIHAT
                    </text>

                    {/* Outer Nodes */}
                    <motion.circle
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      viewport={{ once: true }}
                      cx="80" cy="80" r="30" fill="#D8F3DC"
                    />
                    <text x="80" y="85" textAnchor="middle" fill="#1BA351" fontSize="12" className="select-none">Data</text>

                    <motion.circle
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      viewport={{ once: true }}
                      cx="320" cy="80" r="30" fill="#D8F3DC"
                    />
                    <text x="320" y="85" textAnchor="middle" fill="#1BA351" fontSize="12" className="select-none">Analisis</text>

                    <motion.circle
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      viewport={{ once: true }}
                      cx="80" cy="220" r="30" fill="#D8F3DC"
                    />
                    <text x="80" y="225" textAnchor="middle" fill="#1BA351" fontSize="12" className="select-none">Peta</text>

                    <motion.circle
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                      viewport={{ once: true }}
                      cx="320" cy="220" r="30" fill="#D8F3DC"
                    />
                    <text x="320" y="225" textAnchor="middle" fill="#1BA351" fontSize="12" className="select-none">Insight</text>

                    {/* Gradient Definition */}
                    <defs>
                      <linearGradient id="gradient1-mobile" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1BA351" />
                        <stop offset="100%" stopColor="#5AC8FA" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </motion.div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
