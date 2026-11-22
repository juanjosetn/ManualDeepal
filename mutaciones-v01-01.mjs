// Mutaciones de la versión v01.01: siembra un defecto por vez en una copia
// y comprueba que el script árbitro lo detecta. Uso: node tests/mutaciones-v01-01.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MUTACIONES = [
  ['js/version.js', "'v01.01.00cl'", "'v1.1.0'", 'formato de versión inválido'],
  ['sw.js', "importScripts('js/version.js');\nconst VERSION = self.APP_VERSION;", "const VERSION = 'v01.01.00cl';", 'versión quemada en sw.js'],
  ['js/app.js', "  $('versionApp').textContent = VERSION;\n", '', 'el pie no muestra la versión'],
  ['css/app.css', '  .marca .logo { filter: brightness(2.1); }\n', '', 'logo sin aclarar en modo oscuro'],
  ['css/app.css', '.marca .logo { height: 26px;', '.marca .logo { height: 60px;', 'logo demasiado grande'],
  ['config/sitio.json', '"texto": "Deepal"', '"texto": ""', 'logo sin texto alternativo'],
  ['README.md', '# Manual práctico Deepal', '# Manual práctico Deepal v01.00.00cl', 'versión vieja suelta en un documento'],
  ['sw.js', "'icons/logo-deepal.svg', ", '', 'logo fuera de la copia sin conexión'],
  ['index.html', '<script src="js/version.js"></script>\n  <script type="module" src="js/app.js"></script>', '<script type="module" src="js/app.js"></script>', 'index.html no carga version.js'],
  ['config/sitio.json', '"Alejandro Urreta"', '"Otro"', 'se pierden los créditos'],
  ['js/app.js', 'sw.js?v=${encodeURIComponent(VERSION)}', 'sw.js', 'el service worker se registra sin la versión'],
  ['sw.js', "new Request(u, { cache: 'reload' })", 'u', 'copia sin conexión con archivos viejos de la caché'],
];
let vivas = 0, puerto = 8090;
for (const [archivo, viejo, nuevo, nombre] of MUTACIONES) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mut-'));
  fs.cpSync(RAIZ, tmp, { recursive: true, filter: (s) => !s.includes('node_modules') });
  fs.symlinkSync(path.join(RAIZ, 'node_modules'), path.join(tmp, 'node_modules'));
  const f = path.join(tmp, archivo);
  const txt = fs.readFileSync(f, 'utf8');
  if (!txt.includes(viejo)) { console.log(`?? no se pudo sembrar: ${nombre}`); vivas++; continue; }
  fs.writeFileSync(f, txt.replace(viejo, nuevo));
  const p = ++puerto;
  const srv = spawn('python3', ['-m', 'http.server', String(p)], { cwd: tmp, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 700));
  const r = spawnSync('node', ['tests/arbitro-v01-01.mjs'], { cwd: tmp, env: { ...process.env, BASE: `http://localhost:${p}/`, CAPTURAS: path.join(tmp, '_capturas') }, encoding: 'utf8' });
  srv.kill();
  const detectada = r.status !== 0;
  if (!detectada) vivas++;
  console.log(`${detectada ? '✔ detectada' : '✘ VIVA'}: ${nombre}${detectada ? ` (${(r.stdout.match(/✘/g) || []).length} afirmaciones fallaron)` : ''}`);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(vivas ? `\n${vivas} mutación(es) vivas` : `\nLas ${MUTACIONES.length} mutaciones fueron detectadas`);
process.exit(vivas ? 1 : 0);
