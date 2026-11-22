// Mutaciones de la versión v02.00 (rediseño): siembra un defecto por vez en una copia
// y comprueba que el script árbitro lo detecta. Uso: node tests/mutaciones-v02-00.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MUTACIONES = [
  ['js/iconos.js', 'export const TRAZO = 1.25;', 'export const TRAZO = 2;', 'íconos de trazo grueso'],
  ['data/catalogos.json', '"icono": "llantas"', '"icono": "\u{1F6DE}"', 'emoji de vuelta en una categoría'],
  ['css/app.css', 'url("../fonts/archivo-latin.woff2") format("woff2-variations"), url("../fonts/archivo-latin.woff2") format("woff2")', 'url("../fonts/no-existe.woff2")', 'fuente propia sin cargar'],
  ['js/tema.js', "var tema = 'claro';", "var tema = 'oscuro';", 'oscuro como predeterminado'],
  ['config/sitio.json', '"Miguel Vargas"', '"Otro"', 'falta un crédito'],
  ['css/app.css', 'body:not([data-vista="tips"]) .disposicion { display: block !important; }', '', 'directorio apretado en la columna del riel'],
  ['css/app.css', 'body.con-tablero #chipsCategorias { display: none; }', '', 'categorías duplicadas en el celular'],
  ['css/app.css', '--ambar: #8F5B10;', '--ambar: #B9791F;', 'acento sin contraste AA'],
  ['js/app.js', "  energia(vis.length, TIPS.tips.length, buscando, 'tips');\n", '', 'línea de energía sin datos'],
  ['css/app.css', '  *, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }\n', '', 'ignora «reducir movimiento»'],
  ['js/app.js', "  document.body.classList.toggle('buscando', largo >= MIN_LETRAS);\n", '', 'el titular no se recoge al buscar'],
  ['js/app.js', "  $('riel').innerHTML = `<h2>Categorías</h2>", "  $('riel').innerHTML = '' && `<h2>Categorías</h2>", 'riel vacío en el computador'],
  ['index.html', '<button id="btnCreditos"', '<button id="btnCreditosX"', 'sin botón de créditos'],
  ['css/app.css', 'padding: 10px 14px; min-height: 44px; text-decoration: none;', 'padding: 4px 14px; min-height: 30px; text-decoration: none;', 'pestañas difíciles de tocar'],
];
let vivas = 0, puerto = 8190;
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
  const r = spawnSync('node', ['tests/arbitro-v02-00.mjs'], { cwd: tmp, env: { ...process.env, BASE: `http://localhost:${p}/`, CAPTURAS: path.join(tmp, '_capturas') }, encoding: 'utf8' });
  srv.kill();
  const detectada = r.status !== 0;
  if (!detectada) vivas++;
  console.log(`${detectada ? '✔ detectada' : '✘ VIVA'}: ${nombre}${detectada ? ` (${(r.stdout.match(/✘/g) || []).length} afirmaciones fallaron)` : ''}`);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(vivas ? `\n${vivas} mutación(es) vivas` : `\nLas ${MUTACIONES.length} mutaciones fueron detectadas`);
process.exit(vivas ? 1 : 0);
