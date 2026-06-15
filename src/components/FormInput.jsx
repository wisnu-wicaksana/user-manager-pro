/**
 * Tujuan: Komponen input yang bisa digunakan kembali (reusable).
 * Cara Kerja: Menerima props 'register' dari React Hook Form untuk mengelola state input.
 * Menampilkan pesan error secara otomatis jika validasi Zod gagal.
 */
const FormInput = ({ label, name, register, error, placeholder, type = "text", ...props }) => {
  return (
    <div className="space-y-1.5">
      {/* Label atas input */}
      <label className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
        {label}
      </label>
      
      {/* Input utama */}
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full bg-gray-50 dark:bg-gray-900 border ${
          error ? "border-red-500" : "border-gray-200"
        } dark:border-gray-700 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm`}
        {...register(name)} // Menghubungkan input dengan React Hook Form
        {...props}
      />

      {/* Pesan Error (hanya muncul jika ada error) */}
      {error && (
        <p className="text-red-500 text-[10px] font-bold ml-1">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default FormInput;
