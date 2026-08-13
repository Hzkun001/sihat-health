# SIHAT Banjarmasin–Banjarbaru

SIHAT adalah platform informasi kesehatan lingkungan untuk Banjarmasin–Banjarbaru. Aplikasi ini menggabungkan peta tematik, data fasilitas kesehatan, pelaporan warga, dan portal operasional petugas.

## Fitur utama

- Beranda informatif dengan hero, fitur platform, FAQ, CTA, dan navigasi berbasis hash route.
- Peta interaktif MapLibre dengan basemap MapTiler dan dataset geospasial lokal.
- Layer fasilitas kesehatan, demografi, TPS, dan laporan warga yang sudah dipublikasikan.
- Pencarian fasilitas, fasilitas terdekat berdasarkan geolokasi, clustering, popup detail, legend, pergantian basemap, dan fullscreen.
- Form laporan warga dengan koordinat, foto opsional, validasi input, consent privasi, dan halaman detail laporan.
- Fallback `localStorage` untuk pengembangan tanpa Supabase.
- Portal petugas dengan login Supabase, verifikasi, publikasi laporan, status penanganan, assignment, SLA, catatan internal, audit log, dan export CSV/JSON.
- Realtime update untuk laporan, komentar, timeline, dan catatan internal.

## Tumpukan teknologi

- **Frontend:** React 18, TypeScript, Vite 6
- **Styling:** Tailwind CSS 3, design token di `src/styles/globals.css`
- **UI dan animasi:** Radix UI, `lucide-react`, Motion
- **Peta:** MapLibre GL dan MapTiler
- **Backend:** Supabase Auth, PostgreSQL, Storage, Realtime, dan PostGIS
- **Testing:** Vitest dan Playwright
- **Deployment:** Vercel atau static hosting lain yang mendukung Vite

## Memulai

### Prasyarat

- Node.js 18 atau lebih baru
- npm 9 atau lebih baru

### Instalasi

```bash
npm install
npm run dev
```

Dev server berjalan di `http://localhost:8080`.

### Environment Supabase

Buat `.env.local` dari `.env.example` jika ingin menggunakan backend Supabase:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
VITE_MAPTILER_KEY=your_maptiler_key
```

Tanpa environment tersebut, form laporan menggunakan `localStorage`. Portal petugas tetap menampilkan batas konfigurasi karena login staf hanya tersedia melalui Supabase.

Jangan pernah menaruh database password atau Supabase `service_role` key di frontend.

Panduan lengkap backend ada di [`docs/supabase-setup.md`](docs/supabase-setup.md).

## Script tersedia

| Script | Fungsi |
|---|---|
| `npm run dev` | Menjalankan Vite dev server di port 8080 |
| `npm run build` | Membuat build produksi ke `build/` |
| `npm run typecheck` | Memeriksa tipe TypeScript |
| `npm run lint` | Menjalankan ESLint |
| `npm test` | Menjalankan unit test Vitest |
| `npm run test:e2e` | Menjalankan smoke test Playwright dengan Chromium |
| `npm run check` | Menjalankan typecheck, lint, unit test, dan build |

Sebelum menjalankan E2E secara lokal, install browser Playwright satu kali:

```bash
npx playwright install chromium
npm run test:e2e
```

Konfigurasi E2E berada di `playwright.config.ts`. Test otomatis menjalankan dev server jika belum ada server di port 8080.

## Struktur proyek

| Path | Deskripsi |
|---|---|
| `src/main.tsx` | Bootstrap React dan error boundary |
| `src/App.tsx` | Shell aplikasi dan hash routing |
| `src/components/layout/` | Navbar dan Footer |
| `src/components/shared/` | Error boundary, reveal animation, dan responsive motion |
| `src/components/ui/` | Komponen UI berbasis Radix/shadcn-style |
| `src/sections/hero/` | Hero beranda |
| `src/sections/map/` | Peta, loader peta, dan filter layer |
| `src/sections/stats/` | Statistik indikatif |
| `src/sections/ReportSection.tsx` | Form laporan warga |
| `src/sections/ReportDetailPage.tsx` | Detail laporan dan komentar |
| `src/sections/StaffDashboardPage.tsx` | Portal operasional petugas |
| `src/lib/communityReports.ts` | Repository laporan: localStorage atau Supabase |
| `src/lib/reportValidation.ts` | Validasi deskripsi, koordinat, dan foto |
| `src/lib/supabase.ts` | Inisialisasi client dan sesi anonim |
| `public/datageo/` | Dataset GeoJSON/JSON untuk peta |
| `public/assets/` | Logo, foto, dan ikon marker |
| `supabase/migrations/` | Schema, RLS, trigger, Storage, dan operasi laporan |
| `tests/e2e/` | Smoke test Playwright |
| `docs/` | Setup Supabase dan backup runbook |

## Hash route

| Route | Halaman |
|---|---|
| `#/` | Beranda |
| `#/peta` | Peta interaktif |
| `#/laporan` | Form laporan warga |
| `#/laporan/:id` | Detail laporan |
| `#/insight` | Statistik |
| `#/kontak` | Kontak dan kolaborasi |
| `#/petugas` | Portal petugas |
| `#/privasi` | Privasi dan aksesibilitas |

## Data dan pemetaan

Layer peta saat ini membaca file berikut dari `public/datageo/`:

- `rumahsakit.json`
- `puskesmas.json`
- `klinik.json`
- `apotek.json`
- `homecare.json`
- `tps.json`
- `kepadatan_penduduk.json`
- `sebaran_balita.json`
- `sebaran_lansia.json`
- `sebaran_disabilitas.json`
- `kecamatan_penduduk_banjarmasin.geojson`

`kasus_stunting.json` juga tersedia sebagai dataset, tetapi belum diaktifkan sebagai layer pada `MapSection.tsx`.

Konfigurasi layer, style, popup, dan interaksi peta berada di `src/sections/map/MapSection.tsx`. Ikon marker berada di `public/assets/logoForMap/`.

## Pelaporan dan privasi

Laporan baru bersifat internal. Laporan hanya masuk peta publik setelah diverifikasi dan diterbitkan petugas. Foto production disimpan di bucket privat Supabase dan dibagikan menggunakan signed URL.

Migration Supabase harus dijalankan berurutan:

1. `202606060001_reports.sql` — tabel laporan, RLS dasar, trigger timeline, dan Storage.
2. `202606060002_report_privacy.sql` — publication workflow dan akses laporan privat.
3. `202606060003_report_operations.sql` — SLA, assignment, catatan internal, dan audit log.
4. `202606060004_security_hardening.sql` — bucket private, RPC staff, pencabutan mutation langsung, dan constraint database.

Untuk project baru, gunakan Supabase CLI:

```bash
supabase link --project-ref PROJECT_REF_ANDA
supabase db push
```

Migration `004` wajib diterapkan sebelum frontend memakai operasi staff berbasis RPC. Untuk instalasi existing, jangan mengedit atau menjalankan ulang migration yang sudah tercatat sebagai applied; buat migration baru untuk perubahan berikutnya. Detail setup ada di [`docs/supabase-setup.md`](docs/supabase-setup.md).

Matriks kewenangan staff:

| Role | Verifikasi/status | Publikasi | Operasi/SLA | Catatan internal/audit |
|---|---|---|---|---|
| `admin` | Ya | Ya | Ya | Baca |
| `verifikator` | Ya | Ya | Tidak | Baca |
| `petugas` | Tidak | Tidak | Ya | Baca/tulis catatan |

Sebelum production, aktifkan CAPTCHA untuk anonymous sign-in, rate limiting, monitoring, dan prosedur pembersihan anonymous user. Uji RLS serta RPC menggunakan akun untuk setiap role; pipeline frontend tidak dapat memvalidasi PostgreSQL secara otomatis. Ikuti [`docs/backup-runbook.md`](docs/backup-runbook.md) untuk backup database dan Storage.

## Deployment

```bash
npm run build
```

Hasil build berada di `build/`. Aplikasi menggunakan hash routing, sehingga deployment static tidak membutuhkan server-side route handler untuk setiap halaman. Pastikan asset `/assets/*` dan `/datageo/*` ikut disajikan oleh hosting.

## Catatan pengembangan

- Angka pada `src/sections/stats/StatsCards.tsx` masih bersifat indikatif dan hardcoded.
- Basemap MapTiler membutuhkan key publik yang dibatasi berdasarkan domain dan quota.
- Chatbase dimuat dari `www.chatbase.co` secara dinamis.
- Build MapLibre cukup besar; evaluasi lebih lanjut diperlukan jika target utama adalah perangkat dengan koneksi lambat.
