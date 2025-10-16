// src/components/CTASection.tsx
import { useRevealOnce } from '../hooks/useRevealOnce';
import '@/styles/reveal.css';
import { Mail, ArrowRight } from 'lucide-react';

export function CTASection() {
  // sekali jalan: setiap blok besar punya hook sendiri biar isolasi
  const iconRev = useRevealOnce();
  const textRev = useRevealOnce();
  const statsRev = useRevealOnce();

  return (
    <section id="kontak" className="relative py-32 overflow-hidden">
      {/* Background gradient (non-interaktif, tanpa JS) */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)' }}
        aria-hidden="true"
      />

      {/* Decorative image — lazy + anti-CLS */}
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
        <div className="text-center max-w-3xl mx-auto">
          {/* Icon chip */}
          <div
            ref={iconRev.ref as any}
            className={`w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center reveal ${iconRev.visible ? 'is-visible' : ''}`}
            style={{ transitionDuration: '.6s', transitionDelay: '.12s' }}
          >
            <Mail size={40} className="text-white" aria-hidden="true" />
          </div>

          {/* Heading + paragraph */}
          <div
            ref={textRev.ref as any}
            className={`reveal ${textRev.visible ? 'is-visible' : ''}`}
            style={{ transitionDuration: '.6s' }}
          >
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

            {/* CTA buttons — hover via CSS, bukan Framer (lebih hemat INP) */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:sihat@banjarbaru.go.id"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-green rounded-xl transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-2xl group"
                style={{ fontSize: '16px', fontWeight: 600, willChange: 'transform' }}
              >
                <span>Hubungi Kami</span>
                <ArrowRight
                  size={20}
                  className="ml-2 transition-transform duration-150 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>

              <a
                href="#tentang"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl transition-all duration-150 hover:-translate-y-0.5 hover:bg-white/20 backdrop-blur-sm"
                style={{ fontSize: '16px', fontWeight: 600, willChange: 'transform' }}
              >
                Pelajari Lebih Lanjut
              </a>
            </div>
          </div>
        </div>

        {/* Floating Stats — jadikan list semantik + reveal sekali jalan */}
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
          </ul>
        </div>
      </div>
    </section>
  );
}

