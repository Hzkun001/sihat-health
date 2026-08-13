// src/components/BentoFeatures.tsx
import { motion } from 'motion/react';
import { Map, MessageSquareWarning, BarChart3, Bot, Newspaper } from 'lucide-react';

interface BentoCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  span: string; // grid span class
  accent: string; // subtle accent surface
}

const cards: BentoCard[] = [
  {
    icon: <Map size={22} />,
    title: 'Peta Interaktif',
    description: 'Visualisasi geospasial fasilitas kesehatan, sebaran penduduk, dan infrastruktur Banjarmasin–Banjarbaru.',
    href: '#/peta',
    span: 'col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-2',
    accent: 'bg-[#c7d3c0]/70',
  },
  {
    icon: <MessageSquareWarning size={20} />,
    title: 'Laporan Warga',
    description: 'Laporkan isu lingkungan langsung dengan foto dan koordinat otomatis.',
    href: '#/laporan',
    span: 'col-span-1 sm:col-span-1 lg:col-span-1',
    accent: 'bg-[#e9eee5]/70',
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'Statistik & Indikator',
    description: 'Data stunting, kepadatan, dan indikator SDG 11 divisualisasikan interaktif.',
    href: '#/insight',
    span: 'col-span-1 sm:col-span-1 lg:col-span-1',
    accent: 'bg-[#c7d3c0]/55',
  },
  {
    icon: <Bot size={20} />,
    title: 'AI Chatbot',
    description: 'Tanya seputar data kesehatan dan lingkungan Banjarmasin–Banjarbaru.',
    href: '#/',
    span: 'col-span-1 sm:col-span-1 lg:col-span-1',
    accent: 'bg-[#c8a96b]/20',
  },
  {
    icon: <Newspaper size={20} />,
    title: 'Sumber Data',
    description: 'Rujukan data fasilitas, kependudukan, dan indikator wilayah dengan cakupan serta periode yang berbeda.',
    href: '#/insight',
    span: 'col-span-1 sm:col-span-1 lg:col-span-1',
    accent: 'bg-[#dfe4da]/60',
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
              className={`${card.span} group relative cursor-pointer overflow-hidden rounded-2xl border border-surface-200 bg-white p-5 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-brand-green/55 hover:shadow-[0_16px_34px_rgba(104,115,101,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:ring-offset-2 sm:rounded-3xl sm:p-6 lg:p-7`}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="absolute inset-x-5 top-0 h-0.5 origin-left scale-x-0 bg-brand-green transition-transform duration-300 group-hover:scale-x-100 sm:inset-x-6 lg:inset-x-7" aria-hidden="true" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Icon */}
                <div
                  className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-100 text-brand-green transition-[background-color,transform] duration-300 group-hover:scale-105 group-hover:bg-brand-mint"
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
                    color: 'var(--ink-600)',
                  }}
                >
                  {card.description}
                </p>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-brand-green/70 transition-colors group-hover:text-brand-green">
                  <span>Jelajahi</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
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
