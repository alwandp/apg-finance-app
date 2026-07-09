# Web-Based Basic Financial System (APG Finance)

Sistem Keuangan Dasar Berbasis Web (*Basic Financial System*) yang dirancang khusus untuk manajemen **Chart of Accounts (COA)** dan **Penjurnalan Transaksi Keuangan** dengan menerapkan prinsip akuntansi **Double-Entry Bookkeeping**. Aplikasi ini dibangun menggunakan arsitektur modern (*Monolith Modern / SPA via Inertia*) dengan antarmuka bertema **Clean Modern Dashboard** yang mengutamakan kejelasan data (*legibility*), keandalan tinggi, dan pengalaman pengguna (*UX*) kelas enterprise.

---

## 🏗️ Arsitektur & Teknologi (*Tech Stack*)

Sistem ini memadukan kekuatan *backend* Laravel dengan fleksibilitas *frontend* React modern melalui koneksi **Inertia.js**, tanpa memerlukan API mandiri (*headless/REST separation*) yang kompleks, namun tetap mempertahankan pemisahan lapisan penyiapan data dan presentasi yang rapi.

| Lapisan (*Layer*) | Teknologi / Framework | Deskripsi Singkat |
| :--- | :--- | :--- |
| **Backend Framework** | **Laravel 13** (PHP 8.3+) | Menangani logika bisnis, routing, validasi request, dan pemrosesan transaksi akuntansi. |
| **Bridge / Routing** | **Inertia.js v3 + Wayfinder** | Menjembatani Laravel dengan React sebagai *Single Page Application* (SPA) serta menyediakan tipe rute *strongly-typed*. |
| **Frontend Framework** | **React 19** | Lapisan presentasi (*UI/UX*) dinamis dengan *state management* yang efisien. |
| **Type Safety** | **Strict TypeScript** | Memastikan integritas data antar komponen presentasi dan respons dari *controller*. |
| **Styling & Design System**| **Tailwind CSS v4 + Radix UI**| Sistem desain **Clean Modern Dashboard** beraksen *Sapphire Blue* (`#0A66C2`) dengan komponen *high-trust*. |
| **Authentication** | **Laravel Fortify** | Layanan autentikasi berbasis sesi (*Session-based headless auth*). |
| **Database** | **MySQL / SQLite / PostgreSQL** | Relasional database untuk mengelola akun dan mutasi jurnal secara konsisten. |
| **Orkestrasi Lingkungan**| **Docker / Laravel Sail** | Lingkungan pengembangan terisolasi berbasis kontainer Docker. |

---

## ✨ Fitur Utama Sistem

### 1. Manajemen Chart of Accounts (COA)
- **5 Kategori Utama Akun**: Pengelompokan ketat berdasarkan *Asset*, *Liability*, *Equity*, *Revenue*, dan *Expense*.
- **Struktur Hierarkis**: Mendukung relasi *Parent-Child* (contoh: *Parent* `Cash & Bank` -> *Child* `Petty Cash`).
- **Penomoran Kode Akun Otomatis**: Kode akun dibuat otomatis secara berurutan berdasarkan tipe utama dan nomor urut sub-akun di bawah induknya (misal: `1000`, `1100`, `1101`).
- **Status Akun (*Active / Inactive*)**: Akun non-aktif secara otomatis diproteksi agar tidak dapat dipilih pada transaksi baru.
- **Proteksi Integritas Data**: Mencegah penghapusan akun yang sudah memiliki riwayat transaksi atau memiliki akun anak (*child accounts*).

### 2. Penjurnalan Transaksi (*Double-Entry Bookkeeping*)
- **Input Baris Multi-Akun**: Setiap transaksi terdiri dari informasi umum (tanggal & deskripsi) dan rincian baris jurnal (*Debit* dan *Credit*).
- **Penghapusan Aturan Kaku Equilibrium di Form Input**: Untuk memberikan pengalaman pengguna (*UX*) terbaik, sistem mengizinkan pencatatan entri fleksibel tanpa memblokir pengguna secara kaku, disertai pencatatan histori transaksi per akun secara terperinci.

### 3. Buku Besar Transaksi & Pelaporan Neraca Saldo (*Trial Balance*)
- **Audit Trail Ledger & History**: Tampilan daftar transaksi yang dapat disaring (*filter*) berdasarkan rentang waktu dan nama akun, serta tab *Recent Transaction History* pada detail setiap akun.
- **Laporan Neraca Saldo (*Trial Balance*)**: Panel analitis yang menampilkan kalkulasi saldo bersih (*net balance*) dari seluruh akun aktif secara *real-time*.

### 4. Pewarnaan Semantik Akuntansi & Pelokalan Indonesia (`id-ID`)
- **Pewarnaan Semantik Otomatis (*Conditional Semantic Coloring*)**:
  - Untuk akun **Asset** & **Expense**: *Debit* (penambahan) berwarna **Emerald Green** (`#10B981`), *Credit* (pengurangan) berwarna **Rose Red** (`#F43F5E`).
  - Untuk akun **Liability**, **Equity**, & **Revenue**: *Credit* (penambahan) berwarna **Emerald Green**, *Debit* (pengurangan) berwarna **Rose Red**.
- **Format Mata Uang Rupiah (IDR)**: Seluruh nominal diatur dalam format standar `Rp 1.000.000`.
- **Format Waktu Lengkap (`id-ID`)**: Menampilkan tanggal beserta jam pembuatan transaksi (contoh: `9 Jul 2026, 08:20 WIB`).

### 5. Pengalihan Rute Utama Dinamis (`/`)
- Akses ke URL akar (`/` atau `route('home')`) secara otomatis mendeteksi status sesi:
  - **Pengguna Terautentikasi**: Dialihkan langsung ke `/dashboard`.
  - **Tamu (*Guest*)**: Dialihkan langsung ke `/login`.

---

## 🚀 Cara Menjalankan Sistem

Anda dapat menjalankan sistem ini menggunakan **Docker (Laravel Sail)** ataupun secara **Lokal (Tanpa Docker)**.

### Opsi A: Menggunakan Docker & Laravel Sail (Sangat Direkomendasikan)

Pastikan sistem Anda sudah terinstal **Docker Desktop**.

1. **Kloning Repositori & Masuk ke Direktori Proyek**
   ```bash
   git clone <repository-url>
   cd apg-finance-app
   ```

2. **Instal Dependensi Composer via Kontainer Sementara**
   ```bash
   docker run --rm \
       -u "$(id -u):$(id -g)" \
       -v "$(pwd):/var/www/html" \
       -w /var/www/html \
       laravelsail/php83-composer:latest \
       composer install --ignore-platform-reqs
   ```

3. **Siapkan File Environment (`.env`)**
   ```bash
   cp .env.example .env
   ```

4. **Jalankan Kontainer Docker via Sail**
   ```bash
   ./vendor/bin/sail up -d
   ```

5. **Generate Application Key & Migrasi Database**
   ```bash
   ./vendor/bin/sail artisan key:generate
   ./vendor/bin/sail artisan migrate --seed
   ```
   *(Perintah `--seed` akan mengisi akun-akun awal standar COA dan akun pengguna pengujian).*

6. **Instal Dependensi Frontend & Jalankan Vite Dev Server**
   ```bash
   ./vendor/bin/sail npm install
   ./vendor/bin/sail npm run dev
   ```

Aplikasi kini dapat diakses di browser melalui alamat: **`http://localhost`**

---

### Opsi B: Pengaturan Lokal Tanpa Docker (PHP 8.3+ & Node.js 20+)

Jika Anda menjalankan PHP, Composer, dan Node.js langsung di sistem operasi lokal:

1. **Instal Dependensi Backend & Frontend**
   ```bash
   composer install
   npm install
   ```

2. **Siapkan File Environment (`.env`)**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Sesuaikan konfigurasi koneksi database (`DB_CONNECTION`, `DB_DATABASE`, dll) di dalam file `.env` dengan database lokal Anda (misalnya SQLite atau MySQL).*

3. **Jalankan Migrasi & Seeder Database**
   ```bash
   php artisan migrate --seed
   ```

4. **Kompilasi Aset Frontend & Jalankan Server Backend**
   Buka 2 terminal terpisah atau jalankan secara paralel:
   ```bash
   # Terminal 1: Vite Development Server
   npm run dev

   # Terminal 2: Laravel Development Server
   php artisan serve
   ```

Aplikasi kini dapat diakses melalui alamat: **`http://localhost:8000`**

---

## 🧪 Pengujian & Verifikasi (*Testing Suite*)

Sistem ini dilengkapi dengan otomatisasi pengujian *full-stack* untuk memastikan tidak ada regresi pada logika akuntansi maupun tipe data *frontend*.

1. **Menjalankan Unit & Feature Test Backend (Pest Framework)**
   ```bash
   # Jika menggunakan Sail:
   ./vendor/bin/sail artisan test --compact

   # Jika lokal:
   php artisan test --compact
   ```
   *Sistem akan menjalankan 53+ pengujian (meliputi autentikasi, manajemen COA, saldo jurnal, relasi parent-child, filter laporan, dan rute dinamis).*

2. **Memeriksa Integritas Tipe TypeScript (*Type Checking*)**
   ```bash
   ./vendor/bin/sail npm run types:check
   ```

3. **Membuat Bundel Produksi (*Production Build*)**
   ```bash
   ./vendor/bin/sail npm run build
   ```

---

## 📂 Overview Struktur Folder Penting

```text
├── app/
│   ├── Http/Controllers/    # Controller utama (AccountController, TransactionController, ReportController)
│   ├── Http/Requests/       # Validasi form request ketat (Account & Transaction validation)
│   └── Models/              # Model Eloquent dengan relasi akuntansi (Account, Transaction, TransactionDetail)
├── database/
│   ├── migrations/          # Skema tabel (users, accounts, transactions, transaction_details)
│   └── seeders/             # Data awal COA & akun demo (DatabaseSeeder)
├── resources/js/
│   ├── components/          # Komponen UI modular (Sidebar, Header, Form inputs, Badges)
│   ├── layouts/             # Layout aplikasi (AppLayout, AuthLayout)
│   ├── lib/                 # Utility helpers akuntansi & format waktu/mata uang (utils.ts)
│   ├── pages/               # Halaman SPA Inertia (accounts/*, transactions/*, reports/*, dashboard.tsx)
│   └── types/               # Definisi antarmuka TypeScript untuk model & props
├── routes/
│   ├── web.php              # Definisi rute web & pengalihan dinamis root (/)
│   └── settings.php         # Rute manajemen profil & keamanan pengguna
└── tests/
    ├── Feature/             # Pengujian end-to-end alur fitur & pengalihan rute
    └── Unit/                # Pengujian logika unit akuntansi
```
