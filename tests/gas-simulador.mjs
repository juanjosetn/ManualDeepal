// =====================================================================
// Simulador mínimo de Google Apps Script para probar apps-script/Codigo.gs
// en Node, sin tocar Google. Falla como el real donde importa:
//   - una hoja nueva tiene 1.000 filas y escribir más allá lanza error
//   - el bloqueo puede no conseguirse (sim.ocupado = true)
//   - la caché vence por tiempo (reloj controlable con sim.avanzar(ms))
// =====================================================================
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

export function crearGAS({ archivo = new URL('../apps-script/Codigo.gs', import.meta.url) } = {}) {
  const sim = { t: Date.UTC(2026, 10, 22, 15, 0, 0), ocupado: false, correos: [], props: new Map(), cache: new Map(), hojas: new Map() };
  sim.ahora = () => sim.t;
  sim.avanzar = (ms) => { sim.t += ms; };

  class Rango {
    constructor(h, r, c, nr = 1, nc = 1) { Object.assign(this, { h, r, c, nr, nc }); }
    revisar() { if (this.r + this.nr - 1 > this.h.max) throw new Error(`Exception: Range is out of bounds (fila ${this.r + this.nr - 1} > ${this.h.max}).`); }
    getValues() { return Array.from({ length: this.nr }, (_, i) => Array.from({ length: this.nc }, (_, j) => this.h.celda(this.r + i, this.c + j))); }
    setValues(v) { this.revisar(); v.forEach((fila, i) => fila.forEach((x, j) => this.h.poner(this.r + i, this.c + j, x))); return this; }
    setValue(x) { this.revisar(); this.h.poner(this.r, this.c, x); return this; }
    setNumberFormat() { return this; }
  }
  class Hoja {
    constructor(nombre) { this.nombre = nombre; this.datos = new Map(); this.max = 1000; }
    celda(r, c) { return this.datos.get(`${r},${c}`) ?? ''; }
    poner(r, c, x) { this.datos.set(`${r},${c}`, x); }
    getLastRow() { let m = 0; for (const [k, v] of this.datos) if (v !== '') m = Math.max(m, +k.split(',')[0]); return m; }
    getLastColumn() { let m = 0; for (const [k, v] of this.datos) if (v !== '') m = Math.max(m, +k.split(',')[1]); return m; }
    getMaxRows() { return this.max; }
    insertRowsAfter(_, n) { this.max += n; }
    getRange(r, c, nr, nc) { return new Rango(this, r, c, nr, nc); }
    setFrozenRows() {}
  }
  const libro = {
    getSheetByName: (n) => sim.hojas.get(n) || null,
    insertSheet: (n) => { const h = new Hoja(n); sim.hojas.set(n, h); return h; },
  };
  const ctx = {
    console: { log() {}, error() {} },
    JSON, Math, String, Number, Object, Array, Error, RegExp,
    SpreadsheetApp: { getActive: () => libro, flush() {}, getUi() { throw new Error('sin interfaz'); } },
    CacheService: { getScriptCache: () => ({
      get: (k) => { const e = sim.cache.get(k); return e && e.vence > sim.t ? e.v : null; },
      put: (k, v, s) => { if (String(v).length > 100000) throw new Error('Argumento demasiado grande'); sim.cache.set(k, { v: String(v), vence: sim.t + s * 1000 }); },
    }) },
    LockService: { getScriptLock: () => ({ tryLock: () => !sim.ocupado, releaseLock() {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (sim.props.has(k) ? sim.props.get(k) : null), setProperty: (k, v) => { sim.props.set(k, String(v)); } }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ contenido: t, setMimeType() { return this; }, getContent() { return t; } }) },
    MailApp: { getRemainingDailyQuota: () => 100, sendEmail: (a, s, m) => sim.correos.push({ a, s, m }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
      computeDigest: (alg, t) => [...crypto.createHash('sha256').update(String(t), 'utf8').digest()].map((b) => (b > 127 ? b - 256 : b)),
      formatDate: (d) => new globalThis.Date(d.getTime() - 5 * 3600000).toISOString().slice(0, 19),
    },
  };
  ctx.Date = class extends globalThis.Date { constructor(...a) { if (a.length) super(...a); else super(sim.t); } static now() { return sim.t; } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(archivo, 'utf8'), ctx, { filename: 'Codigo.gs' });

  sim.ctx = ctx;
  sim.get = (params = {}) => JSON.parse(ctx.doGet({ parameter: params }).getContent());
  sim.post = (obj) => JSON.parse(ctx.doPost({ postData: { contents: typeof obj === 'string' ? obj : JSON.stringify(obj) } }).getContent());
  sim.hoja = (n) => sim.hojas.get(n);
  sim.filas = (n) => { const h = sim.hojas.get(n); if (!h) return []; const enc = ctx.encabezados_(h); return ctx.leer_(h).map((f) => Object.fromEntries(enc.map((c) => [c, f[c]]))); };
  return sim;
}
