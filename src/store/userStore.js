import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const useUserStore = create(
  persist(
    (set, get) => ({
      users: [],         // Menyimpan daftar karyawan yang sedang tampil
      totalCount: 0,     // Total seluruh karyawan di database (untuk pagination)
      isLoading: false,  // Status pemuatan data (fetch)
      isSubmitting: false, // Status pengiriman data (add/edit/delete)
      error: null,       // Menyimpan pesan error jika ada
      theme: 'light',    // Status tema aplikasi
      
      // Fungsi untuk mengganti tema (Terang/Gelap)
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        }));
      },

      /**
       * Tujuan: Mengambil data karyawan dari Supabase dengan filter dan pagination.
       */
      fetchUsers: async (page = 1, pageSize = 10, search = "", divisi = "Semua") => {
        set({ isLoading: true, error: null });
        try {
          let query = supabase
            .from('karyawan')
            .select('*', { count: 'exact' });

          if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,custom_id.ilike.%${search}%`);
          }

          if (divisi !== "Semua") {
            query = query.eq('divisi', divisi);
          }

          const from = (page - 1) * pageSize;
          const to = from + pageSize - 1;

          const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

          if (error) throw error;
          
          const mappedData = data.map(item => ({
            id: item.id,
            customId: item.custom_id,
            name: item.name,
            nickname: item.nickname,
            email: item.email,
            phone: item.phone,
            avatar: item.avatar,
            company: { name: item.divisi, catchPhrase: item.jabatan },
            address: { street: item.jalan, city: item.kota }
          }));

          set({ users: mappedData, totalCount: count || 0, isLoading: false });
        } catch (error) {
          console.error("Gagal fetch data:", error.message);
          set({ error: error.message, isLoading: false });
        }
      },

      checkDuplicate: async (customId, email, excludeId = null) => {
        const { data: existingId } = await supabase
          .from('karyawan')
          .select('id')
          .eq('custom_id', customId)
          .neq('id', excludeId || -1)
          .maybeSingle();
        
        if (existingId) return "ID Karyawan sudah digunakan.";

        const { data: existingEmail } = await supabase
          .from('karyawan')
          .select('id')
          .eq('email', email)
          .neq('id', excludeId || -1)
          .maybeSingle();

        if (existingEmail) return "Alamat email sudah terdaftar.";

        return null;
      },

      deleteOldFile: async (url) => {
        if (!url || !url.includes('avatars/')) return;
        try {
          const path = url.split('avatars/').pop();
          await supabase.storage.from('avatars').remove([`avatars/${path}`]);
        } catch (e) {
          console.error("Gagal hapus file lama:", e);
        }
      },

      uploadAvatar: async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        return publicUrl;
      },

      addUser: async (userData) => {
        set({ isSubmitting: true });
        try {
          const { error } = await supabase
            .from('karyawan')
            .insert([{
              custom_id: userData.customId,
              name: userData.name,
              nickname: userData.nickname,
              email: userData.email,
              phone: userData.phone,
              avatar: userData.avatar,
              divisi: userData.company?.name,
              jabatan: userData.company?.catchPhrase,
              jalan: userData.address?.street,
              kota: userData.address?.city
            }]);

          if (error) throw error;

          await get().fetchUsers(); 
        } finally {
          set({ isSubmitting: false });
        }
      },

      deleteUser: async (id, avatarUrl = null) => {
        set({ isSubmitting: true });
        try {
          if (avatarUrl) {
            await get().deleteOldFile(avatarUrl);
          }

          const { error } = await supabase
            .from('karyawan')
            .delete()
            .eq('id', id);

          if (error) throw error;

          await get().fetchUsers();
        } finally {
          set({ isSubmitting: false });
        }
      },

      editUser: async (id, updatedData, oldAvatarUrl = null) => {
        set({ isSubmitting: true });
        try {
          if (updatedData.avatar && oldAvatarUrl && updatedData.avatar !== oldAvatarUrl) {
            await get().deleteOldFile(oldAvatarUrl);
          }

          const { error } = await supabase
            .from('karyawan')
            .update({
              custom_id: updatedData.customId,
              name: updatedData.name,
              nickname: updatedData.nickname,
              email: updatedData.email,
              phone: updatedData.phone,
              avatar: updatedData.avatar,
              divisi: updatedData.company?.name,
              jabatan: updatedData.company?.catchPhrase,
              jalan: updatedData.address?.street,
              kota: updatedData.address?.city
            })
            .eq('id', id);

          if (error) throw error;

          await get().fetchUsers();
        } finally {
          set({ isSubmitting: false });
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export default useUserStore;
