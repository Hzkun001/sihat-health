import { SectionReveal } from './SectionReveal';
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
  image?: string;
  label: string;
  value: string;
  color: string;
};

const statsData: StatItem[] = [
  { icon: Users, image: '/assets/dokter.jpg', label: 'Dokter', value: '450+', color: '#1BA351' },
  { icon: Building2, image: '/assets/rumah_sakit.jpg', label: 'Rumah Sakit', value: '8', color: '#5AC8FA' },
  { icon: Cross, image: '/assets/klinik.jpeg', label: 'Klinik', value: '35+', color: '#1BA351' },
  { icon: HeartPulse, image: '/assets/puskesmas.jpeg', label: 'Puskesmas', value: '12', color: '#5AC8FA' },
  { icon: Pill, image: '/assets/apotek.jpeg', label: 'Apotek', value: '60+', color: '#1BA351' },
  { icon: Activity, image: '/assets/posyandu.jpg', label: 'Posyandu', value: '120+', color: '#5AC8FA' },
  { icon: Home, image: '/assets/home_care_lansia.jpeg', label: 'Home Care Lansia', value: '25+', color: '#1BA351' },
  { icon: UserCog, image: '/assets/tenaga_non_dokter.jpg', label: 'Tenaga Non-Dokter', value: '1200+', color: '#5AC8FA' },
  { icon: Ambulance, image: '/assets/ambulans.jpg', label: 'Ambulans', value: '18', color: '#1BA351' },
];

export function StatsCardsSection() {
  return (
    <section id="statistik" className="relative py-24 bg-surface-0">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-brand-mint rounded-full mb-4">
              <span className="text-brand-green text-[14px] font-semibold">Statistik Kesehatan</span>
            </div>
            <h2
              className="text-ink-900 tracking-tight mb-4"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700 }}
            >
              Fasilitas Kesehatan Banjarbaru
            </h2>
            <p className="text-ink-700 max-w-3xl mx-auto text-[18px]">
              Data komprehensif fasilitas kesehatan yang tersedia untuk melayani masyarakat Banjarbaru
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <SectionReveal key={stat.label} delay={index * 0.08}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
                  className="rounded-2xl p-8 border border-white/20 cursor-pointer relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}1f 0%, ${stat.color}33 100%)`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  }}
                >
                  {stat.image && (
                    <div className="absolute inset-0">
                      <img
                        src={stat.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%)',
                      zIndex: 1,
                    }}
                  />

                  {/* ✅ Content Layer */}
                  <div className="relative z-10">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: 'rgba(255,255,255,0.75)' }}
                    >
                      {Icon && <Icon size={28} color={stat.color} />}
                    </div>
                    <div className="text-white mb-2 text-[40px] font-bold drop-shadow-md">
                      {stat.value}
                    </div>
                    <div className="text-white text-[16px] font-semibold drop-shadow-sm">
                      {stat.label}
                    </div>
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
