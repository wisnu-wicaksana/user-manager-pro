import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useUserStore from "../store/userStore";
import Modal from "../components/Modal";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, editUser, deleteUser } = useUserStore();
  
  const storeUser = users.find((u) => u.id === parseInt(id));
  
  const [fetchedUser, setFetchedUser] = useState(null);
  const [loading, setLoading] = useState(!storeUser);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State untuk form edit
  const [formData, setFormData] = useState({
    customId: "",
    name: "",
    nickname: "",
    email: "",
    phone: "",
    company: { name: "", catchPhrase: "" },
    address: { street: "", city: "" }
  });

  const user = storeUser || fetchedUser;

  useEffect(() => {
    if (!storeUser) {
      fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(data => {
          setFetchedUser({
            ...data,
            customId: `EMP-${data.id.toString().padStart(4, '0')}`,
            nickname: data.username
          });
          setLoading(false);
        })
        .catch(() => navigate("/404"));
    }
  }, [id, storeUser, navigate]);

  const openModal = () => {
    if (user) {
      setFormData({
        customId: user.customId || `EMP-${user.id.toString().padStart(4, '0')}`,
        name: user.name || "",
        nickname: user.nickname || "",
        email: user.email || "",
        phone: user.phone || "",
        company: { 
          name: user.company?.name || "", 
          catchPhrase: user.company?.catchPhrase || "" 
        },
        address: { 
          street: user.address?.street || "", 
          city: user.address?.city || "" 
        }
      });
      setIsModalOpen(true);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    editUser(parseInt(id), formData);
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus karyawan ini?")) {
      deleteUser(parseInt(id));
      navigate("/users");
    }
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <Link 
          to="/users" 
          className="inline-flex items-center text-blue-600 dark:text-blue-400 font-black hover:translate-x-[-4px] transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </Link>

        <div className="flex gap-2">
          <button 
            onClick={openModal}
            className="p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500 hover:text-white transition-all border border-yellow-100 dark:border-yellow-900/50"
            title="Edit Karyawan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            onClick={handleDelete}
            className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-100 dark:border-red-900/50"
            title="Hapus Karyawan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl shadow-blue-100 dark:shadow-none overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
        {/* Header Profile */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-28 sm:h-32 md:h-56 relative">
          <div className="absolute -bottom-12 sm:-bottom-16 left-6 md:left-16">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-white dark:bg-gray-700 rounded-[1.5rem] sm:rounded-3xl border-[6px] sm:border-8 border-white dark:border-gray-800 flex items-center justify-center text-4xl sm:text-5xl md:text-7xl font-black text-blue-600 dark:text-blue-400 shadow-xl rotate-3">
              {user.name.charAt(0)}
            </div>
          </div>
        </div>

        <div className="pt-16 sm:pt-20 pb-10 sm:pb-12 px-6 md:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div className="overflow-hidden">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight truncate">{user.name}</h1>
              <p className="text-lg sm:text-xl text-blue-600 dark:text-blue-400 font-bold italic opacity-80 truncate">
                {user.nickname || user.name.split(' ')[0]}
              </p>
            </div>
            <div className="flex gap-4">
              <a 
                href={`mailto:${user.email}`} 
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95 text-center text-sm sm:text-base"
              >
                Hubungi Sekarang
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
            {/* Kontak Info */}
            <div className="space-y-8">
              <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Informasi Kontak</h3>
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-center gap-4 sm:gap-6 group min-w-0">
                  <div className="w-12 h-12 shrink-0 bg-blue-50 dark:bg-gray-700 rounded-2xl text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-0.5 tracking-wider">ID Karyawan</p>
                    <p className="text-sm sm:text-lg text-gray-800 dark:text-gray-200 font-bold break-all">{user.customId || `EMP-${user.id.toString().padStart(4, '0')}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 group min-w-0">
                  <div className="w-12 h-12 shrink-0 bg-blue-50 dark:bg-gray-700 rounded-2xl text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-0.5 tracking-wider">Email</p>
                    <p className="text-sm sm:text-lg text-gray-800 dark:text-gray-200 font-bold break-all">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 group min-w-0">
                  <div className="w-12 h-12 shrink-0 bg-blue-50 dark:bg-gray-700 rounded-2xl text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-0.5 tracking-wider">Telepon</p>
                    <p className="text-sm sm:text-lg text-gray-800 dark:text-gray-200 font-bold break-words">{user.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian & Alamat */}
            <div className="space-y-8">
              <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Bagian & Lokasi</h3>
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-start gap-4 sm:gap-6 group min-w-0">
                  <div className="w-12 h-12 shrink-0 bg-blue-50 dark:bg-gray-700 rounded-2xl text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-0.5 tracking-wider">Bagian</p>
                    <p className="text-lg sm:text-xl text-gray-900 dark:text-white font-black truncate">{user.company?.name || 'Staff'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1 font-medium break-words">"{user.company?.catchPhrase || 'Karyawan Aktif'}"</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 sm:gap-6 group min-w-0">
                  <div className="w-12 h-12 shrink-0 bg-blue-50 dark:bg-gray-700 rounded-2xl text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-0.5 tracking-wider">Lokasi</p>
                    <p className="text-sm sm:text-lg text-gray-800 dark:text-gray-200 font-bold leading-relaxed break-words">
                      {user.address?.street}, {user.address?.suite}<br />
                      {user.address?.city}, {user.address?.zipcode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ubah Data Karyawan"
      >
        <form onSubmit={handleEdit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">ID Karyawan</label>
              <input
                type="text"
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                value={formData.customId}
                onChange={(e) => setFormData({...formData, customId: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nama Panggilan</label>
              <input
                type="text"
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                value={formData.nickname}
                onChange={(e) => setFormData({...formData, nickname: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap *</label>
              <input
                required
                type="text"
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email *</label>
              <input
                required
                type="email"
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Telepon</label>
              <input
                type="text"
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] border-b border-blue-50 dark:border-blue-900/30 pb-2">Informasi Bagian</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nama Bagian/Divisi</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                  value={formData.company.name}
                  onChange={(e) => setFormData({...formData, company: {...formData.company, name: e.target.value}})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Keterangan/Jabatan</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                  value={formData.company.catchPhrase}
                  onChange={(e) => setFormData({...formData, company: {...formData.company, catchPhrase: e.target.value}})}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 pb-2 sticky bottom-0 bg-white dark:bg-gray-800">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="flex-[2] px-6 py-4 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-xl transition-all active:scale-95"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserDetail;
