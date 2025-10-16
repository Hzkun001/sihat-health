/// <reference types="vite/client" />

// Deklarasi env custom kamu biar TS tau tipenya
interface ImportMetaEnv {
  readonly VITE_SPLINE_SCENE_URL: string; // tambahkan variabel lain kalau ada
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
