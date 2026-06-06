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
const StatsCards = lazy(() => import('@/sections/stats/StatsCards').then(m => ({ default: m.StatsCards })));
const FAQSection = lazy(() => import('@/sections/FAQSection').then(m => ({ default: m.FAQSection })));
const StaffDashboardPage = lazy(() => import('@/sections/StaffDashboardPage').then(m => ({ default: m.StaffDashboardPage })));
const Footer = lazy(() => import('@/components/layout/Footer').then(m => ({ default: m.Footer })));

type AppRoute = 'home' | 'map' | 'reports' | 'insight' | 'contact' | 'staff';

function getRouteFromHash(): { route: AppRoute; reportId: string | null } {
  if (typeof window === 'undefined') return { route: 'home', reportId: null };
  const hash = window.location.hash || '#/';
  const reportMatch = hash.match(/^#\/laporan\/(.+)$/);

  if (reportMatch) return { route: 'reports', reportId: decodeURIComponent(reportMatch[1]) };

  switch (hash) {
    case '#/peta':
    case '#peta':
      return { route: 'map', reportId: null };
    case '#/laporan':
    case '#laporan':
      return { route: 'reports', reportId: null };
    case '#/insight':
    case '#statistik':
      return { route: 'insight', reportId: null };
    case '#/kontak':
    case '#kontak':
      return { route: 'contact', reportId: null };
    case '#/petugas':
      return { route: 'staff', reportId: null };
    case '#/':
    case '#hero':
    default:
      return { route: 'home', reportId: null };
  }
}

export default function App() {
  const [routeState, setRouteState] = useState(getRouteFromHash);

  useEffect(() => {
    loadChatbaseWidget();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setRouteState(getRouteFromHash());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const closeReportPage = () => {
    window.location.hash = '#/laporan';
  };

  const renderPage = () => {
    if (routeState.reportId) {
      return <ReportDetailPage reportId={routeState.reportId} onClose={closeReportPage} />;
    }

    switch (routeState.route) {
      case 'map':
        return (
          <Suspense fallback={<div className="min-h-screen bg-surface-0" />}>
            <MapSectionLoader />
          </Suspense>
        );
      case 'reports':
        return (
          <Suspense fallback={<div className="min-h-screen bg-surface-0" />}>
            <ReportSection />
          </Suspense>
        );
      case 'insight':
        return (
          <Suspense fallback={<div className="min-h-screen bg-surface-0" />}>
            <StatsCards />
          </Suspense>
        );
      case 'contact':
        return (
          <Suspense fallback={<div className="min-h-screen bg-surface-0" />}>
            <CTASection />
          </Suspense>
        );
      case 'staff':
        return (
          <Suspense fallback={<div className="min-h-screen bg-surface-0" />}>
            <StaffDashboardPage />
          </Suspense>
        );
      case 'home':
      default:
        return (
          <>
            <HeroSection />
            <Suspense fallback={<div className="min-h-[420px] bg-surface-0" />}>
              <BentoFeatures />
            </Suspense>
            <Suspense fallback={<div className="min-h-[560px] bg-surface-alt" />}>
              <FAQSection />
            </Suspense>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface-0">
      <div className="relative z-0">
        <Navbar />
        <main>
          {renderPage()}
        </main>
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <Footer />
        </Suspense>
      </div>
    </div>
  );
}
