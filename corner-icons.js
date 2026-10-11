/* corner-icons.js: pustaka ikon dan warna bola Samasta Corner (dipakai situs dan admin-corner.html).
   Ikon digambar di kotak 48x48, dua nada: garis + isian lembut, dengan aksen emas. */
(function () {
  var I = {
    megafon:  ["Megafon", '<path class="f" d="M9 21a2 2 0 0 1 2-2h7.5L35 10v28l-16.5-9H11a2 2 0 0 1-2-2z"/><path d="M14.500 29l2.600 9.400a1.600 1.600 0 0 0 1.500 1.200h2.600a1.200 1.200 0 0 0 1.200-1.500L20 29.500"/><path class="ac w1" d="M39 19c2.600 3 2.600 7 0 10"/><path class="ac w2" d="M42.500 14.500c5 5.500 5 13.500 0 19"/>'],
    perisai:  ["Perisai", '<path class="f" d="M24 5.500l14 5v11.500c0 9.200-5.800 15.600-14 20-8.200-4.400-14-10.800-14-20V10.500z"/><path d="M24 11l9 3.200V22c0 6-3.600 10.400-9 13.600C18.600 32.400 15 28 15 22v-7.800z" opacity=".45"/><path class="ac" d="M18 23.500l4.200 4.200 8.300-9.200"/>'],
    buku:     ["Buku", '<path class="f" d="M10 9h20a5 5 0 0 1 5 5v26H15a5 5 0 0 1-5-5z"/><path d="M10 35a5 5 0 0 1 5-5h20"/><path class="ac" d="M17 17h12M17 22h8"/>'],
    bintang:  ["Bintang", '<path class="f" d="M24 6l5.300 11.200 12.200 1.600-9 8.400 2.300 12.100L24 33.200 13.200 39.300l2.300-12.100-9-8.400 12.200-1.600z"/>'],
    hati:     ["Hati", '<path class="f" d="M24 40S7 30 7 18.500C7 12.800 11.300 9 16.200 9c3.200 0 6 1.700 7.800 4.600C25.800 10.700 28.600 9 31.800 9 36.700 9 41 12.800 41 18.500 41 30 24 40 24 40z"/>'],
    orang:    ["Orang", '<circle class="f" cx="17" cy="16" r="6"/><circle class="f" cx="33" cy="18" r="5"/><path d="M5 38c.8-7.600 5.600-11.500 12-11.500S28.200 30.400 29 38"/><path class="ac" d="M29.500 27.500c6-.8 11.700 2 13 9.500"/>'],
    piala:    ["Piala", '<path class="f" d="M15 8h18v11a9 9 0 0 1-18 0z"/><path d="M15 12H8v3a7 7 0 0 0 7.500 7M33 12h7v3a7 7 0 0 1-7.500 7"/><path class="ac" d="M24 28v7M19 35h10v6H19zM16 41h16"/>'],
    globe:    ["Globe", '<circle class="f" cx="24" cy="24" r="17"/><path class="ac" d="M7 24h34M24 7c-6 5-8 11-8 17s2 12 8 17c6-5 8-11 8-17s-2-12-8-17z"/>'],
    bahasa:   ["Percakapan", '<path class="f" d="M8 10h22a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H19l-7 6v-6H8a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z"/><path d="M38 20h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3v5l-6-5h-9"/><path class="ac" d="M12 17h14M12 22h9"/>'],
    uang:     ["Koin", '<circle class="f" cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="12" opacity=".45"/><path class="ac" d="M28 18.500c-1-1.500-3-2-4.500-2-2.500 0-4 1.200-4 3 0 4.500 9 2.200 9 7 0 1.800-1.700 3.200-4.500 3.200-2 0-3.800-.8-5-2.200M24 13v3M24 32v3"/>'],
    palet:    ["Palet", '<path class="f" d="M24 7C14 7 6 14.500 6 24s8 17 18 17c2.500 0 3.500-1.500 3.500-3 0-2.500-2-3-2-5.500 0-2 1.700-3.500 4-3.500h5c4.200 0 7.500-3 7.500-7C42 14 34 7 24 7z"/><circle class="dot" cx="15" cy="22" r="2.200"/><circle class="dot" cx="21" cy="14.500" r="2.200"/><circle class="dot" cx="31" cy="14.500" r="2.200"/><circle class="dot" cx="36" cy="22" r="2.200"/>'],
    berkas:   ["Berkas", '<path class="f" d="M12 6h17l9 9v27H12z"/><path class="ac" d="M29 6v9h9M18 24h14M18 30h14M18 36h8"/>'],
    topi:     ["Topi toga", '<path class="f" d="M24 9L3 19l21 10 21-10z"/><path class="ac" d="M11 24v9c0 3 6 6 13 6s13-3 13-6v-9M45 19v12"/>'],
    tunas:    ["Tunas", '<path d="M24 41V22M14 41h20"/><path class="f" d="M24 24c0-8-5-13-14-13 0 8 5 13 14 13z"/><path class="f" d="M24 20c0-6 4-10 13-10 0 7-4 10-13 10z"/>']
  };
  window.CORNER_ICONS = I;
  /* ikon untuk sebuah corner: pilihan admin, atau tebakan dari nama/id */
  window.cornerIconKey = function (c) {
    if (c && c.ikon && I[c.ikon]) return c.ikon;
    var s = ((c && (c.id + " " + c.nama + " " + c.singkat)) || "").toLowerCase();
    if (/irjen|inspektorat/.test(s)) return "perisai";
    if (/kesma|kesejahteraan/.test(s)) return "megafon";
    if (/psdm/.test(s)) return "orang";
    if (/akademik|karier/.test(s)) return "topi";
    if (/harmon/.test(s)) return "tunas";
    if (/pora|olahraga|pemuda/.test(s)) return "piala";
    if (/hubeks|eksternal/.test(s)) return "globe";
    if (/bahasa/.test(s)) return "bahasa";
    if (/keuangan/.test(s)) return "uang";
    if (/dkv/.test(s)) return "palet";
    if (/administrasi/.test(s)) return "berkas";
    return "bintang";
  };
  window.cornerIcon = function (key, cls) {
    var d = I[key] || I.bintang;
    return '<svg class="cn-ico ' + (cls || "") + '" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' + d[1] + "</svg>";
  };
  window.CORNER_TONES = {
    zamrud:   { o1: "#43b99a", o2: "#14705a", o3: "#093a2f", ot: "#fbe58a" },
    emas:     { o1: "#fff0a6", o2: "#f8d24a", o3: "#c4932a", ot: "#0d2a38" },
    samudra:  { o1: "#6cc0de", o2: "#1d6f8f", o3: "#0c3548", ot: "#fff6d6" },
    perunggu: { o1: "#e3c785", o2: "#8a6a2f", o3: "#47350f", ot: "#fff6d6" },
    tinta:    { o1: "#5b8c9f", o2: "#17414d", o3: "#06171f", ot: "#f8d24a" }
  };
})();
