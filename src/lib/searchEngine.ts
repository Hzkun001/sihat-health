// src/lib/searchEngine.ts
import { loadCommunityReports, reportsToFeatureCollection } from './communityReports';

export type SearchCategory =
  | 'faskes'
  | 'rumahsakit'
  | 'puskesmas'
  | 'klinik'
  | 'apotek'
  | 'homecare'
  | 'tps'
  | 'wilayah'
  | 'laporan'
  | 'aksi';

export type LngLatTuple = [number, number];

export const OPEN_COMMAND_EVENT = 'sihat:open-command-palette';
export const FOCUS_MAP_ITEM_EVENT = 'sihat:focus-map-item';

export function openGlobalCommandMenu() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_COMMAND_EVENT));
  }
}

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: SearchCategory;
  categoryLabel: string;
  layerId?: string;
  coordinates?: LngLatTuple | null;
  detailRows?: { label: string; value: unknown; format?: 'number' | 'text' }[];
  searchableText: string;
  actionRoute?: string;
  badge?: string;
  iconType?: string;
  distanceMeters?: number;
}

export interface SearchResultItem extends SearchItem {
  score: number;
}

const RECENT_SEARCHES_KEY = 'sihat-recent-searches-v1';
const MAX_RECENT_SEARCHES = 6;

/**
 * Normalisasi string untuk pencarian (lowercase, hapus tanda baca, trim)
 */
export function normalizeSearchString(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Hitung Levenshtein distance sederhana untuk toleransi salah ketik
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1], prev, row[j]) + 1;
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

/**
 * Algoritma pembobotan relevansi pencarian (0 - 100)
 */
export function calculateMatchScore(query: string, targetText: string, titleText: string): number {
  const normQuery = normalizeSearchString(query);
  const normTarget = normalizeSearchString(targetText);
  const normTitle = normalizeSearchString(titleText);

  if (!normQuery || !normTarget) return 0;

  // 1. Exact match pada judul
  if (normTitle === normQuery) return 100;

  // 2. Prefix match pada judul (misal: "ansari" matches "rsud dr h mochamad ansari saleh")
  if (normTitle.startsWith(normQuery)) return 90;

  // 3. Kata di judul berawalan query
  const titleWords = normTitle.split(' ');
  if (titleWords.some((word) => word.startsWith(normQuery))) return 85;

  // 4. Substring di dalam judul
  if (normTitle.includes(normQuery)) return 75;

  // 5. Query multi-kata: semua kata ada di judul atau target
  const queryTokens = normQuery.split(' ').filter(Boolean);
  const allTokensInTitle = queryTokens.length > 1 && queryTokens.every((token) => normTitle.includes(token));
  if (allTokensInTitle) return 70;

  // 6. Substring di deskripsi/alamat
  if (normTarget.includes(normQuery)) return 55;

  const allTokensInTarget = queryTokens.length > 1 && queryTokens.every((token) => normTarget.includes(token));
  if (allTokensInTarget) return 50;

  // 7. Fuzzy typo tolerance pada kata di judul (untuk kata query >= 4 karakter)
  if (normQuery.length >= 4) {
    for (const word of titleWords) {
      if (Math.abs(word.length - normQuery.length) <= 2) {
        const dist = levenshteinDistance(normQuery, word);
        if (dist <= 1) return 45;
        if (dist <= 2 && normQuery.length >= 5) return 35;
      }
    }
  }

  return 0;
}

/**
 * Hitung jarak 2 koordinat (Haversine formula dalam meter)
 */
export function calculateDistanceMeters(from: LngLatTuple, to: LngLatTuple): number {
  const toRad = (degree: number) => (degree * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(to[1] - from[1]);
  const dLng = toRad(to[0] - from[0]);
  const lat1 = toRad(from[1]);
  const lat2 = toRad(to[1]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Format meter ke string yang mudah dibaca (m / km)
 */
export function formatDistanceString(meters: number): string {
  if (!Number.isFinite(meters)) return '-';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} km`;
}

// -------------------------------------------------------------
// GeoJSON Helper & Parsing
// -------------------------------------------------------------

function extractCoordinatePairs(input: unknown, points: LngLatTuple[] = []): LngLatTuple[] {
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
  input.forEach((item) => extractCoordinatePairs(item, points));
  return points;
}

export function extractFeatureCenter(feature: GeoJSON.Feature): LngLatTuple | null {
  if (!feature.geometry) return null;
  const points = extractCoordinatePairs((feature.geometry as any).coordinates);
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

// -------------------------------------------------------------
// Quick Actions Dataset
// -------------------------------------------------------------

export const STATIC_QUICK_ACTIONS: SearchItem[] = [
  {
    id: 'action-map',
    title: 'Buka Peta Interaktif',
    subtitle: 'Eksplorasi faskes, sebaran balita, lansia & kepadatan',
    category: 'aksi',
    categoryLabel: 'Navigasi',
    actionRoute: '#/peta',
    badge: 'Peta',
    iconType: 'map',
    searchableText: 'buka peta interaktif gis spasial faskes kalsel banjarmasin banjarbaru visualisasi',
  },
  {
    id: 'action-report',
    title: 'Buat Laporan Warga',
    subtitle: 'Laporkan kendala sanitasi, jalan, atau lingkungan',
    category: 'aksi',
    categoryLabel: 'Layanan Warga',
    actionRoute: '#/laporan',
    badge: 'Lapor',
    iconType: 'alert',
    searchableText: 'buat laporan warga kirim aspirasi pengaduan foto aduan sampah genangan',
  },
  {
    id: 'action-stats',
    title: 'Statistik & Insight Kesehatan',
    subtitle: 'Ringkasan data kesehatan masyarakat dan faskes',
    category: 'aksi',
    categoryLabel: 'Data & Insight',
    actionRoute: '#/insight',
    badge: 'Statistik',
    iconType: 'chart',
    searchableText: 'statistik insight data kesehatan balita stunting lansia faskes grafik',
  },
  {
    id: 'action-staff',
    title: 'Portal Petugas SIHAT',
    subtitle: 'Masuk dashboard verifikasi dan tindak lanjut laporan',
    category: 'aksi',
    categoryLabel: 'Administrasi',
    actionRoute: '#/petugas',
    badge: 'Petugas',
    iconType: 'shield',
    searchableText: 'portal petugas admin dashboard login verifikasi tiket operasional staf',
  },
  {
    id: 'action-contact',
    title: 'Kontak & Bantuan Darurat',
    subtitle: 'Nomor ambulans, hotline faskes dan tim SIHAT',
    category: 'aksi',
    categoryLabel: 'Bantuan',
    actionRoute: '#/kontak',
    badge: 'Kontak',
    iconType: 'phone',
    searchableText: 'kontak bantuan darurat hotline ambulans call center telepon email puskesmas rs',
  },
];

// -------------------------------------------------------------
// Unified Search Index Builder
// -------------------------------------------------------------

const dataFetchCache = new Map<string, GeoJSON.FeatureCollection>();
let fullSearchIndexCache: SearchItem[] | null = null;
let indexBuildingPromise: Promise<SearchItem[]> | null = null;

async function fetchGeoJSON(url: string): Promise<GeoJSON.FeatureCollection | null> {
  if (dataFetchCache.has(url)) return dataFetchCache.get(url)!;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const raw = await res.json();
    const fc = raw?.type === 'FeatureCollection' ? raw : { type: 'FeatureCollection', features: raw?.features || [] };
    dataFetchCache.set(url, fc);
    return fc;
  } catch (err) {
    console.warn('[SearchEngine] Gagal memuat', url, err);
    return null;
  }
}

export async function buildUnifiedSearchIndex(): Promise<SearchItem[]> {
  if (fullSearchIndexCache) return fullSearchIndexCache;
  if (indexBuildingPromise) return indexBuildingPromise;

  indexBuildingPromise = (async () => {
    const items: SearchItem[] = [...STATIC_QUICK_ACTIONS];

    const facilityConfigs = [
      { layerId: 'rumahsakit', category: 'rumahsakit' as const, label: 'Rumah Sakit', url: '/datageo/rumahsakit.json' },
      { layerId: 'puskesmas', category: 'puskesmas' as const, label: 'Puskesmas', url: '/datageo/puskesmas.json' },
      { layerId: 'klinik', category: 'klinik' as const, label: 'Klinik', url: '/datageo/klinik.json' },
      { layerId: 'apotek', category: 'apotek' as const, label: 'Apotek', url: '/datageo/apotek.json' },
      { layerId: 'homecare', category: 'homecare' as const, label: 'HomeCare Lansia', url: '/datageo/homecare.json' },
      { layerId: 'tps', category: 'tps' as const, label: 'TPS', url: '/datageo/tps.json' },
    ];

    // 1. Fetch & Index Faskes & TPS
    for (const cfg of facilityConfigs) {
      const fc = await fetchGeoJSON(cfg.url);
      if (!fc) continue;

      fc.features.forEach((feature, idx) => {
        const coords = extractFeatureCenter(feature);
        if (!coords) return;
        const p = feature.properties || {};
        const title = String(p.namobj ?? p.nama ?? p.tps ?? cfg.label);
        const address = p.rsalamat ?? p.kalamat ?? p.pkmlmt ?? p.almaptk ?? p.keterangan ?? '';
        const pnjwb = p.pnjwb ?? p.apjaptk ?? p.pemilik ?? '';
        const status = p.status ?? '';
        const kelas = p.kelas ?? '';

        const detailRows = [
          { label: 'Alamat', value: address, format: 'text' as const },
          { label: 'Penanggung Jawab', value: pnjwb, format: 'text' as const },
          { label: 'Status', value: status, format: 'text' as const },
          { label: 'Kelas', value: kelas, format: 'text' as const },
        ].filter((r) => Boolean(r.value));

        const searchableText = [title, address, pnjwb, cfg.label, status, kelas].join(' ');

        items.push({
          id: `${cfg.layerId}-${p.objectid ?? p.FID ?? idx}`,
          title,
          subtitle: address ? String(address) : cfg.label,
          category: cfg.category,
          categoryLabel: cfg.label,
          layerId: cfg.layerId,
          coordinates: coords,
          detailRows,
          searchableText,
          badge: cfg.label,
        });
      });
    }

    // 2. Fetch & Index Wilayah Administratif Banjarmasin (Kecamatan)
    const bjmFC = await fetchGeoJSON('/datageo/kecamatan_penduduk_banjarmasin.geojson');
    if (bjmFC) {
      bjmFC.features.forEach((feature, idx) => {
        const coords = extractFeatureCenter(feature);
        const p = feature.properties || {};
        const title = `Kecamatan ${String(p.NAMOBJ ?? '')}`.trim();
        const penduduk = p.Penduduk ? Number(p.Penduduk) : undefined;
        const subtitle = penduduk
          ? `${penduduk.toLocaleString('id-ID')} jiwa • Kota Banjarmasin`
          : 'Kota Banjarmasin';

        items.push({
          id: `wilayah-bjm-${idx}`,
          title,
          subtitle,
          category: 'wilayah',
          categoryLabel: 'Wilayah Administratif',
          layerId: 'PendudukBanjarmasin',
          coordinates: coords,
          detailRows: [
            { label: 'Kota', value: 'Kota Banjarmasin' },
            { label: 'Jumlah Penduduk', value: penduduk, format: 'number' },
          ],
          searchableText: `${title} banjarmasin kecamatan penduduk administrasi wilayah`,
          badge: 'Kecamatan',
        });
      });
    }

    // 3. Fetch & Index Kelurahan Banjarbaru (Kepadatan Penduduk)
    const bjbFC = await fetchGeoJSON('/datageo/kepadatan_penduduk.json');
    if (bjbFC) {
      bjbFC.features.forEach((feature, idx) => {
        const coords = extractFeatureCenter(feature);
        const p = feature.properties || {};
        const title = String(p.namobj ?? '');
        const kec = p.wadmkc ? `Kec. ${p.wadmkc}` : '';
        const subtitle = [kec, 'Kota Banjarbaru'].filter(Boolean).join(', ');

        items.push({
          id: `wilayah-bjb-${idx}`,
          title,
          subtitle,
          category: 'wilayah',
          categoryLabel: 'Wilayah Administratif',
          layerId: 'population',
          coordinates: coords,
          detailRows: [
            { label: 'Kecamatan', value: p.wadmkc },
            { label: 'Kelurahan', value: p.wadmkd },
            { label: 'Kepadatan (jiwa/km²)', value: p.kepadatan, format: 'number' },
          ],
          searchableText: `${title} banjarbaru ${p.wadmkc ?? ''} ${p.wadmkd ?? ''} kelurahan kelurahan kepadatan`,
          badge: 'Kelurahan',
        });
      });
    }

    // 4. Fetch & Index Laporan Warga Publik
    try {
      const reports = await loadCommunityReports();
      const reportFC = reportsToFeatureCollection(reports, false);
      reportFC.features.forEach((feature) => {
        const coords = (feature.geometry as any).coordinates as LngLatTuple | undefined;
        const p = feature.properties || {};
        const title = p.ticketNumber ? `Tiket #${p.ticketNumber}: ${p.description}` : String(p.description || 'Laporan Warga');

        items.push({
          id: `laporan-${p.id}`,
          title: title.slice(0, 70),
          subtitle: p.hasPhoto ? 'Laporan dengan dokumentasi foto' : 'Laporan warga terverifikasi',
          category: 'laporan',
          categoryLabel: 'Laporan Warga',
          layerId: 'communityReports',
          coordinates: coords ?? null,
          actionRoute: `#/laporan/${encodeURIComponent(String(p.id))}`,
          searchableText: `${title} ${p.ticketNumber ?? ''} ${p.status ?? ''} laporan aduan warga`,
          badge: p.ticketNumber ? `#${p.ticketNumber}` : 'Laporan',
        });
      });
    } catch (err) {
      console.info('[SearchEngine] Laporan warga belum dapat diindeks:', err);
    }

    fullSearchIndexCache = items;
    indexBuildingPromise = null;
    return items;
  })();

  return indexBuildingPromise;
}

/**
 * Query search engine terpadu dengan scoring & filter kategori opsional
 */
export function querySearchIndex(
  index: SearchItem[],
  query: string,
  options: {
    categoryFilter?: string | 'semua';
    userLocation?: LngLatTuple | null;
    limit?: number;
  } = {}
): SearchResultItem[] {
  const { categoryFilter = 'semua', userLocation = null, limit = 10 } = options;
  const trimmed = query.trim();

  if (!trimmed) {
    if (userLocation) {
      // Jika query kosong tetapi lokasi GPS aktif, kembalikan faskes terdekat
      return index
        .filter((item) => item.coordinates && item.category !== 'aksi')
        .map((item) => ({
          ...item,
          score: 10,
          distanceMeters: calculateDistanceMeters(userLocation, item.coordinates!),
        }))
        .sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity))
        .slice(0, limit);
    }
    return [];
  }

  const results: SearchResultItem[] = [];

  for (const item of index) {
    if (categoryFilter !== 'semua') {
      if (categoryFilter === 'faskes') {
        if (!['rumahsakit', 'puskesmas', 'klinik', 'apotek', 'homecare'].includes(item.category)) {
          continue;
        }
      } else if (item.category !== categoryFilter) {
        continue;
      }
    }

    const score = calculateMatchScore(trimmed, item.searchableText, item.title);
    if (score > 0) {
      const distanceMeters =
        userLocation && item.coordinates ? calculateDistanceMeters(userLocation, item.coordinates) : undefined;

      results.push({
        ...item,
        score,
        distanceMeters,
      });
    }
  }

  // Urutkan berdasarkan score (utama) lalu jarak terdekat (jika ada)
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.distanceMeters !== undefined && b.distanceMeters !== undefined) {
      return a.distanceMeters - b.distanceMeters;
    }
    return 0;
  });

  return results.slice(0, limit);
}

// -------------------------------------------------------------
// Recent Searches Storage
// -------------------------------------------------------------

export function getRecentSearches(): SearchItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(item: SearchItem): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentSearches();
    const filtered = current.filter((existing) => existing.id !== item.id);
    const updated = [item, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore
  }
}
