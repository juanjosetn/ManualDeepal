// =====================================================================
// Script árbitro de la versión v02.03 — panel de administración con usuario
// y contraseña, datos en la hoja de Google y colaboradores.
// Pedido del autor:
//   «desde allí se debería poder realizar cualquier ajuste de administración,
//    como agregar o quitar del directorio, cargar el chat del grupo en .zip, etc,
//    desde un pánel de ingreso tipo html para hacer todos los ajustes. Se debe
//    poder ingresar con usuario y contraseña de admin. Implementa también la
//    opción de ingreso de colaboradores que pueden corroborar la información publicada.»
// Decisiones del autor: datos en la hoja de Google; panel dentro del manual (#admin);
// el .zip del chat se procesa en el equipo; colaboradores: verificar, reportar,
// proponer cambios y moderar opiniones.
// Debe FALLAR contra v02.02.00cl.
// Uso: servidor en la carpeta y BASE=http://localhost:8080/ node tests/arbitro-v02-03.mjs
//      RAIZ=/otra/carpeta para comparar con otra versión.
// El Apps Script no se llama de verdad: lo responde el simulador (tests/gas-simulador.mjs).
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = process.env.RAIZ || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE || 'http://localhost:8080/';
let fallas = 0, total = 0;
function caso(nombre, ok, detalle = '') { total++; if (ok) console.log('✔', nombre); else { fallas++; console.log('✘', nombre, detalle ? `\n    ${String(detalle).slice(0, 300)}` : ''); } }
const leer = (r) => { try { return fs.readFileSync(path.join(RAIZ, r), 'utf8'); } catch { return ''; } };
const sinComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// El simulador y la ayuda de pruebas se toman de la carpeta que se revisa (si no existen, de esta).
const apoyo = fs.existsSync(path.join(RAIZ, 'tests/apoyo-comunidad.mjs')) ? path.join(RAIZ, 'tests/apoyo-comunidad.mjs') : new URL('./apoyo-comunidad.mjs', import.meta.url).pathname;
const { nuevoServicio, conectar, CLAVE_PRUEBA } = await import(pathToFileURL(apoyo).href);

// ---------- A. Revisión estática ----------
const gs = leer('apps-script/Codigo.gs'), adm = leer('js/admin.js'), com = leer('COMUNIDAD.md');
caso('servicio 2.0.0 o posterior (usuarios y datos en la hoja)', /SERVICIO_VERSION = '([2-9]|\d{2,})\.\d+\.\d+'/.test(gs));
const permisos = (() => { const m = gs.match(/colaborador:\s*\[([^\]]*)\]/); return m ? m[1].replace(/['\s]/g, '').split(',') : []; })();
caso('colaborador: solo leer, verificar, reportar, proponer y moderar', permisos.sort().join(',') === 'leer,moderar,proponer,reportar,verificar', permisos.join(','));
caso('contraseñas con sal repetida miles de veces (no una huella simple)', /function derivar_\(clave, sal, iter\)/.test(gs) && Number((gs.match(/ITERACIONES_ = (\d+)/) || [])[1]) >= 1000);
caso('panel sin ventanas del navegador (alert, confirm, prompt)', adm.length > 0 && !/\b(alert|confirm|prompt)\s*\(/.test(sinComentarios(adm)));
caso('la sesión vive en sessionStorage (se borra al cerrar la pestaña), nunca en localStorage', /sessionStorage\.setItem\(SESION/.test(adm) && !/localStorage\.setItem\(SESION/.test(adm));
caso('el chat no se envía al servidor: el panel no manda mensajes ni textos del hilo en ninguna acción', adm.length > 0 && !/api\([^)]*(mensajes|textoDelHilo|chat\.)/.test(adm));
caso('COMUNIDAD.md explica la actualización (Nueva versión, misma URL), el ingreso como «admin» y los colaboradores', /Nueva versión/.test(com) && /usuario\s+\*?\*?admin/i.test(com) && /colaborador/i.test(com));
caso('el manual muestra «Revisado por colaboradores»', /Revisado por colaboradores/.test(leer('js/app.js')));

// ---------- B. Reglas del servidor (simulador) ----------
const g = nuevoServicio();
const post = (o) => g.post(o);
const tokenDe = (u, c) => post({ accion: 'login', usuario: u, clave: c }).data?.token;
{
  // La clave vieja (servicio 1.x) entra como «admin» y se convierte en usuario
  const r = post({ accion: 'login', usuario: 'admin', clave: CLAVE_PRUEBA });
  caso('servidor: la clave de «configurar» entra con el usuario «admin» (migración)', r.ok && r.data.rol === 'admin' && /^[a-f0-9]{64}$/.test(r.data.token || ''), JSON.stringify(r.error));
  caso('servidor: ya migrada, la clave sola deja de abrir la moderación (solo usuario + contraseña)', post({ accion: 'admin_pendientes', clave: CLAVE_PRUEBA }).error?.codigo === 'SESION');
  caso('servidor: la hoja USUARIOS guarda huella y sal, nunca la contraseña', g.filas('USUARIOS').length === 1 && !JSON.stringify(g.filas('USUARIOS')).includes(CLAVE_PRUEBA) && /^[a-f0-9]{64}$/.test(g.filas('USUARIOS')[0].hash || ''));
  const malo = post({ accion: 'guardar', token: 'f'.repeat(64), objeto: 'tip', datos: {} });
  caso('servidor: sin sesión válida no se guarda nada', !malo.ok && malo.error.codigo === 'SESION');
}

// ---------- C. Navegador ----------
let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.log('(sin Playwright: se omiten las pruebas de navegador)'); }
if (chromium) {
  const nav = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const errores = [];
  const TIPS = JSON.parse(leer('data/tips.json')).tips || [];
  const DIR = JSON.parse(leer('data/directorio.json')).contactos || [];
  async function pagina(hash = '#admin', { ancho = 1280, alto = 900, oscuro = false } = {}) {
    const ctx = await nav.newContext({ viewport: { width: ancho, height: alto }, locale: 'es-CO', timezoneId: 'America/Bogota', acceptDownloads: true });
    if (oscuro) await ctx.addInitScript(() => { try { localStorage.setItem('deepal-tema', 'oscuro'); } catch { /* */ } });
    const llamadas = await conectar(ctx, g);
    const p = await ctx.newPage();
    p.setDefaultTimeout(8000);
    p.on('pageerror', (e) => errores.push(e.message));
    await p.goto(BASE + hash);
    return { p, ctx, llamadas };
  }
  const entrar = async (p, u, c) => { await p.waitForSelector('#formIngreso'); await p.fill('#inUsuario', u); await p.fill('#inClave', c); await p.click('#btnEntrar'); };
  const ir = async (p, sec) => { await p.click(`#navPanel [data-sec="${sec}"]`); };
  const esperar = async (fn, ms = 8000) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (fn()) return true; } catch { /* aún no */ } await new Promise((r) => setTimeout(r, 100)); } return false; };
  const fila = (hoja, fn) => g.filas(hoja).find(fn);
  const tip0 = TIPS.find((t) => t.cat === 'llantas') || TIPS[0], tip1 = TIPS.find((t) => t.id !== tip0.id && t.cat === tip0.cat) || TIPS[1];
  let claveTemporal = '';

  // C1. Ingreso del administrador
  const A = await pagina();
  {
    const { p } = A;
    try {
      await entrar(p, 'admin', 'otra-clave-equivocada');
      await p.waitForFunction(() => /incorrect/.test(document.getElementById('estadoIngreso')?.textContent || ''));
      caso('panel: pide usuario y contraseña; si están mal, lo dice y no abre', (await p.locator('#navPanel').count()) === 0);
      await entrar(p, 'admin', CLAVE_PRUEBA);
      await p.waitForSelector('#navPanel button');
      caso('panel: con usuario y contraseña correctos entra', /Administrador/.test(await p.textContent('#panel')));
      const guardado = await p.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
      caso('la contraseña no queda en el navegador; el pase (token) solo en sessionStorage', !guardado.includes(CLAVE_PRUEBA) && await p.evaluate(() => /"token":"[a-f0-9]{64}"/.test(sessionStorage.getItem('deepal-sesion') || '') && !JSON.stringify({ ...localStorage }).includes('token')));
      caso('la contraseña se borra del formulario al entrar', (await p.locator('#inClave').count()) === 0);
      const secciones = await p.$$eval('#navPanel button', (b) => b.map((x) => x.dataset.sec));
      caso('el administrador ve todas las secciones (tips, directorio, chat, opiniones, revisiones, usuarios, bitácora, copia)', ['resumen', 'tips', 'directorio', 'chat', 'opiniones', 'revisiones', 'usuarios', 'bitacora', 'copia'].every((s) => secciones.includes(s)), secciones.join(','));

      // C2. Hoja vacía → importar una vez
      caso('resumen: avisa que la hoja está vacía y ofrece importar', /todavía está vacía/.test(await p.textContent('#seccionPanel')));
      await ir(p, 'copia'); await p.click('#btnImportar');
      await p.waitForFunction(() => /Listo/.test(document.getElementById('resImportar').textContent), null, { timeout: 20000 });
      caso('importar: sube a la hoja todos los tips y contactos de GitHub', g.filas('TIPS').length === TIPS.length && g.filas('DIRECTORIO').length === DIR.length, `${g.filas('TIPS').length}/${TIPS.length}, ${g.filas('DIRECTORIO').length}/${DIR.length}`);
      await p.click('#btnImportar');
      await p.waitForSelector('#dlgPanel[open]');
      caso('importar de nuevo: advierte que reemplaza todo y el foco empieza en «Cancelar»', /reemplaza todo/.test(await p.textContent('#dlgPanel')) && await p.evaluate(() => document.activeElement?.id === 'dlgNo'));
      await p.keyboard.press('Escape');
      caso('…y con Escape no reemplaza nada', !(await p.locator('#dlgPanel[open]').count()) && g.filas('TIPS').length === TIPS.length);

      // C3. Editar un tip: queda en la hoja y el manual lo muestra
      await ir(p, 'tips'); await p.waitForSelector('.registro');
      await p.fill('#buscarReg', tip0.titulo.split(' ').slice(0, 4).join(' '));
      await p.locator(`.registro[data-id="${tip0.id}"] [data-acc="editar"]`).click();
      await p.fill('#fTitulo', 'Prueba v02.03: título editado desde el panel');
      await p.click('#formTip button[value="publicado"]');
      caso('editar un tip lo guarda en la hoja (versión 2)', await esperar(() => { const f = fila('TIPS', (x) => x.id === tip0.id); return f.titulo === 'Prueba v02.03: título editado desde el panel' && f.ver === '2' && f.por === 'admin'; }));
      const pub = g.get({ accion: 'datos' }).data;
      caso('…y queda publicado para el manual', pub.tips.tips.some((t) => t.id === tip0.id && t.titulo === 'Prueba v02.03: título editado desde el panel'));

      // C4. Retirar (quitar) con diálogo propio
      await p.fill('#buscarReg', ''); await p.selectOption('#filtroReg', 'publicado');
      await p.fill('#buscarReg', tip1.titulo.split(' ').slice(0, 4).join(' '));
      await p.locator(`.registro[data-id="${tip1.id}"] [data-acc="retirar"]`).click();
      await p.waitForSelector('#dlgPanel[open]');
      caso('retirar pide confirmación en un diálogo propio con el foco en «Cancelar»', await p.evaluate(() => document.activeElement?.id === 'dlgNo'));
      await p.click('#dlgSi');
      caso('retirar lo saca del manual sin borrarlo de la hoja', await esperar(() => fila('TIPS', (x) => x.id === tip1.id)?.estado === 'retirado') && !g.get({ accion: 'datos' }).data.tips.tips.some((t) => t.id === tip1.id));

      // C5. Directorio: agregar (con validación) y quitar
      await ir(p, 'directorio'); await p.waitForSelector('.registro');
      await p.click('#btnNuevoReg');
      await p.fill('#cNombre', 'Taller Prueba Arbitro'); await p.fill('#cServicio', 'Latonería y pintura'); await p.fill('#cCiudad', 'Bogotá');
      await p.fill('#cTelefono', '601 555 0000'); await p.fill('#cWeb', 'http://inseguro.example');
      await p.click('#formContacto button[value="publicado"]');
      await p.waitForTimeout(300);
      caso('directorio: una web sin https:// se rechaza antes de enviar', /https/.test(await p.textContent('#estadoContacto')) && !A.llamadas.some((l) => /Taller Prueba Arbitro/.test(l.cuerpo || '')));
      await p.fill('#cWeb', 'https://taller.example.com');
      await p.click('#formContacto button[value="publicado"]');
      caso('directorio: agregar un contacto lo publica en la hoja con id estable', await esperar(() => { const f = fila('DIRECTORIO', (x) => x.nombre === 'Taller Prueba Arbitro'); return f && f.estado === 'publicado' && f.id === 'taller-prueba-arbitro-bogota'; }));
      await p.fill('#buscarReg', 'Taller Prueba Arbitro');
      await p.locator('.registro[data-id="taller-prueba-arbitro-bogota"] [data-acc="retirar"]').click();
      await p.click('#dlgSi');
      caso('directorio: quitar un contacto lo retira del manual', await esperar(() => fila('DIRECTORIO', (x) => x.id === 'taller-prueba-arbitro-bogota')?.estado === 'retirado'));

      // C6. Crear colaborador: contraseña temporal una sola vez
      await ir(p, 'usuarios'); await p.waitForSelector('#formUsuario');
      await p.fill('#uUsuario', 'carla.prueba'); await p.fill('#uNombre', 'Carla Prueba');
      await p.click('#formUsuario button[type="submit"]');
      await p.waitForSelector('#dlgPanel[open] #claveTemporal');
      claveTemporal = (await p.textContent('#claveTemporal')).trim();
      caso('crear colaborador: muestra una contraseña temporal y un mensaje listo para enviar', claveTemporal.length >= 12 && (await p.inputValue('#textoClave')).includes(claveTemporal));
      await p.click('#dlgSi');
      const u = fila('USUARIOS', (x) => x.usuario === 'carla.prueba');
      caso('…la hoja guarda el rol colaborador, que debe cambiarla, y no la contraseña', u?.rol === 'colaborador' && u.debeCambiar === 'si' && !JSON.stringify(g.filas('USUARIOS')).includes(claveTemporal));
      caso('…y la bitácora registra quién lo creó, sin la contraseña', g.filas('BITACORA').some((x) => x.accion === 'crear_usuario' && x.usuario === 'admin') && !JSON.stringify(g.filas('BITACORA')).includes(claveTemporal));
    } catch (e) { caso('el recorrido del administrador se pudo completar', false, e.message.split('\n')[0]); }
  }

  // C7. Colaborador: cambio obligatorio de contraseña y permisos
  const C = await pagina();
  {
    const { p } = C;
    try {
      await entrar(p, 'carla.prueba', claveTemporal);
      await p.waitForSelector('#formClave');
      caso('colaborador nuevo: debe cambiar la contraseña temporal antes de seguir', (await p.locator('#navPanel').count()) === 0);
      await p.fill('#clActual', claveTemporal); await p.fill('#clNueva', 'frase secreta de carla'); await p.fill('#clRepite', 'frase secreta distinta');
      await p.click('#formClave button[type="submit"]');
      caso('…si las dos nuevas no coinciden, lo dice', /no coinciden/.test(await p.textContent('#estadoClave')));
      await p.fill('#clRepite', 'frase secreta de carla');
      await p.click('#formClave button[type="submit"]');
      await p.waitForSelector('#navPanel button', { timeout: 10000 });
      caso('…y con la nueva entra al panel', fila('USUARIOS', (x) => x.usuario === 'carla.prueba')?.debeCambiar === 'no');
      const secciones = await p.$$eval('#navPanel button', (b) => b.map((x) => x.dataset.sec));
      caso('colaborador: no ve usuarios, bitácora, copia ni chat', !['usuarios', 'bitacora', 'copia', 'chat'].some((s) => secciones.includes(s)) && secciones.includes('opiniones'), secciones.join(','));
      caso('colaborador: su sección de revisiones se llama «Mis aportes»', /Mis aportes/.test(await p.textContent('#navPanel')));

      await ir(p, 'tips'); await p.waitForSelector('.registro');
      const fila0 = p.locator(`.registro[data-id="${tip0.id}"]`);
      await p.fill('#buscarReg', 'Prueba v02.03');
      caso('colaborador: en un tip puede verificar, reportar y proponer, pero no editar ni retirar', (await fila0.locator('[data-acc="verificar"]').count()) === 1 && (await fila0.locator('[data-acc="reportar"]').count()) === 1 && (await fila0.locator('[data-acc="proponer"]').count()) === 1 && (await fila0.locator('[data-acc="editar"], [data-acc="retirar"]').count()) === 0);
      await fila0.locator('[data-acc="verificar"]').click();
      await p.fill('#dlgCampo', 'Lo comparé con la etiqueta del carro');
      await p.click('#dlgSi');
      caso('verificar: la hoja guarda quién y cuándo', await esperar(() => fila('TIPS', (x) => x.id === tip0.id)?.verificadoPor === 'carla.prueba'));
      caso('…y queda la revisión con su nota', g.filas('REVISIONES').some((x) => x.tipo === 'verificacion' && x.usuario === 'carla.prueba' && /etiqueta/.test(x.nota)));
      await fila0.locator('[data-acc="reportar"]').click();
      await p.click('#dlgSi');
      caso('reportar sin contar qué está mal: lo pide y no envía', /5 letras/.test(await p.textContent('#dlgError')) && !g.filas('REVISIONES').some((x) => x.tipo === 'reporte'));
      await p.fill('#dlgCampo', 'La presión del S07 cambió con la última actualización');
      await p.click('#dlgSi');
      caso('reportar un error lo deja pendiente para el administrador', await esperar(() => g.filas('REVISIONES').some((x) => x.tipo === 'reporte' && x.estado === 'pendiente' && x.usuario === 'carla.prueba')));
      await fila0.locator('[data-acc="proponer"]').click();
      await p.fill('#fOjo', 'Revisa la etiqueta del marco de la puerta.');
      await p.fill('#fMotivo', 'Falta decir dónde está la etiqueta');
      await p.click('#formTip button[value="propuesta"]');
      caso('proponer un cambio no publica: queda como propuesta pendiente', await esperar(() => g.filas('REVISIONES').some((x) => x.tipo === 'propuesta' && x.estado === 'pendiente')) && !/marco de la puerta/.test(fila('TIPS', (x) => x.id === tip0.id).datos));
      const intento = post({ accion: 'guardar', token: JSON.parse(await p.evaluate(() => sessionStorage.getItem('deepal-sesion'))).token, objeto: 'tip', datos: { ...tip0, ojo: 'hackeado' } });
      caso('servidor: aunque el colaborador fuerce «guardar», responde «sin permiso»', !intento.ok && intento.error.codigo === 'PERMISO');

      // Opiniones: el colaborador modera, pero no ve las solicitudes (traen datos personales del negocio)
      const op = g.post({ accion: 'calificar', contactoId: DIR[0].id, estrellas: 4, comentario: 'Opinión de prueba para colaborador', dispositivo: 'c'.repeat(24), reqId: 'op-colab-prueba-1' });
      const sol = g.post({ accion: 'solicitar', negocio: 'Negocio Privado Prueba', servicio: 'Polarizados', ciudad: 'Bogotá', telefono: '3000000000', descripcion: 'x', autoriza: true, solicitante: 'Persona Privada', dispositivo: 'd'.repeat(24), reqId: 'sol-colab-prueba-1' });
      if (!op.ok || !sol.ok) throw new Error(`semillas: ${JSON.stringify([op.error, sol.error])}`);
      await ir(p, 'opiniones');
      await p.waitForSelector('#listaOpiniones tbody tr');
      caso('colaborador: ve las opiniones pero no las solicitudes ni sus datos', (await p.locator('#listaSolicitudes tr').count()) === 0 && !(await p.content()).includes('Persona Privada'));
      const tokC = JSON.parse(await p.evaluate(() => sessionStorage.getItem('deepal-sesion'))).token;
      const resp = post({ accion: 'admin_pendientes', token: tokC });
      caso('servidor: al colaborador tampoco le llegan las solicitudes (no basta con ocultarlas en pantalla)', resp.ok && resp.data.solicitudes.length === 0 && !JSON.stringify(resp.data).includes('Persona Privada'));
      await p.locator('#listaOpiniones tbody tr', { hasText: 'Opinión de prueba para colaborador' }).locator('[data-estado="publicado"]').click();
      caso('colaborador: puede publicar una opinión', await esperar(() => g.filas('CALIFICACIONES').some((x) => /colaborador/.test(x.comentario) && x.estado === 'publicado')));
      await ir(p, 'revisiones'); await p.waitForSelector('.revision');
      caso('«Mis aportes» muestra su reporte y su propuesta pendientes, sin botones para decidir', (await p.locator('.revision').count()) === 2 && (await p.locator('.revision [data-decision]').count()) === 0);
    } catch (e) { caso('el recorrido del colaborador se pudo completar', false, e.message.split('\n')[0]); }
  }

  // C8. El manual público muestra «Revisado por colaboradores»
  {
    const { p, ctx } = await pagina(`#tip/${tip0.id}`, { ancho: 390, alto: 844 });
    try {
      await p.waitForFunction(() => /Revisado por colaboradores/.test(document.body.textContent), null, { timeout: 12000 });
      caso('el manual (celular) muestra el tip editado y «Revisado por colaboradores el …»', /Prueba v02\.03: título editado/.test(await p.textContent('body')));
      caso('el manual ya no muestra el tip retirado', !(await p.textContent('#listaTips').catch(() => '')).includes(tip1.titulo));
    } catch (e) { caso('el manual muestra la marca de revisado', false, e.message.split('\n')[0]); }
    await ctx.close();
  }

  // C9. El administrador decide reportes y propuestas
  {
    const { p } = A;
    try {
      await ir(p, 'revisiones'); await p.waitForSelector('.revision');
      const prop = p.locator('.revision', { hasText: 'Propuesta de cambio' });
      caso('revisiones: la propuesta muestra lo anterior tachado y lo propuesto resaltado', (await prop.locator('table.cambios del').count()) >= 1 && /marco de la puerta/.test(await prop.locator('table.cambios ins').first().textContent()));
      caso('revisiones: el contador de la pestaña avisa cuántas hay', /2/.test(await p.textContent('#navPanel [data-sec="revisiones"]')));
      await prop.locator('[data-decision="aceptada"]').click();
      caso('aceptar una propuesta la publica en la hoja', await esperar(() => /marco de la puerta/.test(fila('TIPS', (x) => x.id === tip0.id).datos) && g.filas('REVISIONES').some((x) => x.tipo === 'propuesta' && x.estado === 'aceptada')));
      await p.locator('.revision', { hasText: 'Reporte de error' }).locator('[data-decision="resuelta"]').click();
      caso('un reporte se marca como resuelto', await esperar(() => g.filas('REVISIONES').some((x) => x.tipo === 'reporte' && x.estado === 'resuelta')));
      await ir(p, 'bitacora'); await p.waitForSelector('#listaBitacora table');
      const bit = await p.textContent('#listaBitacora');
      caso('bitácora: muestra quién hizo qué (editar, retirar, verificar, aceptar)', /Editó/.test(bit) && /Retiró/.test(bit) && /Verificó/.test(bit) && /Aceptó una propuesta/.test(bit) && /carla\.prueba/.test(bit));

      // Conflicto: otra persona guardó mientras el admin editaba
      await ir(p, 'tips'); await p.waitForSelector('.registro');
      await p.fill('#buscarReg', 'Prueba v02.03');
      await p.locator(`.registro[data-id="${tip0.id}"] [data-acc="editar"]`).click();
      const otro = tokenDe('admin', CLAVE_PRUEBA);
      const actual = JSON.parse(fila('TIPS', (x) => x.id === tip0.id).datos);
      post({ accion: 'guardar', token: otro, objeto: 'tip', datos: { ...actual, como: 'Cambio de otra persona' }, ver: Number(fila('TIPS', (x) => x.id === tip0.id).ver) });
      await p.fill('#fComo', 'Mi cambio');
      await p.click('#formTip button[value="publicado"]');
      await p.waitForSelector('#dlgPanel[open]');
      caso('si otra persona guardó en medio, avisa en vez de pisarla en silencio', /Alguien más cambió/.test(await p.textContent('#dlgPanel')));
      await p.click('#dlgNo');
      caso('…y «Ver su versión» conserva lo de la otra persona', await esperar(() => /Cambio de otra persona/.test(fila('TIPS', (x) => x.id === tip0.id).datos)));

      // Desactivar al colaborador: pierde el acceso aunque tenga la sesión abierta
      await ir(p, 'usuarios'); await p.waitForSelector('[data-u="carla.prueba"]');
      await p.locator('[data-u="carla.prueba"] [data-u-acc="inactivo"]').click();
      await p.click('#dlgSi');
      await esperar(() => fila('USUARIOS', (x) => x.usuario === 'carla.prueba')?.estado === 'inactivo');
      await C.p.click('#navPanel [data-sec="tips"]');
      await C.p.waitForSelector('#formIngreso', { timeout: 8000 }).catch(() => {});
      caso('un colaborador desactivado pierde el acceso en su siguiente acción', (await C.p.locator('#formIngreso').count()) === 1 && /desactivado/.test(await C.p.textContent('#estadoIngreso')));
      caso('nadie se queda sin administrador: el admin no puede quitarse su propio rol', (await p.locator('[data-u="admin"] [data-u-acc]').count()) === 0 && !post({ accion: 'usuario_cambiar', token: otro, usuario: 'admin', rol: 'colaborador' }).ok);
    } catch (e) { caso('el recorrido de revisiones se pudo completar', false, e.message.split('\n')[0]); }
  }

  // C10. Chat del grupo: se lee en el equipo y nunca viaja al servidor
  {
    const { p, llamadas } = A;
    try {
      await ir(p, 'chat');
      await p.setInputFiles('#archivoChat', path.join(RAIZ, 'tests/fixtures/chat-ejemplo.zip'));
      await p.waitForSelector('#resumenChat:has-text("mensajes")');
      await p.fill('#desde', '2026-11-01'); await p.click('#btnBuscarCand');
      await p.waitForSelector('.candidato');
      const html = await p.content();
      caso('chat: se anonimiza en pantalla (sin nombres, correos, placas ni teléfonos)', ['carla@example.com', 'ABC123', '3000000002', 'Ana Prueba'].every((x) => !html.includes(x)));
      await p.click('.candidato [data-acc="mano"]');
      await p.fill('#fTitulo', 'Prueba v02.03: tip desde el chat'); await p.fill('#fComo', 'Paso de prueba.');
      await p.click('#formTip button[value="borrador"]');
      await esperar(() => fila('TIPS', (x) => x.titulo === 'Prueba v02.03: tip desde el chat'));
      const enviado = llamadas.map((l) => l.cuerpo || '').join('\n');
      caso('chat: el tip aprobado llega a la hoja como borrador', fila('TIPS', (x) => x.titulo === 'Prueba v02.03: tip desde el chat')?.estado === 'borrador');
      caso('chat: ningún mensaje del chat ni dato personal salió hacia el servidor', !/Ana Prueba|Beto Ensayo|Carla Demo|carla@example\.com|ABC123|3000000002|300 0000001|me pusieron 45 psi|Chat de WhatsApp con/.test(enviado));
    } catch (e) { caso('el recorrido del chat se pudo completar', false, e.message.split('\n')[0]); }
  }

  // C11. Sesión vencida: vuelve a pedir el ingreso
  {
    const { p } = A;
    try {
      await p.waitForTimeout(1500); // que terminen las consultas que dejó el paso anterior
      g.avanzar(7 * 3600e3);
      await ir(p, 'directorio');
      await p.waitForSelector('#formIngreso', { timeout: 8000 });
      caso('sesión vencida (más de 6 horas sin uso): vuelve a pedir usuario y contraseña', /venció/.test(await p.textContent('#estadoIngreso')) && !(await p.evaluate(() => sessionStorage.getItem('deepal-sesion'))));
      await entrar(p, 'admin', CLAVE_PRUEBA); await p.waitForSelector('#navPanel button');
      caso('al volver a entrar no quedan datos del usuario anterior en pantalla (empieza en Resumen)', await p.getAttribute('#navPanel [data-sec="resumen"]', 'aria-current') === 'page');
    } catch (e) { caso('la sesión vencida se pudo comprobar', false, e.message.split('\n')[0]); }
    await A.ctx.close(); await C.ctx.close();
  }

  // C12. Celular y modo oscuro: nada se sale de la pantalla
  for (const oscuro of [false, true]) {
    const { p, ctx } = await pagina('#admin', { ancho: 390, alto: 844, oscuro });
    try {
      await entrar(p, 'admin', CLAVE_PRUEBA); await p.waitForSelector('#navPanel button');
      const anchos = [];
      for (const s of ['resumen', 'tips', 'revisiones', 'usuarios']) {
        await ir(p, s); await p.waitForTimeout(700);
        anchos.push(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
      }
      caso(`celular${oscuro ? ' en modo oscuro' : ''}: el panel no se sale de la pantalla`, anchos.every((x) => x <= 1), anchos.join(','));
      await p.screenshot({ path: path.join(process.env.CAPTURAS || '/tmp', `panel-celular${oscuro ? '-oscuro' : ''}.png`) });
    } catch (e) { caso('el panel en celular se pudo revisar', false, e.message.split('\n')[0]); }
    await ctx.close();
  }

  caso('sin errores de JavaScript en la página', errores.length === 0, errores.join(' | '));
  await nav.close();
}

console.log(`\n${total - fallas}/${total} afirmaciones pasaron`);
process.exit(fallas ? 1 : 0);
