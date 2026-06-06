// src/components/BentoFeatures.tsx
import { motion } from 'motion/react';
import { Map, MessageSquareWarning, BarChart3, Bot, Newspaper } from 'lucide-react';

interface BentoCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  span: string; // grid span class
  accent: string; // gradient accent
}

const cards: BentoCard[] = [
  {
    icon: <Map size={22} />,
    title: 'Peta Interaktif',
    description: 'Visualisasi geospasial fasilitas kesehatan, sebaran penduduk, dan infrastruktur Banjarmasin–Banjarbaru.',
    href: '#/peta',
    span: 'col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-2',
    accent: 'from-[#b9a9f5]/20 to-[#f1f0ea]/40',
  },
  {
    icon: <MessageSquareWarning size={20} />,
    title: 'Laporan Warga',
    description: 'Laporkan isu lingkungan langsung dengan foto dan koordinat otomatis.',
    href: '#/laporan',
    span: 'col-span-1 sm:col-span-1 lg:col-span-1',
    accent: 'from-[#dedbd1]/35 to-[#b9a9f5]/10',
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'Statistik & Indikator',
    description: 'Data stunting, kepadatan, dan indikator SDG 11 divisualisasikan interaktif.',
    href: '#/insight',
    span: 'col-span-1 sm:col-span-1 lg:col-span-1',
    accent: 'from-[#b9a9f5]/15 to-[#465047]/5',
  },
  {
    icon: <Bot size={20} />,
    title: 'AI Chatbot',
    description: 'Tanya seputar data kesehatan dan lingkungan Banjarmasin–Banjarbaru.',
    href: '#/',
    span: 'col-span-1 sm:col-span-1 lg:col-span-1',
    accent: 'from-[#8f80db]/12 to-[#f1f0ea]/40',
  },
  {
    icon: <Newspaper size={20} />,
    title: 'Sumber Data',
    description: 'Rujukan data fasilitas, kependudukan, dan indikator wilayah dengan cakupan serta periode yang berbeda.',
    href: '#/insight',
    span: 'col-span-1 sm:col-span-1 lg:col-span-1',
    accent: 'from-[#d9d6ca]/35 to-[#b9a9f5]/10',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.8, 0.25, 1] },
  },
};

export function BentoFeatures() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-32 overflow-hidden" style={{ backgroundColor: 'var(--surface-0)' }}>
      {/* Subtle top gradient fade */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(241,240,234,1) 0%, transparent 100%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              backgroundColor: 'var(--surface-100)',
              color: 'var(--brand-green)',
              border: '1px solid var(--surface-200)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--brand-blue)' }} />
            Fitur Platform
          </span>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--ink-900)',
            }}
          >
            Semua yang kamu butuhkan,
            <br className="hidden sm:block" />
            <span style={{ color: 'var(--brand-green)' }}> dalam satu platform</span>
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {cards.map((card, index) => (
            <motion.a
              key={index}
              href={card.href}
              variants={cardVariants}
              className={`${card.span} group relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 transition-all duration-300 cursor-pointer overflow-hidden`}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--surface-200)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
              whileHover={{
                y: -4,
                boxShadow: '0 12px 40px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              {/* Gradient accent background */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${card.accent}`}
              />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300"
                  style={{
                    backgroundColor: 'var(--surface-100)',
                    color: 'var(--brand-green)',
                  }}
                >
                  {card.icon}
                </div>

                {/* Text */}
                <h3
                  className="mb-2"
                  style={{
                    fontSize: index === 0 ? '20px' : '16px',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    color: 'var(--ink-900)',
                  }}
                >
                  {card.title}
                </h3>
                <p
                  className="flex-1"
                  style={{
                    fontSize: index === 0 ? '15px' : '14px',
                    lineHeight: 1.6,
                    color: 'var(--ink-600, #52525b)',
                  }}
                >
                  {card.description}
                </p>

                {/* Arrow indicator */}
                <div className="mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--brand-green)' }}>Jelajahi</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--brand-green)' }}>
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
