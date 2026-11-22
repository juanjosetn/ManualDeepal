// Mutaciones de la versión v02.04 (tips contrastados con el manual de la S05): siembra un defecto
// por vez en una copia y comprueba que tests/arbitro-v02-04.mjs lo detecta.
// Si existe el PDF (variable MANUAL_S05), el árbitro revisa además cada página citada.
// Uso: MANUAL_S05=/ruta/al/manual.pdf node tests/mutaciones-v02-04.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TJ = 'data/tips.json';
const MUTACIONES = [
  [TJ, '"confianza": "oficial",\n   "verificacion": "Confirmado con el manual de la S05 eléctrica', '"confianza": "consenso",\n   "verificacion": "Confirmado con el manual de la S05 eléctrica', 'los 41 PSI vuelven a «consenso» aunque el manual los confirma'],
  [TJ, 'al menos una vez a la semana si usas el carro con frecuencia', 'una vez al mes', 'se pierde la carga semanal de la S05 eléctrica'],
  [TJ, '"id": "usa-el-carro-como-toma-de-220-v-v2l"', '"id": "usa-el-carro-como-toma-de-220-v"', 'el tip V2L cambia de identificador'],
  [TJ, 'manual S05 eléctrica (PDF p. 185)', 'manual S05 eléctrica (PDF p. 158)', 'una cita apunta a una página que no dice eso'],
  [TJ, 'S05: Centro del vehículo > Mantenimiento de seguridad > Modo de remolque', 'S05: búscalo en la pantalla', 'el modo de remolque pierde la ruta de la S05'],
  [TJ, 'en la S05 se enrosca abajo a la derecha del bumper delantero, tras quitar la tapita.', 'manual S05: pág. 213.', 'vuelve la página equivocada de la grúa'],
  [TJ, 'S05 E-Max (eléctrica): LFP de 56,12 kWh', 'S05 E-Max (eléctrica): LFP de CATL', 'la química de la E-Max pierde su capacidad'],
  [TJ, '"version": "2026.11.22"', '"version": "2026.11.21"', 'la versión de los datos no cambia'],
  [TJ, 'El arrancador en ese puerto no puede quedarse más de 30 segundos', 'El arrancador en ese puerto puede quedarse el tiempo que haga falta', 'se pierde el límite de 30 segundos'],
  ['js/app.js', " || !Array.isArray(d.tips?.tips) || !Array.isArray(d.directorio?.contactos)) return;", ') return;', 'una respuesta incompleta de la hoja borra los tips del manual'],
  ['guias/manual-s05.pdf', null, '%PDF-1.4 copia del manual', 'el manual del fabricante se sube al repositorio'],
];
let vivas = 0, puerto = 8890;
for (const [archivo, viejo, nuevo, nombre] of MUTACIONES) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mut-'));
  fs.cpSync(RAIZ, tmp, { recursive: true, filter: (s) => !s.includes('node_modules') });
  fs.symlinkSync(path.join(RAIZ, 'node_modules'), path.join(tmp, 'node_modules'));
  const f = path.join(tmp, archivo);
  const txt = viejo === null ? '' : fs.readFileSync(f, 'utf8');
  if (viejo !== null && !txt.includes(viejo)) { console.log(`?? no se pudo sembrar: ${nombre}`); vivas++; fs.rmSync(tmp, { recursive: true, force: true }); continue; }
  fs.writeFileSync(f, viejo === null ? nuevo : txt.replace(viejo, nuevo));
  const p = ++puerto;
  const srv = spawn('python3', ['-m', 'http.server', String(p)], { cwd: tmp, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1200));
  const r = spawnSync('node', ['tests/arbitro-v02-04.mjs'], { cwd: tmp, env: { ...process.env, BASE: `http://localhost:${p}/`, CAPTURAS: path.join(tmp, '_capturas') }, encoding: 'utf8' });
  srv.kill();
  const detectada = r.status !== 0;
  if (!detectada) vivas++;
  const n = (r.stdout.match(/✘/g) || []).length;
  console.log(`${detectada ? '✔ detectada' : '✘ VIVA'}: ${nombre}${detectada ? (n ? ` (${n} afirmaciones fallaron)` : ` (el árbitro se detuvo: ${(r.stderr || '').split('\n').find((l) => l.trim()) || 'sin detalle'})`) : ''}`);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(vivas ? `\n${vivas} mutación(es) vivas` : `\nLas ${MUTACIONES.length} mutaciones fueron detectadas`);
process.exit(vivas ? 1 : 0);
