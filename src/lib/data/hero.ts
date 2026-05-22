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
  '47 Puskesmas',
  '200K+ Warga',
  '15 Indikator SDG',
  '5 Rumah Sakit',
  '32 Apotek',
  '12 Klinik',
  'Real-time Data',
  'AI Chatbot',
] as const;
