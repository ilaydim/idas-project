export const SRS_TEMPLATES = {
  HAVELSAN: {
    // HAVELSAN standartlarına uygun şablon yapısı [cite: 38, 307, 362]
    name: "HAVELSAN Standart SRS", 
    sections: [
      { id: "intro", title: "1. Giriş", required: true }, // [cite: 458]
      { id: "general", title: "2. Genel Tanımlama", required: true }, // [cite: 336]
      { id: "fr", title: "3. Fonksiyonel Gereksinimler", required: true }, // [cite: 312, 470]
      { id: "nfr", title: "4. Fonksiyonel Olmayan Gereksinimler", required: true }, // [cite: 312, 470]
      { id: "glossary", title: "5. Sözlük", required: false } // [cite: 212, 596]
    ]
  },
  IEEE: {
    // IEEE 830 standardı için alternatif şablon desteği
    name: "IEEE 830 Standart SRS",
    sections: [
      { id: "purpose", title: "1. Purpose", required: true },
      { id: "scope", title: "2. Scope", required: true },
      { id: "specific", title: "3. Specific Requirements", required: true }
    ]
  }
};