import { createClient } from '@supabase/supabase-js';

// Mengambil URL dan Key dari file .env secara aman
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Tujuan: Inisialisasi koneksi ke Supabase.
 * Client ini akan digunakan di seluruh aplikasi untuk interaksi database dan storage.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
