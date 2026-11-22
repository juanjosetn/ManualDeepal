// =====================================================================
// Script árbitro de la versión v02.04 — tips contrastados con el manual de la S05.
// Pedido del autor: «Te entrego el manual de la Deepal S05 (no sé si es la versión
// eléctrica o la de rango extendido, revisa)» y que se incorpore antes de publicar.
// Hallazgo: los dos PDF son de la S05 ELÉCTRICA. El de 265 páginas coincide con la
// E-Max de Colombia (56,12 kWh); el de 274 es la europea (68,8 kWh). No hay manual de la Max.
// Debe FALLAR contra v02.03.00cl.
// Uso: servidor en la carpeta y BASE=http://localhost:8080/ node tests/arbitro-v02-04.mjs
//      RAIZ=/otra/carpeta para comparar. MANUAL_S05=/ruta/al.pdf (opcional) revisa además
//      que cada página citada diga lo que el tip le atribuye.
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = process.env.RAIZ || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE || 'http://localhost:8080/';
let fallas = 0, total = 0;
function caso(nombre, ok, detalle = '') { total++; if (ok) console.log('✔', nombre); else { fallas++; console.log('✘', nombre, detalle ? `\n    ${String(detalle).slice(0, 300)}` : ''); } }
const leer = (r) => { try { return fs.readFileSync(path.join(RAIZ, r), 'utf8'); } catch { return ''; } };
const json = (r) => { try { return JSON.parse(leer(r)); } catch { return {}; } };

// ---------- A. Datos ----------
const D = json('data/tips.json'), T = D.tips || [];
// Pruebas tocadas en v02.05: el total ya no es fijo (llegan tips nuevos del manual de la S05 Max); debe haber al menos 110
const N = T.length;
const t = (id) => T.find((x) => x.id === id) || {};
const txt = (x) => JSON.stringify(x);
const M = 'manual S05 eléctrica';
const citas = T.flatMap((x) => (x.fuentes || []).filter((f) => f.ref.startsWith(M)).map((f) => ({ id: x.id, pag: +((f.ref.match(/PDF p\. (\d+)/) || [])[1]) })));

caso('datos del 22 de noviembre de 2026, con 110 tips o más y sin identificadores repetidos', D.version === '2026.11.22' && T.length >= 110 && new Set(T.map((x) => x.id)).size === T.length, `${D.version} ${T.length}`);
caso('al menos 20 tips citan el manual de la S05 eléctrica, con página del PDF', new Set(citas.map((c) => c.id)).size >= 20 && citas.every((c) => c.pag >= 1 && c.pag <= 265), `${new Set(citas.map((c) => c.id)).size} tips`);
caso('ningún tip dice ya «No se tuvo el manual de la S05» sin aclarar que falta solo el de la Max', !T.some((x) => /No se tuvo el manual de la S05\./.test(txt(x))));
const p41 = t('s05-41-psi-en-las-cuatro-llantas');
caso('S05 41 PSI: confirmado con el manual (280 kPa, PDF p. 225) y marcado «oficial»', p41.confianza === 'oficial' && /280 kPa/.test(p41.verificacion) && txt(p41.fuentes).includes(`${M} (PDF p. 225)`));
caso('…y avisa que el manual europeo (68,8 kWh, no se vende en Colombia) dice 290 kPa', /290 kPa/.test(p41.verificacion) && /no se vende en Colombia/.test(p41.verificacion));
caso('…y que falta el manual de la S05 Max (rango extendido)', /S05 Max/.test(p41.verificacion));
const qb = t('quimica-de-la-bateria-casi-todas-son-lfp-solo-la');
caso('química: S05 Max LFP 27,28 kWh y S05 E-Max LFP 56,12 kWh (ya no «según el grupo»)', /27,28 kWh/.test(qb.saber) && /56,12 kWh/.test(qb.saber) && !/según el grupo/.test(qb.saber));
const amp = t('ajusta-el-amperaje-desde-el-menu-de-energia');
caso('amperaje: ruta del manual (Energía > Más > Límite de corriente de carga) y toma de 16 A', /Límite de corriente de carga/.test(amp.como) && /16 A/.test(amp.ojo) && amp.confianza === 'oficial');
const c100 = t('s05-carga-al-100-una-vez-al-mes-en-carga-lenta');
caso('carga al 100 %: la S05 eléctrica, cada semana según su manual; la Max, cada mes según el grupo', /una vez a la semana/.test(c100.cuando) && /una vez al mes/.test(c100.cuando) && /semana/.test(c100.titulo));
const rem = t('modo-de-remolque-activalo-antes-de-que-lo-suban-');
caso('modo de remolque: ahora para las dos (con la ruta de la S05: Mantenimiento de seguridad)', (rem.modelos || ['x']).length === 0 && /Mantenimiento de seguridad > Modo de remolque/.test(rem.como));
caso('grúa: sin la página equivocada («pág. 213» era la de OTA) y con el punto de arrastre de la S05', !/pág\. 213/.test(t('si-necesitas-grua-pide-de-plataforma').como) && /bumper delantero/.test(t('si-necesitas-grua-pide-de-plataforma').como));
const ap = t('ubica-la-apertura-mecanica-de-las-puertas-antes-');
caso('puertas sin batería de 12 V: puerto del bumper trasero y máximo 30 segundos', /bumper trasero/.test(ap.como) && /30 segundos/.test(ap.ojo) && ap.confianza === 'oficial');
const mant = t('que-piden-en-cada-revision');
caso('mantenimiento: plan de la S05 eléctrica (reductor cada 3 años o 60.000 km) sin mezclarlo con el motor a gasolina', /S05 eléctrica \(no tiene motor a gasolina\)/.test(mant.saber) && /3 años o 60\.000 km/.test(mant.saber));
const v2l = t('usa-el-carro-como-toma-de-220-v-v2l');
caso('tip nuevo: usar el carro como toma de 220 V (V2L), con el adaptador comprado aparte', v2l.cat === 'funciones' && /220 V/.test(v2l.como) && /se compra aparte/.test(v2l.como) && /110 V/.test(v2l.ojo));
const pis = t('si-la-pistola-de-carga-lenta-no-sale-usa-la-cuerda');
caso('tip nuevo: la cuerda de emergencia para soltar la pistola de carga lenta', pis.cat === 'carga' && /cuerda/.test(pis.como) && txt(pis.fuentes).includes(`${M} (PDF p. 176)`));
caso('lo que solo dice el manual de la eléctrica se aclara para la Max (ninguna afirmación de la Max sin fuente)',
  ['modo-de-remolque-activalo-antes-de-que-lo-suban-', 'usa-el-carro-como-toma-de-220-v-v2l', 'si-la-pistola-de-carga-lenta-no-sale-usa-la-cuerda'].every((id) => /Max/.test(t(id).ojo)));
const pdfs = [];
(function recorrer(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === 'node_modules') continue; const r = path.join(d, e.name); if (e.isDirectory()) recorrer(r); else if (/\.pdf$/i.test(e.name)) pdfs.push(path.relative(RAIZ, r)); } })(RAIZ);
caso('el manual del fabricante no se sube al repositorio público (derechos y peso)', pdfs.length === 0, pdfs.join(', '));
caso('el cambio es reproducible: herramientas/verificacion-s05/aplicar.py', /reemplazo exacto/.test(leer('herramientas/verificacion-s05/aplicar.py')));
caso('VERIFICACION.md explica qué manual era y qué faltó (§11)', /## 11\./.test(leer('VERIFICACION.md')) && /56,12 kWh/.test(leer('VERIFICACION.md')) && /68,8/.test(leer('VERIFICACION.md')));
caso('docs/CHANGELOG.md empieza por v02.04.00cl', /^## v02\.04\.00cl/m.test(leer('docs/CHANGELOG.md')) && leer('docs/CHANGELOG.md').indexOf('## v02.04.00cl') < leer('docs/CHANGELOG.md').indexOf('## v02.03.00cl'));

// Límites del servidor: los tips entran completos a la hoja al importar (como lo hará el administrador)
{
  const apoyo = path.join(RAIZ, 'tests/apoyo-comunidad.mjs');
  if (fs.existsSync(apoyo)) {
    const { nuevoServicio, CLAVE_PRUEBA } = await import(pathToFileURL(apoyo).href);
    const g = nuevoServicio();
    const tok = g.post({ accion: 'login', usuario: 'admin', clave: CLAVE_PRUEBA }).data?.token;
    const r = tok && g.post({ accion: 'importar', token: tok, tips: T, contactos: json('data/directorio.json').contactos, ultimoChat: D.ultimoChat });
    const pub = g.get({ accion: 'datos' }).data;
    caso('importar a la hoja: entran todos los tips sin recortes', r?.ok && r.data.tips === N && pub?.tips?.tips?.length === N, JSON.stringify(r?.error || ''));
    const enHoja = (id) => (pub?.tips?.tips || []).find((x) => x.id === id) || {};
    caso('…y lo que publica la hoja es idéntico a lo revisado (textos y fuentes)', ['s05-41-psi-en-las-cuatro-llantas', 'usa-el-carro-como-toma-de-220-v-v2l', 'que-piden-en-cada-revision']
      .every((id) => enHoja(id).id === id && ['titulo', 'como', 'ojo', 'saber', 'verificacion'].every((k) => (enHoja(id)[k] || '') === (t(id)[k] || '')) && txt(enHoja(id).fuentes) === txt(t(id).fuentes)));
  } else caso('importar a la hoja (falta el simulador)', false);
}

// Opcional: cada página citada dice lo que el tip le atribuye
if (process.env.MANUAL_S05 && fs.existsSync(process.env.MANUAL_S05)) {
  const paginas = execFileSync('pdftotext', ['-layout', process.env.MANUAL_S05, '-'], { maxBuffer: 64e6 }).toString().split('\f').map((p) => p.replace(/\s+/g, ' '));
  const CLAVE = { 8: /recuperación de energía desaparece/, 22: /dos veces/, 33: /manija de operación blanca/, 37: /120 ?W/, 98: /fuerte \(la desaceleración/, 176: /cuerda de tracción de emergencia/, 178: /pila de carga desbloquee/, 179: /16 A/, 180: /Descarga externa/, 181: /lo que ocurra primero/, 182: /3 años o 60\.000 km/, 183: /10000 km/, 185: /una vez a la semana/, 186: /40 %/, 203: /6 mm/, 205: /10\.000 km/, 210: /1,6 km/, 215: /Desbloqueo de emergencia/, 219: /Actualización del Sistema/, 223: /56\.12/, 225: /280 kPa/, 229: /Mantenimiento de seguridad/, 230: /parachoques delantero/, 231: /plataforma/ };
  const malas = [...new Set(citas.map((c) => c.pag))].filter((n) => !CLAVE[n] || !CLAVE[n].test(paginas[n - 1] || ''));
  caso('cada página citada del manual de la S05 dice lo que el tip le atribuye', paginas.length === 266 && malas.length === 0, `páginas: ${paginas.length - 1}; sin respaldo: ${malas.join(', ')}`);
} else console.log('(sin MANUAL_S05: se omite la revisión página por página)');

// ---------- B. Navegador ----------
let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.log('(sin Playwright: se omiten las pruebas de navegador)'); }
if (chromium) {
  const nav = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, locale: 'es-CO', timezoneId: 'America/Bogota' });
  await ctx.route('https://script.google.com/**', (r) => r.abort()); // nunca el servicio real
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));
  try {
    await p.goto(BASE);
    await p.waitForSelector('details.tip');
    await p.waitForFunction((n) => document.querySelector('#cuentaEnergia')?.textContent === `${n} tips`, N, { timeout: 8000 }).catch(() => {});
    caso('celular: el manual muestra todos los tips', (await p.textContent('#cuentaEnergia')) === `${N} tips`, await p.textContent('#cuentaEnergia'));
    await p.fill('#q', 'v2l');
    await p.waitForTimeout(400);
    caso('buscar «v2l» encuentra el tip de la toma de 220 V', /toma de 220 V/.test(await p.textContent('#listaTips')));
    await p.fill('#q', 'pistola trabada');
    await p.waitForTimeout(400);
    caso('buscar «pistola trabada» encuentra la cuerda de emergencia', /cuerda de emergencia/.test(await p.textContent('#listaTips')));
    await p.click('#limpiar');
    await p.click('.opciones[data-k="modelo"] button[data-v="S05"]');
    await p.fill('#q', 'modo de remolque');
    await p.waitForTimeout(400);
    caso('con el filtro S05, el modo de remolque ya aparece (antes era solo S07)', /Modo de remolque: actívalo/.test(await p.textContent('#listaTips')));
    await p.click('#limpiar');
    await p.goto(`${BASE}#tip/s05-41-psi-en-las-cuatro-llantas`);
    await p.waitForTimeout(800);
    const ficha = await p.textContent('body');
    caso('la ficha de 41 PSI muestra la fuente del manual de la S05 y los 280 kPa', ficha.includes('manual S05 eléctrica (PDF p. 225)') && /280 kPa/.test(ficha));
    const [sw, iw] = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    caso('celular: los textos largos nuevos no desbordan la pantalla', sw <= iw + 1, `${sw} > ${iw}`);
  } catch (e) { caso('el recorrido en el navegador se pudo completar', false, e.message.split('\n')[0]); }
  // Si la hoja responde algo incompleto (por ejemplo, un servicio sin actualizar), el manual sigue con sus datos
  {
    const c2 = await nav.newContext({ viewport: { width: 390, height: 844 } });
    await c2.route('**/config/sitio.json', async (route) => { const r = await route.fetch(); const j = await r.json(); j.comunidad.servicio = 'https://script.google.com/macros/s/AKfycbPRUEBA_simulada_000/exec'; await route.fulfill({ response: r, body: JSON.stringify(j) }); });
    await c2.route('https://script.google.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { generacion: '9', servicio: '1.1.0' } }) }));
    try {
      const p2 = await c2.newPage();
      p2.on('pageerror', (e) => errores.push(e.message));
      await p2.goto(BASE);
      await p2.waitForSelector('details.tip').catch(() => {});
      await p2.waitForTimeout(1500);
      await p2.fill('#q', 'presion llantas');
      await p2.waitForTimeout(500);
      caso('si la hoja responde incompleto (servicio sin actualizar), el manual sigue con todos sus tips y la búsqueda funciona', (await p2.textContent('#cuentaEnergia').catch(() => '')).endsWith(`de ${N}`) && (await p2.locator('#listaTips details.tip').count()) > 0, await p2.textContent('#cuentaEnergia').catch(() => ''));
    } catch (e) { caso('la respuesta incompleta se pudo probar', false, e.message.split('\n')[0]); }
    await c2.close();
  }
  caso('sin errores de JavaScript en la página', errores.length === 0, errores.join(' | '));
  await nav.close();
}

console.log(`\n${total - fallas}/${total} afirmaciones pasaron`);
process.exit(fallas ? 1 : 0);
