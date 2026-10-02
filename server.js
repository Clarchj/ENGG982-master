'use strict';
/*
  ENGG982 Hub: tiny local backend. No installs, no packages. Needs Node.js 18 or newer.
  Data lives in data/hub.json. A dated copy goes into backups/ every start and every hour.
  Start:  double-click launch.bat   (or: node server.js)
*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cp = require('child_process');

/* Optional settings file: .env (PORT, HUB_PIN, ...). Real environment variables win. */
try {
  for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch (e) { /* no .env: fine */ }

const PORT = Number(process.env.PORT) || 3982;
const HOST = process.env.HOST || '127.0.0.1';   // 127.0.0.1 = this computer only. 0.0.0.0 = anyone on your network.
const PIN = process.env.HUB_PIN || '';           // optional shared password (any user name)
const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const FILE = path.join(DATA, 'hub.json');
const BK = path.join(ROOT, 'backups');
const COLS = new Set(['sections','papers','ideas','people','tasks','contrib','inbox','slides','meta','secdefs','criteria','topics','weeks','deadlines','risks','plantext','roles','guide','flow']);
const ID_RE = /^[A-Za-z0-9_\-.~:@+]{1,200}$/;

fs.mkdirSync(DATA, { recursive: true });
fs.mkdirSync(BK, { recursive: true });

let db = {};
const pad = n => String(n).padStart(2, '0');
function stamp() { const d = new Date(); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes()); }
function save() { const tmp = FILE + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(db)); fs.renameSync(tmp, FILE); }
function backup() {
  if (!fs.existsSync(FILE)) return;
  try {
    fs.copyFileSync(FILE, path.join(BK, 'hub-' + stamp() + '.json'));
    const files = fs.readdirSync(BK).filter(f => /^hub-.*\.json$/.test(f)).sort();
    while (files.length > 30) fs.unlinkSync(path.join(BK, files.shift()));
  } catch (e) { console.error('Backup failed:', e.message); }
}

if (fs.existsSync(FILE)) {
  try { db = JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch (e) { console.error('data/hub.json cannot be read (' + e.message + '). Restore a copy from the backups folder, then start again.'); process.exit(1); }
  backup();
} else {
  try { db = JSON.parse(fs.readFileSync(path.join(DATA, 'seed.json'), 'utf8')); } catch (e) { db = {}; }
  save();
  console.log('First run: loaded the starting data from data/seed.json');
}
setInterval(backup, 60 * 60 * 1000);

const clients = new Set();
function broadcast() { for (const r of clients) { try { r.write('data: changed\n\n'); } catch (e) { clients.delete(r); } } }
setInterval(() => { for (const r of clients) { try { r.write(': ping\n\n'); } catch (e) { clients.delete(r); } } }, 25000);

function authed(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Basic ')) return false;
  const s = Buffer.from(h.slice(6), 'base64').toString();
  return s.slice(s.indexOf(':') + 1) === PIN;
}
function send(res, code, body, type, extra) {
  res.writeHead(code, Object.assign({ 'Content-Type': type || 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, extra || {}));
  res.end(body);
}
function readBody(req, cb) {
  let n = 0; const chunks = [];
  req.on('data', c => { n += c.length; if (n > 1e6) { req.destroy(); } else chunks.push(c); });
  req.on('end', () => cb(Buffer.concat(chunks).toString('utf8')));
}

/* Static files: the site itself. data/hub.json (your live data) is deliberately not served here. */
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json' };
const PUBLIC = /^\/(index\.html|config\.js|css\/[\w.-]+\.css|js\/[\w.-]+\.js|data\/seed\.json)$/;
function serveStatic(res, p) {
  const rel = p === '/' ? 'index.html' : p.slice(1);
  if (p !== '/' && !PUBLIC.test(p)) return false;
  try { send(res, 200, fs.readFileSync(path.join(ROOT, rel)), TYPES[path.extname(rel)] || 'application/octet-stream'); return true; }
  catch (e) { return false; }
}

const server = http.createServer((req, res) => {
  try {
    if (PIN && !authed(req)) return send(res, 401, 'PIN required', null, { 'WWW-Authenticate': 'Basic realm="ENGG982 Hub"' });
    const p = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'GET' && serveStatic(res, p)) return;
    if (req.method === 'GET' && p === '/api/all') return send(res, 200, JSON.stringify(db), 'application/json');
    if (req.method === 'GET' && p === '/api/export') return send(res, 200, JSON.stringify(db, null, 1), 'application/json', { 'Content-Disposition': 'attachment; filename="engg982-hub-' + stamp() + '.json"' });
    if (req.method === 'GET' && p === '/api/events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      res.write(': ok\n\n'); clients.add(res); req.on('close', () => clients.delete(res)); return;
    }
    const m = p.match(/^\/api\/([a-z0-9_]+)\/([^/]+)$/);
    if (m && (req.method === 'PUT' || req.method === 'DELETE')) {
      const col = m[1]; let id; try { id = decodeURIComponent(m[2]); } catch (e) { return send(res, 400, 'bad id'); }
      if (!COLS.has(col) || !ID_RE.test(id)) return send(res, 400, 'bad collection or id');
      if (req.method === 'DELETE') { if (db[col]) delete db[col][id]; save(); broadcast(); return send(res, 200, '{}', 'application/json'); }
      return readBody(req, text => {
        let obj; try { obj = JSON.parse(text); } catch (e) { return send(res, 400, 'bad json'); }
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return send(res, 400, 'body must be an object');
        (db[col] = db[col] || {})[id] = obj; save(); broadcast(); send(res, 200, '{}', 'application/json');
      });
    }
    send(res, 404, 'Not found');
  } catch (e) { console.error(e); send(res, 500, 'Server error'); }
});

function openBrowser(url) {
  if (process.env.OPEN_BROWSER !== '1') return;
  const cmd = process.platform === 'win32' ? 'start "" "' + url + '"' : process.platform === 'darwin' ? 'open "' + url + '"' : 'xdg-open "' + url + '"';
  cp.exec(cmd, () => {});
}
server.on('error', e => {
  if (e.code === 'EADDRINUSE') {
    console.log('Port ' + PORT + ' is already in use. The hub is probably already running: http://localhost:' + PORT);
    openBrowser('http://localhost:' + PORT); setTimeout(() => process.exit(0), 1500);
  } else { console.error(e); process.exit(1); }
});
server.listen(PORT, HOST, () => {
  const local = 'http://localhost:' + PORT;
  console.log('\nENGG982 Hub is running.\n  This computer:  ' + local);
  if (HOST === '0.0.0.0') for (const list of Object.values(os.networkInterfaces())) for (const i of list || []) if (i.family === 'IPv4' && !i.internal) console.log('  Same network:   http://' + i.address + ':' + PORT);
  console.log(PIN ? '  Password: the PIN you set (any user name)' : '  No password set.');
  console.log('  Data file:      ' + FILE + '\n  Close this window to stop the hub.\n');
  openBrowser(local);
});
