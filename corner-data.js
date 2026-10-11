/* corner-data.js: data Samasta Corner BEM STDIIS (corner, menu, event, soal penilaian, dan kata penutup).
   Jangan diedit manual. Gunakan admin-corner.html, lalu unduh file ini dan unggah ke GitHub.
   Terakhir dibuat: 11/10/2026, 08.00.00 */
window.CORNER = {
 "soal": [
  {"id": "kepuasan", "t": "Kepuasan keseluruhan", "tipe": "bintang", "wajib": true},
  {"id": "materi", "t": "Materi atau isi acara", "tipe": "bintang", "wajib": true},
  {"id": "panitia", "t": "Kinerja panitia", "tipe": "bintang", "wajib": true},
  {"id": "tempat", "t": "Tempat dan fasilitas", "tipe": "bintang", "wajib": true},
  {"id": "waktu", "t": "Ketepatan waktu", "tipe": "bintang", "wajib": true},
  {"id": "komentar", "t": "Komentar tentang acara", "tipe": "paragraf", "wajib": false, "bantu": "Apa kesanmu tentang acara ini?"},
  {"id": "kritik", "t": "Kritik dan saran", "tipe": "paragraf", "wajib": false, "bantu": "Apa yang sebaiknya diperbaiki untuk acara berikutnya?"}
 ],
 "penutup": {
  "judul": "Terima kasih, {nama}!",
  "isi": "Kehadiran dan penilaianmu sudah tercatat. Masukanmu menjadi bahan kami untuk berbenah di kegiatan berikutnya.\n\nSemoga ilmu dan kebaikan dari acara hari ini bermanfaat dan berkah. Sampai jumpa di kegiatan Kabinet Samasta selanjutnya.",
  "salam": "Salam hangat, Inspektorat Jenderal BEM STDIIS Kabinet Samasta",
  "tombol": "Ke Samasta Corner",
  "url": "#corner"
 },
 "bukaHari": 2,
 "corner": [
  {
   "id": "kesma",
   "nama": "Kementerian Kesejahteraan Mahasiswa",
   "singkat": "Kesma",
   "tagline": "Kesejahteraan mahasiswa",
   "deskripsi": "Layanan dan program kesejahteraan mahasiswa akan hadir di corner ini.",
   "warna": "emas",
   "ikon": "megafon",
   "status": "segera",
   "unit": "Kementerian Kesejahteraan Mahasiswa (Kesma)",
   "menu": [],
   "event": []
  },
  {
   "id": "irjen",
   "nama": "Inspektorat Jenderal",
   "singkat": "Irjen",
   "tagline": "Pengawasan dan evaluasi kegiatan",
   "deskripsi": "Pusat kerja Inspektorat Jenderal: mencatat kehadiran, menghimpun penilaian peserta, dan merangkum evaluasi setiap kegiatan BEM.",
   "warna": "zamrud",
   "ikon": "perisai",
   "status": "aktif",
   "unit": "Inspektorat Jenderal",
   "menu": [
    {"id": "event", "judul": "Event", "deskripsi": "Absensi dengan barcode, penilaian peserta, dan pembukuan kegiatan.", "tipe": "event", "ikon": "kalender"},
    {"id": "profil", "judul": "Tentang Irjen", "deskripsi": "Pengertian, tugas, struktur, SOP, dan buku panduan Inspektorat Jenderal.", "tipe": "profil", "ikon": "perisai", "pengertian": "Inspektorat Jenderal (Irjen) adalah unit pengawas internal Kabinet Samasta. Irjen memastikan setiap kegiatan, program kerja, dan pengelolaan sumber daya BEM berjalan sesuai SOP, AD/ART, dan peraturan kampus.\n\nIrjen bukan pencari kesalahan. Ia hadir sebagai cermin yang jujur: mencatat apa yang sudah baik, menemukan apa yang perlu dibenahi, lalu mengawal perbaikannya sampai tuntas.", "tugas": [{"t": "Merencanakan pengawasan", "d": "Menyusun rencana dan prioritas pengawasan kegiatan serta program kerja selama periode berjalan."}, {"t": "Memeriksa dan memverifikasi", "d": "Memeriksa pelaksanaan kegiatan, kelengkapan dokumen, administrasi, serta pertanggungjawaban keuangan dan inventaris."}, {"t": "Mencatat kehadiran dan penilaian", "d": "Mengelola absensi barcode dan menghimpun penilaian, komentar, serta kritik peserta setiap kegiatan."}, {"t": "Menyusun temuan dan rekomendasi", "d": "Mencatat temuan, masalah berulang, dan rekomendasi perbaikan secara objektif dan terdokumentasi."}, {"t": "Memantau tindak lanjut", "d": "Mengawal agar rekomendasi benar-benar dijalankan oleh unit terkait sampai selesai."}, {"t": "Menjaga etika dan menangani pengaduan", "d": "Menerima dan menangani pengaduan internal, dugaan pelanggaran kode etik, dan konflik kepentingan secara adil dan rahasia."}, {"t": "Mengevaluasi kinerja pengurus", "d": "Menyusun rapot kinerja pengurus tiap periode sebagai bahan pembinaan dan evaluasi kabinet."}], "panduan": "inspektorat-jenderal", "sopPola": "Irjen|Inspektur|Inspektorat"},
    {"id": "rapot", "judul": "Rapot anggota", "deskripsi": "Penilaian kinerja pengurus tiap periode.", "tipe": "link", "ikon": "bintang", "url": "#rapot"}
   ],
   "event": [
    {"id": "e-20261009-rapat", "judul": "Rapat Evaluasi, Peresmian, dan Pembahasan Proker serta Sosialisasi SOP", "tanggal": "2026-10-09", "jam": "19.30 sampai 21.30", "tempat": "RB 03", "deskripsi": "Rapat evaluasi, peresmian, pembahasan program kerja, dan sosialisasi SOP Kabinet Samasta.", "target": ["*"], "absen": "auto"}
   ]
  }
 ]
};
