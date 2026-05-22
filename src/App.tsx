import { useEffect, lazy, Suspense, useState } from 'react';

import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/sections/hero/HeroSection';
import { loadChatbaseWidget } from '@/lib/chatbase';
import { ReportDetailPage } from '@/sections/ReportDetailPage';

// Lazy load below-the-fold sections for better initial load performance
const BentoFeatures = lazy(() => import('@/sections/BentoFeatures').then(m => ({ default: m.BentoFeatures })));
const MapSectionLoader = lazy(() => import('@/sections/map/MapSectionLoader').then(m => ({ default: m.MapSectionLoader })));
const ReportSection = lazy(() => import('@/sections/ReportSection').then(m => ({ default: m.ReportSection })));
const CTASection = lazy(() => import('@/sections/CTASection').then(m => ({ default: m.CTASection })));
const Footer = lazy(() => import('@/components/layout/Footer').then(m => ({ default: m.Footer })));

function getReportIdFromHash() {
  if (typeof window === 'undefined') return null;
  const match = window.location.hash.match(/^#laporan\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function App() {
  const [activeReportId, setActiveReportId] = useState(getReportIdFromHash);

  useEffect(() => {
    loadChatbaseWidget();
  }, []);

  useEffect(() => {
    const handleHashChange = () => setActiveReportId(getReportIdFromHash());
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const closeReportPage = () => {
    window.history.pushState('', document.title, window.location.pathname + window.location.search);
    setActiveReportId(null);
  };

  return (
    <div className="min-h-screen bg-surface-0">
      <div className="relative z-0">
        <Navbar />
        {activeReportId ? (
          <ReportDetailPage reportId={activeReportId} onClose={closeReportPage} />
        ) : (
          <>
            <main>
              <HeroSection />
              <Suspense fallback={<div className="min-h-screen" />}>
                <BentoFeatures />
                <MapSectionLoader />
                <ReportSection />
                <CTASection />
              </Suspense>
            </main>
            <Suspense fallback={<div className="min-h-[400px]" />}>
              <Footer />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}
