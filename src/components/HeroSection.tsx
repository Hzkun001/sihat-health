import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import HeroVisual3D from './HeroVisual3D';
import { StaticParticles } from './StaticParticles';

export function HeroSection() {

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
      }}
    >
      {/* Static Particles Background - Lightweight */}
      <div className="absolute inset-0 z-0">
        <StaticParticles />
      </div>

      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto px-6 lg:px-8 py-32 gap-12 items-center z-10">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.9, 
            delay: 0.2, 
            ease: [0.25, 0.8, 0.25, 1],
            staggerChildren: 0.08,
            delayChildren: 0.4
          }}
          className="relative z-10"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white tracking-tight leading-tight mb-6"
            style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 700 }}
          >
            Membangun Masyarakat Sehat di Banjarbaru
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.48 }}
            className="text-white/90 leading-relaxed mb-6"
            style={{ fontSize: 'clamp(16px, 1.5vw, 20px)' }}
          >
            Platform data kesehatan berbasis SDG 3 untuk mendukung kesehatan dan kesejahteraan yang baik bagi seluruh masyarakat Banjarbaru.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.56 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <motion.a
              href="#laporan"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-green rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{ fontSize: '16px', fontWeight: 600 }}
            >
              Laporkan Masalah
            </motion.a>
            <motion.a
              href="#peta"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
              style={{ fontSize: '16px', fontWeight: 600 }}
            >
              Peta Interaktif
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Right - 3D Scientific Visual */}
        <motion.div
          className="relative z-20 block"
        >  
          <div className="relative w-full h-[600px] rounded-2xl flex items-center justify-center overflow-hidden" >
            <HeroVisual3D />
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2, ease: [0.25, 0.8, 0.25, 1] }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center space-y-2"
      >
        <motion.span 
          className="text-white/70 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Scroll to explore
        </motion.span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="text-white/70" size={24} />
        </motion.div>
      </motion.div>
    </section>
  );
}
