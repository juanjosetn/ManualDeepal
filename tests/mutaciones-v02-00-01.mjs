// Mutaciones de la versión v02.00.01 (ícono de la app). Si la mutación toca el
// generador, se vuelven a generar los íconos antes de correr el árbitro.: siembra un defecto por vez en una copia
// y comprueba que el script árbitro lo detecta. Uso: node tests/mutaciones-v02-00-01.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MUTACIONES = [
  ['herramientas/generar-iconos.mjs', 'fill="none" stroke="${EMBLEMA_COLOR}" stroke-width="${TRAZO_EMBLEMA}"', 'fill="${EMBLEMA_COLOR}"', 'emblema relleno, no de trazo fino'],
  ['herramientas/generar-iconos.mjs', 'const TRAZO_LIBRO = 0.85;', 'const TRAZO_LIBRO = 2;', 'libro de trazo grueso'],
  ['herramientas/generar-iconos.mjs', '<path d="${LIBRO}"/>', '', 'ícono sin libro'],
  ['herramientas/generar-iconos.mjs', 'escalaContenido: 0.86', 'escalaContenido: 1.3', 'maskable que se sale de la zona segura'],
  ['herramientas/generar-iconos.mjs', 'translate(196 328) scale(5)', 'translate(136 280) scale(10)', 'libro demasiado grande'],
  ['manifest.webmanifest', '"theme_color": "#ECEFF0"', '"theme_color": "#0E5866"', 'color de tema viejo'],
  ['index.html', '<link rel="icon" href="icons/icono-app.svg" type="image/svg+xml">', '', 'sin favicon SVG'],
  ['sw.js', " 'icons/icono-app.svg',", '', 'ícono fuera de la copia sin conexión'],
];
let vivas = 0, puerto = 8290;
for (const [archivo, viejo, nuevo, nombre] of MUTACIONES) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mut-'));
  fs.cpSync(RAIZ, tmp, { recursive: true, filter: (s) => !s.includes('node_modules') });
  fs.symlinkSync(path.join(RAIZ, 'node_modules'), path.join(tmp, 'node_modules'));
  const f = path.join(tmp, archivo);
  const txt = fs.readFileSync(f, 'utf8');
  if (!txt.includes(viejo)) { console.log(`?? no se pudo sembrar: ${nombre}`); vivas++; continue; }
  fs.writeFileSync(f, txt.replace(viejo, nuevo));
  if (archivo.startsWith('herramientas/')) spawnSync('node', ['herramientas/generar-iconos.mjs'], { cwd: tmp, stdio: 'ignore' });
  const p = ++puerto;
  const srv = spawn('python3', ['-m', 'http.server', String(p)], { cwd: tmp, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 700));
  const r = spawnSync('node', ['tests/arbitro-v02-00-01.mjs'], { cwd: tmp, env: { ...process.env, BASE: `http://localhost:${p}/`, CAPTURAS: path.join(tmp, '_capturas') }, encoding: 'utf8' });
  srv.kill();
  const detectada = r.status !== 0;
  if (!detectada) vivas++;
  console.log(`${detectada ? '✔ detectada' : '✘ VIVA'}: ${nombre}${detectada ? ` (${(r.stdout.match(/✘/g) || []).length} afirmaciones fallaron)` : ''}`);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(vivas ? `\n${vivas} mutación(es) vivas` : `\nLas ${MUTACIONES.length} mutaciones fueron detectadas`);
process.exit(vivas ? 1 : 0);
