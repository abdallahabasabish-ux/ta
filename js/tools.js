/* ============================================================
   Tools implementations — كل أداة: mount(box) + content {ar,en}
   Shared helpers عبر window.TK. لا eval — لا إرسال خارجي.
   ============================================================ */
"use strict";
window.TK = (() => {
  const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const copyText = txt => {
    if(!txt){ TP.toast(TP.T("tool.nothing")); return; }
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
      .then(()=>TP.toast(TP.T("tool.copiedTxt")), ()=>TP.toast(TP.T("tool.copyErr")));
  };
  const download = (name, text, type="text/plain;charset=utf-8") => {
    const b=new Blob([text],{type}); const a=document.createElement("a");
    a.href=URL.createObjectURL(b); a.download=name; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1500);
  };
  const bytes = n => n<1024? n+" B" : n<1048576? (n/1024).toFixed(1)+" KB" : (n/1048576).toFixed(2)+" MB";
  const num = n => new Intl.NumberFormat(TP.lang==="ar"?"ar":"en").format(n);
  const bar = p => `<div class="tool-actions">
    <button type="button" class="btn btn-solid" id="${p}-run">${TP.T("tool.run")}</button>
    <button type="button" class="btn btn-ghost" id="${p}-copy">${TP.T("tool.copy")}</button>
    <button type="button" class="btn btn-ghost" id="${p}-reset">${TP.T("tool.reset")}</button></div>`;
  const inp = (id,label,ph="",type="text") => `<div class="field"><label for="${id}">${esc(label)}</label>
    <input id="${id}" type="${type}" placeholder="${esc(ph)}"></div>`;
  const area = (id,label,ph="",rows=7) => `<div class="field"><label for="${id}">${esc(label)}</label>
    <textarea id="${id}" rows="${rows}" placeholder="${esc(ph)}"></textarea></div>`;
  const outA = (id,label,rows=6) => `<div class="field"><label for="${id}">${esc(label)}</label>
    <textarea id="${id}" rows="${rows}" readonly></textarea></div>`;
  const STAT = (label,val) => `<div class="stat-cell"><strong class="num">${val}</strong><span>${esc(label)}</span></div>`;
  const errBox = id => `<p class="tool-err" id="${id}" hidden></p>`;
  const showErr = (box,id,msg)=>{ const el=box.querySelector("#"+id); el.textContent=msg; el.hidden=!msg; };
  const localNote = ()=>`<p class="mini-note">${TP.T("tool.local")}</p>`;
  return { esc, copyText, download, bytes, num, bar, inp, area, outA, STAT, errBox, showErr, localNote };
})();

window.TOOL_IMPL = {

/* ---------- 1) word-counter ---------- */
"word-counter": {
  mount(box){
    const {STAT,esc}=TK;
    box.innerHTML = `
      ${TK.area("wc-in", TP.L({ar:"النص",en:"Your text"}), TP.L({ar:"الصق أو اكتب نصك هنا…",en:"Paste or type your text…"}), 9)}
      <div class="stat-grid" id="wc-grid" hidden></div>
      <div class="tool-actions">
        <button type="button" class="btn btn-ghost" id="wc-copy">${TP.T("tool.copy")}</button>
        <button type="button" class="btn btn-ghost" id="wc-reset">${TP.T("tool.reset")}</button></div>
      ${TK.localNote()}`;
    const ta=box.querySelector("#wc-in"), grid=box.querySelector("#wc-grid");
    const calc=()=>{
      const t=ta.value;
      if(!t.trim()){ grid.hidden=true; return; }
      const words=t.trim().split(/\s+/).length;
      const chars=[...t].length;
      const noSpace=[...t.replace(/\s/g,"")].length;
      const sentences=t.split(/[.!؟?\n]+/).map(s=>s.trim()).filter(Boolean).length;
      const paras=t.split(/\n\s*\n+/).map(s=>s.trim()).filter(Boolean).length;
      const mins=Math.max(1,Math.round(words/200));
      grid.hidden=false;
      grid.innerHTML =
        TK.STAT(TP.L({ar:"كلمة",en:"Words"}),TK.num(words))+
        TK.STAT(TP.L({ar:"حرف",en:"Characters"}),TK.num(chars))+
        TK.STAT(TP.L({ar:"حرف بلا مسافات",en:"No spaces"}),TK.num(noSpace))+
        TK.STAT(TP.L({ar:"جملة",en:"Sentences"}),TK.num(sentences))+
        TK.STAT(TP.L({ar:"فقرة",en:"Paragraphs"}),TK.num(paras))+
        TK.STAT(TP.L({ar:"دقيقة قراءة ≈",en:"Min read ≈"}),TK.num(mins));
    };
    ta.addEventListener("input",calc);
    box.querySelector("#wc-copy").onclick=()=>{ const g=grid; if(g.hidden){TK.copyText("");return;}
      TK.copyText([...g.querySelectorAll(".stat-cell")].map(c=>c.querySelector("span").textContent+": "+c.querySelector("strong").textContent).join(" · ")); };
    box.querySelector("#wc-reset").onclick=()=>{ ta.value=""; grid.hidden=true; ta.focus(); };
  },
  content:{ ar:{ intro:"أداة إحصاء فوري لأي نص: عدّاد كلمات وحروف وجمل وفقرات مع تقدير وقت القراءة — كل حرف يُحسب لحظة كتابته دون أي زر.",
    steps:["الصق أو اكتب نصك في الحقل.","تظهر الإحصائيات الست مباشرة أسفله أثناء الكتابة.","استخدم زر النسخ لنسخ ملخص الأرقام."],
    tips:["وقت القراءة تقدير تقريبي بمتوسط 200 كلمة/دقيقة.","الحروف تُحسب بدقة للعربية بما فيها التشكيل والمسافات."],
    faq:[{q:{ar:"هل يُرسل نصي لأي مكان؟",en:"Is my text sent anywhere?"},a:{ar:"لا — الحساب يتم داخل متصفحك لحظيًا، ولا يُحفظ النص بعد إغلاق الصفحة.",en:"No — counting happens instantly in your browser; the text isn't stored after closing the page."}},
         {q:{ar:"هل يدعم النصوص الطويلة؟",en:"Does it handle long texts?"},a:{ar:"نعم، آلاف الكلمات دون مشاكل — الحساب محلي وخفيف.",en:"Yes — thousands of words work fine; counting is local and light."}}] },
    en:{ intro:"Instant stats for any text: words, characters, sentences, paragraphs and estimated reading time — counted live as you type, no button needed.",
    steps:["Paste or type your text into the field.","All six stats appear below it, updating live.","Use Copy to grab a summary of the numbers."],
    tips:["Reading time is an estimate at ~200 words/minute.","Characters are counted precisely for Arabic, including diacritics and spaces."],
    faq:[{q:{ar:"هل يُرسل نصي لأي مكان؟",en:"Is my text sent anywhere?"},a:{ar:"لا — الحساب يتم داخل متصفحك لحظيًا، ولا يُحفظ النص بعد إغلاق الصفحة.",en:"No — counting happens instantly in your browser; the text isn't stored after closing the page."}},
         {q:{ar:"هل يدعم النصوص الطويلة؟",en:"Does it handle long texts?"},a:{ar:"نعم، آلاف الكلمات دون مشاكل — الحساب محلي وخفيف.",en:"Yes — thousands of words work fine; counting is local and light."}}] } }
},

/* ---------- 2) text-cleaner ---------- */
"text-cleaner": {
  mount(box){
    const L=TP.L;
    box.innerHTML = `
      ${TK.area("tc-in",L({ar:"النص الأصلي",en:"Original text"}),L({ar:"الصق نصك…",en:"Paste your text…"}),8)}
      <div class="opt-grid">
        ${["sp","empty","trim","dup","tash"].map(k=>`<label class="opt"><input type="checkbox" id="tc-${k}" ${k==="sp"||k==="trim"?"checked":""}>
          <span>${L({sp:"طي المسافات الزائدة",empty:"إزالة الأسطر الفارغة",trim:"قص المسافات الطرفية",dup:"إزالة الأسطر المكررة",tash:"إزالة التشكيل والتطويل"}[k])}</span></label>`).join("")}
      </div>
      ${TK.bar("tc")}
      ${TK.outA("tc-out",L({ar:"النص المنظف",en:"Cleaned text"}),8)}
      <p class="mini-note" id="tc-note"></p>${TK.localNote()}`;
    const $=id=>box.querySelector("#"+id);
    const run=()=>{
      let t=$("tc-in").value;
      const before=[...t].length;
      if($("tc-tash").checked) t=t.replace(/[\u064B-\u0652\u0670\u0640]/g,"");
      if($("tc-sp").checked) t=t.replace(/[ \t]+/g," ");
      let lines=t.split(/\r?\n/);
      if($("tc-trim").checked) lines=lines.map(l=>l.trim());
      if($("tc-empty").checked) lines=lines.filter(l=>l.trim()!=="");
      if($("tc-dup").checked){ const seen=new Set(); lines=lines.filter(l=>{ const k=l.trim(); if(seen.has(k))return false; seen.add(k); return true; }); }
      t=lines.join("\n").replace(/^\n+|\n+$/g,"");
      $("tc-out").value=t;
      const removed=before-[...t].length;
      $("tc-note").textContent = t? L({ar:`تم تنظيف النص — الفرق: ${removed} حرفًا.`,en:`Cleaned — difference: ${removed} characters.`}) : "";
    };
    $("tc-run").onclick=run;
    $("tc-copy").onclick=()=>TK.copyText($("tc-out").value);
    $("tc-reset").onclick=()=>{ $("tc-in").value=""; $("tc-out").value=""; $("tc-note").textContent=""; };
  },
  content:{ ar:{ intro:"ينظّف نصوصك من الفوضى الشائعة: مسافات مزدوجة، أسطر فارغة متتالية، تكرار أسطر، وتشكيل يفسد البحث والنسخ — بخيارات منفصلة تتحكم بها.",
    steps:["الصق النص.","فعّل ما تريد واترك ما لا تريد.","اضغط تنفيذ ثم انسخ أو عدّل الناتج."],
    tips:["«إزالة التشكيل» مفيدة قبل البحث أو الفهرسة.","الخيارات محفوظة ضمن جلستك فقط — لا شيء يُرسل."],
    faq:[{q:{ar:"هل يعمل على نص عربي طويل؟",en:"Arabic long text?"},a:{ar:"نعم — including التشكيل والتطويل بجميع أشكالهما.",en:"Yes — diacritics and tatweel fully handled."}}] },
    en:{ intro:"Cleans common text mess: double spaces, stacked empty lines, duplicate lines, and diacritics that break search and copy — with separate options you control.",
    steps:["Paste your text.","Toggle what you want cleaned.","Hit Run, then copy the result."],
    tips:["Diacritic removal is great before search or indexing.","Options live in your session only — nothing is sent."],
    faq:[{q:{ar:"هل يعمل على نص عربي طويل؟",en:"Arabic long text?"},a:{ar:"نعم — including التشكيل والتطويل بجميع أشكالهما.",en:"Yes — diacritics and tatweel fully handled."}}] } }
},

/* ---------- 3) slug-generator ---------- */
"slug-generator": {
  mount(box){
    const L=TP.L;
    box.innerHTML = `
      ${TK.inp("sg-in",L({ar:"العنوان",en:"Title"}),L({ar:"مثال: دليل SEO للمدونات العربية",en:"e.g. SEO Guide for Arabic Blogs"}))}
      <label class="opt"><input type="checkbox" id="sg-latin"> <span>${L({ar:"أحرف لاتينية فقط (إزالة العربية)",en:"Latin only (strip Arabic)"})}</span></label>
      ${TK.outA("sg-out",L({ar:"الـ Slug",en:"Slug"}),2)}
      ${TK.localNote()}`;
    const $=id=>box.querySelector("#"+id);
    const calc=()=>{
      let s=$("sg-in").value.normalize("NFKC");
      s=s.replace(/[\u064B-\u0652\u0670\u0640]/g,"");
      if($("sg-latin").checked) s=s.replace(/[^A-Za-z0-9\s-]/g," ");
      s=s.toLowerCase().trim().replace(/[^\w\u0600-\u06FF]+/g,"-").replace(/^-+|-+$/g,"").replace(/-{2,}/g,"-");
      $("sg-out").value=s;
    };
    $("sg-in").addEventListener("input",calc);
    $("sg-latin").addEventListener("change",calc);
    $("sg-out").addEventListener("click",()=>TK.copyText($("sg-out").value));
  },
  content:{ ar:{ intro:"يحوّل أي عنوان إلى رابط نظيف صديق للسيو: أحرف صغيرة، فواصل شرطات، بلا تشكيل ولا تطويل ولا رموز — مع خيار لاتيني صارم لمن يفضل روابط إنجليزية كاملة.",
    steps:["اكتب عنوان المقال كما هو.","انسخ الـ Slug الناتج بالنقر عليه.","ألصقه في رابط المدونة أو إعدادات الرابط الدائم."],
    tips:["الروابط القصيرة الواضحة أفضل — احذف كلمات الوصل إن أمكن.","حافظ على الكلمة المفتاحية في الـ slug."],
    faq:[{q:{ar:"هل الروابط العربية آمنة؟",en:"Are Arabic slugs safe?"},a:{ar:"نعم تقنيًا وتُفهرس، لكنها تظهر مشفّرة في بعض الأماكن — إن أزعجك ذلك فعّل خيار «لاتيني فقط».",en:"Yes, they're indexable, but appear percent-encoded in places — if that bothers you, enable Latin-only."}}] },
    en:{ intro:"Turns any title into a clean SEO-friendly slug: lowercase, hyphenated, no diacritics or tatweel or symbols — with a strict Latin-only option if you prefer fully English URLs.",
    steps:["Type your article title as-is.","Click the resulting slug to copy it.","Paste it into your blog's permalink settings."],
    tips:["Short clear slugs win — drop filler words when you can.","Keep the focus keyword in the slug."],
    faq:[{q:{ar:"هل الروابط العربية آمنة؟",en:"Are Arabic slugs safe?"},a:{ar:"نعم تقنيًا وتُفهرس، لكنها تظهر مشفّرة في بعض الأماكن — إن أزعجك ذلك فعّل خيار «لاتيني فقط».",en:"Yes, they're indexable, but appear percent-encoded in places — if that bothers you, enable Latin-only."}}] } }
},

/* ---------- 4) meta-tags-generator ---------- */
"meta-tags-generator": {
  mount(box){
    const L=TP.L;
    box.innerHTML = `
      <div class="form-grid">
        ${TK.inp("mt-title",L({ar:"عنوان الصفحة",en:"Page title"}),"")}
        ${TK.inp("mt-desc",L({ar:"الوصف",en:"Description"}),"")}
        ${TK.inp("mt-url",L({ar:"رابط الصفحة (Canonical)",en:"Canonical URL"}),"https://…","url")}
        ${TK.inp("mt-img",L({ar:"صورة المشاركة",en:"Share image"}),"https://…/og.png","url")}
        ${TK.inp("mt-site",L({ar:"اسم الموقع",en:"Site name"}),"")}
      </div>
      <p class="meter mono"><span id="mt-tm"></span> · <span id="mt-dm"></span></p>
      ${TK.outA("mt-out","HTML",10)}
      <div class="tool-actions">
        <button type="button" class="btn btn-ghost" id="mt-copy">${TP.T("tool.copy")}</button>
        <button type="button" class="btn btn-ghost" id="mt-reset">${TP.T("tool.reset")}</button></div>
      <p class="mini-note">${esc(L({ar:"مؤشرات الطول إرشادية (عنوان ≈ 60، وصف ≈ 155 حرفًا) — لا تمثل فحصًا لدى Google.",en:"Length meters are guidance (title ≈ 60, description ≈ 155 chars) — not a Google check."}))}</p>${TK.localNote()}`;
    const $=id=>box.querySelector("#"+id);
    const build=()=>{
      const t=$("mt-title").value.trim(), d=$("mt-desc").value.trim(),
            u=$("mt-url").value.trim(), img=$("mt-img").value.trim(), site=$("mt-site").value.trim();
      const tm=$("mt-tm"), dm=$("mt-dm");
      tm.textContent=`${L({ar:"العنوان",en:"Title"})}: ${[...t].length}`;
      tm.style.color=[...t].length>65?"var(--danger)":[...t].length>=45?"var(--accent)":"";
      dm.textContent=`${L({ar:"الوصف",en:"Desc"})}: ${[...d].length}`;
      dm.style.color=[...d].length>165?"var(--danger)":[...d].length>=130?"var(--accent)":"";
      if(!t&&!d){ $("mt-out").value=""; return; }
      const a=v=>TK.esc(v);
      $("mt-out").value =
`<title>${a(t)}</title>
<meta name="description" content="${a(d)}">
 ${u?`<link rel="canonical" href="${a(u)}">`:""}
<meta property="og:type" content="website">
<meta property="og:title" content="${a(t)}">
<meta property="og:description" content="${a(d)}">
 ${u?`<meta property="og:url" content="${a(u)}">`:""}
 ${img?`<meta property="og:image" content="${a(img)}">`:""}
 ${site?`<meta property="og:site_name" content="${a(site)}">`:""}
<meta name="twitter:card" content="summary_large_image">`;
    };
    ["mt-title","mt-desc","mt-url","mt-img","mt-site"].forEach(id=>$(id).addEventListener("input",build));
    $("mt-copy").onclick=()=>TK.copyText($("mt-out").value);
    $("mt-reset").onclick=()=>{["mt-title","mt-desc","mt-url","mt-img","mt-site","mt-out"].forEach(id=>$(id).value="");build();};
  },
  content:{ ar:{ intro:"يولّد مجموعة وسوم كاملة جاهزة للصق: العنوان والوصف وCanonical وOpen Graph وTwitter Card — مع عدّاد طول حي ينبّهك قبل أن يقطع Google نصك في النتائج.",
    steps:["املأ الحقول الخمسة.","راقب عدّادَي الطول (برتقالي = المدى الجيد).","انسخ الكتلة والصقها داخل <head> بقالبك."],
    tips:["اجعل العنوان فريدًا لكل صفحة.","صورة المشاركة المثالية 1200×630."],
    faq:[{q:{ar:"هل يفحص موقعي لدى Google؟",en:"Does it check my site with Google?"},a:{ar:"لا — الأداة تبني الوسوم من مدخلاتك محليًا فقط، ولا تتصل بأي خدمة.",en:"No — the tool builds tags from your input locally and connects to nothing."}}] },
    en:{ intro:"Generates a complete paste-ready tag set: title, description, canonical, Open Graph and Twitter Card — with live length meters that warn you before Google truncates your text.",
    steps:["Fill in the five fields.","Watch the length meters (orange = good range).","Copy the block into your template's <head>."],
    tips:["Keep the title unique per page.","The ideal share image is 1200×630."],
    faq:[{q:{ar:"هل يفحص موقعي لدى Google؟",en:"Does it check my site with Google?"},a:{ar:"لا — الأداة تبني الوسوم من مدخلاتك محليًا فقط، ولا تتصل بأي خدمة.",en:"No — the tool builds tags from your input locally and connects to nothing."}}] } }
},

/* ---------- 5) robots-generator ---------- */
"robots-generator": {
  mount(box){
    const L=TP.L;
    box.innerHTML = `
      ${TK.inp("rg-sitemap",L({ar:"رابط خريطة الموقع (اختياري)",en:"Sitemap URL (optional)"}),"https://…/sitemap.xml","url")}
      ${TK.area("rg-dis",L({ar:"مسارات المنع — مسار لكل سطر",en:"Disallow paths — one per line"}),"/private/\n/tmp/",4)}
      ${TK.outA("rg-out","robots.txt",7)}
      <div class="tool-actions">
        <button type="button" class="btn btn-ghost" id="rg-copy">${TP.T("tool.copy")}</button>
        <button type="button" class="btn btn-ghost" id="rg-dl">${TP.T("tool.download")}</button>
        <button type="button" class="btn btn-ghost" id="rg-reset">${TP.T("tool.reset")}</button></div>
      <p class="mini-note">${esc(L({ar:"المخرجات صيغة قياسية صحيحة — الأداة لا تتحقق من استجابة خادمك؛ راجع Search Console بعد الرفع.",en:"Output is standard, valid syntax — the tool doesn't verify your server's response; check Search Console after upload."}))}</p>${TK.localNote()}`;
    const $=id=>box.querySelector("#"+id);
    const build=()=>{
      const sm=$("rg-sitemap").value.trim();
      const dis=$("rg-dis").value.split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith("#"));
      let out="User-agent: *\nAllow: /\n";
      dis.forEach(p=>{ out+=`Disallow: ${p.startsWith("/")?p:"/"+p}\n`; });
      if(sm) out+=`Sitemap: ${sm}\n`;
      $("rg-out").value=out;
    };
    ["rg-sitemap","rg-dis"].forEach(id=>$(id).addEventListener("input",build));
    $("rg-copy").onclick=()=>TK.copyText($("rg-out").value);
    $("rg-dl").onclick=()=>TK.download("robots.txt",$("rg-out").value);
    $("rg-reset").onclick=()=>{ $("rg-sitemap").value=""; $("rg-dis").value=""; build(); };
    build();
  },
  content:{ ar:{ intro:"يولّد ملف robots.txt بالبنية القياسية: السماح العام، أسطر منع لكل مسار تحدده، وسطر Sitemap — مخرجات نظيفة جاهزة للرفع في جذر موقعك.",
    steps:["أدخل رابط خريطة الموقع إن وجدت.","اكتب المسارات التي تريد منعها، مسارًا لكل سطر.","انسخ الملف أو حمّله وارفعه في جذر النطاق."],
    tips:["Robots.txt عام — لا تخفض به صفحات حساسة؛ استخدم noindex للفهرسة.","أعلِق الأسطر بـ # للتوثيق داخل الملف."],
    faq:[{q:{ar:"هل يمنع ملف robots الفهرسة فعليًا؟",en:"Does robots.txt actually prevent indexing?"},a:{ar:"لا — يمنع الزحف فقط. لمنع الفهرسة استخدم وسم noindex في الصفحة نفسها.",en:"No — it blocks crawling only. To block indexing use a noindex tag on the page itself."}}] },
    en:{ intro:"Generates a standard robots.txt: global allow, one Disallow per path you list, and a Sitemap line — clean output ready to upload to your site root.",
    steps:["Enter your sitemap URL if you have one.","Type paths to disallow, one per line.","Copy or download the file and upload it to your domain root."],
    tips:["robots.txt is public — don't rely on it to hide sensitive pages; use noindex for indexing.","Comment lines with # for in-file documentation."],
    faq:[{q:{ar:"هل يمنع ملف robots الفهرسة فعليًا؟",en:"Does robots.txt actually prevent indexing?"},a:{ar:"لا — يمنع الزحف فقط. لمنع الفهرسة استخدم وسم noindex في الصفحة نفسها.",en:"No — it blocks crawling only. To block indexing use a noindex tag on the page itself."}}] } }
},

/* ---------- 6) json-formatter ---------- */
"json-formatter": {
  mount(box){
    const L=TP.L;
    box.innerHTML = `
      ${TK.area("jf-in",L({ar:"مدخل JSON",en:"JSON input"}),'{"name":"عبدالله","tags":["seo","tools"]}',8)}
      <div class="opt-grid">
        <label class="opt"><input type="radio" name="jf-mode" value="pretty" checked><span>${L({ar:"تنسيق",en:"Pretty"})}</span></label>
        <label class="opt"><input type="radio" name="jf-mode" value="min"><span>${L({ar:"تصغير",en:"Minify"})}</span></label>
        <label class="opt"><input type="radio" name="jf-mode" value="pretty4"><span>4×${L({ar:"مسافات",en:"spaces"})}</span></label>
      </div>
      ${TK.bar("jf")}
      ${TK.outA("jf-out",L({ar:"الناتج",en:"Output"}),8)}
      ${TK.errBox("jf-err")}${TK.localNote()}`;
    const $=id=>box.querySelector("#"+id);
    const run=()=>{
      const src=$("jf-in").value.trim(); showErr(box,"jf-err","");
      if(!src){ $("jf-out").value=""; return; }
      try{
        const obj=JSON.parse(src);
        const mode=box.querySelector('input[name="jf-mode"]:checked').value;
        $("jf-out").value = mode==="min"? JSON.stringify(obj)
          : JSON.stringify(obj,null,mode==="pretty4"?4:2);
      }catch(e){
        $("jf-out").value="";
        let msg=e.message;
        const m=/position (\d+)/.exec(msg);
        if(m){ const p=+m[1]; const upto=src.slice(0,p);
          const line=upto.split("\n").length, col=p-upto.lastIndexOf("\n");
          msg+=` → ${L({ar:"سطر",en:"line"})} ${line}, ${L({ar:"عمود",en:"col"})} ${col}`; }
        showErr(box,"jf-err",`${L({ar:"JSON غير صالح:",en:"Invalid JSON:"})} ${msg}`);
      }
    };
    $("jf-run").onclick=run;
    $("jf-copy").onclick=()=>TK.copyText($("jf-out").value);
    $("jf-reset").onclick=()=>{ $("jf-in").value=""; $("jf-out").value=""; showErr(box,"jf-err",""); };
    box.querySelectorAll('input[name="jf-mode"]').forEach(r=>r.addEventListener("change",run));
  },
  content:{ ar:{ intro:"ينسّق JSON المشوّش ليقرأه الإنسان، أو يصغّره للإنتاج، مع تحقق فوري: إن كان هناك خطأ تُعرَف مكانه سطرًا وعمودًا بدل رسالة غامضة.",
    steps:["الصق JSON.","اختر تنسيقًا أو تصغيرًا.","اضغط تنفيذ — وإن كان غير صالح سيُشار موضع الخطأ."],
    tips:["JSON لا يقبل فواصل زائدة ولا تعليقات — أشهر سبب للرفض.","انسخ الناتج دائمًا لا الأصل بعد التعديل."],
    faq:[{q:{ar:"هل بياناتي تُرفع؟",en:"Are my data uploaded?"},a:{ar:"لا — التحليل عبر JSON.parse داخل متصفحك حصرًا.",en:"No — parsing is JSON.parse in your browser only."}}] },
    en:{ intro:"Formats messy JSON for humans or minifies it for production, with instant validation: errors report the exact line and column instead of a vague message.",
    steps:["Paste your JSON.","Choose pretty or minify.","Run — invalid input points at the error position."],
    tips:["JSON rejects trailing commas and comments — the most common failures.","Always copy the output, not your edited original."],
    faq:[{q:{ar:"هل بياناتي تُرفع؟",en:"Are my data uploaded?"},a:{ar:"لا — التحليل عبر JSON.parse داخل متصفحك حصرًا.",en:"No — parsing is JSON.parse in your browser only."}}] } }
},

/* ---------- 7) base64 ---------- */
"base64": {
  mount(box){
    const L=TP.L;
    box.innerHTML = `
      ${TK.area("b64-in",L({ar:"المدخل",en:"Input"}),L({ar:"نص أو Base64…",en:"Text or Base64…"}),6)}
      <div class="opt-grid">
        <label class="opt"><input type="radio" name="b64-m" value="enc" checked><span>${L({ar:"ترميز",en:"Encode"})}</span></label>
        <label class="opt"><input type="radio" name="b64-m" value="dec"><span>${L({ar:"فك الترميز",en:"Decode"})}</span></label>
      </div>
      ${TK.bar("b64")}
      ${TK.outA("b64-out",L({ar:"الناتج",en:"Output"}),6)}
      ${TK.errBox("b64-err")}${TK.localNote()}`;
    const $=id=>box.querySelector("#"+id);
    const run=()=>{
      showErr(box,"b64-err",""); const src=$("b64-in").value; const dec=box.querySelector('input[name="b64-m"]:checked').value==="dec";
      try{
        $("b64-out").value = dec
          ? new TextDecoder().decode(Uint8Array.from(atob(src.trim()),c=>c.charCodeAt(0)))
          : btoa(Array.from(new TextEncoder().encode(src),b=>String.fromCharCode(b)).join(""));
      }catch(e){ $("b64-out").value="";
        showErr(box,"b64-err", L({ar:"مدخل غير صالح — تأكد أنه Base64 صحيح ومكتمل.",en:"Invalid input — make sure it's complete, valid Base64."})); }
    };
    $("b64-run").onclick=run;
    $("b64-copy").onclick=()=>TK.copyText($("b64-out").value);
    $("b64-reset").onclick=()=>{ $("b64-in").value=""; $("b64-out").value=""; showErr(box,"b64-err",""); };
    box.querySelectorAll('input[name="b64-m"]').forEach(r=>r.addEventListener("change",run));
  },
  content:{ ar:{ intro:"ترميز وفك Base64 بدعم UTF-8 كامل — النصوص العربية تُرمَّز وتُفك دون مشكلة المrabic garbage الشائعة في الأدوات التي تتجاهل الترميز.",
    steps:["الصق النص أو الـ Base64.","اختر الاتجاه.","نفّذ ثم انسخ."],
    tips:["فك Base64 ليس فك تشفيرًا — أي مشفّر يستطيع فكه؛ لا تضع فيه بيانات حساسة أبدًا.","ارتفاع الحجم ≈ 33% طبيعي للترميز."],
    faq:[{q:{ar:"لماذا تظهر رموز غريبة عند الفك؟",en:"Why garbage on decode?"},a:{ar:"غالبًا لأن المدخل ليس Base64 صحيحًا أو ناقص — والأداة تنبّهك بدل إظهار حروف مكسورة.",en:"Usually invalid or truncated input — the tool warns instead of showing broken characters."}}] },
    en:{ intro:"Base64 encode/decode with full UTF-8 — Arabic text round-trips cleanly, avoiding the mojibake that tools ignoring encoding produce.",
    steps:["Paste text or Base64.","Pick the direction.","Run, then copy."],
    tips:["Base64 is not encryption — anyone can decode it; never put sensitive data in it.","~33% size growth is normal."],
    faq:[{q:{ar:"لماذا تظهر رموز غريبة عند الفك؟",en:"Why garbage on decode?"},a:{ar:"غالبًا لأن المدخل ليس Base64 صحيحًا أو ناقص — والأداة تنبّهك بدل إظهار حروف مكسورة.",en:"Usually invalid or truncated input — the tool warns instead of showing broken characters."}}] } }
},

/* ---------- 8) url-encoder ---------- */
"url-encoder": {
  mount(box){
    const L=TP.L;
    box.innerHTML=`
      ${TK.area("ue-in",L({ar:"المدخل",en:"Input"}),"https://example.com/بحث?q=قيمة",5)}
      <div class="opt-grid">
        <label class="opt"><input type="radio" name="ue-m" value="enc" checked><span>${L({ar:"ترميز",en:"Encode"})}</span></label>
        <label class="opt"><input type="radio" name="ue-m" value="dec"><span>${L({ar:"فك",en:"Decode"})}</span></label></div>
      ${TK.bar("ue")}${TK.outA("ue-out",L({ar:"الناتج",en:"Output"}),5)}
      ${TK.errBox("ue-err")}${TK.localNote()}`;
    const $=id=>box.querySelector("#"+id);
    const run=()=>{ showErr(box,"ue-err",""); const v=$("ue-in").value;
      const dec=box.querySelector('input[name="ue-m"]:checked').value==="dec";
      try{ $("ue-out").value = dec? decodeURIComponent(v) : encodeURIComponent(v); }
      catch(e){ $("ue-out").value=""; showErr(box,"ue-err",L({ar:"تسلسل % غير مكتمل — لا يمكن فكّه.",en:"Incomplete % sequence — cannot decode."})); } };
    $("ue-run").onclick=run;
    $("ue-copy").onclick=()=>TK.copyText($("ue-out").value);
    $("ue-reset").onclick=()=>{ $("ue-in").value=""; $("ue-out").value=""; showErr(box,"ue-err",""); };
    box.querySelectorAll('input[name="ue-m"]').forEach(r=>r.addEventListener("change",run));
  },
  content:{ ar:{ intro:"ترميز وفك روابط ونصوص بعلامات خاصة (# ? & عربي…) باستخدام encodeURIComponent — الأسلم لمعاملات الروابط الفردية.",
    steps:["الصق النص أو المعامل.","اختر ترميزًا أو فكًا.","نفّذ وانسخ."],
    tips:["لترميز رابط كامل مع الحفاظ على بنية ? و& استخدم أدوات encodeURI — هذا يرمّز المكونات.","رمز % المفرد غير المكتمل يُرفض بأمانة."],
    faq:[{q:{ar:"ما الفرق عن Base64؟",en:"Difference from Base64?"},a:{ar:"هذا ترميز روابط قياسي (%XX) والآخر ترميز ثنائي — لكلٍّ استخدام مختلف.",en:"This is standard URL percent-encoding (%XX); Base64 is binary encoding — different purposes."}}] },
    en:{ intro:"Encode/decode URLs and special characters (# ? & Arabic…) via encodeURIComponent — the safe choice for individual query parameters.",
    steps:["Paste text or a parameter.","Pick encode or decode.","Run and copy."],
    tips:["To encode a full URL while keeping ? and & structure use encodeURI — this encodes components.","A lone incomplete % is honestly rejected."],
    faq:[{q:{ar:"ما الفرق عن Base64؟",en:"Difference from Base64?"},a:{ar:"هذا ترميز روابط قياسي (%XX) والآخر ترميز ثنائي — لكلٍّ استخدام مختلف.",en:"This is standard URL percent-encoding (%XX); Base64 is binary encoding — different purposes."}}] } }
},

/* ---------- 9) color-converter ---------- */
"color-converter": {
  mount(box){
    const L=TP.L;
    box.innerHTML=`
      <div class="field"><label for="cc-hex">HEX</label>
        <div class="color-row"><input id="cc-hex" type="text" placeholder="#FF6600" value="#FF6600">
        <input id="cc-pick" type="color" value="#ff6600" aria-label="${esc(L({ar:"منتقي الألوان",en:"Color picker"}))}"></div></div>
      <div class="swatch" id="cc-sw" role="img" aria-label="${esc(L({ar:"معاينة اللون",en:"Color preview"}))}"></div>
      <div class="kv" id="cc-out"></div>
      <div class="tool-actions"><button type="button" class="btn btn-ghost" id="cc-reset">${TP.T("tool.reset")}</button></div>
      ${TK.localNote()}`;
    const $=id=>box.querySelector("#"+id);
    const parse=h=>{ h=h.trim().replace(/^#/,"");
      if(/^[0-9a-f]{3}$/i.test(h)) h=[...h].map(c=>c+c).join("");
      if(!/^[0-9a-f]{6}$/i.test(h)) return null;
      return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)); };
    const hsl=(r,g,b)=>{ r/=255;g/=255;b/=255;
      const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,l=(mx+mn)/2;
      let h=0,s=0;
      if(d){ s=d/(1-Math.abs(2*l-1));
        h = mx===r? ((g-b)/d)%6 : mx===g? (b-r)/d+2 : (r-g)/d+4;
        h=Math.round(h*60); if(h<0)h+=360; }
      return [h,Math.round(s*100),Math.round(l*100)]; };
    const run=()=>{
      const rgb=parse($("cc-hex").value);
      const sw=$("#cc-sw");
      if(!rgb){ sw.style.background="transparent"; sw.classList.add("bad");
        $("#cc-out").innerHTML=`<p class="tool-err">${esc(L({ar:"قيمة HEX غير صالحة (#RGB أو #RRGGBB).",en:"Invalid HEX (#RGB or #RRGGBB)."}))}</p>`; return; }
      sw.classList.remove("bad"); sw.style.background=`rgb(${rgb.join(",")})`;
      const [r,g,b]=rgb, [h,s,l]=hsl(r,g,b);
      const row=(k,v)=>`<div class="kv-row"><span>${k}</span>
        <button type="button" class="kv-val mono num" data-copy="${esc(v)}">${esc(v)}</button></div>`;
      $("#cc-out").innerHTML =
        row("RGB",`rgb(${r}, ${g}, ${b})`)+row("HSL",`hsl(${h}, ${s}%, ${l}%)`)+
        row("HEX","#"+rgb.map(x=>x.toString(16).padStart(2,"0")).join(""));
      $$("#cc-out .kv-val").forEach(b=>b.addEventListener("click",()=>TK.copyText(b.dataset.copy)));
    };
    $("cc-hex").addEventListener("input",run);
    $("cc-pick").addEventListener("input",e=>{ $("cc-hex").value=e.target.value; run(); });
    $("cc-reset").onclick=()=>{ $("cc-hex").value="#FF6600"; $("cc-pick").value="#ff6600"; run(); };
    run();
  },
  content:{ ar:{ intro:"يكتب اللون مرة واحدة ويحصل على كل صيغه: RGB وHSL وHEX منسّقًا — مع معاينة حية ومربوطة بمنتقي ألوان النظام لالتقاط أي لون من الشاشة.",
    steps:["اكتب HEX أو اختر من المنتقي.","انقر أي قيمة ناتجة لنسخها.","استخدم القيم مباشرة في CSS."],
    tips:["HSL أسهل لبناء درجات متناسقة من لون واحد.","القيم قابلة للنقر — لا حاجة للتحديد اليدوي."],
    faq:[{q:{ar:"هل يدعم RGBA وشفافية؟",en:"RGBA support?"},a:{ar:"النسخة الحالية للقيم المعتمة؛ الشفافية تُضاف كطبقة CSS منفصلة عند الحاجة.",en:"Current version handles opaque values; add opacity as a separate CSS layer when needed."}}] },
    en:{ intro:"Type a color once and get every form: formatted RGB, HSL and HEX — with a live swatch linked to the system color picker for grabbing any on-screen color.",
    steps:["Type a HEX or use the picker.","Click any output value to copy it.","Use the values directly in CSS."],
    tips:["HSL makes building consistent tints from one color easier.","Outputs are click-to-copy — no manual selection."],
    faq:[{q:{ar:"هل يدعم RGBA وشفافية؟",en:"RGBA support?"},a:{ar:"النسخة الحالية للقيم المعتمة؛ الشفافية تُضاف كطبقة CSS منفصلة عند الحاجة.",en:"Current version handles opaque values; add opacity as a separate CSS layer when needed."}}] } }
},

/* ---------- 10) timestamp-converter ---------- */
"timestamp-converter": {
  mount(box){
    const L=TP.L;
    box.innerHTML=`
      <h3 class="tool-h">${esc(L({ar:"من Timestamp إلى تاريخ",en:"Timestamp → date"}))}</h3>
      ${TK.inp("ts-in","UNIX",L({ar:"مثال: 1750000000 أو بالملي ثانية",en:"e.g. 1750000000 or milliseconds"}),"text")}
      <div class="tool-actions"><button type="button" class="btn btn-solid" id="ts-run">${TP.T("tool.run")}</button>
      <button type="button" class="btn btn-ghost" id="ts-now">${L({ar:"الآن",en:"Now"})}</button></div>
      <div class="kv" id="ts-out"></div>
      <h3 class="tool-h">${esc(L({ar:"من تاريخ إلى Timestamp",en:"Date → timestamp"}))}</h3>
      <div class="field"><label for="ts-date">${esc(L({ar:"التاريخ والوقت",en:"Date & time"}))}</label>
        <input id="ts-date" type="datetime-local"></div>
      <div class="tool-actions"><button type="button" class="btn btn-ghost" id="ts-rev">${TP.T("tool.run")}</button></div>
      <div class="kv" id="ts-out2"></div>
      ${TK.errBox("ts-err")}${TK.localNote()}`;
    const $=id=>box.querySelector("#"+id);
    const row=(k,v)=>`<div class="kv-row"><span>${k}</span><button type="button" class="kv-val mono num" data-copy="${esc(v)}">${esc(v)}</button></div>`;
    const bindCopy=()=>$$(".kv-val",$ ? $("#ts-out").parentElement : document).forEach(b=>b.addEventListener("click",()=>TK.copyText(b.dataset.copy)));
    const conv=()=>{
      showErr(box,"ts-err",""); const v=$("ts-in").value.trim();
      if(!/^\d+$/.test(v)){ showErr(box,"ts-err",L({ar:"أدخل أرقامًا فقط.",en:"Digits only."})); return; }
      let n=+v; if(v.length>11) n=Math.round(n/1000);
      const d=new Date(n*1000);
      if(isNaN(d)){ showErr(box,"ts-err",L({ar:"قيمة خارج النطاق.",en:"Out of range."})); return; }
      const loc=d.toLocaleString(TP.lang==="ar"?"ar":"en",{dateStyle:"long",timeStyle:"medium"});
      $("#ts-out").innerHTML = row(L({ar:"محلي",en:"Local"}),loc)+row("ISO",d.toISOString());
    };
    const rev=()=>{
      showErr(box,"ts-err",""); const v=$("ts-date").value;
      if(!v){ showErr(box,"ts-err",L({ar:"اختر تاريخًا أولًا.",en:"Pick a date first."})); return; }
      const d=new Date(v);
      $("#ts-out2").innerHTML = row(L({ar:"ثوانٍ",en:"Seconds"}),String(Math.floor(d.getTime()/1000)))+
        row(L({ar:"ملي ثانية",en:"Milliseconds"}),String(d.getTime()));
    };
    $("ts-run").onclick=conv;
    $("ts-rev").onclick=rev;
    $("ts-now").onclick=()=>{ $("ts-in").value=String(Math.floor(Date.now()/1000)); conv(); };
    document.addEventListener("click",e=>{ const b=e.target.closest(".kv-val"); if(b) TK.copyText(b.dataset.copy); });
  },
  content:{ ar:{ intro:"يحوّل UNIX Timestamp إلى تاريخ مقروء بالتوقيت المحلي وISO، والعكس — مع كشف تلقائي: القيم الطويلة تُفهم ملي ثانية تلقائيًا.",
    steps:["لصق الرقم أو استخدام زر «الآن».","النتيجة قابلة للنقر للنسخ.","الاتجاه العكسي من منتقي التاريخ."],
    tips:["أنظمة JS/Java تستخدم الملي ثانية — PHP وUNIX الثواني.","القيم محلية لمتصفحك؛ التوقيت العالمي عبر سطر ISO."],
    faq:[{q:{ar:"لماذا يختلف الوقت عن ساعتي؟",en:"Why is the time off?"},a:{ar:"غالبًا لأن الرقم بالملي ثانية وأُدخل كثوانٍ — الأداة تكشفه تلقائيًا بطول الرقم.",en:"Usually milliseconds entered as seconds — the tool auto-detects by digit length."}}] },
    en:{ intro:"Converts UNIX timestamps to readable local and ISO dates, and back — with auto-detection: long values are understood as milliseconds automatically.",
    steps:["Paste a number or hit Now.","Click any result to copy.","Reverse direction from the date picker."],
    tips:["JS/Java use milliseconds; PHP and UNIX use seconds.","Results are browser-local; ISO line is universal."] ,
    faq:[{q:{ar:"لماذا يختلف الوقت عن ساعتي؟",en:"Why is the time off?"},a:{ar:"غالبًا لأن الرقم بالملي ثانية وأُدخل كثوانٍ — الأداة تكشفه تلقائيًا بطول الرقم.",en:"Usually milliseconds entered as seconds — the tool auto-detects by digit length."}}] } }
},

/* ---------- 11) image-dimensions ---------- */
"image-dimensions": {
  mount(box){
    const L=TP.L;
    box.innerHTML=`
      <div class="field"><label for="id-file">${esc(L({ar:"اختر صورة",en:"Choose an image"}))}</label>
        <input id="id-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif"></div>
      ${TK.errBox("id-err")}
      <div class="img-prev" id="id-prev" hidden></div>
      <div class="stat-grid" id="id-grid" hidden></div>
      ${TK.localNote()}`;
    const $=id=>box.querySelector("#"+id);
    $("id-file").addEventListener("change",e=>{
      showErr(box,"id-err",""); $("id-grid").hidden=true; $("id-prev").hidden=true;
      const f=e.target.files[0]; if(!f) return;
      if(!f.type.startsWith("image/")){ showErr(box,"id-err",L({ar:"الملف المختار ليس صورة.",en:"That file is not an image."})); return; }
      if(f.size>30*1048576){ showErr(box,"id-err",L({ar:"الحد 30 ميجابايت.",en:"Limit is 30 MB."})); return; }
      const url=URL.createObjectURL(f); const img=new Image();
      img.onload=()=>{ $("id-prev").hidden=false; $("id-prev").innerHTML=`<img src="${url}" alt="${esc(f.name)}">`;
        const g=$("id-grid"); g.hidden=false;
        g.innerHTML=TK.STAT(L({ar:"العرض",en:"Width"}),TK.num(img.naturalWidth))+
          TK.STAT(L({ar:"الارتفاع",en:"Height"}),TK.num(img.naturalHeight))+
          TK.STAT(L({ar:"النوع",en:"Type"}),esc(f.type||"—"))+
          TK.STAT(L({ar:"الحجم",en:"Size"}),TK.bytes(f.size)); };
      img.onerror=()=>{ showErr(box,"id-err",L({ar:"تعذّر قراءة الصورة — قد تكون تالفة أو نوعًا غير مدعوم في متصفحك.",en:"Could not read the image — it may be corrupt or unsupported in this browser."})); };
      img.src=url;
    });
  },
  content:{ ar:{ intro:"يعرض أبعاد الصورة الحقيقية ونوعها وحجم ملفها فور اختيارها — دون رفع: FileReader وImage داخل متصفحك فقط، والملف يُنسى مغادرةً الصفحة.",
    steps:["اختر الصورة من جهازك.","تظهر المعاينة والأرقام فورًا.","لا شيء يُحفظ — غادر الصفحة وينتهي كل شيء."],
    tips:["استخدمه قبل رفع الصور للتأكد من الأبعاد المطلوبة.","الحجم المفيد معرفته قبل ضغط الصورة."],
    faq:[{q:{ar:"هل تُرفع صورتي؟",en:"Is my image uploaded?"},a:{ar:"أبدًا — القراءة محلية 100% ولا يوجد خادم يستقبلها أصلًا.",en:"Never — reading is 100% local; no server receives it at all."}}] },
    en:{ intro:"Shows an image's true dimensions, type and file size the moment you pick it — no upload: FileReader and Image run in your browser only, and the file is discarded when you leave.",
    steps:["Pick an image from your device.","Preview and numbers appear instantly.","Nothing is stored — leave the page and it's gone."],
    tips:["Use it before uploading to confirm required dimensions.","Knowing size helps before compressing."],
    faq:[{q:{ar:"هل تُرفع صورتي؟",en:"Is my image uploaded?"},a:{ar:"أبدًا — القراءة محلية 100% ولا يوجد خادم يستقبلها أصلًا.",en:"Never — reading is 100% local; no server receives it at all."}}] } }
},

/* ---------- 12) image-converter ---------- */
"image-converter": {
  mount(box){
    const L=TP.L;
    box.innerHTML=`
      <div class="field"><label for="ic-file">${esc(L({ar:"اختر صورة (JPG / PNG / WebP)",en:"Choose an image (JPG / PNG / WebP)"}))}</label>
        <input id="ic-file" type="file" accept="image/jpeg,image/png,image/webp"></div>
      <div class="form-grid">
        <div class="field"><label for="ic-fmt">${esc(L({ar:"الصيغة الناتجة",en:"Output format"}))}</label>
          <select id="ic-fmt"><option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option></select></div>
        <div class="field"><label for="ic-q">${esc(L({ar:"جودة الضغط",en:"Quality"}))}: <span id="ic-qv" class="num">80%</span></label>
          <input id="ic-q" type="range" min="30" max="100" value="80"></div>
        <div class="field"><label for="ic-w">${esc(L({ar:"أقصى عرض (اختياري)",en:"Max width (optional)"}))}</label>
          <input id="ic-w" type="number" min="16" placeholder="1600"></div>
      </div>
      <div class="tool-actions"><button type="button" class="btn btn-solid" id="ic-run">${TP.T("tool.run")}</button>
        <button type="button" class="btn btn-ghost" id="ic-dl" disabled>${TP.T("tool.download")}</button>
        <button type="button" class="btn btn-ghost" id="ic-reset">${TP.T("tool.reset")}</button></div>
      ${TK.errBox("ic-err")}
      <div class="img-prev" id="ic-prev" hidden></div>
      <p class="mini-note" id="ic-note"></p>${TK.localNote()}`;
    const $=id=>box.querySelector("#"+id);
    let src=null, outBlob=null, outName="";
    $("ic-q").addEventListener("input",e=>{ $("ic-qv").textContent=e.target.value+"%"; });
    $("ic-file").addEventListener("change",e=>{
      showErr(box,"ic-err",""); src=null; $("ic-dl").disabled=true; $("ic-prev").hidden=true; $("ic-note").textContent="";
      const f=e.target.files[0]; if(!f) return;
      if(!["image/jpeg","image/png","image/webp"].includes(f.type)){
        showErr(box,"ic-err",L({ar:"النوع غير مدعوم — المدعوم: JPG وPNG وWebP.",en:"Unsupported type — supported: JPG, PNG, WebP."})); return; }
      if(f.size>20*1048576){ showErr(box,"ic-err",L({ar:"الحد 20 ميجابايت.",en:"Limit is 20 MB."})); return; }
      src=f;
    });
    $("ic-run").onclick=()=>{
      showErr(box,"ic-err","");
      if(!src){ showErr(box,"ic-err",L({ar:"اختر صورة أولًا.",en:"Pick an image first."})); return; }
      const fmt=$("ic-fmt").value, q=+$("ic-q").value/100, maxW=+$("ic-w").value||Infinity;
      const img=new Image(); const url=URL.createObjectURL(src);
      img.onload=()=>{
        const w=Math.min(img.naturalWidth,maxW);
        const scale=w/img.naturalWidth;
        const cv=document.createElement("canvas");
        cv.width=Math.round(w); cv.height=Math.round(img.naturalHeight*scale);
        cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
        cv.toBlob(blob=>{
          URL.revokeObjectURL(url);
          if(!blob){ showErr(box,"ic-err",L({ar:"فشل التحويل في هذا المتصفح.",en:"Conversion failed in this browser."})); return; }
          if(fmt==="image/webp"&&blob.type!=="image/webp"){
            showErr(box,"ic-err",L({ar:"متصفحك لا ينتج WebP — غيّر الصيغة إلى JPEG أو PNG.",en:"Your browser can't encode WebP — switch to JPEG or PNG."})); return; }
          outBlob=blob;
          const ext=blob.type.split("/")[1].replace("jpeg","jpg");
          outName=(src.name.replace(/\.[^.]+$/,"")||"image")+"."+ext;
          $("ic-prev").hidden=false;
          $("ic-prev").innerHTML=`<img src="${URL.createObjectURL(blob)}" alt="${esc(outName)}">`;
          const saved=src.size? Math.round((1-blob.size/src.size)*100):0;
          $("ic-note").textContent=L({ar:`الحجم: ${TK.bytes(src.size)} ← ${TK.bytes(blob.size)}${saved>0?` (وفّرت ${saved}٪)`:''} · الأبعاد: ${cv.width}×${cv.height}`,
            en:`Size: ${TK.bytes(src.size)} → ${TK.bytes(blob.size)}${saved>0?` (saved ${saved}%)`:''} · Dimensions: ${cv.width}×${cv.height}`});
          $("ic-dl").disabled=false;
        },fmt,q);
      };
      img.onerror=()=>{ showErr(box,"ic-err",L({ar:"تعذّر فك ترميز الصورة.",en:"Could not decode the image."})); URL.revokeObjectURL(url); };
      img.src=url;
    };
    $("ic-dl").onclick=()=>{ if(!outBlob) return;
      const a=document.createElement("a"); a.href=URL.createObjectURL(outBlob); a.download=outName; a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),2000); };
    $("ic-reset").onclick=()=>{ $("ic-file").value=""; src=null; outBlob=null;
      $("ic-dl").disabled=true; $("ic-prev").hidden=true; $("ic-note").textContent=""; showErr(box,"ic-err",""); };
  },
  content:{ ar:{ intro:"يحوّل صورك بين WebP وJPEG وPNG مع شريط جودة حقيقي وتصغير أبعاد اختياري — الضغط يحدث عبر Canvas داخل متصفحك، وملفك الأصلي لا يغادر جهازك.",
    steps:["اختر الصورة (حتى 20MB).","حدد الصيغة الناتجة والجودة — وعرضًا أقصى إن أردت التصغير.","نفّذ ثم حمّل الناتج، وراقب سطر التوفير."],
    tips:["WebP عند جودة 75–85% يوفّر عادة 30–60% لأحرف الويب — جرّب واقرأ الرقم الفعلي أعلى المعاينة.","JPEG لا يدعم الشفافية؛ للشعارات الشفافة اختر PNG أو WebP."],
    faq:[{q:{ar:"هل تُرفع صورتي لخادم؟",en:"Is my image uploaded to a server?"},a:{ar:"لا — التحويل كله Canvas محلي، ولا يوجد خادم يستقبل الملفات أصلًا.",en:"No — conversion is entirely local Canvas; no server receives files."}},
         {q:{ar:"لماذا فشل WebP عندي؟",en:"Why did WebP fail?"},a:{ar:"متصفحات قديمة (Safari قديم) لا تنتج WebP — الأداة تكشف ذلك وتنبهك بدل أن تسكّت.",en:"Older browsers (old Safari) can't encode WebP — the tool detects and warns instead of failing silently."}}] },
    en:{ intro:"Convert your images between WebP, JPEG and PNG with a real quality slider and optional resizing — compression happens via Canvas in your browser, and the original never leaves your device.",
    steps:["Pick an image (up to 20MB).","Set output format and quality — plus a max width to resize.","Run, download, and watch the savings line."],
    tips:["WebP at 75–85% quality typically saves 30–60% for web use — test and read the actual number above the preview.","JPEG has no transparency; for logos choose PNG or WebP."],
    faq:[{q:{ar:"هل تُرفع صورتي لخادم؟",en:"Is my image uploaded to a server?"},a:{ar:"لا — التحويل كله Canvas محلي، ولا يوجد خادم يستقبل الملفات أصلًا.",en:"No — conversion is entirely local Canvas; no server receives files."}},
         {q:{ar:"لماذا فشل WebP عندي؟",en:"Why did WebP fail?"},a:{ar:"متصفحات قديمة (Safari قديم) لا تنتج WebP — الأداة تكشف ذلك وتنبهك بدل أن تسكّت.",en:"Older browsers (old Safari) can't encode WebP — the tool detects and warns instead of failing silently."}}] } }
},

/* ---------- 13) price-calculator ---------- */
"price-calculator": {
  mount(box){
    const L=TP.L;
    box.innerHTML=`
      <div class="form-grid">
        ${TK.inp("pc-rate",L({ar:"سعر الساعة",en:"Hourly rate"}),"50","number")}
        ${TK.inp("pc-hours",L({ar:"عدد الساعات المتوقعة",en:"Estimated hours"}),"20","number")}
        ${TK.inp("pc-exp",L({ar:"مصاريف مباشرة (اختياري)",en:"Direct expenses (optional)"}),"0","number")}
        ${TK.inp("pc-margin",L({ar:"هامش أمان/ربح ٪",en:"Safety / profit margin %"}),"20","number")}
      </div>
      <div class="kv" id="pc-out"></div>
      ${TK.localNote()}`;
    const $=id=>box.querySelector("#"+id);
    const cur=()=>L({ar:"ريال / دولار / حسب عملتك",en:"your currency"});
    const row=(k,v,big)=>`<div class="kv-row ${big?"big":""}"><span>${esc(k)}</span>
      <strong class="num">${esc(v)}</strong></div>`;
    const calc=()=>{
      const r=+$("pc-rate").value||0, h=+$("pc-hours").value||0,
            e=+$("pc-exp").value||0, m=+$("pc-margin").value||0;
      const base=r*h, withMargin=base*(1+m/100), total=withMargin+e;
      $("#pc-out").innerHTML = (base?
        row(L({ar:"التكلفة الأساسية",en:"Base cost"}),base.toFixed(2))+
        (m?row(L({ar:`+ هامش ${m}٪`,en:`+ ${m}% margin`}),(withMargin-base).toFixed(2)):"")+
        (e?row(L({ar:"+ مصاريف",en:"+ expenses"}),e.toFixed(2)):"")+
        row(L({ar:"السعر المقترح",en:"Suggested price"}),total.toFixed(2)+" — "+cur(),true)
        : `<p class="c-empty">${esc(L({ar:"أدخل سعر الساعة وعدد الساعات.",en:"Enter your rate and hours."}))}</p>`);
    };
    ["pc-rate","pc-hours","pc-exp","pc-margin"].forEach(id=>$(id).addEventListener("input",calc));
    calc();
  },
  content:{ ar:{ intro:"تحسب سعر مشروعك الحر بعقلانية: التكلفة الأساسية من ساعاتك، ثم هامش أمان يغطي التعديلات والمفاجآت، ثم المصاريف المباشرة — بتفصيل يريك من أين جاء الرقم.",
    steps:["أدخل سعر ساعتك وعدد الساعات المتوقعة بصدق.","أضف هامش 15–25٪ للتعديلات غير المتوقعة.","أضف المصاريف المباشرة إن وجدت — وانسخ السعر المقترح."],
    tips:["لا تخصم من ساعتك أبدًا لجذب العميل — خفّض النطاق بدلًا من السعر.","ذاكرتك للتسعير تتحسن كلما وثّقت الساعات الفعلية بعد كل مشروع."],
    faq:[{q:{ar:"هل تحفظ أرقامي؟",en:"Are my numbers stored?"},a:{ar:"لا — الحساب لحظي في الذاكرة ويختوي مغادرة الصفحة.",en:"No — math is in-memory and gone when you leave."}}] },
    en:{ intro:"Prices your freelance project rationally: base cost from your hours, then a safety margin for revisions and surprises, then direct expenses — with a breakdown showing where the number came from.",
    steps:["Enter your hourly rate and honest estimated hours.","Add a 15–25% margin for unexpected revisions.","Add direct expenses if any — and copy the suggested price."],
    tips:["Never discount your rate to win a client — shrink the scope instead of the price.","Your pricing instinct improves as you log actual hours per project."],
    faq:[{q:{ar:"هل تحفظ أرقامي؟",en:"Are my numbers stored?"},a:{ar:"لا — الحساب لحظي في الذاكرة ويختوي مغادرة الصفحة.",en:"No — math is in-memory and gone when you leave."}}] } }
}
};
