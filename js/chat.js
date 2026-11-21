// =====================================================================
// chat.js — Leer el chat exportado de WhatsApp, anonimizarlo y encontrar
// conversaciones que podrían convertirse en tips nuevos.
//
// LECCIÓN: todo esto corre DENTRO del navegador del administrador.
// El chat nunca se sube a ningún servidor ni a GitHub: solo los tips que
// el administrador aprueba. (Ley 1581 de 2012: datos personales.)
// =====================================================================
import { normalizar, tokenizar, PALABRAS_VACIAS } from './texto.js';

// ---------- 1. Leer el archivo ZIP (sin librerías) -------------------
// Un ZIP es una lista de archivos comprimidos. Al final tiene un
// "directorio central" que dice dónde empieza cada archivo.
// DecompressionStream('deflate-raw') ya viene en los navegadores modernos.

/** @returns {Promise<Array<{nombre:string, datos:Uint8Array}>>} */
export async function leerZip(buffer) {
  const v = new DataView(buffer);
  const u8 = new Uint8Array(buffer);
  // Buscar el final del directorio central (firma 0x06054b50) desde el final
  let fin = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--) {
    if (v.getUint32(i, true) === 0x06054b50) { fin = i; break; }
  }
  if (fin < 0) throw new Error('No parece un ZIP válido.');
  const total = v.getUint16(fin + 10, true);
  let p = v.getUint32(fin + 16, true);
  const archivos = [];
  for (let k = 0; k < total; k++) {
    if (v.getUint32(p, true) !== 0x02014b50) break;
    const metodo = v.getUint16(p + 10, true);
    const tamComp = v.getUint32(p + 20, true);
    const lenNombre = v.getUint16(p + 28, true);
    const lenExtra = v.getUint16(p + 30, true);
    const lenCom = v.getUint16(p + 32, true);
    const local = v.getUint32(p + 42, true);
    const nombre = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + lenNombre));
    p += 46 + lenNombre + lenExtra + lenCom;
    if (nombre.endsWith('/')) continue;
    if (tamComp > 60 * 1024 * 1024) continue; // protección: nada de archivos gigantes
    const lnNom = v.getUint16(local + 26, true), lnExt = v.getUint16(local + 28, true);
    const ini = local + 30 + lnNom + lnExt;
    const comp = u8.subarray(ini, ini + tamComp);
    let datos;
    if (metodo === 0) datos = comp;
    else if (metodo === 8) datos = new Uint8Array(await new Response(new Blob([comp]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    else continue;
    archivos.push({ nombre, datos });
  }
  return archivos;
}

// ---------- 2. Entender las líneas del chat ---------------------------
// Android (español): "27/4/2026, 5:20 p. m. - Autor: mensaje"
// iPhone:            "[27/4/26, 5:20:11 p. m.] Autor: mensaje"
const RE_ANDROID = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),? (\d{1,2}):(\d{2})(?::\d{2})?\s*([ap])?\.?\s*\.?\s*m?\.?\s*[-–] ([^:]{1,80}?): ([\s\S]*)$/i;
const RE_IOS = /^\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),? (\d{1,2}):(\d{2})(?::\d{2})?\s*([ap])?\.?\s*\.?\s*m?\.?\]\s*([^:]{1,80}?): ([\s\S]*)$/i;
const RE_SISTEMA = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),? \d{1,2}:\d{2}/;

function aFecha(d, m, a, h, min, ampm) {
  let anio = +a; if (anio < 100) anio += 2000;
  let hora = +h;
  if (ampm) { const pm = ampm.toLowerCase() === 'p'; if (pm && hora < 12) hora += 12; if (!pm && hora === 12) hora = 0; }
  return new Date(anio, +m - 1, +d, hora, +min);
}

/**
 * Convierte el texto del chat en una lista de mensajes.
 * Las líneas que no empiezan con fecha son continuación del mensaje anterior.
 * @returns {Array<{fecha:Date, autor:string, texto:string}>}
 */
export function leerChat(texto) {
  const lineas = texto.replace(/\r\n?/g, '\n').replace(/[\u200e\u200f\u202a-\u202e]/g, '').replace(/\s*<Se editó este mensaje\.?>|\s*<This message was edited>/gi, '').split('\n');
  const msgs = [];
  for (const l of lineas) {
    let m = RE_ANDROID.exec(l), ios = false;
    if (!m) { m = RE_IOS.exec(l); ios = !!m; }
    if (m) {
      const [, d, mes, a, h, min, ampm, autor, txt] = m;
      msgs.push({ fecha: aFecha(d, mes, a, h, min, ampm), autor: autor.trim(), texto: txt });
      void ios;
    } else if (RE_SISTEMA.test(l)) {
      continue; // aviso del sistema ("X se unió", "cifrado de extremo a extremo")
    } else if (msgs.length) {
      msgs[msgs.length - 1].texto += '\n' + l;
    }
  }
  return msgs.filter((x) => !/^<multimedia omitido>$|^se eliminó este mensaje\.?$|^null$|^<media omitted>$/i.test(x.texto.trim()));
}

// ---------- 3. Anonimizar ---------------------------------------------
/**
 * Quita datos personales: teléfonos, correos, @usuarios, placas, números
 * de documento y los nombres de quienes escriben. Las cifras técnicas
 * (41 PSI, 10.000 km, 32 A) se conservan.
 * @param {string} s texto
 * @param {Map<string,string>} alias autor → "Propietario N"
 */
export function anonimizar(s, alias = new Map()) {
  let t = String(s);
  t = t.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[correo]');
  t = t.replace(/@\u2068[^\u2069]{1,80}\u2069/g, '[usuario]'); // menciones "@\u2068Nombre Apellido\u2069"
  t = t.replace(/@[~+\w.À-ſ]{2,40}/g, '[usuario]');
  t = t.replace(/[\u2066-\u2069]/g, '');
  t = t.replace(/\+\s?\d{1,3}[\s\u00a0-]?\(?\d{1,4}\)?(?:[\s\u00a0-]?\d{2,4}){2,4}/g, '[tel]');
  t = t.replace(/\b(?:3\d{2}|60\d)[\s\u00a0-]?\d{3}[\s\u00a0-]?\d{4}\b/g, '[tel]');
  t = t.replace(/\b[A-Z]{3}[\s-]?\d{3}\b|\b[A-Z]{3}[\s-]?\d{2}[A-Z]\b/g, '[placa]');
  t = t.replace(/\b\d{1,3}(?:\.\d{3}){2,}\b(?!\s*(km|kw|kwh|pesos|cop|\$|mil))/gi, '[número]');
  t = t.replace(/\d{8,}(?!\s*(km|kw|kwh|pesos))/gi, '[número]');
  t = t.replace(/https?:\/\/(chat\.whatsapp\.com|wa\.me)\/\S+/gi, '[enlace privado]');
  t = t.replace(/\S+\.vcf\b(?: \(archivo adjunto\))?/gi, '[contacto]');
  for (const [nombre, a] of alias) {
    const limpio = nombre.replace(/^~\s*/, '').trim();
    if (limpio.length < 3 || /^\+?\d/.test(limpio)) continue;
    const primero = limpio.split(/\s+/)[0];
    const partes = [limpio, primero.length >= 4 ? primero : null].filter(Boolean);
    for (const p of partes) t = t.replace(new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), a);
  }
  return t;
}

/** Asigna "Propietario 1, 2, 3…" a cada autor, en orden de aparición. */
export function crearAlias(mensajes) {
  const alias = new Map();
  for (const m of mensajes) if (!alias.has(m.autor)) alias.set(m.autor, `Propietario ${alias.size + 1}`);
  return alias;
}

// ---------- 4. Encontrar conversaciones útiles ------------------------
const SENALES_UTILES = /\b(psi|bar|kw|kwh|km|amp|amperios|%|voltios|110|220|manual|taller|revision|garantia|paso|configur|menu|ajuste|boton|pantalla|recomiend|solucion|funciono|me paso|ojo|cuidado|truco|tip)\b/;

/**
 * Agrupa los mensajes en conversaciones (si pasan más de `pausaMin`
 * minutos sin mensajes, empieza otra) y las puntúa.
 * @param {Array} mensajes  de leerChat()
 * @param {Array} categorias [{id, nombre, palabras:[...]}]
 */
export function buscarCandidatos(mensajes, categorias, { pausaMin = 40, desde = null, max = 60 } = {}) {
  const lista = desde ? mensajes.filter((m) => m.fecha >= desde) : mensajes;
  const hilos = [];
  let actual = null;
  for (const m of lista) {
    if (!actual || (m.fecha - actual.fin) / 60000 > pausaMin) {
      actual = { inicio: m.fecha, fin: m.fecha, mensajes: [] };
      hilos.push(actual);
    }
    actual.mensajes.push(m); actual.fin = m.fecha;
  }
  const dic = categorias.map((c) => ({ ...c, set: new Set(c.palabras.map(normalizar)) }));
  const out = [];
  for (const h of hilos) {
    if (h.mensajes.length < 3) continue;
    const autores = new Set(h.mensajes.map((m) => m.autor));
    if (autores.size < 2) continue;
    const texto = h.mensajes.map((m) => m.texto).join('\n');
    const n = normalizar(texto);
    const palabras = tokenizar(n).filter((w) => w.length > 3 && !PALABRAS_VACIAS.has(w));
    const conteo = new Map(); palabras.forEach((w) => conteo.set(w, (conteo.get(w) || 0) + 1));
    let mejor = null, pts = 0;
    for (const c of dic) {
      let s = 0; for (const w of palabras) if (c.set.has(w)) s++;
      if (s > pts) { pts = s; mejor = c; }
    }
    if (!mejor || pts < 3) continue;
    const preguntas = (texto.match(/\?/g) || []).length;
    const senales = (n.match(new RegExp(SENALES_UTILES.source, 'g')) || []).length;
    const puntaje = pts * 2 + senales * 1.5 + Math.min(preguntas, 4) + Math.min(autores.size, 6) * 2;
    const clave = [...conteo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);
    out.push({ inicio: h.inicio, fin: h.fin, categoria: mejor.id, puntaje, autores: autores.size, mensajes: h.mensajes, palabrasClave: clave });
  }
  return out.sort((a, b) => b.puntaje - a.puntaje).slice(0, max);
}

/** Texto del hilo, anonimizado y recortado, listo para leer o enviar a una IA. */
export function textoDelHilo(hilo, alias, maxCaracteres = 3500) {
  let s = '';
  for (const m of hilo.mensajes) {
    const linea = `${alias.get(m.autor) || 'Propietario'}: ${anonimizar(m.texto, alias)}\n`;
    if (s.length + linea.length > maxCaracteres) { s += '…'; break; }
    s += linea;
  }
  return s;
}

// ---------- 5. Contactos (.vcf) del ZIP ---------------------------------
/** Lee una tarjeta de contacto .vcf: nombre, teléfono, correo, web. */
export function leerVcf(texto) {
  const campo = (re) => (texto.match(re) || [])[1]?.trim() || '';
  const tel = campo(/^TEL[^:\n]*:([+\d ()-]{7,})$/m).replace(/\s+/g, ' ');
  return {
    nombre: campo(/^FN[^:\n]*:(.+)$/m),
    telefono: tel,
    empresa: campo(/^ORG[^:\n]*:(.+)$/m).replace(/;+$/, ''),
    web: campo(/^URL[^:\n]*:(.+)$/m),
    correo: campo(/^EMAIL[^:\n]*:(.+)$/m),
  };
}
