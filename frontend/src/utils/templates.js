export const SRS_TEMPLATES = {
  IEEE_830: {
    title: "IEEE 830 (Classic)",
    description: "Yazılım gereksinimleri için geleneksel ve en yaygın kullanılan standart.",
    sections: [
      { id: "1_intro", title: "1. Introduction", required: true, hint: "Purpose, scope and definitions." },
      { id: "2_overall", title: "2. Overall Description", required: true, hint: "Product perspective and functions." },
      { id: "3_specific", title: "3. Specific Requirements", required: true, hint: "Functional, non-functional and interface requirements." },
      { id: "4_appendix", title: "4. Appendices", required: false, hint: "Supporting information." }
    ]
  },
  IEEE_29148: {
    title: "ISO/IEC/IEEE 29148 (Modern)",
    description: "Sistem ve yazılım mühendisliği için güncel, kapsamlı endüstri standardı.",
    sections: [
      { id: "1_intro", title: "1. Introduction", required: true, hint: "System purpose and overview." },
      { id: "2_references", title: "2. Normative References", required: false, hint: "Referenced standards or documents." },
      { id: "3_terms", title: "3. Terms and Definitions", required: true, hint: "Project specific terminology." },
      { id: "4_system_req", title: "4. System Requirements", required: true, hint: "Capabilities, functions and constraints." },
      { id: "5_verification", title: "5. Verification & Validation", required: true, hint: "Testing and acceptance criteria." }
    ]
  },
  IEEE_AGILE: {
    title: "Agile-Focused IEEE",
    description: "IEEE standartlarını çevik (Agile) süreçlere uyarlayan, kullanıcı odaklı yapı.",
    sections: [
      { id: "1_vision", title: "1. Product Vision", required: true, hint: "The 'Why' behind the project." },
      { id: "2_user_stories", title: "2. User Stories", required: true, hint: "As a [role], I want [feature] so that [benefit]." },
      { id: "3_backlog", title: "3. Functional Backlog", required: true, hint: "Prioritized feature list." },
      { id: "4_nonfunc_backlog", title: "4. Quality Attributes", required: true, hint: "NFRs in agile context (Definition of Done)." }
    ]
  },
  HAVELSAN: {
    title: "HAVELSAN Standart SRS",
    description: "Kurumsal projeler için özelleştirilmiş döküman yapısı.",
    sections: [
      { id: "1_giris", title: "1. Giriş", required: true, hint: "Proje özeti ve amacı." },
      { id: "2_genel_tanim", title: "2. Genel Tanımlama", required: true },
      { id: "3_fonksiyonel", title: "3. Fonksiyonel Gereksinimler", required: true },
      { id: "4_fonksiyonel_olmayan", title: "4. Fonksiyonel Olmayan Gereksinimler", required: true },
      { id: "5_sozluk", title: "5. Sözlük", required: false }
    ]
  }
};