import { motion } from 'motion/react';
import { Heart, Activity, TrendingUp, Globe, Database, Users } from 'lucide-react';

const partners = [
  { name: 'Dinas Kesehatan Banjarbaru', icon: Activity, color: '#1BA351' },
  { name: 'BPS Kalimantan Selatan', icon: TrendingUp, color: '#5AC8FA' },
  { name: 'WHO Indonesia', icon: Heart, color: '#00A0DD' },
  { name: 'Kementerian Kesehatan RI', icon: Users, color: '#1BA351' },
  { name: 'UNDP Indonesia', icon: Globe, color: '#0468B1' },
  { name: 'SDG Indonesia', icon: Database, color: '#5AC8FA' },
];

export function PartnersBox() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
      viewport={{ once: true }}
      className="lg:hidden w-full"
    >
      <div
        className="relative rounded-2xl md:rounded-3xl overflow-hidden"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.78)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(27, 163, 81, 0.15)',
        }}
      >
        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #E9FFF3 0%, #EAF9FF 100%)',
          }}
        />

        <div className="relative px-4 py-4 md:px-6 md:py-5">
          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-ink-900 mb-4"
            style={{
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: 500,
              letterSpacing: '0.01em',
            }}
          >
            Sumber Berita & Partner Data
          </motion.h3>

          {/* Partners Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {partners.map((partner, index) => (
              <motion.button
                key={partner.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-2.5 md:gap-3 p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  border: '1px solid rgba(27, 163, 81, 0.08)',
                }}
              >
                {/* Icon container */}
                <div
                  className="flex-shrink-0 w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-md"
                  style={{
                    backgroundColor: `${partner.color}12`,
                  }}
                >
                  <partner.icon
                    size={18}
                    className="md:w-5 md:h-5 transition-all duration-300"
                    style={{
                      color: partner.color,
                      opacity: 0.8,
                    }}
                    strokeWidth={2.5}
                  />
                </div>

                {/* Partner name */}
                <span
                  className="text-left text-ink-700 transition-colors duration-300 group-hover:text-ink-900 flex-1 leading-tight"
                  style={{
                    fontSize: 'clamp(11px, 2.5vw, 13px)',
                    fontWeight: 500,
                  }}
                >
                  {partner.name}
                </span>

                {/* Hover indicator */}
                <div
                  className="absolute inset-0 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${partner.color}08 0%, transparent 100%)`,
                  }}
                />
              </motion.button>
            ))}
          </div>

          {/* Verification note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-3 md:mt-4 text-ink-500 text-center"
            style={{
              fontSize: 'clamp(10px, 2vw, 12px)',
              fontWeight: 400,
            }}
          >
            Data diverifikasi dari sumber resmi
          </motion.p>
        </div>

        {/* Inner border glow */}
        <div
          className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none"
          style={{
            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.5)',
          }}
        />
      </div>
    </motion.div>
  );
}
