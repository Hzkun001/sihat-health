// src/lib/data/hero.ts
//
// Static content used in the hero section.

/** Words that cycle through the headline (every 2.5s). */
export const rotatingWords = ['Sehat', 'Hijau', 'Inklusif'] as const;

/** Widest word in the rotation — used as an invisible spacer to lock width. */
export const widestRotatingWord =
  rotatingWords.reduce((widest, word) =>
    word.length > widest.length ? word : widest
  );

/** Items for the marquee data ticker at the bottom of the hero. */
export const heroMarqueeItems = [
  '17 Rumah Sakit',
  '32 Puskesmas',
  '68 Klinik Kesehatan',
  '176 Apotek & Farmasi',
  '30 HomeCare Lansia',
  '19 Titik TPS Sanitasi',
  '910K+ Penduduk',
  'Peta Geospasial Real-time',
  'AI Chatbot SIHAT',
] as const;
