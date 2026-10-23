'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');
const base = process.env.AUDIT_BASE_URL;
if (!base || !/^https:\/\//.test(base)) throw Error('Missing HTTPS AUDIT_BASE_URL');
const site = new URL(base);
const max = Math.min(30, Math.max(1, Number(process.env.AUDIT_MAX_PAGES || 24)));
const seeds = (process.env.AUDIT_SEED_PATHS || '/').split(',').map(x => x.trim()).filter(Boolean);
const excluded = (process.env.AUDIT_EXCLUDE_PREFIXES || '/api/,/admin/,/login,/logout/,/staff/,/account/').split(',').map(x => x.trim()).filter(Boolean);
const output = path.resolve('visual-audit-evidence');
fs.mkdirSync(output, {recursive:true});
const queue = [], queued = new Set(), visited = new Set(), records = [];
function normalize(href) {
  try {
    const url = new URL(href, site);
    if (url.origin !== site.origin) return null;
    if (/\.(pdf|zip|jpg|jpeg|png|gif|svg|webp|ico|css|js|json|xml|woff2?|ttf|txt)$/i.test(url.pathname)) return null;
    const p = url.pathname.replace(/\/{2,}/g, '/') || '/';
    if (excluded.some(x => p === x.replace(/\/$/, '') || p.startsWith(x))) return null;
    return p;
  } catch { return null; }
}
function enqueue(url) {
  const p = normalize(url);
  if (p && !queued.has(p) && !visited.has(p) && queue.length < 90) { queue.push(p); queued.add(p); }
}
seeds.forEach(enqueue);
const viewports = [{name:'desktop',width:1440,height:900,mobile:false},{name:'mobile',width:390,height:844,mobile:true}];
async function seedSitemap() {
  try {
    const res = await fetch(new URL('/sitemap.xml', site), {signal: AbortSignal.timeout(8000)});
    if (!res.ok) return;
    const xml = await res.text();
    const locations = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)];
    for (const m of locations) enqueue(m[1].replace(/&amp;/g, '&'));
    console.log('Sitemap routes discovered:', locations.length);
  } catch (err) { console.log('Sitemap unavailable:', String(err.message || err).slice(0,120)); }
}
async function main() {
  await seedSitemap();
  const browser = await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  try {
    while (queue.length && visited.size < max) {
      const route=queue.shift(); if(visited.has(route)) continue;
      visited.add(route);
      for (const vp of viewports) {
        const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1,isMobile:vp.mobile,hasTouch:vp.mobile,reducedMotion:'reduce'});
        const page=await context.newPage();
        const item={route,viewport:vp.name,url:new URL(route,site).href,status:null,warnings:[],error:null,screenshot:null};
        try {
          const response=await page.goto(item.url,{waitUntil:'domcontentloaded',timeout:30000});
          item.status=response&&response.status();
          await page.evaluate(()=>document.fonts&&document.fonts.ready).catch(()=>{});
          await page.waitForTimeout(500);
          const p=await page.evaluate(()=>({
            title:document.title,
            h1:[...document.querySelectorAll('h1')].map(e=>e.innerText.trim()).filter(Boolean),
            scrollWidth:document.documentElement.scrollWidth,
            width:window.innerWidth,
            broken:[...document.images].filter(e=>!e.complete||!e.naturalWidth).map(e=>e.getAttribute('src')).slice(0,8),
            links:[...document.querySelectorAll('a[href]')].map(e=>e.href)
          }));
          item.title=p.title;item.h1=p.h1;
          if(item.status>=400)item.warnings.push('HTTP '+item.status);
          if(p.scrollWidth>p.width+3)item.warnings.push('Horizontal overflow: '+p.scrollWidth+'px / '+p.width+'px');
          if(!p.h1.length)item.warnings.push('Missing H1');
          if(p.broken.length)item.warnings.push('Broken images: '+p.broken.join(', '));
          if(vp.name==='desktop')p.links.forEach(enqueue);
          const slug=(route.replace(/^\/|\/$/g,'').replace(/[^a-z0-9]+/ig,'-').replace(/^-|-$/g,'')||'home').slice(0,80);
          const filename=vp.name+'/'+String(visited.size).padStart(2,'0')+'-'+slug+'.png';
          fs.mkdirSync(path.join(output,vp.name),{recursive:true});
          await page.screenshot({path:path.join(output,filename),fullPage:true,animations:'disabled',timeout:30000});
          item.screenshot=filename;
        }catch(e){item.error=String(e.message||e).slice(0,550);}
        records.push(item);
        console.log(vp.name,route,item.error||item.status,item.warnings.join('; '));
        await context.close();
      }
    }
  }finally{await browser.close();}
  const failures=records.filter(x=>x.error||x.status>=400);
  const report=[
    '# Full-site visual audit evidence',
    'Site: '+site.origin,
    'Pages: '+visited.size+'; screenshots: '+records.filter(x=>x.screenshot).length+'; failed captures: '+failures.length,
    '',
    '| Page | Viewport | HTTP | Warnings | Screenshot |',
    '|---|---|---|---|---|',
    ...records.map(x=>'| '+x.route+' | '+x.viewport+' | '+(x.status||'—')+' | '+(x.error||x.warnings.join('; ')||'—').replace(/\|/g,'/')+' | '+(x.screenshot||'none')+' |'),
    '',
    '## Manual or AI vision review checklist',
    'These screenshots are evidence, NOT an automatic AI design review.',
    'Review page-to-page and desktop/mobile consistency of typography, hierarchy, whitespace, restrained brand colours, navigation, footer, imagery, CTA clarity, conversion friction, trust signals, visual appeal, mobile readability and accessibility.',
    'Explicitly report each defect with route, viewport, impact, proposed correction and a post-fix screenshot.',
    'Read-only crawl; no forms are submitted and excluded/account paths are not opened.'
  ].join('\n')+'\n';
  fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({site:site.origin,pages:[...visited],records},null,2)+'\n');
  fs.writeFileSync(path.join(output,'REVIEW.md'),report);
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,report);
  if(failures.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});