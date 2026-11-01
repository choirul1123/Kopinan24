KOPINAN 24 - RESPONSIVE WEBSITE (PELANGGAN + STAFF)

STRUKTUR FILE
- index.html              Halaman pelanggan
- staff.html              Portal login role dan dashboard staf
- css/style.css           CSS seluruh website (terpisah)
- js/data.js              Data awal menu, bahan, area, shift, dan pajak
- js/common.js            Utilitas dan penyimpanan browser
- js/customer.js          Fungsi menu, pesanan, akun, keranjang, meja
- js/staff.js             Dashboard tiap role
- menu.json               Data katalog menu contoh
- assets/                 Foto kafe dan foto makanan/minuman

CARA MENJALANKAN
1. Ekstrak seluruh ZIP.
2. Buka folder Kopinan24_Web_Responsive di VS Code.
3. Jalankan index.html dengan Live Server.
4. Halaman pertama adalah halaman pelanggan.
5. Klik Login Staff untuk memilih peran. Tidak perlu memasukkan nama staf.

FITUR PELANGGAN
- Beranda, menu dengan foto, pencarian dan kategori.
- Pilih meja dari tiga area contoh: Indoor, Tengah, Nongkrong.
- Keranjang, Dine-in/Takeaway, pilihan metode pembayaran pelanggan (Tunai, QRIS, Debit), subtotal, pajak contoh 10%, total. Tombol Bayar Sekarang selalu terlihat di bagian bawah keranjang; pelanggan memilih Tunai, QRIS, atau Debit lalu menekan tombol untuk menyelesaikan pembayaran simulasi dan mencatat transaksi sebagai Lunas.
- Halaman Pesanan untuk melihat riwayat/status pesanan di browser yang digunakan.
- Halaman Akun untuk menyimpan nama, email, dan nomor WhatsApp serta melihat ringkasan pesanan.
- Informasi event: Nonton Bareng, Live Music, dan Acoustic/Gathering. Jadwal di halaman adalah teks contoh/informasi umum, bukan jadwal event terkonfirmasi.

ROLE STAFF
- Kasir: memantau pesanan dan pembayaran pelanggan, membantu pelanggan bila ada kendala, memproses pesanan lama yang masih menunggu pembayaran, melihat laporan penjualan dan status meja.
- Barista: antrean minuman dan tandai minuman siap.
- Dapur/Kitchen: antrean makanan, stok bahan, barang masuk, pemakaian bahan, laporan dapur.
- Pelayan/Waiter: pesanan siap diantar, monitor meja, konfirmasi meja selesai dibersihkan.
- Owner: ringkasan usaha, laporan penjualan, tren/menu terlaris, dan riwayat transaksi. Dashboard Owner tidak menampilkan menu pengelolaan meja.
- Admin stok terpisah tidak digunakan; stok bahan menjadi tanggung jawab Dapur/Kitchen.

SATU TOMBOL KEMBALI
- Pada dashboard staf hanya ada satu tombol "Kembali ke Pelanggan" di bagian atas.

RESPONSIVE
- Layout CSS menyesuaikan laptop, tablet, dan layar HP.
- Navigasi pelanggan berubah menjadi menu mobile.
- Sidebar staf menjadi drawer yang dapat dibuka/tutup di HP.

ALUR PEMESANAN DAN PEMBAYARAN
Pelanggan memilih menu dan metode pembayaran -> menekan Bayar Sekarang -> pembayaran simulasi langsung tercatat Lunas -> pesanan masuk ke antrean Barista/Dapur -> Pelayan mengantar pesanan -> Pelanggan checkout kunjungan -> meja Perlu dibersihkan -> Pelayan menandai sudah bersih -> Kosong.

CATATAN PEMBAYARAN
- Pembayaran QRIS, Debit, E-Wallet, dan Tunai di versi ini hanya simulasi agar alur prototipe dapat diuji. Tombol Bayar Sekarang akan mencatat transaksi Lunas dan memasukkannya ke laporan.
- Website belum terhubung ke payment gateway, bank, QRIS resmi, atau dompet digital. Tidak ada uang sungguhan yang dipotong atau diterima.
- Shift transaksi pada pembayaran pelanggan ditentukan otomatis berdasarkan jam lokal: Shift 1 pukul 07.00-14.59, Shift 2 pukul 15.00-22.59, dan Shift 3 pukul 23.00-06.59.

SHIFT
1. Shift 1 · Pagi: 07.00–15.00
2. Shift 2 · Sore: 15.00–23.00
3. Shift 3 · Malam: 23.00–07.00

CATATAN PENTING
- Pajak 10% adalah angka contoh prototipe. Ubah KOPINAN_TAX_RATE di js/data.js sesuai tarif pajak yang benar bagi usaha.
- Menu, harga, stok awal, foto, jumlah meja, dan event adalah contoh. Cocokkan dengan data resmi Kopinan 24.
- Data menggunakan localStorage. Riwayat pesanan/akun terlihat pada browser yang digunakan. Aksi dari tab lain pada browser/origin yang sama dapat memperbarui tampilan, tetapi data belum tersinkron lintas perangkat dan bukan sistem produksi.
- Login staf berbasis pilihan role tanpa autentikasi sungguhan. Untuk dipakai operasional nyata, perlu backend/API, database, login aman, dan otorisasi server.
- Untuk GitHub Pages/Netlify upload seluruh folder dan pertahankan susunan assets, css, dan js. Jangan upload index.html saja.


DASHBOARD SAAT PERTAMA DIBUKA:
- Jika belum ada transaksi, dashboard menampilkan kartu "Contoh tampilan" dengan data ilustrasi agar halaman tidak terlihat kosong.
- Kartu preview tidak disimpan sebagai transaksi, tidak memengaruhi omzet, laporan, stok, maupun data pelanggan.
- Begitu pesanan dan pembayaran asli dibuat, data asli akan menggantikan tampilan preview pada daftar terkait.
- Grafik laporan tidak membuat angka penjualan palsu; periode tanpa transaksi tetap menampilkan keterangan bahwa belum ada data asli.


Pembaruan pilihan meja: prototipe menyediakan 10 meja contoh pada masing-masing area Indoor, Tengah, dan Nongkrong (30 meja contoh). Sesuaikan jumlah dan kode meja dengan kondisi Kopinan 24 yang sebenarnya. Saat versi baru dibuka pada browser yang sudah pernah digunakan, meja tambahan ditambahkan tanpa mengubah status meja lama. Owner tidak memiliki shift kerja pada dashboard; filter shift tetap tersedia sebagai cara melihat laporan operasional tim.
