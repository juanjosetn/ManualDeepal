// =====================================================================
// buscador.js — Motor de búsqueda que responde mientras escribes.
//
// LECCIÓN: buscar "bien" no es solo ver si una palabra está en el texto.
// Este motor hace 4 cosas:
//   1. Índice: antes de buscar, parte cada tip en palabras y recuerda en
//      qué campo apareció (título vale más que el cuerpo).
//   2. Sinónimos: "neumático" también encuentra "llanta".
//   3. Prefijos: "calib" ya encuentra "calibrar" (buscas mientras escribes).
//   4. Errores de digitación: "bateira" encuentra "batería".
// Luego ordena por puntaje: lo más relevante primero.
// No depende del navegador: se puede probar en Node (ver tests/).
// =====================================================================
import { normalizar, tokenizar, distancia, PALABRAS_VACIAS } from './texto.js';

/** Mínimo de letras para empezar a buscar (lo pidió el administrador). */
export const MIN_LETRAS = 3;

/** Grupos de sinónimos: cualquier palabra del grupo encuentra a las demás. */
const GRUPOS = [
  'llanta llantas neumatico neumaticos rueda ruedas caucho cauchos rin rines',
  'presion psi bar kpa aire inflar inflado inflo inflan calibrar calibracion libras',
  'pinchazo pinchada pinchado pinchar despinche despinchar ponchado pinchallantas',
  'bateria baterias pila celda celdas soc',
  'carga cargar cargando cargador enchufar enchufe recargar electrolinera',
  'reiniciar reinicio reset resetear congelada congelado pegada',
  'pantalla tablet multimedia radio infoentretenimiento',
  'gasolina combustible tanquear tanque fuel',
  'grua remolque remolcar arrastre plataforma',
  'freno frenos frenar frenado',
  'regeneracion regenerativo regenerar one pedal',
  'autonomia rango alcance',
  'mantenimiento revision revisiones taller servicio',
  'precio precios costo costos valor cuanto cuesta cuestan cobran cobraron',
  'aire acondicionado clima ac',
  'motor generador termico',
  'robo robar ladron seguridad',
  'ruido ruidos suena sonido golpeteo matraca',
  'espejo espejos retrovisor retrovisores lunas',
  'seguro seguros poliza aseguradora',
  'polarizado polarizar pelicula ppf',
  'electrico ev emax e-max',
  'reev rango extendido max hibrido',
  'pico placa restriccion',
  'impuesto impuestos iva renta dian upme incentivo',
  'llave control',
  'app aplicacion celular',
  'aceite lubricante reductor',
];
const SINONIMOS = new Map();
for (const g of GRUPOS) {
  const ps = g.split(' ').map(normalizar);
  for (const p of ps) SINONIMOS.set(p, new Set([...(SINONIMOS.get(p) || []), ...ps]));
}

/**
 * Crea un buscador para una lista de elementos.
 * @param {Array} items   los elementos (tips o contactos)
 * @param {Object} campos pesos por campo, p. ej. { titulo: 6, como: 2 }
 *                        el valor de un campo puede ser texto o lista de textos.
 */
export function crearBuscador(items, campos) {
  // Índice invertido: palabra → [{ i: posición del elemento, peso }]
  const indice = new Map();
  items.forEach((item, i) => {
    for (const [campo, peso] of Object.entries(campos)) {
      const valor = item[campo];
      const texto = Array.isArray(valor) ? valor.join(' ') : valor;
      for (const palabra of new Set(tokenizar(texto))) {
        if (!indice.has(palabra)) indice.set(palabra, new Map());
        const porItem = indice.get(palabra);
        porItem.set(i, Math.max(porItem.get(i) || 0, peso));
      }
    }
  });
  const vocabulario = [...indice.keys()];

  /**
   * Busca un término del usuario. Devuelve Map(i → {puntos, palabras}).
   * Tipo de coincidencia y su valor: exacta 1 · sinónimo 0.9 · prefijo 0.75 · error de digitación 0.5
   */
  function buscarTermino(t) {
    const res = new Map();
    const sumar = (palabra, factor) => {
      const porItem = indice.get(palabra);
      if (!porItem) return;
      for (const [i, peso] of porItem) {
        const r = res.get(i) || { puntos: 0, palabras: new Set() };
        r.puntos = Math.max(r.puntos, peso * factor);
        r.palabras.add(palabra);
        res.set(i, r);
      }
    };
    const esNumero = /^\d+$/.test(t);
    for (const v of vocabulario) {
      if (v === t) { sumar(v, 1); continue; }
      if (SINONIMOS.get(t)?.has(v)) { sumar(v, 0.9); continue; }
      if (v.startsWith(t)) { sumar(v, esNumero ? 0.6 : 0.75); continue; }
      // Sinónimo por prefijo: "neumat" → "neumatico" → "llanta"
      if (!esNumero && t.length >= 4) {
        if ([...(SINONIMOS.get(v) || [])].some((s) => s.startsWith(t))) { sumar(v, 0.7); continue; }
        // Errores de digitación: 1 cambio si la palabra es corta, 2 si es larga
        const tope = t.length >= 7 ? 2 : 1;
        const base = v.length > t.length + 1 ? v.slice(0, t.length) : v; // compara contra el inicio
        if (distancia(t, base, tope) <= tope) sumar(v, 0.5);
      }
    }
    return res;
  }

  /**
   * Busca una frase completa.
   * @param {string} modo 'y' = deben estar todas las palabras · 'o' = algunas
   * @returns {{ resultados: Array<{item, i, puntos, palabras:Set}>, parcial: boolean, terminos: string[] }}
   */
  function buscar(consulta, { filtro = () => true, limite = Infinity, modo = 'y' } = {}) {
    const limpia = normalizar(consulta).trim();
    if (limpia.replace(/\s/g, '').length < MIN_LETRAS) return { resultados: [], parcial: false, terminos: [], corta: true };
    let terminos = tokenizar(limpia).filter((t) => !PALABRAS_VACIAS.has(t) && (t.length >= MIN_LETRAS || /^\d+$/.test(t) || /\d/.test(t)));
    // Si solo escribió palabras vacías o cortas ("de la"), usa la frase tal cual
    if (!terminos.length) terminos = tokenizar(limpia).filter((t) => t.length >= 2);
    if (!terminos.length) return { resultados: [], parcial: false, terminos: [], corta: true };

    const porTermino = terminos.map(buscarTermino);
    const combinar = (modoY) => {
      const total = new Map();
      porTermino.forEach((mapa) => {
        for (const [i, r] of mapa) {
          const t = total.get(i) || { puntos: 0, palabras: new Set(), aciertos: 0 };
          t.puntos += r.puntos; t.aciertos += 1;
          r.palabras.forEach((p) => t.palabras.add(p));
          total.set(i, t);
        }
      });
      return [...total.entries()]
        .filter(([i, t]) => (!modoY || t.aciertos === terminos.length) && filtro(items[i]))
        .map(([i, t]) => ({ item: items[i], i, puntos: t.puntos + t.aciertos * 2, palabras: t.palabras }))
        .sort((a, b) => b.puntos - a.puntos || a.i - b.i)
        .slice(0, limite);
    };
    // Primero exige todas las palabras (Y). Si no hay nada, acepta algunas (O).
    // modo 'o' (para preguntas largas): basta con que coincidan algunas palabras; gana quien coincida en más
    if (modo === 'o') return { resultados: combinar(false), parcial: false, terminos };
    let resultados = combinar(true), parcial = false;
    if (!resultados.length && terminos.length > 1) { resultados = combinar(false); parcial = resultados.length > 0; }
    return { resultados, parcial, terminos };
  }

  /** "¿Quisiste decir…?": la palabra conocida más parecida a lo que se escribió. */
  function sugerir(consulta) {
    const ts = tokenizar(consulta).filter((t) => t.length >= 4 && !PALABRAS_VACIAS.has(t));
    const out = ts.map((t) => {
      let mejor = null, d = 3;
      for (const v of vocabulario) {
        if (v.length < 4) continue;
        const x = distancia(t, v, 2);
        if (x < d) { d = x; mejor = v; }
      }
      return mejor || t;
    });
    const sug = out.join(' ');
    return sug && sug !== ts.join(' ') ? sug : '';
  }

  return { buscar, sugerir, vocabulario };
}

/**
 * Marca con <mark> las partes de `texto` que coinciden con `palabras`
 * (palabras normalizadas del índice). Devuelve HTML seguro.
 */
export function resaltar(texto, palabras, escapar) {
  const t = String(texto ?? '');
  if (!palabras || !palabras.size) return escapar(t);
  const norm = normalizar(t);
  const marcas = [];
  for (const p of palabras) {
    if (p.length < 2) continue;
    const re = new RegExp(`(^|[^a-z0-9])(${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
    let m;
    while ((m = re.exec(norm))) marcas.push([m.index + m[1].length, m.index + m[1].length + p.length]);
  }
  if (!marcas.length) return escapar(t);
  marcas.sort((a, b) => a[0] - b[0]);
  const unidas = [];
  for (const m of marcas) {
    const u = unidas[unidas.length - 1];
    if (u && m[0] <= u[1]) u[1] = Math.max(u[1], m[1]); else unidas.push([...m]);
  }
  let out = '', p = 0;
  for (const [a, b] of unidas) { out += escapar(t.slice(p, a)) + '<mark>' + escapar(t.slice(a, b)) + '</mark>'; p = b; }
  return out + escapar(t.slice(p));
}
