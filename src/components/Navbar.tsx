import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight } from 'lucide-react';

const menuItems = [
  { label: 'Beranda', href: '#hero' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Peta', href: '#peta' },
  { label: 'Statistik', href: '#statistik' },
  { label: 'Berita', href: '#berita' },
  { label: 'Kontak', href: '#kontak' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 1023px)');

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

    handleChange(media);
    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
    } else {
      media.addListener?.(handleChange);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', handleChange);
      } else {
        media.removeListener?.(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    const OFFSET = 120;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);

        const sections = menuItems.map(i => i.href.replace('#', ''));
        let current = '';

        for (const id of sections) {
          const el = document.getElementById(id);
          if (!el) continue;
          const top = el.getBoundingClientRect().top - OFFSET;
          if (top <= 0) current = id;
        }

        setActiveSection(current);
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);

    if (element) {
      const navbarOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setActiveSection(targetId);
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Floating Navbar */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
        className="fixed top-3 sm:top-4 lg:top-5 left-0 right-0 z-40 flex justify-center px-3 sm:px-4 pointer-events-none"
      >
        <motion.nav
          animate={{
            height: isScrolled ? (isMobile ? '52px' : '56px') : isMobile ? '56px' : '64px',
          }}
          transition={{ duration: 0.25, ease: [0.25, 0.8, 0.25, 1] }}
          className="w-full max-w-[95%] sm:max-w-[90%] lg:max-w-[82%] pointer-events-auto"
          style={{
            backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.06)',
            backdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'blur(12px) saturate(120%)',
            WebkitBackdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'blur(12px) saturate(120%)',
            borderRadius: '999px',
            border: isScrolled
              ? '1px solid rgba(228, 228, 231, 0.6)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: isScrolled
              ? '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
              : '0 2px 12px rgba(0, 0, 0, 0.06)',
            willChange: 'height',
          }}
        >
          <div className="h-full px-4 sm:px-5 lg:px-8 flex items-center justify-between">
            {/* Logo + Live indicator */}
            <a href="#hero" onClick={(e) => handleNavClick(e, '#hero')} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <img src="assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontSize: isMobile ? '15px' : '16px',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: isScrolled ? 'var(--ink-900)' : '#ffffff',
                  }}
                >
                  SIHAT
                </span>
                {/* Live dot */}
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: isScrolled ? 'var(--brand-green)' : '#34d399' }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ backgroundColor: isScrolled ? 'var(--brand-green)' : '#34d399' }}
                  />
                </span>
              </div>
            </a>

            {/* Desktop Menu — wider tracking for editorial vibe */}
            <div className="hidden lg:flex items-center gap-x-0.5">
              {menuItems.map((item) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className="relative px-3.5 py-1.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/30"
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      color: isActive
                        ? (isScrolled ? 'var(--brand-green)' : '#34d399')
                        : (isScrolled ? 'var(--ink-600, #52525b)' : 'rgba(255,255,255,0.7)'),
                      backgroundColor: isActive
                        ? (isScrolled ? 'rgba(5, 150, 105, 0.08)' : 'rgba(52,211,153,0.1)')
                        : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = isScrolled
                          ? 'rgba(0, 0, 0, 0.04)'
                          : 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = isScrolled ? 'var(--ink-900)' : '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = isScrolled
                          ? 'var(--ink-600, #52525b)'
                          : 'rgba(255,255,255,0.7)';
                      }
                    }}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>

            {/* Right side: CTA pill + mobile toggle */}
            <div className="flex items-center gap-2">
              {/* CTA Pill — desktop */}
              <a
                href="#laporan"
                onClick={(e) => handleNavClick(e, '#laporan')}
                className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-300 group"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: isScrolled ? 'var(--brand-green)' : 'rgba(255,255,255,0.95)',
                  color: isScrolled ? '#ffffff' : 'var(--ink-900, #18181b)',
                  boxShadow: isScrolled
                    ? '0 2px 8px rgba(5,150,105,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                Lapor
                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full transition-all duration-300"
                aria-label="Toggle menu"
                style={{ color: isScrolled ? 'var(--ink-900)' : '#ffffff' }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </motion.nav>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-18 left-3 right-3 z-30 lg:hidden rounded-2xl overflow-hidden"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(228,228,231,0.5)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
            }}
          >
            <div className="flex flex-col py-3">
              {menuItems.map((item, index) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="mx-2 px-4 py-3 rounded-xl transition-all duration-200"
                    style={{
                      fontSize: '15px',
                      fontWeight: 500,
                      color: isActive ? 'var(--brand-green)' : 'var(--ink-900)',
                      backgroundColor: isActive ? 'rgba(5, 150, 105, 0.06)' : 'transparent',
                    }}
                  >
                    {item.label}
                  </motion.a>
                );
              })}
              {/* Mobile CTA */}
              <div className="mx-2 mt-2 pt-2" style={{ borderTop: '1px solid rgba(228,228,231,0.5)' }}>
                <a
                  href="#laporan"
                  onClick={(e) => handleNavClick(e, '#laporan')}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200"
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    backgroundColor: 'var(--brand-green)',
                    color: '#ffffff',
                  }}
                >
                  Laporkan Masalah
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
