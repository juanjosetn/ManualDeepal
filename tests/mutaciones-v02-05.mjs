// Mutaciones de la versión v02.05 (tips contrastados con el manual de la S05 Max, en inglés):
// siembra un defecto por vez en una copia y comprueba que tests/arbitro-v02-05.mjs lo detecta.
// Si existe el PDF (variable MANUAL_S05_MAX), el árbitro revisa además cada página citada.
// Uso: MANUAL_S05_MAX=/ruta/al/manual.pdf node tests/mutaciones-v02-05.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TJ = 'data/tips.json';
const MUTACIONES = [
  [TJ, 'Está en los manuales de la S07 Max y de las dos S05.', 'Está en los manuales de la S07 Max y de la S05 eléctrica; en la S05 Max confírmalo en el taller.', 'vuelve un «en la S05 Max confírmalo»'],
  [TJ, '"cuando": "Cada vez que tanquees."', '"cuando": "Every time you refuel the vehicle."', 'se cuela una frase en inglés'],
  [TJ, 'manual S05 Max (PDF p. 189)', 'manual S05 Max (PDF p. 198)', 'una cita apunta a una página que no dice eso'],
  [TJ, 'S05: carga al 100 % en carga lenta al menos una vez a la semana', 'S05: carga al 100 % en carga lenta (la eléctrica, cada semana)', 'la carga semanal vuelve a ser solo de la eléctrica'],
  [TJ, ' Pide al taller, por escrito, cuál exige la garantía de tu carro.', '', 'el tip de la gasolina deja de pedir la respuesta del taller por escrito'],
  [TJ, 'Usa 0W-16 de calidad SP/GF-6', 'Usa 5W-30 de calidad SP/GF-6', 'aceite equivocado en el plan de la Max'],
  [TJ, 'Bujías: después de 30.000 km recorridos', 'Bujías: después de 20.000 km recorridos', 'intervalo de bujías equivocado'],
  [TJ, ' (el manual pide un lugar abierto y ventilado)', '', 'la carga de aparcamiento pierde el aviso de lugar ventilado'],
  [TJ, '"id": "s05-max-para-tanquear-desbloquea-la-tapa-en-la-pantalla"', '"id": "s05-max-para-tanquear"', 'el tip de tanquear cambia de identificador'],
  [TJ, 'El plan de la S05 Max (rango extendido) está en el tip siguiente.', 'No se tuvo el manual de la S05 Max (rango extendido): para su motor a gasolina, pregunta el plan en el taller.', 'vuelve el «no se tuvo el manual de la S05 Max»'],
  [TJ, 'S05 Max (rango extendido): LFP de 27,28 kWh. S05 E-Max', 'S05 Max (rango extendido): LFP de 27,28 kWh según la prensa del lanzamiento en Colombia. S05 E-Max', 'la capacidad de la Max vuelve a citar la prensa'],
];
let vivas = 0, puerto = 8990;
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
  const r = spawnSync('node', ['tests/arbitro-v02-05.mjs'], { cwd: tmp, env: { ...process.env, BASE: `http://localhost:${p}/`, CAPTURAS: path.join(tmp, '_capturas') }, encoding: 'utf8' });
  srv.kill();
  const detectada = r.status !== 0;
  if (!detectada) vivas++;
  const n = (r.stdout.match(/✘/g) || []).length;
  console.log(`${detectada ? '✔ detectada' : '✘ VIVA'}: ${nombre}${detectada ? (n ? ` (${n} afirmaciones fallaron)` : ` (el árbitro se detuvo: ${(r.stderr || '').split('\n').find((l) => l.trim()) || 'sin detalle'})`) : ''}`);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(vivas ? `\n${vivas} mutación(es) vivas` : `\nLas ${MUTACIONES.length} mutaciones fueron detectadas`);
process.exit(vivas ? 1 : 0);
