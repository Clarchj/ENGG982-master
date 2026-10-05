'use strict';
/*
  Builds dist/hub-single.html: the whole app inlined into one file, with no config.js.
  Used for publishing as a claude.ai artifact. Not needed for GitHub Pages or the local server.
  Run:  node tools/build-single.js
*/
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const html = read('index.html');
const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('<!-- Optional cloud'));
const scripts = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
const fonts = '';
const code = scripts.map(f => read(f).replace(/^'use strict';\n/, '')).join('\n').replace(/<\/script/gi, '<\\/script');
const out = '<title>ENGG982 Hub</title>\n' + fonts + '\n<style>\n' + read('css/styles.css') + '</style>\n' + body.trim() + '\n<script>\n(function(){\n\'use strict\';\n' + code + '\n})();\n</script>\n';
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/hub-single.html'), out);
console.log('dist/hub-single.html', out.length, 'bytes');
