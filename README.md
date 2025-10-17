# Website Kesehatan Masyarakat sihat.health

Situs pemasaran interaktif untuk **sihat.health** yang menyajikan platform kesehatan digital, data kesehatan regional, dan kapabilitas produk. Antarmuka pengguna (*UI*) dibuat berdasarkan [domain resmi](https://sihat.health) dan diimplementasikan dengan perkakas React modern, animasi yang kaya, serta komponen web 3D.

## Fitur Utama (*Highlights*)

- Halaman beranda yang mulus dengan **animasi *hero***, ringkasan program, testimoni, dan corong *Call-to-Action* (**CTA**).
- Komponen *hero* **3D** yang sensitif terhadap perangkat (`@google/model-viewer`) dan efek partikel yang dapat dinonaktifkan secara bertahap (*degrade gracefully*) pada perangkat keras berdaya rendah.
- Peta interaktif **MapLibre GL** yang disuplai oleh *dataset* **GeoJSON/EsriJSON** lokal, dilengkapi konversi data *on-the-fly* dan pemfilteran lapisan peta.
- Dasbor **KPI**, bagan, dan pameran mitra yang dibangun dengan bagian-bagian React modular dan dimuat secara tunda (*lazy-loaded*).
- Pengalaman pemuatan yang dioptimalkan: **status kerangka** (*skeleton states*), *suspense boundaries*, dan layar pembuka animasi.

## Tumpukan Teknologi (*Tech Stack*)

- **Inti:** Vite 6, React 18, TypeScript
- **Penataan Gaya (*Styling*):** Tailwind CSS 3, *token* kustom di `src/styles/globals.css`
- **UI Primitif:** Radix UI, `lucide-react`, `vaul`, `cmdk`
- **Animasi & Gerak:** `motion` (API Framer Motion), sistem kursor/partikel khusus
- **Peta & Data:** MapLibre GL, *parser* kustom ArcGIS → GeoJSON (`src/utils/parseArcgisToGeoJSON.ts`)
- **3D & Media:** `@google/model-viewer`, aset Spline, GLB di-hosting di bawah `public/assets/3d`
- **Perkakas (*Tooling*):** PostCSS (Tailwind + Autoprefixer), aturan ESLint yang diwariskan dari *template* Vite (jika diaktifkan)

## Memulai

### Prasyarat Instalasi
1.  **Instal prasyarat**
    - Node.js $\ge$ 18 (persyaratan Vite 6)
    - npm $\ge$ 9
2.  **Instal dependensi**
    ```bash
    npm install
    ```
3.  **Jalankan *server* pengembangan (*dev server*)**
    ```bash
    npm run dev
    ```
    Vite akan menampilkan URL lokal (*default*: `http://localhost:5173`). *Hot-module replacement* (**HMR**) diaktifkan secara *default*.

### Skrip yang Tersedia

- `npm run dev` – memulai *server* pengembangan dengan HMR.
- `npm run build` – membuat *build* produksi yang dioptimalkan di direktori `build/`.

> **Tips:** Tambahkan `--host` saat menjalankan `npm run dev` untuk menguji pada perangkat lain dalam jaringan yang sama.

## Tata Letak Proyek (*Project Layout*)

| Path | Deskripsi |
| :--- | :--- |
| `src/App.tsx` | *Shell* aplikasi, mengorkestrasi bagian-bagian (*sections*) dan alur pemuatan (*loading flow*). |
| `src/components/*` | Bagian modular (*Hero*, *Map*, *Stats*, *CTA*, *Footer*, dll.) dan *widget* pendukung. |
| `src/styles/globals.css` | *Design token*, variabel CSS, dan *reset* dasar yang diletakkan di atas Tailwind. |
| `src/utils/parseArcgisToGeoJSON.ts` | Konverter *runtime* untuk respons Esri ArcGIS yang dikonsumsi oleh MapLibre. |
| `public/data/*.json` | *Dataset* statis untuk lapisan peta (fasilitas kesehatan, demografi, dll.). |
| `public/assets/3d/*` | Model 3D dan gambar *poster* yang digunakan oleh visual *hero*. |

## Data & Pemetaan

- Semua lapisan peta dimuat dari berkas **JSON** lokal di bawah `public/data`. Ganti berkas ini dengan ekspor data yang diperbarui untuk menyegarkan peta.
- *Feed* **EsriJSON** dikonversi ke **GeoJSON** secara *on-the-fly*; lihat `parseArcgisToGeoJSON.ts` untuk harapan skema.
- Ikon dan *sprite* kustom berada di `public/assets`. Pastikan aset baru **dioptimalkan** (PNG/SVG) dan direferensikan di `MapSection.tsx`.
- Kontrol peta, *breakpoint* seluler, dan penataan gaya lapisan peta dapat disesuaikan di `src/components/MapSection.tsx`.

## Pengalaman 3D

- Bagian *hero* menggunakan `<model-viewer>` dengan *wrapper* yang dimuat secara tunda (`src/components/HeroVisual3D.tsx`).
- Model (`.glb`) dan gambar *poster* berada di `public/assets/3d/`. Jaga ukuran gambar *poster* di bawah $\sim 200$ KB untuk pemuatan yang mulus.
- Interaksi model dapat disesuaikan melalui *props* di `HeroVisual3D.tsx`.

## Penerapan (*Deployment*)

1.  *Build* aset dengan `npm run build`.
2.  Sajikan direktori `build/` melalui *host* statis apa pun (Vercel, Netlify, Nginx, dll.).
3.  Konfigurasi *host* untuk *fallback* ke `index.html` untuk *routing* **SPA** (*Single Page Application*).

## Kontribusi & Kustomisasi

- Komponen sangat bergantung pada *utility class* Tailwind; perluas `tailwind.config.js` jika Anda membutuhkan *token* kustom.
- Variabel CSS global di `globals.css` mendukung *theming*. Timpa (*override*) variabel tersebut untuk menukar palet atau tipografi.
- Ketika menambahkan *plugin* PostCSS baru, pastikan mereka meneruskan metadata `from` untuk menghindari peringatan Vite.

Silakan buka *issue* atau kirim *pull request* untuk mengusulkan perbaikan. Selamat membangun! 🎉