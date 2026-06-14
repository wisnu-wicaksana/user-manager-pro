import { useLayoutEffect, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useUserStore from "./store/userStore";
import useAuthStore from "./store/authStore";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Settings from "./pages/Settings";

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const theme = useUserStore((state) => state.theme);
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useLayoutEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 font-bold rounded-2xl shadow-xl',
          duration: 3000,
        }}
      />
      
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/users/:id" element={
            <ProtectedRoute>
              <UserDetail />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-800 py-10 transition-colors">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p className="font-bold mb-2">User Manager Pro &copy; 2026</p>
          <p className="text-xs">
            Built with React, Tailwind CSS, Zustand, and ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
