import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import useAuthStore from "../store/authStore";

const Settings = () => {
  const { user, updatePassword } = useAuthStore();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      toast.success("Password berhasil diperbarui!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.message || "Gagal memperbarui password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Pengaturan Admin</h1>

        {/* Profil Section */}
        <section className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 transition-colors">
          <h3 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-6">Informasi Akun</h3>
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase">Email Terdaftar</p>
            <p className="text-xl font-black text-gray-800 dark:text-white">{user?.email}</p>
          </div>
        </section>

        {/* Password Section */}
        <section className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 transition-colors">
          <h3 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-6">Keamanan Akun</h3>
          
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Password Baru</label>
              <input 
                required
                type="password" 
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Konfirmasi Password Baru</label>
              <input 
                required
                type="password" 
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all"
                placeholder="Ketik ulang password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : "Perbarui Password"}
            </button>
          </form>
        </section>

        <p className="text-center text-gray-400 dark:text-gray-600 text-sm font-medium">
          Aplikasi ini dilindungi oleh sistem keamanan Supabase Auth.
        </p>
      </motion.div>
    </div>
  );
};

export default Settings;
