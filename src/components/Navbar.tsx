import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

const menuItems = [
  { label: 'Beranda', href: '#hero' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Peta', href: '#peta' },
  { label: 'Laporan', href: '#laporan' },
  { label: 'Statistik', href: '#statistik' },
  { label: 'Berita', href: '#berita' },
  { label: 'Tim', href: '#tim' },
  { label: 'Kontak', href: '#kontak' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  // MULAI KOSONG → biar tidak auto-aktif 'hero' saat load
  const [activeSection, setActiveSection] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Deteksi section aktif yang robust:
    // pilih section terakhir yang top-nya sudah melewati offset navbar
    let ticking = false;
    const OFFSET = 120; // tinggi navbar + margin aman

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
          // ambil yang sudah lewat offset (<= 0)
          if (top <= 0) current = id;
        }

        // kalau masih paling atas (belum ada yg lewat offset), kosongkan
        setActiveSection(current);

        ticking = false;
      });
    };

    // set state awal dan pasang listener
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll dengan offset navbar
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);

    if (element) {
      const navbarOffset = 120; // samakan dengan OFFSET di atas
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Tandai aktif saat klik (opsional, membuat responsif saat awal)
      setActiveSection(targetId);

      // Tutup menu mobile
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
        className="fixed top-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none"
        style={{ willChange: 'transform, opacity' }}
      >
        <motion.nav
          animate={{ height: isScrolled ? '64px' : '80px' }}
          transition={{ duration: 0.25, ease: [0.25, 0.8, 0.25, 1] }}
          className="w-full max-w-[90%] lg:max-w-[85%] pointer-events-auto"
          style={{
            backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: isScrolled ? 'blur(24px)' : 'blur(16px)',
            WebkitBackdropFilter: isScrolled ? 'blur(24px)' : 'blur(16px)',
            borderRadius: '999px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
            willChange: 'height',
          }}
        >
          <div className="h-full px-6 lg:px-10 flex items-center justify-between">
            {/* Logo */}
            <a href="#hero" onClick={(e) => handleNavClick(e, '#hero')} className="flex items-center space-x-3 group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <img src="assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-ink-900 transition-colors duration-300"
                  style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '0.02em' }}
                >
                  SIHAT Banjarbaru
                </span>
                <span
                  className="text-ink-500 hidden lg:block"
                  style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.05em', marginTop: '-2px' }}
                >
                  Sistem Informasi Kesehatan Terpadu
                </span>
              </div>
            </a>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-10">
              {menuItems.map((item) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className="relative group"
                  >
                    <span
                      className="transition-all duration-250 ease-out"
                      style={{
                        fontSize: '15px',
                        fontWeight: 500,
                        letterSpacing: '0.02em',
                        color: isActive ? '#1BA351' : '#0E1E2B',
                      }}
                    >
                      {item.label}
                    </span>

                    {/* Hover/Active underline with gradient */}
                    {isActive ? (
                      <motion.div
                        layoutId="navbar-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: 'linear-gradient(90deg, #1BA351 0%, #5AC8FA 100%)' }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      />
                    ) : (
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full opacity-0 group-hover:opacity-100"
                        style={{ backgroundColor: '#1BA351' }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      />
                    )}
                  </a>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-full transition-all duration-300 hover:bg-brand-green/10"
              aria-label="Toggle menu"
              style={{ color: '#0E1E2B' }}
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
            className="fixed top-24 left-4 right-4 z-30 lg:hidden rounded-3xl overflow-hidden"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            }}
          >
            <div className="flex flex-col py-6">
              {menuItems.map((item, index) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="px-8 py-4 transition-all duration-300 hover:bg-brand-green/5"
                    style={{
                      fontSize: '18px',
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                      color: isActive ? '#1BA351' : '#0E1E2B',
                      borderLeft: isActive ? '3px solid #1BA351' : '3px solid transparent',
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
