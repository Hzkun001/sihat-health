import { Database, Eye, FileImage, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react';

const privacyItems = [
  {
    icon: MapPin,
    title: 'Lokasi laporan',
    description: 'Koordinat digunakan petugas untuk memeriksa lokasi kejadian. Laporan baru bersifat internal dan tidak langsung muncul di peta publik.',
  },
  {
    icon: FileImage,
    title: 'Foto dan deskripsi',
    description: 'Foto serta keterangan disimpan untuk kebutuhan verifikasi. Hindari mengunggah wajah, nomor identitas, nomor telepon, atau informasi pribadi lain.',
  },
  {
    icon: Eye,
    title: 'Publikasi',
    description: 'Petugas menentukan apakah laporan layak diterbitkan. Laporan yang dipublikasikan dapat menampilkan lokasi, deskripsi, foto, status, dan riwayat penanganan.',
  },
  {
    icon: LockKeyhole,
    title: 'Akses petugas',
    description: 'Akses operasional dibatasi menggunakan akun petugas dan Row Level Security pada Supabase.',
  },
  {
    icon: Database,
    title: 'Penyimpanan',
    description: 'Data laporan disimpan pada Supabase. Foto berada pada bucket privat dan diberikan melalui tautan sementara kepada pengguna yang berhak.',
  },
  {
    icon: ShieldCheck,
    title: 'Hak pengguna',
    description: 'Permintaan koreksi atau penghapusan laporan dapat disampaikan melalui kanal kontak SIHAT dengan menyertakan nomor tiket.',
  },
];

export function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface-0 px-6 pb-20 pt-32">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-brand-green">Privasi dan aksesibilitas</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-ink-900">Pengelolaan data laporan SIHAT</h1>
          <p className="mt-5 text-base font-semibold leading-7 text-ink-500">
            Kebijakan ini menjelaskan penggunaan data pada fitur pelaporan warga untuk wilayah Banjarmasin dan Banjarbaru. Terakhir diperbarui 6 Juni 2026.
          </p>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {privacyItems.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-lg border border-surface-200 bg-white p-5">
              <Icon size={20} className="text-brand-green" />
              <h2 className="mt-4 text-lg font-bold text-ink-900">{title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink-500">{description}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 border-t border-surface-200 pt-8">
          <h2 className="text-2xl font-bold text-ink-900">Aksesibilitas</h2>
          <p className="mt-3 max-w-3xl leading-7 text-ink-500">
            SIHAT dikembangkan agar dapat digunakan dengan keyboard, pembaca layar, dan tampilan responsif. Kendala akses dapat dilaporkan melalui email
            {' '}
            <a className="font-bold text-brand-green" href="mailto:sihat@banjarbaru.go.id">sihat@banjarbaru.go.id</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
