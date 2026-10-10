/* corner-data.js: data Samasta Corner BEM STDIIS (corner, menu, dan event).
   Jangan diedit manual. Gunakan admin-corner.html, lalu unduh file ini dan unggah ke GitHub.
   Terakhir dibuat: 10/10/2026, 09.00.00 */
window.CORNER = {
 "aspek": [
  "Kepuasan keseluruhan",
  "Materi atau isi acara",
  "Kinerja panitia",
  "Tempat dan fasilitas",
  "Ketepatan waktu"
 ],
 "bukaHari": 2,
 "corner": [
  {
   "id": "kesma",
   "nama": "Kementerian Kesejahteraan Mahasiswa",
   "singkat": "Kesma",
   "tagline": "Kesejahteraan mahasiswa",
   "deskripsi": "Layanan dan program kesejahteraan mahasiswa akan hadir di corner ini.",
   "warna": "emas",
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
   "status": "aktif",
   "unit": "Inspektorat Jenderal",
   "menu": [
    {"id": "event", "judul": "Event", "deskripsi": "Absensi dengan barcode, penilaian peserta, dan pembukuan kegiatan.", "tipe": "event", "ikon": "kalender"},
    {"id": "tentang", "judul": "Tentang Irjen", "deskripsi": "Peran dan cara kerja Inspektorat Jenderal.", "tipe": "info", "ikon": "info", "isi": "Inspektorat Jenderal mengawasi jalannya kegiatan dan kinerja kepengurusan Kabinet Samasta.\n\nYang dikerjakan:\n- Mencatat kehadiran peserta pada setiap kegiatan.\n- Menghimpun penilaian, komentar, dan kritik peserta.\n- Menyusun ringkasan evaluasi untuk bahan perbaikan kegiatan berikutnya."},
    {"id": "anggota", "judul": "Anggota Irjen", "deskripsi": "Susunan anggota Inspektorat Jenderal.", "tipe": "anggota", "ikon": "orang"},
    {"id": "sop", "judul": "SOP dan panduan", "deskripsi": "Prosedur kerja yang menjadi acuan pengawasan.", "tipe": "link", "ikon": "perisai", "url": "#sop"},
    {"id": "rapot", "judul": "Rapot anggota", "deskripsi": "Penilaian kinerja pengurus tiap periode.", "tipe": "link", "ikon": "bintang", "url": "#rapot"}
   ],
   "event": [
    {"id": "e-20261009-rapat", "judul": "Rapat Evaluasi, Peresmian, dan Pembahasan Proker serta Sosialisasi SOP", "tanggal": "2026-10-09", "jam": "19.30 sampai 21.30", "tempat": "RB 03", "deskripsi": "Rapat evaluasi, peresmian, pembahasan program kerja, dan sosialisasi SOP Kabinet Samasta.", "target": ["*"], "absen": "auto"}
   ]
  }
 ]
};
