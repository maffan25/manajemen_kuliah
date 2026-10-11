/* corner-home.js: bagian "Samasta Corner" di beranda.
   - Kerucut 3D: diputar dengan fisika pegas (halus, tanpa patah), ikut berputar saat digulir, miring mengikuti kursor.
   - Bola corner dibuat otomatis dari corner-data.js (diedit lewat admin-corner.html). */
(function () {
  "use strict";
  var D = window.CORNER || { corner: [] };
  var stage = document.getElementById("cn-stage");
  if (!stage) return;
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var TONES = window.CORNER_TONES || {}, CI = window.CORNER_ICONS;

  /* ================= Bola corner ================= */
  function orbStyle(t) { return "--o1:" + t.o1 + ";--o2:" + t.o2 + ";--o3:" + t.o3 + ";--ot:" + t.ot + ";--ia:" + t.ia + ";--glow:" + t.glow; }
  window.CORNER_ORB_STYLE = orbStyle;
  var ul = $("cn-orbs");
  if (ul) {
    var list = (D.corner || []);
    ul.innerHTML = list.length ? list.map(function (c, i) {
      var t = TONES[c.warna] || TONES.zamrud, soon = c.status === "segera";
      return '<li style="--i:' + i + '"><a class="cn-orb' + (soon ? " is-soon" : "") + '" href="#corner/' + esc(c.id) + '" style="' + orbStyle(t) + '"' +
        ' aria-label="Buka corner ' + esc(c.nama) + (soon ? ", segera hadir" : "") + '">' +
        '<span class="cn-fl"><span class="cn-orbit" aria-hidden="true"></span>' +
        '<span class="cn-sph">' + CI.svg(c.ikon || "bintang", "cn-ico") + '</span>' +
        '<i class="cn-sp s1" aria-hidden="true"></i><i class="cn-sp s2" aria-hidden="true"></i><i class="cn-sp s3" aria-hidden="true"></i>' +
        (soon ? '<span class="cn-lockbadge" aria-hidden="true">Segera</span>' : "") + '</span>' +
        '<span class="cn-shd" aria-hidden="true"></span>' +
        '<b class="cn-sing">' + esc(c.singkat || c.nama) + '</b>' +
        '<span class="cn-name">' + esc(c.nama) + '</span>' +
        '<span class="cn-tag' + (soon ? " soon" : "") + '">' + (soon ? "Segera hadir" : esc(c.tagline || "Buka corner")) + '</span></a></li>';
    }).join("") : '<li class="cn-none">Corner pertama sedang disiapkan.</li>';

    /* Sorot dan miring halus mengikuti kursor di atas bola */
    if (!reduce) {
      [].forEach.call(ul.querySelectorAll(".cn-orb"), function (a) {
        var sph = a.querySelector(".cn-sph");
        a.addEventListener("pointermove", function (e) {
          if (e.pointerType !== "mouse") return;
          var r = sph.getBoundingClientRect(), x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
          a.style.setProperty("--tx", Math.max(-1, Math.min(1, x * 2)).toFixed(2));
          a.style.setProperty("--ty", Math.max(-1, Math.min(1, y * 2)).toFixed(2));
        });
        a.addEventListener("pointerleave", function () { a.style.setProperty("--tx", 0); a.style.setProperty("--ty", 0); });
      });
    }
  }

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
  function W(y) { return 7.5 + 0.3674 * (y - 26); }
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
    '<filter id="cn-blur" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation="2.2"/></filter>' +
    '</defs>' +
    '<path d="M130,222 L248,258 L130,294 L12,258Z" fill="#14705a" stroke="#14705a" stroke-width="8" stroke-linejoin="round"/>' +
    '<path d="M12,262 L130,298 L130,312 L12,276Z" fill="#0b3d33" stroke="#0b3d33" stroke-width="8" stroke-linejoin="round"/>' +
    '<path d="M248,262 L130,298 L130,312 L248,276Z" fill="#0f5444" stroke="#0f5444" stroke-width="8" stroke-linejoin="round"/>' +
    '<path d="M130,222 L248,258 L130,294 L12,258Z" fill="url(#cn-emL)" stroke="#f8d24a" stroke-opacity=".55" stroke-width="1.2" transform="translate(130 258) scale(.9) translate(-130 -258)"/>' +
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
    '</svg>';

  var FACE = Math.PI * 2 / 3, faceG = $("cn-faces"), NS = "http://www.w3.org/2000/svg";
  var faces = [
    { p: 0, inner: (logo ? '<g clip-path="url(#cn-logo-clip)"><image href="' + logo + '" x="-19" y="-19" width="38" height="38" preserveAspectRatio="xMidYMid slice"/></g>' : "") +
      '<circle r="19" fill="none" stroke="#0d2a38" stroke-width="2.2"/><circle r="22.5" fill="none" stroke="#14705a" stroke-width="1.2" stroke-opacity=".7"/>' },
    { p: FACE, inner: '<text y="-1" text-anchor="middle" font-family="Fraunces,Georgia,serif" font-weight="700" font-size="15" letter-spacing=".9" fill="#0d2a38">SAMASTA</text>' +
      '<path d="M-26,7 H26" stroke="#14705a" stroke-width="2" stroke-linecap="round"/><text y="20" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif" font-weight="700" font-size="7.2" letter-spacing="1.6" fill="#14705a">BEM STDIIS</text>' },
    { p: FACE * 2, inner: '<text y="5" text-anchor="middle" font-family="Fraunces,Georgia,serif" font-weight="700" font-size="17" letter-spacing="1.4" fill="#0d2a38">CORNER</text>' +
      '<path d="M-22,-13 H22M-22,14 H22" stroke="#14705a" stroke-width="2" stroke-linecap="round"/>' }
  ];
  faces.forEach(function (f) { var g = document.createElementNS(NS, "g"); g.innerHTML = f.inner; faceG.appendChild(g); f.g = g; });
  function yAt(x) {
    var w1 = W(150), w2 = W(198), a = Math.max(0, 1 - (x / w1) * (x / w1)), b = Math.max(0, 1 - (x / w2) * (x / w2));
    return (150 + w1 * 0.163 * Math.sqrt(a) + 198 + w2 * 0.163 * Math.sqrt(b)) / 2;
  }
  function paint(th) {
    faces.forEach(function (f) {
      var a = th + f.p, s = Math.sin(a), c = Math.cos(a);
      if (c <= 0.02) { f.g.setAttribute("display", "none"); return; }
      var X = 54 * s;
      f.g.removeAttribute("display");
      f.g.setAttribute("opacity", Math.min(1, (c - 0.02) / 0.3).toFixed(3));
      f.g.setAttribute("transform", "translate(" + (CX + X).toFixed(2) + " " + yAt(X).toFixed(2) + ") scale(" + c.toFixed(4) + " 1)");
    });
  }

  /* ----- Gerak: satu pegas teredam untuk putaran, satu untuk kemiringan, satu untuk lompatan ----- */
  var th = 0, tg = 0, om = 0;               /* sudut, target, kecepatan */
  var rx = 0, ry = 0, trx = 0, try_ = 0;    /* kemiringan kursor */
  var hop = 0, hv = 0;                      /* lompatan (px) */
  var raf = 0, lt = 0, inView = false, lastY = window.pageYOffset, snapT = 0, lastAuto = 0;
  function snapTarget() { return Math.round(tg / FACE) * FACE; }
  function frame(ts) {
    var dt = Math.min(0.033, (ts - lt) / 1000 || 0.016); lt = ts;
    var n = Math.ceil(dt / 0.008), h = dt / n;
    for (var i = 0; i < n; i++) {
      /* pegas hampir kritis: cepat tiba tanpa memantul berlebihan */
      om += ((tg - th) * 70 - om * 15.5) * h; th += om * h;
      hv += ((0 - hop) * 160 - hv * 13) * h; hop += hv * h;
      rx += (trx - rx) * Math.min(1, h * 9); ry += (try_ - ry) * Math.min(1, h * 9);
    }
    paint(th);
    host.style.transform = "translate3d(0," + hop.toFixed(2) + "px,0) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
    var rest = Math.abs(tg - th) < 0.0008 && Math.abs(om) < 0.004 && Math.abs(hop) < 0.02 && Math.abs(hv) < 0.05 && Math.abs(trx - rx) < 0.01 && Math.abs(try_ - ry) < 0.01;
    if (rest) { th = tg; paint(th); host.style.transform = "translate3d(0,0,0) rotateX(" + trx + "deg) rotateY(" + try_ + "deg)"; raf = 0; return; }
    raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf) { lt = performance.now(); raf = requestAnimationFrame(frame); } }
  paint(0);

  btn.addEventListener("click", function () {
    if (reduce) { tg += FACE; th = tg; paint(th); return; }
    tg = snapTarget() + FACE; hv = -150; wake();
    stage.classList.remove("cn-pulse"); void stage.offsetWidth; stage.classList.add("cn-pulse");
  });
  btn.addEventListener("keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { tg = snapTarget() + (e.key === "ArrowRight" ? FACE : -FACE); wake(); e.preventDefault(); } });

  if (!reduce && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var was = inView; inView = e.isIntersecting;
        if (inView && !was && e.intersectionRatio > 0.3 && performance.now() - lastAuto > 7000) {
          lastAuto = performance.now(); setTimeout(function () { if (inView) { tg = snapTarget() + FACE; wake(); } }, 320);
        }
      });
    }, { threshold: [0, 0.3, 0.6] }).observe(btn);
    var busy = false;
    window.addEventListener("scroll", function () {
      if (busy || !inView) return; busy = true;
      requestAnimationFrame(function () {
        busy = false;
        var y = window.pageYOffset, dy = y - lastY; lastY = y;
        if (Math.abs(dy) < 1) return;
        tg += Math.max(-0.5, Math.min(0.5, dy * 0.0042)); wake();     /* putaran mengikuti gulir, lalu mengendap ke sisi terdekat */
        clearTimeout(snapT); snapT = setTimeout(function () { tg = snapTarget(); wake(); }, 170);
      });
    }, { passive: true });
  }

  if (!reduce) {
    stage.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = btn.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / (r.width * 1.6), dy = (e.clientY - (r.top + r.height / 2)) / (r.height * 1.6);
      dx = Math.max(-1, Math.min(1, dx)); dy = Math.max(-1, Math.min(1, dy));
      trx = -dy * 9; try_ = dx * 13; wake();
    });
    stage.addEventListener("pointerleave", function () { trx = 0; try_ = 0; wake(); });
  }
})();
