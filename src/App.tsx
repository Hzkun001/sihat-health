import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { Navbar } from '@/components/layout/Navbar';
import { PartnersFloatingBar } from '@/components/layout/PartnersFloatingBar';
import { HeroSection } from '@/sections/hero/HeroSection';
import { loadChatbaseWidget } from '@/lib/chatbase';

// Lazy load below-the-fold sections for better initial load performance
const BentoFeatures = lazy(() => import('@/sections/BentoFeatures').then(m => ({ default: m.BentoFeatures })));
const AboutSection = lazy(() => import('@/sections/AboutSection').then(m => ({ default: m.AboutSection })));
const MapSectionLoader = lazy(() => import('@/sections/map/MapSectionLoader').then(m => ({ default: m.MapSectionLoader })));
const ReportSection = lazy(() => import('@/sections/ReportSection').then(m => ({ default: m.ReportSection })));
const StatsIndicators = lazy(() => import('@/sections/stats/StatsIndicators').then(m => ({ default: m.StatsIndicators })));
const NewsSection = lazy(() => import('@/sections/NewsSection').then(m => ({ default: m.NewsSection })));
const CTASection = lazy(() => import('@/sections/CTASection').then(m => ({ default: m.CTASection })));
const Footer = lazy(() => import('@/components/layout/Footer').then(m => ({ default: m.Footer })));

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [heroProgress, setHeroProgress] = useState(0);
  const [heroReady, setHeroReady] = useState(false);
  const hasLoadedChatbase = useRef(false);

  // Lock body scroll while loading screen is visible
  useEffect(() => {
    document.body.style.overflow = isLoading ? 'hidden' : 'unset';
  }, [isLoading]);

  // Inject Chatbase widget once after the loading screen disappears
  useEffect(() => {
    if (isLoading || hasLoadedChatbase.current) return;
    loadChatbaseWidget();
    hasLoadedChatbase.current = true;
  }, [isLoading]);

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
                ease: [0.25, 0.8, 0.25, 1],
              }}
            >
              <Suspense fallback={<div className="min-h-screen" />}>
                <BentoFeatures />
                <AboutSection />
                <MapSectionLoader />
                <ReportSection />
                <StatsIndicators />
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
            onComplete={() => setIsLoading(false)}
            externalProgress={heroProgress}
            ready={heroReady}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
