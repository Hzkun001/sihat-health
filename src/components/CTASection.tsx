import { SectionReveal } from './SectionReveal';
import { motion } from 'motion/react';
import { Mail, ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section id="kontak" className="relative py-32 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
        }}
      />

      {/* Decorative Elements */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background:
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
        }}
      />

      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
        <img
          src="/assets/banjarbaru-monument.avif"
          alt=""
          width={1920} height={1080}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <Mail size={40} className="text-white" />
            </motion.div>

            <h2
              className="text-white mb-6 tracking-tight"
              style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              Ayo Kolaborasi untuk Kesehatan yang Lebih Baik
            </h2>

            <p
              className="text-white/90 mb-12 leading-relaxed"
              style={{ fontSize: 'clamp(16px, 1.5vw, 20px)' }}
            >
              Bergabunglah dengan kami dalam mewujudkan masyarakat Banjarbaru yang lebih sehat. 
              Mari bersama-sama mengoptimalkan data kesehatan untuk pengambilan keputusan yang lebih baik.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="mailto:sihat@banjarbaru.go.id"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-green rounded-xl transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-2xl group"
                style={{ fontSize: '16px', fontWeight: 600, willChange: 'transform' }}
              >
                <span>Hubungi Kami</span>
                <ArrowRight
                  size={20}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </motion.a>

              <motion.a
                href="#tentang"
                whileTap={{ scale: [1, 0.98, 1] }}
                transition={{ 
                  scale: { duration: 0.12 },
                  y: { duration: 0.2 }
                }}
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                style={{ fontSize: '16px', fontWeight: 600 }}
              >
                Pelajari Lebih Lanjut
              </motion.a>
            </div>
          </div>
        </SectionReveal>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {[
            { value: '200K+', label: 'Penduduk Terlayani' },
            { value: '15+', label: 'Indikator SDG' },
            { value: '100%', label: 'Data Terbuka' },
            { value: '24/7', label: 'Akses Platform' },
          ].map((stat, index) => (
            <SectionReveal key={stat.label} delay={0.4 + index * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
              >
                <div className="text-white mb-2" style={{ fontSize: '32px', fontWeight: 700 }}>
                  {stat.value}
                </div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </motion.div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
