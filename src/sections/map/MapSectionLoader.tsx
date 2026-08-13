import { lazy, Suspense } from 'react';

const MapSection = lazy(() =>
  import('./MapSection').then((module) => ({ default: module.MapSection })),
);

/**
 * Route-level lazy boundary for the map. The route is explicit, so the map
 * mounts immediately instead of depending on viewport observer behavior.
 */
export function MapSectionLoader() {
  return (
    <div id="peta" className="relative">
      <Suspense fallback={<div className="min-h-[720px] bg-surface-0" aria-label="Memuat peta" />}> 
        <MapSection sectionId={null} />
      </Suspense>
    </div>
  );
}
