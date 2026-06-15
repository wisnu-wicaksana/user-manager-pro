import { create } from 'zustand';
import { supabase } from '../lib/supabase';

/**
 * Tujuan: Mengelola status login (autentikasi) admin secara global.
 */
const useAuthStore = create((set) => ({
  user: null,      // Menyimpan data user yang sedang login
  session: null,   // Menyimpan detail sesi (token)
  isLoading: true, // Menunggu pengecekan sesi saat web pertama dibuka

  /**
   * Tujuan: Mengecek apakah admin masih dalam keadaan login saat halaman di-refresh.
   * Cara Kerja: Supabase menyimpan sesi di browser secara otomatis. Fungsi ini mengambilnya kembali.
   */
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, isLoading: false });

    // Mendengarkan perubahan status secara real-time (misal: session expired)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, isLoading: false });
    });
  },

  // Fungsi Login: Mengirim email/password ke server Supabase
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Fungsi Logout: Menghapus sesi di server dan browser
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, session: null });
  },

  // Fitur Ganti Password untuk Admin
  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  }
}));

export default useAuthStore;
