const fs = require('node:fs');
const vm = require('node:vm');
const shell = fs.readFileSync('page-shell.html', 'utf8');
const script = fs.readFileSync('index.js', 'utf8').split('const menu=document.querySelector')[0];
const pages = ['index.html','production.html','software.html','about.html','support.html','contacts.html','foton.html','price.html'];
const templates = Object.fromEntries([...shell.matchAll(/<template id="([^"]+)">([\s\S]*?)<\/template>/g)].map(m => ['#'+m[1], {innerHTML:m[2]}]));
for (const page of pages) {
 const app = {innerHTML:''}, meta = {};
 const document = {title:'',querySelector:s=>s==='#app'?app:s==='meta[name="description"]'?meta:templates[s]};
 vm.runInNewContext(script, {document, location:{pathname:page==='index.html'?'/':'/'+page}, Date});
 let html=shell.replace(/<title>.*?<\/title>/,`<title>${document.title}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${meta.content}">`).replace(/<div id="app">[\s\S]*?<\/div>\s*<template/,`<div id="app">${app.innerHTML}</div>\n<template`);
 // Match the empty mount on the first build; subsequent builds replace the pre-rendered mount.
 if (!html.includes('<header class="header">')) throw new Error('Missing rendered header');
 html=html.replace('</head>', `<link rel="canonical" href="https://www.elsystar.com/${page==='index.html'?'':page}"></head>`);
 fs.writeFileSync(page, html);
}
console.log(`Pre-rendered ${pages.length} pages`);

fs.writeFileSync('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(p=>'<url><loc>https://www.elsystar.com/'+(p==='index.html'?'':p)+'</loc></url>').join('')+'</urlset>\n');
