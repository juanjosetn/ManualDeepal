// Pruebas del panel con usuarios (servicio 2.0.0): ingreso, roles, datos en la hoja,
// verificaciones, reportes, propuestas, importación y bitácora. Todo con el simulador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { crearGAS } from './gas-simulador.mjs';

const TIPS = JSON.parse(fs.readFileSync(new URL('../data/tips.json', import.meta.url), 'utf8'));
const DIR = JSON.parse(fs.readFileSync(new URL('../data/directorio.json', import.meta.url), 'utf8'));
const ADMIN = ['admin', 'clave-admin-larga-1'];
const COLAB = ['carla', 'clave-colab-larga-2'];

function servicio() {
  const g = crearGAS();
  g.ctx.crearUsuario_(ADMIN[0], 'Admin', 'admin', ADMIN[1], false);
  g.ctx.crearUsuario_(COLAB[0], 'Carla', 'colaborador', COLAB[1], false);
  return g;
}
const entrar = (g, [u, c]) => { const r = g.post({ accion: 'login', usuario: u, clave: c }); assert.ok(r.ok, JSON.stringify(r)); return r.data.token; };
const ok = (r) => { assert.ok(r.ok, JSON.stringify(r.error)); return r.data; };
const err = (r) => { assert.equal(r.ok, false, 'debía fallar'); return r.error.codigo; };

test('contraseñas: solo huella con sal (dos iguales dan huellas distintas) y nada en claro', () => {
  const g = crearGAS();
  g.ctx.crearUsuario_('uno', 'Uno', 'admin', 'misma-clave-123', false);
  g.ctx.crearUsuario_('dos', 'Dos', 'colaborador', 'misma-clave-123', false);
  const [a, b] = g.filas('USUARIOS');
  assert.notEqual(a.hash, b.hash);
  assert.ok(!JSON.stringify(g.filas('USUARIOS')).includes('misma-clave-123'));
});

test('ingreso: correcto da token; incorrecto no; 5 fallos bloquean 15 minutos', () => {
  const g = servicio();
  const r = ok(g.post({ accion: 'login', usuario: 'ADMIN', clave: ADMIN[1] }));
  assert.match(r.token, /^[a-f0-9]{64}$/); assert.equal(r.rol, 'admin');
  for (let i = 0; i < 5; i++) assert.equal(err(g.post({ accion: 'login', usuario: 'carla', clave: 'mala-mala-mala' })), 'CLAVE');
  assert.equal(err(g.post({ accion: 'login', usuario: 'carla', clave: COLAB[1] })), 'BLOQUEADO');
  g.avanzar(16 * 60 * 1000);
  assert.ok(g.post({ accion: 'login', usuario: 'carla', clave: COLAB[1] }).ok);
});

test('migración: sin usuarios, la clave antigua entra como «admin» y crea el usuario', () => {
  const g = crearGAS();
  g.ctx.fijarClaveAdmin_('clave-antigua-12345');
  assert.equal(err(g.post({ accion: 'login', usuario: 'admin', clave: 'otra-cosa-1234' })), 'CLAVE');
  const r = ok(g.post({ accion: 'login', usuario: 'admin', clave: 'clave-antigua-12345' }));
  assert.equal(r.rol, 'admin');
  assert.equal(g.filas('USUARIOS').length, 1);
  // Ya migrada, la clave sola no abre nada: ni el panel viejo (moderar con «clave») ni el ingreso sin usuario
  assert.equal(err(g.post({ accion: 'admin_pendientes', clave: 'clave-antigua-12345' })), 'SESION');
  assert.equal(g.props.has('ADMIN_HASH'), false);
  ok(g.post({ accion: 'login', usuario: 'admin', clave: 'clave-antigua-12345' })); // la contraseña sigue siendo la misma
  const sin = crearGAS();
  assert.equal(err(sin.post({ accion: 'login', usuario: 'admin', clave: 'lo-que-sea-123' })), 'SIN_CONFIGURAR');
});

test('sesión: token inválido o vencido no sirve; desactivar quita el acceso de inmediato', () => {
  const g = servicio();
  assert.equal(err(g.post({ accion: 'panel_resumen', token: 'x'.repeat(64) })), 'SESION');
  const tA = entrar(g, ADMIN), tC = entrar(g, COLAB);
  ok(g.post({ accion: 'panel_resumen', token: tC }));
  ok(g.post({ accion: 'usuario_cambiar', token: tA, usuario: 'carla', estado: 'inactivo' }));
  assert.equal(err(g.post({ accion: 'panel_resumen', token: tC })), 'SESION');
  g.avanzar(7 * 3600 * 1000);
  assert.equal(err(g.post({ accion: 'panel_resumen', token: tA })), 'SESION');
  ok(g.post({ accion: 'salir', token: tA }));
});

test('roles: el colaborador verifica, reporta, propone y modera opiniones, pero no edita ni administra', () => {
  const g = servicio();
  const tA = entrar(g, ADMIN), tC = entrar(g, COLAB);
  ok(g.post({ accion: 'importar', token: tA, tips: TIPS.tips.slice(0, 3), contactos: DIR.contactos.slice(0, 2) }));
  const tip = TIPS.tips[0];
  assert.equal(err(g.post({ accion: 'guardar', token: tC, objeto: 'tip', datos: tip, ver: 1 })), 'PERMISO');
  assert.equal(err(g.post({ accion: 'estado', token: tC, objeto: 'tip', id: tip.id, estado: 'retirado' })), 'PERMISO');
  assert.equal(err(g.post({ accion: 'usuario_crear', token: tC, usuario: 'otro', rol: 'admin' })), 'PERMISO');
  assert.equal(err(g.post({ accion: 'importar', token: tC, tips: [], contactos: [] })), 'PERMISO');
  assert.equal(err(g.post({ accion: 'bitacora', token: tC })), 'PERMISO');
  ok(g.post({ accion: 'verificar', token: tC, objeto: 'tip', id: tip.id }));
  ok(g.post({ accion: 'reportar', token: tC, objeto: 'contacto', id: DIR.contactos[0].id, nota: 'El teléfono ya no contesta.' }));
  ok(g.post({ accion: 'proponer', token: tC, objeto: 'tip', id: tip.id, datos: { ...tip, titulo: 'Título propuesto por Carla' }, nota: 'Más claro' }));
  // Opiniones sí; solicitudes no
  g.post({ accion: 'solicitar', negocio: 'Taller X', servicio: 'Mecánica', ciudad: 'Cali', telefono: '3000000000', autoriza: true, dispositivo: 'a'.repeat(20), reqId: 'solicitud-0001' });
  const p = ok(g.post({ accion: 'admin_pendientes', token: tC }));
  assert.equal(p.solicitudes.length, 0);
  assert.equal(err(g.post({ accion: 'admin_moderar', token: tC, tipo: 'solicitud', reqId: 'solicitud-0001', estado: 'rechazada' })), 'PERMISO');
  assert.equal(ok(g.post({ accion: 'admin_pendientes', token: tA })).solicitudes.length, 1);
});

test('importar, datos públicos en partes de la caché, retirar, verificar y conflicto de versiones', () => {
  const g = servicio();
  const tA = entrar(g, ADMIN), tC = entrar(g, COLAB);
  assert.equal(ok(g.get({ accion: 'datos' })).vacio, true);
  const r = ok(g.post({ accion: 'importar', token: tA, tips: TIPS.tips, contactos: DIR.contactos, ultimoChat: TIPS.ultimoChat }));
  assert.equal(r.tips, TIPS.tips.length); assert.equal(r.contactos, DIR.contactos.length);
  assert.equal(err(g.post({ accion: 'importar', token: tA, tips: TIPS.tips, contactos: [] })), 'DATOS'); // no pisa sin «reemplazar»
  const d1 = ok(g.get({ accion: 'datos' }));
  assert.equal(d1.tips.tips.length, TIPS.tips.length); assert.equal(d1.directorio.contactos.length, DIR.contactos.length);
  assert.equal(d1.tips.tips[0].actualizado, TIPS.tips[0].actualizado, 'conserva la fecha original al importar');
  assert.ok(g.cache.get(`datos_${d1.generacion}_n`)?.v >= '2', 'más de 90 KB: se guarda en varias partes');
  assert.deepEqual(ok(g.get({ accion: 'datos' })), d1, 'la segunda lectura sale igual de la caché');
  // Retirar no borra
  const id = TIPS.tips[1].id;
  ok(g.post({ accion: 'estado', token: tA, objeto: 'tip', id, estado: 'retirado' }));
  assert.ok(!ok(g.get({ accion: 'datos' })).tips.tips.some((t) => t.id === id));
  assert.equal(g.filas('TIPS').find((f) => f.id === id).estado, 'retirado');
  // Verificar se ve en lo público; editar lo vuelve a dejar sin verificar
  const t0 = TIPS.tips[0];
  ok(g.post({ accion: 'verificar', token: tC, objeto: 'tip', id: t0.id }));
  assert.match(ok(g.get({ accion: 'datos' })).tips.tips[0].verificadoEn, /^\d{4}-\d{2}-\d{2}$/);
  const lista = ok(g.post({ accion: 'listar', token: tA, objeto: 'tip' }));
  const ver = lista.find((x) => x.id === t0.id).ver;
  ok(g.post({ accion: 'guardar', token: tA, objeto: 'tip', datos: { ...t0, titulo: 'Editado por admin' }, ver }));
  assert.equal(err(g.post({ accion: 'guardar', token: tA, objeto: 'tip', datos: { ...t0, titulo: 'Con versión vieja' }, ver })), 'CONFLICTO');
  const t0b = ok(g.get({ accion: 'datos' })).tips.tips[0];
  assert.equal(t0b.titulo, 'Editado por admin'); assert.equal(t0b.verificadoEn, undefined);
  // Contacto: web sin https se rechaza
  assert.equal(err(g.post({ accion: 'guardar', token: tA, objeto: 'contacto', nuevo: true, datos: { id: 'nuevo-taller-cali', nombre: 'Nuevo', servicio: 'Mecánica', ciudad: 'Cali', web: 'http://x.co' } })), 'DATOS');
});

test('propuestas y reportes: el admin acepta (se aplica), rechaza o resuelve; el colaborador ve solo lo suyo', () => {
  const g = servicio();
  const tA = entrar(g, ADMIN), tC = entrar(g, COLAB);
  ok(g.post({ accion: 'importar', token: tA, tips: TIPS.tips.slice(0, 2), contactos: DIR.contactos.slice(0, 2) }));
  const p = ok(g.post({ accion: 'proponer', token: tC, objeto: 'contacto', id: DIR.contactos[0].id, datos: { ...DIR.contactos[0], telefono: '+57 300 111 2222' }, nota: 'Cambió de número', reqId: 'prop-0001' }));
  ok(g.post({ accion: 'proponer', token: tC, objeto: 'contacto', id: DIR.contactos[0].id, datos: { ...DIR.contactos[0], telefono: '+57 300 111 2222' }, reqId: 'prop-0001' })); // repetida: no duplica
  const rep = ok(g.post({ accion: 'reportar', token: tC, objeto: 'tip', id: TIPS.tips[0].id, nota: 'La presión cambió' }));
  assert.equal(err(g.post({ accion: 'reportar', token: tC, objeto: 'tip', id: TIPS.tips[0].id, nota: 'x' })), 'DATOS');
  assert.equal(ok(g.post({ accion: 'revisiones_listar', token: tA })).length, 2);
  ok(g.post({ accion: 'revision_resolver', token: tA, reqId: p.reqId, decision: 'aceptada' }));
  assert.equal(ok(g.get({ accion: 'datos' })).directorio.contactos.find((c) => c.id === DIR.contactos[0].id).telefono, '+57 300 111 2222');
  assert.equal(err(g.post({ accion: 'revision_resolver', token: tA, reqId: rep.reqId, decision: 'aceptada' })), 'DATOS'); // un reporte no se «acepta»
  ok(g.post({ accion: 'revision_resolver', token: tA, reqId: rep.reqId, decision: 'resuelta' }));
  assert.equal(err(g.post({ accion: 'revision_resolver', token: tA, reqId: rep.reqId, decision: 'rechazada' })), 'DATOS'); // ya resuelta
  // Otro colaborador no ve las de Carla
  ok(g.post({ accion: 'usuario_crear', token: tA, usuario: 'pedro', nombre: 'Pedro', rol: 'colaborador' }));
  g.ctx.crearUsuario_('pedro', 'Pedro', 'colaborador', 'clave-pedro-12345', false);
  const tP = entrar(g, ['pedro', 'clave-pedro-12345']);
  assert.equal(ok(g.post({ accion: 'revisiones_listar', token: tP })).length, 0);
  assert.equal(err(g.post({ accion: 'revision_resolver', token: tC, reqId: p.reqId, decision: 'rechazada' })), 'PERMISO');
});

test('usuarios: clave temporal, cambio obligatorio y nunca quedarse sin administrador', () => {
  const g = servicio();
  const tA = entrar(g, ADMIN);
  const nuevo = ok(g.post({ accion: 'usuario_crear', token: tA, usuario: 'Laura.M', nombre: 'Laura', rol: 'colaborador' }));
  assert.equal(nuevo.usuario, 'laura.m'); assert.match(nuevo.claveTemporal, /^[A-Za-z2-9]{14}$/);
  assert.equal(err(g.post({ accion: 'usuario_crear', token: tA, usuario: 'laura.m', rol: 'colaborador' })), 'DATOS');
  const ses = ok(g.post({ accion: 'login', usuario: 'laura.m', clave: nuevo.claveTemporal }));
  assert.equal(ses.debeCambiar, true);
  assert.equal(err(g.post({ accion: 'cambiar_clave', token: ses.token, actual: nuevo.claveTemporal, nueva: 'corta' })), 'DATOS');
  ok(g.post({ accion: 'cambiar_clave', token: ses.token, actual: nuevo.claveTemporal, nueva: 'nueva-clave-de-laura' }));
  assert.equal(ok(g.post({ accion: 'login', usuario: 'laura.m', clave: 'nueva-clave-de-laura' })).debeCambiar, false);
  // Último admin: no se puede desactivar ni bajar de rol; tampoco a uno mismo
  assert.equal(err(g.post({ accion: 'usuario_cambiar', token: tA, usuario: 'admin', estado: 'inactivo' })), 'DATOS');
  assert.equal(err(g.post({ accion: 'usuario_cambiar', token: tA, usuario: 'admin', rol: 'colaborador' })), 'DATOS');
  const r = ok(g.post({ accion: 'usuario_cambiar', token: tA, usuario: 'carla', restablecer: true }));
  assert.match(r.claveTemporal, /^[A-Za-z2-9]{14}$/);
  assert.equal(err(g.post({ accion: 'login', usuario: 'carla', clave: COLAB[1] })), 'CLAVE');
});

test('solicitud «Quiero aparecer» → contacto publicado de una vez; fórmulas neutralizadas; bitácora sin contraseñas', () => {
  const g = servicio();
  const tA = entrar(g, ADMIN);
  g.post({ accion: 'solicitar', negocio: 'Taller Y', servicio: 'Mecánica', ciudad: 'Cali', telefono: '3000000000', autoriza: true, dispositivo: 'b'.repeat(20), reqId: 'solicitud-0002' });
  ok(g.post({ accion: 'solicitud_agregar', token: tA, reqId: 'solicitud-0002', contacto: { id: 'taller-y-cali', nombre: 'Taller Y', servicio: 'Mecánica', ciudad: 'Cali', telefono: '+57 300 000 0000', tipo: 'empresa' } }));
  assert.ok(ok(g.get({ accion: 'datos' })).directorio.contactos.some((c) => c.id === 'taller-y-cali'));
  assert.equal(g.filas('SOLICITUDES')[0].estado, 'agregada');
  ok(g.post({ accion: 'guardar', token: tA, objeto: 'tip', nuevo: true, datos: { id: 'tip-con-formula', cat: 'llantas', titulo: '=HYPERLINK("http://x","clic")', tipo: 'hacer', como: 'x' } }));
  const h = g.hoja('TIPS'), col = g.ctx.encabezados_(h).indexOf('titulo') + 1;
  assert.ok(String(h.celda(2, col)).startsWith("'="), 'la celda no queda como fórmula');
  const bit = ok(g.post({ accion: 'bitacora', token: tA }));
  assert.ok(bit.some((b) => b.accion === 'agregar_solicitud') && bit.some((b) => b.accion === 'crear') && bit.some((b) => b.accion === 'ingreso'));
  assert.ok(!JSON.stringify(g.filas('BITACORA')).includes(ADMIN[1]));
});
