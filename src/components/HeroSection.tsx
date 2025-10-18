// src/components/HeroSection.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import HeroVisual3D from './HeroVisual3D';
import { StaticParticles } from './StaticParticles';
import Waves from './waves';

export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [showWaves, setShowWaves] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowWaves(entry.isIntersecting && entry.intersectionRatio >= 0.2),
      { threshold: [0, 0.2, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const prefersReduced = useMemo(
    () => (typeof window !== 'undefined'
      ? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      : false),
    []
  );

  const wavesProps = useMemo(
    () => ({
      lineColor: '#ffffff48',
      backgroundColor: 'rgba(255,255,255,0.18)',
      waveSpeedX: 0.012,
      waveSpeedY: 0.006,
      waveAmpX: 14,
      waveAmpY: 20,
      xGap: 10,
      yGap: 22,
      friction: 0.7,
      tension: 0.02,
      maxCursorMove: 40,
    }),
    []
  );

  return (
    <section
      ref={sectionRef}
      id="hero"
      // svh = safe viewport height, lebih akurat di mobile
      className="relative min-h-[100svh] flex items-stretch overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)' }}
    >
      {/* Layer 1: Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <StaticParticles />
      </div>

      {/* Layer 2: Waves */}
      {(showWaves && !prefersReduced) && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <Waves {...wavesProps} />
        </div>
      )}

      {/* Layer 3: Konten */}
      <div
        className="
          relative z-20 w-full
          grid
          // Mobile: stack, 3D duluan lalu teks; Desktop: 2 kolom
          grid-cols-1 lg:grid-cols-2
          // Tinggi penuh viewport mobile, relax di desktop
          min-h-[100svh]
          // Padding responsif
          px-4 sm:px-6 lg:px-8
          pt-[8svh] pb-[10svh] sm:pt-[10svh] sm:pb-[12svh] lg:py-32
          gap-6 sm:gap-8 lg:gap-12
          items-center
          max-w-7xl mx-auto
        "
      >
        {/* --- 3D BLOCK (Mobile di atas) --- */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
          className="
            order-1 lg:order-2
            relative
            h-[40svh] sm:h-[48svh] md:h-[54svh] lg:h-[600px]
            rounded-2xl overflow-hidden
            flex items-center justify-center
            shadow-xl
            bg-white/5
          "
        >
          <HeroVisual3D />
        </motion.div>

        {/* --- TEKS BLOCK (Mobile di bawah) --- */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.9,
            delay: 0.1,
            ease: [0.25, 0.8, 0.25, 1],
            staggerChildren: 0.08,
            delayChildren: 0.2,
          }}
          // Mobile: order-2 (di bawah), Desktop: kolom kiri
          className="order-2 lg:order-1 relative"
        >
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-white tracking-tight leading-tight mb-4 sm:mb-5 lg:mb-6"
            style={{ fontSize: 'clamp(28px, 5vw, 64px)', fontWeight: 700 }}
          >
            Membangun Masyarakat Sehat <span>di Banjarbaru</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="text-white/90 leading-relaxed mb-5 sm:mb-6"
            style={{ fontSize: 'clamp(15px, 1.4vw, 20px)' }}
          >
            Platform data kesehatan berbasis SDG 3 untuk mendukung kesehatan dan kesejahteraan yang
            baik bagi seluruh masyarakat Banjarbaru.
          </motion.p>

          {/* CTA cards responsif, tidak mendorong tinggi berlebih */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4 pt-1"
          >
            <motion.a
              href="#laporan"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-6 sm:px-7 lg:px-8 py-3.5 sm:py-4
                         bg-white text-brand-green rounded-xl transition-all duration-300
                         shadow-lg hover:shadow-xl"
              style={{ fontSize: '15px', fontWeight: 600 }}
            >
              Laporkan Masalah
            </motion.a>
            <motion.a
              href="#peta"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-6 sm:px-7 lg:px-8 py-3.5 sm:py-4
                         bg-white/10 text-white border-2 border-white/30 rounded-xl
                         hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
              style={{ fontSize: '15px', fontWeight: 600 }}
            >
              Peta Kesehatan
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9, ease: [0.25, 0.8, 0.25, 1] }}
        className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center space-y-1.5 sm:space-y-2"
      >
        <motion.span
          className="text-white/70 text-xs sm:text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Scroll to explore
        </motion.span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown className="text-white/70" size={22} />
        </motion.div>
      </motion.div>
    </section>
  );
}
