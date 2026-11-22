// Mutaciones de la versión v02.02 (pestaña Trámites y guía de devolución del IVA): siembra un
// defecto por vez en una copia y comprueba que tests/arbitro-v02-02.mjs lo detecta.
// Uso: node tests/mutaciones-v02-02.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const G = 'guias/devolucion-iva.html';
const MUTACIONES = [
  [G, '.cols{display:grid; grid-template-columns:minmax(0,1fr); gap:0}\n.cols>*{min-width:0}', '.cols{display:grid; grid-template-columns:1fr; gap:0}', 'la guía vuelve a salirse de la pantalla en el celular'],
  [G, '  b.setAttribute("aria-label", t ? t+": ver explicación" : "Ver explicación");\n', '', 'los «?» sin nombre'],
  [G, '.tt{min-width:24px; min-height:24px; vertical-align:middle}', '', '«?» más pequeños que 24 px'],
  [G, 'const conCita = () => S.ruta==="cita"', 'const conCita = () => true || S.ruta==="cita"', 'la carta dice «cita» aunque no la haya'],
  [G, 'for(const k of CAMPOS){', 'for(const k of Object.keys(obj(o.data))){', 'restaurar acepta claves desconocidas'],
  [G, 'if(!await preguntar("¿Reiniciar la guía?"', 'if(!confirm("¿Reiniciar?")) return; if(false && !await preguntar("¿Reiniciar la guía?"', 'vuelve confirm() del navegador'],
  [G, 'cb.disabled=!(unlocked && (prevOk || on));', 'cb.disabled=!unlocked;', 'se pierde el orden estricto de las casillas'],
  [G, '<span class="vigencia">Vigente desde el 12 nov 2026 · Concepto DIAN 2242 de 2026</span>', '', 'una novedad sin fecha de vigencia'],
  [G, '<meta name="version" content="v01.02.00cl">', '<meta name="version" content="v01.02.00cl">\n<link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet">', 'vuelven las fuentes de Google'],
  ['js/app.js', '" download="${esc(nombre)}">', '">', 'el botón de descarga solo abre'],
  ['js/app.js', "['directorio', 'tramites', 'preguntar', 'admin']", "['directorio', 'preguntar', 'admin']", 'la pestaña Trámites no tiene ruta'],
  ['css/app.css', '@media (min-width: 720px) and (max-width: 1023px) {', '@media (min-width: 9999px) and (max-width: 1023px) {', 'en tableta las pestañas aprietan el aviso «no oficial»'],
  ['config/sitio.json', 'AKfycbyufnuvwdFEz0Vtj_nTJnBDnOC6vRGLx_kC8SyZWTnutWS89mL0MPORjv9rkaCbY4Q', 'AKfycbOTRA_direccion_equivocada_000', 'dirección /exec equivocada'],
  ['sw.js', "  if (/\\/guias\\/[^/]+\\.html$/.test(url.pathname)) { e.respondWith(primeroRed(req)); return; }\n", '', 'el ayudante sin conexión cambia la guía por la portada'],
];
let vivas = 0, puerto = 8590;
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
  const r = spawnSync('node', ['tests/arbitro-v02-02.mjs'], { cwd: tmp, env: { ...process.env, BASE: `http://localhost:${p}/`, CAPTURAS: path.join(tmp, '_capturas') }, encoding: 'utf8' });
  srv.kill();
  const detectada = r.status !== 0;
  if (!detectada) vivas++;
  console.log(`${detectada ? '✔ detectada' : '✘ VIVA'}: ${nombre}${detectada ? ` (${(r.stdout.match(/✘/g) || []).length} afirmaciones fallaron)` : ''}`);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(vivas ? `\n${vivas} mutación(es) vivas` : `\nLas ${MUTACIONES.length} mutaciones fueron detectadas`);
process.exit(vivas ? 1 : 0);
