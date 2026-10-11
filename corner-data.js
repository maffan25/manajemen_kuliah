/* corner-data.js: data Samasta Corner BEM STDIIS (corner, menu, event, pertanyaan penilaian, dan kata penutup).
   Jangan diedit manual. Gunakan admin-corner.html, lalu unduh file ini dan unggah ke GitHub.
   Terakhir dibuat: 11/10/2026, 09.00.00 */
window.CORNER = {
 "pertanyaan": [
  {"id":"q-puas","teks":"Kepuasan keseluruhan","tipe":"bintang","wajib":true},
  {"id":"q-materi","teks":"Materi atau isi acara","tipe":"bintang","wajib":true},
  {"id":"q-panitia","teks":"Kinerja panitia","tipe":"bintang","wajib":true},
  {"id":"q-fasilitas","teks":"Tempat dan fasilitas","tipe":"bintang","wajib":true},
  {"id":"q-waktu","teks":"Ketepatan waktu","tipe":"bintang","wajib":true},
  {"id":"q-katakunci","teks":"Satu kata yang menggambarkan acara ini","tipe":"singkat","wajib":false},
  {"id":"komentar","teks":"Komentar tentang acara","tipe":"panjang","wajib":false},
  {"id":"kritik","teks":"Kritik dan saran untuk acara berikutnya","tipe":"panjang","wajib":false}
 ],
 "sambutan": "Selamat datang. Isi kehadiran dan penilaian singkat ini, tidak sampai dua menit.",
 "penutup": {"judul":"Jazakumullahu khairan, {nama}","isi":"Kehadiran dan penilaianmu sudah tercatat. Masukanmu menjadi bahan Inspektorat Jenderal untuk menjaga mutu setiap kegiatan BEM.\n\nSemoga ilmu dan kebersamaan hari ini membawa kebaikan. Sampai jumpa di kegiatan berikutnya.","ttd":"Inspektorat Jenderal, BEM STDIIS Kabinet Samasta"},
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
    {"id":"event","judul":"Event","deskripsi":"Absensi dengan barcode, penilaian peserta, dan pembukuan kegiatan.","tipe":"event","ikon":"kalender"},
    {"id":"tentang","judul":"Tentang Irjen","deskripsi":"Pengertian, tugas, serta struktur dan anggota Irjen.","tipe":"profil","ikon":"perisai","pengertian":"Inspektorat Jenderal (Irjen) adalah sistem penjaminan mutu organisasi BEM STDIIS Kabinet Samasta: pihak independen yang memastikan apa yang berjalan di BEM benar-benar berjalan dengan baik, sesuai arah yang disepakati bersama, dan terus berkembang dari satu periode ke periode berikutnya.\n\nIrjen bukan pengawas yang mencari kesalahan, melainkan mitra yang membantu kementerian dan biro bekerja lebih baik. Posisinya independen, lintas bidang, dan langsung bertanggung jawab kepada Presiden BEM.","tugas":"Pengawasan | Memantau seluruh kementerian dan biro secara independen lewat checkup berkala, agar arah gerak, OKR, dan kepatuhan SOP tetap sesuai visi dan misi BEM.\nEvaluasi | Menilai kualitas perencanaan, pelaksanaan, dan dampak program kerja, lalu menerbitkan Rapor Proker setiap proker selesai dan Rapor Kementerian setiap dua bulan.\nRekomendasi | Merumuskan rekomendasi perbaikan yang konkret, memantau tindak lanjutnya, dan mengeskalasi ke BPH bila tidak ditindaklanjuti.\nPelaporan | Menerbitkan rapor berkala dan mengelola kanal whistleblowing internal yang aman dan objektif.\nEvaluasi kegiatan | Menyusun form kepuasan peserta, mencatat kehadiran lewat Samasta Corner, dan merangkum hasilnya untuk perbaikan kegiatan berikutnya.","prinsip":"Objektivitas | Penilaian berdasarkan fakta, data, dan standar, bukan kedekatan atau tekanan.\nKerahasiaan | Temuan dan laporan whistleblowing hanya dibahas lewat mekanisme resmi Irjen.\nProfesionalisme | Umpan balik yang jelas, membangun, dan tidak menghakimi personal.\nKonsistensi | Standar yang sama berlaku untuk semua unit.\nIntegritas | Posisi tidak dipakai untuk kepentingan pribadi.\nTepat waktu | Checkup, evaluasi, dan pelaporan berjalan sesuai jadwal.","atas":"Presiden BEM","perananKepala":"Koordinator tim Irjen dan pengawas langsung atas unit yang ditugaskan.","tugasKepala":"Memimpin rapat internal Irjen setiap dua pekan dan memastikan ada notulensi.\nMenjaga konsistensi standar penilaian antaranggota.\nMenyampaikan laporan Irjen kepada Presiden dan Wakil Presiden setiap dua bulan.\nMengeskalasi temuan yang butuh keputusan ke BPH atau Presiden BEM.\nMemastikan seluruh dokumentasi Irjen tersimpan rapi.","perananAnggota":"Penanggung jawab penuh pengawasan dan evaluasi unit yang ditugaskan.","tugasAnggota":"Menjalin komunikasi awal dan mereview Grand Design serta OKR unit.\nMenjalankan checkup proker sesuai alur dan memonitor OKR tiap dua bulan.\nMendokumentasikan temuan dan rekomendasi, lalu memastikan tindak lanjutnya.\nMelaporkan temuan di rapat internal berkala.\nMengelola kanal whistleblowing untuk unit yang ditangani."},
    {"id":"panduan","judul":"SOP dan Buku Panduan","deskripsi":"Prosedur kerja dan buku panduan Irjen, siap dibuka atau diunduh.","tipe":"panduan","ikon":"buku","buku":"inspektorat-jenderal","sopKode":"IRJ","sopPemilik":"Inspektur Jenderal"},
    {"id":"rapot","judul":"Rapot anggota","deskripsi":"Penilaian kinerja pengurus tiap periode.","tipe":"link","ikon":"bintang","url":"#rapot"}
   ],
   "event": [
    {"id":"e-20261009-rapat","judul":"Rapat Evaluasi, Peresmian, dan Pembahasan Proker serta Sosialisasi SOP","tanggal":"2026-10-09","jam":"19.30 sampai 21.30","tempat":"RB 03","deskripsi":"Rapat evaluasi, peresmian, pembahasan program kerja, dan sosialisasi SOP Kabinet Samasta.","target":["*"],"absen":"auto"}
   ]
  }
 ]
};
