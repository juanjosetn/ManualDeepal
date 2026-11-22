// =====================================================================
// apoyo-comunidad.mjs — Conecta una página de Playwright con el simulador
// del Apps Script (tests/gas-simulador.mjs), sin internet.
//   - Reescribe config/sitio.json para poner una dirección /exec de prueba.
//   - Responde las llamadas a script.google.com con el simulador.
// Así se prueba la app completa (estrellas, formularios, moderación) igual
// que si el Apps Script estuviera publicado.
// =====================================================================
import { crearGAS } from './gas-simulador.mjs';

export const URL_PRUEBA = 'https://script.google.com/macros/s/AKfycbPRUEBA_simulada_000/exec';
export const CLAVE_PRUEBA = 'clave-de-prueba-larga';

export function nuevoServicio() {
  const g = crearGAS();
  g.ctx.fijarClaveAdmin_(CLAVE_PRUEBA);
  return g;
}

/** Siembra calificaciones: [[contactoId, estrellas, comentario?], ...] (cada una desde un equipo distinto). */
export function sembrar(g, lista) {
  lista.forEach(([id, e, t = ''], i) => {
    const r = g.post({ accion: 'calificar', contactoId: id, estrellas: e, comentario: t, dispositivo: `semilla${String(i).padStart(4, "0")}${"0".repeat(12)}`, reqId: `semilla-${i}-${id}` });
    if (!r.ok) throw new Error(`semilla ${id}: ${r.error.mensaje}`);
    if (t) g.post({ accion: 'admin_moderar', clave: CLAVE_PRUEBA, tipo: 'opinion', reqId: `semilla-${i}-${id}`, estado: 'publicado' });
  });
}

/**
 * Conecta el contexto del navegador. `opciones.caido = true` simula el servicio sin respuesta.
 * Devuelve el registro de llamadas para comprobar qué salió.
 */
export async function conectar(contexto, g, opciones = {}) {
  const llamadas = [];
  await contexto.route('**/config/sitio.json', async (route) => {
    const r = await route.fetch();
    const j = await r.json();
    j.comunidad = { ...(j.comunidad || {}), servicio: opciones.url ?? URL_PRUEBA };
    await route.fulfill({ response: r, body: JSON.stringify(j), headers: { 'content-type': 'application/json' } });
  });
  await contexto.route('https://script.google.com/**', async (route) => {
    const req = route.request();
    llamadas.push({ metodo: req.method(), url: req.url(), cuerpo: req.postData(), tipo: req.headers()['content-type'] || '' });
    if (opciones.caido) return route.abort('internetdisconnected');
    const u = new URL(req.url());
    const salida = req.method() === 'POST' ? g.post(req.postData() || '') : g.get(Object.fromEntries(u.searchParams));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(salida), headers: { 'access-control-allow-origin': '*' } });
  });
  return llamadas;
}

/**
 * Desde v02.03 el panel pide usuario y contraseña. Con el servicio de prueba, el usuario «admin»
 * entra con la clave antigua (CLAVE_PRUEBA): es la misma migración que hará el administrador real.
 * `seccion` abre una sección del panel (p. ej. 'opiniones').
 */
export async function entrarPanel(p, { usuario = 'admin', clave = CLAVE_PRUEBA, seccion = '' } = {}) {
  await p.waitForSelector('#formIngreso', { timeout: 10000 });
  await p.fill('#inUsuario', usuario); await p.fill('#inClave', clave); await p.click('#btnEntrar');
  await p.waitForSelector('#navPanel button', { timeout: 10000 });
  if (seccion) await p.click(`#navPanel [data-sec="${seccion}"]`);
}
