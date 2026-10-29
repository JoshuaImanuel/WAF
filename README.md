# Web Application Firewall & Security Dashboard

Proyek ini adalah Web Application Firewall (WAF) ringan yang terintegrasi dengan dashboard pemantauan. Sistem ini memfilter *traffic* jaringan untuk mendeteksi ancaman dan mencatat *log* serangan langsung ke *database*.

## Fitur Utama

Sistem ini mendeteksi dan memblokir tiga jenis ancaman utama: SQL Injection, Cross-Site Scripting (XSS), dan Path Traversal. Selain itu, *endpoint* `/wp-admin` difungsikan sebagai Honeypot untuk menjebak *bot* atau *scanner* otomatis. Semua *log* insiden dicatat ke MongoDB dan langsung ditampilkan pada dashboard React secara *real-time*.

## Tech Stack

* **Backend:** Node.js dan Express.
* **Database:** MongoDB dan Mongoose.
* **Frontend:** React, Vite, dan Tailwind CSS.
* **CI/CD:** GitHub Actions untuk otomatisasi *linting* dengan ESLint.

## Cara Menjalankan (Local Setup)

Pastikan Node.js dan MongoDB *server* sudah berjalan di komputer Anda.

1. **Backend:** Buka terminal di folder utama, jalankan `npm install` untuk mengunduh *dependency*, lalu nyalakan *server* dengan `node index.js`.
2. **Frontend:** Buka terminal baru, masuk ke folder `dasbor-keamanan`, jalankan `npm install`, lalu start dengan `npm run dev`.

WAF dan dashboard sekarang berjalan bersamaan dan siap diuji melalui *browser*.
