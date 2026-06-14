import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Berhasil keluar.");
      navigate("/");
      setIsOpen(false);
    } catch {
      toast.error("Gagal logout.");
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-lg md:text-xl font-black text-blue-600 dark:text-blue-400 hover:scale-105 transition-transform shrink-0">
            USER MANAGER
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex space-x-2">
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  isActive('/') 
                  ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Beranda
              </Link>
              {user && (
                <>
                  <Link 
                    to="/users" 
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      isActive('/users') 
                      ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/settings" 
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      isActive('/settings') 
                      ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Setelan
                  </Link>
                </>
              )}
            </div>
            
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 max-w-[100px] truncate">{user.email}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-5 py-2 rounded-xl text-sm font-black hover:bg-red-600 hover:text-white transition-all border border-red-100 dark:border-red-900/50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-black hover:bg-blue-700 shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-95"
                >
                  Login Admin
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-xl font-bold transition-all ${
                isActive('/') 
                ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Beranda
            </Link>
            {user ? (
              <>
                <Link 
                  to="/users" 
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-bold transition-all ${
                    isActive('/users') 
                    ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/settings" 
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-bold transition-all ${
                    isActive('/settings') 
                    ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Setelan Akun
                </Link>
                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">{user.email}</div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                >
                  Keluar (Logout)
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800"
              >
                Login Admin
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
