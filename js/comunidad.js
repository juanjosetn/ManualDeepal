// =====================================================================
// comunidad.js — Calificaciones, opiniones y solicitudes del directorio.
// LECCIÓN: GitHub Pages solo sirve archivos; no puede guardar nada. Por
// eso las calificaciones viajan a un servicio de Google Apps Script
// (apps-script/Codigo.gs) que las guarda en una hoja de cálculo del
// administrador. Aquí solo se habla con ese servicio.
//   - GET  …/exec?accion=resumen   → estrellas y opiniones ya aprobadas
//   - POST …/exec (texto JSON)     → calificar, solicitar y moderar
// Se envía como "text/plain" a propósito: así el navegador no hace la
// consulta previa (preflight) que Apps Script no sabe responder.
// =====================================================================

const DISPOSITIVO = 'deepal-dispositivo';
const RESUMEN = 'deepal-resumen';
/** Solo se aceptan direcciones de implementaciones de Apps Script. */
export const URL_VALIDA = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{10,}\/exec$/;

const leer = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };

/**
 * Identificador anónimo de este navegador (24 letras al azar). No dice
 * quién eres; solo evita que el mismo celular califique dos veces el
 * mismo contacto. El servidor guarda su huella, no el valor.
 */
export function dispositivo() {
  let id = leer(DISPOSITIVO);
  if (typeof id !== 'string' || !/^[a-z0-9]{24}$/.test(id)) {
    const b = new Uint8Array(12); crypto.getRandomValues(b);
    id = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    guardar(DISPOSITIVO, id);
  }
  return id;
}
export const nuevoReqId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export class ErrorServicio extends Error {
  constructor(codigo, mensaje) { super(mensaje); this.codigo = codigo; }
}

export function crearComunidad(url) {
  const activa = URL_VALIDA.test(url || '');

  async function pedir(opciones, ms = 20000) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(opciones.url, { method: opciones.method || 'GET', body: opciones.body, headers: opciones.body ? { 'Content-Type': 'text/plain;charset=utf-8' } : undefined, redirect: 'follow', signal: ctl.signal });
      const j = await r.json();
      if (!j.ok) throw new ErrorServicio(j.error?.codigo || 'INTERNO', j.error?.mensaje || 'El servicio no respondió bien.');
      return j.data;
    } catch (e) {
      if (e instanceof ErrorServicio) throw e;
      throw new ErrorServicio('RED', e.name === 'AbortError' ? 'El servicio tardó demasiado. Intenta de nuevo.' : 'No hay conexión con el servicio. Revisa tu internet e intenta de nuevo.');
    } finally { clearTimeout(t); }
  }

  /** Resumen público. Si no hay internet, usa la última copia guardada. */
  async function resumen() {
    if (!activa) return { contactos: {} };
    try {
      const d = await pedir({ url: `${url}?accion=resumen` }, 12000);
      guardar(RESUMEN, d);
      return d;
    } catch (e) {
      const copia = leer(RESUMEN);
      if (copia) return { ...copia, sinConexion: true };
      throw e;
    }
  }

  /**
   * Envía una acción. Si el servidor está ocupado, reintenta (es seguro:
   * el reqId hace que una repetición no duplique nada).
   */
  async function enviar(datos) {
    if (!activa) throw new ErrorServicio('SIN_SERVICIO', 'Las calificaciones aún no están activadas.');
    const cuerpo = JSON.stringify({ ...datos, dispositivo: dispositivo(), reqId: datos.reqId || nuevoReqId() });
    for (let intento = 0; intento < 3; intento++) {
      try { return await pedir({ url, method: 'POST', body: cuerpo }); }
      catch (e) {
        if (!(e.codigo === 'OCUPADO' || e.codigo === 'RED') || intento === 2) throw e;
        await new Promise((ok) => setTimeout(ok, 1200 * (intento + 1)));
      }
    }
    return null;
  }

  return {
    activa,
    resumen,
    calificar: (d) => enviar({ accion: 'calificar', ...d }),
    solicitar: (d) => enviar({ accion: 'solicitar', ...d }),
    adminPendientes: (clave) => enviar({ accion: 'admin_pendientes', clave }),
    adminModerar: (clave, tipo, reqId, estado) => enviar({ accion: 'admin_moderar', clave, tipo, reqId, estado }),
    adminCalificaciones: (clave, contactoId) => enviar({ accion: 'admin_calificaciones', clave, contactoId }),
  };
}
