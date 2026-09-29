"use strict";
const TP_CONFIG = {
  brandName: "Abdallah Abas",
  platform: { ar: "أدوات عبدالله عباس", en: "Abdallah Abas Tools" },
  siteUrl: "https://tools.abdallahabas.com",
  mainSiteUrl: "https://abdallahabas.com",
  blogUrl: "https://blog.abdallahabas.com",
  contact: {
    email: "abdallahabasabish@gmail.com",
    whatsapp: "201001378339",
    social: {
      facebook: "https://www.facebook.com/Abdallah.G.designer",
      linkedin: "https://www.linkedin.com/in/abdallah-abas-16601a258",
      telegram: "https://t.me/abdallahabasmo",
      github: "https://github.com/abdallahabasabish-ux", instagram: ""
    }
  },
  /* ⚠ لا IDs وهمية — تُفعَّل عند الحصول عليها فقط */
  adsense:  { enabled: false, client: "", slots: { afterTool: "" } },
  analytics:{ enabled: false, gaId: "" },
  categories: [
    { id:"content",    icon:"type",      ar:"المحتوى والكتابة",    en:"Content & Writing",
      desc:{ ar:"أدوات تعمل على نصوصك مباشرة: عد، تنظيف، تحويل — كل شيء داخل متصفحك.",
             en:"Tools that work directly on your text: count, clean, convert — all inside your browser." } },
    { id:"blogger",    icon:"layout",    ar:"Blogger وWordPress",  en:"Blogger & WordPress",
      desc:{ ar:"مولدات أكواد جاهزة للصق في قوالب ومدوناتك.",
             en:"Ready-to-paste code generators for your blogs and templates." } },
    { id:"seo",        icon:"search",    ar:"SEO",                 en:"SEO",
      desc:{ ar:"أدوات تحضير أساسيات SEO — تحليل محلي صادق، بلا ادعاء فحص Google.",
             en:"SEO fundamentals tools — honest local analysis, no claims of checking Google." } },
    { id:"images",     icon:"image",     ar:"الصور",               en:"Images",
      desc:{ ar:"معالجة صورك محليًا داخل المتصفح — ملفاتك لا تُرفع لأي خادم.",
             en:"Process images locally in your browser — files never leave your device." } },
    { id:"dev",        icon:"code",      ar:"المطورين",            en:"Developer",
      desc:{ ar:"تنسيق وتحويل وفحص — سريعة ودقيقة وتعمل دون اتصال.",
             en:"Format, convert and inspect — fast, precise, works offline." } },
    { id:"freelancer", icon:"briefcase", ar:"الفريلانسر",          en:"Freelancer",
      desc:{ ar:"حاسبات تسعير وأرباح عملية لعملك الحر.",
             en:"Practical pricing and profit calculators for freelance work." } },
    { id:"calc",       icon:"calc",      ar:"حساب وتحويل",         en:"Calculators",
      desc:{ ar:"حاسبات ومحولات يومية مفيدة.", en:"Useful everyday calculators and converters." } }
  ]
};
