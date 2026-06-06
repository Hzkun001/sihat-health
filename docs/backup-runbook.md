# SIHAT Backup Runbook

## Tujuan

Backup SIHAT dibagi menjadi tiga lapisan:

1. Backup PostgreSQL yang dikelola Supabase.
2. Logical dump yang disimpan di lokasi terpisah.
3. Backup file pada Supabase Storage.

Ekspor CSV atau JSON dari Portal Petugas hanya untuk kebutuhan operasional.
Ekspor tersebut bukan pengganti backup database.

## Backup Supabase

Periksa menu **Database > Backups** pada Supabase Dashboard.

- Project Pro, Team, dan Enterprise mendapatkan daily backup.
- Point-in-Time Recovery dapat digunakan jika kehilangan data satu hari tidak
  dapat diterima.
- Project Free perlu membuat logical dump secara berkala.

Backup database hanya mencakup database dan metadata Storage. File foto yang
telah diunggah ke bucket `report-photos` tidak ikut dipulihkan ketika database
direstore.

## Logical dump off-site

Gunakan database connection string dari menu **Connect** di Supabase. Simpan
connection string sebagai secret dan jangan menaruhnya di source code,
`.env.local` frontend, log CI, atau repository.

```bash
supabase db dump --db-url "$SUPABASE_DB_URL" -f roles.sql --role-only
supabase db dump --db-url "$SUPABASE_DB_URL" -f schema.sql
supabase db dump \
  --db-url "$SUPABASE_DB_URL" \
  -f data.sql \
  --data-only \
  --use-copy \
  -x "storage.buckets_vectors" \
  -x "storage.vector_indexes"
```

Simpan hasil dump di object storage atau backup vault terpisah. Jangan
menyimpan dump berisi data warga pada repository publik.

## Frekuensi yang disarankan

- Database production: daily backup.
- Logical dump off-site: minimal mingguan.
- Storage `report-photos`: minimal mingguan.
- Uji restore: setiap tiga bulan dan setelah perubahan schema besar.

Untuk laporan yang bersifat kritis, gunakan PITR dan turunkan interval backup
Storage sesuai Recovery Point Objective yang disepakati.

## Checklist restore

1. Tentukan waktu insiden dan backup terakhir yang masih sehat.
2. Hentikan sementara penulisan laporan.
3. Restore ke project uji terlebih dahulu.
4. Verifikasi jumlah `reports`, `report_comments`, dan `report_updates`.
5. Verifikasi login petugas dan Row Level Security.
6. Pulihkan file Storage dan cek URL foto laporan.
7. Jalankan smoke test kirim laporan, ubah status, komentar, dan Realtime.
8. Catat waktu pemulihan serta data yang hilang sejak backup terakhir.

## Informasi rahasia

Data berikut tidak boleh berada pada frontend:

- Database password atau connection string.
- Supabase `service_role` key.
- Supabase personal access token.
- Token Management API.

Portal Petugas hanya boleh menggunakan publishable key dan hak akses yang
dibatasi oleh Row Level Security.
