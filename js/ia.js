// =====================================================================
// ia.js — Varias inteligencias artificiales "en cascada".
//
// LECCIÓN: una "API" es una puerta para que un programa le pida algo a
// otro por internet. Cada proveedor de IA tiene su puerta y su "llave"
// (API key). Aquí:
//   • El catálogo de IAs vive en config/ia.json (el admin las aprueba).
//   • Si la primera IA falla, se intenta con la siguiente ("cascada").
//   • Si todas fallan, la app responde igual con el buscador local.
//   • Las llaves las pone cada persona y se guardan SOLO en su navegador.
// =====================================================================

const CLAVES = 'deepal-ia-claves';   // nombre del cajón donde se guardan las llaves
const PREFS = 'deepal-ia-prefs';     // qué IAs activó la persona y en qué orden
const enfriando = new Map();         // proveedor → hora hasta la que no se usa (cuota agotada)
const modelosVistos = new Map();     // proveedor → modelos descubiertos

let catalogo = [];

/** Carga el catálogo y deja solo las IAs que el administrador aprobó. */
export async function cargarCatalogo(url = 'config/ia.json') {
  const r = await fetch(url, { cache: 'no-cache' });
  const cfg = await r.json();
  catalogo = cfg.proveedores;
  return cfg;
}
export const proveedores = ({ incluirNoAprobados = false } = {}) =>
  catalogo.filter((p) => incluirNoAprobados || p.aprobado);

// ---------- Llaves (API keys) -----------------------------------------
function leerAlmacen(nombre) {
  for (const s of [sessionStorage, localStorage]) {
    try { const v = JSON.parse(s.getItem(nombre) || 'null'); if (v) return v; } catch { /* sin almacenamiento */ }
  }
  return {};
}
export function obtenerClave(id) { return leerAlmacen(CLAVES)[id] || ''; }
export function claveRecordada(id) {
  try { return !!JSON.parse(localStorage.getItem(CLAVES) || '{}')[id]; } catch { return false; }
}
/**
 * Guarda una llave. Por defecto solo mientras la pestaña esté abierta
 * (sessionStorage). Con `recordar`, también al cerrar (localStorage).
 */
export function guardarClave(id, clave, recordar = false) {
  const limpia = String(clave || '').trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '');
  for (const [s, usar] of [[sessionStorage, true], [localStorage, recordar]]) {
    try {
      const v = JSON.parse(s.getItem(CLAVES) || '{}');
      if (usar && limpia) v[id] = limpia; else delete v[id];
      if (Object.keys(v).length) s.setItem(CLAVES, JSON.stringify(v)); else s.removeItem(CLAVES);
    } catch { /* modo privado */ }
  }
  return limpia;
}
export function borrarTodasLasClaves() {
  for (const s of [sessionStorage, localStorage]) { try { s.removeItem(CLAVES); } catch { /* nada */ } }
}
/** Muestra solo el inicio y el final de una llave: "gsk_••••1234". */
export const enmascarar = (k) => (k ? `${k.slice(0, 4)}••••${k.slice(-4)}` : '');

// ---------- Preferencias: qué IAs usar y en qué orden -------------------
export function leerPrefs() {
  let p = {};
  try { p = JSON.parse(localStorage.getItem(PREFS) || '{}'); } catch { /* nada */ }
  const ids = proveedores().map((x) => x.id);
  const orden = (p.orden || []).filter((id) => ids.includes(id));
  ids.forEach((id) => { if (!orden.includes(id)) orden.push(id); });
  return { orden, activas: p.activas || {}, usarIA: p.usarIA !== false };
}
export function guardarPrefs(p) { try { localStorage.setItem(PREFS, JSON.stringify(p)); } catch { /* nada */ } }

/** ¿Se puede intentar este proveedor ahora? Una sola regla para toda la app. */
export function disponible(p, prefs = leerPrefs()) {
  if (!p.aprobado) return false;
  if ((enfriando.get(p.id) || 0) > Date.now()) return false;
  if (p.api === 'nano') return prefs.activas[p.id] === true && typeof globalThis.LanguageModel !== 'undefined';
  if (p.donde === 'equipo') return prefs.activas[p.id] === true;
  if (!p.sinClave && !obtenerClave(p.id)) return false;
  if (p.sinClave && !obtenerClave(p.id)) return prefs.activas[p.id] === true;
  return prefs.activas[p.id] !== false;
}

// ---------- Errores en lenguaje claro ------------------------------------
class ErrorIA extends Error {
  constructor(tipo, mensaje, extra = {}) { super(mensaje); this.tipo = tipo; Object.assign(this, extra); }
}
function clasificar(status, cuerpo, headers) {
  const txt = String(cuerpo || '').slice(0, 400);
  if (status === 429) return new ErrorIA('cuota', 'Se agotó el cupo gratuito por ahora.', { espera: +(headers?.get?.('retry-after') || 60) });
  if (status === 401 || status === 403) return new ErrorIA('clave', 'La llave no es válida o no tiene permiso.');
  if (status === 404 || /model.*(not.?found|does not exist|decommission|retired)/i.test(txt)) return new ErrorIA('modelo', 'Ese modelo ya no existe.');
  if (status === 400 && /api.?key|credential/i.test(txt)) return new ErrorIA('clave', 'La llave no es válida.');
  if (status >= 500) return new ErrorIA('caido', 'El servicio está caído o saturado.');
  return new ErrorIA('otro', `Respuesta inesperada (${status}). ${txt.slice(0, 120)}`);
}

async function pedir(url, opciones, ms = 35000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { ...opciones, signal: ctl.signal });
    const cuerpo = await r.text();
    if (!r.ok) throw clasificar(r.status, cuerpo, r.headers);
    try { return JSON.parse(cuerpo); } catch { throw new ErrorIA('otro', 'La respuesta no vino en formato JSON.'); }
  } catch (e) {
    if (e instanceof ErrorIA) throw e;
    if (e.name === 'AbortError') throw new ErrorIA('caido', 'Tardó demasiado en responder.');
    throw new ErrorIA('red', 'No hubo conexión (sin internet, o el proveedor no permite llamadas desde páginas web).');
  } finally { clearTimeout(t); }
}

// ---------- Descubrir modelos vigentes ----------------------------------
// Los nombres de modelos cambian seguido. En vez de "quemarlos", se le
// pregunta al proveedor qué modelos tiene y se escoge según preferencias.
async function modelos(p) {
  if (modelosVistos.has(p.id)) return modelosVistos.get(p.id);
  let lista = [...(p.modelos || [])];
  if (p.descubrir) {
    try {
      let nombres = [];
      if (p.api === 'gemini') {
        const j = await pedir(`${p.base}/models?pageSize=200`, { headers: { 'x-goog-api-key': obtenerClave(p.id) } }, 12000);
        nombres = (j.models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent')).map((m) => m.name.replace(/^models\//, ''));
      } else if (p.api === 'openai' || p.api === 'anthropic') {
        const j = await pedir(`${p.base}/models`, { headers: encabezados(p) }, 12000);
        nombres = (j.data || j.models || []).map((m) => m.id || m.name).filter(Boolean);
      }
      const filtro = p.filtroModelos ? new RegExp(p.filtroModelos, 'i') : null;
      if (filtro) nombres = nombres.filter((n) => filtro.test(n));
      const pref = (p.preferir || []).map((x) => new RegExp(x, 'i'));
      const puntos = (n) => { const k = pref.findIndex((re) => re.test(n)); return k < 0 ? 99 : k; };
      nombres.sort((a, b) => puntos(a) - puntos(b));
      lista = [...new Set([...lista.filter((m) => !nombres.length || nombres.includes(m)), ...nombres.filter((n) => puntos(n) < 99)])];
      if (!lista.length) lista = nombres.slice(0, 3);
    } catch (e) {
      if (e.tipo === 'clave' || !lista.length) throw e; // sin modelos de respaldo no hay con qué seguir
    }
  }
  modelosVistos.set(p.id, lista);
  return lista;
}

function encabezados(p) {
  const k = obtenerClave(p.id);
  const h = { 'Content-Type': 'application/json' };
  if (p.api === 'anthropic') {
    Object.assign(h, { 'x-api-key': k, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' });
  } else if (k) h.Authorization = `Bearer ${k}`;
  if (p.id === 'openrouter') { h['HTTP-Referer'] = location.origin; h['X-Title'] = 'Manual practico Deepal'; }
  return h;
}

/** Quita razonamientos (<think>), cercas ``` y espacios sobrantes. */
export function limpiarRespuesta(t) {
  return String(t || '').replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/^```\w*\n?|```$/g, '').trim();
}

// ---------- Una llamada a un proveedor ------------------------------------
async function llamar(p, modelo, { sistema, usuario, json, temperatura = 0.2, maxTokens = 700 }) {
  if (p.api === 'gemini') {
    const cuerpo = {
      systemInstruction: { parts: [{ text: sistema }] },
      contents: [{ role: 'user', parts: [{ text: usuario }] }],
      generationConfig: { temperature: temperatura, maxOutputTokens: maxTokens, ...(json ? { responseMimeType: 'application/json' } : {}) },
    };
    const j = await pedir(`${p.base}/models/${encodeURIComponent(modelo)}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': obtenerClave(p.id) }, body: JSON.stringify(cuerpo),
    });
    return (j.candidates?.[0]?.content?.parts || []).map((x) => x.text || '').join('');
  }
  if (p.api === 'anthropic') {
    const j = await pedir(`${p.base}/messages`, {
      method: 'POST', headers: encabezados(p),
      body: JSON.stringify({ model: modelo, max_tokens: maxTokens, temperature: temperatura, system: sistema, messages: [{ role: 'user', content: usuario }] }),
    });
    return (j.content || []).map((x) => x.text || '').join('');
  }
  if (p.api === 'nano') {
    const opts = { expectedInputs: [{ type: 'text', languages: ['es'] }], expectedOutputs: [{ type: 'text', languages: ['es'] }] };
    const estado = await globalThis.LanguageModel.availability(opts);
    if (estado !== 'available') throw new ErrorIA('equipo', estado === 'unavailable' ? 'Este equipo no puede correr Gemini Nano.' : 'Gemini Nano aún no está descargado: actívalo en Ajustes de IA.');
    const s = await globalThis.LanguageModel.create({ ...opts, initialPrompts: [{ role: 'system', content: sistema }] });
    try { return await s.prompt(usuario); } finally { s.destroy(); }
  }
  // Compatibles con OpenAI: Groq, Mistral, OpenRouter, Hugging Face, Ollama, etc.
  const cuerpo = { model: modelo, temperature: temperatura, max_tokens: maxTokens, messages: [{ role: 'system', content: sistema }, { role: 'user', content: usuario }] };
  if (json && p.jsonModo !== false) cuerpo.response_format = { type: 'json_object' };
  if (p.sinRazonar) Object.assign(cuerpo, p.sinRazonar);
  const j = await pedir(`${p.base}/chat/completions`, { method: 'POST', headers: encabezados(p), body: JSON.stringify(cuerpo) });
  return j.choices?.[0]?.message?.content || '';
}

/**
 * La cascada: prueba cada IA disponible en el orden elegido.
 * @returns {Promise<{texto, proveedor, modelo, intentos}>}
 */
export async function preguntar(peticion, { soloId = null } = {}) {
  const prefs = leerPrefs();
  const lista = soloId ? catalogo.filter((p) => p.id === soloId) : prefs.orden.map((id) => catalogo.find((p) => p.id === id)).filter((p) => p && disponible(p, prefs));
  const intentos = [];
  for (const p of lista) {
    let ms;
    try { ms = await modelos(p); } catch (e) { intentos.push({ proveedor: p.nombre, error: e.message, tipo: e.tipo }); continue; }
    if (!ms.length && p.api !== 'nano') { intentos.push({ proveedor: p.nombre, error: 'No hay modelos disponibles.' }); continue; }
    for (const m of (p.api === 'nano' ? ['gemini-nano'] : ms.slice(0, 3))) {
      try {
        const texto = limpiarRespuesta(await llamar(p, m, peticion));
        if (!texto) throw new ErrorIA('otro', 'Respondió vacío.');
        return { texto, proveedor: p.nombre, modelo: m, intentos };
      } catch (e) {
        intentos.push({ proveedor: p.nombre, modelo: m, error: e.message, tipo: e.tipo });
        if (e.tipo === 'modelo') continue;                 // probar el siguiente modelo
        if (e.tipo === 'cuota') enfriando.set(p.id, Date.now() + (e.espera || 60) * 1000);
        break;                                            // clave, caído o red: siguiente proveedor
      }
    }
  }
  const err = new Error(lista.length ? 'Ninguna IA respondió.' : 'No hay IA configurada.');
  err.intentos = intentos;
  throw err;
}

/** Botón «Probar»: una llamada mínima para saber si la llave funciona. */
export async function probar(id) {
  modelosVistos.delete(id); enfriando.delete(id);
  const r = await preguntar({ sistema: 'Responde solo: ok', usuario: 'Di ok', maxTokens: 10 }, { soloId: id });
  return r;
}

// ---------- ¿Qué IA puede correr este equipo? ------------------------------
export async function revisarEquipo() {
  const out = { webgpu: false, f16: false, memoria: navigator.deviceMemory || null, nano: 'no disponible en este navegador', locales: [] };
  try {
    if (navigator.gpu) {
      const a = await navigator.gpu.requestAdapter();
      out.webgpu = !!a; out.f16 = !!a?.features?.has('shader-f16');
    }
  } catch { /* sin WebGPU */ }
  try {
    if (globalThis.LanguageModel) out.nano = await globalThis.LanguageModel.availability({ expectedInputs: [{ type: 'text', languages: ['es'] }], expectedOutputs: [{ type: 'text', languages: ['es'] }] });
  } catch { out.nano = 'no disponible'; }
  for (const p of catalogo.filter((x) => x.donde === 'equipo' && x.api === 'openai')) {
    try { await pedir(`${p.base}/models`, {}, 1500); out.locales.push(p.nombre); } catch { /* no está abierto */ }
  }
  return out;
}

/** Descarga Gemini Nano (requiere un clic de la persona). */
export async function descargarNano(alProgreso) {
  const s = await globalThis.LanguageModel.create({
    expectedInputs: [{ type: 'text', languages: ['es'] }], expectedOutputs: [{ type: 'text', languages: ['es'] }],
    monitor(m) { m.addEventListener('downloadprogress', (e) => alProgreso?.(e.loaded)); },
  });
  s.destroy();
}

// ---------- Leer JSON que devuelve una IA, con tolerancia -------------------
/** Toma el primer objeto {...} bien balanceado de un texto. */
export function extraerJSON(texto) {
  const t = limpiarRespuesta(texto);
  try { return JSON.parse(t); } catch { /* sigue */ }
  const ini = t.indexOf('{');
  if (ini < 0) return null;
  let nivel = 0, enCadena = false, escape = false;
  for (let i = ini; i < t.length; i++) {
    const c = t[i];
    if (enCadena) { if (escape) escape = false; else if (c === '\\') escape = true; else if (c === '"') enCadena = false; continue; }
    if (c === '"') enCadena = true;
    else if (c === '{') nivel++;
    else if (c === '}' && --nivel === 0) { try { return JSON.parse(t.slice(ini, i + 1)); } catch { return null; } }
  }
  return null;
}
