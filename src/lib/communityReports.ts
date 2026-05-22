export interface ReportComment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
}

export interface CommunityReport {
  id: string;
  description: string;
  latitude: number;
  longitude: number;
  photoDataUrl?: string;
  createdAt: string;
  status: 'baru' | 'ditinjau' | 'selesai';
  comments: ReportComment[];
}

export interface NewCommunityReportInput {
  description: string;
  latitude: number;
  longitude: number;
  photoDataUrl?: string | null;
}

const STORAGE_KEY = 'sihat-community-reports-v1';
const REPORTS_UPDATED_EVENT = 'sihat:community-reports-updated';

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeReport(value: unknown): CommunityReport | null {
  const item = value as Partial<CommunityReport> | null;
  if (!item || typeof item !== 'object') return null;
  if (typeof item.description !== 'string') return null;
  if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') return null;
  if (!Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)) return null;

  return {
    id: typeof item.id === 'string' ? item.id : createId('report'),
    description: item.description,
    latitude: item.latitude,
    longitude: item.longitude,
    photoDataUrl: typeof item.photoDataUrl === 'string' ? item.photoDataUrl : undefined,
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    status: item.status === 'ditinjau' || item.status === 'selesai' ? item.status : 'baru',
    comments: Array.isArray(item.comments)
      ? item.comments
          .map((comment) => {
            const normalized = comment as Partial<ReportComment>;
            if (typeof normalized.message !== 'string' || !normalized.message.trim()) return null;
            return {
              id: typeof normalized.id === 'string' ? normalized.id : createId('comment'),
              author: typeof normalized.author === 'string' && normalized.author.trim() ? normalized.author : 'Warga',
              message: normalized.message,
              createdAt: typeof normalized.createdAt === 'string' ? normalized.createdAt : new Date().toISOString(),
            };
          })
          .filter((comment): comment is ReportComment => Boolean(comment))
      : [],
  };
}

export function getCommunityReports(): CommunityReport[] {
  if (!canUseBrowserStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeReport)
      .filter((report): report is CommunityReport => Boolean(report))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  } catch (error) {
    console.warn('[Reports] Gagal membaca laporan warga:', error);
    return [];
  }
}

function saveCommunityReports(reports: CommunityReport[]) {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  window.dispatchEvent(new CustomEvent(REPORTS_UPDATED_EVENT, { detail: reports }));
}

export function addCommunityReport(input: NewCommunityReportInput): CommunityReport {
  const report: CommunityReport = {
    id: createId('report'),
    description: input.description.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    photoDataUrl: input.photoDataUrl || undefined,
    createdAt: new Date().toISOString(),
    status: 'baru',
    comments: [],
  };

  saveCommunityReports([report, ...getCommunityReports()]);
  return report;
}

export function getCommunityReportById(reportId: string): CommunityReport | null {
  return getCommunityReports().find((report) => report.id === reportId) ?? null;
}

export function addReportComment(reportId: string, message: string, author = 'Warga'): CommunityReport | null {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) return getCommunityReportById(reportId);

  const reports = getCommunityReports();
  let updatedReport: CommunityReport | null = null;

  const nextReports = reports.map((report) => {
    if (report.id !== reportId) return report;

    updatedReport = {
      ...report,
      comments: [
        ...report.comments,
        {
          id: createId('comment'),
          author: author.trim() || 'Warga',
          message: trimmedMessage,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    return updatedReport;
  });

  saveCommunityReports(nextReports);
  return updatedReport;
}

export function subscribeToCommunityReports(listener: (reports: CommunityReport[]) => void) {
  if (typeof window === 'undefined') return () => undefined;

  const handleReportsUpdated = () => listener(getCommunityReports());
  window.addEventListener(REPORTS_UPDATED_EVENT, handleReportsUpdated);
  window.addEventListener('storage', handleReportsUpdated);

  return () => {
    window.removeEventListener(REPORTS_UPDATED_EVENT, handleReportsUpdated);
    window.removeEventListener('storage', handleReportsUpdated);
  };
}

export function reportsToFeatureCollection(reports = getCommunityReports()): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: reports.map((report) => ({
      type: 'Feature',
      id: report.id,
      geometry: {
        type: 'Point',
        coordinates: [report.longitude, report.latitude],
      },
      properties: {
        id: report.id,
        description: report.description,
        createdAt: report.createdAt,
        status: report.status,
        hasPhoto: Boolean(report.photoDataUrl),
        photoDataUrl: report.photoDataUrl ?? '',
        commentsCount: report.comments.length,
      },
    })),
  };
}
