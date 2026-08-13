import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  : null;

export async function ensureAnonymousSession() {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (session) {
    if (session.user.is_anonymous) return session;
    throw new Error('Sesi petugas sedang aktif. Gunakan sesi warga terpisah untuk mengirim laporan.');
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    if (error.message?.toLowerCase().includes('load failed')) {
      throw new Error(
        'Gagal membuat sesi anonim Supabase. Cek apakah Anonymous Sign-Ins sudah aktif dan origin lokal sudah ditambahkan ke CORS/allowed origins.',
      );
    }

    throw error;
  }
  if (!data.session) throw new Error('Sesi anonim tidak berhasil dibuat');
  return data.session;
}
