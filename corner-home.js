/* corner-home.js: bagian "Samasta Corner" di beranda.
   - Kerucut lalu lintas 3D: pegas halus (tanpa patah), dipencet, diseret, atau digulir.
   - Bola corner dibuat otomatis dari corner-data.js: bola kaca berikon, cincin orbit, dan kilau yang mengikuti kursor. */
(function () {
  "use strict";
  var D = window.CORNER || { corner: [] };
  var stage = document.getElementById("cn-stage");
  if (!stage) return;
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var TONES = window.CORNER_TONES || { zamrud: { o1: "#43b99a", o2: "#14705a", o3: "#093a2f", ot: "#fbe58a" } };

  /* ================= Langit bertabur bintang di belakang panggung ================= */
  (function () {
    var sky = document.createElement("div"); sky.className = "cn-sky"; sky.setAttribute("aria-hidden", "true");
    var h = "", i, seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (i = 0; i < 30; i++) h += '<i style="left:' + (rnd() * 100).toFixed(1) + "%;top:" + (rnd() * 100).toFixed(1) + "%;--d:" + (2 + rnd() * 4).toFixed(1) + "s;--s:" + (2 + rnd() * 3).toFixed(1) + "px;animation-delay:-" + (rnd() * 5).toFixed(1) + 's"></i>';
    sky.innerHTML = h; stage.insertBefore(sky, stage.firstChild);
  })();

  /* ================= Bola corner ================= */
  function abbrSize(t) { var n = String(t).length; return n <= 5 ? 13 : n <= 7 ? 11.5 : 10; }
  var ul = $("cn-orbs");
  if (ul) {
    var list = (D.corner || []);
    ul.innerHTML = list.length ? list.map(function (c, i) {
      var t = TONES[c.warna] || TONES.zamrud, soon = c.status === "segera", key = window.cornerIconKey ? window.cornerIconKey(c) : "bintang";
      var icon = window.cornerIcon ? window.cornerIcon(key, "cn-ico-o") : "";
      return '<li style="--i:' + i + '"><a class="cn-orb' + (soon ? " is-soon" : "") + '" data-tone="' + esc(c.warna) + '" href="#corner/' + esc(c.id) + '" style="--o1:' + t.o1 + ";--o2:" + t.o2 + ";--o3:" + t.o3 + ";--ot:" + t.ot + '"' +
        ' aria-label="Buka corner ' + esc(c.nama) + (soon ? ", segera hadir" : "") + '">' +
        '<span class="cn-world" aria-hidden="true"><span class="cn-aura"></span>' +
        '<span class="cn-orbit"><i class="cn-sat"></i></span><span class="cn-orbit o2"><i class="cn-sat"></i></span>' +
        '<span class="cn-sph"><span class="cn-gloss"></span>' + icon + '<b class="cn-abbr" style="--fs:' + abbrSize(c.singkat || c.nama) + 'px">' + esc(c.singkat || c.nama) + '</b></span>' +
        '<i class="cn-spk k1"></i><i class="cn-spk k2"></i><i class="cn-spk k3"></i></span>' +
        '<span class="cn-shd" aria-hidden="true"></span>' +
        '<span class="cn-name">' + esc(c.nama) + '</span>' +
        '<span class="cn-tag' + (soon ? " soon" : "") + '">' + (soon ? "Segera hadir" : esc(c.tagline || "Buka corner")) + '</span></a></li>';
    }).join("") : '<li class="cn-none">Corner pertama sedang disiapkan.</li>';

    /* Kilau dan kemiringan bola mengikuti kursor */
    if (!reduce) {
      ul.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        var o = e.target.closest && e.target.closest(".cn-orb"); if (!o) return;
        var r = o.querySelector(".cn-world").getBoundingClientRect();
        o.style.setProperty("--px", Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2))).toFixed(2));
        o.style.setProperty("--py", Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2))).toFixed(2));
      });
      ul.addEventListener("pointerout", function (e) {
        var o = e.target.closest && e.target.closest(".cn-orb"); if (!o || (e.relatedTarget && o.contains(e.relatedTarget))) return;
        o.style.setProperty("--px", 0); o.style.setProperty("--py", 0);
      });
    }
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


  /* ---- Fisika: pegas teredam hampir kritis menuju sudut sasaran (base). Tidak ada lonjakan kecepatan,
     jadi gerakan selalu mengalir. Klik, seret, dan gulir hanya menggeser sasaran. ---- */
  var th = 0, v = 0, base = 0, raf = 0, lt = 0, inView = false, lastAuto = 0, lastY = window.pageYOffset, snapT = 0, dragging = false;
  var K = 64, C = 2 * Math.sqrt(K) * 0.94;
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
  function step(ts) {
    var dt = Math.min(0.034, (ts - lt) / 1000 || 0.016); lt = ts;
    var n = 3, h = dt / n, i;
    for (i = 0; i < n; i++) { v += (K * (base - th) - C * v) * h; th += v * h; }
    paint();
    if (!dragging && Math.abs(base - th) < 0.0006 && Math.abs(v) < 0.006) { th = base; v = 0; paint(); raf = 0; return; }
    raf = requestAnimationFrame(step);
  }
  function wake() { if (!raf) { lt = performance.now(); raf = requestAnimationFrame(step); } }
  function snapSoon(ms) { clearTimeout(snapT); snapT = setTimeout(function () { base = Math.round(base / FACE) * FACE; wake(); }, ms); }
  function nudge(n) { base = Math.round(base / FACE) * FACE + n * FACE; clearTimeout(snapT); wake(); }
  function hop() { btn.classList.remove("hop"); void btn.offsetWidth; btn.classList.add("hop"); }
  paint();

  /* Dipencet: putar satu sisi dan melompat kecil; pencetan beruntun menumpuk dengan mulus */
  function spin() { if (reduce) { th = base = base + FACE; paint(); return; } nudge(1); hop(); }
  btn.addEventListener("animationend", function (e) { if (e.animationName === "cnhop") btn.classList.remove("hop"); });
  btn.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); if (reduce) { th = base = base + FACE; paint(); } else nudge(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); if (reduce) { th = base = base - FACE; paint(); } else nudge(-1); }
  });

  /* Diseret: kerucut mengikuti jari atau kursor, lalu melaju sedikit dan mengunci ke sisi terdekat.
     touch-action: pan-y membiarkan gulir vertikal halaman tetap bekerja. */
  var dx0 = 0, lastX = 0, lastT = 0, vel = 0, moved = 0, pid = null, skipClick = false;
  btn.addEventListener("pointerdown", function (e) {
    if (reduce || (e.pointerType === "mouse" && e.button)) return;
    pid = e.pointerId; dragging = true; moved = 0; vel = 0; lastX = dx0 = e.clientX; lastT = performance.now(); clearTimeout(snapT);
  });
  btn.addEventListener("pointermove", function (e) {
    if (!dragging || e.pointerId !== pid) return;
    var now = performance.now(), dx = e.clientX - lastX, dtm = Math.max(1, now - lastT);
    moved += Math.abs(dx);
    if (moved > 6) { if (btn.setPointerCapture && !btn._cap) { try { btn.setPointerCapture(pid); btn._cap = true; } catch (x) {} } base += dx * 0.017; vel = vel * 0.6 + (dx / dtm) * 0.4; wake(); }
    lastX = e.clientX; lastT = now;
  });
  function release(e) {
    if (!dragging || (e && e.pointerId !== pid)) return;
    dragging = false; pid = null; btn._cap = false;
    if (moved > 6) { skipClick = true; base += vel * 22 * 0.017 * 6; snapSoon(0); }
  }
  btn.addEventListener("pointerup", release); btn.addEventListener("pointercancel", release);
  btn.addEventListener("click", function () { if (skipClick) { skipClick = false; return; } spin(); });

  /* Digulir melewati bagian ini: kerucut ikut berputar halus searah gulir, lalu mengunci ke sisi */
  if (!reduce && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var was = inView; inView = e.isIntersecting;
        if (inView && !was && e.intersectionRatio > 0.2 && performance.now() - lastAuto > 6000) {
          lastAuto = performance.now(); setTimeout(function () { if (inView) nudge(1); }, 260);
        }
      });
    }, { threshold: [0, 0.2, 0.5] }).observe(btn);
    var busy = false;
    window.addEventListener("scroll", function () {
      if (busy) return; busy = true;
      requestAnimationFrame(function () {
        busy = false;
        var y = window.pageYOffset, dy = y - lastY; lastY = y;
        if (inView && !dragging && Math.abs(dy) > 1) { base += Math.max(-60, Math.min(60, dy)) * 0.0075; wake(); snapSoon(170); }
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
