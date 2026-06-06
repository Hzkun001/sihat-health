# Supabase Setup

## 1. Buat project

Buat project Supabase, lalu salin:

- Project URL
- Publishable key

Buat `.env.local` dari `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Jangan gunakan `service_role` key pada frontend.

## 2. Aktifkan anonymous auth

Di Supabase Dashboard:

1. Buka **Authentication**
2. Buka pengaturan provider
3. Aktifkan **Anonymous Sign-Ins**

Anonymous auth memberi setiap warga UUID tanpa meminta email atau password.

Jika aplikasi dijalankan dari `localhost`, tambahkan origin pengembangan ke konfigurasi CORS/allowed origins Supabase agar request browser tidak gagal dengan `Load failed`.

Sebelum production, aktifkan Cloudflare Turnstile atau hCaptcha pada menu
**Authentication > Bot and Abuse Protection**.

## 3. Jalankan migration

Buka SQL Editor Supabase dan jalankan:

`supabase/migrations/202606060001_reports.sql`

Setelah migration utama berhasil, jalankan migration privasi:

`supabase/migrations/202606060002_report_privacy.sql`

Terakhir, jalankan migration operasional:

`supabase/migrations/202606060003_report_operations.sql`

Migration membuat:

- PostGIS location dan spatial index
- `reports`
- `report_comments`
- `report_updates`
- `staff_profiles`
- Storage bucket `report-photos`
- Row Level Security policies
- Realtime publication
- Trigger nomor tiket dan timeline status
- Moderasi publikasi laporan
- Bucket foto privat dan signed URL
- Assignment petugas, prioritas, dan tenggat SLA
- Catatan internal petugas
- Audit log perubahan operasional

## 4. Buat akun petugas

1. Buat user email/password dari menu **Authentication > Users**
2. Salin UUID user
3. Jalankan SQL:

```sql
insert into public.staff_profiles (user_id, display_name, role)
values (
  'USER_UUID',
  'Nama Petugas',
  'admin'
);
```

Role yang tersedia:

- `admin`
- `verifikator`
- `petugas`

Portal petugas tersedia di:

`#/petugas`

## 5. Jalankan aplikasi

```bash
npm run dev
```

Tanpa environment Supabase, laporan tetap menggunakan `localStorage` untuk
development. Setelah environment terisi dan migration dijalankan, laporan,
foto, komentar, timeline, dan perubahan status menggunakan Supabase.

Laporan baru bersifat internal. Petugas dapat menerbitkannya ke peta publik
melalui panel detail di Portal Petugas setelah isi dan lokasi diverifikasi.

## Catatan produksi

- Aktifkan CAPTCHA untuk anonymous sign-in.
- Tinjau batas upload dan MIME type pada bucket `report-photos`.
- Jangan simpan nomor telepon atau data pribadi pada tabel publik.
- Buat jadwal pembersihan anonymous user yang tidak aktif.
- Tambahkan monitoring dan rate limiting sebelum peluncuran publik.
- Ikuti prosedur backup dan uji restore di `docs/backup-runbook.md`.
