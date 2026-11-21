// Pruebas automáticas (sin navegador). Ejecuta:  node --test tests/
// LECCIÓN: una prueba es un pequeño programa que comprueba que otro
// funciona. Si alguien cambia el buscador y lo daña, la prueba falla.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { crearBuscador, resaltar } from '../js/buscador.js';
import { normalizar, escaparHTML, distancia } from '../js/texto.js';
import { leerChat, anonimizar, crearAlias, leerZip, leerVcf, buscarCandidatos } from '../js/chat.js';

const leer = (r) => JSON.parse(fs.readFileSync(new URL(r, import.meta.url), 'utf8'));
const TIPS = leer('../data/tips.json').tips;
const DIR = leer('../data/directorio.json').contactos;
const CAT = leer('../data/catalogos.json');
const IA = leer('../config/ia.json');
const busca = crearBuscador(TIPS, { titulo: 6, claves: 4, como: 2, saber: 2, cuando: 1.2, ojo: 1.2 });
const top = (q) => busca.buscar(q).resultados.map((r) => r.item.id);

test('texto: normaliza tildes y escapa HTML', () => {
  assert.equal(normalizar('Presión ÑANDÚ'), 'presion nandu');
  assert.equal(escaparHTML('<img onerror=x>"'), '&lt;img onerror=x&gt;&quot;');
  assert.equal(distancia('bateira', 'bateria'), 1);
});

test('buscador: menos de 3 letras no busca', () => {
  assert.equal(busca.buscar('pr').corta, true);
  assert.equal(busca.buscar('  a ').corta, true);
  assert.ok(busca.buscar('pre').resultados.length > 0);
});

test('buscador: prefijos mientras se escribe', () => {
  for (const q of ['pres', 'presi', 'presion']) assert.ok(top(q).some((id) => id.startsWith('s07-39-psi')), q);
});

test('buscador: sinónimos y errores de digitación', () => {
  assert.ok(busca.buscar('neumaticos').resultados.length >= 5, 'neumático → llanta');
  assert.ok(busca.buscar('bateira').resultados.length >= 3, 'error de digitación');
  assert.ok(top('resetear la pantalla').slice(0, 3).some((id) => id.includes('reiniciar')));
});

test('buscador: lo más relevante primero', () => {
  assert.match(top('s07 psi')[0], /^s07-39-psi/);
  assert.match(top('grua')[0], /grua|remolque/);
  assert.match(top('bajada 100')[0], /regenerativo|bajada/);
});

test('buscador: sugiere cuando no hay resultados', () => {
  assert.equal(busca.buscar('xqzwv').resultados.length, 0);
  assert.equal(busca.sugerir('regenarcion'), 'regeneracion');
});

test('resaltar no deja pasar HTML', () => {
  const h = resaltar('<b>Presión</b> de llantas', new Set(['presion']), escaparHTML);
  assert.ok(!h.includes('<b>'));
  assert.ok(h.includes('<mark>Presión</mark>'));
});

test('directorio: buscar Morato', () => {
  const b = crearBuscador(DIR, { nombre: 5, servicio: 3, ciudad: 3, nota: 2 });
  assert.ok(b.buscar('morato').resultados.length >= 2);
});

test('datos: tips válidos y únicos', () => {
  const ids = new Set();
  const cats = new Set(CAT.categorias.map((c) => c.id));
  for (const t of TIPS) {
    assert.ok(!ids.has(t.id), `id repetido ${t.id}`); ids.add(t.id);
    assert.ok(cats.has(t.cat), t.id);
    assert.ok(['oficial', 'consenso', 'reporte', 'disputa'].includes(t.confianza), t.id);
    assert.ok(t.tipo === 'saber' ? t.saber : t.como, `sin contenido ${t.id}`);
    assert.ok(t.fuentes.length, `sin fuente ${t.id}`);
    if (t.confianza === 'oficial') assert.ok(t.fuentes.some((f) => f.tipo === 'manual' || f.tipo === 'web'), `oficial sin manual ${t.id}`);
  }
});

test('datos: correcciones de la verificación siguen en pie', () => {
  const t = (id) => TIPS.find((x) => x.id.startsWith(id));
  assert.match(t('s07-39-psi').como, /2,7 bar/);
  assert.ok(!TIPS.some((x) => /S07 NMC/.test(x.titulo)));
  assert.ok(!TIPS.some((x) => /serviría de forma temporal en la S05/.test(x.ojo)));
  assert.ok(TIPS.some((x) => /100 %.*regenerativo|regenerativo.*100 %/.test(x.titulo)));
});

test('datos: teléfonos del directorio bien formados', () => {
  for (const d of DIR) if (d.telefono) assert.match(d.telefono.replace(/\s/g, ''), /^\+57(3\d{9}|60\d{8})$/, d.nombre);
});

test('config IA: sin llaves escritas y pagos sin aprobar por defecto', () => {
  const txt = JSON.stringify(IA);
  assert.ok(!/(gsk_|sk-or-|AIza|AQ\.)[A-Za-z0-9_-]{10,}/.test(txt), 'hay algo parecido a una llave');
  for (const p of IA.proveedores) {
    for (const k of ['id', 'nombre', 'costo', 'api', 'alta']) assert.ok(p[k] !== undefined, `${p.id} sin ${k}`);
    if (p.costo === 'pago') assert.equal(p.aprobado, false, p.id);
  }
});

test('chat: lee Android, iPhone y mensajes de varias líneas', () => {
  const m = leerChat(fs.readFileSync(new URL('./fixtures/chat-ejemplo.txt', import.meta.url), 'utf8'));
  assert.equal(m.length, 6); // el multimedia se descarta
  assert.match(m[3].texto, /mal parqueada/);
  const ios = leerChat('[2/11/26, 7:10:05 p. m.] Ana: hola\n[2/11/26, 7:11:00 p. m.] Beto: qué tal');
  assert.equal(ios.length, 2); assert.equal(ios[0].fecha.getHours(), 19);
});

test('chat: anonimiza datos personales y conserva cifras técnicas', () => {
  const m = leerChat(fs.readFileSync(new URL('./fixtures/chat-ejemplo.txt', import.meta.url), 'utf8'));
  const a = crearAlias(m);
  const todo = m.map((x) => anonimizar(x.texto, a)).join('\n');
  for (const prohibido of ['carla@example.com', 'ABC123', '3000000002', 'Ana', 'Carla']) assert.ok(!todo.includes(prohibido), prohibido);
  for (const ok of ['39 psi', '2,7 bar', '270 kPa', '45 psi']) assert.ok(todo.includes(ok), ok);
  assert.equal(anonimizar('Son 10.000 km y 32 A, llama al +57 310 123 4567'), 'Son 10.000 km y 32 A, llama al [tel]');
});

test('chat: lee el ZIP exportado y los contactos', async () => {
  const buf = fs.readFileSync(new URL('./fixtures/chat-ejemplo.zip', import.meta.url));
  const arch = await leerZip(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  assert.equal(arch.length, 2);
  const vcf = leerVcf(new TextDecoder().decode(arch.find((x) => x.nombre.endsWith('.vcf')).datos));
  assert.equal(vcf.nombre, 'Taller Ejemplo Eléctricos'); assert.match(vcf.telefono, /300 0000009/);
});

test('chat: encuentra la conversación de presión como candidata', () => {
  const m = leerChat(fs.readFileSync(new URL('./fixtures/chat-ejemplo.txt', import.meta.url), 'utf8'));
  const cats = CAT.categorias.map((c) => ({ id: c.id, nombre: c.nombre, palabras: TIPS.filter((t) => t.cat === c.id).flatMap((t) => t.claves.split(' ')) }));
  const c = buscarCandidatos(m, cats);
  assert.equal(c[0].categoria, 'llantas');
  assert.ok(c[0].autores >= 3);
});
