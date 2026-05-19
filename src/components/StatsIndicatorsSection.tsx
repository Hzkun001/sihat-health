import { SectionReveal } from './SectionReveal';
import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';

interface Indicator {
  name: string;
  target: number;
  current: number;
  unit: string;
  status: 'tercapai' | 'hampir' | 'belum';
}
const indicators: Indicator[] = [
  {
    name: 'Akses Air Minum Layak',
    target: 100,
    current: 92,
    unit: '% rumah tangga',
    status: 'hampir',
  },
  {
    name: 'Akses Sanitasi Layak',
    target: 100,
    current: 88,
    unit: '% rumah tangga',
    status: 'hampir',
  },
  {
    name: 'Kawasan Permukiman Kumuh',
    target: 0,
    current: 6,
    unit: '% luas wilayah',
    status: 'hampir',
  },
  {
    name: 'Akses Transportasi Umum',
    target: 90,
    current: 75,
    unit: '% penduduk',
    status: 'hampir',
  },
  {
    name: 'Ruang Terbuka Hijau Perkotaan',
    target: 30,
    current: 22,
    unit: '% luas kota',
    status: 'hampir',
  },
  {
    name: 'Pengelolaan Sampah Terlayani',
    target: 100,
    current: 85,
    unit: '% timbulan sampah',
    status: 'hampir',
  },
  {
    name: 'Kepadatan Penduduk Terkelola',
    target: 150,
    current: 165,
    unit: 'jiwa per hektar',
    status: 'belum',
  },
  {
    name: 'Ketersediaan Infrastruktur Dasar',
    target: 100,
    current: 90,
    unit: '% wilayah',
    status: 'hampir',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'tercapai':
      return '#059669';
    case 'hampir':
      return '#F59E0B';
    case 'belum':
      return '#EF4444';
    default:
      return '#059669';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'tercapai':
      return 'Tercapai';
    case 'hampir':
      return 'Hampir';
    case 'belum':
      return 'Belum';
    default:
      return 'Tercapai';
  }
};

function IndicatorBar({ indicator, delay }: { indicator: Indicator; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const percentage = indicator.status === 'tercapai' ? 100 : (indicator.current / indicator.target) * 100;
  const displayPercentage = Math.min(percentage, 100);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="mb-1" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-900)' }}>
            {indicator.name}
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--ink-500)' }}>
            Target: {indicator.target} {indicator.unit} | Data BPS 2024
          </p>
        </div>
        <div className="text-right ml-4">
          <div className="mb-1" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink-900)' }}>
            {indicator.current}
          </div>
          <div
            className="inline-flex items-center px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${getStatusColor(indicator.status)}12`,
              color: getStatusColor(indicator.status),
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {getStatusText(indicator.status)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-200)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${displayPercentage}%` } : { width: 0 }}
          transition={{ duration: 1, delay: delay + 0.2, ease: [0.25, 0.8, 0.25, 1] }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            backgroundColor: getStatusColor(indicator.status),
          }}
        />
      </div>
    </motion.div>
  );
}

export function StatsIndicatorsSection() {
  return (
    <section className="relative py-24 sm:py-28 lg:py-32" style={{ backgroundColor: 'var(--surface-0)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center mb-16">
            <h2
              className="tracking-tight mb-4"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}
            >
              Indikator SDG 11 Banjarbaru
            </h2>
            <p className="max-w-3xl mx-auto" style={{ fontSize: '18px', color: 'var(--ink-500)' }}>
              Pencapaian target Lingkungan Sehat berdasarkan Sustainable Development Goals 2024
            </p>
          </div>
        </SectionReveal>

        <div className="max-w-5xl mx-auto space-y-8">
          {indicators.map((indicator, index) => (
            <IndicatorBar key={indicator.name} indicator={indicator} delay={index * 0.08} />
          ))}
        </div>

        {/* Legend */}
        <SectionReveal delay={0.5}>
          <div className="flex flex-wrap justify-center items-center gap-6 mt-12 pt-12" style={{ borderTop: '1px solid var(--surface-200)' }}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#059669' }} />
              <span style={{ fontSize: '13px', color: 'var(--ink-500)' }}>Tercapai</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
              <span style={{ fontSize: '13px', color: 'var(--ink-500)' }}>Hampir Tercapai</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }} />
              <span style={{ fontSize: '13px', color: 'var(--ink-500)' }}>Belum Tercapai</span>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
