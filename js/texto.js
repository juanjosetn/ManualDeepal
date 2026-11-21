// =====================================================================
// texto.js — Herramientas pequeñas para trabajar con texto.
// LECCIÓN: un "módulo" es un archivo que exporta funciones para que
// otros archivos las usen con `import`. Así cada archivo hace una sola cosa.
// =====================================================================

/**
 * Normaliza un texto para comparar sin importar mayúsculas ni tildes.
 * "Presión" → "presion". NFD separa la letra de su tilde y luego
 * borramos las tildes (rango Unicode \u0300-\u036f).
 */
export function normalizar(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Escapa los caracteres especiales de HTML. SIEMPRE que pintes en la
 * página un texto que no escribiste tú (datos, respuestas de IA, chat),
 * pásalo por aquí: evita que alguien inyecte código (ataque XSS).
 */
export function escaparHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/** Palabras vacías: no aportan a la búsqueda ("de", "la", "cómo"…). */
export const PALABRAS_VACIAS = new Set(
  ('de la el en y a que los las un una unos unas por para con se mi me mis como cual cuales es son del al lo ' +
   'le les su sus o u e si ya hay mas muy tan tu te ti yo nos qué cómo cuál cuando cuándo donde dónde esta este ' +
   'esto eso esa ese debo puedo hago hacer tengo tiene carro deepal pero hasta veces desde tambien porque entonces bien solo ' +
   'igual algo algun alguien todo todos nada mucho poco otra otro ahora aqui asi sera seria tienen hace estan estoy fue ser van vez ' +
   'gracias buenas buenos dias tardes noches hola jaja jajaja creo pues sino cosa').split(' ').map(normalizar),
);

/**
 * Parte un texto normalizado en palabras ("tokens").
 * Conserva cifras con unidad pegada: "12v", "41psi", "10.000" → "10000".
 */
export function tokenizar(s) {
  return normalizar(s)
    .replace(/(\d)[.,](\d{3})\b/g, '$1$2') // 10.000 → 10000
    .split(/[^a-z0-9ñ]+/)
    .filter(Boolean);
}

/**
 * Distancia de edición (Damerau-Levenshtein simplificada): cuántos cambios
 * de una letra hacen falta para pasar de `a` a `b`. Sirve para tolerar
 * errores de digitación: "bateira" está a 1 cambio de "bateria".
 * `tope` corta el cálculo si ya superó el máximo permitido (más rápido).
 */
export function distancia(a, b, tope = 2) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > tope) return tope + 1;
  const m = a.length, n = b.length;
  let prev2 = null, prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    let minFila = i;
    for (let j = 1; j <= n; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + costo);
      if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur.push(v);
      if (v < minFila) minFila = v;
    }
    if (minFila > tope) return tope + 1;
    prev2 = prev; prev = cur;
  }
  return prev[n];
}

/** Espera `ms` milisegundos sin congelar la página. */
export const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/** "Debounce": ejecuta `fn` solo cuando el usuario deja de escribir `ms` milisegundos. */
export function antirrebote(fn, ms = 120) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
