import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

const menuItems = [
  { label: 'Beranda', href: '#hero' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Peta', href: '#peta' },
  { label: 'Lapor', href: '#laporan' },
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
        transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
        className="fixed top-3 sm:top-5 lg:top-6 left-0 right-0 z-40 flex justify-center px-3 sm:px-4 pointer-events-none"
        style={{ willChange: 'transform, opacity' }}
      >
        <motion.nav
          animate={{
            height: isScrolled ? (isMobile ? '56px' : '60px') : isMobile ? '64px' : '72px',
          }}
          transition={{ duration: 0.25, ease: [0.25, 0.8, 0.25, 1] }}
          className="w-full max-w-[95%] sm:max-w-[90%] lg:max-w-[85%] pointer-events-auto"
          style={{
            backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.80)',
            backdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'blur(16px) saturate(150%)',
            WebkitBackdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'blur(16px) saturate(150%)',
            borderRadius: '999px',
            border: '1px solid rgba(228, 228, 231, 0.6)',
            boxShadow: isScrolled
              ? '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
              : '0 2px 12px rgba(0, 0, 0, 0.04)',
            willChange: 'height',
          }}
        >
          <div className="h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between">
            {/* Logo */}
            <a href="#hero" onClick={(e) => handleNavClick(e, '#hero')} className="flex items-center space-x-3 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <img src="assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span
                  style={{
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    color: 'var(--ink-900)',
                  }}
                >
                  SIHAT Banjarbaru
                </span>
                <span
                  className="hidden lg:block"
                  style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.02em', marginTop: '-1px', color: 'var(--ink-500)' }}
                >
                  Sistem Informasi Kesehatan Lingkungan Terpadu
                </span>
              </div>
            </a>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-x-1">
              {menuItems.map((item) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className="relative px-3 py-1.5 rounded-full transition-all duration-200"
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      color: isActive ? 'var(--brand-green)' : 'var(--ink-700)',
                      backgroundColor: isActive ? 'rgba(5, 150, 105, 0.08)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                        e.currentTarget.style.color = 'var(--ink-900)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--ink-700)';
                      }
                    }}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full transition-all duration-300"
              aria-label="Toggle menu"
              style={{ color: 'var(--ink-900)' }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
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
            className="fixed top-20 left-4 right-4 z-30 lg:hidden rounded-2xl overflow-hidden"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--surface-200)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
            }}
          >
            <div className="flex flex-col py-4">
              {menuItems.map((item, index) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="mx-3 px-4 py-3 rounded-xl transition-all duration-200"
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: isActive ? 'var(--brand-green)' : 'var(--ink-900)',
                      backgroundColor: isActive ? 'rgba(5, 150, 105, 0.06)' : 'transparent',
                    }}
                  >
                    {item.label}
                  </motion.a>
                );
              })}
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
