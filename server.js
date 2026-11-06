const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = __dirname;
const pages = new Set(['index.html','production.html','software.html','foton.html','support.html','about.html','contacts.html','price.html']);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
http.createServer(async (req,res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405,{'Allow':'GET, HEAD'});return res.end('Method not allowed');}
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const allowed = pages.has(relative) || ['styles.css','index.js','robots.txt','sitemap.xml'].includes(relative) || /^assets\/[a-zA-Z0-9_-]+\.(png|jpg|svg)$/.test(relative);
    if (!allowed) {res.writeHead(404);return res.end('Not found');}
    const data = await fs.readFile(path.join(root,relative));
    res.writeHead(200, {'Content-Type':types[path.extname(relative)],'X-Content-Type-Options':'nosniff','Cache-Control':relative.startsWith('assets/')?'public, max-age=86400':'no-cache'});
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(process.env.PORT || 3000, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${process.env.PORT || 3000}`));
