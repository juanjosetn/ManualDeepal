/**
 * =====================================================================
 * Manual práctico Deepal — Servicio de la comunidad (Google Apps Script)
 * Guarda calificaciones, opiniones y solicitudes para aparecer en el
 * directorio, en la hoja de cálculo a la que está atado este script.
 *
 * Despliegue: Implementar › Nueva implementación › Aplicación web
 *   Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier usuario
 * La app (GitHub Pages) llama por fetch:
 *   GET  ?accion=resumen                       → estrellas y opiniones publicadas
 *   POST (text/plain, JSON) {accion:'calificar'|'solicitar'|'admin_pendientes'|'admin_moderar', ...}
 *
 * Reglas de seguridad (LECCIÓN):
 *  - Todo lo interno termina en "_". Lo público es solo doGet y doPost.
 *  - El servidor valida TODO lo que llega (tipos, largos, valores permitidos).
 *  - Los comentarios no se publican hasta que el administrador los aprueba.
 *  - La clave de administración NUNCA se guarda en claro: solo su huella SHA-256.
 *  - Frenos por ventana fija (no por clave que se renueva) y bloqueo al escribir.
 *  - Textos que empiezan por = + - @ se guardan con ' delante (inyección de fórmulas).
 * Versión del servicio: ver SERVICIO_VERSION (se informa en cada respuesta).
 * =====================================================================
 */
var SERVICIO_VERSION = '1.1.0';

var HOJAS_ = {
  CALIFICACIONES: ['fecha', 'contactoId', 'estrellas', 'recomienda', 'comentario', 'dispositivo', 'estado', 'reqId', 'actualizado'],
  SOLICITUDES: ['fecha', 'negocio', 'servicio', 'ciudad', 'telefono', 'web', 'descripcion', 'solicitante', 'contactoSolicitante', 'autoriza', 'dispositivo', 'estado', 'reqId'],
};
var LIMITES_ = {
  calificarDispositivoHora: 20,
  calificarContactoHora: 40,
  calificarGlobalHora: 400,
  solicitarDispositivoDia: 5,
  solicitarGlobalDia: 60,
  adminFallos15min: 5,
  comentarioMax: 500,
  comentariosPorContacto: 5,
};

/**
 * Calificaciones por debajo de este número se guardan en la hoja (el administrador las ve),
 * pero NO cuentan: ni en el promedio, ni en el orden, ni para bajar a alguien a «Calificación baja»,
 * y su texto no se publica. Motivo (decisión del administrador, v1.1.0 del servicio): un 1 suele
 * venir de un mal momento o de una retaliación individual.
 */
var ESTRELLAS_MINIMAS_QUE_CUENTAN = 2;
function cuenta_(estrellas) { return Number(estrellas) >= ESTRELLAS_MINIMAS_QUE_CUENTAN; }

// ---------------------------------------------------------------------
// Entradas públicas
// ---------------------------------------------------------------------
function doGet(e) {
  return ejecutar_('resumen', function () {
    var accion = (e && e.parameter && e.parameter.accion) || 'resumen';
    if (accion === 'salud') return { servicio: SERVICIO_VERSION, hora: ahoraISO_() };
    if (accion !== 'resumen') throw error_('ACCION', 'Acción no reconocida.');
    return resumen_();
  });
}

function doPost(e) {
  var datos;
  try { datos = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (x) { datos = null; }
  return ejecutar_('post', function () {
    if (!datos || typeof datos !== 'object') throw error_('FORMATO', 'La solicitud no tiene un formato válido.');
    switch (datos.accion) {
      case 'calificar': return calificar_(datos);
      case 'solicitar': return solicitar_(datos);
      case 'admin_pendientes': verificarAdmin_(datos.clave); return pendientes_();
      case 'admin_moderar': verificarAdmin_(datos.clave); return moderar_(datos);
      case 'admin_calificaciones': verificarAdmin_(datos.clave); return calificacionesDe_(datos.contactoId);
      default: throw error_('ACCION', 'Acción no reconocida.');
    }
  });
}

/** Ejecutar UNA VEZ desde el editor: crea las hojas y guarda la clave de administración. */
function configurar() {
  var ui = null;
  try { ui = SpreadsheetApp.getUi(); } catch (x) { /* sin interfaz (pruebas) */ }
  Object.keys(HOJAS_).forEach(function (n) { hoja_(n); });
  var props = PropertiesService.getScriptProperties();
  if (ui) {
    var r = ui.prompt('Clave de administración', 'Escribe una clave larga (mínimo 12 caracteres). La usarás en el panel #admin del manual para moderar.', ui.ButtonSet.OK_CANCEL);
    if (r.getSelectedButton() !== ui.Button.OK) return;
    var clave = String(r.getResponseText() || '');
    if (clave.length < 12) { ui.alert('La clave debe tener al menos 12 caracteres. Vuelve a ejecutar configurar.'); return; }
    props.setProperty('ADMIN_HASH', huella_(clave));
    var c = ui.prompt('Correo para avisos (opcional)', 'Si escribes un correo, te llega un aviso cuando alguien pida aparecer en el directorio.', ui.ButtonSet.OK_CANCEL);
    if (c.getSelectedButton() === ui.Button.OK && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.getResponseText())) props.setProperty('CORREO_AVISOS', c.getResponseText().trim());
    ui.alert('Listo. Ahora: Implementar › Nueva implementación › Aplicación web (Ejecutar como: Yo; Acceso: Cualquier usuario).');
  }
}

/** Para pruebas o para cambiar la clave desde código: fija la huella de una clave. */
function fijarClaveAdmin_(clave) {
  if (String(clave).length < 12) throw error_('CLAVE', 'Mínimo 12 caracteres.');
  PropertiesService.getScriptProperties().setProperty('ADMIN_HASH', huella_(clave));
}

// ---------------------------------------------------------------------
// Calificar un contacto del directorio
// ---------------------------------------------------------------------
function calificar_(d) {
  if (d.sitio) throw error_('RECHAZADO', 'No se pudo registrar.'); // campo trampa para robots
  var id = texto_(d.contactoId, 80);
  if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(id)) throw error_('DATOS', 'Contacto no válido.');
  var estrellas = Number(d.estrellas);
  if (!(estrellas >= 1 && estrellas <= 5) || Math.round(estrellas) !== estrellas) throw error_('DATOS', 'Elige de 1 a 5 estrellas.');
  var recomienda = ['si', 'no', 'reservas'].indexOf(d.recomienda) >= 0 ? d.recomienda : '';
  var comentario = limpiarComentario_(texto_(d.comentario, LIMITES_.comentarioMax));
  var dispositivo = texto_(d.dispositivo, 40);
  if (!/^[a-z0-9]{16,40}$/.test(dispositivo)) throw error_('DATOS', 'Identificador de dispositivo no válido.');
  var reqId = texto_(d.reqId, 40);
  if (!/^[a-zA-Z0-9-]{8,40}$/.test(reqId)) throw error_('DATOS', 'Falta el identificador de la solicitud.');

  frenar_('cal_d_' + dispositivo, 3600, LIMITES_.calificarDispositivoHora);
  frenar_('cal_c_' + id, 3600, LIMITES_.calificarContactoHora);
  frenar_('cal_g', 3600, LIMITES_.calificarGlobalHora);

  return conBloqueo_(function () {
    var h = hoja_('CALIFICACIONES');
    var filas = leer_(h);
    var ya = filas.filter(function (f) { return f.reqId === reqId; })[0];
    if (ya) return { repetida: true, estado: ya.estado }; // idempotente: no duplica
    var estado = comentario ? 'pendiente' : 'sin_comentario';
    var previa = filas.filter(function (f) { return f.dispositivo === huella_(dispositivo) && f.contactoId === id; })[0];
    var fila = { fecha: ahoraISO_(), contactoId: id, estrellas: String(estrellas), recomienda: recomienda, comentario: comentario, dispositivo: huella_(dispositivo), estado: estado, reqId: reqId, actualizado: ahoraISO_() };
    if (previa) { // una calificación por dispositivo y contacto: la nueva reemplaza a la anterior
      fila.fecha = previa.fecha;
      escribirFila_(h, previa._fila, fila);
    } else agregarFila_(h, fila);
    nuevaGeneracion_();
    return { estado: estado, reemplazo: !!previa };
  });
}

// ---------------------------------------------------------------------
// Solicitud para aparecer en el directorio
// ---------------------------------------------------------------------
function solicitar_(d) {
  if (d.sitio) throw error_('RECHAZADO', 'No se pudo registrar.');
  if (d.autoriza !== true) throw error_('AUTORIZACION', 'Debes autorizar la publicación de los datos.');
  var s = {
    negocio: texto_(d.negocio, 80), servicio: texto_(d.servicio, 60), ciudad: texto_(d.ciudad, 40),
    telefono: texto_(d.telefono, 20), web: texto_(d.web, 120), descripcion: texto_(d.descripcion, 200),
    solicitante: texto_(d.solicitante, 60), contactoSolicitante: texto_(d.contactoSolicitante, 20),
  };
  if (s.negocio.length < 2) throw error_('DATOS', 'Escribe el nombre del negocio o de la persona.');
  if (s.servicio.length < 2) throw error_('DATOS', 'Escribe el servicio que ofreces.');
  if (s.ciudad.length < 2) throw error_('DATOS', 'Escribe la ciudad.');
  var dig = s.telefono.replace(/\D/g, '');
  if (dig.length < 7 || dig.length > 13) throw error_('DATOS', 'Escribe un teléfono o WhatsApp válido.');
  if (s.web && !/^https:\/\/[^\s<>"']+\.[^\s<>"']+$/.test(s.web)) throw error_('DATOS', 'La página web debe empezar por https://');
  var dispositivo = texto_(d.dispositivo, 40);
  if (!/^[a-z0-9]{16,40}$/.test(dispositivo)) throw error_('DATOS', 'Identificador de dispositivo no válido.');
  var reqId = texto_(d.reqId, 40);
  if (!/^[a-zA-Z0-9-]{8,40}$/.test(reqId)) throw error_('DATOS', 'Falta el identificador de la solicitud.');
  frenar_('sol_d_' + dispositivo, 86400, LIMITES_.solicitarDispositivoDia);
  frenar_('sol_g', 86400, LIMITES_.solicitarGlobalDia);

  var res = conBloqueo_(function () {
    var h = hoja_('SOLICITUDES');
    var ya = leer_(h).filter(function (f) { return f.reqId === reqId; })[0];
    if (ya) return { repetida: true };
    s.fecha = ahoraISO_(); s.autoriza = 'si (' + s.fecha + ')'; s.dispositivo = huella_(dispositivo); s.estado = 'pendiente'; s.reqId = reqId;
    agregarFila_(h, s);
    return { estado: 'pendiente' };
  });
  if (!res.repetida) avisarAdmin_('Hay una solicitud nueva para aparecer en el directorio del Manual Deepal. Revísala en el panel de administración (#admin).');
  return res;
}

// ---------------------------------------------------------------------
// Resumen público (solo agregados y comentarios aprobados)
// ---------------------------------------------------------------------
function resumen_() {
  var gen = generacion_();
  var cache = CacheService.getScriptCache();
  var clave = 'resumen_' + gen;
  var guardado = cache.get(clave);
  if (guardado) return JSON.parse(guardado);
  var porId = {};
  leer_(hoja_('CALIFICACIONES')).forEach(function (f) {
    if (f.estado === 'rechazado') return;
    var e = Number(f.estrellas);
    if (!(e >= 1 && e <= 5)) return;
    if (!cuenta_(e)) return; // 1 estrella: queda en la hoja, no en el resumen público
    var r = porId[f.contactoId] || (porId[f.contactoId] = { n: 0, suma: 0, recomiendan: 0, opiniones: [] });
    r.n++; r.suma += e; if (f.recomienda === 'si') r.recomiendan++;
    if (f.estado === 'publicado' && f.comentario) r.opiniones.push({ e: e, t: f.comentario, f: String(f.actualizado || f.fecha).slice(0, 7), r: f.recomienda });
  });
  var contactos = {};
  Object.keys(porId).forEach(function (id) {
    var r = porId[id];
    contactos[id] = { n: r.n, promedio: Math.round((r.suma / r.n) * 10) / 10, recomiendan: r.recomiendan, opiniones: r.opiniones.slice(-LIMITES_.comentariosPorContacto).reverse() };
  });
  var out = { generacion: gen, actualizado: ahoraISO_(), contactos: contactos };
  var txt = JSON.stringify(out);
  if (txt.length < 90000) cache.put(clave, txt, 600);
  return out;
}

// ---------------------------------------------------------------------
// Administración (requiere clave)
// ---------------------------------------------------------------------
function verificarAdmin_(clave) {
  var props = PropertiesService.getScriptProperties();
  var hash = props.getProperty('ADMIN_HASH');
  if (!hash) throw error_('SIN_CONFIGURAR', 'Falta ejecutar «configurar» en el editor de Apps Script.');
  // Freno a intentos fallidos: ventana fija de 15 min, guardado en propiedades (no solo en caché)
  var ventana = Math.floor(Date.now() / 900000);
  var k = 'fallos_' + ventana;
  var fallos = Number(props.getProperty(k) || 0);
  if (fallos >= LIMITES_.adminFallos15min) throw error_('BLOQUEADO', 'Demasiados intentos fallidos. Espera 15 minutos.');
  if (typeof clave !== 'string' || huella_(clave) !== hash) {
    props.setProperty(k, String(fallos + 1));
    throw error_('CLAVE', 'Clave incorrecta.');
  }
}

function pendientes_() {
  var cal = leer_(hoja_('CALIFICACIONES')).filter(function (f) { return f.estado === 'pendiente'; })
    .map(function (f) { return { reqId: f.reqId, contactoId: f.contactoId, estrellas: Number(f.estrellas), cuenta: cuenta_(f.estrellas), recomienda: f.recomienda, comentario: f.comentario, fecha: f.fecha }; });
  var sol = leer_(hoja_('SOLICITUDES')).filter(function (f) { return f.estado === 'pendiente'; })
    .map(function (f) {
      var o = {}; HOJAS_.SOLICITUDES.forEach(function (c) { if (c !== 'dispositivo') o[c] = f[c]; }); return o;
    });
  return { opiniones: cal, solicitudes: sol };
}

/**
 * Todas las calificaciones de un contacto (también las que no traen comentario), para que el
 * administrador revise antes de aceptar que un negocio baje a «Calificación baja».
 * Ejemplo: cinco «1 estrella» llegadas en diez minutos merecen una mirada.
 */
function calificacionesDe_(contactoId) {
  var id = texto_(contactoId, 80);
  if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(id)) throw error_('DATOS', 'Contacto no válido.'); // misma regla que calificar_
  return leer_(hoja_('CALIFICACIONES')).filter(function (f) { return f.contactoId === id; })
    .map(function (f) { return { reqId: f.reqId, estrellas: Number(f.estrellas), cuenta: cuenta_(f.estrellas), recomienda: f.recomienda, comentario: f.comentario, estado: f.estado, fecha: String(f.actualizado || f.fecha) }; })
    .sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
}

function moderar_(d) {
  var tipo = d.tipo === 'solicitud' ? 'SOLICITUDES' : d.tipo === 'opinion' ? 'CALIFICACIONES' : null;
  if (!tipo) throw error_('DATOS', 'Tipo no válido.');
  var permitidos = tipo === 'SOLICITUDES' ? ['agregada', 'rechazada'] : ['publicado', 'rechazado', 'sin_comentario'];
  if (permitidos.indexOf(d.estado) < 0) throw error_('DATOS', 'Estado no válido.');
  var reqId = texto_(d.reqId, 40);
  return conBloqueo_(function () {
    var h = hoja_(tipo);
    var f = leer_(h).filter(function (x) { return x.reqId === reqId; })[0];
    if (!f) throw error_('NO_EXISTE', 'No encontré ese registro.');
    if (tipo === 'CALIFICACIONES' && d.estado === 'publicado' && !cuenta_(f.estrellas)) throw error_('DATOS', 'Las calificaciones de 1 estrella no se publican ni cuentan.');
    var nuevo = {}; nuevo.estado = d.estado;
    // «Quitar solo el comentario» conserva las estrellas y borra el texto
    if (tipo === 'CALIFICACIONES' && d.estado === 'sin_comentario') nuevo.comentario = '';
    actualizarCampos_(h, f._fila, nuevo);
    nuevaGeneracion_();
    return { reqId: reqId, estado: d.estado };
  });
}

// ---------------------------------------------------------------------
// Utilidades internas
// ---------------------------------------------------------------------
function ejecutar_(nombre, fn) {
  var salida;
  try { salida = { ok: true, data: fn(), servicio: SERVICIO_VERSION }; }
  catch (e) {
    var conocido = e && e.codigo;
    salida = { ok: false, servicio: SERVICIO_VERSION, error: { codigo: conocido ? e.codigo : 'INTERNO', mensaje: conocido ? e.message : 'Ocurrió un error interno. Intenta más tarde.' } };
    if (!conocido) console.error(nombre + ': ' + (e && e.stack || e));
  }
  return ContentService.createTextOutput(JSON.stringify(salida)).setMimeType(ContentService.MimeType.JSON);
}

function error_(codigo, mensaje) { var e = new Error(mensaje); e.codigo = codigo; return e; }

function texto_(v, max) {
  return String(v === undefined || v === null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Quita teléfonos, correos y placas que alguien pegue en una opinión pública. */
function limpiarComentario_(t) {
  return t.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[correo]')
    .replace(/\+?\d[\d\s-]{8,}\d/g, '[tel]')
    .replace(/\b[A-Za-z]{3}[\s-]?\d{3}\b/g, '[placa]');
}

/** Lo contrario de celdaSegura_ al leer: «'+57 300…» vuelve a ser «+57 300…» (si Sheets dejó la comilla). */
function sinComilla_(s) { return /^'[=+\-@]/.test(s) ? s.slice(1) : s; }

function celdaSegura_(v) { var s = String(v === undefined || v === null ? '' : v); return /^[=+\-@]/.test(s) ? "'" + s : s; }

function huella_(t) {
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(t), Utilities.Charset.UTF_8);
  return b.map(function (x) { return ((x + 256) % 256).toString(16); }).map(function (h) { return h.length < 2 ? '0' + h : h; }).join('');
}

function ahoraISO_() { return Utilities.formatDate(new Date(), 'America/Bogota', "yyyy-MM-dd'T'HH:mm:ss"); }

/** Freno por VENTANA FIJA: la clave cambia con la ventana, así no se renueva sola. */
function frenar_(nombre, segundos, maximo) {
  var cache = CacheService.getScriptCache();
  var clave = 'cupo_' + nombre + '_' + Math.floor(Date.now() / (segundos * 1000));
  var n = Number(cache.get(clave) || 0);
  if (n >= maximo) throw error_('CUPO', 'Has hecho muchas solicitudes seguidas. Intenta más tarde.');
  cache.put(clave, String(n + 1), Math.min(21600, segundos + 120));
}

function conBloqueo_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw error_('OCUPADO', 'El servicio está ocupado. Intenta de nuevo en unos segundos.');
  try { return fn(); } finally { SpreadsheetApp.flush(); lock.releaseLock(); }
}

function generacion_() { return PropertiesService.getScriptProperties().getProperty('GENERACION') || '1'; }
// Invalidar la caché = cambiar la generación. Un contador (no la hora): dos cambios en el mismo
// milisegundo también producen generaciones distintas.
function nuevaGeneracion_() { var p = PropertiesService.getScriptProperties(); p.setProperty('GENERACION', String(Number(p.getProperty('GENERACION') || 1) + 1)); }

/** Devuelve la hoja; la crea con encabezados si falta y agrega columnas nuevas al final. */
function hoja_(nombre) {
  var libro = SpreadsheetApp.getActive();
  var h = libro.getSheetByName(nombre) || libro.insertSheet(nombre);
  var esperados = HOJAS_[nombre];
  var ancho = Math.max(h.getLastColumn(), 1);
  var actuales = h.getLastRow() >= 1 ? h.getRange(1, 1, 1, ancho).getValues()[0].map(String) : [];
  var faltan = esperados.filter(function (c) { return actuales.indexOf(c) < 0; });
  if (faltan.length) {
    var desde = actuales.filter(String).length + 1;
    h.getRange(1, desde, 1, faltan.length).setValues([faltan]);
    h.setFrozenRows(1);
  }
  return h;
}

function encabezados_(h) { return h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0].map(String); }

/** Lee la hoja como objetos por NOMBRE de columna (nunca por posición fija). */
function leer_(h) {
  var ult = h.getLastRow();
  if (ult < 2) return [];
  var enc = encabezados_(h);
  return h.getRange(2, 1, ult - 1, enc.length).getValues().map(function (fila, i) {
    var o = { _fila: i + 2 };
    enc.forEach(function (c, j) { o[c] = fila[j] instanceof Date ? Utilities.formatDate(fila[j], 'America/Bogota', "yyyy-MM-dd'T'HH:mm:ss") : sinComilla_(String(fila[j])); });
    return o;
  });
}

function filaDesdeObjeto_(h, o) { return encabezados_(h).map(function (c) { return celdaSegura_(o[c]); }); }

function agregarFila_(h, o) {
  var fila = h.getLastRow() + 1;
  if (fila > h.getMaxRows()) h.insertRowsAfter(h.getMaxRows(), 200); // una hoja nueva trae 1.000 filas
  escribirFila_(h, fila, o);
}

function escribirFila_(h, fila, o) {
  var valores = filaDesdeObjeto_(h, o);
  h.getRange(fila, 1, 1, valores.length).setNumberFormat('@').setValues([valores]);
}

function actualizarCampos_(h, fila, cambios) {
  var enc = encabezados_(h);
  Object.keys(cambios).forEach(function (c) {
    var j = enc.indexOf(c);
    if (!(j >= 0)) return;
    h.getRange(fila, j + 1).setNumberFormat('@').setValue(celdaSegura_(cambios[c]));
  });
}

function avisarAdmin_(mensaje) {
  var correo = PropertiesService.getScriptProperties().getProperty('CORREO_AVISOS');
  if (!correo) return;
  try { if (MailApp.getRemainingDailyQuota() > 0) MailApp.sendEmail(correo, 'Manual Deepal: solicitud nueva', mensaje); }
  catch (e) { console.error('Aviso por correo: ' + e); }
}
