// src/lib/data/news.ts
//
// Static news content shown in the homepage News section.
// Kept separate from the rendering component so editors can update copy
// without touching JSX.

export interface NewsCard {
  id: number;
  date: string;
  category: string;
  title: string;
  excerpt: string;
}

export interface NewsSlide {
  id: number;
  cards: NewsCard[];
}

export const newsSlides: NewsSlide[] = [
  {
    id: 1,
    cards: [
      {
        id: 1,
        date: '12 Oktober 2025',
        category: 'Program Kesehatan',
        title: 'Program Pencegahan DBD Banjarbaru Tahun 2025',
        excerpt:
          'Dinas Kesehatan Banjarbaru meluncurkan program fogging dan edukasi masyarakat untuk mengurangi kasus DBD.',
      },
      {
        id: 2,
        date: '8 Oktober 2025',
        category: 'Fasilitas',
        title: 'Peningkatan Layanan Kesehatan di 12 Puskesmas',
        excerpt:
          'Pemerintah menambah tenaga medis dan fasilitas untuk memperluas akses layanan.',
      },
      {
        id: 3,
        date: '5 Oktober 2025',
        category: 'Edukasi',
        title: 'Gerakan Hidup Sehat di Sekolah Dasar',
        excerpt:
          'Kampanye edukasi kebersihan dan pola makan sehat bagi siswa sekolah dasar di Banjarbaru.',
      },
    ],
  },
  {
    id: 2,
    cards: [
      {
        id: 4,
        date: '28 September 2025',
        category: 'Vaksinasi',
        title: 'Cakupan Imunisasi Dasar Capai 94%',
        excerpt:
          'Kolaborasi puskesmas & kader meningkatkan kunjungan balita untuk imunisasi.',
      },
      {
        id: 5,
        date: '25 September 2025',
        category: 'Lingkungan',
        title: 'Pemantauan Kualitas Udara Terintegrasi',
        excerpt:
          'Integrasi sensor PM2.5 dengan pelaporan batuk/ISPA di seluruh wilayah.',
      },
      {
        id: 6,
        date: '22 September 2025',
        category: 'Ibu & Anak',
        title: 'Kelas Ibu Hamil: Nutrisi & ANC',
        excerpt: 'Konseling gizi, pemeriksaan HB, dan jadwal K4 untuk ibu hamil.',
      },
    ],
  },
  {
    id: 3,
    cards: [
      {
        id: 7,
        date: '10 September 2025',
        category: 'Posyandu',
        title: 'Posyandu Aktif 89 Titik',
        excerpt: 'Fokus deteksi dini stunting & edukasi ASI eksklusif untuk ibu muda.',
      },
      {
        id: 8,
        date: '7 September 2025',
        category: 'Kedaruratan',
        title: 'Simulasi Tanggap Bencana Kesehatan',
        excerpt: 'Latihan koordinasi lintas OPD untuk evakuasi cepat saat darurat.',
      },
      {
        id: 9,
        date: '5 September 2025',
        category: 'Kemitraan',
        title: 'Kolaborasi Data SIHAT x BPS Kalsel',
        excerpt: 'Harmonisasi metadata dan frekuensi pembaruan data kesehatan.',
      },
    ],
  },
];
