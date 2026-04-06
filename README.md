# CC Report — Dokumentasi Developer & Tim IT

> Sistem Laporan Penggunaan Kartu Kredit Direksi  
> Stack: React · Node.js · Express · PostgreSQL · Prisma ORM · JWT

---

## Daftar Isi

1. [Gambaran Proyek](#1-gambaran-proyek)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Tumpukan Teknologi](#3-tumpukan-teknologi)
4. [Struktur Proyek](#4-struktur-proyek)
5. [Prasyarat](#5-prasyarat)
6. [Instalasi & Pengaturan](#6-instalasi--pengaturan)
7. [Konfigurasi Lingkungan](#7-konfigurasi-lingkungan)
8. [Pengaturan Database](#8-pengaturan-database)
9. [Menjalankan Aplikasi](#9-menjalankan-aplikasi)
10. [Sistem Autentikasi](#10-sistem-autentikasi)
11. [Referensi API](#11-referensi-api)
12. [Fitur Ekspor (PDF & Excel)](#12-fitur-ekspor-pdf--excel)
13. [Log Aktivitas](#13-log-aktivitas)
14. [Deployment Ke Produksi](#14-deployment-ke-produksi)
15. [Panduan Migrasi ke Active Directory](#15-panduan-migrasi-ke-active-directory)
16. [Panduan Migrasi ke Microsoft SQL Server](#16-panduan-migrasi-ke-microsoft-sql-server)
17. [Pertimbangan Keamanan](#17-pertimbangan-keamanan)

---

## 1. Gambaran Proyek

**CC Report** adalah aplikasi web internal untuk mengelola dan melaporkan pengeluaran kartu kredit direksi perusahaan. Sistem ini dibangun ulang (migrasi) dari sistem Laravel lama ke tumpukan teknologi modern Node.js + React.

**Fitur Utama:**
- Login aman dengan JWT dan rotasi refresh token
- Dashboard dengan statistik real-time dan grafik aktivitas
- Manajemen data Direksi beserta kartu kredit
- Pembuatan dan pengelolaan laporan CC bulanan
- Manajemen transaksi per laporan secara inline
- Ekspor ke PDF dan Excel dalam format dokumen resmi
- Log aktivitas lengkap dengan filter, pencarian, dan paginasi
- Manajemen pengguna oleh Admin dengan kontrol akses berbasis peran (RBAC)

---

## 2. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                  Browser (React SPA)                         │
│  React 18 + Vite │ React Router v7 │ lucide-react           │
│  AuthContext (JWT di memori) │ ToastContext (notifikasi UI)  │
└─────────────────────────────┬───────────────────────────────┘
                              │  HTTP/HTTPS (REST API)
                              │  Access Token: Authorization: Bearer
                              │  Refresh Token: httpOnly Cookie
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Nginx Reverse Proxy (Produksi)               │
│  Terminasi HTTPS │ Melayani file statis │ Proxy API         │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Node.js + Express Backend                   │
│  Port: 5000                                                 │
│  ├── Middleware: Helmet, CORS, Rate Limit, Cookie Parser    │
│  ├── Auth Middleware: Verifikasi JWT + pemeriksaan peran    │
│  ├── Validasi: Skema Zod per endpoint                       │
│  ├── Services: auth.service.js (dapat diganti untuk AD)    │
│  └── Controllers: auth, directors, reports, transactions,  │
│       users, dashboard, activityLog                         │
└─────────────────────────────┬───────────────────────────────┘
                              │  Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           Database PostgreSQL (port 5432)                    │
│  Tabel: User, Director, CreditCard, Report,                │
│         Transaction, ActivityLog                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Tumpukan Teknologi

| Lapisan | Teknologi | Versi | Fungsi |
|---|---|---|---|
| Frontend | React | 18.x | Framework UI |
| Build Tool | Vite | 6.x | Dev server + bundler |
| Routing | React Router | 7.x | Routing sisi klien |
| Ikon | lucide-react | 0.465.x | Perpustakaan ikon |
| HTTP Client | Axios | 1.7.x | Panggilan API + interceptor |
| Ekspor PDF | jsPDF + autotable | 4.x / 5.x | Pembuatan PDF di browser |
| Ekspor Excel | ExcelJS + file-saver | 4.x | Pembuatan Excel di browser |
| Backend Runtime | Node.js | 18+ | Runtime JavaScript |
| Framework Backend | Express | 4.x | Server HTTP |
| ORM | Prisma | 6.x | Akses database |
| Database | PostgreSQL | 14+ | Database relasional |
| Autentikasi | jsonwebtoken | 9.x | Penerbitan dan verifikasi JWT |
| Enkripsi Password | bcryptjs | 2.x | Hashing password aman |
| Validasi | Zod | 4.x | Validasi skema data |
| Header Keamanan | Helmet | 8.x | Header HTTP keamanan |
| Rate Limiting | express-rate-limit | 8.x | Proteksi brute-force |
| Cookie | cookie-parser | 1.x | Penanganan cookie httpOnly |

---

## 4. Struktur Proyek

```
CC Report/
├── .env                      # Variabel lingkungan (JANGAN commit!)
├── .env.example              # Template — aman untuk di-commit
├── .gitignore
├── nginx.conf.example        # Konfigurasi Nginx untuk produksi
├── User Manual.md            # Panduan untuk pengguna akhir
│
├── backend/
│   ├── .gitignore
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma     # Skema database
│   │   └── migrations/       # Riwayat migrasi Prisma
│   └── src/
│       ├── server.js         # Setup Express + middleware
│       ├── db.js             # Singleton Prisma client
│       ├── controllers/      # Handler HTTP request (satu per domain)
│       ├── services/         # Layer logika bisnis
│       │   ├── auth.service.js         # Dapat diganti untuk AD
│       │   └── AD_INTEGRATION_GUIDE.js # Referensi migrasi AD
│       ├── middleware/
│       │   ├── auth.js       # Verifikasi JWT + penjaga peran
│       │   └── validate.js   # Middleware validasi Zod
│       ├── routes/           # Definisi rute (satu per domain)
│       └── utils/
│           ├── activityLogger.js  # Pencatatan jejak audit
│           └── reportMapper.js    # Transformasi data
│
└── client/
    ├── .gitignore
    ├── package.json
    └── src/
        ├── App.jsx           # Komponen root + routing + penjaga rute
        ├── main.jsx          # Titik masuk React
        ├── index.css         # Sistem desain global (CSS variables)
        ├── api/axios.js      # Instance Axios + interceptor auto-refresh
        ├── context/          # AuthContext + ToastContext
        ├── components/       # Layout, Sidebar, CustomSelect, ExportModal
        ├── pages/            # Satu file per halaman/rute
        └── utils/            # helpers.js, exportPdf.js, exportExcel.js
```

---

## 5. Prasyarat

| Kebutuhan | Versi Minimum |
|---|---|
| Node.js | 18.x LTS |
| npm | 9.x |
| PostgreSQL | 14.x |
| Git | Versi terbaru |

---

## 6. Instalasi & Pengaturan

### Langkah 1: Clone Repository
```bash
git clone https://github.com/Irsanngrh/CCREPORT.git
cd "CC Report"
```

### Langkah 2: Instalasi Dependensi Backend
```bash
cd backend
npm install
```

### Langkah 3: Instalasi Dependensi Frontend
```bash
cd ../client
npm install
```

### Langkah 4: Konfigurasi Variabel Lingkungan
```bash
# Dari direktori root proyek
cp .env.example .env
# Edit .env dengan nilai yang sesuai
```

---

## 7. Konfigurasi Lingkungan

Isi file `.env` di direktori root:

```env
# Koneksi PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/cc_report?schema=public"

# JWT Secrets (gunakan string acak yang kuat)
JWT_SECRET="masukkan-string-rahasia-kuat-di-sini"
JWT_REFRESH_SECRET="masukkan-string-rahasia-berbeda-kuat-di-sini"

# Port server
PORT=5000

# URL frontend untuk konfigurasi CORS (development)
CLIENT_URL="http://localhost:5173"

# Environment
NODE_ENV="development"
```

**Cara membuat secret yang kuat:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **Catatan Keamanan:** Jangan pernah commit file `.env` ke version control. Gunakan `.env.example` sebagai panduan.

---

## 8. Pengaturan Database

### Membuat Database
```sql
CREATE DATABASE cc_report;
```

### Inisialisasi Skema
```bash
cd backend

# Dorong skema ke database (development)
npm run db:push

# Atau jalankan migrasi (setelah baseline diatur)
npx prisma migrate deploy
```

### Gambaran Skema

```
User ──(1:N)──► ActivityLog
Director ──(1:N)──► CreditCard
Director ──(1:N)──► Report
CreditCard ──(1:N)──► Report
Report ──(1:N)──► Transaction
```

**Keputusan Desain Utama:**
- Semua kolom keuangan menggunakan `Decimal(15,2)` untuk presisi akurat
- `@@unique([directorId, creditCardId, month, year])` mencegah duplikasi laporan
- `onDelete: Cascade` memastikan integritas referensial di seluruh relasi
- `ActivityLog` memiliki 4 index untuk performa query yang optimal

---

## 9. Menjalankan Aplikasi

### Mode Development

**Terminal 1 — Backend:**
```bash
cd backend
npm start        # node src/server.js
# Atau dengan hot-reload:
npm run dev      # nodemon src/server.js
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev      # Vite dev server di http://localhost:5173
```

### Build Produksi

```bash
cd client
npm run build    # Output: client/dist/
```

---

## 10. Sistem Autentikasi

### Alur Autentikasi

```
Permintaan Login
     │
     └─► auth.service.loginWithCredentials()
              │ Verifikasi password dengan bcrypt
              │ Buat Access Token (JWT, 15 menit)
              │ Buat Refresh Token (JWT, 7 hari)
              │ Simpan Refresh Token di DB
              ▼
         Set cookie httpOnly (refresh_token, 7 hari)
         Kembalikan Access Token di body response
              │
              ▼
   Frontend simpan Access Token di memori JS saja
   (BUKAN localStorage — aman dari serangan XSS)
              │
              └─► Semua panggilan API: Authorization: Bearer <accessToken>
```

### Refresh Token Otomatis
Saat API mengembalikan `401 TOKEN_EXPIRED`, interceptor Axios secara otomatis:
1. Kirim POST ke `/api/auth/refresh` (token via cookie — tidak dapat diakses JS)
2. Terima access token baru
3. Antre semua permintaan yang gagal dan ulangi dengan token baru

### Logout & Pencabutan Token
Saat logout, refresh token di-set `null` di database — mencegah reuse meskipun klien masih menyimpan salinannya.

### Perlindungan Rute
| Penjaga Rute | File | Perlindungan |
|---|---|---|
| `ProtectedRoute` | App.jsx | Memerlukan pengguna terautentikasi |
| `AdminRoute` | App.jsx | Memerlukan `role = 'admin'` |
| `authenticate` | middleware/auth.js | Verifikasi JWT di backend |
| `requireAdmin` | middleware/auth.js | Pemeriksaan peran admin di backend |

---

## 11. Referensi API

### Autentikasi
| Metode | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/auth/login` | Publik | Login dengan username + password |
| POST | `/api/auth/refresh` | Cookie | Rotasi refresh token |
| POST | `/api/auth/logout` | Cookie | Cabut refresh token |
| GET | `/api/auth/me` | Bearer | Informasi pengguna saat ini |

### Direksi
| Metode | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/directors` | Bearer | Daftar semua direksi |
| POST | `/api/directors` | Bearer | Buat direksi baru |
| PUT | `/api/directors/:id` | Bearer | Ubah data direksi |
| DELETE | `/api/directors/:id` | Bearer | Hapus direksi |

### Laporan
| Metode | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/reports` | Bearer | Daftar laporan (dapat difilter) |
| POST | `/api/reports` | Bearer | Buat laporan baru |
| PUT | `/api/reports/:id` | Bearer | Ubah laporan |
| DELETE | `/api/reports/:id` | Bearer | Hapus laporan |
| POST | `/api/reports/:id/log-export/:format` | Bearer | Catat aksi ekspor |

### Transaksi
| Metode | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/reports/:reportId/transactions` | Bearer | Tambah transaksi |
| PUT | `/api/transactions/:id` | Bearer | Ubah transaksi |
| DELETE | `/api/transactions/:id` | Bearer | Hapus transaksi |

### Pengguna (Admin Saja)
| Metode | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/users` | Admin | Daftar semua pengguna |
| POST | `/api/users` | Admin | Buat pengguna baru |
| PUT | `/api/users/:id` | Admin | Ubah pengguna |
| DELETE | `/api/users/:id` | Admin | Hapus pengguna |
| POST | `/api/users/me/change-password` | Bearer | Ubah password sendiri |

### Dashboard & Log
| Metode | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/dashboard` | Bearer | Statistik dashboard |
| GET | `/api/logs` | Admin | Log aktivitas (dapat difilter) |
| GET | `/api/logs/filters` | Admin | Opsi filter log |

---

## 12. Fitur Ekspor (PDF & Excel)

Kedua ekspor berjalan **sepenuhnya di browser** tanpa rendering server.

### Ekspor PDF (`client/src/utils/exportPdf.js`)
- **Library:** `jspdf` + `jspdf-autotable`
- **Output:** Format resmi PT ASABRI dengan logo, tabel rekapitulasi, terbilang, dan blok tanda tangan dua kolom
- **Pratinjau:** Dapat dibuka di tab baru sebelum diunduh

### Ekspor Excel (`client/src/utils/exportExcel.js`)
- **Library:** `ExcelJS` + `file-saver`
- **Output:** Format `.xlsx` dengan sel yang digabung, border, dan logo tertanam

### Alur Ekspor
1. Klik "Ekspor Laporan" di halaman detail laporan
2. Modal `ExportModal` terbuka — isi nomor rekap, nomor PO, nama penandatangan
3. Klik "Unduh PDF" atau "Unduh Excel"
4. File dibuat di browser dan diunduh secara otomatis
5. Aksi ekspor dicatat via `POST /api/reports/:id/log-export/:format`

---

## 13. Log Aktivitas

Semua aksi signifikan dicatat ke tabel `ActivityLog` via `logActivity()` di `activityLogger.js`.

### Aksi yang Dicatat
| Kategori | Aksi |
|---|---|
| Autentikasi | `LOGIN`, `LOGOUT` |
| Direksi | `CREATE_DIRECTOR`, `UPDATE_DIRECTOR`, `DELETE_DIRECTOR` |
| Laporan | `CREATE_REPORT`, `UPDATE_REPORT`, `DELETE_REPORT` |
| Transaksi | `CREATE_TRANSACTION`, `UPDATE_TRANSACTION`, `DELETE_TRANSACTION` |
| Pengguna | `CREATE_USER`, `UPDATE_USER`, `DELETE_USER`, `CHANGE_PASSWORD` |
| Ekspor | `EXPORT_PDF`, `EXPORT_EXCEL` |

---

## 14. Deployment Ke Produksi

### 1. Build Frontend
```bash
cd client && npm run build
```

### 2. Konfigurasi Environment
```bash
NODE_ENV=production node src/server.js
```

Perubahan yang aktif otomatis di produksi:
- Cookie `secure: true` (hanya via HTTPS)
- Cookie `sameSite: 'strict'` (proteksi CSRF lebih ketat)

### 3. Konfigurasi Nginx
Salin `nginx.conf.example` ke server dan sesuaikan:
- `server_name` dengan domain Anda
- Path sertifikat SSL
- `root` ke path folder `client/dist`

### 4. Process Manager (PM2)
```bash
npm install -g pm2
cd backend
pm2 start src/server.js --name cc-report-api --env production
pm2 save && pm2 startup
```

---

## 15. Panduan Migrasi ke Active Directory

### Yang Perlu Diubah
Hanya **satu fungsi** yang perlu diganti: `loginWithCredentials()` di `src/services/auth.service.js`.

Lihat `src/services/AD_INTEGRATION_GUIDE.js` untuk contoh lengkap.

### Yang Tidak Berubah
- Pembuatan JWT (`generateTokens`)
- Rotasi dan pencabutan token
- `auth.controller.js`
- Semua middleware perlindungan rute
- Seluruh logika autentikasi frontend

### Dependensi Tambahan
```bash
npm install ldapjs
```

### Variabel Lingkungan Tambahan
```env
LDAP_URL="ldap://your-ad-server.company.local"
LDAP_BASE_DN="dc=company,dc=local"
```

**Estimasi waktu migrasi:** 2–4 hari kerja

---

## 16. Panduan Migrasi ke Microsoft SQL Server

### Langkah 1: Ubah `schema.prisma`
```prisma
datasource db {
  provider = "sqlserver"   // Ganti dari "postgresql"
  url      = env("DATABASE_URL")
}
```

### Langkah 2: Perbarui `DATABASE_URL`
```env
DATABASE_URL="sqlserver://server;database=cc_report;user=sa;password=PASSWORD;encrypt=true"
```

### Langkah 3: Regenerasi Client dan Migrasi
```bash
npx prisma generate
npx prisma migrate deploy
```

### Catatan Kompatibilitas
- **Collation MSSQL:** Gunakan `Latin1_General_CI_AS` untuk mendukung pencarian case-insensitive
- **`Decimal(15,2)`:** Kompatibel penuh dengan MSSQL `DECIMAL(15,2)`
- **Tidak ada query raw** yang bergantung pada sintaks PostgreSQL-spesifik

**Estimasi waktu migrasi:** 1–2 hari kerja

---

## 17. Pertimbangan Keamanan

| Area | Implementasi |
|---|---|
| Penyimpanan password | bcrypt dengan cost factor 12 |
| Access token | JWT, 15 menit, disimpan di memori saja |
| Refresh token | JWT, 7 hari, cookie httpOnly + secure + sameSite |
| Pencabutan token | Database-backed: `refreshToken = null` saat logout |
| Rate limiting | 20 req/15 menit autentikasi, 200 req/15 menit umum |
| Header keamanan | Helmet.js (X-Frame-Options, HSTS, nosniff) |
| Validasi input | Skema Zod di semua endpoint write |
| CORS | Dibatasi hanya ke `CLIENT_URL` |
| SQL injection | Dicegah oleh query terparameterisasi Prisma |
| XSS | React meng-escape output secara default |

### Checklist Sebelum Produksi
- [ ] Rotasi semua secrets di `.env` sebelum deployment pertama
- [ ] Verifikasi `.env` tidak pernah ter-commit ke git history
- [ ] Set `NODE_ENV=production` di server
- [ ] Konfigurasi sertifikat SSL di Nginx
- [ ] Batasi akses database hanya dari IP server
