import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const useUserStore = create(
  persist(
    (set) => ({
      users: [],
      isLoading: false,
      error: null,
      theme: 'light',
      
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        }));
      },

      fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('karyawan')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          
          const mappedData = data.map(item => ({
            id: item.id,
            customId: item.custom_id,
            name: item.name,
            nickname: item.nickname,
            email: item.email,
            phone: item.phone,
            avatar: item.avatar,
            company: {
              name: item.divisi,
              catchPhrase: item.jabatan
            },
            address: {
              street: item.jalan,
              city: item.kota
            }
          }));

          set({ users: mappedData, isLoading: false });
        } catch (error) {
          console.error("Gagal mengambil data dari Supabase:", error.message);
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

      // Fungsi untuk upload file ke Supabase Storage
      uploadAvatar: async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
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
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
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
            }])
            .select();

          if (error) throw error;

          const newUser = {
            id: data[0].id,
            customId: data[0].custom_id,
            name: data[0].name,
            nickname: data[0].nickname,
            email: data[0].email,
            phone: data[0].phone,
            avatar: data[0].avatar,
            company: { name: data[0].divisi, catchPhrase: data[0].jabatan },
            address: { street: data[0].jalan, city: data[0].kota }
          };

          set((state) => ({
            users: [newUser, ...state.users],
            isLoading: false
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      deleteUser: async (id) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase
            .from('karyawan')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            users: state.users.filter((user) => user.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      editUser: async (id, updatedData) => {
        set({ isLoading: true });
        try {
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

          set((state) => ({
            users: state.users.map((user) =>
              user.id === id ? { ...user, ...updatedData } : user
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
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
