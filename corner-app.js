/* corner-app.js: halaman-halaman Samasta Corner (#corner/...).
   Rute:
     #corner/<corner>                          beranda corner (menu)
     #corner/<corner>/<menu>                   halaman menu (info, anggota, profil, atau event)
     #corner/<corner>/<menu>/absensi           daftar event untuk dibuatkan barcode
     #corner/<corner>/<menu>/absensi/<event>   barcode absensi sebuah event
     #corner/<corner>/<menu>/pembukuan[/<event>]  pembukuan (dikunci kode Irjen)
     #corner/<corner>/isi/<event>              pengalaman peserta (dibuka lewat scan barcode)  */
(function () {
  "use strict";
  var app = document.getElementById("corner-app");
  if (!app) return;
  var D = window.CORNER || { corner: [] }, A = window.ANGGOTA || { pimpinan: [], unit: [] };
  D.corner = D.corner || [];
  var TONES = window.CORNER_TONES || {}, CI = window.CORNER_ICONS;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var top = $("cn-top"), out = $("cn-out");
  var home = $("home"), OTHERS = ["sop-app", "pd-app", "asp-app", "rapot-app"], TITLE0 = document.title;
  var MON = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  var MONL = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  var RATE_HINT = ["", "Kurang", "Cukup", "Baik", "Sangat baik", "Istimewa"];
  var KEY_LOKAL = "bem-corner-lokal-v2", KEY_KODE = "bem-corner-kode";
  var EP = (typeof window.CORNER_ENDPOINT === "string" ? window.CORNER_ENDPOINT : "").replace(/[\s"'“”‘’]/g, "");
  var LOKAL = !EP;
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  var IC = {
    kalender: '<rect x="3" y="4.5" width="14" height="12.5" rx="2.5"/><path d="M3 8.5h14M7 3v3M13 3v3"/>',
    info: '<circle cx="10" cy="10" r="7.5"/><path d="M10 9v5M10 6.2v.1"/>',
    orang: '<circle cx="7.5" cy="7" r="2.8"/><circle cx="14" cy="8" r="2.2"/><path d="M2.5 16c.4-3.2 2.4-4.8 5-4.8s4.6 1.6 5 4.8M12.5 11.8c2.4-.5 4.6.7 5 4"/>',
    tautan: '<path d="M8.2 11.8l3.6-3.6M7.6 9.4L6.3 10.7a3 3 0 004.2 4.2l1.3-1.3M12.4 10.6l1.3-1.3a3 3 0 00-4.2-4.2L8.2 6.4"/>',
    perisai: '<path d="M10 2.5l6 2.2v4.8c0 3.6-2.4 6.2-6 8-3.6-1.8-6-4.4-6-8V4.7z"/><path d="M7.2 10l2 2 3.6-4"/>',
    bintang: '<path d="M10 2.8l2.1 4.4 4.8.6-3.5 3.3.9 4.8-4.3-2.4-4.3 2.4.9-4.8L3.1 7.8l4.8-.6z"/>',
    pesan: '<path d="M3.5 5h13v8.2h-6.2L7 16.200v-3H3.5z"/>',
    buku: '<path d="M4 3.5h8.5A2.5 2.5 0 0115 6v10.5H6.5A2.5 2.5 0 014 14z"/><path d="M4 14a2.5 2.5 0 012.5-2.5H15"/>',
    papan: '<rect x="4.5" y="4" width="11" height="13" rx="2"/><path d="M8 4V3h4v1M7.5 9h5M7.5 12.5h5"/>',
    bendera: '<path d="M5 17V3.5M5 4.5c3-1.6 5 1.6 9 0v6c-4 1.6-6-1.6-9 0"/>',
    hati: '<path d="M10 16.5s-6.5-4-6.5-8.4C3.5 5.7 5.2 4.3 7 4.3c1.3 0 2.4.7 3 1.8.6-1.1 1.7-1.8 3-1.8 1.8 0 3.5 1.4 3.5 3.8 0 4.4-6.5 8.4-6.5 8.4z"/>',
    gembok: '<rect x="4.5" y="9" width="11" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 016 0V9"/>',
    jam: '<circle cx="10" cy="10" r="7.5"/><path d="M10 5.800V10l3 1.800"/>',
    lokasi: '<path d="M10 17.500s5.500-4.700 5.500-9.200a5.500 5.500 0 00-11 0c0 4.500 5.500 9.200 5.500 9.200z"/><circle cx="10" cy="8.300" r="2"/>',
    chevron: '<path d="M7.5 4.5L13 10l-5.500 5.500"/>'
  };
  function ico(k, cls) { return '<svg class="' + (cls || "cn-i") + '" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' + (IC[k] || IC.info) + "</svg>"; }

  /* ---------- util ---------- */
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
  function ini(nm) { var w = String(nm).replace(/[.,]/g, " ").split(/\s+/).filter(function (x) { return x && !/^(cds|m)$/i.test(x); }); return ((w[0] || "?").charAt(0) + (w.length > 1 ? w[1].charAt(0) : "")).toUpperCase(); }
  function say(el, t) { var s = $(el); if (s) s.textContent = t; }
  function para(txt) { return String(txt || "").split(/\n{2,}|\n/).map(function (x) { return x.trim(); }).filter(Boolean); }

  /* ---------- data ---------- */
  function corner(id) { for (var i = 0; i < D.corner.length; i++) if (D.corner[i].id === id) return D.corner[i]; return null; }
  function menuOf(c, id) { var m = (c.menu || []); for (var i = 0; i < m.length; i++) if (m[i].id === id) return m[i]; return null; }
  function eventOf(c, id) { var e = (c.event || []); for (var i = 0; i < e.length; i++) if (e[i].id === id) return e[i]; return null; }
  function tone(c) { return TONES[c.warna] || TONES.zamrud || { o1: "#43b99a", o2: "#14705a", o3: "#093a2f", ot: "#fbe58a", ia: "#0b4a3b", glow: "67,185,154" }; }
  function toneStyle(c) { var t = tone(c); return "--o1:" + t.o1 + ";--o2:" + t.o2 + ";--o3:" + t.o3 + ";--ot:" + t.ot + ";--ia:" + t.ia + ";--glow:" + t.glow; }
  /* Soal: dari event bila ada, kalau tidak dari soal umum */
  function soalList(ev) {
    var src = ev && ev.soal && ev.soal.length ? ev.soal : (D.soal && D.soal.length ? D.soal : [{ id: "kepuasan", t: "Kepuasan keseluruhan", tipe: "bintang", wajib: true }]);
    return src.map(function (q, i) { return { id: q.id || "q" + i, t: q.t || "Soal " + (i + 1), tipe: q.tipe || "bintang", wajib: !!q.wajib, bantu: q.bantu || "", pilihan: (q.pilihan || []).slice() }; });
  }
  function penutupOf(ev) {
    var a = D.penutup || {}, b = (ev && ev.penutup) || {}, o = {};
    ["judul", "isi", "salam", "tombol", "url"].forEach(function (k) { o[k] = b[k] != null && b[k] !== "" ? b[k] : (a[k] != null ? a[k] : ""); });
    if (!o.judul) o.judul = "Terima kasih, {nama}!"; if (!o.tombol) { o.tombol = "Ke Samasta Corner"; o.url = o.url || "#corner"; }
    return o;
  }
  function fill(t, nama, ev) { return String(t || "").replace(/\{nama_lengkap\}/g, nama).replace(/\{nama\}/g, String(nama).split(" ")[0]).replace(/\{event\}/g, ev.judul); }
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
  function shortUnit(n) { return String(n).replace(/\s*\(([^)]+)\)\s*$/, " ($1)"); }

  /* ---------- penyimpanan ---------- */
  function lsRows() { try { return JSON.parse(localStorage.getItem(KEY_LOKAL) || "[]"); } catch (e) { return []; } }
  function lsSave(a) { try { localStorage.setItem(KEY_LOKAL, JSON.stringify(a)); } catch (e) {} }
  function kode() { try { return sessionStorage.getItem(KEY_KODE) || ""; } catch (e) { return ""; } }
  function setKode(v) { try { if (v) sessionStorage.setItem(KEY_KODE, v); else sessionStorage.removeItem(KEY_KODE); } catch (e) {} }

  var ERR = {
    aksi: "Permintaan tidak dikenali (kode S0).", data: "Data belum lengkap atau tidak valid (kode S2).", skor: "Jawabanmu belum lengkap (kode S5).",
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
      a.push({ event: ev.id, t: new Date().toISOString(), nim: row.nim, nama: row.nama, bagian: row.bagian, jawab: row.jawab, skor: row.skor, komentar: row.komentar, kritik: row.kritik });
      lsSave(a); return Promise.resolve({ ok: true });
    }
    return post({ aksi: "absen", corner: c.id, event: ev.id, judul: ev.judul, nama: row.nama, nim: row.nim, bagian: row.bagian, jawab: row.jawab, skor: row.skor, komentar: row.komentar, kritik: row.kritik, website: row.website || "" });
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
  function orbMarkup(c, cls) {
    return '<span class="' + (cls || "cn-fl") + '" style="' + toneStyle(c) + '"><span class="cn-orbit" aria-hidden="true"></span><span class="cn-sph">' + CI.svg(c.ikon || "bintang", "cn-ico") + '</span><i class="cn-sp s1" aria-hidden="true"></i><i class="cn-sp s3" aria-hidden="true"></i></span>';
  }
  function orbBadge(c) { return '<span class="cn-badge" aria-hidden="true">' + orbMarkup(c, "cn-badge-in") + "</span>"; }
  function head(c, crumb, title, lead, badge) {
    top.innerHTML = '<div class="cn-head"><div class="cn-head-t">' + crumbs(crumb) + "<h1>" + esc(title) + '</h1><p class="sp-lead">' + esc(lead || "") + "</p></div>" + (badge && c ? orbBadge(c) : "") + "</div>";
  }
  function pill(st) { return '<span class="cn-pill ' + st.k + '">' + esc(st.t) + "</span>"; }
  function back(href, text) { return '<a class="sp-back" href="' + href + '">' + esc(text || "Kembali") + "</a>"; }
  function setTitle(t) { document.title = t + " | BEM STDIIS"; }
  function notFound(c) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"]], "Halaman tidak ditemukan", "Alamat yang kamu buka tidak ada atau sudah diubah.");
    out.innerHTML = '<div class="sp-empty">Periksa kembali barcode atau tautan yang kamu pakai.<a class="link-btn" href="#corner">Kembali ke Samasta Corner</a></div>';
  }

  /* ---------- beranda corner ---------- */
  function vSoon(c) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama]], c.nama, c.deskripsi, true);
    setTitle(c.nama);
    var os = ""; for (var i = 0; i < 5; i++) os += '<i style="--k:' + i + '">o</i>';
    out.innerHTML = '<section class="cn-soon" aria-labelledby="cn-soon-t"><p class="cn-soon-t" id="cn-soon-t"><span class="sr">Coming soon</span><span aria-hidden="true">Coming s' + os + "n</span></p>" +
      "<p>Corner " + esc(c.singkat || c.nama) + " sedang disiapkan. Layanan dan informasinya akan muncul di sini.</p>" + back("#corner", "Pilih corner lain") + "</section>";
  }
  function menuIco(x) { return ico(x.ikon || (x.tipe === "event" ? "kalender" : x.tipe === "anggota" ? "orang" : x.tipe === "link" ? "tautan" : x.tipe === "profil" ? "perisai" : "info")); }
  function vHub(c) {
    if (c.status === "segera") return vSoon(c);
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama]], c.nama, c.deskripsi, true);
    setTitle(c.nama);
    var m = c.menu || [];
    out.innerHTML = m.length ? '<div class="cn-tiles">' + m.map(function (x) {
      var ext = x.tipe === "link", href = ext ? (x.url || "#corner") : "#corner/" + c.id + "/" + x.id, out_ = ext && /^https?:/i.test(href);
      return '<a class="cn-tile" href="' + esc(href) + '"' + (out_ ? ' target="_blank" rel="noopener noreferrer"' : "") + '><span class="cn-tile-i">' + menuIco(x) + "</span>" +
        '<span class="cn-tile-b"><b>' + esc(x.judul) + "</b><small>" + esc(x.deskripsi || "") + "</small></span>" + ico("chevron", "cn-i cn-go") + "</a>";
    }).join("") + "</div>" : '<div class="sp-empty">Belum ada menu di corner ini.</div>';
  }

  /* ---------- info dan anggota ---------- */
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
  function unitOf(c, m) { var u = null; (A.unit || []).forEach(function (x) { if (x.nama === ((m && m.unit) || c.unit)) u = x; }); return u; }
  function vAnggota(c, m) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama, "#corner/" + c.id], [m.judul]], m.judul, m.deskripsi, true);
    setTitle(m.judul + " " + c.singkat);
    var u = unitOf(c, m), ls = u ? (u.anggota || []) : [];
    out.innerHTML = (ls.length ? '<div class="sp-bar"><h2>' + esc(u.nama) + "</h2><span>" + ls.length + ' anggota</span></div><ul class="cn-people">' + ls.map(function (n) {
      return '<li><span class="rp-av" aria-hidden="true">' + esc(ini(n)) + "</span><b>" + esc(n) + "</b></li>";
    }).join("") + "</ul>" : '<div class="sp-empty">Daftar anggota belum tersedia.</div>') + back("#corner/" + c.id, "Kembali ke " + c.singkat);
  }

  /* ---------- profil unit: pengertian, tugas, struktur interaktif, SOP, buku panduan ---------- */
  var profState = null;
  function avatar(p, cls) {
    return '<span class="pf-av ' + (cls || "") + '" aria-hidden="true">' + (p.foto ? '<img src="' + esc(p.foto) + '" alt="" loading="lazy" decoding="async" onerror="this.parentNode.classList.add(\'noimg\');this.remove()">' : "") + "<b>" + esc(ini(p.nama)) + "</b></span>";
  }
  function people(c, m) {
    var u = unitOf(c, m); if (!u) return { u: null, list: [] };
    var jk = u.jabatanKepala || "Pimpinan", pr = u.profil || [];
    return { u: u, jk: jk, list: (u.anggota || []).map(function (n, i) { var q = pr[i] || {}; return { nama: n, lead: i === 0, jabatan: i === 0 ? jk : "Anggota", peran: q.peran || "", foto: q.foto, panggilan: q.panggilan, prodi: q.prodi, angkatan: q.angkatan, asal: q.asal, instagram: q.instagram, motto: q.motto }; }) };
  }
  function sopList(m) {
    var S = window.SOP_DATA || [], re = null; try { re = new RegExp(m.sopPola || "Irjen|Inspektur|Inspektorat", "i"); } catch (x) { re = /Irjen|Inspektur/i; }
    return S.filter(function (s) { return re.test(s.o || ""); });
  }
  function vProfil(c, m) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama, "#corner/" + c.id], [m.judul]], m.judul, m.deskripsi, true);
    setTitle(m.judul + " " + c.singkat);
    var P = people(c, m), tugas = (m.tugas || []).filter(function (t) { return t && t.t; }), sops = sopList(m), pg = window.PANDUAN && m.panduan ? window.PANDUAN[m.panduan] : null;
    var kw = tugas.slice(0, 3).map(function (t, i) { return '<span class="pf-kw k' + (i + 1) + '">' + esc(String(t.t).split(" ").slice(0, 2).join(" ")) + "</span>"; }).join("");
    var nav = '<nav class="pf-nav" aria-label="Isi halaman">' + [["pf-def", "Pengertian"], ["pf-tugas", "Tugas"], ["pf-struct", "Struktur"], ["pf-sop", "SOP"], ["pf-pd", "Buku panduan"]].map(function (x) { return '<button type="button" class="chip" data-go="' + x[0] + '">' + x[1] + "</button>"; }).join("") + "</nav>";
    var h = nav + '<div class="pf">';
    /* 1. pengertian */
    h += '<section class="pf-sec pf-def" id="pf-def" data-rv><div class="pf-sh"><span class="pf-no">01</span><h2>Apa itu ' + esc(c.nama) + '?</h2></div><div class="pf-def-g"><div class="pf-prose">' + (para(m.pengertian).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") || '<p class="cn-muted">Pengertian belum diisi.</p>') + '</div>' +
      '<div class="pf-art" aria-hidden="true" style="' + toneStyle(c) + '"><span class="pf-art-orb">' + orbMarkup(c, "cn-fl pf-fl") + "</span>" + kw + "</div></div></section>";
    /* 2. tugas */
    h += '<section class="pf-sec" id="pf-tugas" data-rv><div class="pf-sh"><span class="pf-no">02</span><h2>Tugas dan fungsi</h2><p>' + tugas.length + ' tugas utama yang dijalankan ' + esc(c.singkat) + ' selama periode.</p></div>' +
      (tugas.length ? '<ol class="pf-tugas">' + tugas.map(function (t, i) { return '<li style="--i:' + i + '"><span class="pf-tn">' + (i + 1) + '</span><b>' + esc(t.t) + "</b><p>" + esc(t.d || "") + "</p></li>"; }).join("") + "</ol>" : '<p class="cn-muted">Belum ada tugas yang diisi.</p>') + "</section>";
    /* 3. struktur */
    h += '<section class="pf-sec" id="pf-struct" data-rv><div class="pf-sh"><span class="pf-no">03</span><h2>Struktur ' + esc(c.singkat) + '</h2><p>Ketuk atau arahkan kursor ke seseorang untuk melihat jalur dan profil singkatnya.</p></div>';
    if (P.list.length) {
      h += '<div class="pf-tree" id="pf-tree"><svg class="pf-lines" id="pf-lines" aria-hidden="true"></svg><div class="pf-root">' + nodeHtml(P.list[0], 0) + '</div><div class="pf-kids">' + P.list.slice(1).map(function (p, i) { return nodeHtml(p, i + 1); }).join("") + '</div></div><article class="pf-card" id="pf-card" aria-live="polite"></article>';
    } else h += '<p class="cn-muted">Data anggota unit ini belum tersedia.</p>';
    h += "</section>";
    /* 4. SOP */
    var khusus = sops.filter(function (s) { return /^SOP-IRJ-/.test(s.c); }), lain = sops.filter(function (s) { return !/^SOP-IRJ-/.test(s.c); });
    function sopCard(s) { return '<a class="pf-sopc" href="#sop/' + esc(s.c) + '"><span class="sp-code">' + esc(s.c) + "</span><b>" + esc(s.t) + "</b><small>" + esc(s.g || "") + "</small></a>"; }
    h += '<section class="pf-sec" id="pf-sop" data-rv><div class="pf-sh"><span class="pf-no">04</span><h2>SOP yang menjadi pegangan</h2></div>' +
      '<div class="pd-teaser pf-teaser"><div class="ik ik-sop" aria-hidden="true"><div class="ik-t"><div class="ik-bind"><b class="foil">SOP</b><i class="emb"></i></div><div class="ik-card"><b class="sp-clip"></b><s class="ik-tabs"><i></i><i></i><i></i></s><em>' + (khusus[0] ? esc(khusus[0].c) : "SOP-IRJ-001") + '</em><strong>Langkah kerja</strong><ul><li><svg class="tk" viewBox="0 0 20 20"><circle class="c" cx="10" cy="10" r="9"/><path class="v" pathLength="1" d="M5.5 10.4l3 3 6-6.8"/></svg><s></s></li><li><svg class="tk" viewBox="0 0 20 20"><circle class="c" cx="10" cy="10" r="9"/><path class="v" pathLength="1" d="M5.5 10.4l3 3 6-6.8"/></svg><s></s></li><li><svg class="tk" viewBox="0 0 20 20"><circle class="c" cx="10" cy="10" r="9"/><path class="v" pathLength="1" d="M5.5 10.4l3 3 6-6.8"/></svg><s></s></li></ul></div></div></div>' +
      '<div><h3>' + sops.length + ' SOP berkaitan</h3><p>' + khusus.length + ' SOP khusus ' + esc(c.singkat) + ' dan ' + lain.length + ' SOP lintas bagian yang pemiliknya adalah ' + esc(c.singkat) + '. Pilih salah satu untuk membaca langkah kerjanya.</p><a href="#sop" class="btn btn-gold">Buka Pusat SOP</a></div></div>' +
      (sops.length ? (khusus.length ? '<h3 class="pf-gh">SOP khusus ' + esc(c.singkat) + '</h3><div class="pf-sops">' + khusus.map(sopCard).join("") + "</div>" : "") + (lain.length ? '<h3 class="pf-gh">SOP lintas bagian</h3><div class="pf-sops">' + lain.map(sopCard).join("") + "</div>" : "") : '<p class="cn-muted">Data SOP belum termuat.</p>') + "</section>";
    /* 5. buku panduan */
    var pdf = m.panduan ? "panduan/" + encodeURIComponent(m.panduan) + ".pdf" : "";
    h += '<section class="pf-sec" id="pf-pd" data-rv><div class="pf-sh"><span class="pf-no">05</span><h2>Buku panduan</h2></div>' +
      '<div class="pd-teaser pf-teaser"><div class="ik ik-guide" aria-hidden="true"><div class="ik-t"><div class="ik-bind"><b class="foil">Panduan</b><i class="emb"></i></div><div class="ik-card"><b class="sp-clip"></b><s class="ik-tabs"><i></i><i></i><i></i></s><i class="gd-rib"></i><em>' + (pg ? pg.p.length + " halaman" : "PDF") + '</em><strong>Daftar isi</strong><ol class="gd-list"><li><span>Peran</span><b>1</b></li><li><span>Alur kerja</span><b>2</b></li><li><span>Lampiran</span><b>3</b></li></ol></div></div></div>' +
      '<div><h3>' + esc(pg && pg.n ? "Buku Panduan " + pg.n : "Buku Panduan " + c.nama) + '</h3><p>Pegangan kerja lengkap ' + esc(c.singkat) + (pg ? ", " + pg.p.length + " halaman" : "") + '. Buka untuk dibaca atau diunduh dalam format PDF.</p><div class="cn-act">' + (pdf ? '<a class="btn btn-gold" href="' + pdf + '" target="_blank" rel="noopener">Buka buku panduan</a>' : "") + '<a class="btn btn-line cn-dark" href="#panduan">Semua buku panduan</a></div></div></div></section>';
    h += "</div>" + back("#corner/" + c.id, "Kembali ke " + c.singkat);
    out.innerHTML = h;
    wireProfil(c, m, P);
  }
  function nodeHtml(p, i) {
    return '<button type="button" class="pf-node' + (p.lead ? " lead" : "") + '" data-i="' + i + '" style="--i:' + i + '" aria-controls="pf-card">' + (p.lead ? '<span class="pf-crown"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.500l2.900 6 6.600.8-4.900 4.500 1.300 6.500L12 17l-5.900 3.300 1.300-6.500L2.500 9.300l6.600-.8z"/></svg>' + esc(p.jabatan) + "</span>" : "") + avatar(p) + '<span class="pf-nm">' + esc(p.nama) + "</span>" + (p.lead ? "" : "<small>" + esc(p.peran || "Anggota") + "</small>") + "</button>";
  }
  function wireProfil(c, m, P) {
    [].forEach.call(out.querySelectorAll("[data-go]"), function (b) { b.onclick = function () { var t = $(b.getAttribute("data-go")); if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }; });
    /* muncul saat digulir */
    var secs = [].slice.call(out.querySelectorAll("[data-rv]"));
    if ("IntersectionObserver" in window && !reduce) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); if (e.target.id === "pf-struct") drawLines(true); } }); }, { threshold: 0.12 });
      secs.forEach(function (s) { s.classList.add("rv"); io.observe(s); });
    } else secs.forEach(function (s) { s.classList.add("in"); });
    if (!P.list.length) return;
    var tree = $("pf-tree"), cur = 0;
    function showCard(i) {
      var p = P.list[i]; cur = i;
      [].forEach.call(tree.querySelectorAll(".pf-node"), function (n) { n.classList.toggle("sel", +n.getAttribute("data-i") === i); });
      var F = [["Nama panggilan", p.panggilan], ["Program studi", p.prodi], ["Angkatan", p.angkatan], ["Asal daerah", p.asal]].filter(function (x) { return x[1]; });
      var ig = String(p.instagram || "").replace(/^@/, "").replace(/[^A-Za-z0-9._]/g, "");
      var card = $("pf-card");
      card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
      card.innerHTML = avatar(p, "big") + '<div class="pf-ci"><span class="pf-role' + (p.lead ? " lead" : "") + '">' + esc(p.lead ? p.jabatan : (p.peran || "Anggota " + c.singkat)) + "</span><h3>" + esc(p.nama) + "</h3>" +
        (F.length ? "<dl>" + F.map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + esc(x[1]) + "</dd></div>"; }).join("") + "</dl>" : '<p class="cn-muted">Profil lengkap akan segera dilengkapi.</p>') +
        (p.motto ? '<blockquote>' + esc(p.motto) + "</blockquote>" : "") + (ig ? '<a class="pf-ig" href="https://instagram.com/' + ig + '" target="_blank" rel="noopener noreferrer">@' + esc(ig) + "</a>" : "") + "</div>" +
        '<div class="pf-step"><button type="button" data-st="-1" aria-label="Sebelumnya"' + (i ? "" : " disabled") + '>' + ico("chevron", "cn-i flip") + "</button><span>" + (i + 1) + " / " + P.list.length + '</span><button type="button" data-st="1" aria-label="Berikutnya"' + (i < P.list.length - 1 ? "" : " disabled") + ">" + ico("chevron") + "</button></div>";
      [].forEach.call(card.querySelectorAll("[data-st]"), function (b) { b.onclick = function () { showCard(cur + +b.getAttribute("data-st")); }; });
      lineState();
    }
    tree.addEventListener("click", function (e) { var n = e.target.closest(".pf-node"); if (n) showCard(+n.getAttribute("data-i")); });
    tree.addEventListener("pointerover", function (e) { var n = e.target.closest(".pf-node"); tree.setAttribute("data-hov", n ? n.getAttribute("data-i") : ""); lineState(); });
    tree.addEventListener("pointerleave", function () { tree.removeAttribute("data-hov"); lineState(); });
    function lineState() {
      var hv = tree.getAttribute("data-hov");
      [].forEach.call($("pf-lines").querySelectorAll("path"), function (p) { var i = p.getAttribute("data-i"); p.classList.toggle("on", i == cur || i === hv); });
    }
    profState = { draw: drawLines };
    function drawLines(anim) {
      var svg = $("pf-lines"); if (!svg) return;
      var W = tree.clientWidth, H = tree.clientHeight, tr = tree.getBoundingClientRect(), root = tree.querySelector(".pf-root .pf-node"), kids = [].slice.call(tree.querySelectorAll(".pf-kids .pf-node"));
      svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("width", W); svg.setAttribute("height", H);
      if (W < 640) { svg.innerHTML = ""; return; }
      var rr = root.getBoundingClientRect(), x1 = rr.left + rr.width / 2 - tr.left, y1 = rr.bottom - tr.top - 6, d = "";
      kids.forEach(function (k, i) {
        var kr = k.getBoundingClientRect(), x2 = kr.left + kr.width / 2 - tr.left, y2 = kr.top - tr.top + 4, ym = y1 + (y2 - y1) * 0.55;
        d += '<path data-i="' + (i + 1) + '" pathLength="1" style="--d:' + (i * 0.12) + 's" d="M' + x1.toFixed(1) + " " + y1.toFixed(1) + " C" + x1.toFixed(1) + " " + ym.toFixed(1) + " " + x2.toFixed(1) + " " + ym.toFixed(1) + " " + x2.toFixed(1) + " " + y2.toFixed(1) + '"/>';
      });
      svg.innerHTML = d; var go_ = !!anim || svg.classList.contains("go"); svg.classList.toggle("go", go_); if (go_ && !svg._t) svg._t = setTimeout(function () { svg.classList.add("done"); }, 1900); lineState();
    }
    if ("ResizeObserver" in window) new ResizeObserver(function () { drawLines(); }).observe(tree);
    window.addEventListener("load", function () { drawLines(); });
    showCard(0); drawLines(!("IntersectionObserver" in window) || reduce);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { drawLines(); });
  }

  /* ---------- menu event ---------- */
  function vEvent(c, m) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama, "#corner/" + c.id], [m.judul]], m.judul, "Kelola kehadiran dan penilaian kegiatan dari satu tempat.", true);
    setTitle(m.judul + " " + c.singkat);
    var base = "#corner/" + c.id + "/" + m.id, n = (c.event || []).length;
    out.innerHTML = '<div class="cn-tiles cn-tiles-2">' +
      '<a class="cn-tile cn-tile-big" href="' + base + '/absensi"><span class="cn-tile-i">' + ico("kalender") + '</span><span class="cn-tile-b"><b>Absensi</b><small>Buat barcode untuk event. Peserta scan, lalu mengisi data diri dan menjawab soal penilaian.</small></span>' + ico("chevron", "cn-i cn-go") + "</a>" +
      '<a class="cn-tile cn-tile-big" href="' + base + '/pembukuan"><span class="cn-tile-i">' + ico("papan") + '</span><span class="cn-tile-b"><b>Pembukuan</b><small>Daftar hadir, ringkasan acara, grafik, dan semua jawaban peserta. Khusus Irjen, dengan kode akses.</small></span>' + ico("chevron", "cn-i cn-go") + "</a></div>" +
      '<div class="cn-flow"><h2 class="cn-h">Alur singkat</h2><ol><li><b>Irjen membuat barcode</b><span>Pilih event di menu Absensi, lalu tampilkan atau cetak barcodenya.</span></li><li><b>Peserta memindai</b><span>Peserta mengisi nama, NIM, bagian, lalu menjawab soal penilaian satu per satu.</span></li><li><b>Pembukuan terisi sendiri</b><span>Yang mengisi ditandai hadir, yang belum ditandai silang, ringkasan dan grafik tersusun otomatis.</span></li></ol></div>' +
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

  /* ---------- barcode absensi ---------- */
  function formUrl(c, ev) { var base = (window.CORNER_BASE || location.href).split("#")[0]; return base + "#corner/" + c.id + "/isi/" + ev.id; }
  var qrState = null;
  function vQR(c, m, ev) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama, "#corner/" + c.id], [m.judul, "#corner/" + c.id + "/" + m.id], ["Absensi", "#corner/" + c.id + "/" + m.id + "/absensi"], ["Barcode"]], "Barcode absensi", ev.judul, true);
    setTitle("Barcode " + ev.judul);
    var url = formUrl(c, ev), q = null, svg = "", err = "";
    try { q = QR.make(url); svg = QR.svg(q, { border: 2, dark: "#0d2a38", light: "#ffffff", label: "Barcode absensi " + ev.judul }); } catch (x) { err = "Tautan terlalu panjang untuk dibuat barcode."; }
    qrState = { url: url, q: q, c: c, ev: ev };
    var st = evStatus(ev), warn = st.k === "nanti" ? "Absensi baru bisa diisi mulai " + dlong(ev.tanggal) + "." : st.k === "tutup" ? "Absensi untuk event ini sudah ditutup." : "";
    var sl = soalList(ev), wj = sl.filter(function (x) { return x.wajib; }).length;
    var loc = /^(file:|http:\/\/(localhost|127\.))/.test(url) ? '<p class="cn-mode" role="note"><b>Perhatian.</b> Barcode ini mengarah ke alamat lokal, sehingga tidak bisa dibuka dari ponsel lain. Buka halaman ini dari alamat situs yang sudah tayang, atau isi <code>CORNER_BASE</code> di <code>corner-config.js</code>.</p>' : "";
    out.innerHTML = note() + loc + '<div class="cn-qr">' +
      '<div class="cn-qrbox" id="cn-qrbox"><div class="cn-qrcard">' + (err ? '<p class="cn-err">' + esc(err) + "</p>" : svg) + '<p class="cn-qrcap">Pindai untuk absen dan menilai</p><p class="cn-qrev">' + esc(ev.judul) + "</p></div></div>" +
      '<div class="cn-qrside"><div class="cn-qrinfo"><span class="cn-pill ' + st.k + '">' + esc(st.t) + "</span><h2>" + esc(ev.judul) + '</h2><dl><dt>Tanggal</dt><dd>' + esc(drange(ev)) + "</dd>" + (ev.jam ? "<dt>Jam</dt><dd>" + esc(ev.jam) + "</dd>" : "") + (ev.tempat ? "<dt>Tempat</dt><dd>" + esc(ev.tempat) + "</dd>" : "") + "<dt>Target</dt><dd>" + roster(ev).length + " pengurus</dd><dt>Soal</dt><dd>" + sl.length + " soal, " + wj + " wajib</dd></dl>" + (warn ? '<p class="cn-warn">' + esc(warn) + "</p>" : "") + "</div>" +
      '<div class="cn-act"><button type="button" class="btn btn-gold" data-a="full">Layar penuh</button><button type="button" class="btn btn-line cn-dark" data-a="png">Unduh poster PNG</button><button type="button" class="btn btn-line cn-dark" data-a="print">Cetak</button></div>' +
      '<div class="cn-url"><label for="cn-url-i">Tautan form absensi</label><div class="cn-url-r"><input id="cn-url-i" readonly value="' + esc(url) + '"><button type="button" class="btn btn-line cn-dark" data-a="copy">Salin</button></div><p id="cn-url-s" role="status"></p></div>' +
      '<div class="cn-act"><a class="btn btn-line cn-dark" href="#corner/' + c.id + "/isi/" + esc(ev.id) + '">Lihat tampilan peserta</a><a class="btn btn-line cn-dark" href="#corner/' + c.id + "/" + m.id + "/pembukuan/" + esc(ev.id) + '">Buka pembukuan</a></div></div></div>' +
      back("#corner/" + c.id + "/" + m.id + "/absensi", "Kembali ke daftar event");
  }
  function wrapText(ctx, text, maxW) {
    var words = text.split(" "), line = "", lines = [];
    words.forEach(function (w) { var t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line); return lines;
  }
  function poster() {
    if (!qrState || !qrState.q) return;
    var W = 1080, H = 1500, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var x = cv.getContext("2d"), ev = qrState.ev;
    var bg = x.createLinearGradient(0, 0, W, H); bg.addColorStop(0, "#0b3a30"); bg.addColorStop(1, "#0d2a38"); x.fillStyle = bg; x.fillRect(0, 0, W, H);
    var g = x.createRadialGradient(W * 0.85, H, 50, W * 0.85, H, 900); g.addColorStop(0, "rgba(248,210,74,.28)"); g.addColorStop(1, "rgba(248,210,74,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.strokeStyle = "rgba(248,210,74,.45)"; x.lineWidth = 3; x.strokeRect(36, 36, W - 72, H - 72);
    x.textAlign = "center"; x.fillStyle = "#f8d24a"; x.font = "600 34px Georgia,serif"; x.fillText("BEM STDIIS  |  Kabinet Samasta", W / 2, 110);
    x.fillStyle = "#ffffff"; x.font = "700 64px Georgia,serif";
    var ls = wrapText(x, ev.judul, 880).slice(0, 4), y = 220; ls.forEach(function (l) { x.fillText(l, W / 2, y); y += 78; });
    x.fillStyle = "#cde0dc"; x.font = "500 34px sans-serif"; y += 8;
    x.fillText([drange(ev), ev.jam].filter(Boolean).join("  |  "), W / 2, y); y += 50; if (ev.tempat) { x.fillText(ev.tempat, W / 2, y); y += 50; }
    var s = 760, qx = (W - s) / 2, qy = Math.max(y + 40, 520), q = qrState.q, n = q.size + 4, px = s / n;
    x.fillStyle = "#fff"; x.beginPath(); if (x.roundRect) x.roundRect(qx - 36, qy - 36, s + 72, s + 72, 36); else x.rect(qx - 36, qy - 36, s + 72, s + 72); x.fill();
    x.fillStyle = "#0d2a38"; for (var j = 0; j < q.size; j++) for (var i = 0; i < q.size; i++) if (q.get(i, j)) x.fillRect(qx + (i + 2) * px, qy + (j + 2) * px, Math.ceil(px), Math.ceil(px));
    x.fillStyle = "#f8d24a"; x.font = "700 52px Georgia,serif"; x.fillText("Pindai untuk absen dan menilai", W / 2, qy + s + 130);
    x.fillStyle = "#cde0dc"; x.font = "500 30px sans-serif"; x.fillText("Isi data dirimu, lalu jawab soal penilaian.", W / 2, qy + s + 180);
    cv.toBlob(function (b) {
      var a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "barcode-absensi-" + ev.id + ".png";
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    }, "image/png");
  }

  /* ================= PENGALAMAN PESERTA (dibuka lewat scan) ================= */
  var stopFx = null;
  function leaveScan() { document.body.classList.remove("cn-scan"); if (stopFx) { stopFx(); stopFx = null; } }
  function starField(cv) {
    var cx = cv.getContext("2d"), W = 0, H = 0, st = [], raf = 0, last = 0, t = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5), alive = true;
    function size() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); var n = Math.round(Math.min(110, W * H / 9000)); st = []; for (var i = 0; i < n; i++) st.push({ x: Math.random() * W, y: Math.random() * H, z: Math.random(), p: Math.random() * 6.28, s: .6 + Math.random() * 1.8, g: Math.random() < .35 }); }
    function draw(ts) {
      if (!alive) return; var dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; t += dt; cx.clearRect(0, 0, W, H);
      st.forEach(function (s) {
        s.y -= (3 + s.z * 10) * dt; s.x += (1 + s.z * 4) * dt; if (s.y < -5) { s.y = H + 5; s.x = Math.random() * W; } if (s.x > W + 5) s.x = -5;
        var a = .3 + .7 * (.5 + .5 * Math.sin(s.p + t * s.s)); cx.fillStyle = (s.g ? "rgba(248,210,74," : "rgba(255,255,255,") + (a * (.4 + s.z * .5)).toFixed(3) + ")";
        cx.beginPath(); cx.arc(s.x, s.y, .6 + s.z * 1.4, 0, 6.2832); cx.fill();
        if (s.z > .85) { var L = 3 + 4 * a; cx.strokeStyle = "rgba(248,210,74," + (a * .5).toFixed(3) + ")"; cx.lineWidth = .8; cx.beginPath(); cx.moveTo(s.x - L, s.y); cx.lineTo(s.x + L, s.y); cx.moveTo(s.x, s.y - L); cx.lineTo(s.x, s.y + L); cx.stroke(); }
      });
      raf = requestAnimationFrame(draw);
    }
    size(); window.addEventListener("resize", size);
    if (reduce) draw(0); else raf = requestAnimationFrame(draw);
    return function () { alive = false; cancelAnimationFrame(raf); window.removeEventListener("resize", size); };
  }
  function confetti(cv) {
    var cx = cv.getContext("2d"), W = cv.width = innerWidth, H = cv.height = innerHeight, P = [], cols = ["#f8d24a", "#fff3b0", "#43b99a", "#14705a", "#ffffff", "#d9b872"], raf = 0, alive = true, t0 = 0;
    for (var i = 0; i < 150; i++) P.push({ x: W / 2 + (Math.random() - .5) * 120, y: H * .38, vx: (Math.random() - .5) * 15, vy: -Math.random() * 15 - 4, r: Math.random() * 6.28, vr: (Math.random() - .5) * .35, w: 6 + Math.random() * 8, h: 4 + Math.random() * 6, c: cols[i % cols.length], star: Math.random() < .3 });
    function draw(ts) {
      if (!alive) return; t0 = t0 || ts; var e = (ts - t0) / 1000; cx.clearRect(0, 0, W, H);
      P.forEach(function (p) {
        p.vy += .32; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.globalAlpha = Math.max(0, Math.min(1, 1 - (e - 2.4) / 1.2)); cx.fillStyle = p.c;
        if (p.star) { cx.beginPath(); for (var k = 0; k < 10; k++) { var rr = k % 2 ? p.w * .22 : p.w * .6, a = k * Math.PI / 5; cx.lineTo(Math.sin(a) * rr, -Math.cos(a) * rr); } cx.closePath(); cx.fill(); } else cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        cx.restore();
      });
      if (e < 3.8) raf = requestAnimationFrame(draw); else cx.clearRect(0, 0, W, H);
    }
    raf = requestAnimationFrame(draw);
    return function () { alive = false; cancelAnimationFrame(raf); cx.clearRect(0, 0, W, H); };
  }
  function starBtn(v) { return '<button type="button" class="sc-star" role="radio" aria-checked="false" data-v="' + v + '" aria-label="' + v + " dari 5: " + RATE_HINT[v] + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2l2.9 6.2 6.8.8-5 4.700 1.300 6.700L12 17.200l-6 3.400 1.300-6.700-5-4.700 6.800-.8z"/></svg></button>'; }
  function vForm(c, ev) {
    var st = evStatus(ev), soal = soalList(ev), pen = penutupOf(ev), t = tone(c);
    setTitle("Absensi " + ev.judul);
    document.body.classList.add("cn-scan"); top.innerHTML = "";
    var meta = [[drange(ev), "kalender"], [ev.jam, "jam"], [ev.tempat, "lokasi"]].filter(function (x) { return x[0]; }).map(function (x) { return "<li>" + ico(x[1]) + "<span>" + esc(x[0]) + "</span></li>"; }).join("");
    out.innerHTML = '<div class="sc" id="sc" style="' + toneStyle(c) + '"><canvas class="sc-cv" id="sc-cv" aria-hidden="true"></canvas><div class="sc-aur" aria-hidden="true"></div><div class="sc-pat" aria-hidden="true"></div><canvas class="sc-cf" id="sc-cf" aria-hidden="true"></canvas>' +
      '<header class="sc-top"><span class="sc-brand"><i class="sc-logo" aria-hidden="true"></i><span><b>BEM STDIIS</b><small>Kabinet Samasta</small></span></span><span class="sc-chip">' + esc(c.singkat || c.nama) + "</span></header>" +
      '<div class="sc-prog" id="sc-prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>' +
      '<main class="sc-main"><div class="sc-stage" id="sc-stage"></div></main><p class="sc-foot">' + esc(c.nama) + " · BEM STDIIS Kabinet Samasta</p></div>";
    stopFx = starField($("sc-cv"));
    var stage = $("sc-stage"), prog = $("sc-prog"), S = { i: 0, ans: {}, id: { bagian: "", sel: "", nama2: "", nim: "" } };
    var steps = [{ k: "welcome" }, { k: "ident" }].concat(soal.map(function (q, i) { return { k: "q", q: q, n: i + 1 }; }));
    function setProg() { var p = Math.round(S.i / (steps.length) * 100); prog.firstChild.style.width = p + "%"; prog.setAttribute("aria-valuenow", p); }
    function orb() { return '<span class="cn-fl sc-fl"><span class="cn-orbit" aria-hidden="true"></span><span class="cn-sph">' + CI.svg(c.ikon || "bintang", "cn-ico") + '</span><i class="cn-sp s1" aria-hidden="true"></i><i class="cn-sp s2" aria-hidden="true"></i><i class="cn-sp s3" aria-hidden="true"></i></span>'; }
    function navHtml(i) {
      var s = steps[i], last = i === steps.length - 1, lab = last ? "Kirim jawabanku" : "Lanjut";
      return '<div class="sc-nav"><button type="button" class="sc-ghost" data-n="-1">Kembali</button><button type="button" class="sc-btn" id="sc-next" data-n="1"><span>' + lab + "</span>" + ico("chevron") + "</button></div>";
    }
    function render(dir) {
      var s = steps[S.i], h = "";
      setProg();
      if (s.k === "welcome") {
        if (st.k !== "buka") {
          h = '<div class="sc-card sc-welcome">' + orb() + '<p class="sc-kick">' + (st.k === "nanti" ? "Belum dibuka" : "Sudah ditutup") + '</p><h1 class="sc-title">' + esc(ev.judul) + '</h1><ul class="sc-meta">' + meta + '</ul><p class="sc-lead">' + (st.k === "nanti" ? "Formulir ini bisa diisi mulai " + esc(dlong(ev.tanggal)) + "." : "Formulir untuk event ini tidak lagi menerima isian. Hubungi Inspektorat Jenderal bila kamu merasa seharusnya masih bisa mengisi.") + '</p><a class="sc-ghost sc-solo" href="#corner">Ke Samasta Corner</a></div>';
        } else {
          var did = ""; try { did = localStorage.getItem("bem-corner-sudah-" + ev.id) || ""; } catch (x) {}
          h = '<div class="sc-card sc-welcome">' + orb() + '<p class="sc-kick">Selamat datang</p><h1 class="sc-title">' + esc(ev.judul) + '</h1><ul class="sc-meta">' + meta + '</ul><p class="sc-lead">Catat kehadiranmu dan bagikan penilaianmu. Hanya butuh sekitar satu menit.</p>' +
            (did ? '<p class="sc-did" role="status">Perangkat ini sudah dipakai mengisi atas nama <b>' + esc(did) + "</b>. Kamu tetap bisa mengisi untuk orang lain.</p>" : "") +
            '<button type="button" class="sc-btn sc-go" data-n="1"><span>Mulai</span>' + ico("chevron") + '</button><p class="sc-small">' + soal.length + " pertanyaan, " + soal.filter(function (x) { return x.wajib; }).length + " wajib dijawab</p></div>";
        }
      } else if (s.k === "ident") {
        h = '<div class="sc-card"><p class="sc-kick">Langkah pertama</p><h2 class="sc-q">Siapa kamu?</h2><p class="sc-help">Data ini dipakai untuk mencatat kehadiranmu.</p>' +
          '<label class="sc-f"><span>Bagian di BEM</span><select id="f-bagian">' + bagianOptions(S.id.bagian) + "</select></label>" +
          '<label class="sc-f" id="w-nama"' + (S.id.bagian === "Tamu" ? " hidden" : "") + '><span>Nama</span><select id="f-nama"' + (S.id.bagian ? "" : " disabled") + ">" + namaOptions(S.id.bagian, S.id.sel) + "</select></label>" +
          '<label class="sc-f" id="w-nama2"' + (S.id.bagian === "Tamu" || S.id.sel === "__lain" ? "" : " hidden") + '><span>Nama lengkap</span><input id="f-nama2" maxlength="80" autocomplete="name" value="' + esc(S.id.nama2) + '"></label>' +
          '<label class="sc-f"><span>NIM</span><input id="f-nim" maxlength="20" inputmode="text" autocapitalize="characters" placeholder="Contoh: 2024010001" value="' + esc(S.id.nim) + '"></label>' +
          '<input class="asp-hp" type="text" name="cn_extra_field" id="f-hp" tabindex="-1" autocomplete="off" aria-hidden="true"><p class="sc-err" id="sc-err" role="alert"></p>' + navHtml(S.i) + "</div>";
      } else {
        var q = s.q, v = S.ans[q.id], body = "";
        if (q.tipe === "bintang") body = '<div class="sc-stars" role="radiogroup" aria-label="' + esc(q.t) + '">' + [1, 2, 3, 4, 5].map(starBtn).join("") + '</div><p class="sc-rv" id="sc-rv" aria-live="polite">' + (v ? v + " dari 5: " + RATE_HINT[v] : "Ketuk bintang untuk menilai") + "</p>";
        else if (q.tipe === "singkat") body = '<input class="sc-in" id="sc-a" maxlength="160" value="' + esc(v || "") + '" placeholder="Tulis jawaban singkatmu">';
        else if (q.tipe === "paragraf") body = '<textarea class="sc-in sc-ta" id="sc-a" maxlength="1000" rows="5" placeholder="' + esc(q.bantu || "Tulis jawabanmu di sini") + '">' + esc(v || "") + '</textarea><p class="sc-count"><span id="sc-ct">' + String(v || "").length + "</span>/1000</p>";
        else body = '<div class="sc-ops" role="radiogroup" aria-label="' + esc(q.t) + '">' + q.pilihan.map(function (o, k) { return '<button type="button" class="sc-op" role="radio" aria-checked="' + (v === o) + '" data-k="' + k + '"><i></i><span>' + esc(o) + "</span></button>"; }).join("") + "</div>";
        h = '<div class="sc-card"><p class="sc-kick">Pertanyaan ' + s.n + " dari " + soal.length + ' <span class="sc-tag ' + (q.wajib ? "req" : "opt") + '">' + (q.wajib ? "Wajib" : "Opsional") + '</span></p><h2 class="sc-q">' + esc(q.t) + "</h2>" + (q.bantu && q.tipe !== "paragraf" ? '<p class="sc-help">' + esc(q.bantu) + "</p>" : "") + body + '<p class="sc-err" id="sc-err" role="alert"></p>' + navHtml(S.i) + "</div>";
      }
      stage.innerHTML = h;
      stage.className = "sc-stage " + (dir > 0 ? "go-next" : dir < 0 ? "go-prev" : "go-first");
      if (s.k === "q" && s.q.tipe === "bintang") paintStars(S.ans[s.q.id] || 0);
      if (s.k === "q") syncNext();
      var f = stage.querySelector("#f-bagian, #sc-a, .sc-go, #sc-next"); if (f && !(f.tagName === "TEXTAREA" && /Android|iPhone/i.test(navigator.userAgent))) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (x) {} }, 380);
      window.scrollTo(0, 0);
    }
    function bagianOptions(sel) {
      var o = '<option value="">Pilih bagianmu</option>';
      if ((A.pimpinan || []).length) o += '<option value="Pimpinan"' + (sel === "Pimpinan" ? " selected" : "") + ">Pimpinan</option>";
      (A.unit || []).forEach(function (u) { o += '<option value="' + esc(u.nama) + '"' + (sel === u.nama ? " selected" : "") + ">" + esc(u.nama) + "</option>"; });
      return o + '<option value="Tamu"' + (sel === "Tamu" ? " selected" : "") + ">Bukan pengurus BEM (tamu)</option>";
    }
    function namaOptions(b, sel) {
      if (!b) return '<option value="">Pilih bagian dulu</option>';
      var ls = b === "Pimpinan" ? (A.pimpinan || []).map(function (p) { return p.nama; }) : ((A.unit || []).filter(function (u) { return u.nama === b; })[0] || { anggota: [] }).anggota;
      return '<option value="">Pilih namamu</option>' + ls.map(function (n) { return '<option value="' + esc(n) + '"' + (sel === n ? " selected" : "") + ">" + esc(n) + "</option>"; }).join("") + '<option value="__lain"' + (sel === "__lain" ? " selected" : "") + ">Namaku tidak ada di daftar</option>";
    }
    function paintStars(v) { [].forEach.call(stage.querySelectorAll(".sc-star"), function (b) { var n = +b.getAttribute("data-v"); b.classList.toggle("on", n <= v); b.setAttribute("aria-checked", n === v); }); }
    function syncNext() {
      var s = steps[S.i], b = $("sc-next"); if (!b || s.k !== "q") return;
      var v = S.ans[s.q.id], has = v != null && v !== "", last = S.i === steps.length - 1;
      b.firstChild.textContent = last ? "Kirim jawabanku" : (!s.q.wajib && !has ? "Lewati" : "Lanjut");
    }
    function bad(msg, el) { var e = $("sc-err"); if (e) e.textContent = msg; var card = stage.firstChild; card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake"); if (el) try { el.focus(); } catch (x) {} }
    function readIdent() {
      var b = $("f-bagian").value, sel = $("f-nama").value, n2 = $("f-nama2").value.trim(), nim = $("f-nim").value.trim().toUpperCase().replace(/\s+/g, "");
      S.id = { bagian: b, sel: sel, nama2: n2, nim: nim }; S.id.hp = $("f-hp").value;
      var free = b === "Tamu" || sel === "__lain"; S.id.nama = free ? n2 : sel;
    }
    function validate() {
      var s = steps[S.i];
      if (s.k === "ident") {
        readIdent(); var d = S.id, free = d.bagian === "Tamu" || d.sel === "__lain";
        if (!d.bagian) return bad("Pilih bagianmu di BEM.", $("f-bagian")), false;
        if (!d.nama || d.nama.length < 3) return bad(free ? "Tulis nama lengkapmu." : "Pilih namamu dari daftar.", free ? $("f-nama2") : $("f-nama")), false;
        if (!/^[0-9A-Z.\-]{5,20}$/.test(d.nim)) return bad("NIM harus 5 sampai 20 karakter (angka atau huruf).", $("f-nim")), false;
      } else if (s.k === "q") {
        var q = s.q, v = S.ans[q.id];
        if (q.tipe === "singkat" || q.tipe === "paragraf") { v = ($("sc-a").value || "").trim(); S.ans[q.id] = v; }
        if (q.wajib && (v == null || v === "")) return bad(q.tipe === "bintang" ? "Beri nilai bintang dulu ya." : q.tipe === "pilihan" ? "Pilih salah satu jawaban dulu ya." : "Soal ini wajib dijawab.", $("sc-a")), false;
      }
      return true;
    }
    function go(d) {
      if (d > 0) { if (!validate()) return; if (S.i === steps.length - 1) return send(); }
      else if (steps[S.i].k === "ident" || steps[S.i].k === "q") { if (steps[S.i].k === "ident") readIdent(); else { var q = steps[S.i].q; if (q.tipe === "singkat" || q.tipe === "paragraf") S.ans[q.id] = ($("sc-a").value || "").trim(); } }
      var n = Math.max(0, Math.min(steps.length - 1, S.i + d)); if (n === S.i) return;
      S.i = n; render(d);
    }
    var busy = false;
    function send() {
      if (busy) return; busy = true;
      var btn = $("sc-next"); btn.disabled = true; btn.firstChild.textContent = "Mengirim...";
      var d = S.id, jawab = {}, skor = {}, kom = [], kri = "", komentar = "";
      soal.forEach(function (q) {
        var v = S.ans[q.id]; if (v == null || v === "") return; jawab[q.id] = v;
        if (q.tipe === "bintang") skor[q.t] = v;
        else if (q.tipe === "paragraf") { if (q.id === "komentar") komentar = v; else if (q.id === "kritik") kri = v; else kom.push(q.t + ": " + v); }
        else kom.push(q.t + ": " + v);
      });
      if (kom.length) komentar = (komentar ? komentar + "\n" : "") + kom.join("\n");
      if (d.hp) { finish(d.nama); return; }
      submitRow(c, ev, { nama: d.nama, nim: d.nim, bagian: d.bagian, jawab: jawab, skor: skor, komentar: komentar.slice(0, 1000), kritik: kri })
        .then(function (j) {
          busy = false;
          if (j && j.ok) { try { localStorage.setItem("bem-corner-sudah-" + ev.id, d.nama); } catch (x) {} finish(d.nama); }
          else { btn.disabled = false; syncNext(); if (j && j.error === "duplikat") { S.i = 1; render(-1); bad(ERR.duplikat); } else bad(ERR[j && j.error] || ERR.server); }
        }, function (x) { busy = false; btn.disabled = false; syncNext(); bad(x && x.msg ? x.msg : ERR.server); });
    }
    function finish(nama) {
      prog.firstChild.style.width = "100%"; prog.setAttribute("aria-valuenow", 100);
      var ps = para(fill(pen.isi, nama, ev)).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("");
      var url = pen.url || "#corner", ext = /^https?:/i.test(url);
      stage.className = "sc-stage go-next";
      stage.innerHTML = '<div class="sc-card sc-done" role="status"><div class="sc-seal" aria-hidden="true"><svg viewBox="0 0 80 80"><circle class="r1" cx="40" cy="40" r="36"/><circle class="r2" cx="40" cy="40" r="30"/><path class="ck" pathLength="1" d="M26 41l10 10 19-22"/></svg></div>' +
        '<h2 class="sc-thanks">' + esc(fill(pen.judul, nama, ev)) + "</h2>" + '<div class="sc-words">' + ps + "</div>" + (pen.salam ? '<p class="sc-sign">' + esc(fill(pen.salam, nama, ev)) + "</p>" : "") +
        '<div class="sc-acts"><a class="sc-btn" href="' + esc(url) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + "><span>" + esc(pen.tombol) + '</span></a><a class="sc-ghost" href="#corner/' + c.id + "/isi/" + esc(ev.id) + '" data-again>Isi untuk orang lain</a></div></div>';
      window.scrollTo(0, 0);
      if (!reduce) { var fx = confetti($("sc-cf")), old = stopFx; stopFx = function () { fx(); old && old(); }; }
    }
    /* interaksi */
    stage.addEventListener("click", function (e) {
      var n = e.target.closest("[data-n]"); if (n) { go(+n.getAttribute("data-n")); return; }
      var sb = e.target.closest(".sc-star");
      if (sb) { var s = steps[S.i], v = +sb.getAttribute("data-v"); S.ans[s.q.id] = v; paintStars(v); $("sc-rv").textContent = v + " dari 5: " + RATE_HINT[v]; var e1 = $("sc-err"); if (e1) e1.textContent = ""; syncNext(); sb.classList.remove("pop"); void sb.offsetWidth; sb.classList.add("pop"); if (S.i < steps.length - 1) { clearTimeout(S.t); S.t = setTimeout(function () { if (steps[S.i] === s && S.ans[s.q.id] === v) go(1); }, 520); } return; }
      var ob = e.target.closest(".sc-op");
      if (ob) { var s2 = steps[S.i]; S.ans[s2.q.id] = s2.q.pilihan[+ob.getAttribute("data-k")]; [].forEach.call(stage.querySelectorAll(".sc-op"), function (x) { x.setAttribute("aria-checked", x === ob); }); syncNext(); if (S.i < steps.length - 1) { clearTimeout(S.t); S.t = setTimeout(function () { if (steps[S.i] === s2) go(1); }, 460); } }
    });
    stage.addEventListener("pointerover", function (e) { var b = e.target.closest && e.target.closest(".sc-star"); if (b && e.pointerType === "mouse") paintStars(+b.getAttribute("data-v")); });
    stage.addEventListener("pointerleave", function () { var s = steps[S.i]; if (s.k === "q" && s.q.tipe === "bintang") paintStars(S.ans[s.q.id] || 0); });
    stage.addEventListener("change", function (e) {
      if (e.target.id === "f-bagian") { var b = e.target.value, free = b === "Tamu"; S.id.bagian = b; S.id.sel = ""; $("w-nama").hidden = free; $("w-nama2").hidden = !free; $("f-nama2").value = ""; $("f-nama").disabled = !b || free; $("f-nama").innerHTML = namaOptions(free ? "" : b, ""); }
      if (e.target.id === "f-nama") { var o = e.target.value === "__lain"; $("w-nama2").hidden = !o; if (o) $("f-nama2").focus(); }
    });
    stage.addEventListener("input", function (e) { if (e.target.id === "sc-a") { var s = steps[S.i]; S.ans[s.q.id] = e.target.value.trim(); var ct = $("sc-ct"); if (ct) ct.textContent = e.target.value.length; syncNext(); var er = $("sc-err"); if (er) er.textContent = ""; } });
    stage.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "radio") { e.preventDefault(); go(1); } });
    render(0);
  }

  /* ---------- pembukuan ---------- */
  var cache = {}, tab = "hadir", filt = "semua", q = "", hideNames = false, RC = null, renderToken = 0;
  function vLock(c, m, ev, msg) {
    head(c, [["Beranda", "#beranda"], ["Samasta Corner", "#corner"], [c.nama, "#corner/" + c.id], [m.judul, "#corner/" + c.id + "/" + m.id], ["Pembukuan"]], "Pembukuan Irjen", "Daftar hadir, ringkasan acara, grafik, dan jawaban peserta.", true);
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
    vEvList(c, m, "pembukuan", "Pembukuan", "Pilih event untuk melihat daftar hadir, ringkasan, dan jawaban.", "Buka pembukuan");
    out.insertAdjacentHTML("afterbegin", !LOKAL ? '<div class="cn-unlocked"><span>' + ico("gembok", "cn-i") + 'Pembukuan terbuka untuk sesi ini.</span><button type="button" class="link-btn" data-a="lock">Kunci kembali</button></div>' : "");
  }
  /* nilai jawaban satu baris untuk satu soal (mendukung data lama: skor per nama aspek, komentar, kritik) */
  function ansOf(r, q) {
    if (r.jawab && r.jawab[q.id] != null) return r.jawab[q.id];
    if (!r.jawab) { if (q.tipe === "bintang" && r.skor && r.skor[q.t] != null) return r.skor[q.t]; if (q.id === "komentar") return r.komentar || undefined; if (q.id === "kritik") return r.kritik || undefined; }
    return undefined;
  }
  function compute(c, ev, rows) {
    var ro = roster(ev), soal = soalList(ev), byN = {}, used = {};
    rows.forEach(function (r) { var k = norm(r.nama); if (!byN[k]) byN[k] = r; });
    var hadir = [], absen = [];
    ro.forEach(function (p) { var r = byN[norm(p.nama)]; if (r) { hadir.push({ p: p, r: r }); used[norm(p.nama)] = 1; } else absen.push({ p: p }); });
    var tamu = rows.filter(function (r) { return !used[norm(r.nama)]; });
    var per = soal.map(function (q) {
      var vals = []; rows.forEach(function (r) { var v = ansOf(r, q); if (v != null && v !== "") vals.push({ r: r, v: v }); });
      var o = { q: q, n: vals.length, vals: vals };
      if (q.tipe === "bintang") { var nums = vals.map(function (x) { return +x.v; }).filter(function (x) { return x >= 1 && x <= 5; }); o.avg = nums.length ? nums.reduce(function (a, b) { return a + b; }, 0) / nums.length : null; o.dist = [0, 0, 0, 0, 0]; nums.forEach(function (x) { o.dist[x - 1]++; }); }
      if (q.tipe === "pilihan") { o.cnt = {}; q.pilihan.forEach(function (p) { o.cnt[p] = 0; }); vals.forEach(function (x) { o.cnt[x.v] = (o.cnt[x.v] || 0) + 1; }); }
      return o;
    });
    var stars_ = per.filter(function (p) { return p.q.tipe === "bintang"; }), main = stars_[0] || null, rated = stars_.filter(function (p) { return p.avg != null; });
    var texts = per.filter(function (p) { return p.q.tipe === "paragraf" || p.q.tipe === "singkat"; });
    return { c: c, ev: ev, rows: rows, ro: ro, hadir: hadir, absen: absen, tamu: tamu, per: per, stars: stars_, main: main, kep: main && main.avg, texts: texts, ntext: texts.reduce(function (a, p) { return a + p.n; }, 0),
      hi: rated.slice().sort(function (a, b) { return b.avg - a.avg; })[0], lo: rated.slice().sort(function (a, b) { return a.avg - b.avg; })[0] };
  }
  function lab(v) { return v >= 4.5 ? "sangat baik" : v >= 3.5 ? "baik" : v >= 2.5 ? "cukup" : "perlu perbaikan"; }
  function narasi(R) {
    var ev = R.ev, N = R.ro.length, H = R.hadir.length, p = [];
    p.push("Acara “" + ev.judul + "” berlangsung pada " + drange(ev) + (ev.tempat ? " di " + ev.tempat : "") + ". " + (N ? "Dari " + N + " pengurus yang ditargetkan, " + H + " hadir dan mengisi absensi (" + Math.round(H / N * 100) + "%)" + (R.absen.length ? ", sedangkan " + R.absen.length + " belum mengisi" : ", dan seluruhnya hadir") + "." : "Acara ini tidak memiliki daftar target.") + (R.tamu.length ? " Ada " + R.tamu.length + " peserta di luar daftar target yang ikut mengisi." : ""));
    if (!R.rows.length) { p.push("Belum ada peserta yang mengisi. Barcode absensi dapat dibuat di menu Absensi."); return p; }
    if (R.main && R.main.avg != null) {
      var d = R.main.dist, tot = d.reduce(function (a, b) { return a + b; }, 0), pos = d[3] + d[4];
      p.push("Pada soal “" + R.main.q.t + "”, rata-rata nilai " + fmt(R.main.avg) + " dari 5 (" + lab(R.main.avg) + "), dinilai oleh " + tot + " peserta; " + Math.round(pos / (tot || 1) * 100) + "% memberi nilai 4 atau 5.");
    }
    var rated = R.stars.filter(function (a) { return a.avg != null; }), low = rated.filter(function (a) { return a.avg < 3.5; });
    if (rated.length > 1 && R.hi) p.push("Soal bintang dengan nilai tertinggi adalah “" + R.hi.q.t + "” (" + fmt(R.hi.avg) + "), sedangkan yang terendah “" + R.lo.q.t + "” (" + fmt(R.lo.avg) + "). " + (low.length ? "Perlu perhatian: " + low.map(function (a) { return a.q.t + " (" + fmt(a.avg) + ")"; }).join(", ") + "." : "Tidak ada soal dengan nilai di bawah 3,5."));
    if (R.ntext) p.push("Terkumpul " + R.ntext + " jawaban tulisan dari " + R.texts.length + " soal. Semuanya dimuat pada tab Jawaban.");
    return p;
  }
  function donut(h, n) {
    var tot = h + n, pct = tot ? h / tot : 0, C = 2 * Math.PI * 42;
    return '<svg class="cn-donut" viewBox="0 0 110 110" role="img" aria-label="' + h + " hadir dari " + tot + '"><circle cx="55" cy="55" r="42" class="bg"/><circle cx="55" cy="55" r="42" class="fg" style="--c:' + C.toFixed(1) + ";--p:" + (pct * C).toFixed(1) + '" transform="rotate(-90 55 55)"/><text x="55" y="53" text-anchor="middle" class="n">' + Math.round(pct * 100) + '%</text><text x="55" y="70" text-anchor="middle" class="s">hadir</text></svg>';
  }
  function cols(dist) {
    var max = Math.max.apply(null, dist.concat([1])), mode = dist.indexOf(Math.max.apply(null, dist)), h = "";
    for (var i = 0; i < 5; i++) h += '<div class="cn-col' + (dist[i] && i === mode ? " top" : "") + '"><span class="n">' + dist[i] + '</span><span class="bar"><i style="--h:' + (dist[i] / max * 100).toFixed(1) + '%"></i></span><b>' + (i + 1) + '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.8l2.4 5 5.5.7-4 3.8 1 5.4L10 14l-4.9 2.7 1-5.4-4-3.8 5.5-.7z"/></svg></b></div>';
    return '<div class="cn-cols" role="img" aria-label="Sebaran nilai: ' + dist.map(function (d, i) { return d + " orang memberi " + (i + 1); }).join(", ") + '">' + h + "</div>";
  }
  function hbars(items, cls) {
    return '<ul class="cn-hb ' + (cls || "") + '">' + items.map(function (a) { return "<li><span>" + esc(a.k) + '</span><div class="cn-hbt"><i style="--w:' + a.pct.toFixed(1) + '%"></i></div><b>' + a.txt + "</b></li>"; }).join("") + "</ul>";
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
  function paintBook(m) {
    var R = RC, ev = R.ev, c = R.c, N = R.ro.length, H = R.hadir.length;
    var nBy = {}; R.ro.forEach(function (p) { (nBy[p.bagian] = nBy[p.bagian] || { n: 0, h: 0 }).n++; }); R.hadir.forEach(function (x) { nBy[x.p.bagian].h++; });
    out._by = Object.keys(nBy).map(function (k) { return { k: shortUnit(k), pct: nBy[k].h / nBy[k].n * 100, txt: nBy[k].h + "/" + nBy[k].n }; });
    var kpi = '<div class="cn-kpis"><div class="cn-kpi"><small>Kehadiran</small><b>' + H + "<span> dari " + N + '</span></b><em>' + (N ? Math.round(H / N * 100) : 0) + "% target" + (R.tamu.length ? ", +" + R.tamu.length + " tamu" : "") + "</em></div>" +
      '<div class="cn-kpi"><small>' + (R.main ? esc(R.main.q.t) : "Kepuasan") + '</small><b>' + (R.kep != null ? fmt(R.kep) : "-") + "<span> / 5</span></b><em>" + (R.kep != null ? stars(R.kep, 15) + " " + lab(R.kep) : "Belum ada nilai bintang") + "</em></div>" +
      '<div class="cn-kpi"><small>Responden</small><b>' + R.rows.length + '<span> orang</span></b><em>' + R.per.length + " soal pada event ini</em></div>" +
      '<div class="cn-kpi"><small>Jawaban tulisan</small><b>' + R.ntext + '<span> jawaban</span></b><em>dari ' + R.texts.length + " soal tulisan</em></div></div>";
    var tabs = '<div class="cn-tabs" role="tablist">' + [["hadir", "Kehadiran"], ["ringkas", "Ringkasan"], ["komen", "Jawaban"]].map(function (t) { return '<button type="button" role="tab" class="chip" data-tab="' + t[0] + '" aria-pressed="' + (tab === t[0]) + '" aria-selected="' + (tab === t[0]) + '">' + t[1] + "</button>"; }).join("") + "</div>";
    out.innerHTML = note() + '<div class="cn-bar"><span class="cn-meta">' + [drange(ev), ev.jam, ev.tempat].filter(Boolean).map(function (x) { return "<i>" + esc(x) + "</i>"; }).join("") + '</span><span class="cn-bar-a"><button type="button" class="btn btn-line cn-dark sm" data-a="reload">Muat ulang</button><button type="button" class="btn btn-line cn-dark sm" data-a="csv">Unduh CSV</button><button type="button" class="btn btn-gold sm" data-a="print">Cetak atau PDF</button></span></div>' +
      kpi + tabs + '<div id="cn-panel"></div>' + back("#corner/" + c.id + "/" + m.id + "/pembukuan", "Kembali ke daftar pembukuan");
    paintTab();
  }
  function paintTab() {
    var R = RC, p = $("cn-panel"); if (!p) return;
    [].forEach.call(out.querySelectorAll("[data-tab]"), function (b) { var on = b.getAttribute("data-tab") === tab; b.setAttribute("aria-pressed", on); b.setAttribute("aria-selected", on); });
    p.innerHTML = '<section class="cn-pn" data-p="hadir" ' + (tab === "hadir" ? "" : "hidden") + ">" + panelHadir(R) + '</section><section class="cn-pn" data-p="ringkas" ' + (tab === "ringkas" ? "" : "hidden") + ">" + panelRingkas(R) + '</section><section class="cn-pn" data-p="jawaban" ' + (tab === "komen" ? "" : "hidden") + ">" + panelJawab(R) + "</section>";
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
    return '<div class="cn-fl2"><input type="search" id="cn-q" placeholder="Cari nama atau NIM" aria-label="Cari nama atau NIM" value="' + esc(q) + '"><div class="cn-chips">' +
      [["semua", "Semua " + (R.ro.length + R.tamu.length)], ["hadir", "Hadir " + (R.hadir.length + R.tamu.length)], ["tidak", "Tidak hadir " + R.absen.length]].map(function (f) { return '<button type="button" class="chip" data-f="' + f[0] + '" aria-pressed="' + (filt === f[0]) + '">' + f[1] + "</button>"; }).join("") + '</div></div><div id="cn-list"></div>';
  }
  function scoreCell(R, r) { var v = R.main ? ansOf(r, R.main.q) : null; return v ? "<em>" + v + "</em>" + stars(v, 13) : ""; }
  function list() {
    var box = $("cn-list"); if (!box) return;
    var R = RC, G = groupRows(R), s = norm(q), h = "", total = 0;
    function row(x) {
      var hit = !s || norm(x.nama + " " + (x.r ? x.r.nim : "")).indexOf(s) >= 0;
      if (!hit || (filt === "hadir" && !x.ok) || (filt === "tidak" && x.ok)) return "";
      total++;
      return '<li class="cn-r ' + (x.ok ? "ok" : "no") + '"><span class="cn-mark" aria-hidden="true">' + (x.ok ? '<svg viewBox="0 0 20 20"><path d="M5 10.5l3.2 3.2L15 6.8"/></svg>' : '<svg viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8"/></svg>') + '</span><span class="cn-r-n"><b>' + esc(x.nama) + '</b><small>' + (x.ok ? esc(x.r.nim) + " · " + jam(x.r.t) : "Belum mengisi") + '</small></span><span class="cn-r-s">' + (x.ok ? scoreCell(R, x.r) : '<em class="sr">Tidak hadir</em>') + "</span></li>";
    }
    G.order.forEach(function (k) {
      var rows = G.g[k].map(row).join(""); if (!rows) return;
      var hh = G.g[k].filter(function (x) { return x.ok; }).length;
      h += '<h3 class="cn-gh"><span>' + esc(shortUnit(k)) + "</span><small>" + hh + "/" + G.g[k].length + ' hadir</small></h3><ul class="cn-rl">' + rows + "</ul>";
    });
    var tm = R.tamu.filter(function (r) { return (filt !== "tidak") && (!s || norm(r.nama + " " + r.nim).indexOf(s) >= 0); });
    if (tm.length) { total += tm.length; h += '<h3 class="cn-gh"><span>Di luar daftar target</span><small>' + tm.length + ' tamu atau nama tak cocok</small></h3><ul class="cn-rl">' + tm.map(function (r) {
      return '<li class="cn-r ok"><span class="cn-mark" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M5 10.5l3.2 3.2L15 6.8"/></svg></span><span class="cn-r-n"><b>' + esc(r.nama) + '</b><small>' + esc(r.nim) + " · " + esc(r.bagian === "Tamu" ? "Tamu" : shortUnit(r.bagian)) + " · " + jam(r.t) + '</small></span><span class="cn-r-s">' + scoreCell(R, r) + "</span></li>"; }).join("") + "</ul>"; }
    box.innerHTML = total ? h : '<div class="sp-empty">' + (R.ro.length || R.tamu.length ? "Tidak ada nama yang cocok." : "Event ini belum punya daftar target.") + "</div>";
  }
  function panelRingkas(R) {
    var by = out._by || [], has = R.rows.length, extra = "";
    R.per.filter(function (p) { return p.q.tipe === "pilihan" && p.n; }).forEach(function (p) {
      var mx = Math.max.apply(null, Object.keys(p.cnt).map(function (k) { return p.cnt[k]; }).concat([1]));
      extra += '<section class="cn-ch cn-wide"><h3>' + esc(p.q.t) + " <small>" + p.n + ' jawaban</small></h3>' + hbars(Object.keys(p.cnt).map(function (k) { return { k: k, pct: p.cnt[k] / mx * 100, txt: p.cnt[k] }; })) + "</section>";
    });
    return '<article class="cn-sum"><h2 class="cn-h">Ringkasan acara</h2>' + narasi(R).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") + "</article>" +
      '<div class="cn-charts"><section class="cn-ch"><h3>Kehadiran</h3><div class="cn-ch-d">' + donut(R.hadir.length, R.absen.length) + '<ul class="cn-leg"><li><i class="ok"></i>Hadir <b>' + R.hadir.length + '</b></li><li><i class="no"></i>Tidak hadir <b>' + R.absen.length + "</b></li>" + (R.tamu.length ? '<li><i class="gu"></i>Di luar daftar <b>' + R.tamu.length + "</b></li>" : "") + "</ul></div></section>" +
      '<section class="cn-ch"><h3>Sebaran nilai <small>' + esc(R.main ? R.main.q.t : "") + "</small></h3>" + (R.main && R.main.n ? cols(R.main.dist) : '<p class="cn-muted">Belum ada nilai bintang.</p>') + "</section>" +
      '<section class="cn-ch cn-wide"><h3>Nilai rata-rata per soal bintang</h3>' + (has && R.stars.length ? hbars(R.stars.map(function (a) { return { k: a.q.t, pct: (a.avg || 0) / 5 * 100, txt: a.avg == null ? "-" : fmt(a.avg) }; }), "au") : '<p class="cn-muted">Belum ada nilai bintang.</p>') + "</section>" + extra +
      '<section class="cn-ch cn-wide"><h3>Kehadiran per bagian</h3>' + (by.length ? hbars(by) : '<p class="cn-muted">Tidak ada data.</p>') + "</section></div>";
  }
  function panelJawab(R) {
    function who(r) { return hideNames ? "Peserta anonim" : esc(r.nama) + ", " + esc(r.bagian === "Tamu" ? "Tamu" : shortUnit(r.bagian)); }
    var h = '<div class="cn-fl2"><label class="cn-sw"><input type="checkbox" id="cn-hide"' + (hideNames ? " checked" : "") + "><span>Sembunyikan nama pengirim</span></label></div>";
    var any = false;
    R.per.forEach(function (p) {
      var q = p.q; if (q.tipe === "bintang" && !p.n) return;
      any = true;
      h += '<section class="cn-qa"><h3 class="cn-gh"><span>' + esc(q.t) + '</span><small>' + p.n + " jawaban · " + ({ bintang: "bintang", singkat: "jawaban singkat", paragraf: "paragraf", pilihan: "pilihan" }[q.tipe]) + (q.wajib ? "" : " · opsional") + "</small></h3>";
      if (q.tipe === "bintang") h += '<div class="cn-qa-s">' + (p.avg != null ? "<b>" + fmt(p.avg) + "</b>" + stars(p.avg, 18) : "") + '</div><div class="cn-qa-d">' + cols(p.dist) + "</div>";
      else if (q.tipe === "pilihan") { var mx = Math.max.apply(null, Object.keys(p.cnt).map(function (k) { return p.cnt[k]; }).concat([1])); h += hbars(Object.keys(p.cnt).map(function (k) { return { k: k, pct: p.cnt[k] / mx * 100, txt: p.cnt[k] }; })); }
      else h += p.n ? '<ul class="cn-cms ' + (/kritik|saran/i.test(q.t) ? "kr" : "") + '">' + p.vals.map(function (x) { return '<li class="cn-cm"><p>' + esc(x.v) + '</p><span class="cn-cm-f">' + (R.main && ansOf(x.r, R.main.q) ? stars(ansOf(x.r, R.main.q), 13) : "") + '<span class="cn-who">' + who(x.r) + "</span></span></li>"; }).join("") + "</ul>" : '<p class="cn-muted">Belum ada jawaban.</p>';
      h += "</section>";
    });
    return h + (any ? "" : '<p class="cn-muted">Belum ada jawaban dari peserta.</p>');
  }
  function csv() {
    var R = RC; if (!R) return;
    function c(v) { v = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; }
    var qs = R.per.map(function (p) { return p.q; });
    function vals(r) { return qs.map(function (q) { var v = ansOf(r, q); return v == null ? "" : v; }); }
    var rows = [["Bagian", "Nama", "NIM", "Status", "Waktu isi"].concat(qs.map(function (q) { return q.t; }))];
    R.hadir.forEach(function (x) { rows.push([x.p.bagian, x.p.nama, x.r.nim, "Hadir", x.r.t].concat(vals(x.r))); });
    R.absen.forEach(function (x) { rows.push([x.p.bagian, x.p.nama, "", "Tidak hadir", ""].concat(qs.map(function () { return ""; }))); });
    R.tamu.forEach(function (r) { rows.push([r.bagian, r.nama, r.nim, "Di luar daftar", r.t].concat(vals(r))); });
    var txt = "﻿" + rows.map(function (r) { return r.map(c).join(","); }).join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/csv;charset=utf-8" })); a.download = "pembukuan-" + R.ev.id + ".csv";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  /* ---------- router ---------- */
  var shown = null;
  function route() {
    var h = location.hash, p = h.slice(1).split("?")[0].split("/");
    var c = corner(decodeURIComponent(p[1] || ""));
    document.body.classList.remove("cn-print-poster"); leaveScan();
    if (!c) return notFound(null);
    var seg = p[2], sub = p[3], eid = p[4] ? decodeURIComponent(p[4]) : "";
    if (!seg) return vHub(c);
    if (c.status === "segera") return vSoon(c);
    if (seg === "isi") { var ev0 = eventOf(c, decodeURIComponent(sub || "")); return ev0 ? vForm(c, ev0) : notFound(c); }
    var m = menuOf(c, seg); if (!m) return notFound(c);
    if (m.tipe === "info") return vInfo(c, m);
    if (m.tipe === "anggota") return vAnggota(c, m);
    if (m.tipe === "profil") return vProfil(c, m);
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
    } else if (!app.hidden) { app.hidden = true; document.title = TITLE0; setNav(false); shown = null; leaveScan(); }
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
  /* data buku panduan dimuat setelah skrip ini: segarkan halaman profil bila perlu */
  window.addEventListener("load", function () { if (!app.hidden && /^#corner\/[^/]+\/profil/.test(location.hash) && window.PANDUAN) { shown = null; sync(); } });

  out.addEventListener("click", function (e) {
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
  out.addEventListener("input", function (e) { if (e.target.id === "cn-q") { q = e.target.value.trim(); list(); } });
  out.addEventListener("change", function (e) { if (e.target.id === "cn-hide") { hideNames = e.target.checked; var p = out.querySelector('[data-p="jawaban"]'); if (p) p.innerHTML = panelJawab(RC); } });

  sync();
})();
