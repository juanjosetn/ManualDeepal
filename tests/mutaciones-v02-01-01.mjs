// Mutaciones de la versión v02.01.01 (las calificaciones de 1 estrella no cuentan): siembra un
// defecto por vez en una copia y comprueba que tests/arbitro-v02-01-01.mjs lo detecta.
// Uso: node tests/mutaciones-v02-01-01.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MUTACIONES = [
  ['apps-script/Codigo.gs', "    if (!cuenta_(e)) return; // 1 estrella: queda en la hoja, no en el resumen público\n", '', 'las de 1 estrella cuentan en el resumen'],
  ['apps-script/Codigo.gs', 'var ESTRELLAS_MINIMAS_QUE_CUENTAN = 2;', 'var ESTRELLAS_MINIMAS_QUE_CUENTAN = 1;', 'umbral de la regla en 1'],
  ['apps-script/Codigo.gs', "    if (tipo === 'CALIFICACIONES' && d.estado === 'publicado' && !cuenta_(f.estrellas)) throw error_('DATOS', 'Las calificaciones de 1 estrella no se publican ni cuentan.');\n", '', 'se puede publicar el texto de 1 estrella'],
  ['apps-script/Codigo.gs', 'estrellas: Number(f.estrellas), cuenta: cuenta_(f.estrellas), recomienda: f.recomienda, comentario: f.comentario, fecha: f.fecha', 'estrellas: Number(f.estrellas), recomienda: f.recomienda, comentario: f.comentario, fecha: f.fecha', 'el panel no sabe cuáles no cuentan'],
  ['js/app.js', "`¡Gracias! Recibimos tu calificación.", "`¡Gracias! Tu calificación ya cuenta.", 'mensaje que promete que cuenta'],
];
let vivas = 0, puerto = 8490;
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
  const r = spawnSync('node', ['tests/arbitro-v02-01-01.mjs'], { cwd: tmp, env: { ...process.env, BASE: `http://localhost:${p}/`, CAPTURAS: path.join(tmp, '_capturas') }, encoding: 'utf8' });
  srv.kill();
  const detectada = r.status !== 0;
  if (!detectada) vivas++;
  console.log(`${detectada ? '✔ detectada' : '✘ VIVA'}: ${nombre}${detectada ? ` (${(r.stdout.match(/✘/g) || []).length} afirmaciones fallaron)` : ''}`);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(vivas ? `\n${vivas} mutación(es) vivas` : `\nLas ${MUTACIONES.length} mutaciones fueron detectadas`);
process.exit(vivas ? 1 : 0);
