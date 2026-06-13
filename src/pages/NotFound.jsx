import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-9xl font-extrabold text-blue-600 opacity-20 dark:opacity-40 mb-[-2rem]">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 transition-colors">Ups! Halaman Tidak Ditemukan</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 transition-colors">
        Maaf, halaman yang Anda cari mungkin telah dihapus, berganti nama, atau tidak pernah ada.
      </p>
      <Link 
        to="/" 
        className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
};

export default NotFound;
