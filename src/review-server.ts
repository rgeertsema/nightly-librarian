import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 4242;
const ROOT = path.resolve(__dirname, '..');
const MIME: Record<string, string> = { '.html': 'text/html', '.json': 'application/json' };

const server = http.createServer((req, res) => {
    const p = new URL(req.url||'/', `http://localhost:${PORT}`).pathname;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    if (req.method === 'GET' && (p==='/'||p==='/index.html')) { serveFile(res, path.join(ROOT,'review.html')); return; }
    const m = p.match(/^\/inbox\/([\d-]+\.json)$/);
    if (m && req.method === 'GET') { serveFile(res, path.join(ROOT,'inbox',m[1])); return; }
    if (m && req.method === 'PUT') {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
            try { JSON.parse(body); fs.writeFileSync(path.join(ROOT,'inbox',m[1]), body, 'utf-8'); res.writeHead(200); res.end('{"ok":true}'); }
            catch { res.writeHead(400); res.end('{"error":"Invalid JSON"}'); }
        });
        return;
    }
    res.writeHead(404); res.end('Not found');
});

function serveFile(res: http.ServerResponse, fp: string) {
    try { res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)]||'text/plain' }); res.end(fs.readFileSync(fp)); }
    catch { res.writeHead(404); res.end('Not found'); }
}

server.listen(PORT, () => console.log(`[review-server] http://localhost:${PORT}`));
setTimeout(() => { server.close(); process.exit(0); }, 2*60*60*1000); // auto-stop after 2h
