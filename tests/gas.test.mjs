// Pruebas del servicio de la comunidad (apps-script/Codigo.gs) con el simulador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearGAS } from './gas-simulador.mjs';

const DISP = 'a1b2c3d4e5f6a7b8c9d0e1f2';
let n = 0;
const req = () => `req-${Date.now()}-${++n}`;
const calif = (extra = {}) => ({ accion: 'calificar', contactoId: 'taller-ejemplo-bogota', estrellas: 5, recomienda: 'si', comentario: '', dispositivo: DISP, reqId: req(), ...extra });
const CLAVE = 'clave-de-prueba-larga-2026';
function nuevo() { const g = crearGAS(); g.ctx.fijarClaveAdmin_(CLAVE); return g; }

test('calificar suma al resumen; el comentario queda pendiente hasta aprobarlo', () => {
  const g = nuevo();
  let r = g.post(calif({ comentario: 'Muy buena atención' }));
  assert.equal(r.ok, true); assert.equal(r.data.estado, 'pendiente');
  g.post(calif({ dispositivo: 'b'.repeat(20), estrellas: 3, recomienda: 'reservas' }));
  const s = g.get({ accion: 'resumen' }).data.contactos['taller-ejemplo-bogota'];
  assert.equal(s.n, 2); assert.equal(s.promedio, 4); assert.equal(s.recomiendan, 1);
  assert.equal(s.opiniones.length, 0, 'no publica sin aprobar');
  const p = g.post({ accion: 'admin_pendientes', clave: CLAVE }).data;
  assert.equal(p.opiniones.length, 1);
  g.post({ accion: 'admin_moderar', clave: CLAVE, tipo: 'opinion', reqId: p.opiniones[0].reqId, estado: 'publicado' });
  const s2 = g.get({ accion: 'resumen' }).data.contactos['taller-ejemplo-bogota'];
  assert.equal(s2.opiniones[0].t, 'Muy buena atención');
});

test('un dispositivo, una calificación por contacto (la nueva reemplaza)', () => {
  const g = nuevo();
  g.post(calif({ estrellas: 2 }));
  const r = g.post(calif({ estrellas: 4 }));
  assert.equal(r.data.reemplazo, true);
  const s = g.get().data.contactos['taller-ejemplo-bogota'];
  assert.equal(s.n, 1); assert.equal(s.promedio, 4);
});

test('idempotente: el mismo reqId no duplica', () => {
  const g = nuevo();
  const d = calif({ dispositivo: 'c'.repeat(20) });
  g.post(d); const r2 = g.post(d);
  assert.equal(r2.data.repetida, true);
  assert.equal(g.filas('CALIFICACIONES').length, 1);
});

test('valida todo lo que llega', () => {
  const g = nuevo();
  for (const malo of [{ estrellas: 0 }, { estrellas: 6 }, { estrellas: 3.5 }, { contactoId: '<script>' }, { dispositivo: 'x' }, { reqId: '' }]) {
    const r = g.post(calif(malo));
    assert.equal(r.ok, false, JSON.stringify(malo)); assert.equal(r.error.codigo, 'DATOS');
  }
  assert.equal(g.post(calif({ sitio: 'http://spam' })).error.codigo, 'RECHAZADO');
  assert.equal(g.post('esto no es json').error.codigo, 'FORMATO');
  assert.equal(g.post({ accion: 'borrar_todo' }).error.codigo, 'ACCION');
});

test('protege la hoja: fórmulas, teléfonos y correos en comentarios', () => {
  const g = nuevo();
  g.post(calif({ comentario: '=IMPORTXML("http://x") llámenme al 300 123 4567 o a yo@correo.com, placa ABC123' }));
  // En la celda se guarda con comilla delante (Sheets no la ejecuta como fórmula)…
  const h = g.hoja('CALIFICACIONES'), col = g.ctx.encabezados_(h).indexOf('comentario') + 1;
  const c = h.celda(2, col);
  assert.ok(c.startsWith("'="), c);
  // …y al leerla la app la entrega sin la comilla (un teléfono «+57…» no debe llegar como «'+57…»)
  assert.ok(g.filas('CALIFICACIONES')[0].comentario.startsWith('=IMPORTXML'));
  assert.ok(!/300 123 4567|yo@correo\.com|ABC123/.test(c), c);
});

test('frenos por ventana fija: se bloquea al pasar el cupo y se libera en la ventana siguiente', () => {
  const g = nuevo();
  let ultimo;
  for (let i = 0; i < 21; i++) ultimo = g.post(calif({ contactoId: `contacto-${i}-x` }));
  assert.equal(ultimo.error?.codigo, 'CUPO');
  g.avanzar(3600 * 1000);
  assert.equal(g.post(calif({ contactoId: 'otro-contacto' })).ok, true);
});

test('bloqueo ocupado devuelve OCUPADO (reintentable)', () => {
  const g = nuevo(); g.ocupado = true;
  assert.equal(g.post(calif()).error.codigo, 'OCUPADO');
});

test('escribe más allá de la fila 1.000 de una hoja nueva', () => {
  const g = nuevo();
  g.ctx.hoja_('CALIFICACIONES');
  for (let i = 0; i < 1002; i++) g.ctx.agregarFila_(g.hoja('CALIFICACIONES'), { fecha: 'x', contactoId: `c-${i}`, estrellas: '5', estado: 'sin_comentario', reqId: `r${i}` });
  assert.equal(g.filas('CALIFICACIONES').length, 1002);
});

test('administración: clave incorrecta se frena tras 5 intentos; la huella no es la clave', () => {
  const g = nuevo();
  for (let i = 0; i < 5; i++) assert.equal(g.post({ accion: 'admin_pendientes', clave: 'mala' }).error.codigo, 'CLAVE');
  assert.equal(g.post({ accion: 'admin_pendientes', clave: CLAVE }).error.codigo, 'BLOQUEADO');
  assert.ok(![...g.props.values()].some((v) => v.includes(CLAVE)));
  g.avanzar(16 * 60 * 1000);
  assert.equal(g.post({ accion: 'admin_pendientes', clave: CLAVE }).ok, true);
});

test('solicitud para aparecer: exige autorización, valida y avisa sin datos personales', () => {
  const g = nuevo();
  g.props.set('CORREO_AVISOS', 'admin@ejemplo.com');
  const base = { accion: 'solicitar', negocio: 'Taller Ejemplo', servicio: 'Polarizado', ciudad: 'Bogotá', telefono: '+57 300 000 0009', web: 'https://ejemplo.com', descripcion: 'Polarizado y PPF', dispositivo: DISP, reqId: req() };
  assert.equal(g.post({ ...base, autoriza: false }).error.codigo, 'AUTORIZACION');
  assert.equal(g.post({ ...base, reqId: req(), autoriza: true, web: 'javascript:alert(1)' }).error.codigo, 'DATOS');
  assert.equal(g.post({ ...base, reqId: req(), autoriza: true, telefono: '12' }).error.codigo, 'DATOS');
  const r = g.post({ ...base, reqId: req(), autoriza: true });
  assert.equal(r.ok, true);
  assert.equal(g.correos.length, 1); assert.ok(!g.correos[0].m.includes('300'));
  const p = g.post({ accion: 'admin_pendientes', clave: CLAVE }).data;
  assert.equal(p.solicitudes[0].negocio, 'Taller Ejemplo');
  assert.ok(!('dispositivo' in p.solicitudes[0]));
  g.post({ accion: 'admin_moderar', clave: CLAVE, tipo: 'solicitud', reqId: p.solicitudes[0].reqId, estado: 'agregada' });
  assert.equal(g.post({ accion: 'admin_pendientes', clave: CLAVE }).data.solicitudes.length, 0);
});

test('el resumen público no expone datos internos', () => {
  const g = nuevo();
  g.post(calif({ comentario: 'Bien' }));
  const txt = JSON.stringify(g.get());
  assert.ok(!/dispositivo|reqId|a1b2c3d4/.test(txt), txt);
});

test('moderar rechazado saca las estrellas del promedio; «quitar comentario» conserva las estrellas', () => {
  const g = nuevo();
  g.post(calif({ estrellas: 1, comentario: 'spam', dispositivo: 'd'.repeat(20) }));
  g.post(calif({ estrellas: 5, comentario: 'Grosería', dispositivo: 'e'.repeat(20) }));
  const [a, b] = g.post({ accion: 'admin_pendientes', clave: CLAVE }).data.opiniones;
  g.post({ accion: 'admin_moderar', clave: CLAVE, tipo: 'opinion', reqId: a.reqId, estado: 'rechazado' });
  g.post({ accion: 'admin_moderar', clave: CLAVE, tipo: 'opinion', reqId: b.reqId, estado: 'sin_comentario' });
  const s = g.get().data.contactos['taller-ejemplo-bogota'];
  assert.equal(s.n, 1); assert.equal(s.promedio, 5); assert.equal(s.opiniones.length, 0);
  assert.equal(g.filas('CALIFICACIONES').find((f) => f.reqId === b.reqId).comentario, '');
});

test('admin_calificaciones: lista todas las de un contacto (con y sin texto), pide clave y valida el id', () => {
  const g = nuevo();
  // (desde v02.01.01 las de 1 estrella no cuentan: aquí se usan 2 y 3 para probar «No contar»)
  g.post(calif({ estrellas: 2, dispositivo: 'f'.repeat(20) }));
  g.post(calif({ estrellas: 3, comentario: 'Lento', dispositivo: 'g'.repeat(20) }));
  g.post(calif({ contactoId: 'otro-negocio-cali', estrellas: 5, dispositivo: 'h'.repeat(20) }));
  assert.equal(g.post({ accion: 'admin_calificaciones', clave: 'mala-clave-1234', contactoId: 'taller-ejemplo-bogota' }).error.codigo, 'CLAVE');
  assert.equal(g.post({ accion: 'admin_calificaciones', clave: CLAVE, contactoId: '../x' }).error.codigo, 'DATOS');
  const r = g.post({ accion: 'admin_calificaciones', clave: CLAVE, contactoId: 'taller-ejemplo-bogota' }).data;
  assert.equal(r.length, 2);
  assert.deepEqual(r.map((x) => x.estado).sort(), ['pendiente', 'sin_comentario']);
  assert.ok(r.every((x) => !('dispositivo' in x)));
  // «No contar» y «Volver a contar» una calificación sin texto
  const sinTexto = r.find((x) => x.estado === 'sin_comentario');
  g.post({ accion: 'admin_moderar', clave: CLAVE, tipo: 'opinion', reqId: sinTexto.reqId, estado: 'rechazado' });
  assert.equal(g.get().data.contactos['taller-ejemplo-bogota'].n, 1);
  g.post({ accion: 'admin_moderar', clave: CLAVE, tipo: 'opinion', reqId: sinTexto.reqId, estado: 'sin_comentario' });
  assert.equal(g.get().data.contactos['taller-ejemplo-bogota'].n, 2);
});

test('1 estrella: se guarda en la hoja pero no cuenta en el resumen ni se puede publicar', () => {
  const g = nuevo();
  g.post(calif({ estrellas: 1, comentario: 'Pésimo, nunca más', dispositivo: 'i'.repeat(20) }));
  g.post(calif({ estrellas: 1, dispositivo: 'j'.repeat(20) }));
  g.post(calif({ estrellas: 4, dispositivo: 'k'.repeat(20) }));
  assert.equal(g.filas('CALIFICACIONES').length, 3); // todas quedan en la hoja
  const s = g.get().data.contactos['taller-ejemplo-bogota'];
  assert.equal(s.n, 1); assert.equal(s.promedio, 4);
  // Solo con calificaciones de 1 estrella, el negocio ni aparece en el resumen (queda «sin calificaciones»)
  g.post(calif({ contactoId: 'otro-negocio-cali', estrellas: 1, dispositivo: 'l'.repeat(20) }));
  assert.equal(g.get().data.contactos['otro-negocio-cali'], undefined);
  // El administrador la ve marcada como «no cuenta» y no la puede publicar
  const op = g.post({ accion: 'admin_pendientes', clave: CLAVE }).data.opiniones.find((o) => o.estrellas === 1);
  assert.equal(op.cuenta, false);
  assert.equal(g.post({ accion: 'admin_moderar', clave: CLAVE, tipo: 'opinion', reqId: op.reqId, estado: 'publicado' }).error.codigo, 'DATOS');
  assert.equal(g.post({ accion: 'admin_moderar', clave: CLAVE, tipo: 'opinion', reqId: op.reqId, estado: 'rechazado' }).ok, true);
  const lista = g.post({ accion: 'admin_calificaciones', clave: CLAVE, contactoId: 'taller-ejemplo-bogota' }).data;
  assert.deepEqual(lista.map((x) => x.cuenta).sort(), [false, false, true]);
});
