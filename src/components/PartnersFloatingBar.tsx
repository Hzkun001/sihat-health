import { motion } from 'motion/react';

const partners = [
  { name: 'WHO', image: 'assets/who.png' },
  { name: 'Dinkes', image: 'assets/dinkes.png' },
  { name: 'BPS', image: 'assets/BPS.png' },
   { name: 'Geoportal', image: 'assets/geoportal.png'},
  { name: 'GEE', image: 'assets/GEE.png'},
  { name: 'Vercel', image: 'assets/vercel.png'},
   { name: 'Media', image: 'assets/media.png' },
  { name: 'Antara', image: 'assets/antara.png'},
  { name: 'Berita', image: 'assets/berita_banjarbaru.png'},
  { name: 'Radar', image: 'assets/radar.png'},
];

// Komponen kecil biar tidak duplikasi
function LogoItem({ partner }: { partner: {name: string; image: string;} }) {
  return (
    <div
      className="w-20 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover/logo:shadow-lg"
      style={{ backgroundColor: `${partner}12` }}
      title={partner.name}
    >
      <img
        src={partner.image}
        alt={partner.name}
        className="w-8 h-8 object-contain transition-all duration-300 opacity-75 group-hover/logo:opacity-100"
        loading="lazy"
      />
    </div>
  );
}

export function PartnersFloatingBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
      className="fixed bottom-6 z-50 pointer-events-none hidden md:block"
      style={{
        // samakan kiri dengan container navbar (mis. max-w-7xl = 80rem, px-6 = 1.5rem)
        left: 'calc((100vw - 80rem) / 2 + 1.5rem)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <motion.div
        whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(0, 0, 0, 0.14)' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative rounded-2xl overflow-hidden pointer-events-auto group w-[600px] lg:w-[600px]"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.78)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
        }}
      >
        {/* Gradient background overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #E9FFF3 0%, #EAF9FF 100%)' }}
        />

        <div className="relative flex items-center justify-between gap-4 px-6 py-4">
          {/* Left - Text Content */}
          <motion.div
            className="flex items-center gap-3 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div
              className="text-brand-green leading-none"
              style={{ fontSize: '32px', fontWeight: 700 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              10+
            </motion.div>
            <div className="border-l border-ink-900/10 pl-3">
              <p className="text-ink-900 leading-tight" style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '0.03em' }}>
                Partners Data
              </p>
              <p className="text-ink-700 leading-tight" style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '0.03em' }}>
                and Teams
              </p>
            </div>
          </motion.div>

          {/* Right - Partner Logos with Marquee */}
          <div className="flex-1 overflow-hidden min-w-0">
            <div className="relative h-12 flex items-center">
              {/* (opsional) overlay fade di kanan */}

              {/* Marquee Container */}
              <div className="flex gap-3 animate-marquee-bar">
                {/* First set */}
                {partners.map((partner, index) => (
                  <motion.div
                    key={`partner-1-${index}`}
                    className="flex-shrink-0 group/logo"
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LogoItem partner={partner} />
                  </motion.div>
                ))}

                {/* Second set for seamless loop */}
                {partners.map((partner, index) => (
                  <motion.div
                    key={`partner-2-${index}`}
                    className="flex-shrink-0 group/logo"
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LogoItem partner={partner} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Inner border glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.6)' }}
        />
      </motion.div>

      <style>{`
        @keyframes marquee-bar {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-bar { animation: marquee-bar 20s linear infinite; }
        .group:hover .animate-marquee-bar { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-bar { animation: none; }
        }
      `}</style>
    </motion.div>
  );
}
