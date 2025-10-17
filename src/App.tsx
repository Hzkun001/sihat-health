import { useState, useEffect, lazy, Suspense } from 'react';
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

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prevent scroll during loading
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
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
          <HeroSection />
          
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
                <MapSection />
                <ReportSection />
                <StatsCardsSection />
                <StatsIndicatorsSection />
                <NewsSection />
                <TeamSection />
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
        {isLoading && <LoadingScreen key="loading" onComplete={handleLoadingComplete} />}
      </AnimatePresence>
    </div>
  );
}
