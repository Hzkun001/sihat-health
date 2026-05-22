import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ClipboardPlus, Menu, X } from 'lucide-react';

const menuItems = [
  { label: 'Beranda', href: '#hero' },
  { label: 'Peta', href: '#peta' },
  { label: 'Laporan', href: '#laporan' },
  { label: 'Kontak', href: '#kontak' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
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
    const offset = 140;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 72);

        let current = 'hero';
        for (const item of menuItems) {
          const id = item.href.replace('#', '');
          const element = document.getElementById(id);
          if (!element) continue;
          if (element.getBoundingClientRect().top - offset <= 0) current = id;
        }

        setActiveSection(current);
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);

    if (!element) return;

    const navbarOffset = 108;
    const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - navbarOffset;

    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    setActiveSection(targetId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          top: isScrolled ? (isMobile ? 12 : 16) : (isMobile ? 40 : 54),
        }}
        transition={{ duration: 0.45, ease: [0.25, 0.8, 0.25, 1] }}
        className="fixed left-0 right-0 z-50 flex justify-center px-3 pointer-events-none"
      >
        <motion.nav
          animate={{
            width: isMobile ? 'min(100%, 360px)' : isScrolled ? 'min(100%, 520px)' : 'min(100%, 560px)',
          }}
          transition={{ duration: 0.28, ease: [0.25, 0.8, 0.25, 1] }}
          className="pointer-events-auto h-11 rounded-full border border-white/70 bg-white/86 shadow-[0_16px_44px_rgba(42,48,43,0.18)] backdrop-blur-2xl sm:h-12"
        >
          <div className="flex h-full items-center justify-between gap-2 px-3 sm:px-4">
            <a
              href="#hero"
              onClick={(event) => handleNavClick(event, '#hero')}
              className="flex min-w-0 items-center gap-2 rounded-full px-1 text-[#333b35]"
              aria-label="Ke beranda SIHAT"
            >
              <span className="text-xl font-semibold leading-none tracking-normal sm:text-2xl">SIHAT</span>
            </a>

            <div className="hidden items-center gap-1 md:flex">
              {menuItems.map((item) => {
                const id = item.href.replace('#', '');
                const isActive = activeSection === id;

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(event) => handleNavClick(event, item.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className="relative rounded-full px-2.5 py-1 text-xs font-semibold text-[#303832] transition-colors hover:bg-[#eef2eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#435047]/20"
                  >
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-2 -bottom-0.5 h-px bg-[#303832]"
                        transition={{ duration: 0.24, ease: [0.25, 0.8, 0.25, 1] }}
                      />
                    )}
                  </a>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href="#laporan"
                onClick={(event) => handleNavClick(event, '#laporan')}
                className="hidden h-8 w-8 items-center justify-center rounded-full bg-[#eef2eb] text-[#3c463f] transition-colors hover:bg-[#dfe7dc] md:inline-flex"
                aria-label="Buka laporan warga"
              >
                <ClipboardPlus size={16} />
              </a>

              <a
                href="#laporan"
                onClick={(event) => handleNavClick(event, '#laporan')}
                className="hidden items-center gap-1.5 rounded-full bg-[#465047] px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(48,56,50,0.22)] transition-colors hover:bg-[#303832] sm:inline-flex"
              >
                Lapor
                <ArrowRight size={13} />
              </a>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2eb] text-[#303832] md:hidden"
                aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </motion.nav>
      </motion.div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed left-3 right-3 top-24 z-40 overflow-hidden rounded-[14px] border border-white/70 bg-white/95 shadow-[0_22px_56px_rgba(42,48,43,0.18)] backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col p-2">
              {menuItems.map((item) => {
                const id = item.href.replace('#', '');
                const isActive = activeSection === id;

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(event) => handleNavClick(event, item.href)}
                    className="rounded-[10px] px-3 py-2.5 text-sm font-semibold text-[#303832] transition-colors"
                    style={{ backgroundColor: isActive ? '#eef2eb' : 'transparent' }}
                  >
                    {item.label}
                  </a>
                );
              })}

              <a
                href="#laporan"
                onClick={(event) => handleNavClick(event, '#laporan')}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#465047] px-3 py-2.5 text-sm font-semibold text-white"
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
            className="fixed inset-0 z-30 bg-[#303832]/18 backdrop-blur-[2px] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
