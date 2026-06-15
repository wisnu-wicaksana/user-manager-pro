# 🚀 User Manager Pro

![User Manager Pro Banner](https://via.placeholder.com/1200x400/2563EB/FFFFFF?text=User+Manager+Pro+-+Enterprise+Employee+Management)

**User Manager Pro** adalah aplikasi manajemen karyawan skala perusahaan (*Enterprise-grade*) yang dibangun dengan teknologi frontend modern. Aplikasi ini dirancang dengan fokus pada keamanan tingkat tinggi, pengalaman pengguna (UX) yang premium, dan performa yang optimal untuk menangani ribuan data.

---

## ✨ Fitur Utama

- **🛡️ Autentikasi Admin yang Aman**: Terintegrasi penuh dengan Supabase Auth untuk melindungi data internal.
- **☁️ Database Cloud Real-time**: Menyimpan data karyawan dan foto profil dengan aman menggunakan Supabase Database & Storage.
- **⚡️ Performa Tinggi**: Menggunakan **Zustand** untuk *state management* dan sistem **Pagination** berbasis server untuk memuat data tanpa lag.
- **🎨 Animasi & UI Premium**: Antarmuka *Mobile-First* yang dipercantik dengan Tailwind CSS dan transisi halus dari Framer Motion.
- **🌗 Mode Gelap & Terang**: Tampilan yang dapat menyesuaikan preferensi sistem pengguna atau dikontrol secara manual.
- **✅ Validasi Formulir Ketat**: Mencegah data ganda dan error input menggunakan kombinasi maut **React Hook Form** dan **Zod**.
- **📊 Export Data Pintar**: Admin dapat mengunduh daftar karyawan secara rapi ke format Excel/CSV hanya dengan satu klik.

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini menggunakan perpaduan (*stack*) teknologi terbaik di industri:

| Kategori | Teknologi | Tujuan |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) | Rendering yang cepat dan *development server* super kencang. |
| **Styling** | [Tailwind CSS v3](https://tailwindcss.com/) | *Utility-first CSS* untuk desain yang responsif dan elegan. |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) | Manajemen state global yang ringan tanpa *boilerplate* rumit. |
| **Backend & Auth** | [Supabase](https://supabase.com/) | Database PostgreSQL, Storage, dan Autentikasi *out-of-the-box*. |
| **Validasi Form** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Formulir dengan performa tinggi dan validasi skema yang ketat. |
| **Animasi** | [Framer Motion](https://www.framer.com/motion/) | Transisi halaman dan interaksi UI level atas. |
| **Routing** | [React Router v7](https://reactrouter.com/) | Penanganan *Single Page Application (SPA)*. |

---

## 🚀 Panduan Instalasi Lokal

Jika Anda ingin menjalankan aplikasi ini di komputer lokal Anda, ikuti langkah-langkah berikut:

### 1. Kloning Repositori
```bash
git clone https://github.com/wisnu-wicaksana/user-manager-pro.git
cd user-manager-pro
```

### 2. Instal Dependensi
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/).
```bash
npm install
```

### 3. Konfigurasi Lingkungan (Environment)
Buat file baru bernama `.env` di root folder proyek, lalu salin isi dari file `.env.example`:
```env
VITE_SUPABASE_URL=URL_PROYEK_SUPABASE_ANDA
VITE_SUPABASE_ANON_KEY=KUNCI_ANON_SUPABASE_ANDA
```
*(Anda harus membuat proyek di Supabase untuk mendapatkan kunci ini).*

### 4. Jalankan Aplikasi
```bash
npm run dev
```
Buka browser Anda di `http://localhost:5173`.

---

## 🔒 Setup Supabase (Wajib)

Agar aplikasi dapat menyimpan data dengan aman, jalankan *query* SQL berikut di **SQL Editor** Supabase Anda:

```sql
-- Buat Tabel Karyawan
create table karyawan (
  id bigint primary key generated always as identity,
  custom_id text unique,
  name text not null,
  nickname text,
  email text unique not null,
  phone text,
  avatar text,
  divisi text,
  jabatan text,
  jalan text,
  kota text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Aktifkan Row Level Security (RLS)
alter table karyawan enable row level security;

-- Izinkan Hanya Admin yang Login untuk Akses
create policy "Admin Full Access" on karyawan for all to authenticated using (true) with check (true);
```
*(Pastikan Anda juga membuat Storage Bucket bernama `avatars` dan mengaturnya ke Public).*

---

## 📄 Lisensi

Proyek ini menggunakan lisensi [MIT](LICENSE). Silakan gunakan, pelajari, dan modifikasi kode ini sesuka hati Anda.

---
*Dibuat dengan ❤️ untuk sistem manajemen SDM yang lebih baik.*
