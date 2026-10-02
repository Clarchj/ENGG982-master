'use strict';
/*
  Copies SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_TABLE from .env into config.js,
  the file the website actually reads. Run:  node tools/make-config.js
  The anon key is meant to be public (it ends up in the page). Never put the service_role key here.
*/
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
let env = {};
try {
  fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/).forEach(l => {
    const m = l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  });
} catch (e) { console.error('No .env file found. Copy .env.example to .env first.'); process.exit(1); }
let url = (env.SUPABASE_URL || '').trim();
try { url = new URL(url).origin; } catch (e) { /* checked below */ }   // drops a pasted /rest/v1/ or trailing slash
const  key = env.SUPABASE_ANON_KEY || '', table = env.SUPABASE_TABLE || 'hub';
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) { console.error('SUPABASE_URL in .env should look like https://abcdxyz.supabase.co'); process.exit(1); }
if (key.length < 20) { console.error('SUPABASE_ANON_KEY in .env is missing or too short.'); process.exit(1); }
if (/service_role/.test(Buffer.from(key.split('.')[1] || '', 'base64').toString())) { console.error('That is the service_role key. Use the anon public key instead.'); process.exit(1); }
const out = "/* Written by tools/make-config.js from .env. Safe to commit: the anon key is public by design. */\nwindow.HUB_CONFIG = " +
  JSON.stringify({ supabaseUrl: url, supabaseKey: key, table }, null, 2) + ";\n";
fs.writeFileSync(path.join(root, 'config.js'), out);
console.log('config.js updated. Commit and push it, then reload the site.');
