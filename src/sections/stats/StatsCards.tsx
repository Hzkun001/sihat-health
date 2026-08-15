import { SectionReveal } from '@/components/shared/SectionReveal';
import {
  DEFAULT_VERIFIED_STATS,
  buildStatCardsList,
  loadAggregatedHealthStats,
  type StatItem,
} from '@/lib/statsData';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { useEffect, useState } from 'react';

function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  const Icon = stat.icon;

  // Normalized mouse coordinates (-0.5 to 0.5) for subtle 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Absolute pixel coordinates for smooth radial spotlight
  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);

  // Ultra-responsive snappy spring physics (high stiffness, tuned damping for instant 60fps response)
  const springX = useSpring(mouseX, { stiffness: 550, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 550, damping: 30 });

  // Ultra-subtle 3D micro-tilt angles (-2.5deg to 2.5deg)
  const rotateX = useTransform(springY, [-0.5, 0.5], [2.5, -2.5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-2.5, 2.5]);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;

    mouseX.set(xPct);
    mouseY.set(yPct);
    spotX.set(clientX - left);
    spotY.set(clientY - top);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <SectionReveal delay={index * 0.06}>
      <div style={{ perspective: 1000 }} className="h-full">
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            transformPerspective: 1000,
          }}
          whileHover={{ scale: 1.008, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="group relative overflow-hidden rounded-2xl p-6 cursor-pointer border border-surface-200/90 bg-white/95 transition-colors duration-200 ease-out hover:border-brand-green/50 will-change-transform"
        >
          {/* Dynamic Soft Cursor Spotlight */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  150px circle at ${spotX}px ${spotY}px,
                  rgba(143, 162, 138, 0.30) 0%,
                  rgba(143, 162, 138, 0.14) 35%,
                  rgba(143, 162, 138, 0.04) 70%,
                  transparent 100%
                )
              `,
            }}
          />

          <div className="relative z-10">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ease-out shadow-2xs group-hover:bg-brand-green"
              style={{ backgroundColor: 'var(--brand-mint)' }}
            >
              {Icon && (
                <Icon
                  size={24}
                  className="text-brand-green transition-colors duration-300 group-hover:text-white"
                />
              )}
            </div>

            {/* Metric Value */}
            <div
              className="mb-1 text-ink-900 transition-colors duration-300"
              style={{
                fontSize: '36px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              {stat.value}
            </div>

            {/* Label */}
            <div
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--ink-900)',
              }}
            >
              {stat.label}
            </div>

            {/* Description */}
            {stat.description && (
              <div
                className="mt-1"
                style={{
                  fontSize: '13px',
                  color: 'var(--ink-500)',
                }}
              >
                {stat.description}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </SectionReveal>
  );
}

export function StatsCards() {
  const [statsList, setStatsList] = useState<StatItem[]>(() =>
    buildStatCardsList(DEFAULT_VERIFIED_STATS)
  );

  useEffect(() => {
    void loadAggregatedHealthStats().then((loaded) => {
      setStatsList(buildStatCardsList(loaded));
    });
  }, []);

  return (
    <section id="statistik" className="relative py-24 sm:py-28 lg:py-32" style={{ backgroundColor: 'var(--surface-0)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full mb-4" style={{ backgroundColor: 'var(--surface-100)', border: '1px solid var(--surface-200)' }}>
              <span style={{ color: 'var(--brand-green)', fontSize: '14px', fontWeight: 600 }}>Statistik Kesehatan Terpadu</span>
            </div>
            <h2
              className="tracking-tight mb-4"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}
            >
              Data Fasilitas & Wilayah Terverifikasi
            </h2>
            <p className="max-w-3xl mx-auto" style={{ fontSize: '18px', color: 'var(--ink-500)' }}>
              Agregat titik fasilitas kesehatan, sanitasi, dan cakupan kependudukan geospasial Banjarmasin–Banjarbaru.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {statsList.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
