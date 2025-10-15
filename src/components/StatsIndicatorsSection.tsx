
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
  { name: 'Rasio Kematian Ibu', target: 70, current: 68, unit: 'per 100.000 kelahiran', status: 'tercapai' },
  { name: 'Angka Kematian Bayi', target: 12, current: 15, unit: 'per 1.000 kelahiran', status: 'hampir' },
  { name: 'Angka Kematian Balita', target: 25, current: 18, unit: 'per 1.000 kelahiran', status: 'tercapai' },
  { name: 'Prevalensi HIV/AIDS', target: 0.1, current: 0.08, unit: '% populasi', status: 'tercapai' },
  { name: 'Prevalensi Tuberkulosis', target: 60, current: 72, unit: 'per 100.000 penduduk', status: 'hampir' },
  { name: 'Cakupan Imunisasi DPT-HB-Hib3', target: 95, current: 92, unit: '% bayi', status: 'hampir' },
  { name: 'Akses Layanan Kesehatan Esensial', target: 80, current: 85, unit: '% penduduk', status: 'tercapai' },
  { name: 'Rasio Tenaga Kesehatan', target: 4.5, current: 5.2, unit: 'per 1.000 penduduk', status: 'tercapai' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'tercapai':
      return '#1BA351';
    case 'hampir':
      return '#F59E0B';
    case 'belum':
      return '#EF4444';
    default:
      return '#1BA351';
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
          <h4 className="text-ink-900 mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
            {indicator.name}
          </h4>
          <p className="text-ink-500 text-sm">
            Target: {indicator.target} {indicator.unit} | Data BPS 2024
          </p>
        </div>
        <div className="text-right ml-4">
          <div className="text-ink-900 mb-1" style={{ fontSize: '20px', fontWeight: 700 }}>
            {indicator.current}
          </div>
          <div
            className="inline-flex items-center px-2 py-1 rounded-full text-xs"
            style={{
              backgroundColor: `${getStatusColor(indicator.status)}15`,
              color: getStatusColor(indicator.status),
              fontWeight: 600,
            }}
          >
            {getStatusText(indicator.status)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden group">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${displayPercentage}%` } : { width: 0 }}
          transition={{ duration: 1, delay: delay + 0.2, ease: [0.25, 0.8, 0.25, 1] }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${getStatusColor(indicator.status)} 0%, ${getStatusColor(indicator.status)}dd 100%)`,
          }}
        />
        {/* Tooltip on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-ink-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap z-10">
            Target: {indicator.target} {indicator.unit}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function StatsIndicatorsSection() {
  return (
    <section className="relative py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center mb-16">
            <h2
              className="text-ink-900 tracking-tight mb-4"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700 }}
            >
              Indikator SDG 3 Banjarbaru
            </h2>
            <p className="text-ink-700 max-w-3xl mx-auto" style={{ fontSize: '18px' }}>
              Pencapaian target kesehatan berdasarkan Sustainable Development Goals 2024
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
          <div className="flex flex-wrap justify-center items-center gap-6 mt-12 pt-12 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#1BA351' }} />
              <span className="text-ink-700 text-sm">Tercapai</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
              <span className="text-ink-700 text-sm">Hampir Tercapai</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EF4444' }} />
              <span className="text-ink-700 text-sm">Belum Tercapai</span>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
