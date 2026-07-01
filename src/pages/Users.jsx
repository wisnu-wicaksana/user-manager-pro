import { useState, useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import useUserStore from "../store/userStore";
import Modal from "../components/Modal";
import UserCard from "../components/UserCard";
import UserSkeleton from "../components/UserSkeleton";
import LoadingOverlay from "../components/LoadingOverlay";
import FormInput from "../components/FormInput";

/**
 * Helper untuk mem-parsing data CSV mentah dengan aman.
 * Menangani pemisahan baris, koma, dan karakter kutip ganda.
 */
const parseCSV = (text) => {
  const lines = [];
  let row = [""];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);         // Status modal tambah
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // Status modal impor CSV
  const [parsedUsers, setParsedUsers] = useState([]);               // Data hasil parse CSV
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);   // Status tampil analitik dashboard
  const [avatarPreview, setAvatarPreview] = useState(null);      // Preview foto sebelum upload
  const [selectedFile, setSelectedFile] = useState(null);       // File asli foto
  const pageSize = 10;                                // Jumlah data per halaman
  const fileInputRef = useRef(null);                  // Referensi tombol upload tersembunyi

  // State dan Fungsi dari Zustand Store
  const { 
    users, 
    totalCount, 
    isLoading, 
    isSubmitting, 
    fetchUsers, 
    addUser, 
    checkDuplicate, 
    uploadAvatar,
    divisions,
    fetchDivisions,
    exportUsers,
    dashboardPage,
    dashboardSearch,
    dashboardDivisi,
    setDashboardPage,
    setDashboardSearch,
    setDashboardDivisi,
    checkBulkDuplicates,
    addUsersBulk,
    stats,
    fetchStats
  } = useUserStore();

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

  // Ambil daftar divisi dan statistik sekali saat komponen pertama kali dipasang
  useEffect(() => {
    fetchDivisions();
    fetchStats();
  }, [fetchDivisions, fetchStats]);

  /**
   * PENTING: Ambil data setiap kali Halaman, Pencarian, atau Divisi berubah.
   * Inilah yang membuat aplikasi terasa 'hidup' dan responsif.
   */
  useEffect(() => {
    fetchUsers(dashboardPage, pageSize, dashboardSearch, dashboardDivisi);
  }, [dashboardPage, dashboardSearch, dashboardDivisi, fetchUsers]);

  // Handler untuk membuka modal tambah karyawan
  const handleOpenAddModal = () => {
    reset();
    setAvatarPreview(null);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  // Handler untuk perubahan search agar kembali ke halaman 1
  const handleSearchChange = (e) => {
    setDashboardSearch(e.target.value);
    setDashboardPage(1);
  };

  // Handler untuk perubahan divisi agar kembali ke halaman 1
  const handleDivisiChange = (e) => {
    setDashboardDivisi(e.target.value);
    setDashboardPage(1);
  };

  // Menyiapkan daftar divisi unik untuk dropdown filter
  const listDivisi = useMemo(() => {
    return ["Semua", ...divisions];
  }, [divisions]);

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
      fetchDivisions(); // Memperbarui dropdown divisi jika divisi baru ditambahkan
    } catch (err) {
      toast.error(err.message || "Terjadi kesalahan.");
    }
  };

  // Logika download file CSV yang rapi untuk Excel (seluruh data terfilter, bukan hanya halaman saat ini)
  const handleExportCSV = async () => {
    const toastId = toast.loading("Menyiapkan data ekspor...");
    try {
      const dataToExport = await exportUsers(dashboardSearch, dashboardDivisi);

      if (!dataToExport || dataToExport.length === 0) {
        toast.error("Tidak ada data untuk diekspor.", { id: toastId });
        return;
      }

      const excelInstruction = "sep=,"; // Agar Excel tahu pembatasnya koma
      const headers = ["ID Karyawan,Nama Lengkap,Nama Panggilan,Email,Telepon,Divisi,Jabatan,Alamat,Kota"];
      const rows = dataToExport.map(u => {
        return [
          u.custom_id || "",
          u.name || "",
          u.nickname || "",
          u.email || "",
          u.phone || "",
          u.divisi || "",
          u.jabatan || "",
          u.jalan || "",
          u.kota || ""
        ].map(val => `"${val.replace(/"/g, '""')}"`).join(","); // Escape tanda kutip ganda
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
      
      toast.success("Data berhasil diekspor ke CSV!", { id: toastId });
    } catch (err) {
      toast.error("Gagal mengekspor data: " + err.message, { id: toastId });
    }
  };

  // Mengunduh berkas template CSV untuk impor data karyawan
  const handleDownloadTemplate = () => {
    const headers = "ID Karyawan,Nama Lengkap,Nama Panggilan,Email,Telepon,Divisi,Jabatan,Alamat,Kota\n";
    const sampleRow = "EMP-9999,Budi Raharjo,Budi,budi@perusahaan.com,08123456789,IT,Senior Engineer,Jl. Sudirman No. 10,Jakarta\n";
    const csvContent = "\uFEFF" + "sep=,\n" + headers + sampleRow;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_import_karyawan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Membaca dan menvalidasi berkas CSV yang diunggah
  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Format berkas harus .csv");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const parsedData = parseCSV(text);
      if (parsedData.length <= 1) {
        toast.error("File CSV kosong atau tidak valid.");
        return;
      }

      const headers = parsedData[0].map(h => h.trim());
      
      // Map header index
      const idIdx = headers.indexOf("ID Karyawan");
      const nameIdx = headers.indexOf("Nama Lengkap");
      const nicknameIdx = headers.indexOf("Nama Panggilan");
      const emailIdx = headers.indexOf("Email");
      const phoneIdx = headers.indexOf("Telepon");
      const divisiIdx = headers.indexOf("Divisi");
      const jabatanIdx = headers.indexOf("Jabatan");
      const alamatIdx = headers.indexOf("Alamat");
      const kotaIdx = headers.indexOf("Kota");

      if (idIdx === -1 || nameIdx === -1 || emailIdx === -1) {
        toast.error("Format CSV salah. Kolom wajib: ID Karyawan, Nama Lengkap, Email");
        return;
      }

      const rows = parsedData.slice(1);
      const employees = [];
      const customIds = [];
      const emails = [];

      rows.forEach((row, index) => {
        // Lewati baris kosong
        if (row.length === 1 && row[0] === "") return;

        const rowNum = index + 2; 
        const customId = row[idIdx]?.trim() || "";
        const name = row[nameIdx]?.trim() || "";
        const nickname = nicknameIdx !== -1 ? row[nicknameIdx]?.trim() : "";
        const email = row[emailIdx]?.trim() || "";
        const phone = phoneIdx !== -1 ? row[phoneIdx]?.trim() : "";
        const divisi = divisiIdx !== -1 ? row[divisiIdx]?.trim() : "";
        const jabatan = jabatanIdx !== -1 ? row[jabatanIdx]?.trim() : "";
        const alamat = alamatIdx !== -1 ? row[alamatIdx]?.trim() : "";
        const kota = kotaIdx !== -1 ? row[kotaIdx]?.trim() : "";

        // Validasi format dasar di sisi klien
        let rowError = null;
        if (!customId) {
          rowError = "ID Karyawan wajib diisi.";
        } else if (!name) {
          rowError = "Nama Lengkap wajib diisi.";
        } else if (!email) {
          rowError = "Email wajib diisi.";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          rowError = `Format email '${email}' tidak valid.`;
        } else if (phone && !/^[0-9+]*$/.test(phone)) {
          rowError = `Format nomor telepon '${phone}' hanya boleh angka dan +.`;
        }

        const employeeObj = {
          rowNum,
          customId,
          name,
          nickname,
          email,
          phone,
          company: { name: divisi, catchPhrase: jabatan },
          address: { street: alamat, city: kota },
          error: rowError
        };

        employees.push(employeeObj);
        if (!rowError) {
          customIds.push(customId);
          emails.push(email);
        }
      });

      if (employees.length === 0) {
        toast.error("Tidak ada data karyawan yang ditemukan.");
        return;
      }

      // Deteksi duplikasi di dalam file CSV itu sendiri
      const localIdSet = new Set();
      const localEmailSet = new Set();
      employees.forEach(emp => {
        if (emp.error) return;
        if (localIdSet.has(emp.customId)) {
          emp.error = `ID Karyawan '${emp.customId}' duplikat di dalam berkas CSV ini.`;
        } else {
          localIdSet.add(emp.customId);
        }

        if (localEmailSet.has(emp.email)) {
          emp.error = `Email '${emp.email}' duplikat di dalam berkas CSV ini.`;
        } else {
          localEmailSet.add(emp.email);
        }
      });

      // Deteksi duplikasi terhadap database
      const toastValId = toast.loading("Memvalidasi data terhadap database...");
      try {
        const { duplicateIds, duplicateEmails } = await checkBulkDuplicates(customIds, emails);

        employees.forEach(emp => {
          if (emp.error) return;
          if (duplicateIds.includes(emp.customId)) {
            emp.error = `ID '${emp.customId}' sudah digunakan di database.`;
          } else if (duplicateEmails.includes(emp.email)) {
            emp.error = `Email '${emp.email}' sudah terdaftar di database.`;
          }
        });
        toast.success("Validasi selesai!", { id: toastValId });
      } catch (err) {
        toast.error("Gagal memvalidasi duplikasi: " + err.message, { id: toastValId });
      }

      setParsedUsers(employees);
    };
    reader.readAsText(file);
  };

  // Mengirim data CSV yang valid ke database secara massal
  const handleImportSubmit = async () => {
    const validUsers = parsedUsers.filter(u => !u.error);
    const totalErrors = parsedUsers.filter(u => u.error).length;

    if (validUsers.length === 0) {
      toast.error("Tidak ada data karyawan valid untuk diimpor.");
      return;
    }

    if (totalErrors > 0) {
      toast.error(`Ada ${totalErrors} baris bermasalah. Perbaiki berkas CSV Anda terlebih dahulu.`);
      return;
    }

    try {
      await addUsersBulk(validUsers);
      toast.success(`${validUsers.length} karyawan berhasil diimpor!`);
      setIsImportModalOpen(false);
      setParsedUsers([]);
    } catch (err) {
      toast.error(err.message || "Gagal mengimpor karyawan.");
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const divisionsStats = stats?.divisionsCount || {};
  const citiesStats = stats?.citiesCount || {};

  const totalRegisteredDivisions = Object.keys(divisionsStats).length;
  const totalRegisteredCities = Object.keys(citiesStats).length;

  const maxDivCount = Math.max(...Object.values(divisionsStats), 1);
  const maxCityCount = Math.max(...Object.values(citiesStats), 1);

  return (
    <>
      {/* Overlay loading hanya saat ada proses tulis data (isSubmitting) */}
      <LoadingOverlay isOpen={isSubmitting} message="Sedang memproses..." />
      
      <div className="max-w-5xl mx-auto px-2 sm:px-4">
        {/* Header & Tombol Tambah/Export */}
        <div className="flex flex-col gap-6 mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                Karyawan
              </h1>
              <button
                type="button"
                onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
                className={`p-2.5 rounded-2xl border transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 font-black text-[10px] uppercase tracking-wider ${
                  isAnalyticsOpen 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50 shadow-sm' 
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                }`}
                title={isAnalyticsOpen ? "Sembunyikan Analitik" : "Tampilkan Analitik"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <span className="hidden sm:inline">Analitik</span>
              </button>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
              <button
                onClick={handleExportCSV}
                className="flex-1 sm:flex-none bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-5 py-3.5 rounded-2xl font-black border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>

              <button
                onClick={() => {
                  setParsedUsers([]);
                  setIsImportModalOpen(true);
                }}
                className="flex-1 sm:flex-none bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-5 py-3.5 rounded-2xl font-black border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import
              </button>
              
              <button
                className="flex-[2] sm:flex-none bg-blue-600 text-white px-6 sm:px-8 py-3.5 rounded-2xl font-black hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 text-sm md:text-base"
                onClick={handleOpenAddModal} 
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                value={dashboardSearch}
                onChange={handleSearchChange}
              />
            </div>

            <div className="w-full lg:w-64 bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-md border border-gray-300 dark:border-gray-700 flex items-center gap-3 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400 ml-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <select
                className="bg-transparent w-full outline-none text-gray-900 dark:text-white font-bold text-sm md:text-base appearance-none cursor-pointer"
                value={dashboardDivisi}
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

        {/* Analitik Section */}
        <AnimatePresence>
          {isAnalyticsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 32 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl p-6 md:p-10 border border-gray-150 dark:border-gray-800 transition-colors space-y-8">
                {/* Row Indikator KPI */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50/50 dark:bg-blue-950/10 p-6 rounded-3xl border border-blue-50 dark:border-blue-900/20 text-center">
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Total Karyawan</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{totalCount}</p>
                  </div>
                  <div className="bg-green-50/50 dark:bg-green-950/10 p-6 rounded-3xl border border-green-50 dark:border-green-900/20 text-center">
                    <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">Divisi Terdaftar</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{totalRegisteredDivisions}</p>
                  </div>
                  <div className="bg-yellow-50/50 dark:bg-yellow-950/10 p-6 rounded-3xl border border-yellow-50 dark:border-yellow-900/20 text-center">
                    <p className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-1">Sebaran Kota</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{totalRegisteredCities}</p>
                  </div>
                </div>

                {/* Progress Bars Distribusi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {/* Distribusi Divisi */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Distribusi Divisi</h4>
                    {Object.keys(divisionsStats).length === 0 ? (
                      <p className="text-sm font-bold text-gray-400 italic py-2">Belum ada data divisi.</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(divisionsStats)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([div, count]) => {
                            const percentage = Math.round((count / totalCount) * 100);
                            const barWidth = (count / maxDivCount) * 100;
                            return (
                              <div key={div} className="space-y-1">
                                <div className="flex justify-between items-center text-xs font-bold px-1 text-gray-700 dark:text-gray-300">
                                  <span>{div}</span>
                                  <span>{count} Orang ({percentage}%)</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barWidth}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Distribusi Kota */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Sebaran Domisili (Kota)</h4>
                    {Object.keys(citiesStats).length === 0 ? (
                      <p className="text-sm font-bold text-gray-400 italic py-2">Belum ada data domisili.</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(citiesStats)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([city, count]) => {
                            const percentage = Math.round((count / totalCount) * 100);
                            const barWidth = (count / maxCityCount) * 100;
                            return (
                              <div key={city} className="space-y-1">
                                <div className="flex justify-between items-center text-xs font-bold px-1 text-gray-700 dark:text-gray-300">
                                  <span>{city}</span>
                                  <span>{count} Orang ({percentage}%)</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barWidth}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              disabled={dashboardPage === 1}
              onClick={() => setDashboardPage(dashboardPage - 1)}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-30 transition-all hover:bg-gray-50 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black shadow-lg text-sm md:text-base">
              {dashboardPage} / {totalPages}
            </div>
            <button 
              disabled={dashboardPage === totalPages}
              onClick={() => setDashboardPage(dashboardPage + 1)}
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

        {/* Modal Impor CSV */}
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => !isSubmitting && setIsImportModalOpen(false)}
          title="Impor Karyawan via CSV"
        >
          <div className="space-y-6 max-h-[75vh] md:max-h-[70vh] overflow-y-auto px-1 pr-2 custom-scrollbar">
            {/* Bagian Petunjuk */}
            <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30 text-sm text-blue-800 dark:text-blue-200">
              <h4 className="font-black mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Petunjuk Impor Data
              </h4>
              <p className="mb-3 font-medium text-xs leading-relaxed">
                Unggah berkas CSV berisi data karyawan dengan struktur kolom yang sesuai. Unduh template di bawah untuk memastikan struktur format tepat.
              </p>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="font-black text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Unduh Template CSV
              </button>
            </div>

            {/* Zona Upload File */}
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-100/50 dark:hover:bg-gray-900 transition-colors relative group">
              <input
                type="file"
                accept=".csv"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleCSVUpload}
                disabled={isSubmitting}
              />
              <div className="text-center pointer-events-none space-y-3">
                <div className="w-14 h-14 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800 dark:text-white">Pilih atau Seret Berkas CSV</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Maksimal 5MB (Format .csv)</p>
                </div>
              </div>
            </div>

            {/* Area Pratinjau Tabel */}
            {parsedUsers.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Pratinjau Data Karyawan</h4>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-500">
                    {parsedUsers.filter(u => u.error).length} Bermasalah
                  </span>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs font-bold">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[9px]">
                        <th className="p-3">Baris</th>
                        <th className="p-3">ID Karyawan</th>
                        <th className="p-3">Nama</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Keterangan / Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                      {parsedUsers.map((emp, i) => (
                        <tr 
                          key={i} 
                          className={`text-gray-700 dark:text-gray-300 ${
                            emp.error 
                              ? 'bg-red-50/50 dark:bg-red-950/10' 
                              : 'bg-white dark:bg-gray-800/20 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                          }`}
                        >
                          <td className="p-3 text-gray-400">{emp.rowNum}</td>
                          <td className="p-3">{emp.customId}</td>
                          <td className="p-3 truncate max-w-[120px]">{emp.name}</td>
                          <td className="p-3 truncate max-w-[150px]">{emp.email}</td>
                          <td className="p-3">
                            {emp.error ? (
                              <span className="inline-block px-2.5 py-1 text-[9px] font-black uppercase bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full">
                                {emp.error}
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-1 text-[9px] font-black uppercase bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full">
                                Siap Diimpor
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex gap-4 pt-6 pb-2 sticky bottom-0 bg-white dark:bg-gray-800 transition-colors">
              <button
                disabled={isSubmitting}
                type="button"
                onClick={() => {
                  setParsedUsers([]);
                  setIsImportModalOpen(false);
                }}
                className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 text-sm md:text-base disabled:opacity-50"
              >
                Batal
              </button>
              <button
                disabled={isSubmitting || parsedUsers.length === 0 || parsedUsers.some(u => u.error)}
                type="button"
                onClick={handleImportSubmit}
                className="flex-[2] px-6 py-4 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 shadow-xl disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Mengimpor..." : "Impor Sekarang"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Users;
