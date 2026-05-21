import { SectionReveal } from '@/components/shared/SectionReveal';
import {
  Activity,
  Building2,
  Cross,
  Pill,
  UserCog,
  Ambulance,
  Home,
  Users,
  HeartPulse,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { ComponentType } from 'react';

type IconType = ComponentType<{ size?: number; color?: string; className?: string }>;

type StatItem = {
  icon?: IconType;
  label: string;
  value: string;
};

const statsData: StatItem[] = [
  { icon: Users, label: 'Dokter', value: '450+' },
  { icon: Building2, label: 'Rumah Sakit', value: '8' },
  { icon: Cross, label: 'Klinik', value: '35+' },
  { icon: HeartPulse, label: 'Puskesmas', value: '12' },
  { icon: Pill, label: 'Apotek', value: '60+' },
  { icon: Activity, label: 'Posyandu', value: '120+' },
  { icon: Home, label: 'Home Care Lansia', value: '25+' },
  { icon: UserCog, label: 'Tenaga Non-Dokter', value: '1200+' },
  { icon: Ambulance, label: 'Ambulans', value: '18' },
];

export function StatsCards() {
  return (
    <section id="statistik" className="relative py-24 sm:py-28 lg:py-32" style={{ backgroundColor: 'var(--surface-0)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full mb-4" style={{ backgroundColor: 'var(--surface-100)', border: '1px solid var(--surface-200)' }}>
              <span style={{ color: 'var(--brand-green)', fontSize: '14px', fontWeight: 600 }}>Statistik Kesehatan</span>
            </div>
            <h2
              className="tracking-tight mb-4"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}
            >
              Fasilitas Kesehatan Banjarbaru
            </h2>
            <p className="max-w-3xl mx-auto" style={{ fontSize: '18px', color: 'var(--ink-500)' }}>
              Data komprehensif fasilitas kesehatan yang tersedia untuk melayani masyarakat Banjarbaru
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <SectionReveal key={stat.label} delay={index * 0.08}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
                  className="rounded-2xl p-6 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--surface-0)',
                    border: '1px solid var(--surface-200)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'var(--brand-mint)' }}
                  >
                    {Icon && <Icon size={24} style={{ color: 'var(--brand-green)' }} />}
                  </div>
                  <div className="mb-1" style={{ fontSize: '36px', fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--ink-500)' }}>
                    {stat.label}
                  </div>
                </motion.div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
