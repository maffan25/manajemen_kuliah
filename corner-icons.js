/* corner-icons.js: pustaka ikon bola Samasta Corner (dipakai beranda, halaman corner, dan admin).
   Satu gaya: badan terisi warna bola (currentColor) + aksen emas (var(--ia)). Beberapa ikon bergerak saat bola disorot. */
(function () {
  "use strict";
  var A = 'fill="var(--ia,#f8d24a)"', S = 'fill="none" stroke="var(--ia,#f8d24a)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
  var I = {
    megafon: ["Megafon (pengumuman)",
      '<g class="ci-body"><path d="M9 25h11l26-13c1.6-.8 3.5.4 3.5 2.2v31.6c0 1.8-1.9 3-3.5 2.2L20 35H9a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z" fill="currentColor"/><path d="M21 38l3.6 14.5a2.5 2.5 0 0 0 2.4 1.9h5.2a1.6 1.6 0 0 0 1.6-2L30.5 40z" fill="currentColor"/><ellipse cx="47.5" cy="30" rx="3.2" ry="13.5" ' + A + '/></g>' +
      '<g class="ci-wave" ' + S + '><path d="M55 21c3 5.600 3 11.400 0 18"/><path d="M60 15c5.200 9 5.200 25 0 34" opacity=".7"/></g>'],
    perisai: ["Perisai (pengawasan)",
      '<path d="M32 4.500l22 7.500v16.500c0 15.500-9.500 26-22 31.500C19.500 54.500 10 44 10 28.500V12z" fill="currentColor"/>' +
      '<path d="M32 11.500l15 5.200v11.600c0 10.600-6.300 18.300-15 22.600-8.700-4.300-15-12-15-22.600V16.700z" fill="none" stroke="var(--ia,#f8d24a)" stroke-opacity=".55" stroke-width="2"/>' +
      '<path class="ci-tick" pathLength="1" d="M22.500 31l7.500 7.500L43 24" ' + S.replace('stroke-width="3"', 'stroke-width="4.200"') + '/>'],
    topi: ["Topi wisuda (akademik)",
      '<path d="M32 10L61 24 32 38 3 24z" fill="currentColor"/><path d="M15 33v12c0 4.500 7.600 8 17 8s17-3.500 17-8V33L32 42z" fill="currentColor" opacity=".88"/>' +
      '<g class="ci-tas"><path d="M56 27v16" ' + S + '/><circle cx="56" cy="46" r="3.200" ' + A + '/></g>'],
    tim: ["Tim (SDM)",
      '<circle cx="32" cy="19" r="8.500" fill="currentColor"/><path d="M16 50c0-9.500 7-15 16-15s16 5.500 16 15z" fill="currentColor"/>' +
      '<circle cx="12.500" cy="25" r="6" ' + A + '/><path d="M2 49c0-7.500 5-12 11-12 2 0 3.800.5 5.200 1.400C14 41.400 12 45 12 49z" ' + A + '/>' +
      '<circle cx="51.500" cy="25" r="6" ' + A + '/><path d="M62 49c0-7.500-5-12-11-12-2 0-3.800.5-5.200 1.400C50 41.400 52 45 52 49z" ' + A + '/>'],
    hati: ["Hati (kepedulian)",
      '<path d="M32 55S7 40 7 22.500C7 14.500 13 9 20 9c5 0 9.500 2.800 12 7.200C34.500 11.800 39 9 44 9c7 0 13 5.500 13 13.500C57 40 32 55 32 55z" fill="currentColor"/>' +
      '<path class="ci-pulse" d="M14 30h10l4-8 6 15 4-7h12" ' + S + '/>'],
    piala: ["Piala (olahraga)",
      '<path d="M18 8h28v18c0 8.800-6.300 15-14 15S18 34.800 18 26z" fill="currentColor"/><path d="M18 14H8c0 9 4 15 11 16M46 14h10c0 9-4 15-11 16" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M32 41v8" stroke="currentColor" stroke-width="5"/><path d="M21 56c0-4.500 4-7 11-7s11 2.500 11 7z" fill="currentColor"/><path class="ci-glint" d="M25 15v11" ' + S + '/>'],
    bumi: ["Bumi (hubungan luar)",
      '<circle cx="32" cy="32" r="25" fill="currentColor"/>' +
      '<g class="ci-meri" ' + S.replace('stroke-width="3"', 'stroke-width="2.600"') + '><ellipse cx="32" cy="32" rx="10.500" ry="25"/><path d="M7 32h50M11 20h42M11 44h42"/></g>'],
    bahasa: ["Gelembung bahasa",
      '<path d="M8 10h28a5 5 0 0 1 5 5v15a5 5 0 0 1-5 5H20l-9 8v-8H8a5 5 0 0 1-5-5V15a5 5 0 0 1 5-5z" fill="currentColor"/>' +
      '<path d="M28 27h24a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5h-3v8l-9-8H28a5 5 0 0 1-5-5V32a5 5 0 0 1 5-5z" ' + A + '/>' +
      '<path d="M14 25l5-11 5 11M15.800 21.500h6.400" fill="none" stroke="var(--ia,#f8d24a)" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 43h16M41 39v4M37 43c1 4 4 6 7 7M45 43c-1 4-4 6-8 7" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round"/>'],
    koin: ["Koin (keuangan)",
      '<ellipse cx="32" cy="46" rx="21" ry="9" fill="currentColor"/><path d="M11 36v10c0 5 9.400 9 21 9s21-4 21-9V36z" fill="currentColor" opacity=".85"/>' +
      '<ellipse cx="32" cy="30" rx="21" ry="9" ' + A + '/><path d="M11 22v8c0 5 9.400 9 21 9s21-4 21-9v-8z" ' + A + ' opacity=".8"/><ellipse cx="32" cy="20" rx="21" ry="9" fill="currentColor"/>' +
      '<ellipse cx="32" cy="20" rx="12" ry="4.500" fill="none" stroke="var(--ia,#f8d24a)" stroke-width="2.400"/>'],
    dokumen: ["Dokumen (administrasi)",
      '<path d="M14 6h24l14 14v34a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z" fill="currentColor"/><path d="M38 6v10a4 4 0 0 0 4 4h10z" ' + A + ' opacity=".85"/>' +
      '<path class="ci-lines" d="M19 32h26M19 40h26M19 48h15" ' + S + '/>'],
    palet: ["Palet (desain)",
      '<path d="M32 5C17 5 5 16.500 5 31s11 25 25 25c4 0 5.500-2.500 5.500-5 0-4.500-4-4.500-4-9 0-3.500 3-5.500 7-5.500H51c4.500 0 8-3.500 8-8C59 15 47 5 32 5z" fill="currentColor"/>' +
      '<circle class="ci-d1" cx="18" cy="30" r="4.200" ' + A + '/><circle class="ci-d2" cx="25.500" cy="17.500" r="4.200" fill="#fff"/><circle class="ci-d3" cx="40" cy="15.500" r="4.200" ' + A + ' opacity=".75"/><circle class="ci-d4" cx="49" cy="26" r="4.200" fill="#fff" opacity=".85"/>'],
    bintang: ["Bintang",
      '<path d="M32 4l8.200 17.200 18.800 2.400-13.800 13 3.600 18.600L32 45.800 15.200 55.200l3.600-18.600L5 23.600l18.800-2.400z" fill="currentColor"/><path class="ci-glint" d="M32 16l4 8.500 9.200 1.200" ' + S + '/>'],
    kampus: ["Gedung kampus",
      '<path d="M32 5L5 19v6h54v-6z" fill="currentColor"/><path d="M12 29h8v20h-8zM28 29h8v20h-8zM44 29h8v20h-8z" fill="currentColor" opacity=".88"/><path d="M6 52h52v6H6z" fill="currentColor"/><circle cx="32" cy="16" r="3.600" ' + A + '/>']
  };
  /* Warna bola: o1 sorot, o2 badan, o3 bayangan, ot warna ikon/teks, ia aksen ikon */
  window.CORNER_TONES = {
    zamrud:   { o1: "#43b99a", o2: "#14705a", o3: "#093a2f", ot: "#fbe58a", ia: "#0b4a3b", glow: "67,185,154" },
    emas:     { o1: "#fff0a6", o2: "#f8d24a", o3: "#c4932a", ot: "#0d2a38", ia: "#fff7cf", glow: "248,210,74" },
    samudra:  { o1: "#6cc0de", o2: "#1d6f8f", o3: "#0c3548", ot: "#fff6d6", ia: "#0c3548", glow: "108,192,222" },
    perunggu: { o1: "#e3c785", o2: "#8a6a2f", o3: "#47350f", ot: "#fff6d6", ia: "#47350f", glow: "227,199,133" },
    tinta:    { o1: "#5b8c9f", o2: "#17414d", o3: "#06171f", ot: "#f8d24a", ia: "#fff6d6", glow: "91,140,159" }
  };
  var KEYS = Object.keys(I);
  window.CORNER_ICONS = {
    keys: KEYS,
    label: function (k) { return (I[k] || I.bintang)[0]; },
    list: KEYS.map(function (k) { return [k, I[k][0]]; }),
    svg: function (k, cls) {
      var d = I[k] || I.bintang;
      return '<svg class="ci ci-' + (I[k] ? k : "bintang") + (cls ? " " + cls : "") + '" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' + d[1] + "</svg>";
    }
  };
})();
