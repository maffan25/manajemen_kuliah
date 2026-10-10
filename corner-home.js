/* corner-home.js: bagian "Samasta Corner" di beranda.
   - Kerucut lalu lintas 3D: berputar saat dipencet, saat digulir melewatinya, dan miring mengikuti kursor.
   - Bola corner dibuat otomatis dari corner-data.js (diedit lewat admin-corner.html). */
(function () {
  "use strict";
  var D = window.CORNER || { corner: [] };
  var stage = document.getElementById("cn-stage");
  if (!stage) return;
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* Warna bola: dipilih admin lewat nama, semuanya turunan palet situs */
  var TONES = {
    zamrud:  { o1: "#43b99a", o2: "#14705a", o3: "#093a2f", ot: "#fbe58a" },
    emas:    { o1: "#fff0a6", o2: "#f8d24a", o3: "#c4932a", ot: "#0d2a38" },
    samudra: { o1: "#6cc0de", o2: "#1d6f8f", o3: "#0c3548", ot: "#fff6d6" },
    perunggu:{ o1: "#e3c785", o2: "#8a6a2f", o3: "#47350f", ot: "#fff6d6" },
    tinta:   { o1: "#5b8c9f", o2: "#17414d", o3: "#06171f", ot: "#f8d24a" }
  };
  window.CORNER_TONES = TONES;

  /* ================= Bola corner ================= */
  var ul = $("cn-orbs");
  if (ul) {
    var list = (D.corner || []);
    ul.innerHTML = list.length ? list.map(function (c, i) {
      var t = TONES[c.warna] || TONES.zamrud, soon = c.status === "segera";
      return '<li style="--i:' + i + '"><a class="cn-orb' + (soon ? " is-soon" : "") + '" href="#corner/' + esc(c.id) + '" style="--o1:' + t.o1 + ";--o2:" + t.o2 + ";--o3:" + t.o3 + ";--ot:" + t.ot + '"' +
        ' aria-label="Buka corner ' + esc(c.nama) + (soon ? ", segera hadir" : "") + '">' +
        '<span class="cn-sph"><b>' + esc(c.singkat || c.nama) + '</b></span><span class="cn-shd" aria-hidden="true"></span>' +
        '<span class="cn-name">' + esc(c.nama) + '</span>' +
        '<span class="cn-tag' + (soon ? " soon" : "") + '">' + (soon ? "Segera hadir" : esc(c.tagline || "Buka corner")) + '</span></a></li>';
    }).join("") : '<li class="cn-none">Corner pertama sedang disiapkan.</li>';
  }

  /* Bola jatuh dan memantul tiap kali panggung masuk layar (satu momen yang diatur) */
  if (!reduce && "IntersectionObserver" in window) {
    stage.classList.add("cn-armed");
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { stage.classList.toggle("cn-in", e.isIntersecting && e.intersectionRatio > 0.25); });
    }, { threshold: [0, 0.26, 0.5] }).observe(stage);
  } else stage.classList.add("cn-in");

  /* ================= Kerucut ================= */
  var btn = $("cn-cone"), host = $("cn-tilt");
  if (!btn || !host) return;

  var CX = 130;
  function W(y) { return 7.5 + 0.3674 * (y - 26); }                 /* setengah lebar kerucut pada ketinggian y */
  function band(y1, y2) {
    var w1 = W(y1), w2 = W(y2), r1 = w1 * 0.163, r2 = w2 * 0.163;
    return "M" + (CX - w1) + "," + y1 + " A" + w1 + " " + r1 + " 0 0 0 " + (CX + w1) + "," + y1 +
      " L" + (CX + w2) + "," + y2 + " A" + w2 + " " + r2 + " 0 0 1 " + (CX - w2) + "," + y2 + "Z";
  }
  var BODY = "M38,256 L122.5,26 Q130,16 137.5,26 L222,256 A92 15 0 0 1 38,256Z";
  var FOOT = "M" + (CX - W(232)) + ",232 A" + W(232) + " " + (W(232) * 0.163) + " 0 0 0 " + (CX + W(232)) + ",232 L222,256 A92 15 0 0 1 38,256Z";
  var logo = "";
  try {
    var m = /url\((['"]?)(.*?)\1\)/.exec(getComputedStyle(document.documentElement).getPropertyValue("--logo-mark").trim());
    logo = m ? m[2] : "";
  } catch (x) {}

  host.innerHTML =
    '<svg viewBox="0 0 260 330" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
    '<defs>' +
    '<clipPath id="cn-clip"><path d="' + BODY + '"/></clipPath>' +
    '<clipPath id="cn-logo-clip"><circle cx="0" cy="0" r="19"/></clipPath>' +
    '<linearGradient id="cn-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe98a"/><stop offset=".55" stop-color="#f8d24a"/><stop offset="1" stop-color="#e8b92c"/></linearGradient>' +
    '<linearGradient id="cn-shade" gradientUnits="userSpaceOnUse" x1="38" y1="0" x2="222" y2="0">' +
    '<stop offset="0" stop-color="#04141b" stop-opacity=".55"/><stop offset=".16" stop-color="#04141b" stop-opacity=".16"/>' +
    '<stop offset=".34" stop-color="#fff" stop-opacity=".30"/><stop offset=".48" stop-color="#fff" stop-opacity="0"/>' +
    '<stop offset=".78" stop-color="#04141b" stop-opacity=".24"/><stop offset="1" stop-color="#04141b" stop-opacity=".58"/></linearGradient>' +
    '<linearGradient id="cn-amb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#04141b" stop-opacity=".28"/></linearGradient>' +
    '<linearGradient id="cn-emL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c8a70"/><stop offset="1" stop-color="#0f5444"/></linearGradient>' +
    '</defs>' +
    /* alas */
    '<path d="M130,222 L248,258 L130,294 L12,258Z" fill="#14705a" stroke="#14705a" stroke-width="8" stroke-linejoin="round"/>' +
    '<path d="M12,262 L130,298 L130,312 L12,276Z" fill="#0b3d33" stroke="#0b3d33" stroke-width="8" stroke-linejoin="round"/>' +
    '<path d="M248,262 L130,298 L130,312 L248,276Z" fill="#0f5444" stroke="#0f5444" stroke-width="8" stroke-linejoin="round"/>' +
    '<path d="M130,222 L248,258 L130,294 L12,258Z" fill="url(#cn-emL)" stroke="#f8d24a" stroke-opacity=".55" stroke-width="1.2" transform="translate(130 258) scale(.9) translate(-130 -258)"/>' +
    /* badan */
    '<path d="' + BODY + '" fill="url(#cn-gold)"/>' +
    '<g clip-path="url(#cn-clip)">' +
    '<path d="' + band(92, 114) + '" fill="#fff8dc"/>' +
    '<path d="' + band(150, 198) + '" fill="#fff8dc"/>' +
    '<path d="' + FOOT + '" fill="#14705a"/>' +
    '<g id="cn-faces"></g>' +
    '<rect x="30" y="10" width="200" height="270" fill="url(#cn-shade)"/>' +
    '<rect x="30" y="10" width="200" height="270" fill="url(#cn-amb)"/>' +
    '<path d="M101,52 L86,236" stroke="#fff" stroke-opacity=".34" stroke-width="5" stroke-linecap="round" filter="url(#cn-blur)"/>' +
    '</g>' +
    '<path d="' + BODY + '" fill="none" stroke="#b98a14" stroke-opacity=".5" stroke-width="1.2"/>' +
    '<filter id="cn-blur" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation="2.2"/></filter>' +
    '</svg>';

  /* Tiga sisi kerucut: logo, tulisan Samasta, tulisan Corner */
  var FACE = Math.PI * 2 / 3, faceG = $("cn-faces"), NS = "http://www.w3.org/2000/svg";
  var faces = [
    { p: 0, inner: (logo ? '<g clip-path="url(#cn-logo-clip)"><image href="' + logo + '" x="-19" y="-19" width="38" height="38" preserveAspectRatio="xMidYMid slice"/></g>' : "") +
      '<circle r="19" fill="none" stroke="#0d2a38" stroke-width="2.2"/><circle r="22.5" fill="none" stroke="#14705a" stroke-width="1.2" stroke-opacity=".7"/>' },
    { p: FACE, inner: '<text y="-1" text-anchor="middle" font-family="Fraunces,Georgia,serif" font-weight="700" font-size="15" letter-spacing=".9" fill="#0d2a38">SAMASTA</text>' +
      '<path d="M-26,7 H26" stroke="#14705a" stroke-width="2" stroke-linecap="round"/><text y="20" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif" font-weight="700" font-size="7.2" letter-spacing="1.6" fill="#14705a">BEM STDIIS</text>' },
    { p: FACE * 2, inner: '<text y="5" text-anchor="middle" font-family="Fraunces,Georgia,serif" font-weight="700" font-size="17" letter-spacing="1.4" fill="#0d2a38">CORNER</text>' +
      '<path d="M-22,-13 H22M-22,14 H22" stroke="#14705a" stroke-width="2" stroke-linecap="round"/>' }
  ];
  faces.forEach(function (f) {
    var g = document.createElementNS(NS, "g"); g.innerHTML = f.inner; faceG.appendChild(g); f.g = g;
  });
  function yAt(x) {                                  /* tengah pita lebar mengikuti lengkungnya */
    var w1 = W(150), w2 = W(198), a = Math.max(0, 1 - (x / w1) * (x / w1)), b = Math.max(0, 1 - (x / w2) * (x / w2));
    return (150 + w1 * 0.163 * Math.sqrt(a) + 198 + w2 * 0.163 * Math.sqrt(b)) / 2;
  }

  var th = 0, om = 0, raf = 0, lt = 0, inView = false, lastAuto = 0, lastY = window.pageYOffset;
  function paint() {
    faces.forEach(function (f) {
      var a = th + f.p, s = Math.sin(a), c = Math.cos(a);
      if (c <= 0.02) { f.g.setAttribute("display", "none"); return; }
      var X = 54 * s;
      f.g.removeAttribute("display");
      f.g.setAttribute("opacity", Math.min(1, (c - 0.02) / 0.3).toFixed(3));
      f.g.setAttribute("transform", "translate(" + (CX + X).toFixed(2) + " " + yAt(X).toFixed(2) + ") scale(" + c.toFixed(4) + " 1)");
    });
  }
  function snap() { return Math.round(th / FACE) * FACE; }
  function tick(ts) {
    var dt = Math.min(0.05, (ts - lt) / 1000 || 0.016); lt = ts;
    if (Math.abs(om) > 1.1) om *= Math.exp(-1.9 * dt);
    else { om += (snap() - th) * 40 * dt; om *= Math.exp(-7 * dt); }
    th += om * dt; paint();
    if (Math.abs(om) < 0.004 && Math.abs(snap() - th) < 0.004) { th = snap(); om = 0; paint(); raf = 0; return; }
    raf = requestAnimationFrame(tick);
  }
  function kick(v) {
    om = Math.max(-26, Math.min(26, om + v));
    if (!raf) { lt = performance.now(); raf = requestAnimationFrame(tick); }
  }
  paint();

  /* Dipencet: putar, melompat kecil, dan bola ikut menyala */
  btn.addEventListener("click", function () {
    if (reduce) { th += FACE; paint(); return; }
    kick(20);
    btn.classList.remove("hop"); void btn.offsetWidth; btn.classList.add("hop");
  });
  btn.addEventListener("animationend", function (e) { if (e.animationName === "cnhop") btn.classList.remove("hop"); });

  /* Digulir melewati bagian ini: kerucut ikut berputar searah gulir */
  if (!reduce && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var was = inView; inView = e.isIntersecting;
        if (inView && !was && e.intersectionRatio > 0.2 && performance.now() - lastAuto > 6000) {
          lastAuto = performance.now(); setTimeout(function () { if (inView) kick(13); }, 260);
        }
      });
    }, { threshold: [0, 0.2, 0.5] }).observe(btn);
    var busy = false;
    window.addEventListener("scroll", function () {
      if (busy) return; busy = true;
      requestAnimationFrame(function () {
        busy = false;
        var y = window.pageYOffset, dy = y - lastY; lastY = y;
        if (inView && Math.abs(dy) > 1) kick(dy * 0.03);
      });
    }, { passive: true });
  }

  /* Miring mengikuti kursor (hanya mouse) */
  if (!reduce) {
    stage.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = btn.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / (r.width * 1.6), dy = (e.clientY - (r.top + r.height / 2)) / (r.height * 1.6);
      dx = Math.max(-1, Math.min(1, dx)); dy = Math.max(-1, Math.min(1, dy));
      host.style.setProperty("--rx", (-dy * 9).toFixed(2) + "deg"); host.style.setProperty("--ry", (dx * 13).toFixed(2) + "deg");
    });
    stage.addEventListener("pointerleave", function () { host.style.setProperty("--rx", "0deg"); host.style.setProperty("--ry", "0deg"); });
  }
})();
