import { useState, useEffect } from "react";
import useUserStore from "../store/userStore";
import Modal from "../components/Modal";
import UserCard from "../components/UserCard";
import UserSkeleton from "../components/UserSkeleton";

const Users = () => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const initialFormState = {
    customId: "",
    name: "",
    nickname: "",
    email: "",
    phone: "",
    company: { name: "", catchPhrase: "" },
    address: { street: "", city: "" }
  };
  const [formData, setFormData] = useState(initialFormState);

  const { users, isLoading, error, fetchUsers, addUser } = useUserStore();

  useEffect(() => {
    if (users.length === 0) {
      fetchUsers();
    }
  }, [users.length, fetchUsers]);

  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.name.trim() === "" || formData.email.trim() === "") {
      alert("Nama dan Email wajib diisi!");
      return;
    }

    // Jika customId kosong saat tambah, buat otomatis
    const finalData = {
      ...formData,
      customId: formData.customId.trim() !== "" 
        ? formData.customId 
        : `EMP-${(users.length + 1).toString().padStart(4, '0')}`
    };
    addUser(finalData);
    
    setIsModalOpen(false);
    setFormData(initialFormState);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4">
      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8 md:mb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Karyawan</h1>
          
          <button 
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 text-base md:text-lg"
            onClick={handleOpenAddModal}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Karyawan
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-[1.5rem] shadow-md border border-gray-300 dark:border-gray-700 flex items-center gap-3 transition-colors">
          <svg className="h-6 w-6 text-gray-400 ml-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari berdasarkan nama..."
            className="bg-transparent w-full py-2 outline-none text-gray-900 dark:text-white font-bold placeholder-gray-400 text-sm md:text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <UserSkeleton key={i} />)
        ) : (
          <>
            {filteredUsers.map((user) => (
              <UserCard 
                key={user.id} 
                user={user} 
              />
            ))}
            {!error && filteredUsers.length === 0 && (
              <div className="text-center py-16 md:py-32 bg-white/50 dark:bg-gray-900/50 rounded-[2rem] border-2 border-dashed border-gray-300 dark:border-gray-800 transition-colors">
                <p className="text-gray-500 dark:text-gray-500 text-lg md:text-2xl font-bold italic px-4">Tidak ada karyawan yang ditemukan.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Modal Form */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Tambah Karyawan Baru"
      >
        <form onSubmit={handleSave} className="space-y-6 max-h-[75vh] md:max-h-[70vh] overflow-y-auto px-1 pr-2 custom-scrollbar">
          {/* Section: Identitas */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">ID Karyawan</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                  value={formData.customId}
                  onChange={(e) => setFormData({...formData, customId: e.target.value})}
                  placeholder="Contoh: EMP-0001"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Nama Panggilan</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                  value={formData.nickname}
                  onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                  placeholder="Contoh: Budi"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Nama Lengkap *</label>
                <input
                  required
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Email *</label>
                <input
                  required
                  type="email"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Section: Kontak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Telepon</label>
              <input
                type="text"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          {/* Section: Bagian/Divisi */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] border-b border-blue-50 dark:border-blue-900/30 pb-2">Informasi Bagian</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Nama Bagian/Divisi</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                  value={formData.company.name}
                  onChange={(e) => setFormData({...formData, company: {...formData.company, name: e.target.value}})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Keterangan/Jabatan</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                  value={formData.company.catchPhrase}
                  onChange={(e) => setFormData({...formData, company: {...formData.company, catchPhrase: e.target.value}})}
                />
              </div>
            </div>
          </div>

          {/* Section: Alamat */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] border-b border-blue-50 dark:border-blue-900/30 pb-2">Domisili</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Jalan</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                  value={formData.address.street}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Kota</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                  value={formData.address.city}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 pb-2 sticky bottom-0 bg-white dark:bg-gray-800">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 text-sm md:text-base"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="flex-[2] px-6 py-4 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-xl transition-all active:scale-95 text-sm md:text-base"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
