// src/components/AboutSection.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

interface AccordionItem {
  id: number;
  index: string;
  title: string;
  summary: string;
  detail: string;
  stat: string;
  statLabel: string;
}

const items: AccordionItem[] = [
  {
    id: 1,
    index: '01',
    title: 'Platform Geospasial Terpadu',
    summary: 'Semua data kesehatan dan lingkungan Banjarbaru dalam satu peta interaktif.',
    detail:
      'SIHAT mengintegrasikan lapisan data fasilitas kesehatan, sebaran penduduk, kasus stunting, kepadatan wilayah, dan infrastruktur kota dalam satu antarmuka peta berbasis MapLibre GL. Setiap lapisan dapat diaktifkan, difilter, dan dibandingkan secara real-time untuk mendukung pengambilan keputusan berbasis data.',
    stat: '11+',
    statLabel: 'Lapisan Data',
  },
  {
    id: 2,
    index: '02',
    title: 'Pelaporan Berbasis Komunitas',
    summary: 'Warga melaporkan isu lingkungan langsung dari lokasi dengan foto dan koordinat GPS otomatis.',
    detail:
      'Fitur laporan memungkinkan siapapun mendokumentasikan isu seperti sampah ilegal, drainase tersumbat, atau fasilitas rusak. Laporan terverifikasi langsung muncul di peta dan tersinkronisasi ke dashboard dinas terkait untuk tindak lanjut. Transparansi penuh — semua laporan publik dan dapat diakses siapapun.',
    stat: '100%',
    statLabel: 'Transparan & Publik',
  },
  {
    id: 3,
    index: '03',
    title: 'Kolaborasi Data Lintas Sektor',
    summary: 'Integrasi BPS, Dinkes, dan lembaga lingkungan dalam ekosistem data yang terhubung.',
    detail:
      'SIHAT dirancang sebagai infrastruktur data terbuka yang mendukung sinkronisasi dari berbagai sumber: BPS untuk data demografi, Dinas Kesehatan untuk indikator SDG, dan lembaga lingkungan untuk monitoring kualitas udara dan air. Chatbot AI membantu menginterpretasi data dalam bahasa natural.',
    stat: 'SDG 11',
    statLabel: 'Tujuan Pembangunan',
  },
];

function AccordionRow({ item, isOpen, onToggle }: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ borderTop: '1px solid #e4e4e7' }}>
      {/* Header row — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left py-7 sm:py-8 flex items-start gap-5 sm:gap-8 group"
        aria-expanded={isOpen}
      >
        {/* Index number */}
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.04em',
            color: isOpen ? '#059669' : '#71717a',
            transition: 'color 0.3s',
            flexShrink: 0,
            marginTop: '4px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {item.index}
        </span>

        {/* Title + summary */}
        <div className="flex-1 min-w-0">
          <div
            style={{
              fontSize: 'clamp(20px, 2.5vw, 28px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: isOpen ? '#0a0a0b' : '#3f3f46',
              transition: 'color 0.3s',
              lineHeight: 1.2,
            }}
          >
            {item.title}
          </div>
          <div
            style={{
              fontSize: '15px',
              color: '#71717a',
              marginTop: '6px',
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            {item.summary}
          </div>
        </div>

        {/* Toggle icon */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid #e4e4e7',
            backgroundColor: isOpen ? '#059669' : '#f4f4f5',
            transition: 'all 0.3s',
            marginTop: '2px',
          }}
        >
          {isOpen
            ? <Minus size={16} color="#fff" strokeWidth={2.5} />
            : <Plus size={16} color="#71717a" strokeWidth={2.5} />
          }
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pb-8 pl-[calc(13px+1.25rem+2rem)] sm:pl-[calc(13px+2rem+2rem)]">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
                {/* Detail text */}
                <p
                  className="flex-1"
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.75,
                    color: '#3f3f46',
                    maxWidth: '560px',
                  }}
                >
                  {item.detail}
                </p>

                {/* Stat pill */}
                <div
                  className="flex-shrink-0"
                  style={{
                    padding: '20px 28px',
                    borderRadius: '16px',
                    border: '1px solid #e4e4e7',
                    backgroundColor: '#f4f4f5',
                    textAlign: 'center',
                    minWidth: '120px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 'clamp(28px, 3vw, 36px)',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      background: 'linear-gradient(135deg, #059669, #22d3ee)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      lineHeight: 1,
                    }}
                  >
                    {item.stat}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#71717a',
                      marginTop: '6px',
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.statLabel}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AboutSection() {
  const [openId, setOpenId] = useState<number>(1);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? 0 : id));
  };

  return (
    <section
      id="tentang"
      className="relative overflow-hidden bg-white"
      style={{
        paddingTop: 'clamp(64px, 8vw, 120px)',
        paddingBottom: 'clamp(64px, 8vw, 120px)',
      }}
    >
      {/* Subtle green radial glow top-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5,150,105,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 sm:mb-16"
        >
          {/* Label */}
          <div
            className="inline-flex items-center gap-2 mb-5"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--brand-green)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '20px',
                height: '1px',
                backgroundColor: 'var(--brand-green)',
              }}
            />
            Sustainable Cities and Settlements
          </div>

          {/* Big headline */}
          <h2
            style={{
              fontSize: 'clamp(32px, 5vw, 60px)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              color: '#0a0a0b',
            }}
          >
            Infrastruktur data
            <br />
            <span style={{ color: '#71717a' }}>untuk kota yang lebih baik.</span>
          </h2>
        </motion.div>

        {/* Accordion list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {items.map((item) => (
            <AccordionRow
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => toggle(item.id)}
            />
          ))}
          {/* Bottom border */}
          <div style={{ borderTop: '1px solid #e4e4e7' }} />
        </motion.div>

      </div>
    </section>
  );
}
