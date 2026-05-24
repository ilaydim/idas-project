export const SRS_TEMPLATES = {
  IEEE_830: {
    title: "IEEE 830 (Classic)",
    description: "Geleneksel ve en yaygın kullanılan yazılım gereksinimleri standardı.",
    sections: [
      { id: "1_intro", title: "1. Introduction", required: true },
      { id: "2_perspective", title: "2. Product Perspective & Functions", required: true },
      { id: "3_users", title: "3. User Characteristics", required: true },
      { id: "4_constraints", title: "4. Constraints & Assumptions", required: true },
      { id: "5_functional", title: "5. Functional Requirements", required: true },
      { id: "6_interfaces", title: "6. External Interface Requirements", required: true },
      { id: "7_performance", title: "7. Performance Requirements", required: true },
      { id: "8_quality", title: "8. Quality Attributes", required: true },
      { id: "9_appendix", title: "9. Appendices", required: false },
      { id: "10_index", title: "10. Index", required: false }
    ]
  },
  IEEE_29148: {
    title: "ISO/IEC/IEEE 29148 (Modern)",
    description: "Sistem ve yazılım mühendisliği için güncel, kapsamlı endüstri standardı.",
    sections: [
      { id: "1_scope", title: "1. Scope", required: true },
      { id: "2_references", title: "2. Normative References", required: false },
      { id: "3_terms", title: "3. Terms, Definitions and Abbreviated Terms", required: true },
      { id: "4_concepts", title: "4. Concepts of Requirements Engineering", required: true },
      { id: "5_process", title: "5. Requirements Engineering Process", required: true },
      { id: "6_syrs", title: "6. System Requirements Specification (SyRS)", required: true },
      { id: "7_srs", title: "7. Software Requirements Specification (SRS)", required: true }
    ]
  },
  IEEE_730: {
    title: "IEEE 730 (Software Quality Assurance)",
    description: "Yazılım kalite güvencesi planlaması ve süreç denetimi için IEEE standardı.",
    sections: [
      { id: "1_purpose", title: "1. Purpose", required: true },
      { id: "2_reference", title: "2. Reference Documents", required: true },
      { id: "3_mgmt", title: "3. Software Quality Assurance Management", required: true },
      { id: "4_documentation", title: "4. Documentation", required: true },
      { id: "5_standards", title: "5. Standards, Practices & Conventions", required: true },
      { id: "6_reviews", title: "6. Software Reviews & Audits", required: true },
      { id: "7_testing", title: "7. Testing", required: true },
      { id: "8_problems", title: "8. Problem Reporting & Corrective Action", required: true },
      { id: "9_tools", title: "9. Tools, Techniques & Methodologies", required: false },
      { id: "10_risks", title: "10. Risk Management", required: true }
    ]
  },
  IEEE_12207: {
    title: "IEEE/ISO/IEC 12207",
    description: "Yazılım yaşam döngüsü süreçleri standardı.",
    sections: [
      { id: "1_scope", title: "1. Scope", required: true },
      { id: "2_references", title: "2. Normative References", required: false },
      { id: "3_terms", title: "3. Terms, Definitions and Concepts", required: true },
      { id: "4_org", title: "4. Organization of this Document", required: true },
      { id: "5_agreement", title: "5. Agreement Processes", required: true },
      { id: "6_enabling", title: "6. Organizational Project-Enabling Processes", required: true },
      { id: "7_tech_mgmt", title: "7. Technical Management Processes", required: true },
      { id: "8_tech", title: "8. Technical Processes", required: true },
      { id: "9_software", title: "9. Software-Specific Processes", required: true }
    ]
  }
};