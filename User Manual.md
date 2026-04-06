# Panduan Pengguna — Sistem CC Report
*Panduan Penggunaan Lengkap untuk Pengguna Sistem*

---

## Daftar Isi

1. [Tentang Sistem CC Report](#1-tentang-sistem-cc-report)
2. [Akses & Login](#2-akses--login)
3. [Dashboard (Halaman Utama)](#3-dashboard-halaman-utama)
4. [Manajemen Direksi](#4-manajemen-direksi)
5. [Membuat Laporan CC Baru](#5-membuat-laporan-cc-baru)
6. [Melihat & Mengelola Detail Laporan](#6-melihat--mengelola-detail-laporan)
7. [Ekspor Laporan ke PDF atau Excel](#7-ekspor-laporan-ke-pdf-atau-excel)
8. [Rekap Laporan (Riwayat)](#8-rekap-laporan-riwayat)
9. [Manajemen Pengguna (Khusus Admin)](#9-manajemen-pengguna-khusus-admin)
10. [Log Aktivitas (Khusus Admin)](#10-log-aktivitas-khusus-admin)
11. [Mengubah Password](#11-mengubah-password)
12. [Keluar dari Sistem](#12-keluar-dari-sistem)
13. [Pertanyaan Umum](#13-pertanyaan-umum)

---

## 1. Tentang Sistem CC Report

**CC Report** adalah sistem pencatatan dan pelaporan penggunaan kartu kredit direksi perusahaan. Sistem ini memungkinkan tim keuangan untuk:

- Mencatat transaksi penggunaan kartu kredit per direksi
- Membuat laporan bulanan secara digital
- Mengekspor laporan ke format PDF dan Excel sesuai format resmi
- Memantau jejak aktivitas pengguna sistem

---

## 2. Akses & Login

### Cara Login
1. Buka browser dan masukkan alamat sistem (contoh: `https://cc-report.asabri.internal`)
2. Pada halaman login, masukkan **Username** dan **Password** yang telah diberikan administrator
3. Klik tombol **Login**
4. Anda akan otomatis diarahkan ke **Dashboard** setelah login berhasil

### Jika Lupa Password
Hubungi administrator sistem untuk mereset password Anda.

> **Perhatian:** Jangan bagikan username dan password kepada siapapun. Setiap tindakan dalam sistem tercatat atas nama akun Anda.

---

## 3. Dashboard (Halaman Utama)

Setelah login, Anda akan melihat **Dashboard** yang menampilkan:

| Informasi | Keterangan |
|---|---|
| **Total Direksi** | Jumlah data direksi yang terdaftar |
| **Total Laporan** | Jumlah laporan CC yang tersimpan |
| **Total Transaksi** | Jumlah seluruh transaksi yang tercatat |
| **Total Pengguna** | Jumlah akun pengguna sistem (hanya Admin) |
| **Grafik Aktivitas 7 Hari** | Grafik batang aktivitas sistem dalam 7 hari terakhir |
| **Aktivitas Terbaru** | Daftar 10 aksi terakhir yang dilakukan di sistem |

### Navigasi
Gunakan **menu samping (sidebar)** di sebelah kiri untuk berpindah antar halaman:
- **Dashboard** — Halaman utama
- **Direksi** — Manajemen data direksi
- **Rekap Laporan** — Riwayat dan daftar laporan CC
- **Pengguna** — Manajemen akun (hanya Admin)
- **Log Aktivitas** — Jejak aktivitas sistem (hanya Admin)

---

## 4. Manajemen Direksi

### Melihat Daftar Direksi
1. Klik **Direksi** di menu sidebar
2. Anda akan melihat tabel daftar semua direksi beserta jabatan dan jumlah kartu kredit

### Menambah Direksi Baru
1. Klik tombol **+ Tambah Direksi** di kanan atas
2. Isi formulir:
   - **Nama** — Nama lengkap direksi
   - **Jabatan** — Jabatan/posisi (contoh: Direktur Utama)
3. Di bagian **Daftar Kartu Kredit**, klik **+ Tambah Kartu** untuk menambahkan kartu kredit
   - **Nama Bank** — Nama bank penerbit
   - **Nomor Kartu** — Nomor lengkap kartu kredit
4. Klik **Simpan** untuk menyimpan data

### Mengubah Data Direksi
1. Dari daftar direksi, klik ikon pensil (ubah) pada baris yang ingin diubah
2. Ubah data yang diperlukan (nama, jabatan, atau kartu kredit)
3. Klik **Simpan** untuk menyimpan perubahan

### Menghapus Direksi
1. Klik ikon tempat sampah pada baris direksi
2. Konfirmasi penghapusan pada dialog yang muncul
3. **Perhatian:** Menghapus direksi akan menghapus semua laporan dan transaksinya

---

## 5. Membuat Laporan CC Baru

### Langkah-langkah
1. Klik **Rekap Laporan** di sidebar, lalu klik **+ Buat Laporan**
   — atau klik tombol **+ Buat Laporan** langsung dari halaman Rekap Laporan
2. Isi formulir laporan:
   - **Direksi** — Pilih nama direksi dari daftar dropdown
   - **Kartu Kredit** — Pilih kartu kredit (otomatis muncul setelah memilih direksi)
   - **Bulan** — Pilih bulan laporan (1–12)
   - **Tahun** — Masukkan tahun laporan (contoh: 2026)
   - **Pagu Limit (Rp)** — Masukkan batas penggunaan kartu kredit bulan ini
3. Klik **Simpan Laporan** untuk membuat laporan

> **Catatan:** Satu direksi hanya dapat memiliki satu laporan per kartu kredit per bulan/tahun. Sistem akan menolak duplikasi.

---

## 6. Melihat & Mengelola Detail Laporan

### Membuka Detail Laporan
1. Dari halaman **Rekap Laporan**, klik nama laporan atau ikon detail pada baris laporan
2. Halaman detail akan menampilkan:
   - Informasi direksi, kartu kredit, dan periode
   - Total pengeluaran vs pagu limit
   - Tabel daftar transaksi

### Menambah Transaksi
Pada halaman detail laporan, di bagian bawah tabel pilih baris tambah baru:
1. **Tanggal** — Pilih tanggal transaksi (dalam rentang bulan laporan)
2. **Uraian** — Deskripsi pengeluaran (wajib diisi)
3. **Nominal (Rp)** — Jumlah pengeluaran (ketik angka, titik otomatis muncul sebagai pemisah ribuan)
4. Klik ikon centang **Simpan Baru** atau tekan **Enter**

### Mengubah Transaksi
1. Klik ikon pensil pada baris transaksi yang ingin diubah
2. Ubah data yang diperlukan
3. Klik ikon centang untuk menyimpan

### Menghapus Transaksi
1. Klik ikon tempat sampah pada baris transaksi
2. Pastikan informasi transaksi pada dialog konfirmasi sudah benar
3. Klik **Hapus** untuk mengonfirmasi
4. Klik **Batal** jika ingin membatalkan

---

## 7. Ekspor Laporan ke PDF atau Excel

### Langkah-langkah Ekspor
1. Buka halaman **Detail Laporan** yang ingin diekspor
2. Klik tombol **Ekspor Laporan** (ikon unduhan) di kanan atas
3. Dialog ekspor akan terbuka — isi data yang diperlukan:

| Kolom | Keterangan | Wajib? |
|---|---|---|
| **Nomor Rekap** | Nomor dokumen rekap | Opsional |
| **Nomor PO** | Nomor Purchase Order | Opsional |
| **Jabatan Kiri** | Jabatan penandatangan kiri (Menyetujui) | Opsional |
| **Nama Kiri** | Nama penandatangan kiri | Opsional |
| **Jabatan Kanan** | Jabatan penandatangan kanan | Opsional |
| **Nama Kanan** | Nama penandatangan kanan | Opsional |

4. Pilih format ekspor:
   - **Pratinjau PDF** — Buka pratinjau PDF di tab browser baru
   - **Unduh PDF** — Langsung unduh file PDF
   - **Unduh Excel** — Unduh file Excel (.xlsx)

5. File akan otomatis terunduh ke folder unduhan browser Anda

> **Nama file:** Laporan CC {Nama Direksi} {Bulan} {Tahun} - {4 Digit Terakhir Kartu}.pdf/xlsx

---

## 8. Rekap Laporan (Riwayat)

### Melihat Daftar Laporan
1. Klik **Rekap Laporan** di sidebar
2. Gunakan filter di bagian atas untuk menyaring:
   - **Tahun** — Filter berdasarkan tahun
   - **Bulan** — Filter berdasarkan bulan
   - **Direksi** — Filter berdasarkan direksi
   - **Tampilan** — Pilih "Bulanan" atau "Tahunan"
3. Klik **FILTER** untuk menerapkan filter

### Informasi Laporan per Baris
Setiap baris menampilkan:
- Nama Direksi & Jabatan
- Periode (Bulan/Tahun) & Bank Kartu
- Total Pengeluaran vs Pagu Limit
- Status: **Normal** / **Melebihi Limit**
- Tombol aksi: Lihat Detail, Ubah, Hapus, Ekspor

### Menghapus Laporan
1. Klik ikon tempat sampah pada laporan yang ingin dihapus
2. Konfirmasi pada dialog yang muncul
3. **Perhatian:** Menghapus laporan akan menghapus semua transaksi di dalamnya

---

## 9. Manajemen Pengguna (Khusus Admin)

> Halaman ini hanya dapat diakses oleh pengguna dengan peran **Admin**.

### Melihat Daftar Pengguna
1. Klik **Pengguna** di sidebar
2. Daftar semua akun pengguna akan ditampilkan beserta peran mereka

### Menambah Pengguna Baru
1. Klik **+ Tambah Pengguna**
2. Isi formulir:
   - **Username** — Nama pengguna (huruf, angka, dan underscore, minimal 3 karakter)
   - **Password** — Password (minimal 8 karakter)
   - **Peran** — Pilih **Admin** atau **Pengguna**
3. Klik **Buat Pengguna**

### Mengubah Data Pengguna
1. Klik ikon pensil pada baris pengguna
2. Ubah username atau peran
3. Klik **Simpan Perubahan**

### Mengubah Password Pengguna
1. Klik ikon kunci pada baris pengguna
2. Masukkan password baru
3. Klik **Simpan Perubahan**

### Menghapus Pengguna
1. Klik ikon tempat sampah
2. Konfirmasi pada dialog
3. **Catatan:** Anda tidak dapat menghapus akun Anda sendiri

---

## 10. Log Aktivitas (Khusus Admin)

> Halaman ini hanya dapat diakses oleh pengguna dengan peran **Admin**.

### Melihat Log Aktivitas
1. Klik **Log Aktivitas** di sidebar
2. Tifar seluruh aktivitas pengguna di sistem akan ditampilkan dalam urutan terbaru

### Menggunakan Filter
Filter tersedia di bagian atas:
- **Pengguna** — Filter berdasarkan akun pengguna tertentu
- **Aksi Sistem** — Filter berdasarkan jenis aksi (Login, Buat Laporan, dll.)
- **Entitas** — Filter berdasarkan objek yang terpengaruh
- **Dari Tanggal / Sampai Tanggal** — Filter berdasarkan rentang waktu
- **Kata Kunci** — Cari di deskripsi aktivitas

Klik **FILTER** untuk menerapkan, atau **Reset** untuk menghapus semua filter.

---

## 11. Mengubah Password

1. Klik ikon kunci di sebelah nama akun Anda (atau dari menu Pengguna jika Admin)
2. Masukkan **Password Lama**
3. Masukkan **Password Baru** (minimal 8 karakter)
4. Klik **Simpan Perubahan**

---

## 12. Keluar dari Sistem

1. Klik ikon keluar (logout) di bagian bawah sidebar
2. Anda akan otomatis diarahkan kembali ke halaman login
3. Sesi Anda akan dihapus dari sistem secara aman

---

## 13. Pertanyaan Umum

**Q: Kenapa laporan saya tidak bisa dibuat dan muncul pesan error?**  
A: Pastikan kombinasi Direksi + Kartu Kredit + Bulan + Tahun belum ada sebelumnya. Sistem tidak mengizinkan laporan duplikat untuk kombinasi yang sama.

**Q: Kenapa nominal transaksi saya berubah saat disimpan?**  
A: Sistem otomatis memisahkan angka dengan titik sebagai pemisah ribuan (format Rupiah Indonesia). Ini bukan kesalahan.

**Q: File PDF atau Excel saya tidak bisa dibuka setelah diunduh?**  
A: Pastikan Anda memiliki aplikasi pembaca PDF (seperti Adobe Reader) atau Microsoft Excel. Periksa folder unduhan browser Anda.

**Q: Saya tidak bisa melihat menu Pengguna atau Log Aktivitas?**  
A: Menu tersebut hanya tersedia untuk akun dengan peran Admin. Hubungi administrator jika Anda membutuhkan akses.

**Q: Apakah data yang dihapus bisa dikembalikan?**  
A: Tidak. Penghapusan data (laporan, transaksi, direksi, pengguna) bersifat permanen. Pastikan sebelum mengonfirmasi penghapusan.

**Q: Bagaimana cara melihat siapa yang mengubah data tertentu?**  
A: Admin dapat memeriksa halaman **Log Aktivitas** dan memfilter berdasarkan waktu atau pengguna untuk melihat riwayat perubahan.
