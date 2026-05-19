import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from 'lucide-react';

interface NewsCard {
  id: number;
  date: string;
  category: string;
  title: string;
  excerpt: string;
}

interface NewsSlide {
  id: number;
  cards: NewsCard[];
}

const slidesData: NewsSlide[] = [
  {
    id: 1,
    cards: [
      {
        id: 1,
        date: '12 Oktober 2025',
        category: 'Program Kesehatan',
        title: 'Program Pencegahan DBD Banjarbaru Tahun 2025',
        excerpt: 'Dinas Kesehatan Banjarbaru meluncurkan program fogging dan edukasi masyarakat untuk mengurangi kasus DBD.',
      },
      {
        id: 2,
        date: '8 Oktober 2025',
        category: 'Fasilitas',
        title: 'Peningkatan Layanan Kesehatan di 12 Puskesmas',
        excerpt: 'Pemerintah menambah tenaga medis dan fasilitas untuk memperluas akses layanan.',
      },
      {
        id: 3,
        date: '5 Oktober 2025',
        category: 'Edukasi',
        title: 'Gerakan Hidup Sehat di Sekolah Dasar',
        excerpt: 'Kampanye edukasi kebersihan dan pola makan sehat bagi siswa sekolah dasar di Banjarbaru.',
      },

    ],
  },
  {
    id: 2,
    cards: [
      {
        id: 4,
        date: '28 September 2025',
        category: 'Vaksinasi',
        title: 'Cakupan Imunisasi Dasar Capai 94%',
        excerpt: 'Kolaborasi puskesmas & kader meningkatkan kunjungan balita untuk imunisasi.',
      },
      {
        id: 5,
        date: '25 September 2025',
        category: 'Lingkungan',
        title: 'Pemantauan Kualitas Udara Terintegrasi',
        excerpt: 'Integrasi sensor PM2.5 dengan pelaporan batuk/ISPA di seluruh wilayah.',
      },
      {
        id: 6,
        date: '22 September 2025',
        category: 'Ibu & Anak',
        title: 'Kelas Ibu Hamil: Nutrisi & ANC',
        excerpt: 'Konseling gizi, pemeriksaan HB, dan jadwal K4 untuk ibu hamil.',
      },
    ],
  },
  {
    id: 3,
    cards: [
      {
        id: 7,
        date: '10 September 2025',
        category: 'Posyandu',
        title: 'Posyandu Aktif 89 Titik',
        excerpt: 'Fokus deteksi dini stunting & edukasi ASI eksklusif untuk ibu muda.',
      },
      {
        id: 8,
        date: '7 September 2025',
        category: 'Kedaruratan',
        title: 'Simulasi Tanggap Bencana Kesehatan',
        excerpt: 'Latihan koordinasi lintas OPD untuk evakuasi cepat saat darurat.',
      },
      {
        id: 9,
        date: '5 September 2025',
        category: 'Kemitraan',
        title: 'Kolaborasi Data SIHAT x BPS Kalsel',
        excerpt: 'Harmonisasi metadata dan frekuensi pembaruan data kesehatan.',
      },
    ],
  },
];

export function NewsSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const totalSlides = slidesData.length;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  }, [currentSlide]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -30 : 30,
      opacity: 0,
    }),
  };

  return (
    <div className="relative mt-12 lg:mt-16">
      {/* Slider Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
        viewport={{ once: true, amount: 0.3 }}
        className="text-center mb-8 lg:mb-10"
      >
        <div className="inline-flex items-center px-3.5 py-1.5 rounded-full mb-3" style={{ backgroundColor: 'var(--surface-100)', border: '1px solid var(--surface-200)' }}>
          <span style={{ color: 'var(--brand-green)', fontSize: '14px', fontWeight: 600 }}>
            Berita
          </span>
        </div>
        <h3
          className="mb-2"
          style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, lineHeight: 1.2, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}
        >
          Berita Lingkungan Terkini
        </h3>
        <p style={{ fontSize: '16px', color: 'var(--ink-500)' }}>
          Update seputar lingkungan dan program lingkungan di Banjarbaru
        </p>
      </motion.div>

      {/* Slides Container */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'tween', duration: 0.35, ease: [0.25, 0.8, 0.25, 1] },
              opacity: { duration: 0.3 },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            style={{ willChange: 'transform, opacity' }}
          >
            {slidesData[currentSlide].cards.map((card, index) => (
              <motion.article
                key={card.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: [0.25, 0.8, 0.25, 1],
                }}
                className="group cursor-pointer rounded-2xl p-6"
                style={{
                  backgroundColor: 'var(--surface-0)',
                  border: '1px solid var(--surface-200)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  willChange: 'transform, box-shadow',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                }}
              >
                {/* Date & Category */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} style={{ color: 'var(--ink-500)' }} strokeWidth={2.5} />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-500)' }}>
                      {card.date}
                    </span>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--brand-mint)',
                      color: 'var(--brand-green-dark)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {card.category}
                  </span>
                </div>

                {/* Title */}
                <h4
                  className="mb-3"
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    lineHeight: 1.35,
                    color: 'var(--ink-900)',
                    transition: 'color 0.2s',
                  }}
                >
                  {card.title}
                </h4>

                {/* Excerpt */}
                <p
                  className="mb-4 line-clamp-3"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    color: 'var(--ink-500)',
                    lineHeight: 1.6,
                  }}
                >
                  {card.excerpt}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-2 mt-auto">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brand-green)' }}>
                    Baca Selengkapnya
                  </span>
                  <ArrowRight size={14} style={{ color: 'var(--brand-green)' }} strokeWidth={2.5} />
                </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.8, 0.25, 1] }}
        viewport={{ once: true, amount: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 lg:mt-12"
      >
        {/* Arrow Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full transition-all duration-200"
            style={{
              backgroundColor: 'var(--surface-0)',
              border: '1px solid var(--surface-200)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} style={{ color: 'var(--ink-700)' }} strokeWidth={2.5} />
          </button>

          {/* Slide Counter */}
          <div className="flex items-center gap-2 px-4">
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--brand-green)' }}>
              {String(currentSlide + 1).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--ink-500)' }}>
              /
            </span>
            <span style={{ fontSize: '14px', color: 'var(--ink-500)' }}>
              {String(totalSlides).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={nextSlide}
            className="p-3 rounded-full transition-all duration-200"
            style={{
              backgroundColor: 'var(--surface-0)',
              border: '1px solid var(--surface-200)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
            aria-label="Next slide"
          >
            <ChevronRight size={18} style={{ color: 'var(--ink-700)' }} strokeWidth={2.5} />
          </button>
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center gap-2">
          {slidesData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="rounded-full transition-all duration-300"
              style={{
                width: currentSlide === index ? '24px' : '8px',
                height: '8px',
                backgroundColor: currentSlide === index ? 'var(--brand-green)' : 'var(--surface-200)',
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
