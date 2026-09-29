#!/usr/bin/env node
/* يقرأ slugs من js/registry.js + إعدادات config → يولّد sitemap.xml
   Run: node scripts/generate.mjs (أو عبر workflow يدوي) */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cfg = readFileSync(join(ROOT,"js","config.js"),"utf8");
const SITE = /siteUrl\s*:\s*"([^"]+)"/.exec(cfg)?.[1];
if(!SITE){ console.error("[gen] siteUrl missing"); process.exit(1); }
const reg = readFileSync(join(ROOT,"js","registry.js"),"utf8");
const slugs = [...reg.matchAll(/slug:\s*"([^"]+)"/g)].map(m=>m[1]);
const x = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;");
const today = new Date().toISOString().slice(0,10);
const STATIC = ["","/tools/","/about/","/services/","/contact/"];
let u="";
for(const p of STATIC){ u+=`  <url><loc>${x(SITE+ (p?p:"/"))}</loc><lastmod>${today}</lastmod></url>\n`;
                       u+=`  <url><loc>${x(SITE+"/en"+p)}</loc><lastmod>${today}</lastmod></url>\n`; }
for(const s of slugs){
  u+=`  <url><loc>${x(SITE)}/tool/?u=${s}</loc><lastmod>${today}</lastmod></url>\n`;
  u+=`  <url><loc>${x(SITE)}/en/tool/?u=${s}</loc><lastmod>${today}</lastmod></url>\n`;
}
writeFileSync(join(ROOT,"sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${u}</urlset>\n`);
console.log(`[gen] ✓ sitemap.xml — ${slugs.length} tools × 2 langs + ${STATIC.length*2} static`);
