// src/components/aboutsection.tsx
import { useState, useCallback, useMemo } from 'react';
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
  title: 'Platform Geospasial Banjarbaru',
  content: 'SIHAT adalah platform berbasis geospasial yang mengintegrasikan data lingkungan, dan demografi Kota Banjarbaru dalam satu peta interaktif untuk mendukung pencapaian SDG 11:Kota dan Permukiman yang Berkelanjutan.',
},
{
  id: 2,
  title: 'Pelaporan Masyarakat dan Transparansi Data',
  content:'Melalui fitur pelaporan berbasis kamera dan koordinat otomatis, masyarakat dapat berpartisipasi langsung melaporkan isu lingkungan, seperti sampah ilegal atau jalan rusak. Data laporan tersimpan dan divisualisasikan secara real-time di peta.',
},
{
  id: 3,
  title: 'Kolaborasi dan Integrasi Data Real-time',
  content:'Platform ini mendukung integrasi data lintas sektor, termasuk BPS dan lembaga lingkungan. Dengan visualisasi interaktif, chatbot SIHAT, dan sinkronisasi data real-time, SIHAT memperkuat kolaborasi pemerintah dan masyarakat menuju kota yang sehat dan berkelanjutan.',
}
];

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
              className="mb-4"
              style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}
            >
              {slide.title}
            </h2>
            <p
              className="leading-relaxed"
              style={{ fontSize: 'clamp(16px, 2vw, 18px)', fontWeight: 400, lineHeight: 1.7, color: 'var(--ink-700)' }}
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
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ backgroundColor: 'var(--surface-0)', border: '1px solid var(--surface-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            aria-label="Sebelumnya"
          >
            <ChevronLeft size={20} style={{ color: 'var(--ink-700)' }} strokeWidth={2.5} />
          </button>

          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ backgroundColor: 'var(--surface-0)', border: '1px solid var(--surface-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            aria-label="Berikutnya"
          >
            <ChevronRight size={20} style={{ color: 'var(--ink-700)' }} strokeWidth={2.5} />
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
                  backgroundColor: active ? 'var(--brand-green)' : 'var(--surface-200)',
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
  const chip = useRevealOnce();
  const diagramDesktop = useRevealOnce();
  const diagramMobile = useRevealOnce();

  return (
    <section id="tentang" className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-24 overflow-hidden" style={{ backgroundColor: 'var(--surface-0)' }}>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text Content */}
          <div className="space-y-6">
            {/* Chip */}
            <div
              ref={chip.ref as any}
              className={`inline-block reveal ${chip.visible ? 'is-visible' : ''}`}
            >
              <span
                className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium"
                style={{ backgroundColor: 'var(--surface-100)', color: 'var(--brand-green)', border: '1px solid var(--surface-200)' }}
              >
                Sustainable Cities and Settlements
              </span>
            </div>

            <AboutInfoSlider />
          </div>

          {/* Right - Image */}
          <div className="relative">
            <div
              ref={diagramDesktop.ref as any}
              className={`hidden lg:block relative reveal ${diagramDesktop.visible ? 'is-visible' : ''}`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)', transitionDuration: '.6s' }}
            >
              <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid var(--surface-200)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
                <img
                  src="/assets/sdg11.jpg"
                  alt="SDG 11 Diagram"
                  width="560" height="540"
                  loading="lazy" decoding="async"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
