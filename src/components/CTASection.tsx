import { SectionReveal } from './SectionReveal';
import { motion } from 'motion/react';
import { Mail, ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section id="kontak" className="relative overflow-hidden py-28 sm:py-32">
      {/* === Background selaras hero (gradient + lighting) === */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundColor: '#18a07a',
          backgroundImage: [
            'linear-gradient(135deg, #18b68a 0%, #22c6a0 45%, #0ea5e9 100%)', // base terang
            'radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,0.18), transparent 70%)', // spotlight tengah
            'radial-gradient(70% 70% at 15% 85%, rgba(29,255,112,0.18), transparent 70%)',    // emerald kiri-bawah
            'radial-gradient(70% 70% at 85% 20%, rgba(14,165,233,0.14), transparent 65%)',   // cyan kanan-atas
            'radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(0,0,0,0.12) 100%)', // vignette halus
          ].join(', '),
          backgroundBlendMode: 'normal, screen, screen, screen, normal',
        }}
      />

      {/* shimmer lembut berjalan pelan */}
      <motion.div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(25% 25% at 60% 30%, rgba(255,255,255,0.15), transparent 60%)',
          filter: 'blur(80px)',
        }}
        animate={{ opacity: [0.25, 0.45, 0.25], x: [0, 18, 0], y: [0, -14, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* tekstur foto tipis (opsional) */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.08] mix-blend-overlay pointer-events-none"
        aria-hidden="true"
      >
        <img
          src="/assets/banjarbaru-monument.jpg"
          alt=""
          width={1920}
          height={1080}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          style={{ filter: 'grayscale(35%) contrast(110%) saturate(90%)' }}
        />
      </div>

      {/* brightener mobile agar tidak terlalu gelap di layar kecil */}
      <div className="absolute inset-0 -z-10 bg-white/5 sm:bg-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <SectionReveal>
          <div className="mx-auto max-w-3xl text-center">
            {/* Icon capsule glass */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl
                         bg-white/[0.18] backdrop-blur-xl ring-1 ring-white/30
                         shadow-[0_24px_100px_-20px_rgba(0,0,0,0.35)]"
            >
              <Mail size={40} className="text-white" />
            </motion.div>

            <h2
              className="mb-6 tracking-tight text-white"
              style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              Ayo Kolaborasi untuk Lingkungan yang Lebih Baik
            </h2>

            <p
              className="mb-12 leading-relaxed text-white/90"
              style={{ fontSize: 'clamp(16px, 1.5vw, 20px)' }}
            >
              Bergabunglah dengan kami dalam mewujudkan linkungan]a Banjarbaru yang lebih sehat.
              Mari bersama-sama mengoptimalkan data lingkungan untuk pengambilan keputusan yang lebih baik.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <motion.a
                href="mailto:sihat@banjarbaru.go.id"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center justify-center rounded-xl px-8 py-4
                           font-semibold text-[#0c3f36]
                           shadow-[0_8px_28px_rgba(0,0,0,0.16)]
                           transition-all duration-300
                           hover:brightness-105 hover:shadow-[0_16px_48px_rgba(0,0,0,0.18)]"
                style={{ background: '#ffffff', fontSize: '16px' }}
              >
                <span>Hubungi Kami</span>
                <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
              </motion.a>

              <motion.a
                href="#tentang"
                whileTap={{ scale: [1, 0.98, 1] }}
                transition={{ scale: { duration: 0.12 }, y: { duration: 0.2 } }}
                className="inline-flex items-center justify-center rounded-xl px-8 py-4
                           font-semibold text-white
                           bg-white/15 ring-1 ring-white/30 backdrop-blur-md
                           hover:bg-white/25 transition-all duration-300"
                style={{ fontSize: '16px' }}
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
                className="rounded-2xl border border-white/20 bg-white/[0.12] p-6 text-center
                           backdrop-blur-xl ring-1 ring-white/15
                           shadow-[0_20px_80px_-24px_rgba(0,0,0,0.35)]"
              >
                <div className="mb-2 text-[28px] font-bold text-white sm:text-[32px]">
                  {stat.value}
                </div>
                <div className="text-sm text-white/85">{stat.label}</div>
              </motion.div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
