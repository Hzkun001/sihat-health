// MapSection.tsx
import { SectionReveal } from './SectionReveal';
import { MapPin, Filter, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, m } from 'motion/react';
import { MapLayerFilter } from './MapLayerFilter';
import { parseArcgisToGeoJSON } from '@/utils/parseArcgisToGeoJSON';

import maplibregl, { Map as MLMap } from 'maplibre-gl';

/** ============================
 *  Konfigurasi layer titik (ID harus sama dg MapLayerFilter)
 * ============================ */
const LAYER_CONFIG = {
  hospitals: {
    url: '/data/rumah_sakit.json',
    render: 'symbol' as const,
    iconName: 'hospital-icon',          
    iconURL: '/assets/hospital.png',       
    iconSize: 0.85,                    
    minzoom: 8,
  },
  puskesmas: {
    url: '/data/puskesmas.json',
    type: 'circle' as const,
    paint: {
      'circle-radius': 5,
      'circle-color': '#3498DB',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    },
    minzoom: 8,
  },
  clinics: {
    url: '/data/klinik.json',
    type: 'circle' as const,
    paint: {
      'circle-radius': 4.5,
      'circle-color': '#9B59B6',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    },
    minzoom: 9,
  },
  pharmacies: {
    url: '/data/apotek.json',
    type: 'circle' as const,
    paint: {
      'circle-radius': 4,
      'circle-color': '#1BA351',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    },
    minzoom: 10,
  },
  population: {
    url: '/data/kepadatan_penduduk.json',
    type: 'circle' as const,
    paint: {
      'circle-radius': 4.5,
      'circle-color': '#2d2d2dff',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    },
    minzoom: 9,
  },
  children: {
    url: '/data/sebaran_balita.json',
    type: 'circle' as const,
    paint: {
      'circle-radius': 4.5,
      'circle-color': '#e856b7ff',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    },
    minzoom: 9,
  },
  homecare: {
    url: '/data/home_care_lansia.json',
    type: 'circle' as const,
    paint: {
      'circle-radius': 4.5,
      'circle-color': '#f2c193ff',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    },
    minzoom: 9,
  },
  elderly: {
        url: '/data/sebaran_lansia.json',   // EsriJSON → dikonversi runtime
        render: 'heatmap' as const,
        minzoom: 0,
        maxzoom: 22,
        heatmap: {
          'heatmap-radius': [
            'interpolate', ['linear'], ['zoom'],
            5, 12,
            12, 28
          ],
          'heatmap-intensity': [
            'interpolate', ['linear'], ['zoom'],
            5, 0.6,
            12, 1.6
          ],
          'heatmap-opacity': 0.9,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, '#9BE7FF',
            0.4, '#5AC8FA',
            0.6, '#34C759',
            0.8, '#FFC107',
            1, '#FF3B30'
          ]
        },
      },
 } as const;

type LayerId = keyof typeof LAYER_CONFIG;

export function MapSection() {
  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prefersReducedMotion, setPRM] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(12);

  // Map refs & cache
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<MLMap | null>(null);
  const dataCache = useRef<Record<string, GeoJSON.FeatureCollection | null>>({});

  // Pastikan source+layer ada; kalau belum, buat (default hidden).
  const ensureSourceAndLayer = useCallback((layerId: LayerId, data?: GeoJSON.FeatureCollection) => {
    const map = mapInstance.current!;
    const srcId = `${layerId}-src`;
    const layerName = `${layerId}-layer`;
    const cfg = LAYER_CONFIG[layerId];

    if (!map.getSource(srcId)) {
      map.addSource(srcId, {
        type: 'geojson',
        data: data || { type: 'FeatureCollection', features: [] },
      });
    } else if (data) {
      (map.getSource(srcId) as maplibregl.GeoJSONSource).setData(data);
    }

    if (!map.getLayer(layerName)) {
      // Handle special case for heatmap layer (elderly)
      if ('render' in cfg && cfg.render === 'heatmap') {
        map.addLayer(
          {
            id: layerName,
            type: 'heatmap',
            source: srcId,
            paint: cfg.heatmap as any,
            layout: { visibility: 'none' },
            minzoom: cfg.minzoom,
            maxzoom: cfg.maxzoom,
          },
          undefined // beforeId opsional
        );
      } else {
        map.addLayer(
          {
            id: layerName,
            type: cfg.type,
            source: srcId,
            paint: cfg.paint as any,
            layout: { visibility: 'none' },
            minzoom: cfg.minzoom,
          },
          undefined // beforeId opsional
        );
      }
    }
  }, []);

  const setLayerVisibility = useCallback((layerId: LayerId, visible: boolean) => {
    const map = mapInstance.current!;
    const name = `${layerId}-layer`;
    if (!map.getLayer(name)) return;
    map.setLayoutProperty(name, 'visibility', visible ? 'visible' : 'none');
  }, []);

  const fitFC = useCallback((fc: GeoJSON.FeatureCollection) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const visit = (c: any) =>
      Array.isArray(c[0])
        ? c.forEach(visit)
        : ([minX, minY, maxX, maxY] = [
            Math.min(minX, c[0]),
            Math.min(minY, c[1]),
            Math.max(maxX, c[0]),
            Math.max(maxY, c[1]),
          ]);
    for (const f of fc.features) {
      if (!f.geometry) continue;
      visit((f.geometry as any).coordinates);
    }
    if (!isFinite(minX)) return;
    mapInstance.current!.fitBounds([[minX, minY], [maxX, maxY]], { padding: 40, duration: 400 });
  }, []);

  // Fetch + cache → ensure source/layer → show
  // Fetch + cache → ensure source/layer → show  (VERSI ROBUST)
const loadAndShowLayer = useCallback(
  async (layerId: LayerId, fit = false) => {
    const map = mapInstance.current!;
    const { url, minzoom } = LAYER_CONFIG[layerId];

    // 1) Buat source+layer kalau belum ada (isi kosong dulu), lalu tampilkan
    ensureSourceAndLayer(layerId);
    setLayerVisibility(layerId, true);

    // Hint kalau zoom < minzoom (biar nggak terasa "kosong")
    const z = map.getZoom();
    if (typeof minzoom === 'number' && z < minzoom) {
      console.info(
        `[Map] Layer "${layerId}" aktif, tapi zoom (${z.toFixed(1)}) < minzoom (${minzoom}). Zoom in untuk melihat titik.`
      );
    }

    // 2) Ambil & cache data bila belum ada
   // 2) Ambil & cache data bila belum ada
if (!dataCache.current[url]) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[Map] Gagal fetch ${url}: HTTP ${res.status}`);
    } else {
      const raw: unknown = await res.json();

      // KONVERSI ArcGIS → GeoJSON
      const fc = parseArcgisToGeoJSON(raw);

      // DIAGNOSTIK: hitung fitur & tampilkan contoh properti
      const n = fc.features?.length ?? 0;
      console.info(`[Map] ${layerId}: converted features = ${n}`);
      if (n > 0) {
        // Tampilkan sample untuk cek field apa yang ada (status/namobj/dll)
        console.info(`[Map] ${layerId}: sample properties =`, fc.features[0].properties);
        // Cek koordinat pertama
        const g = fc.features[0].geometry;
        console.info(`[Map] ${layerId}: sample geometry =`, g);
      }

      dataCache.current[url] = fc;
    }
  } catch (err) {
    console.warn(`[Map] Error fetch ${url}:`, err);
  }
}

// 3) Jika sudah ada data, set ke source + optional fitBounds
const fc = dataCache.current[url];
const src = map.getSource(`${layerId}-src`) as maplibregl.GeoJSONSource | undefined;
if (fc) {
  if (src) {
    // DIAGNOSTIK: sebelum setData, log lagi
        console.info(`[Map] ${layerId}: setData with ${fc.features.length} features`);
        src.setData(fc);
      }
      if (fit && fc.features.length) {
        fitFC(fc);
      }
    } else {
      console.warn(`[Map] ${layerId}: no data in cache after fetch/parse`);
    }

    // 4) Update state zoom
        setZoomLevel(map.getZoom());
      },
      [ensureSourceAndLayer, setLayerVisibility, fitFC]
  );

  const hideLayer = useCallback(
    (layerId: LayerId) => {
      setLayerVisibility(layerId, false);
    },
    [setLayerVisibility]
  );

  /** ============================
   * Effects
   * ============================ */

  // Responsif & prefers-reduced-motion
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPRM(mql.matches);
    const onPRM = (e: MediaQueryListEvent) => setPRM(e.matches);
    mql.addEventListener?.('change', onPRM);

    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();

    const onResize = () => {
      window.requestAnimationFrame(() => {
        checkMobile();
        mapInstance.current?.resize();
      });
    };
    window.addEventListener('resize', onResize);

    return () => {
      mql.removeEventListener?.('change', onPRM);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Fullscreen (pakai wrapper fixed)
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? 'hidden' : 'unset';
    const id = setTimeout(() => mapInstance.current?.resize(), 0);
    return () => clearTimeout(id);
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(() => setIsFullscreen((v) => !v), []);

  const handleZoomIn = useCallback(() => {
    const map = mapInstance.current;
    if (!map) return;
    const next = Math.min(map.getZoom() + 0.5, 18);
    map.easeTo({ zoom: next, duration: 300 });
    setZoomLevel(next);
  }, []);

  const handleZoomOut = useCallback(() => {
    const map = mapInstance.current;
    if (!map) return;
    const next = Math.max(map.getZoom() - 0.5, 3);
    map.easeTo({ zoom: next, duration: 300 });
    setZoomLevel(next);
  }, []);

  // Init Map — sekali saja
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=2gdBMkelnNTDj6FyZkyv', // TODO: pindah ke env
      center: [114.833, -3.442], // Banjarbaru
      zoom: 12,
      attributionControl: false,
      hash: false,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.on('zoomend', () => setZoomLevel(map.getZoom()));

    map.on('load', () => {
      
      setMapLoaded(true);
      setZoomLevel(map.getZoom());
        (window as any).map = map;
        console.info("[Map Debug] window.map tersedia di console");
      (Object.keys(LAYER_CONFIG) as LayerId[]).forEach((id) => ensureSourceAndLayer(id));
      // tampilkan default
      // void loadAndShowLayer('hospitals', false);

      if (map.isStyleLoaded()) map.once('idle', () => setMapLoaded(true));
      else map.once('load', () => map.once('idle', () => setMapLoaded(true)));
      
      // jaga-jaga: resize setelah style siap
      setTimeout(() => map.resize(), 0);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      setMapLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // init sekali

  return (
    <section id="peta" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #F9FCFF 0%, #FFFFFF 100%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <SectionReveal>
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
              Visualisasi distribusi fasilitas kesehatan dan indikator kesehatan masyarakat Banjarbaru
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          <div className="relative">
            <div className="flex gap-6 lg:gap-8">
              {/* Panel filter kiri (desktop) */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-32">
                  <MapLayerFilter
                     isMobile={false}                     // atau pakai {isMobile} tapi pastikan false di desktop
                      defaultSelections={{ hospitals: true }}
                      onToggle={async (layerId, enabled) => {
                        if (!(layerId in LAYER_CONFIG)) return;
                        const id = layerId as LayerId;
                        if (enabled) await loadAndShowLayer(id, false);
                        else hideLayer(id);
                    }}
                  />
                </div>
              </div>

              {/* Map wrapper */}
              <div className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.005 }}
                  transition={{ duration: 0.3 }}
                  className={`relative rounded-3xl overflow-hidden bg-white ${
                    isFullscreen ? 'fixed inset-0 z-[100]' : ''
                  }`}
                  style={{
                    boxShadow: '0 6px 24px rgba(0,0,0,0.05)',
                    height: isFullscreen ? '100vh' : 'clamp(480px, 60vh, 760px)',
                  }}
                  role="region"
                  aria-label="Interactive health map"
                >
                  {/* Container MapLibre */}
                  <div ref={mapRef} className="absolute inset-0" />

                  {/* Placeholder animasi: hilang setelah map idle */}
                  {!prefersReducedMotion && !isFullscreen && !mapLoaded && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <motion.div
                          className="w-20 h-20 mx-auto rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <MapPin size={36} className="text-brand-green" />
                        </motion.div>
                        <div>
                          <h3 className="text-ink-900 mb-2 text-[24px] font-bold">
                            Peta Kesehatan Banjarbaru
                          </h3>
                          <p className="text-ink-700 text-[16px]">Integrasi data geospasial kesehatan</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tombol Filter (mobile) */}
                  {!isFullscreen && (
                    <motion.button
                      onClick={() => setIsFilterOpen(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="lg:hidden absolute top-4 left-4 bg-white rounded-full p-3 md:p-3.5 shadow-lg z-20 backdrop-blur-sm"
                      style={{
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                      }}
                      aria-label="Open filter"
                    >
                      <Filter size={20} className="text-brand-green md:w-[22px] md:h-[22px]" strokeWidth={2.5} />
                    </motion.button>
                  )}

                  {/* Kontrol zoom & fullscreen (desktop/tablet) */}
                  <div className="hidden md:block absolute bottom-6 right-6 z-10">
                    <div className="flex flex-col gap-3">
                      <IconButton label="Zoom in" onClick={handleZoomIn}>
                        <ZoomIn size={20} />
                      </IconButton>
                      <IconButton label="Zoom out" onClick={handleZoomOut}>
                        <ZoomOut size={20} />
                      </IconButton>
                      <IconButton label="Toggle fullscreen" onClick={toggleFullscreen}>
                        <Maximize2 size={20} />
                      </IconButton>
                    </div>
                  </div>

                  {/* Kontrol mobile bawah */}
                  {!isFullscreen && (
                    <div className="md:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-2.5 px-4">
                      <SmallButton aria="Zoom in map" onClick={handleZoomIn}>
                        <ZoomIn size={20} />
                      </SmallButton>
                      <SmallButton aria="Toggle fullscreen" onClick={toggleFullscreen}>
                        <Maximize2 size={18} />
                        <span className="text-ink-700 text-sm font-semibold">Layar Penuh</span>
                      </SmallButton>
                      <SmallButton aria="Zoom out map" onClick={handleZoomOut}>
                        <ZoomOut size={20} />
                      </SmallButton>
                    </div>
                  )}

                  {/* Close fullscreen */}
                  {isFullscreen && (
                    <motion.button
                      onClick={toggleFullscreen}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center z-[101]"
                      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                      aria-label="Close fullscreen"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-ink-700"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Drawer filter (mobile) */}
            <MapLayerFilter
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              isMobile={isMobile}
              onToggle={async (layerId: string, enabled: boolean) => {
                if (!(layerId in LAYER_CONFIG)) return;
                const id = layerId as LayerId;
                if (enabled) await loadAndShowLayer(id, false);
                else hideLayer(id);
                setIsFilterOpen(false);
              }}
            />
          </div>
        </SectionReveal>
      </div>

      {/* Overlay shading saat fullscreen (kosmetik) */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 pointer-events-none z-[90]"
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ====== Tombol kecil DRY ====== */
function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group relative w-12 h-12 rounded-full bg-white flex items-center justify-center transition-all duration-200"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      aria-label={label}
    >
      <div className="text-ink-700 group-hover:text-white transition-colors">{children}</div>
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)' }}
      />
      <div className="absolute text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {children}
      </div>
    </motion.button>
  );
}

function SmallButton({
  aria,
  onClick,
  children,
}: {
  aria: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="relative flex-1 h-12 rounded-xl bg-white flex items-center justify-center gap-2 overflow-hidden active:shadow-lg transition-shadow duration-200 max-w-[120px]"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      aria-label={aria}
    >
      {children}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{ background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)', opacity: 0 }}
        whileTap={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      />
    </motion.button>
  );
}
