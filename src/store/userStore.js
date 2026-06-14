import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
          const response = await fetch("https://jsonplaceholder.typicode.com/users");
          if (!response.ok) throw new Error("Gagal mengambil data dari server.");
          const data = await response.json();
          
          const enhancedData = data.map(user => ({
            ...user,
            customId: `EMP-${user.id.toString().padStart(4, '0')}`,
            nickname: user.username,
            avatar: `https://i.pravatar.cc/150?u=${user.email}` // Avatar otomatis untuk data dummy
          }));
          
          set({ users: enhancedData, isLoading: false });
        } catch (error) {
          console.error("Gagal mengambil data pengguna:", error);
          set({ error: error.message, isLoading: false });
        }
      },

      addUser: (userData) => {
        set((state) => ({
          users: [
            {
              id: state.users.length > 0 ? Math.max(...state.users.map(u => u.id)) + 1 : 1,
              ...userData,
            },
            ...state.users,
          ],
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }));
      },

      editUser: (id, updatedData) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updatedData } : user
          ),
        }));
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ theme: state.theme, users: state.users }),
    }
  )
);

export default useUserStore;
