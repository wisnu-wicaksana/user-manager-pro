import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

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
              <Link 
                to="/users" 
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  isActive('/users') 
                  ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Pengguna
              </Link>
            </div>
            
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <ThemeToggle />
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
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 space-y-2 animate-in slide-in-from-top duration-200">
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
            <Link 
              to="/users" 
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-xl font-bold transition-all ${
                isActive('/users') 
                ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Pengguna
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
