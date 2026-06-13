import { useLayoutEffect } from "react";
import { Routes, Route } from "react-router-dom";
import useUserStore from "./store/userStore";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import NotFound from "./pages/NotFound";

function App() {
  const theme = useUserStore((state) => state.theme);

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
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetail />} />
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
