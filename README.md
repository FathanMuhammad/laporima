# LAPORIMA (Lapor Ima)

Sistem Informasi Manajemen Pengaduan Terpadu untuk memfasilitasi pelaporan warga dan penugasan tim lapangan (Tim Ima Mahdiah · DPRD DKI Jakarta · Dapil 10). Aplikasi ini berfungsi untuk mencatat, melacak, dan mengelola aduan masyarakat dari awal masuk hingga selesai, termasuk pencatatan koordinat (check-in GPS), eskalasi ke dinas, hingga dokumentasi ke media sosial.

## Teknologi yang Digunakan

Proyek ini dibangun menggunakan ekosistem modern JavaScript dengan fokus pada kecepatan, kemudahan pengembangan, dan fungsionalitas.

### Core Stack
* **[React](https://react.dev/) (v19)**: Library utama untuk membangun antarmuka pengguna (User Interface).
* **[Vite](https://vitejs.dev/)**: Build tool yang super cepat untuk pengembangan dan bundling aplikasi.
* **[Tailwind CSS](https://tailwindcss.com/) (v3)**: Framework CSS *utility-first* untuk penataan gaya (styling) yang cepat, responsif, dan konsisten.

### Dependencies Tambahan
* **[Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)**: Digunakan untuk menampilkan visualisasi data statistik (seperti distribusi status, kategori, dll) pada halaman Dashboard.
* **[Lucide React](https://lucide.dev/)**: Kumpulan ikon SVG modern dan bersih.
* **Google Apps Script (GAS)**: Digunakan sebagai backend/API serverless.
* **Google Sheets**: Berfungsi sebagai *database* utama untuk menyimpan data tiket aduan (melalui API GAS).

## Fitur Utama

* **Role-Based Access Control (RBAC)**: Tampilan dan hak akses disesuaikan berdasarkan peran pengguna (misal: Owner, Koordinator, PIC Lapangan, Admin Kantor, dll).
* **Manajemen Tiket Aduan**: Pencatatan tiket aduan secara lengkap (pelapor, kategori, SLA, lokasi).
* **Tracking Timeline**: Setiap aksi pada tiket (pembuatan, perubahan status, penugasan dinas) akan tercatat pada riwayat tiket.
* **Integrasi GPS**: Fitur "Check-in GPS" untuk tim lapangan (PIC) menentukan koordinat penyelesaian tugas.
* **Dashboard Statistik**: Metrik real-time untuk memantau performa, status penyelesaian, dan sebaran data per kecamatan/kategori.
* **Simpan ke Google Sheets**: Aplikasi terhubung secara sinkron dengan Google Sheets untuk persistensi data secara terpusat.
* **Antrian Khusus (Sosmed & Pigura)**: Pengelolaan tindak lanjut pasca penyelesaian aduan seperti dokumentasi ke sosial media dan pembuatan pigura.

## Cara Menjalankan Secara Lokal

1. Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) di perangkat Anda.
2. Clone atau unduh repositori ini.
3. Buka terminal pada folder proyek.
4. Instal semua *dependencies*:
   ```bash
   npm install
   # atau
   yarn install
   ```
5. Jalankan *development server*:
   ```bash
   npm run dev
   # atau
   yarn dev
   ```
6. Buka URL yang tertera di terminal (biasanya `http://localhost:5173`) pada browser Anda.

## Setup Database (Google Sheets)

1. Buat Spreadsheet baru di Google Sheets.
2. Gunakan script yang ada di dalam file `gas_script.js` lalu _deploy_ sebagai Web App di Google Apps Script (Extensions > Apps Script).
3. Salin URL Web App yang dihasilkan.
4. Ganti konstanta `GAS_URL` pada file `src/services/sheets.js` dengan URL Web App Anda.
