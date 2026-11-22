// Mutaciones de la versión v02.03 (panel con usuario y contraseña, datos en la hoja y colaboradores):
// siembra un defecto por vez en una copia y comprueba que tests/arbitro-v02-03.mjs lo detecta.
// Uso: node tests/mutaciones-v02-03.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GS = 'apps-script/Codigo.gs', AD = 'js/admin.js';
const MUTACIONES = [
  [GS, "colaborador: ['leer', 'verificar', 'reportar', 'proponer', 'moderar']", "colaborador: ['leer', 'editar', 'verificar', 'reportar', 'proponer', 'moderar']", 'el colaborador puede publicar cambios'],
  [GS, "if (!u || u.estado !== 'activo') { cache.remove(clave);", "if (!u) { cache.remove(clave);", 'un usuario desactivado sigue entrando con su sesión abierta'],
  [GS, 'if (Number(d.ver) !== (Number(f.ver) || 1)) {', 'if (false) {', 'guardar pisa en silencio el cambio de otra persona'],
  [GS, "var verSolicitudes = !u || !u.rol || (PERMISOS_[u.rol] || []).indexOf('solicitudes') >= 0;", 'var verSolicitudes = true;', 'el colaborador ve los datos de quienes piden aparecer'],
  [GS, "if (usuario === 'admin' && huella_(clave) === viejo) {", 'if (false) {', 'la clave de «configurar» ya no entra (sin migración)'],
  [GS, "    if (decision === 'aceptada') {", '    if (false) {', 'aceptar una propuesta no la aplica'],
  [GS, "  if (leer_(hoja_('USUARIOS')).length) throw error_('SESION', 'Entra al panel con tu usuario y contraseña.');\n", '', 'la clave antigua sigue abriendo la moderación después de migrar'],
  [GS, "bitacora_(yo.usuario, 'crear_usuario', 'usuario', usuario, rol);", "bitacora_(yo.usuario, 'crear_usuario', 'usuario', usuario, rol + ' ' + temporal);", 'la contraseña temporal queda en la bitácora'],
  [AD, 'try { sessionStorage.setItem(SESION, JSON.stringify(ses)); }', 'try { sessionStorage.setItem(SESION, JSON.stringify(ses)); localStorage.setItem(SESION, JSON.stringify(ses)); }', 'la sesión queda guardada después de cerrar la pestaña'],
  [AD, "(campo ? $('dlgCampo') : peligro && cancelar ? $('dlgNo') : $('dlgSi')).focus();", "(campo ? $('dlgCampo') : $('dlgSi')).focus();", 'en acciones destructivas el foco empieza en el botón peligroso'],
  [AD, "ses = null; resumen = null; REG.tip = REG.contacto = null; seccion = 'resumen';", 'ses = null; resumen = null; REG.tip = REG.contacto = null;', 'al volver a entrar quedan restos del usuario anterior'],
  [AD, "  if (puede('editar')) botones.push(`<button class=\"boton secundario mini\" type=\"button\" data-acc=\"editar\">Editar</button>`);", "  if (puede('leer')) botones.push(`<button class=\"boton secundario mini\" type=\"button\" data-acc=\"editar\">Editar</button>`);", 'el colaborador ve «Editar»'],
  [AD, "${d.antes ? `<del>${esc(d.antes)}</del>`", '${d.antes ? `${esc(d.antes)}`', 'las propuestas no muestran lo anterior tachado'],
  [AD, 'const si = await dialogo({ titulo: `¿Retirar', 'const si = confirm(\'¿Retirar?\') && await dialogo({ titulo: `¿Retirar', 'vuelve confirm() del navegador'],
  [AD, "  else if (o.web && !/^https:\\/\\/[^\\s<>\"']+\\.[^\\s<>\"']+$/.test(o.web)) error = 'La página web debe empezar por https://';\n", '', 'el panel envía webs sin https://'],
  [AD, "if (e.codigo === 'SESION') { olvidarSesion(); pintarIngreso(e.message); }", "if (e.codigo === 'SESION') { pintarIngreso(e.message); }", 'la sesión vencida no se borra del navegador'],
  ['js/app.js', "const revisado = /^\\d{4}-\\d{2}-\\d{2}$/.test(t.verificadoEn || '') ?", 'const revisado = false ?', 'el manual no muestra «Revisado por colaboradores»'],
  ['css/app.css', '.subpestanas { display: flex; gap: 2px; overflow-x: auto;', '.subpestanas { display: flex; gap: 2px;', 'en el celular las secciones del panel se salen de la pantalla'],
];
let vivas = 0, puerto = 8690;
for (const [archivo, viejo, nuevo, nombre] of MUTACIONES) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mut-'));
  fs.cpSync(RAIZ, tmp, { recursive: true, filter: (s) => !s.includes('node_modules') });
  fs.symlinkSync(path.join(RAIZ, 'node_modules'), path.join(tmp, 'node_modules'));
  const f = path.join(tmp, archivo);
  const txt = fs.readFileSync(f, 'utf8');
  if (!txt.includes(viejo)) { console.log(`?? no se pudo sembrar: ${nombre}`); vivas++; fs.rmSync(tmp, { recursive: true, force: true }); continue; }
  fs.writeFileSync(f, txt.replace(viejo, nuevo));
  const p = ++puerto;
  const srv = spawn('python3', ['-m', 'http.server', String(p)], { cwd: tmp, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1200));
  const r = spawnSync('node', ['tests/arbitro-v02-03.mjs'], { cwd: tmp, env: { ...process.env, BASE: `http://localhost:${p}/`, CAPTURAS: path.join(tmp, '_capturas') }, encoding: 'utf8' });
  srv.kill();
  const detectada = r.status !== 0;
  if (!detectada) vivas++;
  const n = (r.stdout.match(/✘/g) || []).length;
  console.log(`${detectada ? '✔ detectada' : '✘ VIVA'}: ${nombre}${detectada ? (n ? ` (${n} afirmaciones fallaron)` : ` (el árbitro se detuvo: ${(r.stderr || '').split('\n').find((l) => l.trim()) || 'sin detalle'})`) : ''}`);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(vivas ? `\n${vivas} mutación(es) vivas` : `\nLas ${MUTACIONES.length} mutaciones fueron detectadas`);
process.exit(vivas ? 1 : 0);
