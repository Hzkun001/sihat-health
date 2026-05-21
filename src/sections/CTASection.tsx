import { SectionReveal } from '@/components/shared/SectionReveal';
import { motion } from 'motion/react';
import { Mail, ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section id="kontak" className="relative overflow-hidden py-28 sm:py-32">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'linear-gradient(180deg, #059669 0%, #047857 54%, #065f46 100%)' }}
      />

      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(236, 253, 245, 0.24), transparent 62%)',
        }}
      />

      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 82% 100%, rgba(52, 211, 153, 0.22), transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <SectionReveal>
          <div className="mx-auto max-w-3xl text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Mail size={32} className="text-white" />
            </motion.div>

            <h2
              className="mb-6 tracking-tight text-white"
              style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' }}
            >
              Ayo Kolaborasi untuk Lingkungan yang Lebih Baik
            </h2>

            <p
              className="mb-12 leading-relaxed"
              style={{ fontSize: 'clamp(16px, 1.5vw, 20px)', color: 'rgba(255,255,255,0.7)' }}
            >
              Bergabunglah dengan kami dalam mewujudkan lingkungan Banjarbaru yang lebih sehat.
              Mari bersama-sama mengoptimalkan data lingkungan untuk pengambilan keputusan yang lebih baik.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <motion.a
                href="mailto:sihat@banjarbaru.go.id"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center justify-center rounded-xl px-8 py-4 font-semibold transition-all duration-300"
                style={{
                  backgroundColor: '#ffffff',
                  color: 'var(--ink-900)',
                  fontSize: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                }}
              >
                <span>Hubungi Kami</span>
                <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
              </motion.a>

              <motion.a
                href="#tentang"
                whileTap={{ scale: [1, 0.98, 1] }}
                transition={{ scale: { duration: 0.12 }, y: { duration: 0.2 } }}
                className="inline-flex items-center justify-center rounded-xl px-8 py-4 font-semibold text-white transition-all duration-300"
                style={{
                  fontSize: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; }}
              >
                Pelajari Lebih Lanjut
              </motion.a>
            </div>
          </div>
        </SectionReveal>

        {/* Stats glass cards */}
        <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {[
            { value: '200K+', label: 'Penduduk Terlayani' },
            { value: '15+', label: 'Indikator SDG' },
            { value: '100%', label: 'Data Terbuka' },
            { value: '24/7', label: 'Akses Platform' },
          ].map((stat, index) => (
            <SectionReveal key={stat.label} delay={0.35 + index * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl p-6 text-center backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="mb-2 text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{stat.label}</div>
              </motion.div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
