# Web Application Firewall (WAF) & Security Command Center

Proyek ini merupakan implementasi Web Application Firewall (WAF) ringan dengan dashboard pemantauan keamanan yang mengadopsi konsep Security Operations Center (SOC). Sistem dirancang untuk memeriksa traffic HTTP yang masuk, mendeteksi dan memblokir request berbahaya, serta menyimpan security logs ke database untuk keperluan monitoring dan analisis insiden.

## 🛡️ Fitur Utama

- **Threat Detection & Blocking:** Mendeteksi dan memblokir request yang mengandung indikasi serangan web umum, seperti SQL Injection, Cross-Site Scripting (XSS), dan Path Traversal.
- **Honeypot Endpoint:** Menyediakan endpoint umpan `/wp-admin` untuk menangkap aktivitas bot dan vulnerability scanner yang mencoba mengakses jalur tersebut.
- **SOC Dashboard:** Menampilkan antarmuka pemantauan dengan desain dark mode yang minimalis untuk memudahkan pemantauan aktivitas keamanan.
- **Real-Time Log Monitoring:** Menampilkan security logs yang diterima dari backend untuk membantu memantau aktivitas mencurigakan.
- **Log Filtering & Sorting:** Memungkinkan pengguna mengurutkan log insiden berdasarkan waktu terbaru atau terlama untuk mempermudah analisis.

## 💻 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS v4, Lucide React
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **CI/CD:** GitHub Actions untuk menjalankan pemeriksaan kode otomatis menggunakan ESLint.

## 🚀 Cara Menjalankan (Local Development)

Pastikan Node.js, npm, dan MongoDB sudah terpasang dan siap digunakan di komputer.

### 1. Menjalankan WAF Backend

Buka terminal di direktori utama proyek, lalu instal dependencies dan jalankan server:

```bash
npm install
node index.js
```

Backend akan berjalan di `http://localhost:3000`.

### 2. Menjalankan SOC Dashboard

Buka terminal baru, lalu masuk ke direktori frontend dan jalankan perintah berikut:

```bash
cd dasbor-keamanan
npm install
npm run dev
```

Setelah Vite berjalan, buka `http://localhost:5173` di browser untuk mengakses dashboard.

Dashboard akan mengambil data security logs dari backend untuk menampilkan aktivitas keamanan yang tercatat.

## 🌍 Deployment Architecture

Proyek ini dapat dikembangkan untuk deployment pada lingkungan cloud dengan pembagian komponen sebagai berikut:

- **WAF Backend:** Dapat dijalankan pada Virtual Private Server (VPS) menggunakan PM2 atau Docker. Backend dapat dikonfigurasi sebagai reverse proxy yang memeriksa request sebelum diteruskan ke aplikasi yang dilindungi.
- **Database:** Security logs dapat disimpan pada layanan MongoDB terkelola, seperti MongoDB Atlas.
- **Dashboard Hosting:** Frontend React dapat di-build menjadi static files dan di-hosting menggunakan platform seperti Vercel atau Netlify.
- **Secure Communication:** Penggunaan HTTPS/TLS dan access control diperlukan untuk melindungi akses dashboard serta komunikasi data antarservice.

## 🔒 Security Considerations

Proyek ini ditujukan untuk pembelajaran, eksperimen, dan pemantauan keamanan pada lingkungan yang terkontrol. Kemampuan deteksi bergantung pada rules yang diterapkan dan belum tentu mencakup seluruh jenis serangan web.

Sebelum digunakan pada lingkungan production, pastikan konfigurasi filtering rules, autentikasi, access control, keamanan database, dan reverse proxy telah diuji dan disesuaikan dengan kebutuhan sistem.
