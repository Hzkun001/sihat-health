import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PartnersFloatingBar } from './components/PartnersFloatingBar';

// Lazy load below-the-fold components for better initial load performance
const AboutSection = lazy(() => import('./components/AboutSection').then(m => ({ default: m.AboutSection })));
const MapSection = lazy(() => import('./components/MapSection').then(m => ({ default: m.MapSection })));
const ReportSection = lazy(() => import('./components/ReportSection').then(m => ({ default: m.ReportSection })));
const StatsCardsSection = lazy(() => import('./components/StatsCardsSection').then(m => ({ default: m.StatsCardsSection })));
const StatsIndicatorsSection = lazy(() => import('./components/StatsIndicatorsSection').then(m => ({ default: m.StatsIndicatorsSection })));
const NewsSection = lazy(() => import('./components/NewsSection').then(m => ({ default: m.NewsSection })));
const TeamSection = lazy(() => import('./components/TeamSection').then(m => ({ default: m.TeamSection })));
const CTASection = lazy(() => import('./components/CTASection').then(m => ({ default: m.CTASection })));
const Footer = lazy(() => import('./components/Footer').then(m => ({ default: m.Footer })));

function MapSectionLoader() {
  const [shouldRenderMap, setShouldRenderMap] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!triggerRef.current || shouldRenderMap) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRenderMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' }
    );
    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [shouldRenderMap]);

  const loadManually = () => setShouldRenderMap(true);

  return (
    <div ref={triggerRef} id="peta" className="relative">
      {shouldRenderMap ? (
        <Suspense fallback={<div className="min-h-[420px] rounded-3xl bg-surface-100/60" />}>
          <MapSection sectionId={null} />
        </Suspense>
      ) : (
        <section className="relative pt-2 pb-10 sm:pt-16 sm:pb-12 lg:pt-24 lg:pb-20 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, #F9FCFF 0%, #FFFFFF 100%)' }}
          />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-brand-mint rounded-full mb-4">
                <span className="text-brand-green text-[14px] font-semibold">Peta Kesehatan</span>
              </div>
              <h2
                className="text-ink-900 tracking-tight mb-4"
                style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700 }}
              >
                Peta Interaktif Kesehatan
              </h2>
              <p className="text-ink-700 max-w-3xl mx-auto text-[18px]">
                Visualisasi akan dimuat ketika Anda menjelajah area ini untuk menghemat data.
              </p>
            </div>

            <button
              type="button"
              onClick={loadManually}
              className="
                group w-full min-h-[420px]
                rounded-3xl border border-white/30 bg-white/10
                flex flex-col items-center justify-center gap-3 px-6
                text-brand-green transition-all duration-300
                hover:bg-white/20 hover:text-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/40
              "
            >
              <span className="text-lg font-semibold tracking-wide">Muat peta kesehatan</span>
              <span className="text-sm text-ink-600">
                Klik atau lanjut scroll — peta akan dimuat otomatis dan mungkin membutuhkan beberapa detik.
              </span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [heroProgress, setHeroProgress] = useState(0);
  const [heroReady, setHeroReady] = useState(false);
  const hasLoadedChatbase = useRef(false);

  useEffect(() => {
    // Prevent scroll during loading
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading || hasLoadedChatbase.current) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const remoteScriptId = 'f_w0Zlu5trRGKUknyahcR';
    if (document.getElementById(remoteScriptId)) {
      hasLoadedChatbase.current = true;
      return;
    }

    const loaderId = 'chatbase-inline-loader';
    if (document.getElementById(loaderId)) return;

    const loader = document.createElement('script');
    loader.id = loaderId;
    loader.type = 'text/javascript';
    loader.text = `(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){if(document.getElementById("f_w0Zlu5trRGKUknyahcR")){return;}const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="f_w0Zlu5trRGKUknyahcR";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();`;
    document.body.appendChild(loader);
    loader.remove();
    hasLoadedChatbase.current = true;
  }, [isLoading]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Main content - rendered behind loading screen */}
      <div className="relative z-0">
        <Navbar />
        <PartnersFloatingBar />
        <main>
          {/* Hero section is ready before loading completes */}
          <HeroSection
            onModelProgress={setHeroProgress}
            onModelReady={() => setHeroReady(true)}
          />
          {/* Lazy load other sections after loading screen */}
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 0.6,
                delay: 0.3,
                ease: [0.25, 0.8, 0.25, 1]
              }}
            >
              <Suspense fallback={<div className="min-h-screen" />}>
                <AboutSection />
                <MapSectionLoader />
                <ReportSection />
                <StatsIndicatorsSection />
                <NewsSection />
                <CTASection />
              </Suspense>
            </motion.div>
          )}
        </main>
        {!isLoading && (
          <Suspense fallback={<div className="min-h-[400px]" />}>
            <Footer />
          </Suspense>
        )}
      </div>

      {/* Loading screen overlay - z-50 ensures it's on top */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen
            key="loading"
            onComplete={handleLoadingComplete}
            externalProgress={heroProgress}
            ready={heroReady}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
