// src/lib/statsData.ts
import {
  Building2,
  Cross,
  Pill,
  HeartPulse,
  Home,
  Trash2,
  Users,
  Compass,
  FileCheck2,
} from 'lucide-react';
import type { ComponentType } from 'react';

export type IconType = ComponentType<{ size?: number; color?: string; className?: string }>;

export interface StatItem {
  icon: IconType;
  label: string;
  value: string;
  rawValue?: number;
  category: string;
  description: string;
}

export interface AggregatedHealthStats {
  hospitals: number;
  puskesmas: number;
  clinics: number;
  pharmacies: number;
  homecares: number;
  tpsCount: number;
  districtsCount: number;
  villagesCount: number;
  estimatedTotalPopulation: number;
}

// Fallback berbasis hitungan riil dari dataset GeoJSON di public/datageo/
export const DEFAULT_VERIFIED_STATS: AggregatedHealthStats = {
  hospitals: 17,
  puskesmas: 32,
  clinics: 68,
  pharmacies: 176,
  homecares: 30,
  tpsCount: 19,
  districtsCount: 5,
  villagesCount: 20,
  estimatedTotalPopulation: 911105, // ~657.663 Banjarmasin + ~253.442 Banjarbaru
};

let cachedStats: AggregatedHealthStats | null = null;
let statsLoadingPromise: Promise<AggregatedHealthStats> | null = null;

async function countFeaturesFromUrl(url: string): Promise<number> {
  try {
    const res = await fetch(url);
    if (!res.ok) return 0;
    const json = await res.json();
    if (json && Array.isArray(json.features)) {
      return json.features.length;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Muat agregasi data kesehatan riil dari dataset GeoJSON
 */
export async function loadAggregatedHealthStats(): Promise<AggregatedHealthStats> {
  if (cachedStats) return cachedStats;
  if (statsLoadingPromise) return statsLoadingPromise;

  statsLoadingPromise = (async () => {
    try {
      const [
        hospitals,
        puskesmas,
        clinics,
        pharmacies,
        homecares,
        tpsCount,
      ] = await Promise.all([
        countFeaturesFromUrl('/datageo/rumahsakit.json'),
        countFeaturesFromUrl('/datageo/puskesmas.json'),
        countFeaturesFromUrl('/datageo/klinik.json'),
        countFeaturesFromUrl('/datageo/apotek.json'),
        countFeaturesFromUrl('/datageo/homecare.json'),
        countFeaturesFromUrl('/datageo/tps.json'),
      ]);

      const finalStats: AggregatedHealthStats = {
        hospitals: hospitals || DEFAULT_VERIFIED_STATS.hospitals,
        puskesmas: puskesmas || DEFAULT_VERIFIED_STATS.puskesmas,
        clinics: clinics || DEFAULT_VERIFIED_STATS.clinics,
        pharmacies: pharmacies || DEFAULT_VERIFIED_STATS.pharmacies,
        homecares: homecares || DEFAULT_VERIFIED_STATS.homecares,
        tpsCount: tpsCount || DEFAULT_VERIFIED_STATS.tpsCount,
        districtsCount: DEFAULT_VERIFIED_STATS.districtsCount,
        villagesCount: DEFAULT_VERIFIED_STATS.villagesCount,
        estimatedTotalPopulation: DEFAULT_VERIFIED_STATS.estimatedTotalPopulation,
      };

      cachedStats = finalStats;
      return finalStats;
    } catch {
      return DEFAULT_VERIFIED_STATS;
    } finally {
      statsLoadingPromise = null;
    }
  })();

  return statsLoadingPromise;
}

/**
 * Generate kartu statistik untuk tampilan StatsCards
 */
export function buildStatCardsList(stats: AggregatedHealthStats = DEFAULT_VERIFIED_STATS): StatItem[] {
  return [
    {
      icon: Building2,
      label: 'Rumah Sakit Terdata',
      value: `${stats.hospitals}`,
      rawValue: stats.hospitals,
      category: 'faskes',
      description: 'RSUD & RS Swasta di Banjarmasin–Banjarbaru',
    },
    {
      icon: HeartPulse,
      label: 'Puskesmas Wilayah',
      value: `${stats.puskesmas}`,
      rawValue: stats.puskesmas,
      category: 'faskes',
      description: 'Pusat Kesehatan Masyarakat tingkat kecamatan/kelurahan',
    },
    {
      icon: Cross,
      label: 'Klinik Kesehatan',
      value: `${stats.clinics}`,
      rawValue: stats.clinics,
      category: 'faskes',
      description: 'Klinik pratama dan utama terdaftar',
    },
    {
      icon: Pill,
      label: 'Apotek & Farmasi',
      value: `${stats.pharmacies}`,
      rawValue: stats.pharmacies,
      category: 'faskes',
      description: 'Jaringan apotek dan distribusi obat',
    },
    {
      icon: Home,
      label: 'HomeCare Lansia',
      value: `${stats.homecares}`,
      rawValue: stats.homecares,
      category: 'layanan',
      description: 'Layanan kunjungan kesehatan lansia & disabilitas',
    },
    {
      icon: Trash2,
      label: 'Titik TPS Sanitasi',
      value: `${stats.tpsCount}`,
      rawValue: stats.tpsCount,
      category: 'lingkungan',
      description: 'Tempat penampungan sampah & monitoring sanitasi',
    },
    {
      icon: Users,
      label: 'Estimasi Penduduk',
      value: '910K+',
      rawValue: stats.estimatedTotalPopulation,
      category: 'demografi',
      description: 'Agregat populasi Banjarmasin dan Banjarbaru',
    },
    {
      icon: Compass,
      label: 'Kecamatan Terpetakan',
      value: `${stats.districtsCount} Kec.`,
      rawValue: stats.districtsCount,
      category: 'wilayah',
      description: 'Cakupan wilayah administratif Banjarmasin',
    },
    {
      icon: FileCheck2,
      label: 'Kelurahan Terdata',
      value: `${stats.villagesCount} Kel.`,
      rawValue: stats.villagesCount,
      category: 'wilayah',
      description: 'Cakupan wilayah administratif Banjarbaru',
    },
  ];
}
