// Mutaciones de la versión v02.01 (estrellas, opiniones, «Quiero aparecer», orden por ciudad
// y servicio, «Calificación baja»): siembra un defecto por vez en una copia y comprueba que el
// script árbitro tests/arbitro-v02-01.mjs lo detecta. Uso: node tests/mutaciones-v02-01.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MUTACIONES = [
  ['js/app.js', 'r.n >= MINIMO_PARA_BAJAR() && ', '', 'una sola calificación mala esconde al negocio'],
  ['js/app.js', 'return r ? (r.promedio * r.n + PREVIO * PESO_PREVIO) / (r.n + PESO_PREVIO) : PREVIO;', 'return PREVIO;', 'no ordena por calificación'],
  ['js/app.js', "const abierta = abrirTodas || estado.ciudad === c || estado.abiertas.has(c);", 'const abierta = true;', 'todas las ciudades abiertas (amontonado)'],
  ['js/app.js', '<p>${esc(o.t)}</p>', '<p>${o.t}</p>', 'opinión sin escapar (XSS)'],
  ['js/app.js', "const sinRed = !navigator.onLine;", 'const sinRed = false;', 'deja enviar sin internet'],
  ['js/app.js', "$('accionesDirectorio').hidden = !COM.activa;", "$('accionesDirectorio').hidden = false;", '«Quiero aparecer» visible sin servicio'],
  ['js/app.js', "marcar(f.web, !f.web.value.trim() || /^https:\\/\\/\\S+\\.\\S+$/.test(f.web.value.trim()),", 'marcar(f.web, true,', 'acepta web sin https en el navegador'],
  ['css/app.css', '.fichas { display: grid; gap: 12px;', '.fichas { display: grid; gap: 0;', 'fichas pegadas unas a otras'],
  ['js/comunidad.js', "'Content-Type': 'text/plain;charset=utf-8'", "'Content-Type': 'application/json'", 'envío con preflight de CORS'],
  ['apps-script/Codigo.gs', "var estado = comentario ? 'pendiente' : 'sin_comentario';", "var estado = comentario ? 'publicado' : 'sin_comentario';", 'opiniones publicadas sin revisar'],
  ['apps-script/Codigo.gs', "function sinComilla_(s) { return /^'[=+\\-@]/.test(s) ? s.slice(1) : s; }", 'function sinComilla_(s) { return s; }', 'teléfono con comilla al leer'],
  ['apps-script/Codigo.gs', ".filter(function (f) { return f.contactoId === id; })", '', 'revisar calificaciones trae las de todos'],
  ['js/admin.js', 'bo.contactos.push({ id: idContacto(x.negocio, ciudad), ', 'bo.contactos.push({ ', 'contacto nuevo sin id'],
  ['sw.js', " 'js/comunidad.js',", '', 'comunidad.js fuera de la copia sin conexión'],
];
let vivas = 0, puerto = 8390;
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
  const r = spawnSync('node', ['tests/arbitro-v02-01.mjs'], { cwd: tmp, env: { ...process.env, BASE: `http://localhost:${p}/`, CAPTURAS: path.join(tmp, '_capturas') }, encoding: 'utf8' });
  srv.kill();
  const detectada = r.status !== 0;
  if (!detectada) vivas++;
  console.log(`${detectada ? '✔ detectada' : '✘ VIVA'}: ${nombre}${detectada ? ` (${(r.stdout.match(/✘/g) || []).length} afirmaciones fallaron)` : ''}`);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(vivas ? `\n${vivas} mutación(es) vivas` : `\nLas ${MUTACIONES.length} mutaciones fueron detectadas`);
process.exit(vivas ? 1 : 0);
