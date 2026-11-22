// Pruebas de la cascada de IA con un "fetch" falso (no sale nada a internet).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

class Almacen { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } }
globalThis.localStorage = new Almacen(); globalThis.sessionStorage = new Almacen();
globalThis.location = { origin: 'https://ejemplo.github.io' };
const cfg = JSON.parse(fs.readFileSync(new URL('../config/ia.json', import.meta.url), 'utf8'));
let guion = [];   // respuestas falsas en orden
let llamadas = [];
globalThis.fetch = async (url, op = {}) => {
  llamadas.push(String(url));
  if (String(url).endsWith('config/ia.json')) return new Response(JSON.stringify(cfg));
  if (/\/models(\?|$)/.test(url)) return new Response('{}', { status: 500 }); // sin descubrimiento
  const r = guion.shift();
  if (!r) return new Response('{}', { status: 500 });
  if (r === 'red') throw new TypeError('Failed to fetch');
  return new Response(JSON.stringify(r.json || {}), { status: r.status || 200, headers: r.headers || {} });
};
const IA = await import('../js/ia.js');
await IA.cargarCatalogo('config/ia.json');
const ok = (t) => ({ json: { choices: [{ message: { content: t } }] } });

beforeEach(() => {
  guion = []; llamadas = [];
  globalThis.localStorage = new Almacen(); globalThis.sessionStorage = new Almacen();
});

test('sin llaves no hay IA disponible (las que corren en el equipo piden activarse)', async () => {
  await assert.rejects(IA.preguntar({ sistema: 's', usuario: 'u' }), /No hay IA configurada/);
  assert.equal(llamadas.length, 0, 'no debe llamar a nadie');
});

test('cascada: cuota agotada en Groq → responde Mistral', async () => {
  IA.guardarClave('groq', 'gsk_prueba1234567890'); IA.guardarClave('mistral', 'm123456789');
  const p = IA.leerPrefs(); p.orden = ['groq', 'mistral', ...p.orden.filter((x) => !['groq', 'mistral'].includes(x))]; IA.guardarPrefs(p);
  guion = [{ status: 429, headers: { 'retry-after': '30' } }, ok('Respuesta de Mistral')];
  const r = await IA.preguntar({ sistema: 's', usuario: 'u' });
  assert.equal(r.proveedor, 'Mistral (plan Experiment)');
  assert.equal(r.intentos[0].tipo, 'cuota');
  // Groq queda "enfriando": la siguiente pregunta va directo a Mistral
  guion = [ok('otra')];
  const r2 = await IA.preguntar({ sistema: 's', usuario: 'u' });
  assert.equal(r2.proveedor, 'Mistral (plan Experiment)');
});

test('modelo retirado (404) → prueba el siguiente modelo del MISMO proveedor', async () => {
  IA.guardarClave('huggingface', 'hf_prueba1234567');
  const p = IA.leerPrefs(); p.orden = ['huggingface', ...p.orden.filter((x) => x !== 'huggingface')]; IA.guardarPrefs(p);
  guion = [{ status: 404, json: { error: 'model not found' } }, ok('hola')];
  const r = await IA.preguntar({ sistema: 's', usuario: 'u' });
  assert.equal(r.modelo, 'Qwen/Qwen2.5-72B-Instruct');
});

test('llave inválida (401) → NO reintenta ese proveedor, pasa al siguiente', async () => {
  IA.guardarClave('cerebras', 'csk-mala'); IA.guardarClave('mistral', 'm-buena');
  const p = IA.leerPrefs(); p.orden = ['cerebras', 'mistral', ...p.orden.filter((x) => !['cerebras', 'mistral'].includes(x))]; IA.guardarPrefs(p);
  guion = [{ status: 401 }, 'red'];
  const e = await IA.preguntar({ sistema: 's', usuario: 'u' }).catch((x) => x);
  assert.equal(e.intentos.length, 2);
  assert.equal(e.intentos[0].tipo, 'clave');
  assert.equal(e.intentos[1].tipo, 'red');
});

test('si no se pueden descubrir modelos y no hay de respaldo, se informa el motivo', async () => {
  IA.guardarClave('openrouter', 'sk-or-x');
  const p = IA.leerPrefs(); p.orden = ['openrouter', ...p.orden.filter((x) => x !== 'openrouter')]; IA.guardarPrefs(p);
  const e = await IA.preguntar({ sistema: 's', usuario: 'u' }).catch((x) => x);
  assert.equal(e.intentos[0].tipo, 'caido');
});

test('las IAs de pago no aprobadas nunca se llaman aunque haya llave', async () => {
  IA.guardarClave('openai', 'sk-pago');
  await assert.rejects(IA.preguntar({ sistema: 's', usuario: 'u' }));
  assert.ok(!llamadas.some((u) => u.includes('openai.com')));
});

test('las llaves se limpian y se enmascaran; "no recordar" no deja nada en localStorage', () => {
  const k = IA.guardarClave('groq', '  "Bearer gsk_abcdefgh1234"  ');
  assert.equal(k, 'gsk_abcdefgh1234');
  assert.equal(IA.enmascarar(k), 'gsk_••••1234');
  assert.equal(localStorage.getItem('deepal-ia-claves'), null);
  IA.guardarClave('groq', k, true);
  assert.match(localStorage.getItem('deepal-ia-claves'), /gsk_/);
  IA.borrarTodasLasClaves();
  assert.equal(IA.obtenerClave('groq'), '');
});

test('extraerJSON tolera cercas, texto extra y razonamiento', () => {
  assert.deepEqual(IA.extraerJSON('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(IA.extraerJSON('<think>bla {x}</think>Aquí va: {"t":"llave {rara}","n":[1]} fin'), { t: 'llave {rara}', n: [1] });
  assert.equal(IA.extraerJSON('nada'), null);
});

test('disponible(): una IA sin aprobar nunca está disponible, aunque tenga llave y esté activa', () => {
  IA.guardarClave('gemini', 'AQ.x');
  const g = IA.proveedores().find((p) => p.id === 'gemini');
  assert.equal(IA.disponible(g), true);
  assert.equal(IA.disponible({ ...g, aprobado: false }), false);
});
