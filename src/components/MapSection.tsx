// src/components/MapSection.tsx
import { SectionReveal } from './SectionReveal';
import { MapPin, Filter, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapLayerFilter } from './MapLayerFilter';

import maplibregl, { Map as MLMap } from 'maplibre-gl';

/* ======================================================================================
   1) KONFIGURASI LAYER
      - Semua URL menunjuk ke GeoJSON (FeatureCollection)
      - Layer bertipe symbol memakai ikon kustom (sprite di public/assets/logoForMap)
  ====================================================================================== */
const LAYER_CONFIG = {
  rumahsakit: {
    url: '/datageo/rumahsakit.json',
    render: 'symbol' as const,
    iconName: 'rumahsakit-icon',
    iconURL: '/assets/logoForMap/rumahsakit.webp',
    iconBitmapMaxSize: 160,
    iconSize: 0.25,
    minzoom: 11,
  },
  puskesmas: {
    url: '/datageo/puskesmas.json',
    render: 'symbol' as const,
    iconName: 'puskesmas-icon',
    iconURL: '/assets/logoForMap/puskesmas.webp',
    iconBitmapMaxSize: 96,
    iconSize: 0.19,
    minzoom: 12,
  },
  klinik: {
    url: '/datageo/klinik.json',
    render: 'symbol' as const,
    iconName: 'klinik-icon',
    iconURL: '/assets/logoForMap/klinik.webp',
    iconBitmapMaxSize: 96,
    iconSize: 0.30,
    minzoom: 12,
  },
  apotek: {
    url: '/datageo/apotek.json',
    render: 'symbol' as const,
    iconName: 'apotek-icon',
    iconURL: '/assets/logoForMap/apotek.webp',
    iconBitmapMaxSize: 96,
    iconSize: 0.20,
    minzoom: 12,
  },
   homecare: {
    url: '/datageo/homecare.json',
    render: 'symbol' as const,
    iconName: 'homecare-icon',
    iconURL: '/assets/logoForMap/homecare.webp',
    iconBitmapMaxSize: 96,
    iconSize: 0.27,
    minzoom: 12,
  },
  population: {
    url: '/datageo/kepadatan_penduduk.json',
    render: 'fill' as const,
    minzoom: 0,
    maxzoom: 22,
    fill: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'kepadatan'],
        0, '#F0FDF4',
        150, '#BBF7D0',
        250, '#4ADE80',
        400, '#22C55E',
        550, '#15803D'
      ],
      'fill-opacity': 0.6,
      'fill-outline-color': '#15803D'
    }
  },
  children: {
    url: '/datageo/sebaran_balita.json',
    render: 'fill' as const,
    minzoom: 0,
    maxzoom: 22,
    fill: {
      'fill-color': [
        'interpolate', ['linear'],
        [
          '+',
          ['get', '00__04'],
          ['get', '05__09'],
          ['get', '10__14']
        ],
        0, '#FFF1F5',
        2000, '#FBCFE8',
        4000, '#F472B6',
        6000, '#DB2777',
        8000, '#9D174D'
      ],
      'fill-opacity': 0.55,
      'fill-outline-color': '#BE185D'
    }
  },
  lansia: {
    url: '/datageo/sebaran_lansia.json',
    render: 'fill' as const,
    minzoom: 0,
    maxzoom: 22,
    fill: {
      'fill-color': [
        'interpolate', ['linear'],
        ['/',
          ['+', ['get', '60__64'], ['get', '65__69'], ['get', '70__74'], ['get', '>75']],
          ['+', ['get', '00__04'], ['get', '05__09'], ['get', '10__14'], ['get', '15__19'],
                ['get', '20__24'], ['get', '25__29'], ['get', '30__34'], ['get', '35__39'],
                ['get', '40__44'], ['get', '45__49'], ['get', '50__54'], ['get', '55__59'],
                ['get', '60__64'], ['get', '65__69'], ['get', '70__74'], ['get', '>75']]
        ],
        0.05, '#FFF7ED',
        0.10, '#FFEDD5',
        0.15, '#FDBA74',
        0.20, '#d6792eff',
        0.30, '#c94803ff'
      ],
      'fill-opacity': 0.6,
      'fill-outline-color': '#C2410C'
    }
  },
  disabilitas: {
    url: '/datageo/sebaran_disabilitas.json',
    render: 'fill' as const,
    minzoom: 0,
    maxzoom: 22,
    fill: {
      'fill-color': [
        'interpolate', ['linear'],
        [
          '+',
          ['get', 'dsb_fisik'],
          ['get', 'dsb_netra'],
          ['get', 'dsb_rungu'],
          ['get', 'dsb_mental'],
          ['get', 'dsb_lainny'],
          ['get', 'dsb_fismen']
        ],
        0, '#f2e8f5ff',
        20, '#dfc8e6ff',
        40, '#be81c7ff',
        70, '#a34cafff',
        100, '#712e7dff'
      ],
      'fill-opacity': 0.55,
      'fill-outline-color': '#5B21B6'
    }
  },
   tps: {
    url: '/datageo/tps.json',
    render: 'symbol' as const,
    iconName: 'tps-icon',
    iconURL: '/assets/logoForMap/trash.webp',
    iconBitmapMaxSize: 96,
    iconSize: 0.35,
    minzoom: 12,
  },
} as const;

type LayerId = keyof typeof LAYER_CONFIG;

type PopupRow = { label: string; value: unknown; format?: 'number' | 'text' };

const DEFAULT_DESKTOP_SELECTIONS: Readonly<Record<string, boolean>> = { rumahsakit: true };
const EMPTY_SELECTIONS: Readonly<Record<string, boolean>> = {};

function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => (
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as const)[ch as '&' | '<' | '>' | '"' | "'"] || ch
  ));
}

function formatNumber(value: unknown): string {
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString('id-ID') : '-';
}

function formatText(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value).trim();
  return str ? escapeHTML(str) : '-';
}

function buildPopupHTML(title: string, rows: PopupRow[]): string {
  const safeRows = rows
    .filter(({ value }) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(({ label, value, format }) => {
      const content = format === 'number' ? formatNumber(value) : formatText(value);
      return `<dt style="font-weight:600;color:#475569;">${escapeHTML(label)}</dt><dd style="margin:0;color:#0f172a;">${content}</dd>`;
    })
    .join('');

  return `
    <div style="min-width:220px;font-family:'Inter',system-ui,sans-serif;font-size:13px;line-height:1.45;color:#0f172a;">
      <h3 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#0f172a;">${formatText(title)}</h3>
      <dl style="margin:0;display:grid;grid-template-columns:auto 1fr;gap:6px 12px;">
        ${safeRows || '<dd style="grid-column:1 / -1;margin:0;color:#64748b;">Data tidak tersedia</dd>'}
      </dl>
    </div>
  `;
}

function normalizeSpriteSource(image: ImageBitmap | HTMLCanvasElement | HTMLImageElement): ImageBitmap | HTMLImageElement | ImageData {
  if (image instanceof HTMLCanvasElement) {
    const ctx = image.getContext('2d');
    if (!ctx) throw new Error('Tidak bisa membaca canvas untuk ikon peta');
    return ctx.getImageData(0, 0, image.width, image.height);
  }
  return image;
}

function normalizeToFC(raw: any): GeoJSON.FeatureCollection {
  if (raw && raw.type === 'FeatureCollection' && Array.isArray(raw.features)) return raw;
  if (raw && raw.type === 'Feature' && raw.geometry) return { type: 'FeatureCollection', features: [raw] };
  if (Array.isArray(raw) && raw.length && raw[0]?.type === 'Feature') return { type: 'FeatureCollection', features: raw };
  return { type: 'FeatureCollection', features: [] };
}

/* ======================================================================================
   3) KOMPONEN MAP
   ====================================================================================== */
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
  const interactionCleanups = useRef<(() => void)[]>([]);

  const teardownInteractions = useCallback(() => {
    interactionCleanups.current.forEach((fn) => fn());
    interactionCleanups.current = [];
  }, []);

  /* --------------------------- ensure source & layer --------------------------- */
  const ensureSourceAndLayer = useCallback((layerId: LayerId, data?: GeoJSON.FeatureCollection) => {
    const map = mapInstance.current!;
    const srcId = `${layerId}-src`;
    const layerName = `${layerId}-layer`;
    const cfg = LAYER_CONFIG[layerId] as any;

    if (!map.getSource(srcId)) {
      map.addSource(srcId, {
        type: 'geojson',
        data: data || { type: 'FeatureCollection', features: [] },
      });
    } else if (data) {
      (map.getSource(srcId) as maplibregl.GeoJSONSource).setData(data);
    }

    if (!map.getLayer(layerName)) {
      if ('render' in cfg && cfg.render === 'symbol') {
        const symbolLayer: any = {
          id: layerName,
          type: 'symbol',
          source: srcId,
          layout: {
            'icon-image': cfg.iconName,
            'icon-size': cfg.iconSize ?? 0.85,
            'icon-allow-overlap': true,
            visibility: 'none',
          },
        };
        if (cfg.paint) symbolLayer.paint = cfg.paint;
        if (typeof cfg.minzoom === 'number') symbolLayer.minzoom = cfg.minzoom;
        if (typeof cfg.maxzoom === 'number') symbolLayer.maxzoom = cfg.maxzoom;
        map.addLayer(symbolLayer);
      } else if ('render' in cfg && cfg.render === 'heatmap') {
        const heatmapLayer: any = {
          id: layerName,
          type: 'heatmap',
          source: srcId,
          paint: cfg.heatmap,
          layout: { visibility: 'none' },
        };
        if (typeof cfg.minzoom === 'number') heatmapLayer.minzoom = cfg.minzoom;
        if (typeof cfg.maxzoom === 'number') heatmapLayer.maxzoom = cfg.maxzoom;
        map.addLayer(heatmapLayer);
      } else if ('render' in cfg && cfg.render === 'fill') {
        const fillLayer: any = {
          id: layerName,
          type: 'fill',
          source: srcId,
          paint: cfg.fill,
          layout: { visibility: 'none' },
          minzoom: cfg.minzoom,
          maxzoom: cfg.maxzoom,
        };
        map.addLayer(fillLayer);
      } else {
        const circleLayer: any = {
          id: layerName,
          type: cfg.type || 'circle',
          source: srcId,
          paint: cfg.paint,
          layout: { visibility: 'none' },
        };
        if (typeof cfg.minzoom === 'number') circleLayer.minzoom = cfg.minzoom;
        if (typeof cfg.maxzoom === 'number') circleLayer.maxzoom = cfg.maxzoom;
        map.addLayer(circleLayer);
      }
    }
  }, []);

  /* --------------------------- visibilitas layer --------------------------- */
  const setLayerVisibility = useCallback((layerId: LayerId, visible: boolean) => {
    const map = mapInstance.current!;
    const name = `${layerId}-layer`;
    if (!map.getLayer(name)) return;
    map.setLayoutProperty(name, 'visibility', visible ? 'visible' : 'none');
  }, []);

  /* --------------------------- fit bounds FeatureCollection --------------------------- */
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

  /* --------------------------- load & show layer --------------------------- */
  const loadAndShowLayer = useCallback(
    async (layerId: LayerId, fit = false) => {
      const map = mapInstance.current!;
      const { url, minzoom } = LAYER_CONFIG[layerId];

      ensureSourceAndLayer(layerId);
      setLayerVisibility(layerId, true);

      const z = map.getZoom();
      if (typeof minzoom === 'number' && z < minzoom) {
        console.info(`[Map] Layer "${layerId}" aktif, tapi zoom (${z.toFixed(1)}) < minzoom (${minzoom}). Zoom in untuk melihat data.`);
      }

      if (!dataCache.current[url]) {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            console.warn(`[Map] Gagal fetch ${url}: HTTP ${res.status}`);
          } else {
            const raw = await res.json();
            const fc = normalizeToFC(raw);
            console.info(`[Map] ${layerId}: loaded GeoJSON features = ${fc.features.length}`);
            dataCache.current[url] = fc;
          }
        } catch (err) {
          console.warn(`[Map] Error fetch ${url}:`, err);
        }
      }

      const fc = dataCache.current[url];
      const src = map.getSource(`${layerId}-src`) as maplibregl.GeoJSONSource | undefined;
      if (fc) {
        if (src) {
          src.setData(fc);
        }
        if (fit && fc.features.length) fitFC(fc);
      } else {
        console.warn(`[Map] ${layerId}: no data in cache after fetch`);
      }

      setZoomLevel(map.getZoom());
    },
    [ensureSourceAndLayer, fitFC, setLayerVisibility]
  );

  const hideLayer = useCallback((layerId: LayerId) => {
    setLayerVisibility(layerId, false);
  }, [setLayerVisibility]);

  /* --------------------------- popup interactions --------------------------- */
  const registerHoverPopup = useCallback((layerId: LayerId, getContent: (feature: maplibregl.MapGeoJSONFeature) => string | null) => {
    const map = mapInstance.current;
    if (!map) return;
    const layerName = `${layerId}-layer`;
    if (!map.getLayer(layerName)) return;

    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 });

    const onEnter = (event: maplibregl.MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const html = getContent(feature);
      if (!html) return;
      map.getCanvas().style.cursor = 'pointer';
      popup.setLngLat(event.lngLat).setHTML(html).addTo(map);
    };

    const onMove = (event: maplibregl.MapLayerMouseEvent) => {
      if (!popup.isOpen()) return;
      popup.setLngLat(event.lngLat);
    };

    const onLeave = () => {
      popup.remove();
      if (map.getCanvas().style.cursor === 'pointer') map.getCanvas().style.cursor = '';
    };

    map.on('mouseenter', layerName, onEnter);
    map.on('mousemove', layerName, onMove);
    map.on('mouseleave', layerName, onLeave);

    interactionCleanups.current.push(() => {
      popup.remove();
      map.off('mouseenter', layerName, onEnter);
      map.off('mousemove', layerName, onMove);
      map.off('mouseleave', layerName, onLeave);
    });
  }, []);

  const registerClickPopup = useCallback((layerId: LayerId, getContent: (feature: maplibregl.MapGeoJSONFeature) => string | null) => {
    const map = mapInstance.current;
    if (!map) return;
    const layerName = `${layerId}-layer`;
    if (!map.getLayer(layerName)) return;

    const popup = new maplibregl.Popup({ closeButton: true, offset: 16, maxWidth: '320px' });

    const onClick = (event: maplibregl.MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const html = getContent(feature);
      if (!html) return;
      popup.setLngLat(event.lngLat).setHTML(html).addTo(map);
    };

    map.on('click', layerName, onClick);
    interactionCleanups.current.push(() => {
      popup.remove();
      map.off('click', layerName, onClick);
    });
  }, []);

  const registerAllInteractions = useCallback(() => {
    const map = mapInstance.current;
    if (!map) return;

    teardownInteractions();

    const allowHover = (() => {
      if (typeof window === 'undefined') return true;
      if (isMobile) return false;
      const hoverMedia = window.matchMedia?.('(hover: hover)');
      const pointerFine = window.matchMedia?.('(pointer: fine)');
      return (hoverMedia?.matches ?? true) && (pointerFine?.matches ?? true);
    })();

    const mapFacilityPopup = (props: any): { title: string; rows: PopupRow[] } => ({
      title: props.namobj ?? props.nama ?? 'Fasilitas Kesehatan',
      rows: [
        { label: 'Alamat', value: props.rsalamat ?? props.kalamat ?? props.pkmlmt ?? props.almaptk, format: 'text' },
        { label: 'Status', value: props.status, format: 'text' },
        { label: 'Kelas', value: props.kelas, format: 'text' },
        { label: 'Penanggung jawab', value: props.pnjwb ?? props.apjaptk ?? props.pemilik, format: 'text' },
        { label: 'Jumlah kasur', value: props.jumtt, format: 'number' },
        { label: 'SIA/Izin', value: props.nosia ?? props.izin, format: 'text' },
      ],
    });

    const registerFacilityLayer = (layerId: LayerId, summaryRows = 2) => {
      if (allowHover) {
        registerHoverPopup(layerId, (feature) => {
          const { title, rows } = mapFacilityPopup(feature.properties || {});
          return buildPopupHTML(title, rows.slice(0, summaryRows));
        });
      }
      registerClickPopup(layerId, (feature) => {
        const { title, rows } = mapFacilityPopup(feature.properties || {});
        return buildPopupHTML(title, rows);
      });
    };

    registerFacilityLayer('rumahsakit', 3);
    registerFacilityLayer('puskesmas', 3);
    registerFacilityLayer('klinik', 2);
    registerFacilityLayer('apotek', 2);
    registerFacilityLayer('homecare', 2);

    if (allowHover) {
      registerHoverPopup('population', (feature) => {
        const props = feature.properties || {};
        return buildPopupHTML(props.namobj ?? 'Kepadatan Penduduk', [
          { label: 'Kecamatan', value: props.wadmkc, format: 'text' },
          { label: 'Penduduk', value: props.jlhpendudu, format: 'number' },
          { label: 'Kepadatan (jiwa/km²)', value: props.kepadatan, format: 'number' },
        ]);
      });
    }
    registerClickPopup('population', (feature) => {
      const props = feature.properties || {};
      return buildPopupHTML(props.namobj ?? 'Kepadatan Penduduk', [
        { label: 'Kecamatan', value: props.wadmkc, format: 'text' },
        { label: 'Kelurahan', value: props.wadmkd, format: 'text' },
        { label: 'Penduduk', value: props.jlhpendudu, format: 'number' },
        { label: 'Kepadatan (jiwa/km²)', value: props.kepadatan, format: 'number' },
        { label: 'Luas (km²)', value: props.luaswh, format: 'number' },
      ]);
    });

    const sumChildren = (props: any) =>
      ['00__04', '05__09', '10__14'].reduce((acc, key) => acc + (Number(props[key]) || 0), 0);

    if (allowHover) {
      registerHoverPopup('children', (feature) => {
        const props = feature.properties || {};
        return buildPopupHTML(props.namobj ?? 'Sebaran Penduduk', [
          { label: 'Kecamatan', value: props.wadmkc, format: 'text' },
          { label: 'Balita (0-4)', value: props['00__04'], format: 'number' },
        ]);
      });
    }
    registerClickPopup('children', (feature) => {
      const props = feature.properties || {};
      return buildPopupHTML(props.namobj ?? 'Sebaran Penduduk', [
        { label: 'Kecamatan', value: props.wadmkc, format: 'text' },
        { label: 'Balita (0-4)', value: props['00__04'], format: 'number' },
        { label: 'Anak (5-9)', value: props['05__09'], format: 'number' },
        { label: 'Remaja (10-14)', value: props['10__14'], format: 'number' },
        { label: 'Total 0-14 Tahun', value: sumChildren(props), format: 'number' },
      ]);
    });

    const sumDisability = (props: any) =>
      ['dsb_fisik', 'dsb_netra', 'dsb_rungu', 'dsb_mental', 'dsb_lainny', 'dsb_fismen']
        .reduce((acc, key) => acc + (Number(props[key]) || 0), 0);

    if (allowHover) {
      registerHoverPopup('disabilitas', (feature) => {
        const props = feature.properties || {};
        return buildPopupHTML(props.namobj ?? 'Sebaran Disabilitas', [
          { label: 'Kecamatan', value: props.wadmkc, format: 'text' },
          { label: 'Total Disabilitas', value: sumDisability(props), format: 'number' },
        ]);
      });
    }
    registerClickPopup('disabilitas', (feature) => {
      const props = feature.properties || {};
      return buildPopupHTML(props.namobj ?? 'Sebaran Disabilitas', [
        { label: 'Kecamatan', value: props.wadmkc, format: 'text' },
        { label: 'Fisik', value: props.dsb_fisik, format: 'number' },
        { label: 'Netra', value: props.dsb_netra, format: 'number' },
        { label: 'Rungu/Wicara', value: props.dsb_rungu, format: 'number' },
        { label: 'Mental', value: props.dsb_mental, format: 'number' },
        { label: 'Lainnya', value: props.dsb_lainny, format: 'number' },
        { label: 'Fisik & Mental', value: props.dsb_fismen, format: 'number' },
        { label: 'Total', value: sumDisability(props), format: 'number' },
      ]);
    });
  }, [registerClickPopup, registerHoverPopup, teardownInteractions, isMobile]);

  /* --------------------------- responsif & PRM --------------------------- */
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

  /* --------------------------- fullscreen --------------------------- */
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? 'hidden' : 'unset';
    const id = setTimeout(() => mapInstance.current?.resize(), 0);
    return () => clearTimeout(id);
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(() => setIsFullscreen((prev) => !prev), []);

  /* --------------------------- zoom controls --------------------------- */
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

  /* --------------------------- init map sekali --------------------------- */
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=2gdBMkelnNTDj6FyZkyv',
      center: [114.833, -3.442],
      zoom: 12,
      attributionControl: false,
      hash: false,
    });
    mapInstance.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.on('zoomend', () => setZoomLevel(map.getZoom()));

    async function loadIconImage(
      url: string,
      maxDimension = 1024
    ): Promise<ImageBitmap | HTMLCanvasElement | HTMLImageElement> {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${url}`);
      const blob = await res.blob();

      if ('createImageBitmap' in window) {
        try {
          let bitmap = await createImageBitmap(blob);
          const maxDim = Math.max(bitmap.width, bitmap.height);
          if (maxDim > maxDimension) {
            const scale = maxDimension / maxDim;
            bitmap = await createImageBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, {
              resizeWidth: Math.max(1, Math.round(bitmap.width * scale)),
              resizeHeight: Math.max(1, Math.round(bitmap.height * scale)),
              resizeQuality: 'high',
            });
            console.info(`[Map] Ikon ${url} di-resize jadi ${bitmap.width}x${bitmap.height}`);
          }
          return bitmap;
        } catch (err) {
          console.info('[Map] createImageBitmap fallback → HTMLImageElement untuk', url, err);
        }
      }

      return await new Promise<HTMLCanvasElement | HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        const objectUrl = URL.createObjectURL(blob);
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const maxDim = Math.max(img.naturalWidth, img.naturalHeight);
          if (maxDim > maxDimension) {
            const scale = maxDimension / maxDim;
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Tidak bisa mendapatkan konteks canvas'));
              return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            console.info(`[Map] Ikon ${url} di-resize (fallback) jadi ${canvas.width}x${canvas.height}`);
            resolve(canvas);
          } else {
            resolve(img);
          }
        };
        img.onerror = (err) => {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        };
        img.src = objectUrl;
      });
    }

    map.on('load', async () => {
      try {
        interactionCleanups.current = [];
        setMapLoaded(true);
        setZoomLevel(map.getZoom());

        if (typeof window !== 'undefined' && import.meta.env.DEV) {
          (window as any).map = map;
          console.info('[Map Debug] window.map tersedia di console');
        }

        const symbolLayers = (Object.entries(LAYER_CONFIG) as [LayerId, any][])
          .filter(([, cfg]) => cfg.render === 'symbol');

        for (const [layerId, cfg] of symbolLayers) {
          if (!cfg.iconName || !cfg.iconURL) continue;
          if (map.hasImage(cfg.iconName)) continue;
          try {
            const bitmap = await loadIconImage(cfg.iconURL, cfg.iconBitmapMaxSize ?? 256);
            map.addImage(cfg.iconName, normalizeSpriteSource(bitmap));
            console.info(`[Map] Ikon ${layerId} berhasil dimuat`);
          } catch (iconErr) {
            console.warn(`[Map] Gagal memuat ikon ${layerId}:`, iconErr);
          }
        }

        (Object.keys(LAYER_CONFIG) as LayerId[]).forEach((id) => ensureSourceAndLayer(id));
        registerAllInteractions();

        void loadAndShowLayer('rumahsakit', false);

        if (map.isStyleLoaded()) map.once('idle', () => setMapLoaded(true));
        else map.once('load', () => map.once('idle', () => setMapLoaded(true)));

        setTimeout(() => map.resize(), 0);
      } catch (err) {
        console.warn('[Map] Gagal inisialisasi ikon/layer:', err);
      }
    });

    map.on('click', 'lansia-layer', (event) => {
      const props = event.features?.[0]?.properties || {};
      const lansia = ['60__64', '65__69', '70__74', '>75'].reduce((acc, key) => acc + (Number(props[key]) || 0), 0);
      const total = [
        '00__04', '05__09', '10__14', '15__19', '20__24', '25__29', '30__34', '35__39',
        '40__44', '45__49', '50__54', '55__59', '60__64', '65__69', '70__74', '>75',
      ].reduce((acc, key) => acc + (Number(props[key]) || 0), 0);
      const ratio = total ? ((lansia / total) * 100).toFixed(1) : '0';

      new maplibregl.Popup({ offset: 16 })
        .setLngLat(event.lngLat)
        .setHTML(buildPopupHTML(props.namobj ?? 'Sebaran Lansia', [
          { label: 'Kecamatan', value: props.wadmkc, format: 'text' },
          { label: 'Total Penduduk', value: total, format: 'number' },
          { label: 'Total Lansia (≥60)', value: lansia, format: 'number' },
          { label: 'Proporsi Lansia', value: `${ratio}%`, format: 'text' },
        ]))
        .addTo(map);
    });

    const onStyleData = () => registerAllInteractions();
    map.on('styledata', onStyleData);

    return () => {
      map.off('styledata', onStyleData);
      map.remove();
      mapInstance.current = null;
      teardownInteractions();
      setMapLoaded(false);
    };
  }, [ensureSourceAndLayer, loadAndShowLayer, registerAllInteractions, teardownInteractions]);

  /* --------------------------- RENDER --------------------------- */
  return (
    <section id="peta" className="relative pt-2 pb-10 sm:pt-16 sm:pb-12 lg:pt-24 lg:pb-20 overflow-hidden">
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
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-32">
                  <MapLayerFilter
                    isMobile={false}
                    defaultSelections={DEFAULT_DESKTOP_SELECTIONS}
                    onToggle={async (layerId, enabled) => {
                      if (!(layerId in LAYER_CONFIG)) return;
                      const id = layerId as LayerId;
                      if (enabled) await loadAndShowLayer(id, false);
                      else hideLayer(id);
                    }}
                  />
                </div>
              </div>

              <div className="flex-1">
                <motion.div
                  className={`relative rounded-3xl overflow-hidden bg-white ${isFullscreen ? 'fixed inset-0 z-[100]' : ''}`}
                  style={{
                    boxShadow: '0 6px 24px rgba(0,0,0,0.05)',
                    height: isFullscreen ? '100vh' : 'clamp(480px, 60vh, 760px)',
                  }}
                  role="region"
                  aria-label="Interactive health map"
                >
                  <div ref={mapRef} className="absolute inset-0" />

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

                  {!isFullscreen && (
                    <motion.button
                      onClick={() => setIsFilterOpen(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="lg:hidden absolute top-4 left-4 bg-white rounded-full p-3 md:p-3.5 shadow-lg z-20 backdrop-blur-sm"
                      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.95)' }}
                      aria-label="Open filter"
                    >
                      <Filter size={20} className="text-brand-green md:w-[22px] md:h-[22px]" strokeWidth={2.5} />
                    </motion.button>
                  )}

                  <div className="hidden md:block absolute bottom-6 right-6 z-10">
                    <div className="flex flex-col gap-3">
                      <IconButton label="Zoom in" onClick={handleZoomIn}><ZoomIn size={20} /></IconButton>
                      <IconButton label="Zoom out" onClick={handleZoomOut}><ZoomOut size={20} /></IconButton>
                      <IconButton label="Toggle fullscreen" onClick={toggleFullscreen}><Maximize2 size={20} /></IconButton>
                    </div>
                  </div>

                  {!isFullscreen && (
                    <div className="md:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-2.5 px-4">
                      <SmallButton aria="Zoom in map" onClick={handleZoomIn}><ZoomIn size={20} /></SmallButton>
                      <SmallButton aria="Toggle fullscreen" onClick={toggleFullscreen}>
                        <Maximize2 size={18} />
                        <span className="text-ink-740 text-xs font-semibold">Fullscreen</span>
                      </SmallButton>
                      <SmallButton aria="Zoom out map" onClick={handleZoomOut}><ZoomOut size={20} /></SmallButton>
                    </div>
                  )}

                  {isFullscreen && (
                    <motion.button
                      onClick={toggleFullscreen}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center z-[101]"
                      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                      aria-label="Close fullscreen"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        className="text-ink-700">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </motion.button>
                  )}

                  <div className="hidden sm:block absolute bottom-3 right-3 text-xs bg-white/90 px-2 py-1 rounded shadow z-10">
                    {mapLoaded && mapInstance.current
                      ? (() => {
                          const map = mapInstance.current!;
                          const layerIds = (Object.keys(LAYER_CONFIG) as LayerId[]).map((id) => `${id}-layer`);
                          const rendered = map.queryRenderedFeatures({ layers: layerIds }).length;
                          return `Zoom: ${zoomLevel.toFixed(1)} | Rendered: ${rendered}`;
                        })()
                      : 'Loading…'}
                  </div>
                </motion.div>
              </div>
            </div>

            <MapLayerFilter
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              isMobile={isMobile}
              defaultSelections={EMPTY_SELECTIONS}
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

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 pointer-events-none z-[90]"
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ====== Tombol kecil DRY ====== */
function IconButton({
  label, onClick, children,
}: { label: string; onClick: () => void; children: React.ReactNode; }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      className="group relative w-12 h-12 rounded-full bg-white flex items-center justify-center transition-all duration-200"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      aria-label={label}
    >
      <div className="text-ink-700 group-hover:text-white transition-colors">{children}</div>
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
           style={{ background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)' }} />
      <div className="absolute text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {children}
      </div>
    </motion.button>
  );
}

function SmallButton({
  aria, onClick, children,
}: { aria: string; onClick: () => void; children: React.ReactNode; }) {
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
        whileTap={{ opacity: 1 }} transition={{ duration: 0.15 }}
      />
    </motion.button>
  );
}
