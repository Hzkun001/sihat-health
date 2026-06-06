import { SectionReveal } from '@/components/shared/SectionReveal';
import { motion } from 'motion/react';
import { ArrowRight, BarChart3, Mail, MapPinned, MessageCircle, Phone } from 'lucide-react';

const contactItems = [
  {
    icon: Mail,
    label: 'Email resmi',
    value: 'sihat@banjarbaru.go.id',
    href: 'mailto:sihat@banjarbaru.go.id',
  },
  {
    icon: Phone,
    label: 'Kontak dinas',
    value: '+62 511 234 567',
    href: 'tel:+62511234567',
  },
  {
    icon: MapPinned,
    label: 'Wilayah layanan',
    value: 'Banjarbaru, Kalimantan Selatan',
    href: '#/peta',
  },
];

const focusPoints = [
  { value: '11+', label: 'Lapisan data aktif' },
  { value: '24/7', label: 'Akses informasi' },
];

export function CTASection() {
  return (
    <section
      id="kontak"
      className="relative overflow-hidden py-20 sm:py-24 lg:py-28"
      style={{ backgroundColor: 'var(--surface-alt)' }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: 'var(--surface-200, rgba(15, 23, 42, 0.08))' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ backgroundColor: 'var(--surface-200, rgba(15, 23, 42, 0.08))' }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <SectionReveal>
            <div className="max-w-2xl">
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
                style={{
                  backgroundColor: 'var(--surface-0)',
                  border: '1px solid var(--surface-200, rgba(15, 23, 42, 0.08))',
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--brand-blue)' }} />
                <span
                  style={{
                    color: 'var(--brand-green)',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Kolaborasi Data
                </span>
              </div>

              <h2
                className="mb-5 tracking-normal"
                style={{
                  color: 'var(--ink-900)',
                  fontSize: 'clamp(32px, 4.6vw, 56px)',
                  fontWeight: 800,
                  lineHeight: 1.08,
                  letterSpacing: 0,
                }}
              >
                Bangun keputusan lingkungan yang lebih tepat bersama SIHAT.
              </h2>

              <p
                className="max-w-xl leading-relaxed"
                style={{ color: 'var(--ink-500)', fontSize: '18px' }}
              >
                Hubungi tim SIHAT untuk integrasi data, kolaborasi lintas sektor, atau
                pengembangan layanan kesehatan lingkungan berbasis peta.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <motion.a
                  href="mailto:sihat@banjarbaru.go.id"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex min-h-12 items-center justify-center rounded-xl px-6 font-semibold text-white transition-shadow duration-300"
                  style={{
                    backgroundColor: 'var(--brand-green)',
                    boxShadow: '0 10px 24px rgba(48, 56, 50, 0.22)',
                  }}
                >
                  <Mail size={18} className="mr-2" />
                  Hubungi Kami
                  <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
                </motion.a>

                <motion.a
                  href="#/laporan"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl px-6 font-semibold transition-colors duration-300"
                  style={{
                    backgroundColor: 'var(--surface-0)',
                    border: '1px solid var(--surface-200, rgba(15, 23, 42, 0.08))',
                    color: 'var(--ink-700)',
                  }}
                >
                  <MessageCircle size={18} className="mr-2" style={{ color: 'var(--brand-green)' }} />
                  Kirim Laporan
                </motion.a>
              </div>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.15}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
              className="relative overflow-hidden rounded-2xl p-5 sm:p-6"
              style={{
                backgroundColor: 'var(--surface-0)',
                border: '1px solid var(--surface-200, rgba(15, 23, 42, 0.08))',
                boxShadow: '0 18px 48px rgba(15, 23, 42, 0.06)',
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: 'linear-gradient(90deg, var(--brand-green), var(--brand-blue))' }}
              />

              <div className="mb-6 flex items-start justify-between gap-6">
                <div>
                  <p
                    className="mb-2"
                    style={{
                      color: 'var(--ink-500)',
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Jalur komunikasi
                  </p>
                  <h3
                    style={{
                      color: 'var(--ink-900)',
                      fontSize: '24px',
                      fontWeight: 800,
                      lineHeight: 1.2,
                      letterSpacing: 0,
                    }}
                  >
                    Mulai dari kanal yang paling sesuai.
                  </h3>
                </div>

                <div
                  className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl sm:flex"
                  style={{ backgroundColor: 'var(--brand-mint)' }}
                >
                  <BarChart3 size={22} style={{ color: 'var(--brand-green)' }} />
                </div>
              </div>

              <div className="space-y-3">
                {contactItems.map(({ icon: Icon, label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="group flex items-center gap-4 rounded-xl p-3 transition-colors duration-200"
                    style={{ backgroundColor: 'var(--surface-alt)' }}
                  >
                    <span
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: 'var(--surface-0)',
                        border: '1px solid var(--surface-200, rgba(15, 23, 42, 0.08))',
                        color: 'var(--brand-green)',
                      }}
                    >
                      <Icon size={19} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block"
                        style={{ color: 'var(--ink-500)', fontSize: '13px', fontWeight: 600 }}
                      >
                        {label}
                      </span>
                      <span
                        className="block truncate"
                        style={{ color: 'var(--ink-900)', fontSize: '15px', fontWeight: 700 }}
                      >
                        {value}
                      </span>
                    </span>
                    <ArrowRight
                      size={18}
                      className="flex-shrink-0 transition-transform group-hover:translate-x-1"
                      style={{ color: 'var(--ink-500)' }}
                    />
                  </a>
                ))}
              </div>

              <div
                className="mt-5 grid grid-cols-2 gap-3 pt-5"
                style={{ borderTop: '1px solid var(--surface-200, rgba(15, 23, 42, 0.08))' }}
              >
                {focusPoints.map((item) => (
                  <div key={item.label}>
                    <div
                      style={{
                        color: 'var(--ink-900)',
                        fontSize: '28px',
                        fontWeight: 800,
                        lineHeight: 1,
                        letterSpacing: 0,
                      }}
                    >
                      {item.value}
                    </div>
                    <div className="mt-1" style={{ color: 'var(--ink-500)', fontSize: '13px', fontWeight: 600 }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
