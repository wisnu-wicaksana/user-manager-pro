import { useState, useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useUserStore from "../store/userStore";
import Modal from "../components/Modal";
import UserCard from "../components/UserCard";
import UserSkeleton from "../components/UserSkeleton";
import LoadingOverlay from "../components/LoadingOverlay";
import FormInput from "../components/FormInput";

/**
 * Aturan Validasi (Schema) menggunakan Zod.
 * Ini adalah 'kontrak' data: data hanya bisa disimpan jika memenuhi syarat ini.
 */
const employeeSchema = z.object({
  customId: z.string().min(1, "ID Karyawan wajib diisi"),
  name: z.string().min(3, "Nama minimal 3 karakter"),
  nickname: z.string().optional(),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().regex(/^[0-9+]*$/, "Nomor telepon hanya boleh angka dan +").optional().or(z.literal("")),
  avatar: z.string().optional(),
  company: z.object({
    name: z.string().optional(),
    catchPhrase: z.string().optional(),
  }),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
  }),
});

const Users = () => {
  // State lokal untuk UI
  const [search, setSearch] = useState("");           // Kata kunci pencarian
  const [selectedDivisi, setSelectedDivisi] = useState("Semua"); // Filter divisi
  const [isModalOpen, setIsModalOpen] = useState(false);         // Status modal tambah
  const [avatarPreview, setAvatarPreview] = useState(null);      // Preview foto sebelum upload
  const [selectedFile, setSelectedFile] = useState(null);       // File asli foto
  const [page, setPage] = useState(1);                // Halaman aktif
  const pageSize = 10;                                // Jumlah data per halaman
  const fileInputRef = useRef(null);                  // Referensi tombol upload tersembunyi

  // State dan Fungsi dari Zustand Store
  const { users, totalCount, isLoading, isSubmitting, fetchUsers, addUser, checkDuplicate, uploadAvatar } = useUserStore();

  // Inisialisasi React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema), // Menghubungkan validasi Zod
    defaultValues: {
      customId: "",
      name: "",
      nickname: "",
      email: "",
      phone: "",
      avatar: "",
      company: { name: "", catchPhrase: "" },
      address: { street: "", city: "" },
    },
  });

  /**
   * PENTING: Ambil data setiap kali Halaman, Pencarian, atau Divisi berubah.
   * Inilah yang membuat aplikasi terasa 'hidup' dan responsif.
   */
  useEffect(() => {
    fetchUsers(page, pageSize, search, selectedDivisi);
  }, [page, search, selectedDivisi, fetchUsers]);

  // Handler untuk membuka modal tambah karyawan
  const handleOpenAddModal = () => {
    reset();
    setAvatarPreview(null);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  // Handler untuk perubahan search agar kembali ke halaman 1
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Handler untuk perubahan divisi agar kembali ke halaman 1
  const handleDivisiChange = (e) => {
    setSelectedDivisi(e.target.value);
    setPage(1);
  };

  // Menyiapkan daftar divisi unik untuk dropdown filter
  const listDivisi = useMemo(() => {
    const divisiSet = new Set();
    users.forEach((user) => {
      if (user.company?.name) divisiSet.add(user.company.name);
    });
    return ["Semua", ...Array.from(divisiSet).sort()];
  }, [users]);

  // Menangani pemilihan file foto profil
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Batas 5MB
        toast.error("Maksimal 5MB");
        return;
      }
      setSelectedFile(file);
      // Membuat URL sementara untuk ditampilkan sebagai preview
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  /**
   * Alur Simpan Karyawan Baru:
   * 1. Cek duplikasi (Email/ID) di server.
   * 2. Jika ada foto, upload dulu ke Supabase Storage.
   * 3. Simpan seluruh data ke database.
   */
  const onSubmit = async (data) => {
    try {
      const duplicateError = await checkDuplicate(data.customId, data.email);
      if (duplicateError) {
        toast.error(duplicateError);
        return;
      }

      let finalAvatarUrl = "";
      if (selectedFile) {
        finalAvatarUrl = await uploadAvatar(selectedFile);
      }

      await addUser({ ...data, avatar: finalAvatarUrl });
      toast.success("Karyawan baru berhasil ditambahkan!");
      setIsModalOpen(false);
      reset();
    } catch (err) {
      toast.error(err.message || "Terjadi kesalahan.");
    }
  };

  // Logika download file CSV yang rapi untuk Excel
  const handleExportCSV = () => {
    if (users.length === 0) {
      toast.error("Tidak ada data untuk diekspor.");
      return;
    }

    const excelInstruction = "sep=,"; // Agar Excel tahu pembatasnya koma
    const headers = ["ID Karyawan,Nama Lengkap,Nama Panggilan,Email,Telepon,Divisi,Jabatan,Alamat,Kota"];
    const rows = users.map(u => {
      return [
        u.customId || "",
        u.name,
        u.nickname || "",
        u.email,
        u.phone || "",
        u.company?.name || "",
        u.company?.catchPhrase || "",
        u.address?.street || "",
        u.address?.city || ""
      ].map(val => `"${val}"`).join(",");
    });

    const csvContent = "\uFEFF" + excelInstruction + "\n" + headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `daftar_karyawan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Data berhasil diekspor ke CSV!");
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      {/* Overlay loading hanya saat ada proses tulis data (isSubmitting) */}
      <LoadingOverlay isOpen={isSubmitting} message="Sedang memproses..." />
      
      <div className="max-w-5xl mx-auto px-2 sm:px-4">
        {/* Header & Tombol Tambah/Export */}
        <div className="flex flex-col gap-6 mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Karyawan
            </h1>

            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                className="flex-1 sm:flex-none bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-6 py-3.5 rounded-2xl font-black border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm flex items-center justify-center gap-2 text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              
              <button
                className="flex-[2] sm:flex-none bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 text-base md:text-lg"
                onClick={handleOpenAddModal} 
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
                Tambah
              </button>
            </div>
          </div>

          {/* Bar Pencarian & Filter Divisi */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-grow bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-md border border-gray-300 dark:border-gray-700 flex items-center gap-3 transition-colors">
              <svg className="h-6 w-6 text-gray-400 ml-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari Nama, Email, atau ID..."
                className="bg-transparent w-full py-1 outline-none text-gray-900 dark:text-white font-bold placeholder-gray-400 text-sm md:text-base"
                value={search}
                onChange={handleSearchChange}
              />
            </div>

            <div className="w-full lg:w-64 bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-md border border-gray-300 dark:border-gray-700 flex items-center gap-3 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400 ml-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <select
                className="bg-transparent w-full outline-none text-gray-900 dark:text-white font-bold text-sm md:text-base appearance-none cursor-pointer"
                value={selectedDivisi}
                onChange={handleDivisiChange}
              >
                {listDivisi.map((divisi) => (
                  <option key={divisi} value={divisi} className="dark:bg-gray-800">
                    {divisi === "Semua" ? "Semua Bagian" : divisi}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Daftar Karyawan */}
        <div className="space-y-4 mb-10">
          {isLoading && users.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => <UserSkeleton key={i} />)
          ) : (
            <>
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Total {totalCount} Karyawan
                </p>
              </div>

              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}

              {!isLoading && users.length === 0 && (
                <div className="text-center py-20 bg-white/50 dark:bg-gray-900/50 rounded-[2rem] border-2 border-dashed border-gray-300 dark:border-gray-800 transition-colors">
                  <p className="text-gray-500 dark:text-gray-500 text-lg md:text-xl font-bold italic">
                    Data tidak ditemukan.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigasi Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pb-12">
            <button 
              disabled={page === 1}
              onClick={() => setPage(prev => prev - 1)}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-30 transition-all hover:bg-gray-50 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black shadow-lg text-sm md:text-base">
              {page} / {totalPages}
            </div>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(prev => prev + 1)}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-30 transition-all hover:bg-gray-50 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Modal Form Tambah Karyawan */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => !isSubmitting && setIsModalOpen(false)}
          title="Tambah Karyawan Baru"
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 max-h-[75vh] md:max-h-[70vh] overflow-y-auto px-1 pr-2 custom-scrollbar"
          >
            {/* Bagian Upload Foto */}
            <div className="flex flex-col items-center gap-4 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-md border-2 border-white dark:border-gray-700">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <button 
                type="button" 
                disabled={isSubmitting}
                onClick={() => fileInputRef.current.click()}
                className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline disabled:opacity-50"
              >
                Pilih Foto Profil
              </button>
            </div>

            {/* Input Data menggunakan komponen FormInput reusable */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="ID Karyawan *" name="customId" register={register} error={errors.customId} placeholder="EMP-0001" />
                <FormInput label="Nama Panggilan" name="nickname" register={register} error={errors.nickname} placeholder="Contoh: Budi" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Nama Lengkap *" name="name" register={register} error={errors.name} />
                <FormInput label="Email *" name="email" register={register} error={errors.email} type="email" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Telepon" name="phone" register={register} error={errors.phone} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] border-b border-blue-50 dark:border-blue-900/30 pb-2">Informasi Bagian</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Nama Bagian/Divisi" name="company.name" register={register} error={errors.company?.name} />
                <FormInput label="Keterangan/Jabatan" name="company.catchPhrase" register={register} error={errors.company?.catchPhrase} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] border-b border-blue-50 dark:border-blue-900/30 pb-2">Domisili</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Jalan" name="address.street" register={register} error={errors.address?.street} />
                <FormInput label="Kota" name="address.city" register={register} error={errors.address?.city} />
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-4 pt-6 pb-2 sticky bottom-0 bg-white dark:bg-gray-800 transition-colors">
              <button
                disabled={isSubmitting}
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 text-sm md:text-base disabled:opacity-50"
              >
                Batal
              </button>
              <button
                disabled={isSubmitting}
                type="submit"
                className="flex-[2] px-6 py-4 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? "Memproses..." : "Simpan Karyawan"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Users;
