import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import useUserStore from "../store/userStore";
import Modal from "../components/Modal";
import LoadingOverlay from "../components/LoadingOverlay";

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

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, editUser, deleteUser, uploadAvatar, isLoading: storeLoading } = useUserStore();
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
  });

  // Ambil data user saat ID atau store users berubah
  useEffect(() => {
    let isMounted = true;

    const fetchSingleUser = async () => {
      // Prioritas 1: Cari di store lokal
      const storeUser = users.find((u) => String(u.id) === id);
      
      if (storeUser) {
        if (isMounted) {
          setUser(storeUser);
          setLocalLoading(false);
        }
        return;
      }

      // Prioritas 2: Ambil dari Supabase (jika refresh halaman)
      if (isMounted) setLocalLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('karyawan')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data && isMounted) {
          const mappedData = {
            id: data.id,
            customId: data.custom_id,
            name: data.name,
            nickname: data.nickname,
            email: data.email,
            phone: data.phone,
            avatar: data.avatar,
            company: { name: data.divisi, catchPhrase: data.jabatan },
            address: { street: data.jalan, city: data.kota }
          };
          setUser(mappedData);
        }
      } catch (error) {
        console.error("Gagal muat detail:", error.message);
        if (isMounted) navigate("/404");
      } finally {
        if (isMounted) setLocalLoading(false);
      }
    };

    fetchSingleUser();

    return () => { isMounted = false; };
  }, [id, users, navigate]);

  const openEditModal = () => {
    if (user) {
      setValue("customId", user.customId || "");
      setValue("name", user.name || "");
      setValue("nickname", user.nickname || "");
      setValue("email", user.email || "");
      setValue("phone", user.phone || "");
      setValue("avatar", user.avatar || "");
      setValue("company.name", user.company?.name || "");
      setValue("company.catchPhrase", user.company?.catchPhrase || "");
      setValue("address.street", user.address?.street || "");
      setValue("address.city", user.address?.city || "");
      
      setAvatarPreview(user.avatar || null);
      setSelectedFile(null);
      setIsEditModalOpen(true);
    }
  };

  const onEditSubmit = async (data) => {
    try {
      let finalAvatarUrl = user.avatar;
      if (selectedFile) {
        finalAvatarUrl = await uploadAvatar(selectedFile);
      }
      await editUser(user.id, { ...data, avatar: finalAvatarUrl });
      toast.success("Data berhasil diperbarui!");
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Gagal memperbarui data.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Maksimal 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(user.id);
      toast.success("Karyawan dihapus.");
      navigate("/users");
    } catch {
      toast.error("Gagal menghapus.");
    }
  };

  if (localLoading && !user) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <LoadingOverlay isOpen={storeLoading} message="Sedang memproses..." />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto px-2 sm:px-4"
      >
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
              onClick={openEditModal}
              className="p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500 hover:text-white transition-all border border-yellow-100 dark:border-yellow-900/50"
              title="Edit Karyawan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-100 dark:border-red-900/50"
              title="Hapus Karyawan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl shadow-blue-100 dark:shadow-none overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors text-gray-900 dark:text-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-32 sm:h-40 md:h-64 relative">
            <div className="absolute -bottom-16 left-8 md:left-16">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 0 }}
                className="w-32 h-32 md:w-48 md:h-48 bg-white dark:bg-gray-700 rounded-[2rem] md:rounded-[3rem] border-8 border-white dark:border-gray-800 overflow-hidden shadow-2xl rotate-3 transition-transform"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl md:text-7xl font-black text-blue-600 dark:text-blue-400">
                    {user.name.charAt(0)}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          <div className="pt-20 md:pt-24 pb-10 sm:pb-12 px-8 md:px-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div className="overflow-hidden">
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter truncate">{user.name}</h1>
                <p className="text-xl md:text-2xl text-blue-600 dark:text-blue-400 font-bold italic opacity-80 truncate">
                  {user.nickname || user.name.split(' ')[0]}
                </p>
              </div>
              <div className="flex gap-4 shrink-0">
                <a 
                  href={`mailto:${user.email}`} 
                  className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95 text-center"
                >
                  Kirim Email
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 border-t border-gray-50 dark:border-gray-700 pt-12">
              <div className="space-y-10">
                <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Informasi Kontak</h3>
                <div className="space-y-8">
                  <div className="flex items-center gap-6 group">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-gray-700 rounded-2xl text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1 tracking-widest">ID Karyawan</p>
                      <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 font-black">{user.customId || `EMP-${user.id.toString().padStart(4, '0')}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 group">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-gray-700 rounded-2xl text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1 tracking-widest">Email Resmi</p>
                      <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 font-bold break-all">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 group">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-gray-700 rounded-2xl text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1 tracking-widest">Nomor HP</p>
                      <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 font-bold">{user.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Karir & Domisili</h3>
                <div className="space-y-8">
                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-gray-700 rounded-2xl text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1 tracking-widest">Divisi Utama</p>
                      <p className="text-xl md:text-2xl text-gray-950 dark:text-white font-black">{user.company?.name || 'Staff'}</p>
                      <p className="text-md text-gray-500 dark:text-gray-400 italic mt-1 font-medium break-words">"{user.company?.catchPhrase || 'Karyawan Aktif'}"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-gray-700 rounded-2xl text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1 tracking-widest">Alamat Domisili</p>
                      <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 font-bold leading-relaxed break-words">
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

        <Modal 
          isOpen={isEditModalOpen} 
          onClose={() => !storeLoading && setIsEditModalOpen(false)} 
          title="Ubah Data Karyawan"
        >
          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pr-2 custom-scrollbar">
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
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
                ref={fileInputRef}
              />
              <button 
                type="button" 
                disabled={storeLoading}
                onClick={() => fileInputRef.current.click()}
                className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline disabled:opacity-50"
              >
                Ganti Foto Profil
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">ID Karyawan</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                  {...register("customId")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nama Panggilan</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                  {...register("nickname")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap *</label>
                <input
                  type="text"
                  className={`w-full bg-gray-50 dark:bg-gray-900 border ${errors.name ? 'border-red-500' : 'border-gray-200'} dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm`}
                  {...register("name")}
                />
                {errors.name && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email *</label>
                <input
                  type="email"
                  className={`w-full bg-gray-50 dark:bg-gray-900 border ${errors.email ? 'border-red-500' : 'border-gray-200'} dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm`}
                  {...register("email")}
                />
                {errors.email && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Telepon</label>
                <input
                  type="text"
                  className={`w-full bg-gray-50 dark:bg-gray-900 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm`}
                  {...register("phone")}
                />
                {errors.phone && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.phone.message}</p>}
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
                    {...register("company.name")}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Keterangan/Jabatan</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                    {...register("company.catchPhrase")}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] border-b border-blue-50 dark:border-blue-900/30 pb-2">Domisili</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Jalan</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                    {...register("address.street")}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Kota</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm"
                    {...register("address.city")}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 pb-2 sticky bottom-0 bg-white dark:bg-gray-800 transition-colors">
              <button 
                type="button"
                disabled={storeLoading}
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={storeLoading}
                className="flex-[2] px-6 py-4 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {storeLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => !storeLoading && setIsDeleteModalOpen(false)}
          title="Konfirmasi Hapus"
        >
          <div className="text-center py-2">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Hapus Karyawan?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium px-4">
              Tindakan ini tidak dapat dibatalkan. Seluruh data <span className="font-bold text-gray-900 dark:text-white">{user.name}</span> akan dihapus permanen.
            </p>
            <div className="flex gap-4">
              <button 
                disabled={storeLoading}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
              >
                Batal
              </button>
              <button 
                disabled={storeLoading}
                onClick={confirmDelete}
                className="flex-1 px-6 py-4 rounded-2xl font-black bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
              >
                {storeLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </>
  );
};

export default UserDetail;
