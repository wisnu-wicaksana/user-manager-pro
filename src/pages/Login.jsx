import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import useAuthStore from "../store/authStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login berhasil! Selamat datang Admin.");
      navigate("/users");
    } catch (error) {
      toast.error(error.message || "Gagal login. Periksa email dan password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 md:mt-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 transition-colors"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200 dark:shadow-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Admin Login</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Masuk untuk mengelola data karyawan</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Alamat Email</label>
            <input 
              required
              type="email" 
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all"
              placeholder="admin@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Password</label>
            <input 
              required
              type="password" 
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Masuk Sekarang"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-50 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
            Belum punya akun? <br className="md:hidden" />
            <span className="text-blue-600 dark:text-blue-400 font-bold">Hubungi Super Admin</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
