import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from 'lucide-react';
import { motion } from 'motion/react';

const footerLinks = [
  { label: 'Beranda', href: '#/' },
  { label: 'Peta Interaktif', href: '#/peta' },
  { label: 'Laporan Warga', href: '#/laporan' },
  { label: 'Statistik', href: '#/insight' },
  { label: 'Kontak', href: '#/kontak' },
  { label: 'Portal Petugas', href: '#/petugas' },
];

const partners = [
  'Geoportal Kota Banjarbaru',
  'Dinkes Banjarbaru',
  'Data wilayah Banjarmasin',
  'BPS Kalimantan Selatan',
];

const details = ['Banjarmasin–Banjarbaru', 'SDG 3 - Good Health & Well-Being', 'SDG 11 - Sustainable Cities'];

const socials = [
  { Icon: Instagram, label: 'Instagram', href: '#' },
  { Icon: Twitter, label: 'Twitter', href: '#' },
  { Icon: Linkedin, label: 'LinkedIn', href: '#' },
];

function handleAnchorClick(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith('#')) return;

  const target = document.getElementById(href.replace('#', ''));
  if (!target) return;

  event.preventDefault();
  const navbarOffset = 120;
  const top = target.getBoundingClientRect().top + window.pageYOffset - navbarOffset;

  window.scrollTo({ top, behavior: 'smooth' });
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('sihat@banjarbaru.go.id');
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1800);
    } catch {
      window.location.href = 'mailto:sihat@banjarbaru.go.id';
    }
  };

  const handleBackToTop = () => {
    const hero = document.getElementById('hero');

    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #303832 0%, #232a25 100%)' }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: 'linear-gradient(180deg, rgba(185, 169, 245, 0.14), transparent)' }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
        <div
          className="mb-12 grid gap-8 rounded-2xl p-5 sm:p-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-7"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                <img src="/assets/logo.png" alt="Logo SIHAT" className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="text-white" style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1 }}>
                  SIHAT
                </div>
                <div className="mt-1" style={{ color: 'rgba(255,255,255,0.56)', fontSize: '12px' }}>
                  Sistem Informasi Kesehatan Lingkungan Terpadu
                </div>
              </div>
            </div>

            <h2
              className="max-w-2xl text-white"
              style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: 800,
                letterSpacing: 0,
                lineHeight: 1.12,
              }}
            >
              Data kesehatan lingkungan yang mudah diakses dan siap ditindaklanjuti.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 0.8, 0.25, 1] }}
            className="flex flex-col gap-3 sm:flex-row lg:justify-end"
          >
            <motion.a
              href="#/laporan"
              onClick={(event) => handleAnchorClick(event, '#/laporan')}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 font-semibold transition-shadow duration-300"
              style={{ color: 'var(--ink-900)', boxShadow: '0 10px 24px rgba(0, 0, 0, 0.18)' }}
            >
              Laporkan Masalah
              <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </motion.a>

            <motion.button
              type="button"
              onClick={handleCopyEmail}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex min-h-12 items-center justify-center rounded-xl px-5 font-semibold text-white transition-colors duration-300"
              style={{
                backgroundColor: copiedEmail ? 'rgba(185, 169, 245, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
              }}
            >
              {copiedEmail ? <Check size={18} className="mr-2" /> : <Copy size={18} className="mr-2" />}
              {copiedEmail ? 'Email Tersalin' : 'Salin Email'}
            </motion.button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="max-w-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.64)', fontSize: '15px' }}>
              Platform geospasial terpadu untuk membantu warga, dinas, dan mitra memahami kondisi kesehatan
              lingkungan Banjarmasin dan Banjarbaru secara lebih cepat.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href="mailto:sihat@banjarbaru.go.id"
                className="group flex items-center gap-3 rounded-xl p-3 transition-colors duration-200"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-[#c9bee9]">
                  <Mail size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block" style={{ color: 'rgba(255,255,255,0.48)', fontSize: '12px' }}>
                    Email
                  </span>
                  <span className="block truncate text-sm font-semibold text-white">sihat@banjarbaru.go.id</span>
                </span>
                <ArrowUpRight size={17} className="text-white/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>

              <a
                href="tel:+62511234567"
                className="group flex items-center gap-3 rounded-xl p-3 transition-colors duration-200"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-[#c9bee9]">
                  <Phone size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block" style={{ color: 'rgba(255,255,255,0.48)', fontSize: '12px' }}>
                    Telepon
                  </span>
                  <span className="block truncate text-sm font-semibold text-white">+62 511 234 567</span>
                </span>
                <ArrowUpRight size={17} className="text-white/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>

              <a
                href="#/peta"
                onClick={(event) => handleAnchorClick(event, '#/peta')}
                className="group flex items-start gap-3 rounded-xl p-3 transition-colors duration-200"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#c9bee9]">
                  <MapPin size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block" style={{ color: 'rgba(255,255,255,0.48)', fontSize: '12px' }}>
                    Lokasi
                  </span>
                  <span className="block text-sm font-semibold leading-relaxed text-white">
                    Jl. Panglima Batur Barat No.5, Banjarbaru
                  </span>
                </span>
                <ArrowUpRight size={17} className="mt-1 text-white/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.08em] text-white">Navigasi</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(event) => handleAnchorClick(event, link.href)}
                    className="group inline-flex items-center py-1 text-sm transition-colors duration-200"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    <span className="transition-colors duration-200 group-hover:text-white">{link.label}</span>
                    <ArrowRight
                      size={14}
                      className="ml-1 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.08em] text-white">Mitra Data</h3>
            <ul className="space-y-3">
              {partners.map((partner) => (
                <li key={partner} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.62)' }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c9bee9]" />
                  {partner}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.08em] text-white">Ruang Lingkup</h3>
            <ul className="space-y-3">
              {details.map((detail) => (
                <li
                  key={detail}
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{
                    color: 'rgba(255,255,255,0.66)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {detail}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ Icon, label, href }, index) => (
                <motion.a
                  key={label}
                  href={href}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -3, scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors duration-200"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  aria-label={label}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-12 flex flex-col gap-5 pt-7 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.46)' }}>
            &copy; {currentYear} SIHAT. Banjarmasin–Banjarbaru.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href="#/privasi" className="text-sm transition-colors duration-200 hover:text-white" style={{ color: 'rgba(255,255,255,0.46)' }}>
              Privasi & Aksesibilitas
            </a>
            <button
              type="button"
              onClick={handleBackToTop}
              className="group inline-flex items-center rounded-full px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-200"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Kembali ke Atas
              <ArrowRight size={15} className="ml-1 rotate-[-45deg] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
