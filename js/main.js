/* ============================================================
   Tools Hub — main.js · chrome + router + tool page renderer
   Pages: home / tools / category / tool / about / services /
   contact / legal / 404. Language from path (/en/ → en).
   ============================================================ */
"use strict";
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = s => String(s ?? "").replace(/[&<>"']/g,
  c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

(() => {
  const isEN = /^\/en(\/|$)/.test(location.pathname);
  window.TP = { lang: isEN ? "en" : "ar" };
  TP.T = k => { const v = k.split(".").reduce((o,x)=>o&&o[x], TP_STR[TP.lang]);
    return typeof v === "string" ? v : k; };
  TP.L = o => !o ? "" : (typeof o === "string" ? o : (o[TP.lang] ?? o.en ?? o.ar ?? ""));
  const T = TP.T, L = TP.L, P = p => (isEN ? "/en" : "") + p;

  document.documentElement.lang = TP.lang;
  document.documentElement.dir  = TP.lang === "ar" ? "rtl" : "ltr";

  /* ---- icon sprite ------------------------------------------- */
  const STROKE = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  const FILL = 'fill="currentColor" stroke="none"';
  const ICONS = {
    search:`<circle cx="11" cy="11" r="6.5" ${STROKE}/><path d="M20.5 20.5l-4.3-4.3" ${STROKE}/>`,
    type:`<path d="M4 6.5V4.5h16v2M12 4.5v15M8.5 19.5h7" ${STROKE}/>`,
    broom:`<path d="M19 4l-7 7M9.5 11.5L4 17c-.8.8-.8 2.2 0 3s2.2.8 3 0l5.5-5.5z" ${STROKE}/>`,
    link:`<path d="M9.5 14.5l5-5M8 12l-2.3 2.3a3.5 3.5 0 105 5L13 17M16 12l2.3-2.3a3.5 3.5 0 10-5-5L11 7" ${STROKE}/>`,
    code:`<path d="M8 7l-5 5 5 5M16 7l5 5-5 5" ${STROKE}/>`,
    image:`<rect x="3" y="4.5" width="18" height="15" rx="2" ${STROKE}/><circle cx="8.5" cy="9.5" r="1.6" ${STROKE}/><path d="M4 17l4.5-4.5 3.5 3.5 3-3L20 17.5" ${STROKE}/>`,
    swap:`<path d="M4 8h13M14 4.5L17.5 8 14 11.5M20 16H7M10 12.5L6.5 16l3.5 3.5" ${STROKE}/>`,
    braces:`<path d="M8.5 4.5C6.5 4.5 6 6 6.5 8c.4 1.6.5 3-1.5 4 2 1 1.9 2.4 1.5 4-.5 2 0 3.5 2 3.5M15.5 4.5c2 0 2.5 1.5 2 3.5-.4 1.6-.5 3 1.5 4-2 1-1.9 2.4-1.5 4 .5 2 0 3.5-2 3.5" ${STROKE}/>`,
    binary:`<path d="M8 4v7M4.5 4h7M4.5 11h7M15 12.5a1.5 1.5 0 013 0v5a1.5 1.5 0 01-3 0zM16.5 4v3.5M14.8 7.5h3.4" ${STROKE}/>`,
    globe:`<circle cx="12" cy="12" r="8.5" ${STROKE}/><path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5S14.5 18.2 12 20.5c-2.5-2.3-3.8-5.2-3.8-8.5S9.5 5.8 12 3.5z" ${STROKE}/>`,
    palette:`<circle cx="12" cy="12" r="8.5" ${STROKE}/><circle cx="8.7" cy="9.5" r="1.2" ${FILL}/><circle cx="12" cy="7.6" r="1.2" ${FILL}/><circle cx="15.3" cy="9.5" r="1.2" ${FILL}/><path d="M12 20.5c-1.6 0-2.5-1-2.5-2.2 0-1.7 1.6-1.9 2.5-3.1.9 1.2 2.5 1.4 2.5 3.1 0 1.2-.9 2.2-2.5 2.2z" ${STROKE}/>`,
    clock:`<circle cx="12" cy="12" r="8.5" ${STROKE}/><path d="M12 7.5V12l3 2" ${STROKE}/>`,
    shield:`<path d="M12 3l7 2.8v5.4c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V5.8z" ${STROKE}/><path d="M9.2 12l2 2 3.8-4" ${STROKE}/>`,
    briefcase:`<rect x="3.5" y="7.5" width="17" height="12.5" rx="2" ${STROKE}/><path d="M9 7.5V5.8A1.8 1.8 0 0110.8 4h2.4A1.8 1.8 0 0115 5.8v1.7M3.5 12.5h17" ${STROKE}/>`,
    calc:`<rect x="5" y="3.5" width="14" height="17" rx="2" ${STROKE}/><path d="M8.5 7.5h7M8.5 12h.1M12 12h.1M15.5 12h.1M8.5 15.5h.1M12 15.5h.1M15.5 15.5h.1M8.5 19h.1M12 19h.1M15.5 19h.1" ${STROKE}/>`,
    heart:`<path ${FILL} d="M12 20.8C7 16.9 3.5 13.6 3.5 9.9 3.5 7.2 5.6 5 8.2 5c1.5 0 3 .8 3.8 2 .8-1.2 2.3-2 3.8-2 2.6 0 4.7 2.2 4.7 4.9 0 3.7-3.5 7-8.5 10.9z"/>`,
    share:`<circle cx="6" cy="12" r="2.3" ${STROKE}/><circle cx="17.5" cy="5.5" r="2.3" ${STROKE}/><circle cx="17.5" cy="18.5" r="2.3" ${STROKE}/><path d="M8.1 10.9l7.3-4.3M8.1 13.1l7.3 4.3" ${STROKE}/>`,
    chevron:`<path d="M6 9.5l6 6 6-6" ${STROKE}/>`,
    arrow:`<path d="M4 12h15M13.5 5.5l6.5 6.5-6.5 6.5" ${STROKE}/>`,
    external:`<path d="M14 4h6v6M20 4L10.5 13.5M18 13.5V20H4.5V6.5H11" ${STROKE}/>`,
    menu:`<path d="M4 7h16M4 12h16M4 17h16" ${STROKE}/>`,
    close:`<path d="M6 6l12 12M18 6L6 18" ${STROKE}/>`,
    mail:`<rect x="3" y="5" width="18" height="14" rx="2" ${STROKE}/><path d="M3.5 7.5l8.5 5.5 8.5-5.5" ${STROKE}/>`,
    whatsapp:`<path ${FILL} d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-3-.2-.3A8.2 8.2 0 1112 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.6.1a6.7 6.7 0 01-2-1.2 7.4 7.4 0 01-1.4-1.7c-.1-.3 0-.4.1-.6l.4-.5c.1-.1.2-.3.2-.4a.4.4 0 000-.3c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 00-.7.3A2.9 2.9 0 006.7 10a5 5 0 001 2.7 11.4 11.4 0 004.4 3.9 5 5 0 003.1.7 2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1-.1-.3-.2-.6-.3z"/>`,
    telegram:`<path ${FILL} d="M21.5 4.2 18.6 19a1 1 0 01-1.6.6l-3.9-2.9-2 1.9a1 1 0 01-1.6-.4l-1.3-4.2-4-1.3a1 1 0 010-1.9L19.9 3a1 1 0 011.6 1.2zM17 7.5l-8 5.4 1 3 .4-2.8z"/>`,
    linkedin:`<rect x="3" y="3" width="18" height="18" rx="2.5" ${STROKE}/><path d="M8 10.5V17M8 7.2v.1M12 17v-3.8a2.2 2.2 0 014.4 0V17" ${STROKE}/>`,
    github:`<path ${FILL} d="M12 .5A11.5 11.5 0 00.5 12a11.5 11.5 0 007.9 10.9c.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7a4.5 4.5 0 011.2-3.1 4.2 4.2 0 01.1-3s1-.3 3.3 1.2a11 11 0 015.8 0c2.3-1.5 3.3-1.2 3.3-1.2a4.2 4.2 0 01.1 3 4.5 4.5 0 011.2 3.1c0 4.5-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5A11.5 11.5 0 0023.5 12 11.5 11.5 0 0012 .5z"/>`,
    sun:`<circle cx="12" cy="12" r="4" ${STROKE}/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5 5l1.6 1.6M17.4 17.4L19 19M19 5l-1.6 1.6M6.6 17.4L5 19" ${STROKE}/>`,
    moon:`<path ${FILL} d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/>`,
    top:`<path d="M12 19V5M6 11l6-6 6 6" ${STROKE}/>`,
    check:`<path d="M4.5 12.5l5 5 10-11" ${STROKE}/>`
  };
  const icon = (n,c="") => `<svg class="icon ${c}" aria-hidden="true" focusable="false"><use href="#i-${n}"></use></svg>`;
  document.body.insertAdjacentHTML("afterbegin",
    `<svg style="display:none" aria-hidden="true">` +
    Object.entries(ICONS).map(([n,b])=>`<symbol id="i-${n}" viewBox="0 0 24 24">${b}</symbol>`).join("") + `</svg>`);
  TP.icon = icon;

  /* ---- shared state ------------------------------------------- */
  const LS = {
    get(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d; }catch(e){ return d; } },
    set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  };
  const REG = () => window.TOOLS_REGISTRY || [];
  const find = slug => REG().find(t => t.slug === slug) || null;
  const cat = id => TP_CONFIG.categories.find(c => c.id === id) || {ar:"—",en:"—",icon:"type"};
  const toolURL = (t,lang=t? t:null) =>
    `${TP_CONFIG.siteUrl}${lang==="en"?"/en":""}/tool/?u=${encodeURIComponent(t.slug)}`;
  const isFav = slug => LS.get("aa_fav",[]).includes(slug);
  const toggleFav = slug => { const f = LS.get("aa_fav",[]);
    const i = f.indexOf(slug); i>=0 ? f.splice(i,1) : f.unshift(slug);
    LS.set("aa_fav", f); return i<0; };
  const pushRecent = slug => { const r = LS.get("aa_recent",[]).filter(s=>s!==slug);
    r.unshift(slug); LS.set("aa_recent", r.slice(0,5)); };
  let toastTimer;
  TP.toast = msg => { const el = $("#toast"); if(!el) return;
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(()=>el.classList.remove("show"),2600); };

  /* ---- chrome --------------------------------------------------- */
  const brand = `<a class="brand" href="${P("/")}">
    <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="6" fill="#FF6600"/>
    <path d="M9.5 23 16 8.5 22.5 23h-3.6L16 16.4 13.1 23z" fill="#0a0a0b"/></svg>
    <span class="brand-word">${esc(L(TP_CONFIG.platform))}</span><span class="brand-dot"></span></a>`;
  const NAV = [["/","nav.home"],["/tools/","nav.tools"],["/tools/","nav.cats","#categories"],
               ["/about/","nav.about"],["/services/","nav.services"],["/contact/","nav.contact"]];

  function chrome(){
    document.body.insertAdjacentHTML("afterbegin", `
    <header class="site-header" id="siteHeader"><div class="container header-in">
      ${brand}
      <nav class="main-nav" aria-label="${T("nav.home")}"><ul class="nav-list">
        ${NAV.map(([h,k,hash])=>`<li><a href="${P(h)}${hash||""}">${T(k)}</a></li>`).join("")}
      </ul></nav>
      <div class="header-actions">
        <button type="button" class="icon-btn" id="searchBtn" aria-label="${T("misc.searchPh")}">${icon("search")}</button>
        <button type="button" class="theme-toggle" id="themeBtn" aria-pressed="false">${icon("sun","i-sun")}${icon("moon","i-moon")}</button>
        <a class="lang-btn" href="${langSwapHref()}" hreflang="${isEN?"ar":"en"}">${isEN?"AR":"EN"}</a>
        <a class="btn btn-solid btn-s header-cta" href="${P("/services/")}">${T("cta.services")}</a>
        <button type="button" class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="mobilePanel">${icon("menu","i-menu")}${icon("close","i-close")}</button>
      </div></div></header>
    <div class="nav-backdrop" id="navBackdrop"></div>
    <nav class="mobile-panel" id="mobilePanel" aria-label="${T("nav.home")}">
      <ul class="mobile-list">${NAV.map(([h,k,hash])=>`<li><a href="${P(h)}${hash||""}">${T(k)}</a></li>`).join("")}</ul>
      <div class="mobile-foot"><a class="btn btn-solid btn-block" href="${P("/services/")}">${T("cta.services")}</a></div>
    </nav>
    <div class="overlay" id="dialogRoot"></div>
    <div class="toast" id="toast" role="status"></div>
    <button type="button" class="to-top" id="toTop" aria-label="${icon("top")?"top":"top"}">${icon("top")}</button>`);
    const panel=$("#mobilePanel"),bd=$("#navBackdrop"),tg=$("#navToggle");
    const setOpen=o=>{ panel.classList.toggle("open",o); bd.classList.toggle("open",o);
      tg.classList.toggle("open",o); tg.setAttribute("aria-expanded",String(o));
      document.body.classList.toggle("no-scroll",o); };
    tg.addEventListener("click",()=>setOpen(!panel.classList.contains("open")));
    bd.addEventListener("click",()=>setOpen(false));
    panel.addEventListener("click",e=>{ if(e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeSearch(); });
    addEventListener("scroll",()=>{ $("#siteHeader").classList.toggle("scrolled",scrollY>8);
      $("#toTop").classList.toggle("show",scrollY>700); },{passive:true});
    $("#toTop").addEventListener("click",()=>scrollTo({top:0,behavior:REDUCED?"auto":"smooth"}));
    $("#searchBtn").addEventListener("click",searchOverlay);
    const tb=$("#themeBtn");
    const themeAria=()=>{ const l=document.documentElement.getAttribute("data-theme")==="light";
      tb.setAttribute("aria-label", l?T("misc.themeDark"):T("misc.themeLight"));
      tb.setAttribute("aria-pressed",String(l)); };
    tb.addEventListener("click",()=>{ const n=document.documentElement.getAttribute("data-theme")==="light"?"dark":"light";
      document.documentElement.setAttribute("data-theme",n);
      try{ localStorage.setItem("aa_theme",n); }catch(e){} themeAria(); });
    themeAria();
  }
  function langSwapHref(){
    if (isEN) return location.pathname.replace(/^\/en/,"") + location.search;
    return "/en" + location.pathname + location.search;
  }
  function footer(){
    const c = TP_CONFIG.contact;
    document.body.insertAdjacentHTML("beforeend", `
    <footer class="site-footer"><div class="container footer-grid">
      <div class="footer-brand">${brand}
        <p>${T("misc.tagline")}</p>
        <div class="social-row">${["facebook","linkedin","telegram","github"].filter(k=>c.social[k])
          .map(k=>`<a class="social-btn" href="${esc(c.social[k])}" target="_blank" rel="noopener noreferrer" aria-label="${k}">${icon(k)}</a>`).join("")}</div></div>
      <nav aria-label="${T("nav.home")}"><h3>${T("nav.home")}</h3>
        <ul class="footer-list">${NAV.map(([h,k])=>`<li><a href="${P(h)}">${T(k)}</a></li>`).join("")}</ul></nav>
      <div><h3>${T("nav.services")}</h3><ul class="footer-list">
        <li><a href="${esc(TP_CONFIG.mainSiteUrl)}/services.html" target="_blank" rel="noopener noreferrer">${T("cta.main")}</a></li>
        <li><a href="${esc(TP_CONFIG.blogUrl)}" target="_blank" rel="noopener noreferrer">${T("cta.blog")}</a></li>
        <li><a href="${P("/services/")}">${T("nav.services")}</a></li></ul></div>
      <div><h3>${T("nav.contact")}</h3><ul class="footer-list">
        <li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
        <li><a href="https://wa.me/${c.whatsapp}" target="_blank" rel="noopener noreferrer">+${c.whatsapp}</a></li></ul></div>
    </div>
    <div class="container footer-bar">
      <p>© <span id="year" class="num"></span> ${esc(TP_CONFIG.brandName)}. ${T("misc.rights")}</p>
      <ul class="footer-legal">${["privacy","terms","disclaimer"].map(k=>
        `<li><a href="${P("/"+k+"/")}">${T("legal."+k)}</a></li>`).join("")}</ul>
    </div></footer>`);
    $("#year").textContent = String(new Date().getFullYear());
  }

  /* ---- search ----------------------------------------------------- */
  function searchOverlay(prefill=""){
    const node=document.createElement("div");
    node.className="dialog dialog-search"; node.setAttribute("role","dialog"); node.setAttribute("aria-modal","true");
    node.innerHTML=`<button type="button" class="dialog-close" data-close aria-label="close">${icon("close")}</button>
      <div class="dialog-body"><input id="sIn" type="search" placeholder="${T("home.ph")}" autocomplete="off" value="${esc(prefill)}">
      <div id="sOut" class="s-results"></div></div>`;
    TP.dialogOpen = node; $("#dialogRoot").innerHTML=""; $("#dialogRoot").appendChild(node);
    $("#dialogRoot").classList.add("open"); document.body.classList.add("no-scroll");
    $("#dialogRoot").onclick = e=>{ if(e.target.id==="dialogRoot"||e.target.closest("[data-close]")) closeSearch(); };
    const inp=$("#sIn",node), out=$("#sOut",node);
    const render=q=>{
      if(!q){ out.innerHTML=""; return; }
      const ql=q.toLowerCase();
      const hits=REG().filter(t=>
        [L(t.name),L(t.desc),(t.kw.ar||[]).join(" "),(t.kw.en||[]).join(" ")]
        .join(" ").toLowerCase().includes(ql))
        .sort((a,b)=>(L(a.name).toLowerCase().startsWith(ql)?-1:0)-(L(b.name).toLowerCase().startsWith(ql)?-1:0));
      out.innerHTML = hits.length ? hits.slice(0,10).map(t=>`
        <a class="s-hit" href="${toolURL(t)}"><strong>${esc(L(t.name))}</strong><span>${esc(L(t.desc))}</span></a>`).join("")
        : `<p class="c-empty">${T("misc.noRes")}</p>`;
    };
    inp.addEventListener("input",()=>render(inp.value.trim()));
    render(inp.value.trim()); inp.focus();
  }
  function closeSearch(){ const r=$("#dialogRoot");
    if(!r||!r.classList.contains("open")) return;
    r.classList.remove("open"); r.innerHTML=""; document.body.classList.remove("no-scroll"); }

  /* ---- shared renderers -------------------------------------------- */
  const toolCard = (t,i=0)=>{
    const f = isFav(t.slug);
    return `<article class="tool-card">
      <button type="button" class="fav-btn ${f?"on":""}" data-fav="${t.slug}" aria-label="${f?T("tools.rmFav"):T("tools.addFav")}" aria-pressed="${f}">${icon("heart")}</button>
      <a class="tool-link" href="${toolURL(t)}">
        <span class="tool-ico">${icon(t.icon)}</span>
        <h3>${esc(L(t.name))}</h3>
        <p>${esc(L(t.desc))}</p>
        <span class="btn-text"><span>${T("cta.open")}</span>${icon("arrow","icon-flip")}</span>
      </a></article>`;
  };
  const grid = list => `<div class="cards-grid cols-3">${list.map(toolCard).join("")}</div>`;
  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-fav]"); if(!b) return;
    const on=toggleFav(b.dataset.fav);
    b.classList.toggle("on",on); b.setAttribute("aria-pressed",String(on));
    TP.toast(on?T("tools.addFav"):T("tools.rmFav"));
    if (location.pathname.startsWith("/tools")||location.pathname==="/tools/")
      $$("#app [data-fav]").forEach(x=>{ if(x.dataset.fav===b.dataset.fav){x.classList.toggle("on",on);x.setAttribute("aria-pressed",String(on));} });
  });

  /* ---- pages -------------------------------------------------------- */
  const sorted = {
    popular: ()=>[...REG()].sort((a,b)=>(b.popular?1:0)-(a.popular?1:0)||L(a.name).localeCompare(L(b.name))),
    newest:  ()=>[...REG()].sort((a,b)=>b.added.localeCompare(a.added)),
    alpha:   ()=>[...REG()].sort((a,b)=>L(a.name).localeCompare(L(b.name),"ar"))
  };
  const catCount = id => REG().filter(t=>t.cat===id).length;

  const R = {
    home(){
      const recent = LS.get("aa_recent",[]).map(find).filter(Boolean);
      $("#app").innerHTML = `
      <section class="hero"><div class="container center narrow">
        <p class="kicker justify-center">${T("home.kicker")}</p>
        <h1>${T("home.h1")}</h1>
        <p class="lead center-txt">${T("home.lead")}</p>
        <div class="big-search">
          ${icon("search","bs-ico")}
          <input id="heroSearch" type="search" placeholder="${T("home.ph")}" autocomplete="off" aria-label="${T("home.ph")}">
        </div>
      </div></section>
      <section class="section flush-top"><div class="container">
        <div class="sec-row"><h2 class="sec-title mb0">${T("home.popular")}</h2></div>
        ${grid(sorted.alpha().filter(t=>t.popular).concat(sorted.alpha().filter(t=>!t.popular)).slice(0,6))}
      </div></section>
      <section class="section alt"><div class="container" id="categories">
        <h2 class="sec-title">${T("home.cats")}</h2>
        <div class="chip-row cat-chips">${TP_CONFIG.categories.map(c=>`
          <a class="chip" href="${P("/category/")}?u=${c.id}">${icon(c.icon)} ${esc(L(c))}
            <span class="mono c-count num">${catCount(c.id)}</span></a>`).join("")}</div>
      </div></section>
      <section class="section"><div class="container">
        <div class="sec-row"><h2 class="sec-title mb0">${T("home.feat")}</h2>
          <a class="btn-text" href="${P("/tools/")}"><span>${T("tools.all")}</span>${icon("arrow","icon-flip")}</a></div>
        ${grid(REG().filter(t=>t.featured))}
      </div></section>
      ${recent.length?`<section class="section alt"><div class="container">
        <h2 class="sec-title">${T("home.recent")}</h2>${grid(recent)}</div></section>`:""}
      <section class="section"><div class="container">
        <h2 class="sec-title">${T("home.why")}</h2>
        <div class="hairline cols-2 why-grid">
          ${["t1","t2","t3","t4"].map(k=>`<div class="why-cell">
            <span class="service-ico">${icon("check")}</span><h3>${T("why."+k)}</h3>
            <p class="service-desc">${T("why.d"+k.slice(1))}</p></div>`).join("")}
        </div>
      </div></section>
      <section class="section alt"><div class="container about-strip">
        <svg class="brand-mark big" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="6" fill="#FF6600"/><path d="M9.5 23 16 8.5 22.5 23h-3.6L16 16.4 13.1 23z" fill="#0a0a0b"/></svg>
        <div><h2>${T("home.author")} — ${esc(TP_CONFIG.brandName)}</h2>
          <p>${esc(L({ar:"مطوّر ويب ومتخصص SEO بخبرة تتجاوز عشر سنوات في بناء المواقع والمدونات وتهيئتها. هذه الأدوات امتداد عملي لعمله اليومي — كل أداة هنا وُلدت من حاجة حقيقية.",
                     en:"A web developer & SEO specialist with over a decade of experience building and optimizing websites and blogs. These tools are a practical extension of his daily work — each one born from a real need."}))}</p>
          <a class="btn-text" href="${P("/about/")}"><span>${T("nav.about")}</span>${icon("arrow","icon-flip")}</a></div>
      </div></section>`;
      const hs=$("#heroSearch");
      hs.addEventListener("input",()=>{ if(hs.value.trim().length>=1) searchOverlay(hs.value); });
      hs.addEventListener("search",()=>{ if(hs.value.trim()) searchOverlay(hs.value); });
    },

    tools(){
      const active = new URLSearchParams(location.search).get("cat") || "all";
      const sort = LS.get("aa_sort","popular");
      const favs = LS.get("aa_fav",[]).map(find).filter(Boolean);
      const list = (sortFn => active==="all"? sortFn() : sortFn().filter(t=>t.cat===active))(sorted[sort]||sorted.popular);
      $("#app").innerHTML = `
      <header class="page-head container"><p class="kicker">${T("nav.tools")}</p>
        <h1>${T("tools.all")}</h1>
        <div class="big-search">${icon("search","bs-ico")}
          <input id="tSearch" type="search" placeholder="${T("tools.search")}" autocomplete="off" aria-label="${T("tools.search")}"></div>
        <div class="chip-row cat-chips">
          <a class="chip ${active==="all"?"active":""}" href="${P("/tools/")}">${AB_L_ALL()}</a>
          ${TP_CONFIG.categories.map(c=>`<a class="chip ${active===c.id?"active":""}" href="${P("/tools/")}?cat=${c.id}">${icon(c.icon)} ${esc(L(c))}</a>`).join("")}</div>
        <div class="sort-row">
          <label for="sortSel" class="mono">${T("tools.sort")}</label>
          <select id="sortSel" class="sort-sel">
            <option value="popular" ${sort==="popular"?"selected":""}>${T("tools.sPop")}</option>
            <option value="newest" ${sort==="newest"?"selected":""}>${T("tools.sNew")}</option>
            <option value="alpha" ${sort==="alpha"?"selected":""}>${T("tools.sAlpha")}</option>
          </select></div>
      </header>
      <section class="section flush-top"><div class="container">
        ${favs.length?`<h2 class="sec-title">${T("tools.fav")}</h2>${grid(favs)}<div class="gap"></div>`:""}
        <div id="tList">${list.length?grid(list):`<div class="empty"><p>${T("tools.none")}</p></div>`}</div>
      </div></section>`;
      const inp=$("#tSearch"), listEl=$("#tList");
      inp.addEventListener("input",()=>{
        const q=inp.value.trim().toLowerCase();
        const hits=REG().filter(t=>[L(t.name),L(t.desc),(t.kw.ar||[]).join(" "),(t.kw.en||[]).join(" ")]
          .join(" ").toLowerCase().includes(q)).filter(t=>active==="all"||t.cat===active);
        listEl.innerHTML = hits.length?grid(hits):`<div class="empty"><p>${T("tools.none")}</p></div>`;
      });
      $("#sortSel").addEventListener("change",e=>{ LS.set("aa_sort",e.target.value); R.tools(); });
    },

    category(){
      const id = new URLSearchParams(location.search).get("u") || "";
      const c = TP_CONFIG.categories.find(x=>x.id===id);
      const box = $("#app");
      if(!c){ box.innerHTML = notFoundHTML(); return; }
      const list = REG().filter(t=>t.cat===id).sort((a,b)=>L(a.name).localeCompare(L(b.name),"ar"));
      document.title = `${L(c)} — ${L(TP_CONFIG.platform)}`;
      box.innerHTML = `
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="${P("/")}">${T("nav.home")}</a>${icon("chevron","crumb-sep")}
        <a href="${P("/tools/")}">${T("nav.tools")}</a>${icon("chevron","crumb-sep")}
        <span aria-current="page">${esc(L(c))}</span></nav>
      <header class="page-head container"><p class="kicker">${T("nav.cats")}</p>
        <h1><span class="cat-h-ico">${icon(c.icon)}</span>${esc(L(c))}</h1>
        <p class="lead">${esc(L(c.desc))}</p></header>
      <section class="section flush-top"><div class="container">
        ${list.length?grid(list):`<div class="empty"><p>${T("tools.empty")}</p></div>`}
      </div></section>`;
      const l=document.createElement("link"); l.rel="canonical";
      l.href=`${TP_CONFIG.siteUrl}${isEN?"/en":""}/category/?u=${id}`; document.head.appendChild(l);
    },

    tool(){
      const box = $("#toolPage");
      const slug = new URLSearchParams(location.search).get("u") || "";
      const t = find(slug);
      if(!t || !window.TOOL_IMPL || !TOOL_IMPL[slug]){ box.innerHTML = notFoundHTML(); return; }
      pushRecent(slug);
      const impl = TOOL_IMPL[slug], c = cat(t.cat), C = impl.content?.[TP.lang] || impl.content?.en || {};
      document.title = `${L(t.name)} — ${L(TP_CONFIG.platform)}`;
      const md=$('meta[name="description"]'); if(md) md.setAttribute("content", L(t.desc));
      const setLink=(rel,attrs)=>{ const l=document.createElement("link"); l.rel=rel;
        Object.entries(attrs).forEach(([k,v])=>l.setAttribute(k,v)); document.head.appendChild(l); };
      setLink("canonical",{href:toolURL(t,TP.lang)});
      const other = TP.lang==="ar"?"en":"ar";
      setLink("alternate",{hreflang:other,href:toolURL(t,other)});
      const og=(p,v)=>{ let el=document.querySelector(`meta[property="${p}"]`);
        if(!el){ el=document.createElement("meta"); el.setAttribute("property",p); document.head.appendChild(el);} el.setAttribute("content",v); };
      og("og:title",L(t.name)); og("og:description",L(t.desc));
      og("og:url",toolURL(t,TP.lang)); og("og:type","website");
      const sc=document.createElement("script"); sc.type="application/ld+json";
      sc.textContent=JSON.stringify([
        {"@context":"https://schema.org","@type":"SoftwareApplication",
         name:L(t.name),description:L(t.desc),applicationCategory:"UtilitiesApplication",
         operatingSystem:"Web",url:toolURL(t,TP.lang),
         offers:{"@type":"Offer",price:"0",priceCurrency:"USD"},
         author:{"@type":"Person",name:TP_CONFIG.brandName,url:TP_CONFIG.mainSiteUrl}},
        {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
          {"@type":"ListItem","position":1,"name":T("nav.home"),"item":TP_CONFIG.siteUrl+(isEN?"/en/":"/")},
          {"@type":"ListItem","position":2,"name":L(c),"item":`${TP_CONFIG.siteUrl}${isEN?"/en":""}/category/?u=${c.id}`},
          {"@type":"ListItem","position":3,"name":L(t.name)}]},
        ...(C.faq?.length?[{"@context":"https://schema.org","@type":"FAQPage",
          mainEntity:C.faq.map(f=>({"@type":"Question","name":L(f.q),
            "acceptedAnswer":{"@type":"Answer","text":L(f.a)}}))}]:[])
      ]);
      document.head.appendChild(sc);
      const f = isFav(slug);
      box.innerHTML = `
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="${P("/")}">${T("nav.home")}</a>${icon("chevron","crumb-sep")}
        <a href="${P("/tools/")}?cat=${c.id}">${esc(L(c))}</a>${icon("chevron","crumb-sep")}
        <span aria-current="page">${esc(L(t.name))}</span></nav>
      <header class="art-head">
        <h1>${esc(L(t.name))}</h1>
        <p class="art-desc">${esc(L(t.desc))}</p>
        <div class="art-actions">
          <button type="button" class="btn-text fav-btn-inline ${f?"on":""}" id="favBtn" aria-pressed="${f}">${icon("heart")}<span>${f?T("tools.rmFav"):T("tools.addFav")}</span></button>
          <button type="button" class="btn-text" id="shareBtn">${icon("share")}<span>${T("tool.share")}</span></button>
        </div></header>
      <div class="tool-box" id="toolBox"><p class="c-empty">…</p></div>
      <p class="local-note">${T("tool.local")}</p>
      ${TP_CONFIG.adsense.enabled&&TP_CONFIG.adsense.client&&TP_CONFIG.adsense.slots.afterTool?
        `<div class="ad-slot"><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(TP_CONFIG.adsense.client)}" data-ad-slot="${esc(TP_CONFIG.adsense.slots.afterTool)}" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`:""}
      <section class="tool-content">
        <h2>${T("tool.usage")}</h2><p>${esc(C.intro||"")}</p>
        ${C.steps?.length?`<h3>${T("tool.steps")}</h3><ol class="steps">${C.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol>`:""}
        ${C.tips?.length?`<h3>${T("tool.tips")}</h3><ul class="tips">${C.tips.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>`:""}
        ${C.faq?.length?`<h3>${T("tool.faq")}</h3><div class="faq-list">${C.faq.map(fq=>`
          <details class="faq-item"><summary>${esc(L(fq.q))}</summary><p>${esc(L(fq.a))}</p></details>`).join("")}</div>`:""}
      </section>
      <section class="related"><h2>${T("tool.related")}</h2>
        ${grid(REG().filter(x=>x.cat===t.cat&&x.slug!==slug).slice(0,3))}</section>
      <section class="cta-band"><div class="container narrow center">
        <h2>${esc(L({ar:"هل تحتاج إلى تحسين موقعك؟",en:"Need your website improved?"}))}</h2>
        <p class="lead center-txt">${esc(L({ar:"يمكنك طلب خدمة مباشرة من عبدالله عباس — بناء وتهيئة وتحسين.",en:"You can request a service directly from Abdallah Abas — building, readiness and optimization."}))}</p>
        <a class="btn btn-solid btn-lg" href="${P("/services/")}">${T("cta.services")}</a></div></section>`;
      impl.mount($("#toolBox"));
      const fb=$("#favBtn");
      fb.addEventListener("click",()=>{ const on=toggleFav(slug);
        fb.classList.toggle("on",on); fb.setAttribute("aria-pressed",String(on));
        fb.querySelector("span").textContent = on?T("tools.rmFav"):T("tools.addFav"); });
      $("#shareBtn").addEventListener("click",()=>{
        const data={title:L(t.name),url:location.href};
        if(navigator.share) navigator.share(data).catch(()=>{});
        else if(navigator.clipboard) navigator.clipboard.writeText(location.href).then(()=>TP.toast(T("tool.copied")));
      });
    },

    about(){
      $("#app").innerHTML = `
      <header class="page-head container"><p class="kicker">${T("nav.about")}</p>
        <h1>${esc(L({ar:"حول أدوات عبدالله عباس",en:"About Abdallah Abas Tools"}))}</h1></header>
      <section class="section flush-top"><div class="container narrow legal-body">
        <h2>${esc(L({ar:"ما هي المنصة؟",en:"What is this platform?"}))}</h2>
        <p>${esc(L({ar:"مكتبة أدوات مجانية تعمل بالكامل داخل متصفحك — لمنشئي المحتوى وأصحاء المواقع والمدونات والفريلانسرز. لا حسابات، لا انتظار، ولا رفع ملفات.",
                    en:"A free tools library that runs entirely in your browser — for creators, site owners, bloggers and freelancers. No accounts, no waiting, no file uploads."}))}</p>
        <h2>${esc(L({ar:"لماذا وُجدت؟",en:"Why was it built?"}))}</h2>
        <p>${esc(L({ar:"لأن معظم المهام الصغيرة — عد كلمات، تنظيف نص، توليد وسوم — لا تستحق فتح موقعًا يطالبك ببياناتك أو يعرض إعلانات فوق الأداة نفسها. الأداة هنا أولًا، والمحتوى يخدمها.",
                    en:"Because small tasks — counting words, cleaning text, generating tags — shouldn't require a site that asks for your data or buries the tool under ads. Here the tool comes first."}))}</p>
        <h2>${esc(L({ar:"لمن تناسب؟",en:"Who is it for?"}))}</h2>
        <p>${esc(L({ar:"لكل من يعمل على الويب بالعربية والإنجليزية: كتّاب، مدونون على بلوجر وووردبريس، مختصو SEO، مطورون، وفريلانسرز.",
                    en:"Anyone working on the web in Arabic or English: writers, Blogger & WordPress bloggers, SEO practitioners, developers, freelancers."}))}</p>
        <h2>${esc(L({ar:"الخصوصية والأدوات المجانية",en:"Privacy and free tools"}))}</h2>
        <p>${esc(L({ar:"كل أداة تعمل محليًا: نصوصك وملفاتك لا تغادر متصفحك. ما يُخزَّن محليًا فقط: تفضيل الثيم، أدواتك المفضلة، وآخر الأدوات التي استخدمتها. التفاصيل في سياسة الخصوصية.",
                    en:"Every tool runs locally: your text and files never leave your browser. Stored locally only: theme preference, favorites and recently used tools. Details in the Privacy Policy."}))}</p>
        <p><a class="btn-text" href="${P("/privacy/")}">${T("legal.privacy")}${icon("arrow","icon-flip")}</a></p>
      </div></section>`;
    },

    services(){
      const S = [
        {ar:"إنشاء المواقع والمدونات",en:"Website & blog building",d:{ar:"بناء كامل على بلوجر أو ووردبريس ببنية أقسام وتصفح وصفحات قانونية.",en:"Full builds on Blogger or WordPress with structure, navigation and legal pages."}},
        {ar:"تحسين محركات البحث",en:"SEO",d:{ar:"SEO تقني ومضموني: فحص وبنية وبيانات وصفية وSearch Console.",en:"Technical & on-page SEO: audits, structure, metadata and Search Console."}},
        {ar:"تهيئة AdSense",en:"AdSense readiness",d:{ar:"تحضير الموقع وفق متطلبات Google المنشورة — دون أي ضمان قبول.",en:"Site preparation per Google's published requirements — never a guarantee."}},
        {ar:"تحسين المواقع",en:"Website optimization",d:{ar:"أداء وسهولة استخدام وCore Web Vitals.",en:"Performance, usability and Core Web Vitals."}},
        {ar:"كتابة المحتوى",en:"Content writing",d:{ar:"محتوى منظم للقارئ أولًا ثم لمحركات البحث.",en:"Structured content — humans first, search engines second."}},
        {ar:"استشارات تقنية",en:"Technical consulting",d:{ar:"تقييم صريح وخطة عمل واضحة حسب هدفك.",en:"An honest assessment and a clear plan for your goal."}}];
      $("#app").innerHTML = `
      <header class="page-head container"><p class="kicker">${T("nav.services")}</p>
        <h1>${esc(L({ar:"خدمات مباشرة من صاحب الخبرة",en:"Services straight from the practitioner"}))}</h1>
        <p class="lead">${esc(L({ar:"كل خدمة تبدأ بفهم هدفك وتنتهي بعرض مكتوب: نطاق وجدول زمني وسعر — لا باقات جاهزة.",
          en:"Every service starts with your goal and ends with a written scope, timeline and price — no packaged deals."}))}</p></header>
      <section class="section flush-top"><div class="container">
        ${S.map((s,i)=>`<article class="service-row" id="svc-${i}">
          <span class="service-ico">${icon("check")}</span>
          <div><h2>${esc(L(s))}</h2><p>${esc(L(s.d))}</p></div>
          <a class="btn btn-ghost" href="${esc(TP_CONFIG.mainSiteUrl)}/contact.html" target="_blank" rel="noopener noreferrer">${T("cta.services")}</a>
        </article>`).join("")}
      </div></section>`;
    },

    contact(){
      const c = TP_CONFIG.contact;
      const methods=[];
      if(c.whatsapp) methods.push(["whatsapp","WhatsApp",`https://wa.me/${c.whatsapp}`,"+"+c.whatsapp]);
      if(c.email) methods.push(["mail",L({ar:"البريد الإلكتروني",en:"Email"}),`mailto:${c.email}`,c.email]);
      [["telegram",c.social.telegram],["linkedin",c.social.linkedin],["github",c.social.github],["facebook",c.social.facebook]]
        .forEach(([ic,u])=>{ if(u) methods.push([ic,ic[0].toUpperCase()+ic.slice(1),u,ic]); });
      $("#app").innerHTML = `
      <header class="page-head container"><p class="kicker">${T("nav.contact")}</p>
        <h1>${esc(L({ar:"لنتحدث",en:"Let's talk"}))}</h1>
        <p class="lead">${T("misc.response")}</p></header>
      <section class="section flush-top"><div class="container narrow">
        <div class="hairline methods-grid">
          ${methods.map(([ic,name,href,val])=>`<a class="method" href="${esc(href)}" ${href.startsWith("http")?'target="_blank" rel="noopener noreferrer"':""}>
            ${icon(ic)}<span class="method-body"><span class="method-name">${esc(name)}</span>
            <span class="method-val num">${esc(val)}</span></span></a>`).join("")}
        </div>
        <div class="response-block"><h3>${icon("check")}<span>${esc(L({ar:"طلب خدمة",en:"Service request"}))}</span></h3>
          <p>${esc(L({ar:"لمعالجة طلب خدمة منظّم (نموذج كامل)، استخدم صفحة التواصل في الموقع الرئيسي.",
            en:"For a structured service request (full form), use the contact page on the main website."}))}</p>
          <a class="btn btn-solid" href="${esc(TP_CONFIG.mainSiteUrl)}/contact.html" target="_blank" rel="noopener noreferrer">${T("cta.main")}${icon("external")}</a>
        </div>
      </div></section>`;
    },

    legal(){
      const k = document.body.dataset.legal;
      const d = (window.TP_LEGAL||{})[k]; const box=$("#app"); if(!d||!box) return;
      box.innerHTML = `
      <header class="page-head container"><h1>${esc(L(d.title))}</h1>
        <p class="lead mono">${esc(L({ar:"آخر تحديث",en:"Last updated"}))}: <time class="num" datetime="${d.updated}">${d.updated}</time></p></header>
      <section class="section flush-top"><div class="container narrow legal-body">
        ${d.sections.map(s=>`<section><h2>${esc(L(s.h))}</h2>
          ${(s.p[TP.lang]||s.p.en).map(x=>`<p>${esc(x)}</p>`).join("")}</section>`).join("")}
      </div></section>`;
    },

    notfound(){
      /* static 404 content — chrome only */
    }
  };
  const AB_L_ALL = () => esc(L({ar:"الكل",en:"All"}));
  const notFoundHTML = () => `<div class="empty section"><p class="kicker justify-center">404</p>
    <h2>${T("misc.notFound")}</h2><p>${T("misc.notFoundSub")}</p>
    <div class="hero-cta"><a class="btn btn-solid" href="${P("/tools/")}">${T("misc.backTools")}</a>
    <a class="btn btn-ghost" href="${P("/")}">${T("nav.home")}</a></div></div>`;

  document.addEventListener("DOMContentLoaded", () => {
    chrome(); footer();
    const page = document.body.dataset.page;
    if (R[page]) R[page]();
    /* Analytics — placeholder فقط (بلا IDs وهمية) */
    const a = TP_CONFIG.analytics;
    if (a.enabled && a.gaId) {
      const s=document.createElement("script"); s.async=true;
      s.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(a.gaId)}`;
      document.head.appendChild(s);
      window.dataLayer=window.dataLayer||[];
      window.gtag=function(){ dataLayer.push(arguments); };
      gtag("js",new Date()); gtag("config",a.gaId,{anonymize_ip:true});
    }
  });
})();
