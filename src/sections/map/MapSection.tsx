// src/components/MapSection.tsx
import { SectionReveal } from '@/components/shared/SectionReveal';
import {
  AlertTriangle,
  Building2,
  Compass,
  CornerDownLeft,
  Cross,
  FileText,
  Filter,
  Home,
  Hospital,
  Layers3,
  Loader2,
  LocateFixed,
  MapPin,
  Maximize2,
  Pill,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapLayerFilter } from './MapLayerFilter';
import { loadCommunityReports, reportsToFeatureCollection, subscribeToCommunityReports } from '@/lib/communityReports';
import {
  buildUnifiedSearchIndex,
  querySearchIndex,
  SearchItem,
  SearchResultItem,
  FOCUS_MAP_ITEM_EVENT,
  formatDistanceString,
} from '@/lib/searchEngine';

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
        ['coalesce', ['get', 'kepadatan'], 0],
        0, '#F7F3EA',
        150, '#E7DED1',
        250, '#B8AA96',
        400, '#7A6F60',
        550, '#464039'
      ],
      'fill-opacity': 0.6,
      'fill-outline-color': '#7A6F60'
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
          ['coalesce', ['get', '00__04'], 0],
          ['coalesce', ['get', '05__09'], 0],
          ['coalesce', ['get', '10__14'], 0]
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
          ['+', ['coalesce', ['get', '60__64'], 0], ['coalesce', ['get', '65__69'], 0], ['coalesce', ['get', '70__74'], 0], ['coalesce', ['get', '>75'], 0]],
          ['max',
            ['+',
              ['coalesce', ['get', '00__04'], 0], ['coalesce', ['get', '05__09'], 0], ['coalesce', ['get', '10__14'], 0], ['coalesce', ['get', '15__19'], 0],
              ['coalesce', ['get', '20__24'], 0], ['coalesce', ['get', '25__29'], 0], ['coalesce', ['get', '30__34'], 0], ['coalesce', ['get', '35__39'], 0],
              ['coalesce', ['get', '40__44'], 0], ['coalesce', ['get', '45__49'], 0], ['coalesce', ['get', '50__54'], 0], ['coalesce', ['get', '55__59'], 0],
              ['coalesce', ['get', '60__64'], 0], ['coalesce', ['get', '65__69'], 0], ['coalesce', ['get', '70__74'], 0], ['coalesce', ['get', '>75'], 0]
            ],
            1
          ]
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
          ['coalesce', ['get', 'dsb_fisik'], 0],
          ['coalesce', ['get', 'dsb_netra'], 0],
          ['coalesce', ['get', 'dsb_rungu'], 0],
          ['coalesce', ['get', 'dsb_mental'], 0],
          ['coalesce', ['get', 'dsb_lainny'], 0],
          ['coalesce', ['get', 'dsb_fismen'], 0]
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
  communityReports: {
    render: 'symbol' as const,
    iconName: [
      'case',
      ['==', ['get', 'hasPhoto'], true],
      'community-report-photo-icon',
      'community-report-icon',
    ],
    iconSize: 0.72,
    minzoom: 0,
  },
  PendudukBanjarmasin: {
    url: '/datageo/kecamatan_penduduk_banjarmasin.geojson',
    render: 'fill' as const,
    minzoom: 0,
    maxzoom: 22,
    fill: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'Penduduk'], 0],
        80000, '#DCFCE7',
        110000, '#86EFAC',
        140000, '#22C55E',
        170000, '#15803D'
      ],
      'fill-opacity': 0.56,
      'fill-outline-color': '#14532D',
    },
    line: {
      'line-color': '#052E16',
      'line-width': 1.5,
      'line-opacity': 0.9,
    },
    fitOnToggle: true,
  },
} as const;

type LayerId = keyof typeof LAYER_CONFIG;

type PopupRow = { label: string; value: unknown; format?: 'number' | 'text' };
type LngLatTuple = [number, number];
type DetailInfo = {
  id?: string;
  layerId: LayerId;
  title: string;
  category: string;
  badge?: string;
  rows: PopupRow[];
  coordinates?: LngLatTuple | null;
};
type BasemapId = 'streets' | 'light' | 'satellite';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY?.trim() || '2gdBMkelnNTDj6FyZkyv';
const DEFAULT_CENTER: [number, number] = [114.833, -3.442];
const DEFAULT_ZOOM = 12;
const DEFAULT_BASEMAP: BasemapId = 'streets';
const DEFAULT_DESKTOP_SELECTIONS: Readonly<Record<string, boolean>> = { rumahsakit: true, communityReports: true };
const BASEMAP_LOAD_TIMEOUT_MS = 12000;

const FALLBACK_MAP_STYLE = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'fallback-background',
      type: 'background',
      paint: { 'background-color': '#f0eee7' },
    },
  ],
} as const;

const BASEMAP_STYLES: Record<BasemapId, { label: string; style: string }> = {
  streets: {
    label: 'Streets',
    style: `https://api.maptiler.com/maps/streets-v4/style.json?key=${MAPTILER_KEY}`,
  },
  light: {
    label: 'Light',
    style: `https://api.maptiler.com/maps/basic-v2-light/style.json?key=${MAPTILER_KEY}`,
  },
  satellite: {
    label: 'Satellite',
    style: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`,
  },
};

function cloneStyle(style: unknown) {
  if (typeof structuredClone === 'function') return structuredClone(style);
  return JSON.parse(JSON.stringify(style));
}

const LAYER_LABELS: Record<LayerId, string> = {
  rumahsakit: 'Rumah Sakit',
  puskesmas: 'Puskesmas',
  klinik: 'Klinik',
  apotek: 'Apotek',
  homecare: 'HomeCare Lansia',
  population: 'Kepadatan Penduduk',
  children: 'Sebaran Balita',
  lansia: 'Sebaran Lansia',
  disabilitas: 'Sebaran Disabilitas',
  tps: 'TPS',
  communityReports: 'Laporan Warga',
  PendudukBanjarmasin: 'Penduduk Banjarmasin',
};

const LAYER_COLORS: Record<LayerId, string> = {
  rumahsakit: '#3498DB',
  puskesmas: '#8FA28A',
  klinik: '#C8A96B',
  apotek: '#687365',
  homecare: '#B08A3E',
  population: '#7A6F60',
  children: '#DB2777',
  lansia: '#C2410C',
  disabilitas: '#7E22CE',
  tps: '#8A8177',
  communityReports: '#8FA28A',
  PendudukBanjarmasin: '#16A34A',
};

const FILL_LAYER_LEGENDS: Partial<Record<LayerId, { title: string; min: string; max: string; colors: string[] }>> = {
  population: {
    title: 'Kepadatan Penduduk',
    min: 'Rendah',
    max: 'Tinggi',
    colors: ['#F7F3EA', '#E7DED1', '#B8AA96', '#7A6F60', '#464039'],
  },
  children: {
    title: 'Sebaran Balita',
    min: 'Sedikit',
    max: 'Banyak',
    colors: ['#FFF1F5', '#FBCFE8', '#F472B6', '#DB2777', '#9D174D'],
  },
  lansia: {
    title: 'Sebaran Lansia',
    min: 'Rendah',
    max: 'Tinggi',
    colors: ['#FFF7ED', '#FFEDD5', '#FDBA74', '#d6792eff', '#c94803ff'],
  },
  disabilitas: {
    title: 'Sebaran Disabilitas',
    min: 'Sedikit',
    max: 'Banyak',
    colors: ['#f2e8f5ff', '#dfc8e6ff', '#be81c7ff', '#a34cafff', '#712e7dff'],
  },
  PendudukBanjarmasin: {
    title: 'Penduduk Banjarmasin',
    min: 'Lebih sedikit',
    max: 'Lebih banyak',
    colors: ['#DCFCE7', '#86EFAC', '#22C55E', '#15803D'],
  },
};

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

function formatDisplayValue(value: unknown, format?: 'number' | 'text'): string {
  if (format === 'number') return formatNumber(value);
  const str = value === null || value === undefined ? '' : String(value).trim();
  return str || '-';
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

const iconImageCache = new Map<string, Promise<ImageBitmap | HTMLCanvasElement | HTMLImageElement>>();
let cachedReportIcon: ImageData | null = null;
let cachedReportPhotoIcon: ImageData | null = null;

function normalizeSpriteSource(image: ImageBitmap | HTMLCanvasElement | HTMLImageElement): ImageBitmap | HTMLImageElement | ImageData {
  if (image instanceof HTMLCanvasElement) {
    const ctx = image.getContext('2d');
    if (!ctx) throw new Error('Tidak bisa membaca canvas untuk ikon peta');
    return ctx.getImageData(0, 0, image.width, image.height);
  }
  return image;
}

async function loadIconImage(
  url: string,
  maxDimension = 1024
): Promise<ImageBitmap | HTMLCanvasElement | HTMLImageElement> {
  const cacheKey = `${url}_${maxDimension}`;
  const existing = iconImageCache.get(cacheKey);
  if (existing) return existing;

  const promise = (async () => {
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
        console.info('[Map] createImageBitmap fallback ke HTMLImageElement untuk', url, err);
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
  })();

  iconImageCache.set(cacheKey, promise);
  promise.catch(() => {
    iconImageCache.delete(cacheKey);
  });
  return promise;
}

function createCommunityReportIcon(hasPhoto: boolean): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 112;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Tidak bisa membuat ikon laporan warga');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const baseColor = hasPhoto ? '#8FA28A' : '#596458';
  const accentColor = hasPhoto ? '#C8A96B' : '#DFE4DA';

  ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 7;

  ctx.beginPath();
  ctx.moveTo(48, 102);
  ctx.bezierCurveTo(43, 88, 22, 76, 19, 47);
  ctx.bezierCurveTo(16, 20, 31, 8, 48, 8);
  ctx.bezierCurveTo(65, 8, 80, 20, 77, 47);
  ctx.bezierCurveTo(74, 76, 53, 88, 48, 102);
  ctx.closePath();
  ctx.fillStyle = baseColor;
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.88)';
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(28, 22, 40, 34, 10);
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.fill();

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = baseColor;
  ctx.fillStyle = baseColor;
  ctx.lineWidth = 3;

  if (hasPhoto) {
    ctx.beginPath();
    ctx.roundRect(36, 31, 24, 17, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(38, 47);
    ctx.lineTo(45, 40);
    ctx.lineTo(50, 45);
    ctx.lineTo(54, 41);
    ctx.lineTo(59, 47);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(55, 35, 2.4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(36, 32);
    ctx.lineTo(59, 32);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(36, 40);
    ctx.lineTo(52, 40);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(36, 48);
    ctx.lineTo(44, 48);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(48, 66, 5, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.fill();

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function normalizeToFC(raw: any): GeoJSON.FeatureCollection {
  if (raw && raw.type === 'FeatureCollection' && Array.isArray(raw.features)) return raw;
  if (raw && raw.type === 'Feature' && raw.geometry) return { type: 'FeatureCollection', features: [raw] };
  if (Array.isArray(raw) && raw.length && raw[0]?.type === 'Feature') return { type: 'FeatureCollection', features: raw };
  return { type: 'FeatureCollection', features: [] };
}

function collectCoordinatePairs(input: any, points: LngLatTuple[] = []): LngLatTuple[] {
  if (!Array.isArray(input)) return points;
  if (
    input.length >= 2 &&
    typeof input[0] === 'number' &&
    typeof input[1] === 'number' &&
    Number.isFinite(input[0]) &&
    Number.isFinite(input[1])
  ) {
    points.push([input[0], input[1]]);
    return points;
  }
  input.forEach((item) => collectCoordinatePairs(item, points));
  return points;
}

function getFeatureCenter(feature: GeoJSON.Feature): LngLatTuple | null {
  if (!feature.geometry) return null;
  const points = collectCoordinatePairs((feature.geometry as any).coordinates);
  if (!points.length) return null;
  if (points.length === 1) return points[0];

  const bounds = points.reduce(
    (acc, [lng, lat]) => ({
      minLng: Math.min(acc.minLng, lng),
      minLat: Math.min(acc.minLat, lat),
      maxLng: Math.max(acc.maxLng, lng),
      maxLat: Math.max(acc.maxLat, lat),
    }),
    { minLng: Infinity, minLat: Infinity, maxLng: -Infinity, maxLat: -Infinity }
  );

  if (!Number.isFinite(bounds.minLng)) return null;
  return [(bounds.minLng + bounds.maxLng) / 2, (bounds.minLat + bounds.maxLat) / 2];
}

function createLayerDetail(layerId: LayerId, props: any, coordinates?: LngLatTuple | null): DetailInfo {
  if (layerId === 'communityReports') {
    return {
      layerId,
      title: props.hasPhoto ? 'Laporan warga dengan foto' : 'Laporan warga',
      category: LAYER_LABELS[layerId],
      coordinates,
      rows: [
        { label: 'Keterangan', value: props.description, format: 'text' },
        { label: 'Status', value: props.status, format: 'text' },
        { label: 'Komentar', value: props.commentsCount, format: 'number' },
        { label: 'Waktu', value: props.createdAt ? new Date(props.createdAt).toLocaleString('id-ID') : '', format: 'text' },
      ],
    };
  }

  if (layerId === 'tps') {
    return {
      layerId,
      title: formatDisplayValue(props.tps ?? 'Tempat Pembuangan Sementara'),
      category: LAYER_LABELS[layerId],
      coordinates,
      rows: [
        { label: 'Keterangan', value: props.keterangan, format: 'text' },
        { label: 'Sumber', value: props.sumber, format: 'text' },
      ],
    };
  }

  if (layerId === 'population') {
    return {
      layerId,
      title: formatDisplayValue(props.namobj ?? 'Kepadatan Penduduk'),
      category: LAYER_LABELS[layerId],
      coordinates,
      rows: [
        { label: 'Kecamatan', value: props.wadmkc, format: 'text' },
        { label: 'Kelurahan', value: props.wadmkd, format: 'text' },
        { label: 'Penduduk', value: props.jlhpendudu, format: 'number' },
        { label: 'Kepadatan (jiwa/km2)', value: props.kepadatan, format: 'number' },
        { label: 'Luas (km2)', value: props.luaswh, format: 'number' },
      ],
    };
  }

  if (layerId === 'PendudukBanjarmasin') {
    return {
      layerId,
      title: formatDisplayValue(props.NAMOBJ ?? 'Penduduk Banjarmasin'),
      category: LAYER_LABELS[layerId],
      coordinates,
      rows: [
        { label: 'Kecamatan', value: props.NAMOBJ, format: 'text' },
        { label: 'Kota/Kabupaten', value: props.WADMKK, format: 'text' },
        { label: 'Provinsi', value: props.WADMPR, format: 'text' },
        { label: 'Penduduk', value: props.Penduduk, format: 'number' },
      ],
    };
  }

  if (layerId === 'children') {
    const total = ['00__04', '05__09', '10__14'].reduce((acc, key) => acc + (Number(props[key]) || 0), 0);
    return {
      layerId,
      title: formatDisplayValue(props.namobj ?? 'Sebaran Penduduk'),
      category: LAYER_LABELS[layerId],
      coordinates,
      rows: [
        { label: 'Kecamatan', value: props.wadmkc, format: 'text' },
        { label: 'Balita (0-4)', value: props['00__04'], format: 'number' },
        { label: 'Anak (5-9)', value: props['05__09'], format: 'number' },
        { label: 'Remaja (10-14)', value: props['10__14'], format: 'number' },
        { label: 'Total 0-14 Tahun', value: total, format: 'number' },
      ],
    };
  }

  if (layerId === 'lansia') {
    const lansia = ['60__64', '65__69', '70__74', '>75'].reduce((acc, key) => acc + (Number(props[key]) || 0), 0);
    const total = [
      '00__04', '05__09', '10__14', '15__19', '20__24', '25__29', '30__34', '35__39',
      '40__44', '45__49', '50__54', '55__59', '60__64', '65__69', '70__74', '>75',
    ].reduce((acc, key) => acc + (Number(props[key]) || 0), 0);
    const ratio = total ? ((lansia / total) * 100).toFixed(1) : '0';
    return {
      layerId,
      title: formatDisplayValue(props.namobj ?? 'Sebaran Lansia'),
      category: LAYER_LABELS[layerId],
      coordinates,
      rows: [
        { label: 'Kecamatan', value: props.wadmkc, format: 'text' },
        { label: 'Total Penduduk', value: total, format: 'number' },
        { label: 'Total Lansia (>=60)', value: lansia, format: 'number' },
        { label: 'Proporsi Lansia', value: `${ratio}%`, format: 'text' },
      ],
    };
  }

  if (layerId === 'disabilitas') {
    const total = ['dsb_fisik', 'dsb_netra', 'dsb_rungu', 'dsb_mental', 'dsb_lainny', 'dsb_fismen']
      .reduce((acc, key) => acc + (Number(props[key]) || 0), 0);
    return {
      layerId,
      title: formatDisplayValue(props.namobj ?? 'Sebaran Disabilitas'),
      category: LAYER_LABELS[layerId],
      coordinates,
      rows: [
        { label: 'Kecamatan', value: props.wadmkc, format: 'text' },
        { label: 'Fisik', value: props.dsb_fisik, format: 'number' },
        { label: 'Netra', value: props.dsb_netra, format: 'number' },
        { label: 'Rungu/Wicara', value: props.dsb_rungu, format: 'number' },
        { label: 'Mental', value: props.dsb_mental, format: 'number' },
        { label: 'Lainnya', value: props.dsb_lainny, format: 'number' },
        { label: 'Fisik & Mental', value: props.dsb_fismen, format: 'number' },
        { label: 'Total', value: total, format: 'number' },
      ],
    };
  }

  return {
    layerId,
    title: formatDisplayValue(props.namobj ?? props.nama ?? LAYER_LABELS[layerId]),
    category: LAYER_LABELS[layerId],
    coordinates,
    rows: [
      { label: 'Alamat', value: props.rsalamat ?? props.kalamat ?? props.pkmlmt ?? props.almaptk, format: 'text' },
      { label: 'Status', value: props.status, format: 'text' },
      { label: 'Kelas', value: props.kelas, format: 'text' },
      { label: 'Penanggung jawab', value: props.pnjwb ?? props.apjaptk ?? props.pemilik, format: 'text' },
      { label: 'Jumlah kasur', value: props.jumtt, format: 'number' },
      { label: 'SIA/Izin', value: props.nosia ?? props.izin, format: 'text' },
    ],
  };
}

interface MapSectionProps {
  sectionId?: string | null;
}

/* ======================================================================================
   3) KOMPONEN MAP
   ====================================================================================== */
export function MapSection({ sectionId = 'peta' }: MapSectionProps = {}) {
  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prefersReducedMotion, setPRM] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [mapError, setMapError] = useState('');
  const [activeSelections, setActiveSelections] = useState<Record<string, boolean>>(
    () => ({ ...DEFAULT_DESKTOP_SELECTIONS })
  );
  const [layerErrors, setLayerErrors] = useState<Record<string, string>>({});
  const [selectedDetail, setSelectedDetail] = useState<DetailInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('semua');
  const [userLocation, setUserLocation] = useState<LngLatTuple | null>(null);
  const [searchIndexReady, setSearchIndexReady] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [nearestLoading, setNearestLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [layerFeatureCounts, setLayerFeatureCounts] = useState<Record<string, number>>({});
  const focusMode = false;
  const [basemapId, setBasemapId] = useState<BasemapId>(DEFAULT_BASEMAP);
  const [basemapLoading, setBasemapLoading] = useState(false);

  // Map refs & cache
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapCardRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<MLMap | null>(null);
  const isMobileRef = useRef(false);
  const activeSelectionsRef = useRef<Record<string, boolean>>({ ...DEFAULT_DESKTOP_SELECTIONS });
  const searchIndexRef = useRef<SearchItem[]>([]);
  const searchIndexPromiseRef = useRef<Promise<SearchItem[]> | null>(null);
  const userLocationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const dataCache = useRef<Record<string, GeoJSON.FeatureCollection | null>>({});
  const basemapStyleCache = useRef<Partial<Record<BasemapId, unknown>>>({});
  const basemapRequestRef = useRef(0);
  const interactionCleanups = useRef<(() => void)[]>([]);

  const fetchBasemapStyle = useCallback(async (id: BasemapId, signal?: AbortSignal) => {
    const cached = basemapStyleCache.current[id];
    if (cached) return cloneStyle(cached);

    const response = await fetch(BASEMAP_STYLES[id].style, { signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const style = await response.json();
    basemapStyleCache.current[id] = style;
    return cloneStyle(style);
  }, []);

  const applyBasemapStyle = useCallback((map: MLMap, style: unknown) => (
    new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        map.off('style.load', onStyleLoad);
        if (error) reject(error);
        else resolve();
      };

      const onStyleLoad = () => finish();

      const timeoutId = window.setTimeout(() => {
        finish(new Error('Basemap terlalu lama dimuat'));
      }, BASEMAP_LOAD_TIMEOUT_MS);

      map.once('style.load', onStyleLoad);
      try {
        map.setStyle(style as any, { diff: false } as any);
      } catch (error) {
        finish(error instanceof Error ? error : new Error('Basemap gagal diterapkan'));
      }
    })
  ), []);

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
    const isSymbol = 'render' in cfg && cfg.render === 'symbol';

    if (!map.getSource(srcId)) {
      map.addSource(srcId, {
        type: 'geojson',
        ...(isSymbol ? { cluster: true, clusterMaxZoom: 13, clusterRadius: 48 } : {}),
        data: data || { type: 'FeatureCollection', features: [] },
      });
    } else if (data) {
      (map.getSource(srcId) as maplibregl.GeoJSONSource).setData(data);
    }

    if (!map.getLayer(layerName)) {
      if (isSymbol) {
        const clusterCircleLayer = `${layerId}-cluster-circle`;
        const clusterCountLayer = `${layerId}-cluster-count`;
        const clusterColor = LAYER_COLORS[layerId];

        if (!map.getLayer(clusterCircleLayer)) {
          map.addLayer({
            id: clusterCircleLayer,
            type: 'circle',
            source: srcId,
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': clusterColor,
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                18,
                10,
                23,
                25,
                28,
              ],
              'circle-opacity': 0.88,
              'circle-stroke-color': '#FFFFFF',
              'circle-stroke-width': 2,
            },
            layout: { visibility: 'none' },
          } as any);
        }

        if (!map.getLayer(clusterCountLayer)) {
          map.addLayer({
            id: clusterCountLayer,
            type: 'symbol',
            source: srcId,
            filter: ['has', 'point_count'],
            layout: {
              'text-field': ['get', 'point_count_abbreviated'],
              'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
              'text-size': 12,
              visibility: 'none',
            },
            paint: {
              'text-color': '#FFFFFF',
            },
          } as any);
        }

        const symbolLayer: any = {
          id: layerName,
          type: 'symbol',
          source: srcId,
          filter: ['!', ['has', 'point_count']],
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

        const lineLayerName = `${layerId}-line`;
        if (cfg.line && !map.getLayer(lineLayerName)) {
          map.addLayer({
            id: lineLayerName,
            type: 'line',
            source: srcId,
            paint: cfg.line,
            layout: { visibility: 'none' },
            minzoom: cfg.minzoom,
            maxzoom: cfg.maxzoom,
          } as any);
        }
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
    [`${layerId}-layer`, `${layerId}-line`, `${layerId}-cluster-circle`, `${layerId}-cluster-count`].forEach((name) => {
      if (!map.getLayer(name)) return;
      map.setLayoutProperty(name, 'visibility', visible ? 'visible' : 'none');
    });
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

  const fetchLayerData = useCallback(async (layerId: LayerId): Promise<GeoJSON.FeatureCollection | null> => {
    if (layerId === 'communityReports') {
      const reports = await loadCommunityReports();
      const fc = reportsToFeatureCollection(reports);
      setLayerFeatureCounts((prev) => ({ ...prev, [layerId]: fc.features.length }));
      return fc;
    }

    const { url } = LAYER_CONFIG[layerId] as { url: string };
    if (dataCache.current[url]) return dataCache.current[url];

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[Map] Gagal fetch ${url}: HTTP ${res.status}`);
        setLayerErrors((prev) => ({
          ...prev,
          [layerId]: `${LAYER_LABELS[layerId]} gagal dimuat (HTTP ${res.status})`,
        }));
        return null;
      }

      const raw = await res.json();
      const fc = normalizeToFC(raw);
      console.info(`[Map] ${layerId}: loaded GeoJSON features = ${fc.features.length}`);
      dataCache.current[url] = fc;
      setLayerFeatureCounts((prev) => ({ ...prev, [layerId]: fc.features.length }));
      return fc;
    } catch (err) {
      console.warn(`[Map] Error fetch ${url}:`, err);
      setLayerErrors((prev) => ({
        ...prev,
        [layerId]: `${LAYER_LABELS[layerId]} gagal dimuat`,
      }));
      return null;
    }
  }, []);

  /* --------------------------- load & show layer --------------------------- */
  const loadAndShowLayer = useCallback(
    async (layerId: LayerId, fit = false) => {
      const map = mapInstance.current!;
      const { minzoom } = LAYER_CONFIG[layerId];
      setLayerErrors((prev) => {
        if (!prev[layerId]) return prev;
        const next = { ...prev };
        delete next[layerId];
        return next;
      });

      ensureSourceAndLayer(layerId);
      setLayerVisibility(layerId, true);

      const z = map.getZoom();
      if (typeof minzoom === 'number' && z < minzoom) {
        console.info(`[Map] Layer "${layerId}" aktif, tapi zoom (${z.toFixed(1)}) < minzoom (${minzoom}). Zoom in untuk melihat data.`);
      }

      const fc = await fetchLayerData(layerId);
      const src = map.getSource(`${layerId}-src`) as maplibregl.GeoJSONSource | undefined;
      if (fc) {
        if (src) {
          src.setData(fc);
        }
        if (fit && fc.features.length) fitFC(fc);
      } else {
        console.warn(`[Map] ${layerId}: no data in cache after fetch`);
        setLayerErrors((prev) => ({
          ...prev,
          [layerId]: prev[layerId] ?? `${LAYER_LABELS[layerId]} belum tersedia`,
        }));
      }
    },
    [ensureSourceAndLayer, fetchLayerData, fitFC, setLayerVisibility]
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

  const registerClickPopup = useCallback((layerId: LayerId, _getContent: (feature: maplibregl.MapGeoJSONFeature) => string | null) => {
    const map = mapInstance.current;
    if (!map) return;
    const layerName = `${layerId}-layer`;
    if (!map.getLayer(layerName)) return;

    const onClick = (event: maplibregl.MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const center = getFeatureCenter(feature as GeoJSON.Feature) ?? [event.lngLat.lng, event.lngLat.lat];
      setSelectedDetail(createLayerDetail(layerId, feature.properties || {}, center));
    };

    map.on('click', layerName, onClick);
    interactionCleanups.current.push(() => {
      map.off('click', layerName, onClick);
    });
  }, []);

  const registerClusterInteractions = useCallback((layerId: LayerId) => {
    const map = mapInstance.current;
    if (!map) return;
    const clusterCircleLayer = `${layerId}-cluster-circle`;
    if (!map.getLayer(clusterCircleLayer)) return;

    const onClick = async (event: maplibregl.MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      const clusterId = feature?.properties?.cluster_id;
      const coordinates = (feature?.geometry as any)?.coordinates as LngLatTuple | undefined;
      if (clusterId === undefined || !coordinates) return;

      const source = map.getSource(`${layerId}-src`) as any;
      if (!source?.getClusterExpansionZoom) return;

      try {
        const zoom = await new Promise<number>((resolve, reject) => {
          source.getClusterExpansionZoom(clusterId, (err: unknown, nextZoom: number) => {
            if (err) reject(err);
            else resolve(nextZoom);
          });
        });
        map.easeTo({
          center: coordinates,
          zoom,
          duration: prefersReducedMotion ? 0 : 350,
        });
      } catch (err) {
        console.warn(`[Map] Gagal membuka cluster ${layerId}:`, err);
      }
    };

    const onEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const onLeave = () => {
      if (map.getCanvas().style.cursor === 'pointer') map.getCanvas().style.cursor = '';
    };

    map.on('click', clusterCircleLayer, onClick);
    map.on('mouseenter', clusterCircleLayer, onEnter);
    map.on('mouseleave', clusterCircleLayer, onLeave);

    interactionCleanups.current.push(() => {
      map.off('click', clusterCircleLayer, onClick);
      map.off('mouseenter', clusterCircleLayer, onEnter);
      map.off('mouseleave', clusterCircleLayer, onLeave);
    });
  }, [prefersReducedMotion]);

  const registerAllInteractions = useCallback(() => {
    const map = mapInstance.current;
    if (!map) return;

    teardownInteractions();

    const allowHover = (() => {
      if (typeof window === 'undefined') return true;
      if (isMobileRef.current) return false;
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
    (Object.entries(LAYER_CONFIG) as [LayerId, any][])
      .filter(([, cfg]) => cfg.render === 'symbol')
      .forEach(([layerId]) => registerClusterInteractions(layerId));

    if (allowHover) {
      registerHoverPopup('communityReports', (feature) => {
        const props = feature.properties || {};
        return buildPopupHTML(props.hasPhoto ? 'Laporan warga dengan foto' : 'Laporan warga', [
          { label: 'Keterangan', value: props.description, format: 'text' },
          { label: 'Komentar', value: props.commentsCount, format: 'number' },
        ]);
      });
    }

    const reportLayerName = 'communityReports-layer';
    if (map.getLayer(reportLayerName)) {
      const onReportClick = (event: maplibregl.MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const props = feature.properties || {};
        const center = getFeatureCenter(feature as GeoJSON.Feature) ?? [event.lngLat.lng, event.lngLat.lat];

        if (props.hasPhoto && props.id) {
          window.location.hash = `/laporan/${encodeURIComponent(String(props.id))}`;
          return;
        }

        setSelectedDetail(createLayerDetail('communityReports', props, center));
      };

      map.on('click', reportLayerName, onReportClick);
      interactionCleanups.current.push(() => {
        map.off('click', reportLayerName, onReportClick);
      });
    }

    if (allowHover) {
      registerHoverPopup('tps', (feature) => {
        const props = feature.properties || {};
        return buildPopupHTML(props.tps ?? 'TPS', [
          { label: 'Keterangan', value: props.keterangan, format: 'text' },
          { label: 'Sumber', value: props.sumber, format: 'text' },
        ]);
      });
    }
    registerClickPopup('tps', (feature) => {
      const props = feature.properties || {};
      return buildPopupHTML(props.tps ?? 'Tempat Pembuangan Sementara', [
        { label: 'Keterangan', value: props.keterangan, format: 'text' },
        { label: 'Sumber', value: props.sumber, format: 'text' },
      ]);
    });

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

    if (allowHover) {
      registerHoverPopup('PendudukBanjarmasin', (feature) => {
        const props = feature.properties || {};
        return buildPopupHTML(props.NAMOBJ ?? 'Penduduk Banjarmasin', [
          { label: 'Kecamatan', value: props.NAMOBJ, format: 'text' },
          { label: 'Penduduk', value: props.Penduduk, format: 'number' },
        ]);
      });
    }
    registerClickPopup('PendudukBanjarmasin', (feature) => {
      const props = feature.properties || {};
      return buildPopupHTML(props.NAMOBJ ?? 'Penduduk Banjarmasin', [
        { label: 'Kecamatan', value: props.NAMOBJ, format: 'text' },
        { label: 'Kota/Kabupaten', value: props.WADMKK, format: 'text' },
        { label: 'Provinsi', value: props.WADMPR, format: 'text' },
        { label: 'Penduduk', value: props.Penduduk, format: 'number' },
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

    const sumLansia = (props: any) =>
      ['60__64', '65__69', '70__74', '>75'].reduce((acc, key) => acc + (Number(props[key]) || 0), 0);

    const sumPopulationByAge = (props: any) =>
      [
        '00__04', '05__09', '10__14', '15__19', '20__24', '25__29', '30__34', '35__39',
        '40__44', '45__49', '50__54', '55__59', '60__64', '65__69', '70__74', '>75',
      ].reduce((acc, key) => acc + (Number(props[key]) || 0), 0);

    if (allowHover) {
      registerHoverPopup('lansia', (feature) => {
        const props = feature.properties || {};
        return buildPopupHTML(props.namobj ?? 'Sebaran Lansia', [
          { label: 'Kecamatan', value: props.wadmkc, format: 'text' },
          { label: 'Total Lansia (>=60)', value: sumLansia(props), format: 'number' },
        ]);
      });
    }
    registerClickPopup('lansia', (feature) => {
      const props = feature.properties || {};
      const lansia = sumLansia(props);
      const total = sumPopulationByAge(props);
      const ratio = total ? ((lansia / total) * 100).toFixed(1) : '0';

      return buildPopupHTML(props.namobj ?? 'Sebaran Lansia', [
        { label: 'Kecamatan', value: props.wadmkc, format: 'text' },
        { label: 'Total Penduduk', value: total, format: 'number' },
        { label: 'Total Lansia (>=60)', value: lansia, format: 'number' },
        { label: 'Proporsi Lansia', value: `${ratio}%`, format: 'text' },
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
  }, [registerClickPopup, registerClusterInteractions, registerHoverPopup, teardownInteractions]);

  /* --------------------------- responsif & PRM --------------------------- */
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPRM(mql.matches);
    const onPRM = (e: MediaQueryListEvent) => setPRM(e.matches);
    mql.addEventListener?.('change', onPRM);

    const checkMobile = () => {
      const nextIsMobile = window.innerWidth < 1024;
      isMobileRef.current = nextIsMobile;
      setIsMobile((prev) => (prev === nextIsMobile ? prev : nextIsMobile));
    };
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

  useEffect(() => {
    isMobileRef.current = isMobile;
    if (mapLoaded) registerAllInteractions();
  }, [isMobile, mapLoaded, registerAllInteractions]);

  useEffect(() => {
    activeSelectionsRef.current = activeSelections;
  }, [activeSelections]);

  useEffect(() => {
    const controller = new AbortController();
    const preloadBasemaps = () => {
      (Object.keys(BASEMAP_STYLES) as BasemapId[])
        .filter((id) => id !== DEFAULT_BASEMAP)
        .forEach((id) => {
          void fetchBasemapStyle(id, controller.signal).catch((error) => {
            if (controller.signal.aborted) return;
            console.info(`[Map] Basemap ${id} belum bisa dipreload:`, error);
          });
        });
    };

    const requestIdle = (window as any).requestIdleCallback as
      | ((callback: () => void, options?: { timeout?: number }) => number)
      | undefined;
    const cancelIdle = (window as any).cancelIdleCallback as ((id: number) => void) | undefined;
    const idleId = requestIdle
      ? requestIdle(preloadBasemaps, { timeout: 3000 })
      : window.setTimeout(preloadBasemaps, 1500);

    return () => {
      controller.abort();
      if (requestIdle && cancelIdle) cancelIdle(idleId);
      else window.clearTimeout(idleId);
    };
  }, [fetchBasemapStyle]);

  useEffect(() => {
    return subscribeToCommunityReports((reports) => {
      const fc = reportsToFeatureCollection(reports);
      setLayerFeatureCounts((prev) => ({ ...prev, communityReports: fc.features.length }));

      const map = mapInstance.current;
      const source = map?.getSource('communityReports-src') as maplibregl.GeoJSONSource | undefined;
      source?.setData(fc);

      if (activeSelectionsRef.current.communityReports && mapLoaded) {
        setLayerVisibility('communityReports', true);
      }
    });
  }, [mapLoaded, setLayerVisibility]);

  /* --------------------------- fullscreen --------------------------- */
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc: any = document;
      const fullscreenElement = document.fullscreenElement || doc.webkitFullscreenElement || null;
      const target = mapCardRef.current;
      const active = Boolean(target && fullscreenElement === target);

      setIsFullscreen(active);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange as any);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange as any);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? 'hidden' : 'unset';
    if (isFullscreen) setIsFilterOpen(false);

    const resize = () => {
      mapInstance.current?.resize();
    };

    requestAnimationFrame(resize);
    const timers = [50, 150, 300, 500, 800, 1200].map((delay) =>
      window.setTimeout(resize, delay)
    );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        const doc: any = document;
        if (document.fullscreenElement || doc.webkitFullscreenElement) {
          const exit = document.exitFullscreen || doc.webkitExitFullscreen;
          exit?.call(document);
        }
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    const target = mapCardRef.current;
    if (!target) return;

    const doc: any = document;
    const fullscreenElement = document.fullscreenElement || doc.webkitFullscreenElement;

    // Already fullscreen → exit
    if (fullscreenElement === target || isFullscreen) {
      if (fullscreenElement) {
        const exit = document.exitFullscreen || doc.webkitExitFullscreen;
        exit?.call(document);
      }
      setIsFullscreen(false);
      return;
    }

    setIsFilterOpen(false);
    const request = target.requestFullscreen || (target as any).webkitRequestFullscreen;
    if (request) {
      try {
        const result = request.call(target);
        if (result && typeof result.then === 'function') {
          result.catch(() => {
            setIsFullscreen(true);
          });
        }
      } catch {
        setIsFullscreen(true);
      }
    } else {
      setIsFullscreen(true);
    }
  }, [isFullscreen]);

  /* --------------------------- zoom controls --------------------------- */
  const handleZoomIn = useCallback(() => {
    const map = mapInstance.current;
    if (!map) return;
    const next = Math.min(map.getZoom() + 0.5, 18);
    map.easeTo({ zoom: next, duration: 300 });
  }, []);

  const handleZoomOut = useCallback(() => {
    const map = mapInstance.current;
    if (!map) return;
    const next = Math.max(map.getZoom() - 0.5, 3);
    map.easeTo({ zoom: next, duration: 300 });
  }, []);

  const handleResetView = useCallback(() => {
    const map = mapInstance.current;
    if (!map) return;
    map.easeTo({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      duration: prefersReducedMotion ? 0 : 450,
    });
  }, [prefersReducedMotion]);

  const handleLayerToggle = useCallback(
    async (layerId: string, enabled: boolean) => {
      if (!(layerId in LAYER_CONFIG)) return;
      const id = layerId as LayerId;
      const cfg = LAYER_CONFIG[id] as any;

      // Jika layer yang diaktifkan bertipe 'fill' (demografi poligon tematik),
      // nonaktifkan layer fill lainnya untuk mencegah tumpang tindih visual dan menghemat memori WebGL
      if (enabled && cfg.render === 'fill') {
        const otherFillIds = (Object.keys(LAYER_CONFIG) as LayerId[]).filter(
          (key) => LAYER_CONFIG[key].render === 'fill' && key !== id
        );

        setActiveSelections((prev) => {
          const next = { ...prev, [id]: true };
          otherFillIds.forEach((otherId) => {
            next[otherId] = false;
          });
          return next;
        });

        otherFillIds.forEach((otherId) => {
          hideLayer(otherId);
        });

        await loadAndShowLayer(id, Boolean(cfg.fitOnToggle));
      } else {
        setActiveSelections((prev) => ({ ...prev, [id]: enabled }));
        if (enabled) await loadAndShowLayer(id, Boolean(cfg.fitOnToggle));
        else {
          hideLayer(id);
          setSelectedDetail((prev) => (prev?.layerId === id ? null : prev));
        }
      }
    },
    [hideLayer, loadAndShowLayer]
  );

  const toggleLayerFromMap = useCallback((layerId: LayerId) => {
    void handleLayerToggle(layerId, !activeSelections[layerId]);
  }, [activeSelections, handleLayerToggle]);

  const buildSearchIndex = useCallback(async () => {
    if (searchIndexReady) return searchIndexRef.current;
    if (searchIndexPromiseRef.current) return searchIndexPromiseRef.current;

    setSearchLoading(true);
    setLocationError('');

    searchIndexPromiseRef.current = (async () => {
      try {
        const unified = await buildUnifiedSearchIndex();
        searchIndexRef.current = unified;
        setSearchIndexReady(true);
        return unified;
      } finally {
        setSearchLoading(false);
        searchIndexPromiseRef.current = null;
      }
    })();

    return searchIndexPromiseRef.current;
  }, [searchIndexReady]);

  const focusDetailOnMap = useCallback((detail: DetailInfo, zoom = 14.5) => {
    const map = mapInstance.current;
    if (!map || !detail.coordinates) return;
    map.easeTo({
      center: detail.coordinates,
      zoom: Math.max(map.getZoom(), zoom),
      duration: prefersReducedMotion ? 0 : 450,
    });
  }, [prefersReducedMotion]);

  const selectSearchResult = useCallback(
    async (result: SearchResultItem | SearchItem) => {
      if (result.layerId) {
        await handleLayerToggle(result.layerId as LayerId, true);
      }

      if (result.coordinates) {
        const detailRows =
          result.detailRows ||
          (result.subtitle ? [{ label: 'Informasi', value: result.subtitle, format: 'text' as const }] : []);

        const rows =
          typeof result.distanceMeters === 'number'
            ? [
                {
                  label: 'Jarak dari lokasi Anda',
                  value: formatDistanceString(result.distanceMeters),
                  format: 'text' as const,
                },
                ...detailRows.filter((r) => r.label !== 'Jarak dari lokasi Anda'),
              ]
            : detailRows;

        const detail: DetailInfo = {
          id: result.id,
          layerId: (result.layerId as LayerId) || 'rumahsakit',
          title: result.title,
          category: result.categoryLabel,
          badge: result.badge || result.categoryLabel,
          coordinates: result.coordinates,
          rows,
        };

        setSelectedDetail(detail);
        focusDetailOnMap(detail, 15);
      }

      setSearchQuery(result.title);
      setSearchResults([]);
    },
    [focusDetailOnMap, handleLayerToggle]
  );

  // Listen to Global Command Palette (⌘K) search focus
  useEffect(() => {
    const handleGlobalFocus = async (e: Event) => {
      const customEvent = e as CustomEvent<{
        item: SearchItem;
        coordinates?: LngLatTuple;
        layerId?: string;
      }>;
      const detail = customEvent.detail;
      if (!detail || !detail.item) return;

      await selectSearchResult(detail.item);
    };

    window.addEventListener(FOCUS_MAP_ITEM_EVENT, handleGlobalFocus);
    return () => window.removeEventListener(FOCUS_MAP_ITEM_EVENT, handleGlobalFocus);
  }, [selectSearchResult]);

  const addUserLocationMarker = useCallback((coordinates: LngLatTuple) => {
    const map = mapInstance.current;
    if (!map) return;
    userLocationMarkerRef.current?.remove();

    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.style.width = '18px';
    el.style.height = '18px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#10B981';
    el.style.border = '3px solid #FFFFFF';
    el.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.35), 0 2px 6px rgba(0,0,0,0.3)';

    const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(
      '<div style="font-size:12px;font-weight:700;color:#0f172a;padding:2px 4px;">Lokasi Anda</div>'
    );

    userLocationMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat(coordinates)
      .setPopup(popup)
      .addTo(map);
  }, []);

  const handleFindNearest = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('Browser Anda tidak mendukung deteksi lokasi.');
      return;
    }

    setNearestLoading(true);
    setLocationError('');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (err) => {
            if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false,
                timeout: 12000,
                maximumAge: 300000,
              });
            } else {
              reject(err);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 60000,
          }
        );
      });

      const userCoordinates: LngLatTuple = [position.coords.longitude, position.coords.latitude];
      setUserLocation(userCoordinates);
      addUserLocationMarker(userCoordinates);

      const index = await buildSearchIndex();
      const nearest = querySearchIndex(index, '', {
        userLocation: userCoordinates,
        limit: 5,
      });

      if (!nearest.length) {
        setLocationError('Belum ada fasilitas yang bisa dibandingkan.');
        return;
      }

      setSearchResults(nearest);

      const first = nearest[0];
      if (first.layerId) {
        await handleLayerToggle(first.layerId as LayerId, true);
      }

      setSelectedDetail({
        id: first.id,
        layerId: (first.layerId as LayerId) || 'rumahsakit',
        title: first.title,
        category: first.categoryLabel,
        badge: first.badge || first.categoryLabel,
        coordinates: first.coordinates || userCoordinates,
        rows: [
          {
            label: 'Jarak dari lokasi Anda',
            value: formatDistanceString(first.distanceMeters ?? 0),
            format: 'text',
          },
          ...(first.detailRows || []),
        ],
      });

      const map = mapInstance.current;
      if (map && first.coordinates) {
        const distance = first.distanceMeters ?? 0;
        if (distance < 35000) {
          map.fitBounds([userCoordinates, first.coordinates], {
            padding: { top: 90, bottom: 90, left: 80, right: 80 },
            duration: prefersReducedMotion ? 0 : 600,
            maxZoom: 15,
          });
        } else {
          map.easeTo({
            center: first.coordinates,
            zoom: 14.5,
            duration: prefersReducedMotion ? 0 : 600,
          });
        }
      }
    } catch (err: any) {
      const code = err?.code;
      if (code === 1) {
        setLocationError('Izin lokasi ditolak. Aktifkan izin lokasi di browser Anda.');
      } else if (code === 3) {
        setLocationError('Waktu pencarian lokasi habis. Silakan coba lagi.');
      } else {
        setLocationError('Gagal mendeteksi lokasi Anda. Pastikan GPS/layanan lokasi aktif.');
      }
    } finally {
      setNearestLoading(false);
    }
  }, [addUserLocationMarker, buildSearchIndex, handleLayerToggle, prefersReducedMotion]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query && categoryFilter === 'semua') {
      return;
    }

    let cancelled = false;
    void (async () => {
      const index = await buildSearchIndex();
      if (cancelled) return;
      const filtered = querySearchIndex(index, query, {
        categoryFilter,
        userLocation,
        limit: 8,
      });
      setSearchResults(filtered);
    })();

    return () => {
      cancelled = true;
    };
  }, [buildSearchIndex, categoryFilter, searchQuery, userLocation]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!mapLoaded || !map) return;

    const hasActiveFill = (Object.keys(LAYER_CONFIG) as LayerId[]).some(
      (id) => activeSelections[id] && LAYER_CONFIG[id].render === 'fill'
    );

    (Object.entries(LAYER_CONFIG) as [LayerId, any][]).forEach(([layerId, cfg]) => {
      const layerName = `${layerId}-layer`;
      if (!map.getLayer(layerName)) return;

      if (cfg.render === 'symbol') {
        const symbolOpacity = focusMode && hasActiveFill ? 0.38 : 1;
        map.setPaintProperty(layerName, 'icon-opacity', symbolOpacity);
        if (map.getLayer(`${layerId}-cluster-circle`)) {
          map.setPaintProperty(`${layerId}-cluster-circle`, 'circle-opacity', focusMode && hasActiveFill ? 0.32 : 0.88);
        }
        if (map.getLayer(`${layerId}-cluster-count`)) {
          map.setPaintProperty(`${layerId}-cluster-count`, 'text-opacity', symbolOpacity);
        }
      }

      if (cfg.render === 'fill') {
        const baseOpacity = cfg.fill?.['fill-opacity'] ?? 0.55;
        map.setPaintProperty(layerName, 'fill-opacity', focusMode && !activeSelections[layerId] ? 0.18 : baseOpacity);
        if (map.getLayer(`${layerId}-line`) && cfg.line?.['line-opacity'] !== undefined) {
          map.setPaintProperty(`${layerId}-line`, 'line-opacity', cfg.line['line-opacity']);
        }
      }
    });
  }, [activeSelections, focusMode, mapLoaded]);

  const ensureSymbolImages = useCallback(async () => {
    const map = mapInstance.current;
    if (!map) return;

    if (!cachedReportIcon) cachedReportIcon = createCommunityReportIcon(false);
    if (!cachedReportPhotoIcon) cachedReportPhotoIcon = createCommunityReportIcon(true);

    if (!map.hasImage('community-report-icon')) {
      map.addImage('community-report-icon', cachedReportIcon);
    }
    if (!map.hasImage('community-report-photo-icon')) {
      map.addImage('community-report-photo-icon', cachedReportPhotoIcon);
    }

    const symbolLayers = (Object.entries(LAYER_CONFIG) as [LayerId, any][])
      .filter(([, cfg]) => cfg.render === 'symbol');

    await Promise.all(
      symbolLayers.map(async ([layerId, cfg]) => {
        if (!cfg.iconName || !cfg.iconURL || map.hasImage(cfg.iconName)) return;
        try {
          const bitmap = await loadIconImage(cfg.iconURL, cfg.iconBitmapMaxSize ?? 256);
          if (!map.hasImage(cfg.iconName)) {
            map.addImage(cfg.iconName, normalizeSpriteSource(bitmap));
            console.info(`[Map] Ikon ${layerId} berhasil dimuat`);
          }
        } catch (iconErr) {
          console.warn(`[Map] Gagal memuat ikon ${layerId}:`, iconErr);
        }
      })
    );
  }, []);

  const hydrateMapStyle = useCallback(
    async (fitDefaultLayer = false) => {
      const map = mapInstance.current;
      if (!map) return;

      setMapLoaded(true);
      await ensureSymbolImages();
      (Object.keys(LAYER_CONFIG) as LayerId[]).forEach((id) => ensureSourceAndLayer(id));
      registerAllInteractions();

      const activeIds = (Object.keys(LAYER_CONFIG) as LayerId[]).filter((id) => activeSelectionsRef.current[id]);
      for (const id of activeIds) {
        await loadAndShowLayer(id, fitDefaultLayer && id === 'rumahsakit');
      }

      (Object.keys(LAYER_CONFIG) as LayerId[])
        .filter((id) => !activeSelectionsRef.current[id])
        .forEach((id) => setLayerVisibility(id, false));

      window.setTimeout(() => map.resize(), 0);
    },
    [ensureSourceAndLayer, ensureSymbolImages, loadAndShowLayer, registerAllInteractions, setLayerVisibility]
  );

  const handleBasemapChange = useCallback(async (nextBasemapId: BasemapId) => {
    const map = mapInstance.current;
    if (!map || nextBasemapId === basemapId || basemapLoading) return;

    const previousBasemapId = basemapId;
    const previousStyle = cloneStyle(map.getStyle());
    const requestId = basemapRequestRef.current + 1;
    basemapRequestRef.current = requestId;
    setBasemapLoading(true);
    setSelectedDetail(null);
    setLayerErrors((prev) => {
      if (!prev.basemap) return prev;
      const next = { ...prev };
      delete next.basemap;
      return next;
    });

    try {
      const style = await fetchBasemapStyle(nextBasemapId);
      if (basemapRequestRef.current !== requestId) return;

      teardownInteractions();
      setMapLoaded(false);
      setStyleLoaded(false);
      await applyBasemapStyle(map, style);
      if (basemapRequestRef.current !== requestId) return;

      await hydrateMapStyle(false);
      if (basemapRequestRef.current !== requestId) return;

      setBasemapId(nextBasemapId);
    } catch (error) {
      console.warn(`[Map] Gagal mengganti basemap ke ${nextBasemapId}:`, error);
      if (basemapRequestRef.current !== requestId) return;

      setLayerErrors((prev) => ({
        ...prev,
        basemap: `Basemap ${BASEMAP_STYLES[nextBasemapId].label} gagal dimuat. Tetap memakai ${BASEMAP_STYLES[previousBasemapId].label}`,
      }));

      try {
        if (basemapRequestRef.current !== requestId) return;

        teardownInteractions();
        setMapLoaded(false);
        setStyleLoaded(false);
        await applyBasemapStyle(map, previousStyle);
        await hydrateMapStyle(false);
        setBasemapId(previousBasemapId);
      } catch (fallbackError) {
        console.warn(`[Map] Gagal restore basemap ${previousBasemapId}:`, fallbackError);
        setBasemapId(previousBasemapId);
      }
    } finally {
      if (basemapRequestRef.current === requestId) {
        setBasemapLoading(false);
      }
    }
  }, [
    applyBasemapStyle,
    basemapId,
    basemapLoading,
    fetchBasemapStyle,
    hydrateMapStyle,
    teardownInteractions,
  ]);

  /* --------------------------- init map sekali --------------------------- */
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    if (!MAPTILER_KEY) {
      setMapError('Peta belum dikonfigurasi. Tambahkan VITE_MAPTILER_KEY di .env.local.');
      return;
    }

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: BASEMAP_STYLES[DEFAULT_BASEMAP].style,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
      hash: false,
    });
    mapInstance.current = map;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        map.resize();
      }
    });
    resizeObserver.observe(mapRef.current);

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
    let fallbackApplied = false;
    let initialReady = false;

    const onMapReady = async () => {
      if (initialReady) return;
      initialReady = true;
      setStyleLoaded(true);
      setMapLoaded(true);
      try {
        interactionCleanups.current = [];

        if (typeof window !== 'undefined' && import.meta.env.DEV) {
          (window as any).map = map;
          const rect = map.getContainer().getBoundingClientRect();
          console.info('[Map Debug] window.map tersedia di console');
          console.info('[Map Debug] container size:', { width: rect.width, height: rect.height });
          console.info('[Map Debug] isStyleLoaded:', map.isStyleLoaded());
          console.info('[Map Debug] canvas size:', map.getCanvas().width, map.getCanvas().height);
        }

        void hydrateMapStyle(true).catch((error) => {
          console.warn('[Map] Gagal memuat layer peta:', error);
          setLayerErrors((previous) => ({
            ...previous,
            layers: 'Sebagian layer peta gagal dimuat, tetapi basemap tetap tersedia.',
          }));
        });
      } catch (err) {
        console.warn('[Map] Gagal inisialisasi ikon/layer:', err);
      }
    };

    map.on('error', (event) => {
      const message = event.error?.message || 'Basemap gagal dimuat.';
      const isMissingStyleImage = message.includes('could not be loaded') && message.includes('Image');
      if (isMissingStyleImage) {
        console.warn('[Map] Style image tidak tersedia, diabaikan:', message);
        return;
      }
      console.warn('[Map] MapLibre error:', event.error);
      if (!fallbackApplied) {
        fallbackApplied = true;
        setMapError('Basemap utama gagal dimuat. Menampilkan tampilan peta dasar.');
        map.once('style.load', onMapReady);
        map.setStyle(FALLBACK_MAP_STYLE as any, { diff: false } as any);
        return;
      }
      setMapError(`Peta gagal dimuat: ${message}`);
    });

    map.once('load', () => {
      setMapError('');
      void onMapReady();
    });

    return () => {
      initialReady = true;
      resizeObserver.disconnect();
      teardownInteractions();
      userLocationMarkerRef.current?.remove();
      userLocationMarkerRef.current = null;
      map.remove();
      mapInstance.current = null;
      setMapLoaded(false);
      setStyleLoaded(false);
    };
  }, [hydrateMapStyle, teardownInteractions]);

  const activeLayerIds = (Object.keys(LAYER_CONFIG) as LayerId[]).filter((id) => activeSelections[id]);
  const activeFillLayerIds = activeLayerIds.filter((id) => LAYER_CONFIG[id].render === 'fill');
  const layerErrorMessages = Object.values(layerErrors).filter(Boolean);

  /* --------------------------- RENDER --------------------------- */
  return (
    <section id={sectionId ?? undefined} className="relative pt-28 pb-10 sm:pt-28 sm:pb-12 lg:pt-28 lg:pb-20 overflow-hidden">
      <div
        className="absolute inset-0 z-[-1]"
        style={{ backgroundColor: '#faf8f2' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {!isFullscreen && (
          <SectionReveal>
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-brand-mint rounded-full mb-4">
                <span className="text-brand-green text-[14px] font-semibold">Peta Lingkungan</span>
              </div>
              <h2
                className="text-ink-900 tracking-tight mb-4"
                style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700 }}
              >
                Peta Interaktif Lingkungan
              </h2>
              <p className="text-ink-700 max-w-3xl mx-auto text-[18px]">
                Visualisasi Banjarmasin–Banjarbaru Berbasis Data Spasial
              </p>
            </div>
          </SectionReveal>
        )}

        <div className="relative">
          <div className="flex gap-6 lg:gap-8">
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-32 h-[clamp(480px,60vh,760px)] max-h-[calc(100vh-9rem)]">
                  <MapLayerFilter
                    isMobile={false}
                    defaultSelections={activeSelections}
                    onToggle={handleLayerToggle}
                  />
                </div>
              </div>

              <div className="flex-1">
                <motion.div
                  ref={mapCardRef}
                  className={`overflow-hidden bg-white ${
                    isFullscreen
                      ? 'fixed inset-0 z-[9999] h-screen w-screen rounded-none shadow-none'
                      : 'relative rounded-3xl'
                  }`}
                  style={{
                    boxShadow: isFullscreen ? 'none' : '0 6px 24px rgba(0,0,0,0.05)',
                    height: isFullscreen ? '100vh' : 'clamp(480px, 60vh, 760px)',
                    minHeight: isFullscreen ? '100vh' : undefined,
                    width: isFullscreen ? '100vw' : '100%',
                  }}
                  role="region"
                  aria-label="Interactive health map"
                >
                  <div ref={mapRef} className="absolute inset-0 z-10 w-full h-full" />

                  <MapSearchControl
                    query={searchQuery}
                    results={searchResults}
                    categoryFilter={categoryFilter}
                    onCategoryFilterChange={setCategoryFilter}
                    loading={searchLoading}
                    nearestLoading={nearestLoading}
                    error={locationError}
                    onQueryChange={setSearchQuery}
                    onFocus={buildSearchIndex}
                    onSelect={selectSearchResult}
                    onFindNearest={handleFindNearest}
                    onDismissError={() => setLocationError('')}
                  />

                  {!mapError && !styleLoaded && (
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
                            Peta Kesehatan Banjarmasin–Banjarbaru
                          </h3>
                          <p className="text-ink-700 text-[16px]">Integrasi data geospasial kesehatan</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {mapError && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-surface-0/90 px-6 text-center">
                      <div className="max-w-md rounded-2xl border border-surface-200 bg-white p-6 shadow-lg">
                        <AlertTriangle size={28} className="mx-auto text-amber-600" />
                        <h3 className="mt-3 text-lg font-bold text-ink-900">Peta belum tersedia</h3>
                        <p className="mt-2 text-sm leading-6 text-ink-700">{mapError}</p>
                      </div>
                    </div>
                  )}

                  <motion.button
                    onClick={() => setIsFilterOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${isFullscreen ? 'flex' : 'flex lg:hidden'} absolute top-4 left-4 bg-white rounded-full p-3 md:p-3.5 shadow-lg z-20 backdrop-blur-sm items-center justify-center`}
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.95)' }}
                    aria-label="Open filter"
                  >
                    <Filter size={20} className="text-brand-green md:w-[22px] md:h-[22px]" strokeWidth={2.5} />
                  </motion.button>

                  <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2 sm:bottom-5 sm:right-5">
                    <ZoomControl onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
                    <MapControlButton label="Reset tampilan peta" onClick={handleResetView}>
                      <RotateCcw size={18} />
                    </MapControlButton>
                    {!isFullscreen && (
                      <MapControlButton label="Buka layar penuh" onClick={toggleFullscreen}>
                        <Maximize2 size={18} />
                      </MapControlButton>
                    )}
                  </div>

                  {isFullscreen && (
                    <motion.button
                      type="button"
                      onClick={toggleFullscreen}
                      whileTap={{ scale: 0.94 }}
                      className="absolute right-4 top-4 z-[101] flex h-10 w-10 items-center justify-center rounded-lg border border-white/70 bg-white/95 text-ink-700 shadow-md backdrop-blur-sm transition-colors hover:bg-brand-green hover:text-white"
                      aria-label="Keluar dari layar penuh"
                      title="Keluar dari layar penuh"
                    >
                      <X size={18} />
                    </motion.button>
                  )}

                  <BasemapSwitcher
                    active={basemapId}
                    loading={basemapLoading}
                    isFullscreen={isFullscreen}
                    onChange={handleBasemapChange}
                  />

                  {activeFillLayerIds.length > 0 && (
                    <MapLegend
                      layerIds={activeFillLayerIds}
                      counts={layerFeatureCounts}
                      isFullscreen={isFullscreen}
                      onToggle={toggleLayerFromMap}
                    />
                  )}

                  {layerErrorMessages.length > 0 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 max-w-[min(92%,420px)] rounded-xl border border-amber-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
                      <div className="flex items-start gap-2 text-amber-800">
                        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-semibold leading-relaxed">
                          {layerErrorMessages[0]}
                          {layerErrorMessages.length > 1 ? ` dan ${layerErrorMessages.length - 1} layer lain gagal dimuat.` : '.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedDetail && (
                    <MapDetailPanel
                      detail={selectedDetail}
                      onClose={() => setSelectedDetail(null)}
                      onFocus={() => focusDetailOnMap(selectedDetail)}
                    />
                  )}

                </motion.div>
              </div>
            </div>

            <MapLayerFilter
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              isMobile={isMobile || isFullscreen}
              defaultSelections={activeSelections}
              onToggle={async (layerId: string, enabled: boolean) => {
                await handleLayerToggle(layerId, enabled);
                if (isMobile || isFullscreen) setIsFilterOpen(false);
              }}
            />
          </div>
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

function BasemapSwitcher({
  active,
  loading,
  isFullscreen,
  onChange,
}: {
  active: BasemapId;
  loading: boolean;
  isFullscreen: boolean;
  onChange: (id: BasemapId) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`absolute z-30 hidden md:block ${
        isFullscreen ? 'top-4 right-20' : 'top-4 right-4'
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 items-center gap-2 rounded-lg border border-white/70 bg-white/95 px-3 text-sm font-bold text-ink-800 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="Pilih basemap"
      >
        {loading ? <Loader2 size={16} className="animate-spin text-brand-green" /> : <Layers3 size={17} className="text-brand-green" />}
        <span>{BASEMAP_STYLES[active].label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-12 w-44 overflow-hidden rounded-lg border border-surface-200 bg-white p-1.5 shadow-xl"
            role="menu"
          >
            {(Object.entries(BASEMAP_STYLES) as [BasemapId, { label: string; style: string }][]).map(([id, config]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onChange(id);
                  setIsOpen(false);
                }}
                disabled={loading}
                className={`flex h-9 w-full items-center justify-between rounded-md px-3 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${
                  active === id
                    ? 'bg-brand-mint text-brand-green'
                    : 'text-ink-700 hover:bg-surface-100'
                }`}
                role="menuitemradio"
                aria-checked={active === id}
              >
                {config.label}
                {active === id && <span className="h-2 w-2 rounded-full bg-brand-green" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getSearchItemIcon(category: string) {
  switch (category) {
    case 'rumahsakit':
      return { icon: Hospital, color: 'text-blue-600 bg-blue-50 border-blue-100' };
    case 'puskesmas':
      return { icon: Cross, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    case 'klinik':
      return { icon: Building2, color: 'text-amber-600 bg-amber-50 border-amber-100' };
    case 'apotek':
      return { icon: Pill, color: 'text-teal-600 bg-teal-50 border-teal-100' };
    case 'homecare':
      return { icon: Home, color: 'text-yellow-700 bg-yellow-50 border-yellow-100' };
    case 'tps':
      return { icon: Trash2, color: 'text-stone-600 bg-stone-100 border-stone-200' };
    case 'wilayah':
      return { icon: Compass, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
    case 'laporan':
      return { icon: FileText, color: 'text-rose-600 bg-rose-50 border-rose-100' };
    default:
      return { icon: MapPin, color: 'text-brand-green bg-brand-mint/60 border-brand-green/20' };
  }
}

const QUICK_SEARCH_SUGGESTIONS = [
  'RSUD Ulin',
  'RS Ansari Saleh',
  'Puskesmas Cempaka',
  'Apotek Kimia Farma',
  'Banjarmasin Tengah',
  'TPS',
];

function MapSearchControl({
  query,
  results,
  categoryFilter,
  onCategoryFilterChange,
  loading,
  nearestLoading,
  error,
  onQueryChange,
  onFocus,
  onSelect,
  onFindNearest,
  onDismissError,
}: {
  query: string;
  results: SearchResultItem[];
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  loading: boolean;
  nearestLoading: boolean;
  error: string;
  onQueryChange: (value: string) => void;
  onFocus: () => void;
  onSelect: (result: SearchResultItem) => void;
  onFindNearest: () => void;
  onDismissError: () => void;
}) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = focusedIndex >= 0 && results[focusedIndex] ? results[focusedIndex] : results[0];
      if (target) {
        onSelect(target);
        setIsInputFocused(false);
      }
    } else if (e.key === 'Escape') {
      onQueryChange('');
      setFocusedIndex(-1);
      setIsInputFocused(false);
    }
  };

  const categories = [
    { id: 'semua', label: 'Semua' },
    { id: 'faskes', label: 'Faskes' },
    { id: 'rumahsakit', label: 'RS' },
    { id: 'puskesmas', label: 'Puskesmas' },
    { id: 'wilayah', label: 'Wilayah' },
    { id: 'laporan', label: 'Laporan' },
  ];

  return (
    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30 w-[calc(100%-24px)] sm:w-[430px] max-w-[calc(100vw-24px)]">
      <div className="overflow-hidden rounded-2xl border border-surface-200/90 bg-white/95 p-2 shadow-[0_12px_36px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2">
          <div className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-surface-100/90 px-3 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-green/30">
            <Search size={17} className="flex-shrink-0 text-ink-500" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onFocus={() => {
                setIsInputFocused(true);
                onFocus();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Cari faskes, RS, wilayah, laporan..."
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:text-ink-500"
              aria-label="Cari fasilitas kesehatan geospasial"
            />
            {loading && <Loader2 size={16} className="animate-spin text-brand-green flex-shrink-0" />}
            {query && !loading && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="rounded-full p-1 text-ink-500 hover:bg-surface-200 hover:text-ink-900 transition-colors"
                aria-label="Hapus pencarian"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onFindNearest}
            disabled={nearestLoading}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-green text-white shadow-sm transition-transform active:scale-95 disabled:cursor-wait disabled:opacity-70 hover:bg-brand-darkgreen"
            aria-label="Cari fasilitas terdekat dari GPS"
            title="Temukan faskes terdekat dari lokasi GPS Anda"
          >
            {nearestLoading ? <Loader2 size={18} className="animate-spin" /> : <LocateFixed size={18} />}
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 no-scrollbar">
          {categories.map((cat) => {
            const active = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryFilterChange(cat.id)}
                className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                  active
                    ? 'bg-brand-green text-white shadow-xs'
                    : 'bg-surface-100 text-ink-600 hover:bg-surface-200 hover:text-ink-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-800">
            <AlertTriangle size={15} className="mt-0.5 flex-shrink-0 text-amber-600" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={onDismissError}
              className="rounded-full p-0.5 hover:bg-amber-100 transition-colors"
              aria-label="Tutup pesan lokasi"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Quick Suggestions when input is focused and query is empty */}
        {isInputFocused && !query && (
          <div className="mt-2.5 border-t border-surface-200/80 pt-2 px-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-ink-500 mb-1.5">
              <Sparkles size={13} className="text-brand-green" />
              <span>Pencarian Cepat</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SEARCH_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => onQueryChange(sug)}
                  className="rounded-lg bg-surface-100 px-2 py-1 text-[11px] font-medium text-ink-700 hover:bg-brand-mint hover:text-brand-green transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Dropdown */}
        {results.length > 0 && (
          <div className="mt-2.5 max-h-[300px] overflow-y-auto rounded-xl border border-surface-200/80 bg-white shadow-inner divide-y divide-surface-100">
            <div className="flex items-center justify-between px-3 py-1.5 bg-surface-50 text-[11px] font-bold text-ink-500 border-b border-surface-200/60 sticky top-0 z-10">
              <span>Hasil Pencarian ({results.length})</span>
              <span className="text-[10px] font-normal text-ink-400">Gunakan ↑↓ dan Enter</span>
            </div>

            {results.map((result, idx) => {
              const isFocused = idx === focusedIndex;
              const { icon: ItemIcon, color: iconStyle } = getSearchItemIcon(result.category);
              const address =
                result.detailRows?.find((row) => row.label === 'Alamat')?.value || result.subtitle;

              return (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => {
                    onSelect(result);
                    setIsInputFocused(false);
                  }}
                  className={`w-full px-3 py-2.5 text-left transition-colors cursor-pointer flex items-start gap-3 ${
                    isFocused ? 'bg-brand-mint/70 ring-1 ring-inset ring-brand-green/80' : 'hover:bg-surface-50'
                  }`}
                >
                  {/* Category Icon Badge */}
                  <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border text-sm ${iconStyle}`}>
                    <ItemIcon size={16} />
                  </div>

                  {/* Main Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-bold text-ink-900">{result.title}</p>
                      {result.badge && (
                        <span className="rounded-md bg-surface-100 px-1.5 py-0.2 text-[10px] font-semibold text-ink-600 flex-shrink-0">
                          {result.badge}
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 truncate text-xs font-semibold text-brand-green">
                      {result.categoryLabel}
                    </p>

                    {address ? (
                      <p className="mt-0.5 truncate text-xs text-ink-500">{String(address)}</p>
                    ) : null}
                  </div>

                  {/* Distance & Action */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {typeof result.distanceMeters === 'number' && (
                      <span className="rounded-full bg-brand-mint px-2 py-0.5 text-[11px] font-bold text-brand-green">
                        {formatDistanceString(result.distanceMeters)}
                      </span>
                    )}
                    {isFocused && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-brand-green">
                        <span>Pilih</span>
                        <CornerDownLeft size={11} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty Result Notification when query is present but 0 results */}
        {query && results.length === 0 && !loading && (
          <div className="mt-2.5 rounded-xl border border-surface-200/80 bg-surface-50 p-4 text-center">
            <p className="text-xs font-semibold text-ink-700">
              Tidak ada fasilitas yang cocok dengan &ldquo;<span className="font-bold">{query}</span>&rdquo;
            </p>
            <p className="mt-1 text-[11px] text-ink-500">
              Coba gunakan nama umum (cth: RS, Puskesmas, Apotek) atau bersihkan filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MapDetailPanel({
  detail,
  onClose,
  onFocus,
}: {
  detail: DetailInfo;
  onClose: () => void;
  onFocus: () => void;
}) {
  const rows = detail.rows.filter(({ value }) => value !== null && value !== undefined && String(value).trim() !== '');

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="absolute bottom-20 left-4 right-4 z-30 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur-sm md:bottom-6 md:right-auto md:w-[360px]"
      aria-label="Detail lokasi peta"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.08em] text-brand-green">{detail.category}</p>
          <h3 className="text-lg font-bold leading-tight text-ink-900">{detail.title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-surface-100 hover:text-ink-900"
          aria-label="Tutup detail lokasi"
        >
          <X size={17} />
        </button>
      </div>

      <dl className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {rows.length ? rows.map((row) => (
          <div key={`${row.label}-${String(row.value)}`} className="grid grid-cols-[120px_1fr] gap-3 text-sm">
            <dt className="font-semibold text-ink-500">{row.label}</dt>
            <dd className="font-semibold text-ink-900">{formatDisplayValue(row.value, row.format)}</dd>
          </div>
        )) : (
          <p className="text-sm font-semibold text-ink-500">Data detail belum tersedia.</p>
        )}
      </dl>

      {detail.coordinates && (
        <button
          type="button"
          onClick={onFocus}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-green px-4 text-sm font-bold text-white transition-transform active:scale-95"
        >
          <MapPin size={16} />
          Fokuskan di peta
        </button>
      )}
    </motion.aside>
  );
}

function MapControlButton({
  label, onClick, children,
}: { label: string; onClick: () => void; children: React.ReactNode; }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/70 bg-white/95 text-ink-700 shadow-md backdrop-blur-sm transition-colors hover:bg-brand-green hover:text-white"
      aria-label={label}
      title={label}
    >
      {children}
    </motion.button>
  );
}

function ZoomControl({
  onZoomIn,
  onZoomOut,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/70 bg-white/95 shadow-md backdrop-blur-sm">
      <button
        type="button"
        onClick={onZoomIn}
        className="flex h-10 w-10 items-center justify-center text-ink-700 transition-colors hover:bg-brand-green hover:text-white"
        aria-label="Perbesar peta"
        title="Perbesar peta"
      >
        <ZoomIn size={18} />
      </button>
      <div className="mx-2 h-px bg-surface-200" />
      <button
        type="button"
        onClick={onZoomOut}
        className="flex h-10 w-10 items-center justify-center text-ink-700 transition-colors hover:bg-brand-green hover:text-white"
        aria-label="Perkecil peta"
        title="Perkecil peta"
      >
        <ZoomOut size={18} />
      </button>
    </div>
  );
}

function MapLegend({
  layerIds,
  counts,
  isFullscreen,
  onToggle,
}: {
  layerIds: LayerId[];
  counts: Record<string, number>;
  isFullscreen: boolean;
  onToggle: (layerId: LayerId) => void;
}) {
  return (
    <div
      className={`hidden sm:block absolute z-20 w-[240px] rounded-2xl border border-white/70 bg-white/95 p-3 shadow-lg backdrop-blur-sm ${
        isFullscreen ? 'top-16 right-20' : 'top-16 right-4'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-ink-900">Legenda</span>
        <span className="text-[11px] font-semibold text-ink-500">{layerIds.length} layer</span>
      </div>
      <div className="space-y-2">
        {layerIds.map((layerId) => {
          const legend = FILL_LAYER_LEGENDS[layerId];
          if (!legend) return null;
          return (
            <button
              key={layerId}
              type="button"
              onClick={() => onToggle(layerId)}
              className="block w-full rounded-xl p-1 text-left transition-colors hover:bg-surface-100"
              title={`Matikan ${legend.title}`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-[12px] font-semibold text-ink-700">{legend.title}</span>
                <span className="flex-shrink-0 text-[11px] font-bold text-ink-500">{formatNumber(counts[layerId] ?? 0)}</span>
              </div>
              <div
                className="h-2.5 rounded-full"
                style={{ background: `linear-gradient(90deg, ${legend.colors.join(', ')})` }}
              />
              <div className="mt-1 flex justify-between text-[11px] font-medium text-ink-500">
                <span>{legend.min}</span>
                <span>{legend.max}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
