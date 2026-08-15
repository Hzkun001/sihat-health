import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ClipboardPlus, Menu, Search, X } from 'lucide-react';
import { openGlobalCommandMenu } from '@/lib/searchEngine';

const menuItems = [
  { label: 'Beranda', href: '#/' },
  { label: 'Peta', href: '#/peta' },
  { label: 'Laporan', href: '#/laporan' },
  { label: 'Insight', href: '#/insight' },
  { label: 'Kontak', href: '#/kontak' },
];

function getActiveRoute() {
  if (typeof window === 'undefined') return '#/';
  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/peta') || hash === '#peta') return '#/peta';
  if (hash.startsWith('#/laporan') || hash === '#laporan') return '#/laporan';
  if (hash.startsWith('#/insight') || hash === '#statistik') return '#/insight';
  if (hash.startsWith('#/kontak') || hash === '#kontak') return '#/kontak';
  return '#/';
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeRoute, setActiveRoute] = useState<string>(getActiveRoute);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(max-width: 767px)');
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

    handleChange(media);
    media.addEventListener?.('change', handleChange);
    return () => media.removeEventListener?.('change', handleChange);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 48);
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleHashChange = () => setActiveRoute(getActiveRoute());
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (_event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setActiveRoute(href);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          top: isScrolled ? (isMobile ? 10 : 16) : 0,
        }}
        transition={{ duration: 0.38, ease: [0.25, 0.8, 0.25, 1] }}
        className={`fixed left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-300 ${
          isScrolled ? 'px-3 sm:px-6' : 'px-0'
        }`}
      >
        <motion.nav
          animate={{
            width: isScrolled
              ? isMobile
                ? 'min(100%, 360px)'
                : 'min(100%, 680px)'
              : '100%',
            height: isScrolled ? (isMobile ? 44 : 48) : (isMobile ? 54 : 64),
            borderRadius: isScrolled ? 9999 : 0,
            backgroundColor: isScrolled
              ? 'rgba(255, 255, 255, 0.92)'
              : 'rgba(247, 244, 237, 0.95)',
            borderColor: isScrolled
              ? 'rgba(226, 232, 240, 0.90)'
              : 'rgba(247, 244, 237, 0)',
            boxShadow: isScrolled
              ? '0 16px 42px rgba(35, 48, 37, 0.14), 0 1px 2px rgba(0,0,0,0.05)'
              : '0 0 0 rgba(0, 0, 0, 0)',
          }}
          transition={{ duration: 0.38, ease: [0.25, 0.8, 0.25, 1] }}
          className={`pointer-events-auto border will-change-[width,height,border-radius,background-color] ${
            isScrolled ? 'backdrop-blur-2xl' : 'backdrop-blur-none'
          }`}
        >
          <div
            className={`flex h-full items-center justify-between gap-2 transition-all duration-300 ${
              isScrolled
                ? 'w-full px-3 sm:px-4'
                : 'mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-12'
            }`}
          >
            <a
              href="#/"
              onClick={(event) => handleNavClick(event, '#/')}
              className="flex min-w-0 items-center gap-2 rounded-full px-1 text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/30"
              aria-label="Ke beranda SIHAT"
            >
              <span
                className={`font-semibold leading-none tracking-tight transition-all duration-300 text-ink-900 ${
                  isScrolled ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl font-bold'
                }`}
              >
                SIHAT
              </span>
              {!isScrolled && (
                <span className="hidden lg:inline-flex items-center rounded-full bg-brand-green/10 border border-brand-green/20 px-2.5 py-0.5 text-xs font-semibold text-brand-green-dark">
                  Kalsel
                </span>
              )}
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden items-center gap-1.5 md:flex">
              {menuItems.map((item) => {
                const isActive = activeRoute === item.href;

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(event) => handleNavClick(event, item.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative rounded-full font-semibold text-ink-900 transition-all duration-200 hover:bg-brand-mint/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/30 ${
                      isScrolled ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-2 -bottom-0.5 h-px bg-brand-green-dark"
                        transition={{ duration: 0.24, ease: [0.25, 0.8, 0.25, 1] }}
                      />
                    )}
                  </a>
                );
              })}
            </div>

            {/* Right Action Items */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={openGlobalCommandMenu}
                className={`flex items-center gap-1.5 rounded-full border border-surface-200/80 bg-surface-100/75 text-xs font-medium text-ink-600 transition-all hover:border-surface-300 hover:bg-surface-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/30 cursor-pointer ${
                  isScrolled ? 'h-8 px-2.5' : 'h-9 px-3.5'
                }`}
                aria-label="Cari fasilitas atau menu (⌘K)"
                title="Cari fasilitas, laporan, wilayah (⌘K)"
              >
                <Search size={14} className="text-ink-500" />
                <span className="hidden sm:inline text-xs text-ink-600">
                  {isScrolled ? 'Cari...' : 'Cari fasilitas...'}
                </span>
                <kbd className="hidden md:inline-flex items-center rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-mono font-medium text-ink-500 border border-surface-200 shadow-2xs">
                  ⌘K
                </kbd>
              </button>

              <a
                href="#/laporan"
                onClick={(event) => handleNavClick(event, '#/laporan')}
                className={`hidden items-center justify-center rounded-full bg-brand-mint text-brand-green-dark transition-colors hover:bg-brand-green-light md:inline-flex ${
                  isScrolled ? 'h-8 w-8' : 'h-9 w-9'
                }`}
                aria-label="Buka laporan warga"
                title="Buat Laporan Warga"
              >
                <ClipboardPlus size={16} />
              </a>

              <a
                href="#/laporan"
                onClick={(event) => handleNavClick(event, '#/laporan')}
                className={`hidden items-center gap-1.5 rounded-full bg-brand-green font-semibold text-white shadow-[0_8px_20px_rgba(104,115,101,0.24)] transition-all hover:bg-brand-green-dark sm:inline-flex ${
                  isScrolled ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs'
                }`}
              >
                Lapor
                <ArrowRight size={13} />
              </a>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-mint text-ink-900 md:hidden"
                aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </motion.nav>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`fixed left-3 right-3 z-40 overflow-hidden rounded-[16px] border border-white/80 bg-white/95 shadow-[0_22px_56px_rgba(42,48,43,0.18)] backdrop-blur-2xl md:hidden ${
              isScrolled ? 'top-16' : 'top-20'
            }`}
          >
            <div className="flex flex-col p-2.5">
              {menuItems.map((item) => {
                const isActive = activeRoute === item.href;

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(event) => handleNavClick(event, item.href)}
                    className="rounded-[10px] px-3 py-2.5 text-sm font-semibold text-ink-900 transition-colors"
                    style={{ backgroundColor: isActive ? 'var(--brand-mint)' : 'transparent' }}
                  >
                    {item.label}
                  </a>
                );
              })}

              <a
                href="#/laporan"
                onClick={(event) => handleNavClick(event, '#/laporan')}
                className="mt-1.5 inline-flex items-center justify-center gap-2 rounded-[10px] bg-brand-green px-3 py-2.5 text-sm font-semibold text-white"
              >
                Buat Laporan
                <ArrowRight size={15} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.button
            type="button"
            aria-label="Tutup menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-brand-green-dark/20 backdrop-blur-[2px] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
