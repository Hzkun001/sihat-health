import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CustomCursor } from './components/CustomCursor';
import { PartnersFloatingBar } from './components/PartnersFloatingBar';


// Lazy load below-the-fold components for better initial load performance
const AboutSection = lazy(() => import('./components/AboutSection').then(m => ({ default: m.AboutSection })));
const MapSection = lazy(() => import('./components/MapSection').then(m => ({ default: m.MapSection })));
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
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen key="loading" onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 1,
            delay: 0.2,
            ease: [0.43, 0.13, 0.23, 0.96],
            opacity: { duration: 0.8 },
            scale: { duration: 1 }
          }}
        >
          <CustomCursor />
          <Navbar />
          <PartnersFloatingBar />
          <main>
            <HeroSection />
            <Suspense fallback={<div className="min-h-screen" />}>
              <AboutSection />
              <MapSection />
              <StatsCardsSection />
              <StatsIndicatorsSection />
              <NewsSection />
              <TeamSection />
              <CTASection />
            </Suspense>
          </main>
          <Suspense fallback={<div className="min-h-[400px]" />}>
            <Footer />
          </Suspense>
        </motion.div>
      )}
    </div>
  );
}
