import { Link } from "react-router-dom";
import useUserStore from "../store/userStore";

const Home = () => {
  const { users } = useUserStore();

  return (
    <div className="space-y-12 md:space-y-24 pb-12 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-10 md:p-20 text-center transition-colors">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 md:w-96 md:h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full translate-x-1/3 translate-y-1/3 opacity-30"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs md:text-sm font-black tracking-wider text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/30 rounded-full">
            v1.2 Mobile-First Ready
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
            Kelola Tim Anda dengan <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-100 dark:decoration-blue-900/50">Lebih Cerdas</span>
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed font-medium max-w-2xl mx-auto">
            Platform manajemen pengguna yang sederhana, cepat, dan efisien. Pantau, edit, dan organisir data tim Anda dalam satu tempat terpusat.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0">
            <Link 
              to="/users" 
              className="bg-blue-600 text-white px-8 md:px-12 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 dark:shadow-none transition-all transform hover:-translate-y-1 active:scale-95 text-center"
            >
              Mulai Sekarang
            </Link>
            <a 
              href="#features" 
              className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-8 md:px-12 py-4 rounded-2xl font-black text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 shadow-sm text-center"
            >
              Pelajari Fitur
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 px-2 sm:px-0">
        {[
          { label: "Total Pengguna", value: users.length, sub: "Terdaftar" },
          { label: "Status Sistem", value: "Aktif", sub: "Online", pulse: true },
          { label: "Kecepatan API", value: "< 200ms", sub: "Laten Rendah" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center transition-all hover:shadow-lg">
            <p className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">{stat.label}</p>
            <div className="flex justify-center items-center gap-3 mb-1">
              {stat.pulse && <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>}
              <h3 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</h3>
            </div>
            <p className="text-xs font-bold text-blue-600/60 dark:text-blue-400/60">{stat.sub}</p>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section id="features" className="py-8 px-2">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-2xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Kenapa Memilih Kami?</h2>
          <p className="text-sm md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">Kami membangun alat yang Anda butuhkan tanpa kerumitan yang tidak perlu.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12">
          {[
            {
              title: "Manajemen Instan",
              desc: "Tambah, edit, dan hapus pengguna dalam hitungan detik dengan antarmuka yang sangat responsif.",
              icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            },
            {
              title: "Pencarian Cerdas",
              desc: "Temukan siapa pun dalam daftar ribuan pengguna secara instan dengan fitur filter pencarian real-time kami.",
              icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            },
            {
              title: "Integrasi Global",
              desc: "Data Anda aman dan sinkron di seluruh aplikasi berkat integrasi state management global yang canggih.",
              icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
            }
          ].map((feature, i) => (
            <div key={i} className="group p-8 md:p-12 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-2xl relative">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 dark:bg-blue-700 rounded-[3rem] p-10 sm:p-16 md:p-24 text-center text-white shadow-2xl shadow-blue-200 dark:shadow-none overflow-hidden relative mx-2 sm:mx-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">Siap Mengatur Tim Anda?</h2>
          <p className="text-blue-100 text-base md:text-xl mb-12 font-medium opacity-90">
            Bergabunglah dengan ribuan manajer lainnya yang telah beralih ke cara yang lebih efisien dan modern.
          </p>
          <Link 
            to="/users" 
            className="inline-block bg-white text-blue-600 px-10 md:px-14 py-4 md:py-6 rounded-2xl font-black text-lg md:text-xl hover:bg-blue-50 transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
          >
            Buka Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
