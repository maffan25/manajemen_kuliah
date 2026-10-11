/* corner-app.js: halaman-halaman Samasta Corner (#corner/...).
   Rute:
     #corner/<corner>                          beranda corner (menu)
     #corner/<corner>/<menu>                   halaman menu (info, anggota, atau event)
     #corner/<corner>/<menu>/absensi           daftar event untuk dibuatkan barcode
     #corner/<corner>/<menu>/absensi/<event>   barcode absensi sebuah event
     #corner/<corner>/<menu>/pembukuan[/<event>]  pembukuan (dikunci kode Irjen)
     #corner/<corner>/isi/<event>              form absensi dan penilaian (dibuka lewat scan barcode)  */
(function () {
  "use strict";
  var app = document.getElementById("corner-app");
  if (!app) return;
  var D = window.CORNER || { corner: [], aspek: [] }, A = window.ANGGOTA || { pimpinan: [], unit: [] };
  D.corner = D.corner || []; D.aspek = D.aspek && D.aspek.length ? D.aspek : ["Kepuasan keseluruhan"];
  var TONES = window.CORNER_TONES || {};
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var top = $("cn-top"), out = $("cn-out");
  var home = $("home"), OTHERS = ["sop-app", "pd-app", "asp-app", "rapot-app"], TITLE0 = document.title;
  var MON = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  var MONL = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  var LABEL = ["", "Kurang", "Cukup", "Baik", "Sangat baik", "Istimewa"];
  var KEY_LOKAL = "bem-corner-lokal-v1", KEY_KODE = "bem-corner-kode";
  var EP = (typeof window.CORNER_ENDPOINT === "string" ? window.CORNER_ENDPOINT : "").replace(/[\s"'\u201C\u201D\u2018\u2019]/g, "");
  var LOKAL = !EP;

  var IC = {
    kalender: '<rect x="3" y="4.5" width="14" height="12.5" rx="2.5"/><path d="M3 8.5h14M7 3v3M13 3v3"/>',
    info: '<circle cx="10" cy="10" r="7.5"/><path d="M10 9v5M10 6.2v.1"/>',
    orang: '<circle cx="7.5" cy="7" r="2.8"/><circle cx="14" cy="8" r="2.2"/><path d="M2.5 16c.4-3.2 2.4-4.8 5-4.8s4.6 1.6 5 4.8M12.5 11.8c2.4-.5 4.6.7 5 4"/>',
    tautan: '<path d="M8.2 11.8l3.6-3.6M7.6 9.4L6.3 10.7a3 3 0 004.2 4.2l1.3-1.3M12.4 10.6l1.3-1.3a3 3 0 00-4.2-4.2L8.2 6.4"/>',
    perisai: '<path d="M10 2.5l6 2.2v4.8c0 3.6-2.4 6.2-6 8-3.6-1.8-6-4.4-6-8V4.7z"/><path d="M7.2 10l2 2 3.6-4"/>',
    bintang: '<path d="M10 2.8l2.1 4.4 4.8.6-3.5 3.3.9 4.8-4.3-2.4-4.3 2.4.9-4.8L3.1 7.8l4.8-.6z"/>',
    pesan: '<path d="M3.5 5h13v8.2h-6.2L7 16.2v-3H3.5z"/>',
    buku: '<path d="M4 3.5h8.5A2.5 2.5 0 0115 6v10.5H6.5A2.5 2.5 0 014 14z"/><path d="M4 14a2.5 2.5 0 012.5-2.5H15"/>',
    papan: '<rect x="4.5" y="4" width="11" height="13" rx="2"/><path d="M8 4V3h4v1M7.5 9h5M7.5 12.5h5"/>',
    bendera: '<path d="M5 17V3.5M5 4.5c3-1.6 5 1.6 9 0v6c-4 1.6-6-1.6-9 0"/>',
    hati: '<path d="M10 16.5s-6.5-4-6.5-8.4C3.5 5.7 5.2 4.3 7 4.3c1.3 0 2.4.7 3 1.8.6-1.1 1.7-1.8 3-1.8 1.8 0 3.5 1.4 3.5 3.8 0 4.4-6.5 8.4-6.5 8.4z"/>',
    gembok: '<rect x="4.5" y="9" width="11" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 016 0V9"/>',
    chevron: '<path d="M7.5 4.5L13 10l-5.500 5.500"/>'
  };
  function ico(k, cls) { return '<svg class="' + (cls || "cn-i") + '" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' + (IC[k] || IC.info) + "</svg>"; }

  /* ---------- util tanggal ---------- */
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function keyOf(d) { return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()); }
  function today() { return keyOf(new Date()); }
  function dp(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function addDays(s, n) { var d = dp(s); d.setDate(d.getDate() + n); return keyOf(d); }
  function dlong(s) { var d = dp(s); return d ? d.getDate() + " " + MONL[d.getMonth()] + " " + d.getFullYear() : ""; }
  function drange(ev) { return ev.tanggalSelesai && ev.tanggalSelesai !== ev.tanggal ? dlong(ev.tanggal) + " sampai " + dlong(ev.tanggalSelesai) : dlong(ev.tanggal); }
  function fmt(v, d) { return (Math.round(v * Math.pow(10, d == null ? 1 : d)) / Math.pow(10, d == null ? 1 : d)).toString().replace(".", ","); }
  function jam(iso) { var d = new Date(iso); return isNaN(d) ? "" : p2(d.getDate()) + " " + MON[d.getMonth()] + " " + p2(d.getHours()) + "." + p2(d.getMinutes()); }
  function norm(s) { return String(s || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim(); }
  function ini(nm) { var w = String(nm).replace(/[^\p{L}\s]/gu, "").trim().split(/\s+/); return ((w[0] || "?")[0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase(); }

  /* ---------- data ---------- */
  function corner(id) { for (var i = 0; i < D.corner.length; i++) if (D.corner[i].id === id) return D.corner[i]; return null; }
  function menuOf(c, id) { var m = (c.menu || []); for (var i = 0; i < m.length; i++) if (m[i].id === id) return m[i]; return null; }
  function eventOf(c, id) { var e = (c.event || []); for (var i = 0; i < e.length; i++) if (e[i].id === id) return e[i]; return null; }
  var reduceM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  /* ---------- pertanyaan penilaian (diatur admin) ---------- */
  function normQ(q, i) { return { id: q.id || "q" + i, teks: String(q.teks || "Pertanyaan " + (i + 1)), tipe: q.tipe === "singkat" || q.tipe === "panjang" ? q.tipe : "bintang", wajib: q.wajib !== false && q.wajib !== 0, bantuan: q.bantuan || "" }; }
  function qsOf(ev) {
    var src = ev && ev.pertanyaan && ev.pertanyaan.length ? ev.pertanyaan : D.pertanyaan;
    if (src && src.length) return src.map(normQ);
    var as = ev && ev.aspek && ev.aspek.length ? ev.aspek : D.aspek, r = as.map(function (a, i) { return { id: "a" + i, teks: a, tipe: "bintang", wajib: true, bantuan: "" }; });
    r.push({ id: "komentar", teks: "Komentar tentang acara", tipe: "panjang", wajib: false, bantuan: "" }, { id: "kritik", teks: "Kritik dan saran", tipe: "panjang", wajib: false, bantuan: "" });
    return r;
  }
  function aspekOf(ev) { return qsOf(ev).filter(function (q) { return q.tipe === "bintang"; }).map(function (q) { return q.teks; }); }
  function penutupOf(ev) {
    var p = ev && ev.penutup && ev.penutup.isi ? ev.penutup : (D.penutup || {});
    return { judul: p.judul || "Terima kasih, {nama}", isi: p.isi || "Kehadiran dan penilaianmu sudah tercatat di pembukuan Inspektorat Jenderal.", ttd: p.ttd || "" };
  }
  function sambutanOf(ev) { return (ev && ev.sambutan) || D.sambutan || ""; }
  function lines(s) { return String(s || "").split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function pairs(s) { return lines(s).map(function (l) { var i = l.indexOf("|"); return i < 0 ? { t: l, d: "" } : { t: l.slice(0, i).trim(), d: l.slice(i + 1).trim() }; }); }
  function unitOf(nama) { var u = null; (A.unit || []).forEach(function (x) { if (x.nama === nama) u = x; }); return u; }
  function cornerKey(c) { return window.cornerIconKey ? window.cornerIconKey(c) : "bintang"; }
  function evStatus(ev) {
    var t = today(), end = ev.tanggalSelesai || ev.tanggal, hari = D.bukaHari == null ? 2 : +D.bukaHari;
    if (ev.absen === "tutup") return { k: "tutup", t: "Ditutup" };
    if (ev.absen === "buka") return { k: "buka", t: "Terbuka" };
    if (t < ev.tanggal) return { k: "nanti", t: "Belum dibuka" };
    if (t <= addDays(end, hari)) return { k: "buka", t: "Terbuka" };
    return { k: "tutup", t: "Ditutup" };
  }
  function sorted(c) { return (c.event || []).slice().sort(function (a, b) { return a.tanggal < b.tanggal ? 1 : a.tanggal > b.tanggal ? -1 : 0; }); }
  function roster(ev) {
    var t = ev.target && ev.target.length ? ev.target : ["*"], all = t.indexOf("*") >= 0, r = [];
    if (all || t.indexOf("Pimpinan") >= 0) (A.pimpinan || []).forEach(function (p) { r.push({ nama: p.nama, bagian: "Pimpinan", ket: p.jabatan }); });
    (A.unit || []).forEach(function (u) { if (all || t.indexOf(u.nama) >= 0) (u.anggota || []).forEach(function (n) { r.push({ nama: n, bagian: u.nama }); }); });
    return r;
  }
  function shortUnit(n) { return String(n).replace(/^(Kementerian|Biro) /, "$1 ").replace(/\s*\(([^)]+)\)\s*$/, " ($1)"); }

  /* ---------- penyimpanan ---------- */
  function lsRows() { try { return JSON.parse(localStorage.getItem(KEY_LOKAL) || "[]"); } catch (e) { return []; } }
  function lsSave(a) { try { localStorage.setItem(KEY_LOKAL, JSON.stringify(a)); } catch (e) {} }
  function kode() { try { return sessionStorage.getItem(KEY_KODE) || ""; } catch (e) { return ""; } }
  function setKode(v) { try { if (v) sessionStorage.setItem(KEY_KODE, v); else sessionStorage.removeItem(KEY_KODE); } catch (e) {} }

  var ERR = {
    aksi: "Permintaan tidak dikenali (kode S0).", data: "Data belum lengkap atau tidak valid (kode S2).", skor: "Penilaian belum lengkap (kode S5).",
    duplikat: "NIM ini sudah mengisi untuk event ini. Satu NIM hanya bisa mengisi satu kali.",
    nosheet: "Skrip belum terhubung ke Spreadsheet (kode S3).", server: "Skrip gagal memproses data (kode S4). Mohon hubungi pengurus.",
    kode: "Kode akses salah.", belumkode: "Kode akses Irjen belum diatur di skrip (isi KODE_AKSES).", tunggu: "Terlalu banyak percobaan salah. Coba lagi 10 menit lagi."
  };
  function post(payload) {
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^\/]+\/exec$/.test(EP)) return Promise.reject({ msg: "Alamat Google Apps Script di corner-config.js belum benar (harus berakhiran /exec)." });
    var ctl = window.AbortController ? new AbortController() : null, to = ctl && setTimeout(function () { ctl.abort(); }, 25000);
    return fetch(EP, { method: "POST", mode: "cors", credentials: "omit", referrerPolicy: "no-referrer", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.text(); })
      .then(function (t) {
        clearTimeout(to); var j = null; try { j = JSON.parse(t); } catch (x) {}
        if (!j) throw { msg: "Respons bukan dari skrip Google (kode N2). Deployment harus diset 'Siapa saja'." };
        return j;
      }, function () { clearTimeout(to); throw { msg: "Tidak bisa menghubungi server (kode N1). Periksa koneksi internet." }; });
  }
  function submitRow(c, ev, row) {
    if (LOKAL) {
      var a = lsRows();
      for (var i = 0; i < a.length; i++) if (a[i].event === ev.id && String(a[i].nim).toUpperCase() === row.nim) return Promise.resolve({ ok: false, error: "duplikat" });
      a.push({ event: ev.id, t: new Date().toISOString(), nim: row.nim, nama: row.nama, bagian: row.bagian, skor: row.skor, komentar: row.komentar, kritik: row.kritik, jawab: row.jawab || {} });
      lsSave(a); return Promise.resolve({ ok: true });
    }
    return post({ aksi: "absen", corner: c.id, event: ev.id, judul: ev.judul, nama: row.nama, nim: row.nim, bagian: row.bagian, skor: row.skor, komentar: row.komentar, kritik: row.kritik, jawab: row.jawab || {}, website: row.website || "" });
  }
  function fetchRows(ev) {
    if (LOKAL) return Promise.resolve({ ok: true, rows: lsRows().filter(function (r) { return r.event === ev.id; }) });
    return post({ aksi: "hasil", event: ev.id, kode: kode() });
  }

  /* ---------- komponen kecil ---------- */
  function stars(v, s) { return '<span class="cn-st" style="--sv:' + (v || 0) + ";--s:" + (s || 16) + 'px" role="img" aria-label="' + fmt(v || 0) + ' dari 5"><i></i></span>'; }
  function note() {
    return LOKAL ? '<p class="cn-mode" role="note"><b>Mode uji.</b> Corner belum tersambung ke Google Sheets, sehingga data hanya tersimpan di peramban ini. Isi <code>corner-config.js</code> untuk mengaktifkannya.</p>' : "";
  }
  function crumbs(list) {
    return '<p class="sp-crumb">' + list.map(function (c, i) { return c[1] && i < list.length - 1 ? '<a href="' + c[1] + '">' + esc(c[0]) + "</a>" : esc(c[0]); }).join(" / ") + "</p>";
  }
  function orbBadge(c) {
    var t = TONES[c.warna] || TONES.zamrud || { o1: "#43b99a", o2: "#14705a", o3: "#093a2f", ot: "#fbe58a" };
    return '<span class="cn-sph-s" data-tone="' + esc(c.warna) + '" style="--o1:' + t.o1 + ";--o2:" + t.o2 + ";--o3:" + t.o3 + ";--ot:" + t.ot + '" aria-hidden="true">' + (window.cornerIcon ? window.cornerIcon(cornerKey(c)) : "") + "</span>";
  }
  function head(c, crumb, title, lead, badge) {
    top.innerHTML = '<div class="cn-head">' + '<div class="cn-head-t">' + crumbs(crumb) + "<h1>" + esc(title) + '</h1><p class="sp-lead">' + esc(lead || "") + "</p></div>" + (badge && c ? orbBadge(c) : "") + "</div>";
  }
  function pill(st) { return '<span class="cn-pill ' + st.k + '">' + esc(st.t) + "</span>"; }
  function back(href, text) { return '<a class="sp-back" href="' + href + '">' + esc(text || "Kembali") + "</a>"; }
  function setTitle(t) { document.title = t + " | BEM STDIIS"; }
  function notFound(c) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"]], "Halaman tidak ditemukan", "Alamat yang kamu buka tidak ada atau sudah diubah.");
    out.innerHTML = '<div class="sp-empty">Periksa kembali barcode atau tautan yang kamu pakai.<a class="link-btn" href="#corner">Kembali ke Samasta Corner</a></div>';
  }

  /* ---------- tampilan: beranda corner ---------- */
  function vSoon(c) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama]], c.nama, c.deskripsi, true);
    setTitle(c.nama);
    var os = ""; for (var i = 0; i < 5; i++) os += '<i style="--k:' + i + '">o</i>';
    out.innerHTML = '<section class="cn-soon" aria-labelledby="cn-soon-t"><p class="cn-soon-t" id="cn-soon-t"><span class="sr">Coming soon</span><span aria-hidden="true">Coming s' + os + "n</span></p>" +
      "<p>Corner " + esc(c.singkat || c.nama) + " sedang disiapkan. Layanan dan informasinya akan muncul di sini.</p>" + back("#corner", "Pilih corner lain") + "</section>";
  }
  function vHub(c) {
    if (c.status === "segera") return vSoon(c);
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama]], c.nama, c.deskripsi, true);
    setTitle(c.nama);
    var m = c.menu || [];
    out.innerHTML = m.length ? '<div class="cn-tiles">' + m.map(function (x) {
      var ext = x.tipe === "link", href = ext ? (x.url || "#corner") : "#corner/" + c.id + "/" + x.id, out_ = ext && /^https?:/i.test(href);
      return '<a class="cn-tile" href="' + esc(href) + '"' + (out_ ? ' target="_blank" rel="noopener noreferrer"' : "") + '><span class="cn-tile-i">' + ico(x.ikon || (x.tipe === "event" ? "kalender" : x.tipe === "anggota" ? "orang" : x.tipe === "profil" ? "perisai" : x.tipe === "panduan" ? "buku" : x.tipe === "link" ? "tautan" : "info")) + "</span>" +
        "<span class=\"cn-tile-b\"><b>" + esc(x.judul) + "</b><small>" + esc(x.deskripsi || "") + "</small></span>" + ico("chevron", "cn-i cn-go") + "</a>";
    }).join("") + "</div>" : '<div class="sp-empty">Belum ada menu di corner ini.</div>';
  }

  /* ---------- tampilan: info dan anggota ---------- */
  function rich(txt) {
    var h = "", lis = [];
    function flush() { if (lis.length) { h += '<ul class="sp-ul">' + lis.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; lis = []; } }
    String(txt || "").split(/\n/).forEach(function (ln) {
      var t = ln.trim();
      if (/^[-•]\s+/.test(t)) lis.push(t.replace(/^[-•]\s+/, ""));
      else if (!t) flush();
      else { flush(); h += "<p>" + esc(t) + "</p>"; }
    });
    flush(); return h;
  }
  function vInfo(c, m) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama, "#corner/" + c.id], [m.judul]], m.judul, m.deskripsi, true);
    setTitle(m.judul + " " + c.singkat);
    out.innerHTML = '<article class="cn-prose">' + (rich(m.isi) || '<p class="cn-muted">Belum ada isi.</p>') + "</article>" + back("#corner/" + c.id, "Kembali ke " + c.singkat);
  }
  function vAnggota(c, m) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama, "#corner/" + c.id], [m.judul]], m.judul, m.deskripsi, true);
    setTitle(m.judul + " " + c.singkat);
    var u = null; (A.unit || []).forEach(function (x) { if (x.nama === (m.unit || c.unit)) u = x; });
    var ls = u ? (u.anggota || []) : [];
    out.innerHTML = (ls.length ? '<div class="sp-bar"><h2>' + esc(u.nama) + "</h2><span>" + ls.length + ' anggota</span></div><ul class="cn-people">' + ls.map(function (n) {
      return '<li><span class="rp-av" aria-hidden="true">' + esc(ini(n)) + "</span><b>" + esc(n) + "</b></li>";
    }).join("") + "</ul>" : '<div class="sp-empty">Daftar anggota belum tersedia.</div>') + back("#corner/" + c.id, "Kembali ke " + c.singkat);
  }

  /* ---------- tampilan: menu event ---------- */
  function vEvent(c, m) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama, "#corner/" + c.id], [m.judul]], m.judul, "Kelola kehadiran dan penilaian kegiatan dari satu tempat.", true);
    setTitle(m.judul + " " + c.singkat);
    var base = "#corner/" + c.id + "/" + m.id, n = (c.event || []).length;
    out.innerHTML = '<div class="cn-tiles cn-tiles-2">' +
      '<a class="cn-tile cn-tile-big" href="' + base + '/absensi"><span class="cn-tile-i">' + ico("kalender") + '</span><span class="cn-tile-b"><b>Absensi</b><small>Buat barcode untuk event. Peserta scan, lalu mengisi data diri dan menjawab pertanyaan penilaian.</small></span>' + ico("chevron", "cn-i cn-go") + "</a>" +
      '<a class="cn-tile cn-tile-big" href="' + base + '/pembukuan"><span class="cn-tile-i">' + ico("papan") + '</span><span class="cn-tile-b"><b>Pembukuan</b><small>Daftar hadir, ringkasan acara, grafik kepuasan, dan semua komentar. Khusus Irjen, dengan kode akses.</small></span>' + ico("chevron", "cn-i cn-go") + "</a></div>" +
      '<div class="cn-flow"><h2 class="cn-h">Alur singkat</h2><ol><li><b>Irjen membuat barcode</b><span>Pilih event di menu Absensi, lalu tampilkan atau cetak barcodenya.</span></li><li><b>Peserta memindai</b><span>Peserta mengisi data diri, lalu menjawab pertanyaan penilaian yang disusun Irjen.</span></li><li><b>Pembukuan terisi sendiri</b><span>Yang mengisi ditandai hadir, yang belum ditandai silang, ringkasan dan grafik tersusun otomatis.</span></li></ol></div>' +
      (n ? "" : '<p class="cn-muted">Belum ada event. Tambahkan lewat halaman admin Corner.</p>') + note() + back("#corner/" + c.id, "Kembali ke " + c.singkat);
  }
  function evCard(c, m, ev, sub, label) {
    var d = dp(ev.tanggal), st = evStatus(ev);
    return '<a class="cn-ev" href="#corner/' + c.id + "/" + m.id + "/" + sub + "/" + esc(ev.id) + '"><span class="cn-date"><b>' + (d ? d.getDate() : "?") + "</b><span>" + (d ? MON[d.getMonth()] : "") + "</span></span>" +
      '<span class="cn-ev-b"><b>' + esc(ev.judul) + '</b><span class="cn-meta">' + [drange(ev), ev.jam, ev.tempat].filter(Boolean).map(function (x) { return "<i>" + esc(x) + "</i>"; }).join("") + "</span></span>" +
      '<span class="cn-ev-r">' + pill(st) + '<em>' + esc(label) + "</em></span></a>";
  }
  function vEvList(c, m, sub, title, lead, label) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama, "#corner/" + c.id], [m.judul, "#corner/" + c.id + "/" + m.id], [title]], title, lead, true);
    setTitle(title + " " + c.singkat);
    var l = sorted(c);
    out.innerHTML = note() + (l.length ? '<div class="sp-bar"><h2>Pilih event</h2><span>' + l.length + " event</span></div><div class=\"cn-evs\">" + l.map(function (e) { return evCard(c, m, e, sub, label); }).join("") + "</div>" : '<div class="sp-empty">Belum ada event. Tambahkan lewat halaman admin Corner.</div>') + back("#corner/" + c.id + "/" + m.id, "Kembali ke " + m.judul);
  }

  /* ---------- tampilan: barcode absensi ---------- */
  function formUrl(c, ev) {
    var base = (window.CORNER_BASE || location.href).split("#")[0];
    return base + "#corner/" + c.id + "/isi/" + ev.id;
  }
  var qrState = null;
  function vQR(c, m, ev) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama, "#corner/" + c.id], [m.judul, "#corner/" + c.id + "/" + m.id], ["Absensi", "#corner/" + c.id + "/" + m.id + "/absensi"], ["Barcode"]], "Barcode absensi", ev.judul, true);
    setTitle("Barcode " + ev.judul);
    var url = formUrl(c, ev), q = null, svg = "", err = "";
    try { q = QR.make(url); svg = QR.svg(q, { border: 2, dark: "#0d2a38", light: "#ffffff", label: "Barcode absensi " + ev.judul }); } catch (x) { err = "Tautan terlalu panjang untuk dibuat barcode."; }
    qrState = { url: url, q: q, c: c, ev: ev };
    var st = evStatus(ev), warn = st.k === "nanti" ? "Absensi baru bisa diisi mulai " + dlong(ev.tanggal) + "." : st.k === "tutup" ? "Absensi untuk event ini sudah ditutup." : "";
    var loc = /^(file:|http:\/\/(localhost|127\.))/.test(url) ? '<p class="cn-mode" role="note"><b>Perhatian.</b> Barcode ini mengarah ke alamat lokal, sehingga tidak bisa dibuka dari ponsel lain. Buka halaman ini dari alamat situs yang sudah tayang, atau isi <code>CORNER_BASE</code> di <code>corner-config.js</code>.</p>' : "";
    out.innerHTML = note() + loc + '<div class="cn-qr">' +
      '<div class="cn-qrbox" id="cn-qrbox"><div class="cn-qrcard">' + (err ? '<p class="cn-err">' + esc(err) + "</p>" : svg) + '<p class="cn-qrcap">Pindai untuk absen dan menilai</p><p class="cn-qrev">' + esc(ev.judul) + "</p></div></div>" +
      '<div class="cn-qrside"><div class="cn-qrinfo"><span class="cn-pill ' + st.k + '">' + esc(st.t) + "</span><h2>" + esc(ev.judul) + '</h2><dl><dt>Tanggal</dt><dd>' + esc(drange(ev)) + "</dd>" + (ev.jam ? "<dt>Jam</dt><dd>" + esc(ev.jam) + "</dd>" : "") + (ev.tempat ? "<dt>Tempat</dt><dd>" + esc(ev.tempat) + "</dd>" : "") + "<dt>Target</dt><dd>" + roster(ev).length + " pengurus</dd></dl>" + (warn ? '<p class="cn-warn">' + esc(warn) + "</p>" : "") + "</div>" +
      '<div class="cn-act"><button type="button" class="btn btn-gold" data-a="full">Layar penuh</button><button type="button" class="btn btn-line cn-dark" data-a="png">Unduh poster PNG</button><button type="button" class="btn btn-line cn-dark" data-a="print">Cetak</button></div>' +
      '<div class="cn-url"><label for="cn-url-i">Tautan form absensi</label><div><input id="cn-url-i" readonly value="' + esc(url) + '"><button type="button" class="btn btn-line cn-dark" data-a="copy">Salin</button></div><p id="cn-url-s" role="status"></p></div>' +
      '<div class="cn-act"><a class="btn btn-line cn-dark" href="#corner/' + c.id + "/isi/" + esc(ev.id) + '">Coba isi formulir</a><a class="btn btn-line cn-dark" href="#corner/' + c.id + "/" + m.id + "/pembukuan/" + esc(ev.id) + '">Buka pembukuan</a></div></div></div>' +
      back("#corner/" + c.id + "/" + m.id + "/absensi", "Kembali ke daftar event");
  }
  function say(el, t) { var s = $(el); if (s) s.textContent = t; }
  function wrapText(ctx, text, maxW) {
    var words = text.split(" "), line = "", lines = [];
    words.forEach(function (w) { var t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line); return lines;
  }
  function poster() {
    if (!qrState || !qrState.q) return;
    var W = 1080, H = 1500, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var x = cv.getContext("2d"), ev = qrState.ev;
    x.fillStyle = "#0d2a38"; x.fillRect(0, 0, W, H);
    var g = x.createRadialGradient(W * 0.85, H, 50, W * 0.85, H, 900); g.addColorStop(0, "rgba(248,210,74,.28)"); g.addColorStop(1, "rgba(248,210,74,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.textAlign = "center"; x.fillStyle = "#f8d24a"; x.font = "600 34px Georgia,serif"; x.fillText("BEM STDIIS  |  Kabinet Samasta", W / 2, 110);
    x.fillStyle = "#ffffff"; x.font = "700 64px Georgia,serif";
    var ls = wrapText(x, ev.judul, 880).slice(0, 4), y = 220; ls.forEach(function (l) { x.fillText(l, W / 2, y); y += 78; });
    x.fillStyle = "#cde0dc"; x.font = "500 34px sans-serif"; y += 8;
    x.fillText([drange(ev), ev.jam].filter(Boolean).join("  |  "), W / 2, y); y += 50; if (ev.tempat) { x.fillText(ev.tempat, W / 2, y); y += 50; }
    var s = 760, qx = (W - s) / 2, qy = Math.max(y + 40, 520), q = qrState.q, n = q.size + 4, px = s / n;
    x.fillStyle = "#fff"; x.beginPath(); if (x.roundRect) x.roundRect(qx - 36, qy - 36, s + 72, s + 72, 36); else x.rect(qx - 36, qy - 36, s + 72, s + 72); x.fill();
    x.fillStyle = "#0d2a38"; for (var j = 0; j < q.size; j++) for (var i = 0; i < q.size; i++) if (q.get(i, j)) x.fillRect(qx + (i + 2) * px, qy + (j + 2) * px, Math.ceil(px), Math.ceil(px));
    x.fillStyle = "#f8d24a"; x.font = "700 52px Georgia,serif"; x.fillText("Pindai untuk absen dan menilai", W / 2, qy + s + 130);
    x.fillStyle = "#cde0dc"; x.font = "500 30px sans-serif"; x.fillText("Isi nama, NIM, bagian, penilaian bintang, dan komentar.", W / 2, qy + s + 180);
    cv.toBlob(function (b) {
      var a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "barcode-absensi-" + ev.id + ".png";
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    }, "image/png");
  }

  /* ---------- tampilan: form absensi (dibuka lewat scan) ---------- */
  var RATE_HINT = ["", "Kurang", "Cukup", "Baik", "Sangat baik", "Istimewa"];
  /* ---------- GERBANG ABSENSI: halaman setelah barcode dipindai ---------- */
  var STAR_WORD = ["", "Kurang", "Cukup", "Baik", "Sangat baik", "Istimewa"];
  var GI = {
    kal: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12.5" rx="2.5"/><path d="M3 8.5h14M7 3v3M13 3v3"/></svg>',
    jam: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4.2l2.8 1.6"/></svg>',
    pin: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 17.5s5.5-4.7 5.5-9A5.5 5.5 0 004.5 8.5c0 4.3 5.5 9 5.5 9z"/><circle cx="10" cy="8.5" r="2"/></svg>',
    next: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10.5 5l5 5-5 5"/></svg>',
    prev: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 10H5M9.5 5l-5 5 5 5"/></svg>',
    send: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10l14-6-5 14-2.6-5.4z"/></svg>'
  };
  function gtBg() {
    var h = "", i, seed = 11;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (i = 0; i < 14; i++) h += '<i style="--x:' + (rnd() * 96).toFixed(1) + "%;--w:" + (6 + rnd() * 22).toFixed(0) + "px;--t:" + (11 + rnd() * 12).toFixed(1) + "s;--dl:-" + (rnd() * 18).toFixed(1) + "s;--dx:" + ((rnd() - 0.5) * 90).toFixed(0) + "px;--b:" + (rnd() * 2.4).toFixed(1) + 'px"></i>';
    return '<div class="gt-bg" aria-hidden="true"><div class="gt-pat"></div><div class="gt-bk">' + h + "</div></div>";
  }
  var ARCH = '<svg class="gt-arch" viewBox="0 0 330 210" aria-hidden="true" focusable="false"><path class="a1" d="M20 210V112C20 52 124 26 165 3c41 23 145 49 145 109v98"/><path class="a2" d="M42 210V116c0-48 86-72 123-92 37 20 123 44 123 92v94"/><path class="a3 dash" d="M64 210V120c0-38 70-60 101-72 31 12 101 34 101 72v90"/></svg>';
  function gtHero(c, ev, st, steps, cur) {
    var meta = [[GI.kal, drange(ev)], [GI.jam, ev.jam], [GI.pin, ev.tempat]].filter(function (x) { return x[1]; }).map(function (x) { return "<span>" + x[0] + esc(x[1]) + "</span>"; }).join("");
    var sm = sambutanOf(ev);
    return '<header class="gt-hero">' + ARCH + '<div class="gt-seal"><div class="gt-logo" role="img" aria-label="Logo BEM STDIIS"></div><i></i><i></i></div>' +
      '<p class="gt-kick"><span>Samasta Corner · ' + esc(c.nama) + "</span></p><h1 class=\"gt-title\">" + esc(ev.judul) + '</h1><div class="gt-meta">' + meta + "</div>" +
      (sm && st.k === "buka" && cur === 0 ? '<p class="gt-welcome">' + esc(sm) + "</p>" : "") +
      (steps ? '<ol class="gt-steps" id="gt-steps" aria-label="Langkah">' + steps.map(function (s, i) { return '<li class="' + (i === cur ? "on" : i < cur ? "done" : "") + '"><span>' + esc(s) + "</span></li>"; }).join("") + "</ol>" : "") + "</header>";
  }
  var GT_FOOT = '<p class="gt-foot">BEM STDIIS · Kabinet Samasta</p>';
  function qField(q, i) {
    var tag = q.wajib ? '<span class="gt-tag w">Wajib</span>' : '<span class="gt-tag o">Opsional</span>';
    var h = '<div class="gt-q" data-i="' + i + '"><div class="gt-qh"><div class="gt-qt" id="gq' + i + '">' + esc(q.teks) + (q.bantuan ? "<em>" + esc(q.bantuan) + "</em>" : "") + "</div>" + tag + "</div>";
    if (q.tipe === "bintang") {
      h += '<div class="gt-stars" role="radiogroup" aria-labelledby="gq' + i + '">';
      for (var v = 5; v >= 1; v--) h += '<input type="radio" name="q' + i + '" id="q' + i + "-" + v + '" value="' + v + '"><label for="q' + i + "-" + v + '" title="' + v + " dari 5: " + STAR_WORD[v] + '"><span class="sr">' + v + " dari 5</span></label>";
      h += '</div><span class="gt-rv" id="gv' + i + '" aria-live="polite">' + (q.wajib ? "Ketuk bintang untuk menilai" : "Boleh dilewati") + "</span>";
    } else if (q.tipe === "singkat") h += '<input class="gt-in" id="gi' + i + '" maxlength="120" placeholder="Jawaban singkatmu" aria-labelledby="gq' + i + '">';
    else h += '<textarea class="gt-in" id="gi' + i + '" maxlength="1000" rows="4" placeholder="Tulis di sini..." aria-labelledby="gq' + i + '"></textarea>';
    return h + "</div>";
  }
  function vForm(c, ev) {
    var st = evStatus(ev), qs = qsOf(ev);
    document.body.classList.add("cn-gate"); top.innerHTML = "";
    setTitle("Absensi " + ev.judul);
    if (st.k !== "buka") {
      out.innerHTML = '<div class="gt">' + gtBg() + gtHero(c, ev, st, null, 0) + '<div class="gt-card"><div class="gt-lock"><span class="gt-lock-i">' + ico("gembok") + '</span><h2 class="gt-h">' + (st.k === "nanti" ? "Absensi belum dibuka" : "Absensi sudah ditutup") + "</h2><p>" +
        (st.k === "nanti" ? "Formulir ini bisa diisi mulai " + esc(dlong(ev.tanggal)) + "." : "Formulir untuk event ini tidak lagi menerima isian. Hubungi Inspektorat Jenderal bila kamu merasa seharusnya masih bisa mengisi.") + '</p><a class="gt-btn" href="#corner">Ke Samasta Corner</a></div></div>' + GT_FOOT + "</div>";
      return;
    }
    var steps = qs.length ? ["Data diri", "Penilaian", "Selesai"] : ["Data diri", "Selesai"], did = "";
    try { did = localStorage.getItem("bem-corner-sudah-" + ev.id) || ""; } catch (x) {}
    var qh = ""; qs.forEach(function (q, i) { qh += qField(q, i); });
    var many = qs.length > 0;
    out.innerHTML = '<div class="gt" id="gt">' + gtBg() + gtHero(c, ev, st, steps, 0) +
      '<form class="gt-card" id="cn-form" novalidate autocomplete="off">' +
      '<section class="gt-stepwrap" data-s="0"><h2 class="gt-h">Siapa kamu?</h2><p class="gt-sub">Data ini dipakai untuk mencatat kehadiranmu.</p>' +
      (did ? '<p class="gt-did" role="status">Perangkat ini sudah dipakai mengisi atas nama <b>' + esc(did) + "</b>. Kamu tetap bisa mengisi untuk orang lain.</p>" : "") +
      '<label class="gt-f"><span>Bagian di BEM</span><select class="gt-in" id="f-bagian" required>' + bagianOptions() + "</select></label>" +
      '<label class="gt-f" id="w-nama"><span>Nama</span><select class="gt-in" id="f-nama" disabled required><option value="">Pilih bagian dulu</option></select></label>' +
      '<label class="gt-f" id="w-nama2" hidden><span>Nama lengkap</span><input class="gt-in" id="f-nama2" maxlength="80" autocomplete="name"></label>' +
      '<label class="gt-f"><span>NIM</span><input class="gt-in" id="f-nim" maxlength="20" inputmode="text" autocapitalize="characters" placeholder="Contoh: 2024010001" required></label>' +
      '<p class="gt-err" id="f-err0" role="alert"></p>' +
      '<div class="gt-act"><button type="' + (many ? "button" : "submit") + '" class="gt-btn" id="gt-next"><span>' + (many ? "Lanjut ke penilaian" : "Kirim kehadiran") + "</span>" + (many ? GI.next : GI.send) + "</button></div></section>" +
      (many ? '<section class="gt-stepwrap" data-s="1" hidden><h2 class="gt-h">Bagaimana acaranya?</h2><p class="gt-sub">Jawabanmu jujur dan tanpa dinilai. Pertanyaan bertanda <b>Wajib</b> harus diisi.</p>' +
        '<div class="gt-prog" aria-hidden="true"><span id="gt-pc">0 dari ' + qs.length + ' terjawab</span><div><i id="gt-pb"></i></div></div>' + qh +
        '<input class="asp-hp" type="text" name="cn_extra_field" id="f-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<p class="gt-err" id="f-err1" role="alert"></p><div class="gt-act"><button type="button" class="gt-btn ghost" id="gt-back">' + GI.prev + '<span>Kembali</span></button><button type="submit" class="gt-btn" id="f-send"><span>Kirim kehadiran</span>' + GI.send + "</button></div></section>" : '<input class="asp-hp" type="text" name="cn_extra_field" id="f-hp" tabindex="-1" autocomplete="off" aria-hidden="true">') +
      (LOKAL ? '<p class="gt-note">Mode uji: data hanya tersimpan di peramban ini.</p>' : '<p class="gt-note">Datamu dicatat di pembukuan Inspektorat Jenderal.</p>') +
      "</form>" + GT_FOOT + "</div>";
    wireForm(c, ev, qs, steps);
  }
  function bagianOptions() {
    var o = '<option value="">Pilih bagianmu</option>';
    if ((A.pimpinan || []).length) o += '<option value="Pimpinan">Pimpinan</option>';
    (A.unit || []).forEach(function (u) { o += '<option value="' + esc(u.nama) + '">' + esc(u.nama) + "</option>"; });
    return o + '<option value="Tamu">Bukan pengurus BEM (tamu)</option>';
  }
  function wireForm(c, ev, qs, steps) {
    var form = $("cn-form"), selB = $("f-bagian"), selN = $("f-nama"), busy = false, step = 0, gt = $("gt");
    function setStep(n, back) {
      step = n;
      [].forEach.call(form.querySelectorAll(".gt-stepwrap"), function (s) {
        var on = +s.getAttribute("data-s") === n; s.hidden = !on;
        if (on) { s.classList.toggle("back", !!back); s.style.animation = "none"; void s.offsetWidth; s.style.animation = ""; }
      });
      [].forEach.call(gt.querySelectorAll("#gt-steps li"), function (li, i) { li.className = i === n ? "on" : i < n ? "done" : ""; });
      var w = gt.querySelector(".gt-welcome"); if (w) w.hidden = n !== 0;
      var el = $("gt-steps"); if (el && el.scrollIntoView) el.scrollIntoView({ block: "start", behavior: reduceM ? "auto" : "smooth" });
    }
    selB.addEventListener("change", function () {
      var b = selB.value, free = b === "Tamu";
      $("w-nama").hidden = free; $("w-nama2").hidden = !free; $("f-nama2").value = "";
      if (!b) { selN.disabled = true; selN.innerHTML = '<option value="">Pilih bagian dulu</option>'; return; }
      if (free) return;
      var ls = b === "Pimpinan" ? (A.pimpinan || []).map(function (p) { return p.nama; }) : ((A.unit || []).filter(function (u) { return u.nama === b; })[0] || { anggota: [] }).anggota;
      selN.disabled = false;
      selN.innerHTML = '<option value="">Pilih namamu</option>' + ls.map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + "</option>"; }).join("") + '<option value="__lain">Namaku tidak ada di daftar</option>';
    });
    selN.addEventListener("change", function () { var other = selN.value === "__lain"; $("w-nama2").hidden = !other; if (other) $("f-nama2").focus(); });
    function answered(i) {
      var q = qs[i];
      if (q.tipe === "bintang") return !!form.querySelector('input[name="q' + i + '"]:checked');
      return !!$("gi" + i).value.trim();
    }
    function refresh() {
      var n = 0; qs.forEach(function (q, i) { var ok = answered(i), box = form.querySelector('.gt-q[data-i="' + i + '"]'); if (ok) n++; if (box) { box.classList.toggle("ok", ok); if (ok) box.classList.remove("bad"); } });
      var pc = $("gt-pc"), pb = $("gt-pb"); if (pc) pc.textContent = n + " dari " + qs.length + " terjawab"; if (pb) pb.parentNode.style.setProperty("--p", (qs.length ? n / qs.length * 100 : 0) + "%"), pb.style.setProperty("--p", (qs.length ? n / qs.length * 100 : 0) + "%");
    }
    form.addEventListener("change", function (e) {
      var r = e.target; if (r.type === "radio") { var i = r.name.slice(1), rv = $("gv" + i); rv.textContent = r.value + " dari 5: " + STAR_WORD[r.value]; rv.classList.add("set"); }
      refresh();
    });
    form.addEventListener("input", function (e) { if (e.target.classList.contains("gt-in")) { e.target.classList.remove("bad"); refresh(); } });

    function bad0(msg, el) { $("f-err0").textContent = msg; if (el) { el.classList.add("bad"); el.focus(); if (el.scrollIntoView) el.scrollIntoView({ block: "center", behavior: "smooth" }); } return false; }
    function ident() {
      var b = selB.value, other = b === "Tamu" || selN.value === "__lain", nama = other ? $("f-nama2").value.trim() : selN.value, nim = $("f-nim").value.trim().toUpperCase().replace(/\s+/g, "");
      [].forEach.call(form.querySelectorAll(".gt-in.bad"), function (x) { x.classList.remove("bad"); }); $("f-err0").textContent = "";
      if (!b) return bad0("Pilih bagianmu di BEM.", selB) && null;
      if (!nama || nama.length < 3) { bad0(other ? "Tulis nama lengkapmu." : "Pilih namamu dari daftar.", other ? $("f-nama2") : selN); return null; }
      if (!/^[0-9A-Z.\-]{5,20}$/.test(nim)) { bad0("NIM harus 5 sampai 20 karakter (angka atau huruf).", $("f-nim")); return null; }
      return { nama: nama, nim: nim, bagian: b };
    }
    var nx = $("gt-next");
    if (nx && qs.length) nx.addEventListener("click", function () { if (ident()) setStep(1, false); });
    var bk = $("gt-back"); if (bk) bk.addEventListener("click", function () { setStep(0, true); });

    form.addEventListener("submit", function (e) {
      e.preventDefault(); if (busy) return;
      var who = ident(); if (!who) { if (step !== 0) setStep(0, true); return; }
      var err = $("f-err1") || $("f-err0"); err.textContent = "";
      var skor = {}, jawab = {}, komentar = "", kritik = "", firstBad = null;
      qs.forEach(function (q, i) {
        var box = form.querySelector('.gt-q[data-i="' + i + '"]'), val;
        if (q.tipe === "bintang") { var ch = form.querySelector('input[name="q' + i + '"]:checked'); if (ch) skor[q.teks] = +ch.value; val = ch ? "1" : ""; }
        else { val = $("gi" + i).value.trim(); if (val) { if (q.id === "komentar") komentar = val; else if (q.id === "kritik") kritik = val; else jawab[q.teks] = val; } }
        if (q.wajib && !val) { if (box) box.classList.add("bad"); if (!firstBad) firstBad = box; }
      });
      if (firstBad) { err.textContent = "Masih ada pertanyaan wajib yang belum dijawab."; if (firstBad.scrollIntoView) firstBad.scrollIntoView({ block: "center", behavior: "smooth" }); setTimeout(function () { [].forEach.call(form.querySelectorAll(".gt-q.bad"), function (b) { b.classList.remove("bad"); }); }, 1600); return; }
      if (($("f-hp") || {}).value) { done(who.nama); return; }
      busy = true; var btn = $("f-send") || $("gt-next"), lbl = btn.querySelector("span"), old = lbl.textContent; btn.disabled = true; lbl.textContent = "Mengirim...";
      submitRow(c, ev, { nama: who.nama, nim: who.nim, bagian: who.bagian, skor: skor, komentar: komentar, kritik: kritik, jawab: jawab })
        .then(function (j) {
          busy = false; btn.disabled = false; lbl.textContent = old;
          if (j && j.ok) { try { localStorage.setItem("bem-corner-sudah-" + ev.id, who.nama); } catch (x) {} done(who.nama); }
          else err.textContent = ERR[j && j.error] || ERR.server;
        }, function (x) { busy = false; btn.disabled = false; lbl.textContent = old; err.textContent = x && x.msg ? x.msg : ERR.server; });
    });
    function done(nama) {
      var pen = penutupOf(ev), first = String(nama).split(" ")[0];
      function tok(s) { return String(s).replace(/\{nama\}/gi, first).replace(/\{event\}/gi, ev.judul); }
      var paras = tok(pen.isi).split(/\n\s*\n/).map(function (p) { return "<p>" + esc(p.trim()).replace(/\n/g, "<br>") + "</p>"; }).join("");
      var cols = ["#f8d24a", "#43b99a", "#fff3b0", "#14705a", "#ffe27a", "#7fe3c6"], cf = "", i, seed = 5;
      function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      for (i = 0; i < 34; i++) { var ang = rnd() * Math.PI * 2, d = 90 + rnd() * 150; cf += '<i style="--c:' + cols[i % cols.length] + ";--dx:" + Math.round(Math.cos(ang) * d) + "px;--dy:" + Math.round(Math.sin(ang) * d * 0.8 + 70) + "px;--r:" + Math.round((rnd() - 0.5) * 900) + "deg;--w:" + (5 + Math.round(rnd() * 6)) + "px;--h:" + (8 + Math.round(rnd() * 8)) + "px;--dl:" + (0.5 + rnd() * 0.35).toFixed(2) + 's"></i>'; }
      [].forEach.call(gt.querySelectorAll("#gt-steps li"), function (li) { li.className = "done"; });
      var sl = gt.querySelectorAll("#gt-steps li"); if (sl.length) sl[sl.length - 1].className = "on";
      var w = gt.querySelector(".gt-welcome"); if (w) w.hidden = true;
      form.outerHTML = '<div class="gt-card"><div class="gt-done" role="status"><div class="gt-conf" aria-hidden="true">' + cf + '</div><div class="gt-check"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="a" cx="32" cy="32" r="28"/><path class="b" pathLength="1" d="M20 33l8 8 17-19"/></svg></div>' +
        '<h2 class="gt-h">' + esc(tok(pen.judul)) + '</h2><div class="gt-orn"><i></i></div><div class="gt-msg">' + paras + (pen.ttd ? '<p class="gt-ttd">' + esc(tok(pen.ttd)) + "</p>" : "") + "</div>" +
        '<div class="gt-act"><a class="gt-btn" href="#corner/' + c.id + "/isi/" + esc(ev.id) + '" data-again><span>Isi untuk orang lain</span></a><a class="gt-btn ghost" href="#corner"><span>Ke Samasta Corner</span></a></div></div></div>';
      var el = $("gt-steps"); if (el && el.scrollIntoView) el.scrollIntoView({ block: "start", behavior: "smooth" }); else window.scrollTo(0, 0);
    }
  }

  /* ---------- tampilan: profil lembaga (pengertian, tugas, struktur interaktif) ---------- */
  var ORG = null;
  function safeImg(u) { return /^[\w\-.\/%]+$/.test(u || "") ? u : ""; }
  function orgDetail(i) {
    var o = ORG, p = o.names[i], pr = (o.prof[i] || {}), lead = i === 0;
    var role = lead ? o.jk : (pr.peran || "Anggota"), para = lead ? o.m.perananKepala : o.m.perananAnggota, tg = lines(lead ? o.m.tugasKepala : o.m.tugasAnggota);
    var meta = [pr.panggilan && "Panggilan: " + pr.panggilan, pr.prodi, pr.angkatan && "Angkatan " + pr.angkatan].filter(Boolean).map(function (x) { return '<span class="pj" style="background:rgba(255,255,255,.14);color:#fff;margin-right:6px">' + esc(x) + "</span>"; }).join("");
    return '<h3>' + esc(p) + '</h3><span class="pj">' + esc(role) + "</span>" + (meta ? "<div>" + meta + "</div>" : "") +
      (para ? "<p>" + esc(para) + "</p>" : "") + (tg.length ? "<ul>" + tg.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" : "") +
      (pr.motto ? '<p style="margin:12px 0 0;font-style:italic">“' + esc(pr.motto) + "”</p>" : "");
  }
  function orgSelect(i) {
    var box = out.querySelector(".org"); if (!box || !ORG) return;
    [].forEach.call(box.querySelectorAll(".org-n"), function (b) { var on = +b.getAttribute("data-n") === i; b.setAttribute("aria-pressed", on); });
    [].forEach.call(box.querySelectorAll(".org-kid"), function (k, j) { k.classList.toggle("on", j + 1 === i); });
    var st = box.querySelector(".org-stub.s2"); if (st) st.classList.toggle("on", i > 0);
    var d = $("org-det"); if (d) { d.innerHTML = orgDetail(i); d.style.animation = "none"; void d.offsetWidth; d.style.animation = ""; }
  }
  function vProfil(c, m) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama, "#corner/" + c.id], [m.judul]], m.judul, m.deskripsi, true);
    setTitle(m.judul + " " + c.singkat);
    var u = unitOf(m.unit || c.unit), names = u ? (u.anggota || []) : [], prof = u ? (u.profil || []) : [], jk = (u && u.jabatanKepala) || "Ketua", h = "";
    var def = lines(m.pengertian);
    if (def.length) h += '<section class="pf-sec"><h2>Pengertian</h2><div class="pf-def"><span class="pf-shield" aria-hidden="true">' + (window.cornerIcon ? window.cornerIcon(cornerKey(c)) : "") + "</span><div><blockquote>" + esc(def[0]) + "</blockquote>" + def.slice(1).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div></div></section>";
    var tg = pairs(m.tugas);
    if (tg.length) h += '<section class="pf-sec"><h2>Tugas dan fungsi</h2><p class="pf-lead">Yang dikerjakan ' + esc(c.singkat) + ' sepanjang periode.</p><ol class="pf-tasks">' + tg.map(function (t) { return '<li class="pf-task"><b>' + esc(t.t) + "</b><span>" + esc(t.d) + "</span></li>"; }).join("") + "</ol></section>";
    if (names.length) {
      var kids = names.slice(1).map(function (n, k) { return '<div class="org-kid">' + orgNode(n, prof[k + 1], k + 1, false, "Anggota") + "</div>"; }).join("");
      var watch = ['<span class="g">Pimpinan</span>'].concat((A.unit || []).filter(function (x) { return x.nama !== u.nama; }).map(function (x) { return "<span>" + esc(shortUnit(x.nama)) + "</span>"; })).join("");
      h += '<section class="pf-sec"><h2>Struktur dan anggota</h2><p class="pf-lead">' + names.length + " orang. Ketuk kartu untuk melihat peran dan tanggung jawab masing-masing.</p>" +
        '<div class="org"><div class="org-top"><span class="org-up"><i>' + ico("perisai") + "</i>" + esc(m.atas || "Presiden BEM") + '</span></div><div class="org-stub"><b>bertanggung jawab langsung</b></div>' +
        '<div class="org-lvl">' + orgNode(names[0], prof[0], 0, true, jk) + "</div>" + (kids ? '<div class="org-stub s2"></div><div class="org-kids">' + kids + "</div>" : "") +
        '<div class="org-det" id="org-det" aria-live="polite"></div>' +
        '<div class="org-watch"><h4>MENGAWASI SELURUH LINI BEM</h4><div class="org-chips">' + watch + "</div></div></div></section>";
    }
    var pr2 = pairs(m.prinsip);
    if (pr2.length) h += '<section class="pf-sec"><h2>Prinsip kerja</h2><ul class="pf-prin">' + pr2.map(function (t) { return "<li><b>" + esc(t.t) + "</b><span>" + esc(t.d) + "</span></li>"; }).join("") + "</ul></section>";
    out.innerHTML = '<div class="pf">' + (h || '<p class="cn-muted">Belum ada isi.</p>') + "</div>" + back("#corner/" + c.id, "Kembali ke " + c.singkat);
    ORG = names.length ? { m: m, names: names, prof: prof, jk: jk } : null;
    if (ORG) orgSelect(0);
  }
  function orgNode(n, pr, i, lead, role) {
    pr = pr || {}; var f = safeImg(pr.foto);
    return '<button type="button" class="org-n' + (lead ? " org-lead" : "") + '" data-n="' + i + '" aria-pressed="false"><span class="org-av"' + (f ? ' style="background-image:url(' + esc(f) + ')"' : "") + ">" + (f ? "" : esc(ini(n))) + "</span><b>" + esc(n) + "</b><small>" + esc((pr.peran) || role) + "</small></button>";
  }

  /* ---------- tampilan: SOP dan buku panduan ---------- */
  function sopTj(s) {
    if (s.tj) return s.tj;
    var t = (s.s || []).filter(function (x) { return x.t === "Tujuan"; })[0];
    return t && t.c && t.c[0] && t.c[0].p || "";
  }
  function sopCard(s) {
    return '<a class="sp-card" href="#sop/' + esc(s.c) + '"><span class="sp-code">' + esc(s.c) + "</span><b>" + esc(s.t) + "</b><p>" + esc(sopTj(s)) + '</p><span class="sp-tags"><i>' + esc(s.o) + "</i><i>Rev " + esc(s.r) + "</i></span></a>";
  }
  function vPanduan(c, m) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama, "#corner/" + c.id], [m.judul]], m.judul, m.deskripsi, true);
    setTitle(m.judul + " " + c.singkat);
    var h = "", key = String(m.buku || "").replace(/[^a-z0-9\-]/gi, ""), u = unitOf(m.unit || c.unit), kick = (u && u.grup) || "Buku panduan", nm = m.bukuNama || (u && u.nama) || c.nama;
    if (key) {
      var f = "panduan/" + key + ".pdf";
      h += '<section class="pg-books"><article class="pd-book"><div class="pd-cover"><span class="pd-mark"></span><small>BUKU PANDUAN</small><b class="pd-kick">' + esc(kick) + "</b><h4>" + esc(nm) + '</h4><i class="pd-foot">BEM STDIIS · Kabinet Samasta</i></div>' +
        '<div class="pd-act"><a class="btn btn-line pd-open" href="' + f + '" target="_blank" rel="noopener">Buka</a><a class="btn btn-gold pd-dl" href="' + f + '" download="Buku Panduan ' + esc(nm) + '.pdf">Unduh PDF</a></div></article>' +
        "<div><h2>Buku Panduan " + esc(nm) + "</h2><p>Pegangan kerja lengkap: fungsi dan peran, struktur, sistem pengawasan dan rapor, whistleblowing, roadmap, hingga master checklist.</p></div></section>";
    }
    var S = window.SOP_DATA || [], re = m.sopKode ? new RegExp("^SOP-" + String(m.sopKode).replace(/[^A-Z0-9]/gi, "") + "-") : null, own = m.sopPemilik || "";
    var core = S.filter(function (s) { return re && re.test(s.c); }), rel = S.filter(function (s) { return !(re && re.test(s.c)) && own && String(s.o || "").indexOf(own) >= 0; });
    if (core.length || rel.length) {
      h += '<section class="pg-sops"><div class="sp-bar"><h2>SOP ' + esc(c.singkat) + "</h2><span>" + (core.length + rel.length) + " prosedur</span></div>" +
        (core.length ? '<h3 class="sp-gh">SOP inti ' + esc(c.singkat) + '</h3><div class="sp-cards">' + core.map(sopCard).join("") + "</div>" : "") +
        (rel.length ? '<h3 class="sp-gh">SOP lain yang dipegang ' + esc(c.singkat) + '</h3><div class="sp-cards">' + rel.map(sopCard).join("") + "</div>" : "") +
        '<p style="margin-top:18px"><a class="link-btn" href="#sop">Buka seluruh Pusat SOP</a></p></section>';
    }
    out.innerHTML = '<div class="pg">' + (h || '<div class="sp-empty">Belum ada SOP atau buku panduan untuk bagian ini.</div>') + "</div>" + back("#corner/" + c.id, "Kembali ke " + c.singkat);
  }

  /* ---------- tampilan: pembukuan ---------- */
  var cache = {}, tab = "hadir", filt = "semua", q = "", hideNames = false, RC = null;
  function vLock(c, m, ev, msg) {
    var sub = ev ? "/" + ev.id : "";
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama, "#corner/" + c.id], [m.judul, "#corner/" + c.id + "/" + m.id], ["Pembukuan"]], "Pembukuan Irjen", "Daftar hadir, ringkasan acara, grafik kepuasan, dan komentar peserta.", true);
    setTitle("Pembukuan " + c.singkat);
    out.innerHTML = '<form class="cn-lock" id="cn-lock" novalidate><span class="cn-closed-i">' + ico("gembok") + "</span><h2>Khusus Inspektorat Jenderal</h2><p>Masukkan kode akses untuk membuka pembukuan. Kode ini diperiksa oleh server, bukan oleh halaman ini.</p>" +
      '<label class="cn-f"><span>Kode akses</span><input type="password" id="cn-code" autocomplete="current-password" required></label><p class="cn-err" id="cn-lock-e" role="alert">' + esc(msg || "") + '</p><button type="submit" class="btn btn-gold">Buka pembukuan</button></form>' + back("#corner/" + c.id + "/" + m.id, "Kembali ke " + m.judul);
    $("cn-lock").addEventListener("submit", function (e) {
      e.preventDefault(); var v = $("cn-code").value.trim(); if (!v) { say("cn-lock-e", "Isi kode akses dulu."); return; }
      setKode(v); cache = {}; route();
    });
    setTimeout(function () { var i = $("cn-code"); if (i) i.focus(); }, 50);
  }
  function vBookList(c, m) {
    if (!LOKAL && !kode()) return vLock(c, m, null);
    vEvList(c, m, "pembukuan", "Pembukuan", "Pilih event untuk melihat daftar hadir, ringkasan, dan komentar.", "Buka pembukuan");
    out.insertAdjacentHTML("afterbegin", !LOKAL ? '<div class="cn-unlocked"><span>' + ico("gembok", "cn-i") + 'Pembukuan terbuka untuk sesi ini.</span><button type="button" class="link-btn" data-a="lock">Kunci kembali</button></div>' : "");
  }
  function compute(c, ev, rows) {
    var ro = roster(ev), aspek = aspekOf(ev), byN = {}, used = {};
    rows.forEach(function (r) { var k = norm(r.nama); if (!byN[k]) byN[k] = r; });
    var hadir = [], absen = [];
    ro.forEach(function (p) { var r = byN[norm(p.nama)]; if (r) { hadir.push({ p: p, r: r }); used[norm(p.nama)] = 1; } else absen.push({ p: p }); });
    var tamu = rows.filter(function (r) { return !used[norm(r.nama)]; });
    var keys = aspek.slice(); rows.forEach(function (r) { Object.keys(r.skor || {}).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); }); });
    var avg = keys.map(function (k) { var v = rows.map(function (r) { return r.skor && r.skor[k]; }).filter(function (x) { return typeof x === "number"; }); return { k: k, n: v.length, v: v.length ? v.reduce(function (a, b) { return a + b; }, 0) / v.length : null }; });
    var main = keys[0], dist = [0, 0, 0, 0, 0]; rows.forEach(function (r) { var s = r.skor && r.skor[main]; if (s >= 1 && s <= 5) dist[s - 1]++; });
    var rated = avg.filter(function (a) { return a.v != null; });
    var qs = qsOf(ev), tq = qs.filter(function (q) { return q.tipe !== "bintang" && q.id !== "komentar" && q.id !== "kritik"; }), seen = {};
    tq.forEach(function (q) { seen[q.teks] = 1; }); rows.forEach(function (r) { Object.keys(r.jawab || {}).forEach(function (k) { if (!seen[k]) { seen[k] = 1; tq.push({ id: "x", teks: k, tipe: "panjang" }); } }); });
    var jaw = tq.map(function (q) { return { q: q, items: rows.filter(function (r) { return r.jawab && r.jawab[q.teks]; }).map(function (r) { return { r: r, a: r.jawab[q.teks] }; }) }; });
    function qt(id, d) { var f = qs.filter(function (q) { return q.id === id; })[0]; return f ? f.teks : d; }
    return { jaw: jaw, nj: jaw.reduce(function (a, j) { return a + j.items.length; }, 0), kt: qt("komentar", "Komentar"), krt: qt("kritik", "Kritik dan saran"), c: c, ev: ev, rows: rows, ro: ro, hadir: hadir, absen: absen, tamu: tamu, aspek: keys, avg: avg, main: main, dist: dist, kep: avg[0] && avg[0].v,
      hi: rated.slice().sort(function (a, b) { return b.v - a.v; })[0], lo: rated.slice().sort(function (a, b) { return a.v - b.v; })[0],
      kom: rows.filter(function (r) { return r.komentar; }), kri: rows.filter(function (r) { return r.kritik; }) };
  }
  function lab(v) { return v >= 4.5 ? "sangat baik" : v >= 3.5 ? "baik" : v >= 2.5 ? "cukup" : "perlu perbaikan"; }
  function narasi(R) {
    var ev = R.ev, N = R.ro.length, H = R.hadir.length, p = [];
    p.push("Acara “" + ev.judul + "” berlangsung pada " + drange(ev) + (ev.tempat ? " di " + ev.tempat : "") + ". " + (N ? "Dari " + N + " pengurus yang ditargetkan, " + H + " hadir dan mengisi absensi (" + Math.round(H / N * 100) + "%)" + (R.absen.length ? ", sedangkan " + R.absen.length + " belum mengisi" : ", dan seluruhnya hadir") + "." : "Acara ini tidak memiliki daftar target.") + (R.tamu.length ? " Ada " + R.tamu.length + " peserta di luar daftar target yang ikut mengisi." : ""));
    if (!R.rows.length) { p.push("Belum ada peserta yang mengisi penilaian. Barcode absensi dapat dibuat di menu Absensi."); return p; }
    var pos = R.dist[3] + R.dist[4], tot = R.dist.reduce(function (a, b) { return a + b; }, 0);
    p.push("Kepuasan keseluruhan rata-rata " + fmt(R.kep) + " dari 5 (" + lab(R.kep) + "), dinilai oleh " + tot + " peserta; " + Math.round(pos / (tot || 1) * 100) + "% memberi nilai 4 atau 5.");
    var low = R.avg.filter(function (a) { return a.v != null && a.v < 3.5; });
    if (R.avg.length > 1 && R.hi) p.push("Aspek dengan nilai tertinggi adalah “" + R.hi.k + "” (" + fmt(R.hi.v) + "), sedangkan yang terendah “" + R.lo.k + "” (" + fmt(R.lo.v) + "). " + (low.length ? "Perlu perhatian: " + low.map(function (a) { return a.k + " (" + fmt(a.v) + ")"; }).join(", ") + "." : "Tidak ada aspek dengan nilai di bawah 3,5."));
    p.push("Terkumpul " + R.kom.length + " komentar dan " + R.kri.length + " kritik atau saran. Semuanya dimuat pada tab Komentar.");
    return p;
  }
  function donut(h, n) {
    var tot = h + n, pct = tot ? h / tot : 0, C = 2 * Math.PI * 42;
    return '<svg class="cn-donut" viewBox="0 0 110 110" role="img" aria-label="' + h + " hadir dari " + tot + '"><circle cx="55" cy="55" r="42" class="bg"/><circle cx="55" cy="55" r="42" class="fg" style="--c:' + C.toFixed(1) + ";--p:" + (pct * C).toFixed(1) + '" transform="rotate(-90 55 55)"/><text x="55" y="53" text-anchor="middle" class="n">' + Math.round(pct * 100) + '%</text><text x="55" y="70" text-anchor="middle" class="s">hadir</text></svg>';
  }
  function cols(dist) {
    var max = Math.max.apply(null, dist.concat([1])), mode = dist.indexOf(Math.max.apply(null, dist)), h = "";
    for (var i = 0; i < 5; i++) h += '<div class="cn-col' + (dist[i] && i === mode ? " top" : "") + '"><span class="n">' + dist[i] + '</span><span class="bar"><i style="--h:' + (dist[i] / max * 100).toFixed(1) + '%"></i></span><b>' + (i + 1) + '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.8l2.4 5 5.5.7-4 3.8 1 5.4L10 14l-4.9 2.7 1-5.4-4-3.8 5.500-.7z"/></svg></b></div>';
    return '<div class="cn-cols" role="img" aria-label="Sebaran nilai kepuasan: ' + dist.map(function (d, i) { return d + " orang memberi " + (i + 1); }).join(", ") + '">' + h + "</div>";
  }
  function hbars(items, cls) {
    return '<ul class="cn-hb ' + (cls || "") + '">' + items.map(function (a) { return "<li><span>" + esc(a.k) + '</span><div class="cn-hbt"><i style="--w:' + (a.pct).toFixed(1) + '%"></i></div><b>' + a.txt + "</b></li>"; }).join("") + "</ul>";
  }
  function vBook(c, m, ev) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama, "#corner/" + c.id], [m.judul, "#corner/" + c.id + "/" + m.id], ["Pembukuan", "#corner/" + c.id + "/" + m.id + "/pembukuan"], ["Rekap"]], "Pembukuan event", ev.judul, true);
    setTitle("Pembukuan " + ev.judul);
    out.innerHTML = note() + '<div class="cn-loading" role="status"><i></i><span>Memuat data dari server...</span></div>';
    var token = ++renderToken;
    if (!RC || RC.ev.id !== ev.id) { tab = "hadir"; filt = "semua"; q = ""; }
    fetchRows(ev).then(function (j) {
      if (token !== renderToken) return;
      if (!j.ok) { if (j.error === "kode" || j.error === "belumkode" || j.error === "tunggu") { if (j.error === "kode") setKode(""); return vLock(c, m, ev, ERR[j.error]); } return fail(ERR[j.error] || ERR.server); }
      RC = compute(c, ev, j.rows || []); cache[ev.id] = RC; paintBook(m);
    }, function (x) { if (token === renderToken) fail(x && x.msg ? x.msg : ERR.server); });
    function fail(msg) { out.innerHTML = '<div class="cn-closed"><h2>Pembukuan belum bisa dimuat</h2><p>' + esc(msg) + '</p><div class="cn-act"><button type="button" class="btn btn-gold" data-a="reload">Coba lagi</button></div></div>'; }
  }
  var renderToken = 0;
  function paintBook(m) {
    var R = RC, ev = R.ev, c = R.c, N = R.ro.length, H = R.hadir.length;
    var nBy = {}; R.ro.forEach(function (p) { (nBy[p.bagian] = nBy[p.bagian] || { n: 0, h: 0 }).n++; }); R.hadir.forEach(function (x) { nBy[x.p.bagian].h++; });
    var by = Object.keys(nBy).map(function (k) { return { k: shortUnit(k), pct: nBy[k].h / nBy[k].n * 100, txt: nBy[k].h + "/" + nBy[k].n }; });
    var kpi = '<div class="cn-kpis"><div class="cn-kpi"><small>Kehadiran</small><b>' + H + "<span> dari " + N + '</span></b><em>' + (N ? Math.round(H / N * 100) : 0) + "% target" + (R.tamu.length ? ", +" + R.tamu.length + " tamu" : "") + "</em></div>" +
      '<div class="cn-kpi"><small>Kepuasan</small><b>' + (R.kep != null ? fmt(R.kep) : "-") + "<span> / 5</span></b><em>" + (R.kep != null ? stars(R.kep, 15) + " " + lab(R.kep) : "Belum ada penilaian") + "</em></div>" +
      '<div class="cn-kpi"><small>Penilai</small><b>' + R.rows.length + '<span> orang</span></b><em>' + esc(R.aspek.length + " aspek dinilai") + "</em></div>" +
      '<div class="cn-kpi"><small>Masukan</small><b>' + (R.kom.length + R.kri.length + R.nj) + '<span> tulisan</span></b><em>' + R.kom.length + " komentar, " + R.kri.length + " kritik" + (R.nj ? ", " + R.nj + " jawaban lain" : "") + "</em></div></div>";
    var tabs = '<div class="cn-tabs" role="tablist">' + [["hadir", "Kehadiran"], ["ringkas", "Ringkasan"], ["komen", "Komentar"]].map(function (t) { return '<button type="button" role="tab" class="chip" data-tab="' + t[0] + '" aria-pressed="' + (tab === t[0]) + '" aria-selected="' + (tab === t[0]) + '">' + t[1] + "</button>"; }).join("") + "</div>";
    out.innerHTML = note() + '<div class="cn-bar"><span class="cn-evinfo"><span class="cn-meta">' + [drange(ev), ev.jam, ev.tempat].filter(Boolean).map(function (x) { return "<i>" + esc(x) + "</i>"; }).join("") + '</span></span><span class="cn-bar-a"><button type="button" class="btn btn-line cn-dark sm" data-a="reload">Muat ulang</button><button type="button" class="btn btn-line cn-dark sm" data-a="csv">Unduh CSV</button><button type="button" class="btn btn-gold sm" data-a="print">Cetak atau PDF</button></span></div>' +
      kpi + tabs + '<div id="cn-panel"></div>' + back("#corner/" + c.id + "/" + m.id + "/pembukuan", "Kembali ke daftar pembukuan");
    out._by = by; paintTab();
  }
  function paintTab() {
    var R = RC, p = $("cn-panel"); if (!p) return;
    [].forEach.call(out.querySelectorAll("[data-tab]"), function (b) { var on = b.getAttribute("data-tab") === tab; b.setAttribute("aria-pressed", on); b.setAttribute("aria-selected", on); });
    p.innerHTML = '<section class="cn-pn" data-p="hadir" ' + (tab === "hadir" ? "" : "hidden") + ">" + panelHadir(R) + '</section><section class="cn-pn" data-p="ringkas" ' + (tab === "ringkas" ? "" : "hidden") + ">" + panelRingkas(R) + '</section><section class="cn-pn" data-p="komen" ' + (tab === "komen" ? "" : "hidden") + ">" + panelKomen(R) + "</section>";
    list();
  }
  function groupRows(R) {
    var g = {}, order = [];
    R.hadir.forEach(function (x) { var k = x.p.bagian; if (!g[k]) { g[k] = []; order.push(k); } g[k].push({ nama: x.p.nama, ok: true, r: x.r }); });
    R.absen.forEach(function (x) { var k = x.p.bagian; if (!g[k]) { g[k] = []; order.push(k); } g[k].push({ nama: x.p.nama, ok: false }); });
    var ro = []; R.ro.forEach(function (p) { if (ro.indexOf(p.bagian) < 0) ro.push(p.bagian); });
    return { g: g, order: ro.filter(function (k) { return g[k]; }) };
  }
  function panelHadir(R) {
    return '<div class="cn-fl"><input type="search" id="cn-q" placeholder="Cari nama atau NIM" aria-label="Cari nama atau NIM" value="' + esc(q) + '"><div class="cn-chips">' +
      [["semua", "Semua " + (R.ro.length + R.tamu.length)], ["hadir", "Hadir " + (R.hadir.length + R.tamu.length)], ["tidak", "Tidak hadir " + R.absen.length]].map(function (f) { return '<button type="button" class="chip" data-f="' + f[0] + '" aria-pressed="' + (filt === f[0]) + '">' + f[1] + "</button>"; }).join("") + '</div></div><div id="cn-list"></div>';
  }
  function list() {
    var box = $("cn-list"); if (!box) return;
    var R = RC, G = groupRows(R), s = norm(q), h = "", total = 0;
    function row(x) {
      var hit = !s || norm(x.nama + " " + (x.r ? x.r.nim : "")).indexOf(s) >= 0;
      if (!hit || (filt === "hadir" && !x.ok) || (filt === "tidak" && x.ok)) return "";
      total++;
      return '<li class="cn-r ' + (x.ok ? "ok" : "no") + '"><span class="cn-mark" aria-hidden="true">' + (x.ok ? '<svg viewBox="0 0 20 20"><path d="M5 10.5l3.2 3.2L15 6.8"/></svg>' : '<svg viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8"/></svg>') + '</span><span class="cn-r-n"><b>' + esc(x.nama) + '</b><small>' + (x.ok ? esc(x.r.nim) + " · " + jam(x.r.t) : "Belum mengisi") + '</small></span><span class="cn-r-s">' + (x.ok ? (R.main && x.r.skor && x.r.skor[R.main] ? '<em>' + x.r.skor[R.main] + "</em>" + stars(x.r.skor[R.main], 13) : "") : '<em class="sr">Tidak hadir</em>') + "</span></li>";
    }
    G.order.forEach(function (k) {
      var rows = G.g[k].map(row).join(""); if (!rows) return;
      var hh = G.g[k].filter(function (x) { return x.ok; }).length;
      h += '<h3 class="cn-gh">' + esc(shortUnit(k)) + "<small>" + hh + "/" + G.g[k].length + ' hadir</small></h3><ul class="cn-rl">' + rows + "</ul>";
    });
    var tm = R.tamu.filter(function (r) { return (filt !== "tidak") && (!s || norm(r.nama + " " + r.nim).indexOf(s) >= 0); });
    if (tm.length) { total += tm.length; h += '<h3 class="cn-gh">Di luar daftar target<small>' + tm.length + ' tamu atau nama tak cocok</small></h3><ul class="cn-rl">' + tm.map(function (r) {
      return '<li class="cn-r ok"><span class="cn-mark" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M5 10.5l3.2 3.2L15 6.8"/></svg></span><span class="cn-r-n"><b>' + esc(r.nama) + '</b><small>' + esc(r.nim) + " · " + esc(r.bagian === "Tamu" ? "Tamu" : shortUnit(r.bagian)) + " · " + jam(r.t) + '</small></span><span class="cn-r-s">' + (R.main && r.skor && r.skor[R.main] ? "<em>" + r.skor[R.main] + "</em>" + stars(r.skor[R.main], 13) : "") + "</span></li>"; }).join("") + "</ul>"; }
    box.innerHTML = total ? h : '<div class="sp-empty">' + (R.ro.length || R.tamu.length ? "Tidak ada nama yang cocok." : "Event ini belum punya daftar target.") + "</div>";
  }
  function panelRingkas(R) {
    var by = out._by || [], dist = R.rows.length;
    return '<article class="cn-sum"><h2 class="cn-h">Ringkasan acara</h2>' + narasi(R).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") + "</article>" +
      '<div class="cn-charts"><section class="cn-ch"><h3>Kehadiran</h3><div class="cn-ch-d">' + donut(R.hadir.length, R.absen.length) + '<ul class="cn-leg"><li><i class="ok"></i>Hadir <b>' + R.hadir.length + '</b></li><li><i class="no"></i>Tidak hadir <b>' + R.absen.length + "</b></li>" + (R.tamu.length ? '<li><i class="gu"></i>Di luar daftar <b>' + R.tamu.length + "</b></li>" : "") + "</ul></div></section>" +
      '<section class="cn-ch"><h3>Sebaran kepuasan <small>' + esc(R.main || "") + "</small></h3>" + (dist ? cols(R.dist) : '<p class="cn-muted">Belum ada penilaian.</p>') + "</section>" +
      '<section class="cn-ch cn-wide"><h3>Nilai rata-rata per aspek</h3>' + (dist ? hbars(R.avg.map(function (a) { return { k: a.k, pct: (a.v || 0) / 5 * 100, txt: a.v == null ? "-" : fmt(a.v) }; }), "au") : '<p class="cn-muted">Belum ada penilaian.</p>') + "</section>" +
      '<section class="cn-ch cn-wide"><h3>Kehadiran per bagian</h3>' + (by.length ? hbars(by) : '<p class="cn-muted">Tidak ada data.</p>') + "</section></div>";
  }
  function cmCard(R, r, txt) { var sc = R.main && r.skor ? r.skor[R.main] : 0; return '<li class="cn-cm"><p>' + esc(txt) + '</p><span class="cn-cm-f">' + (sc ? stars(sc, 13) : "") + '<span class="cn-who">' + (hideNames ? "Peserta anonim" : esc(r.nama) + ", " + esc(r.bagian === "Tamu" ? "Tamu" : shortUnit(r.bagian))) + "</span></span></li>"; }
  function panelJawab(R) {
    return R.jaw.filter(function (j) { return j.items.length; }).map(function (j) {
      var body;
      if (j.q.tipe === "singkat") {
        var g = {}; j.items.forEach(function (x) { var k = norm(x.a); if (!g[k]) g[k] = { t: x.a, n: 0 }; g[k].n++; });
        body = '<ul class="cn-wd">' + Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return b.n - a.n; }).map(function (a) { return "<li>" + esc(a.t) + (a.n > 1 ? "<b>×" + a.n + "</b>" : "") + "</li>"; }).join("") + "</ul>";
      } else body = '<ul class="cn-cms">' + j.items.map(function (x) { return cmCard(R, x.r, x.a); }).join("") + "</ul>";
      return '<section class="cn-ans"><h3 class="cn-gh">' + esc(j.q.teks) + "<small>" + j.items.length + " jawaban</small></h3>" + body + "</section>";
    }).join("");
  }
  function panelKomen(R) {
    return '<div class="cn-fl"><label class="cn-sw"><input type="checkbox" id="cn-hide"' + (hideNames ? " checked" : "") + "><span>Sembunyikan nama pengirim</span></label></div>" +
      '<div class="cn-cmcols"><section><h3 class="cn-gh">' + esc(R.kt) + '<small>' + R.kom.length + '</small></h3>' + (R.kom.length ? '<ul class="cn-cms">' + R.kom.map(function (r) { return cmCard(R, r, r.komentar); }).join("") + "</ul>" : '<p class="cn-muted">Belum ada jawaban.</p>') + "</section>" +
      '<section><h3 class="cn-gh">' + esc(R.krt) + '<small>' + R.kri.length + '</small></h3>' + (R.kri.length ? '<ul class="cn-cms kr">' + R.kri.map(function (r) { return cmCard(R, r, r.kritik); }).join("") + "</ul>" : '<p class="cn-muted">Belum ada jawaban.</p>') + "</section></div>" + panelJawab(R);
  }
  function csv() {
    var R = RC; if (!R) return;
    function c(v) { v = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; }
    var jq = R.jaw.map(function (j) { return j.q.teks; });
    function jv(r) { return jq.map(function (k) { return r && r.jawab ? r.jawab[k] || "" : ""; }); }
    var rows = [["Bagian", "Nama", "NIM", "Status", "Waktu isi"].concat(R.aspek, ["Komentar", "Kritik"], jq)];
    R.hadir.forEach(function (x) { rows.push([x.p.bagian, x.p.nama, x.r.nim, "Hadir", x.r.t].concat(R.aspek.map(function (k) { return x.r.skor ? x.r.skor[k] : ""; }), [x.r.komentar, x.r.kritik], jv(x.r))); });
    R.absen.forEach(function (x) { rows.push([x.p.bagian, x.p.nama, "", "Tidak hadir", ""].concat(R.aspek.map(function () { return ""; }), ["", ""], jq.map(function () { return ""; }))); });
    R.tamu.forEach(function (r) { rows.push([r.bagian, r.nama, r.nim, "Di luar daftar", r.t].concat(R.aspek.map(function (k) { return r.skor ? r.skor[k] : ""; }), [r.komentar, r.kritik], jv(r))); });
    var txt = "\uFEFF" + rows.map(function (r) { return r.map(c).join(","); }).join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/csv;charset=utf-8" })); a.download = "pembukuan-" + R.ev.id + ".csv";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  /* ---------- router ---------- */
  var shown = null;
  function route() {
    var h = location.hash, p = h.slice(1).split("?")[0].split("/");
    var c = corner(decodeURIComponent(p[1] || ""));
    document.body.classList.remove("cn-print-poster", "cn-gate");
    if (!c) return notFound(null);
    var seg = p[2], sub = p[3], eid = p[4] ? decodeURIComponent(p[4]) : "";
    if (!seg) return vHub(c);
    if (c.status === "segera") return vSoon(c);
    if (seg === "isi") { var ev0 = eventOf(c, decodeURIComponent(sub || "")); return ev0 ? vForm(c, ev0) : notFound(c); }
    var m = menuOf(c, seg); if (!m) return notFound(c);
    if (m.tipe === "info") return vInfo(c, m);
    if (m.tipe === "anggota") return vAnggota(c, m);
    if (m.tipe === "profil") return vProfil(c, m);
    if (m.tipe === "panduan") return vPanduan(c, m);
    if (m.tipe !== "event") return vHub(c);
    if (!sub) return vEvent(c, m);
    if (sub === "absensi") { if (!eid) return vEvList(c, m, "absensi", "Absensi", "Pilih event, lalu buat barcode yang akan dipindai peserta.", "Buat barcode"); var e1 = eventOf(c, eid); return e1 ? vQR(c, m, e1) : notFound(c); }
    if (sub === "pembukuan") { if (!eid) return vBookList(c, m); if (!LOKAL && !kode()) return vLock(c, m, eventOf(c, eid)); var e2 = eventOf(c, eid); return e2 ? vBook(c, m, e2) : notFound(c); }
    notFound(c);
  }
  function setNav(on) {
    [].forEach.call(document.querySelectorAll(".nav a"), function (a) {
      if (on) a.classList.toggle("active", a.getAttribute("href") === "#corner");
      else if (a.getAttribute("href") === "#corner" && shown !== null) a.classList.remove("active");
    });
  }
  function sync() {
    var h = location.hash, on = /^#corner\//.test(h);
    if (on) {
      var fresh = app.hidden;
      home.hidden = true; OTHERS.forEach(function (i) { var n = $(i); if (n) n.hidden = true; }); app.hidden = false;
      setNav(true);
      if (fresh || shown !== h) { shown = h; route(); window.scrollTo(0, 0); }
    } else if (!app.hidden) { document.body.classList.remove("cn-gate"); app.hidden = true; document.title = TITLE0; setNav(false); shown = null; }
  }
  function go(h) { if (location.hash !== h) { try { history.pushState(null, "", h); } catch (x) { location.hash = h; return; } } sync(); }
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var a = e.target.closest('a[href^="#corner/"]'); if (!a) return;
    e.preventDefault(); var h = a.getAttribute("href");
    if (h === location.hash && a.hasAttribute("data-again")) { shown = null; }
    go(h);
  }, true);
  document.addEventListener("click", function (e) { if (e.target.closest('a[href^="#"]')) setTimeout(sync, 0); });
  window.addEventListener("hashchange", sync);
  window.addEventListener("popstate", sync);

  out.addEventListener("click", function (e) {
    var nd = e.target.closest("[data-n]"); if (nd && ORG) { orgSelect(+nd.getAttribute("data-n")); return; }
    var b = e.target.closest("[data-a],[data-tab],[data-f]"); if (!b) return;
    var a = b.getAttribute("data-a");
    if (b.hasAttribute("data-tab")) { tab = b.getAttribute("data-tab"); paintTab(); return; }
    if (b.hasAttribute("data-f")) { filt = b.getAttribute("data-f"); [].forEach.call(out.querySelectorAll("[data-f]"), function (x) { x.setAttribute("aria-pressed", x === b); }); list(); return; }
    if (a === "full") { var bx = $("cn-qrbox"); if (bx && bx.requestFullscreen) bx.requestFullscreen(); else if (bx && bx.webkitRequestFullscreen) bx.webkitRequestFullscreen(); }
    if (a === "png") poster();
    if (a === "print") { window.print(); }
    if (a === "copy") {
      var t = qrState && qrState.url; if (!t) return;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { say("cn-url-s", "Tautan disalin."); }, function () { say("cn-url-s", "Gagal menyalin. Tekan lama pada kolom tautan."); });
      else { $("cn-url-i").select(); say("cn-url-s", "Tekan salin pada menu peramban."); }
    }
    if (a === "reload") { cache = {}; shown = null; sync(); }
    if (a === "csv") csv();
    if (a === "lock") { setKode(""); cache = {}; route(); }
  });
  out.addEventListener("keydown", function (e) {
    var n = e.target.closest && e.target.closest(".org-n"); if (!n || !ORG) return;
    var k = e.key, i = +n.getAttribute("data-n"), t = k === "ArrowRight" || k === "ArrowDown" ? i + 1 : k === "ArrowLeft" || k === "ArrowUp" ? i - 1 : null;
    if (t === null || t < 0 || t >= ORG.names.length) return; e.preventDefault(); orgSelect(t); var nb = out.querySelector('.org-n[data-n="' + t + '"]'); if (nb) nb.focus();
  });
  out.addEventListener("input", function (e) { if (e.target.id === "cn-q") { q = e.target.value.trim(); list(); } });
  out.addEventListener("change", function (e) { if (e.target.id === "cn-hide") { hideNames = e.target.checked; var p = out.querySelector('[data-p="komen"]'); if (p) p.innerHTML = panelKomen(RC); } });

  sync();
})();
