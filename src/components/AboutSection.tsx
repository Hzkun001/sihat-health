// src/components/aboutsection.tsx
import { useState, useCallback, useMemo } from 'react';
// NOTE: kita tetap bisa pakai motion untuk micro-animasi,
// tapi kita kurangi whileInView yang terus aktif.
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRevealOnce } from '../hooks/useRevealOnce';
import '@/styles/reveal.css';

interface InfoSlide {
  id: number;
  title: string;
  content: string;
}

const infoSlides: InfoSlide[] = [
{
  id: 1,
  title: 'Platform Geospasial Kesehatan Banjarbaru',
  content: 'SIHAT adalah platform berbasis geospasial yang mengintegrasikan data kesehatan, lingkungan, dan demografi Kota Banjarbaru dalam satu peta interaktif untuk mendukung pencapaian SDG 3: Good Health and Well-being.',
},
{
  id: 2,
  title: 'Pelaporan Masyarakat dan Transparansi Data',
  content:'Melalui fitur pelaporan berbasis kamera dan koordinat otomatis, masyarakat dapat berpartisipasi langsung melaporkan isu lingkungan dan kesehatan, seperti sampah ilegal atau jalan rusak. Data laporan tersimpan dan divisualisasikan secara real-time di peta.',
},
{
  id: 3,
  title: 'Kolaborasi dan Integrasi Data Real-time',
  content:'Platform ini mendukung integrasi data lintas sektor, termasuk Dinas Kesehatan, BPS, dan lembaga lingkungan. Dengan visualisasi interaktif, chatbot SIHAT, dan sinkronisasi data real-time, SIHAT memperkuat kolaborasi pemerintah dan masyarakat menuju kota yang sehat dan berkelanjutan.',
}
];

// ---- Slider Info (tetap ringan, tanpa whileInView berulang) ----
function AboutInfoSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = infoSlides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((p) => (p + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((p) => (p - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => setCurrentSlide(index), []);

  const slide = useMemo(() => infoSlides[currentSlide], [currentSlide]);

  return (
    <div aria-roledescription="carousel" aria-label="Tentang SIHAT">
      {/* Slides Container */}
      <div className="relative overflow-hidden min-h-[220px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${currentSlide + 1} dari ${totalSlides}`}
          >
            <h2
              className="text-ink-900 mb-4"
              style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              {slide.title}
            </h2>
            <p
              className="text-ink-700 leading-relaxed"
              style={{ fontSize: 'clamp(16px, 2vw, 18px)', fontWeight: 400, lineHeight: 1.7 }}
            >
              {slide.content}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all duration-200 hover:bg-brand-mint border border-gray-200"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            aria-label="Sebelumnya"
          >
            <ChevronLeft size={20} className="text-ink-700" strokeWidth={2.5} />
          </button>

          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all duration-200 hover:bg-brand-mint border border-gray-200"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            aria-label="Berikutnya"
          >
            <ChevronRight size={20} className="text-ink-700" strokeWidth={2.5} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Pilih slide">
          {infoSlides.map((_, i) => {
            const active = i === currentSlide;
            return (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                role="tab"
                aria-selected={active}
                aria-label={`Ke slide ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: active ? '24px' : '8px',
                  height: '8px',
                  backgroundColor: active ? '#1BA351' : '#D1EDE3',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AboutSection() {
  // Reveal sekali jalan untuk chip, diagram, dan container
  const chip = useRevealOnce();
  const diagramDesktop = useRevealOnce();
  const diagramMobile = useRevealOnce();

  return (
    <section id="tentang" className="relative pt-14 pb-2 sm:pt-16 sm:pb-12 lg:pt-24 lg:pb-20 overflow-hidden">
      {/* Wave Divider (sekali jalan via CSS reveal) */}
      <div className="absolute top-0 left-0 right-0 h-24 -translate-y-full">
        <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0,0 C300,80 600,80 900,0 C1050,40 1150,40 1200,0 L1200,120 L0,120 Z"
            fill="#D8F3DC" opacity="0.3"
          />
        </svg>
      </div>

      {/* Background gradient (non-interaktif, no motion) */}
      <div
        className="absolute inset-0 opacity-50"
        style={{ background: 'linear-gradient(180deg, #E6F8EF 0%, #F9FCFF 100%)' }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text Content */}
          <div className="space-y-6">
            {/* Chip: gunakan CSS reveal sekali jalan */}
            <div
              ref={chip.ref as any}
              className={`inline-block px-4 py-2 bg-brand-mint rounded-full reveal ${chip.visible ? 'is-visible' : ''}`}
            >
              <span className="text-brand-green" style={{ fontSize: '14px', fontWeight: 600 }}>
                Good Health & Well-Being
              </span>
            </div>

            {/* Slider tetap dengan micro-motion (tidak whileInView terus menerus) */}
            <AboutInfoSlider />
          </div>

          {/* Right - Animated Diagram (gambar statis + micro-animasi sekali jalan) */}
          <div className="relative">
            {/* Desktop */}
            <div
              ref={diagramDesktop.ref as any}
              className={`hidden lg:block relative reveal ${diagramDesktop.visible ? 'is-visible' : ''}`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)', transitionDuration: '.6s' }}
            >
              <div className="relative rounded-2xl p-12 shadow-lg">
                {/* Pastikan width/height supaya anti-CLS (ganti sesuai ukuran asli) */}
                <img
                  src="/assets/geoportal.png"
                  alt="SDG 3 Diagram"
                  width="560" height="540"
                  loading="lazy" decoding="async"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
            {/* Mobile/Tablet
            <div
              ref={diagramMobile.ref as any}
              className={`lg:hidden relative reveal ${diagramMobile.visible ? 'is-visible' : ''}`}
              style={{ transitionDuration: '.6s' }}
            >
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
