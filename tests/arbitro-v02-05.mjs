// =====================================================================
// Script árbitro de la versión v02.05 — tips contrastados con el manual de la S05 Max
// (rango extendido), que llegó en INGLÉS.
// Pedido del autor: «Te entrego el manual de la Deepal S05 (de rango extendido, revisa y
// pása lo publicado a español)».
// Comprueba: que lo que antes decía «en la Max confírmalo» quedó resuelto con el manual,
// que todo lo publicado está en español (sin frases del manual en inglés), que las citas
// existen y, si se da el PDF, que cada página citada diga lo que el tip le atribuye.
// Debe FALLAR contra v02.04.00cl.
// Uso: servidor en la carpeta y BASE=http://localhost:8080/ node tests/arbitro-v02-05.mjs
//      RAIZ=/otra/carpeta para comparar. MANUAL_S05_MAX=/ruta/al.pdf (opcional).
// =====================================================================
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = process.env.RAIZ || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE || 'http://localhost:8080/';
let fallas = 0, total = 0;
function caso(nombre, ok, detalle = '') { total++; if (ok) console.log('✔', nombre); else { fallas++; console.log('✘', nombre, detalle ? `\n    ${String(detalle).slice(0, 300)}` : ''); } }
const leer = (r) => { try { return fs.readFileSync(path.join(RAIZ, r), 'utf8'); } catch { return ''; } };
const json = (r) => { try { return JSON.parse(leer(r)); } catch { return {}; } };

// ---------- A. Datos ----------
const D = json('data/tips.json'), T = D.tips || [];
const t = (id) => T.find((x) => x.id === id) || {};
const txt = (x) => JSON.stringify(x);
const X = 'manual S05 Max';
const citas = T.flatMap((x) => (x.fuentes || []).filter((f) => f.ref.startsWith(`${X} (`)).map((f) => ({ id: x.id, pag: +((f.ref.match(/PDF p\. (\d+)/) || [])[1]) })));
const textos = (x) => ['titulo', 'cuando', 'como', 'ojo', 'saber', 'verificacion'].map((k) => x[k] || '').join(' ');

caso('datos con 114 tips y sin identificadores repetidos', T.length === 114 && new Set(T.map((x) => x.id)).size === T.length, T.length);
caso('al menos 25 tips citan el manual de la S05 Max, con página del PDF (1 a 239)', new Set(citas.map((c) => c.id)).size >= 25 && citas.every((c) => c.pag >= 1 && c.pag <= 239), `${new Set(citas.map((c) => c.id)).size} tips`);
const pendientes = T.filter((x) => /S05 Max[^.]{0,40}confírm|no se tuvo el (manual )?de la S05 Max|No se tuvo el manual de la S05 Max|debería ser igual|prensa para la Max|S05 Max \(rango extendido\): LFP de 27,28 kWh según la prensa/i.test(textos(x))).map((x) => x.id);
caso('ya no queda ningún «en la S05 Max confírmalo» ni «no se tuvo el manual de la S05 Max»', pendientes.length === 0, pendientes.join(', '));
// Todo en español: ninguna frase del manual en inglés se coló en lo publicado
const INGLES = /\b(the|vehicle|please|charging|battery|whichever|power on|fuel tank|maintenance|engine oil|recommended)\b/i;
const enIngles = T.filter((x) => INGLES.test(textos(x))).map((x) => x.id);
caso('todo lo publicado está en español (sin frases del manual en inglés)', enIngles.length === 0, enIngles.join(', '));
caso('las fuentes también se nombran en español («manual S05 Max (PDF p. …)»)', citas.length > 0 && !T.some((x) => (x.fuentes || []).some((f) => /owner|manual \(EN\)|REEV English/i.test(f.ref))));

const p41 = t('s05-41-psi-en-las-cuatro-llantas');
caso('41 PSI: confirmado por los dos manuales de la S05 (Max p. 230 y eléctrica p. 225)', txt(p41.fuentes).includes(`${X} (PDF p. 230)`) && txt(p41.fuentes).includes('manual S05 eléctrica (PDF p. 225)') && /manuales de la S05 Max y de la S05 eléctrica/.test(p41.verificacion));
const c100 = t('s05-carga-al-100-una-vez-al-mes-en-carga-lenta');
caso('carga al 100 %: las dos S05, al menos una vez a la semana (Max p. 189)', /al menos una vez a la semana/.test(c100.titulo) && txt(c100.fuentes).includes(`${X} (PDF p. 189)`));
const qb = t('quimica-de-la-bateria-casi-todas-son-lfp-solo-la');
caso('química: los 27,28 kWh de la Max salen de su manual (p. 228), no de la prensa', /27,28 kWh/.test(qb.saber) && txt(qb.fuentes).includes(`${X} (PDF p. 228)`) && !/27,28 kWh según la prensa/.test(qb.saber));
const ap = t('carga-de-aparcamiento-usala-solo-en-emergencia-y');
caso('carga de aparcamiento: ahora «oficial», con lugar abierto y ventilado y sus tres velocidades', ap.confianza === 'oficial' && /abierto y ventilado/.test(ap.ojo) && /baja, media y alta/.test(ap.ojo));
caso('modos de energía: el «eléctrico forzado» y para qué sirve cada modo, según el manual', /eléctrico forzado/.test(t('s05-que-modo-usar-en-ciudad-carretera-y-montana').ojo));
caso('V2L en la S05 Max: «Arrancar el motor con batería baja»', /Arrancar el motor con batería baja/.test(t('usa-el-carro-como-toma-de-220-v-v2l').ojo));
const plan = t('s05-max-plan-de-mantenimiento-del-fabricante');
caso('tip nuevo: plan de mantenimiento de la S05 Max (aceite 0W-16 en cada revisión, bujías a los 30.000 km con gasolina, filtro de gasolina 4 años o 100.000 km)',
  plan.cat === 'mantenimiento' && /0W-16/.test(plan.saber) && /30\.000 km recorridos con el motor/.test(plan.saber) && /4 años o 100\.000 km/.test(plan.saber) && txt(plan.motor) === '["REEV"]');
caso('…y el tip general de revisiones remite a él (ya no dice «pregunta el plan en el taller»)', /tip siguiente/.test(t('que-piden-en-cada-revision').verificacion) && T.findIndex((x) => x.id === 's05-max-plan-de-mantenimiento-del-fabricante') === T.findIndex((x) => x.id === 'que-piden-en-cada-revision') + 1);
const gas = t('s05-max-el-manual-pide-gasolina-ron-91');
caso('tip nuevo: el manual pide RON 91 o más; se presenta como tema en discusión y pide la respuesta del taller por escrito', gas.confianza === 'disputa' && /RON 91/.test(gas.como) && /51 litros/.test(gas.como) && /por escrito/.test(gas.ojo) && /corriente/.test(gas.ojo));
const tq = t('s05-max-para-tanquear-desbloquea-la-tapa-en-la-pantalla');
caso('tip nuevo: tanquear (tapa desde la pantalla, en P y encendido, dos o más clics)', /en P/.test(tq.como) && /dos o más clics/.test(tq.como) && /presurizado/.test(tq.ojo));
const em = t('s05-max-modo-de-emergencia-para-llegar-a-la-bomba');
caso('tip nuevo: modo de emergencia para llegar a la bomba o al cargador', em.cat === 'viajes' && /Modo de emergencia/.test(em.como) && /se apaga solo/.test(em.ojo));
caso('los tips nuevos de la Max quedan solo para la S05 de rango extendido (filtros S05 y REEV)', [plan, gas, tq, em].every((x) => txt(x.modelos) === '["S05"]' && txt(x.motor) === '["REEV"]'));

// El generador se niega a correr dos veces (no pisa ni duplica)
{
  const gen = path.join(RAIZ, 'herramientas/verificacion-s05/aplicar_max.py');
  if (fs.existsSync(gen)) {
    const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'gen-')), 'tips.json');
    fs.copyFileSync(path.join(RAIZ, 'data/tips.json'), tmp);
    const r = spawnSync('python3', [gen, tmp], { encoding: 'utf8' });
    caso('el generador aplicar_max.py existe y se niega a aplicar dos veces los mismos cambios', r.status !== 0 && fs.readFileSync(tmp, 'utf8') === leer('data/tips.json'), r.stdout + r.stderr);
  } else caso('el generador aplicar_max.py existe y se niega a aplicar dos veces los mismos cambios', false, 'no existe');
}
caso('VERIFICACION.md §12 explica el manual en inglés de la S05 Max', /## 12\./.test(leer('VERIFICACION.md')) && /27,28 kWh/.test(leer('VERIFICACION.md').split('## 12.')[1] || '') && /inglés/.test(leer('VERIFICACION.md').split('## 12.')[1] || ''));
caso('docs/CHANGELOG.md empieza por v02.05.00cl', leer('docs/CHANGELOG.md').indexOf('## v02.05.00cl') > 0 && leer('docs/CHANGELOG.md').indexOf('## v02.05.00cl') < leer('docs/CHANGELOG.md').indexOf('## v02.04.00cl'));

// Entran completos a la hoja al importar
{
  const apoyo = path.join(RAIZ, 'tests/apoyo-comunidad.mjs');
  const { nuevoServicio, CLAVE_PRUEBA } = await import(pathToFileURL(apoyo).href);
  const g = nuevoServicio();
  const tok = g.post({ accion: 'login', usuario: 'admin', clave: CLAVE_PRUEBA }).data?.token;
  const r = tok && g.post({ accion: 'importar', token: tok, tips: T, contactos: json('data/directorio.json').contactos, ultimoChat: D.ultimoChat });
  const pub = g.get({ accion: 'datos' }).data?.tips?.tips || [];
  caso('importar a la hoja: entran los 114 tips y los nuevos salen idénticos', r?.ok && r.data.tips === 114 && ['s05-max-plan-de-mantenimiento-del-fabricante', 's05-max-el-manual-pide-gasolina-ron-91']
    .every((id) => txt(pub.find((x) => x.id === id)?.saber) === txt(t(id).saber) && txt(pub.find((x) => x.id === id)?.ojo) === txt(t(id).ojo) && pub.find((x) => x.id === id)?.confianza === t(id).confianza), JSON.stringify(r?.error || ''));
}

// Opcional: cada página citada del manual en inglés dice lo que el tip le atribuye
if (process.env.MANUAL_S05_MAX && fs.existsSync(process.env.MANUAL_S05_MAX)) {
  const paginas = execFileSync('pdftotext', ['-layout', process.env.MANUAL_S05_MAX, '-'], { maxBuffer: 64e6 }).toString().split('\f').map((p) => p.replace(/\s+/g, ' '));
  const CLAVE = { 8: /coasting energy recovery function disappears/, 23: /upwards twice/, 33: /white/, 36: /120W/, 96: /strong/, 97: /forced pure electric/, 98: /well-ventilated, open area/, 176: /emergency pull rope/, 179: /Charging Current Limit/, 180: /Low Battery Level Engine Start/, 182: /high-pressure fuel tank/, 183: /two or more clear clicks/, 184: /whichever comes first/, 185: /3 years or 60,000km/, 186: /10,000km/, 187: /30,000km/, 189: /at least once a week/, 190: /40%/, 201: /0W-16/, 207: /6 ?mm/, 208: /six years|6 years/, 209: /every 10,000 km after first maintenance/, 214: /1\.6 ?km/, 220: /30 seconds/, 223: /System Upgrade/, 226: /RON91/, 228: /27\.28/, 230: /280kPa/, 234: /51L/, 236: /Safety Maintenance/, 237: /front bumper/ };
  const malas = [...new Set(citas.map((c) => c.pag))].filter((n) => !CLAVE[n] || !CLAVE[n].test(paginas[n - 1] || ''));
  caso('cada página citada del manual de la S05 Max dice lo que el tip le atribuye', paginas.length === 240 && malas.length === 0, `páginas: ${paginas.length - 1}; sin respaldo: ${malas.join(', ')}`);
} else console.log('(sin MANUAL_S05_MAX: se omite la revisión página por página)');

// ---------- B. Navegador ----------
let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.log('(sin Playwright: se omiten las pruebas de navegador)'); }
if (chromium) {
  const nav = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, locale: 'es-CO', timezoneId: 'America/Bogota' });
  await ctx.route('https://script.google.com/**', (r) => r.abort());
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));
  const buscar = async (q) => { await p.fill('#q', q); await p.waitForTimeout(450); return p.textContent('#listaTips'); };
  try {
    await p.goto(BASE);
    await p.waitForSelector('details.tip');
    await p.waitForFunction(() => document.querySelector('#cuentaEnergia')?.textContent === '114 tips', null, { timeout: 8000 }).catch(() => {});
    caso('celular: el manual muestra los 114 tips', (await p.textContent('#cuentaEnergia')) === '114 tips', await p.textContent('#cuentaEnergia'));
    caso('buscar «octanaje» encuentra el tip de la gasolina RON 91', /RON 91/.test(await buscar('octanaje')));
    caso('buscar «tapa tanque» encuentra cómo tanquear', /desbloquea la tapa/.test(await buscar('tapa tanque')));
    caso('buscar «bujias» encuentra el plan de mantenimiento de la S05 Max', /plan de mantenimiento/.test(await buscar('bujias')));
    await p.click('#limpiar');
    await p.click('.opciones[data-k="modelo"] button[data-v="S07"]');
    await buscar('gasolina tanquear');
    const titulos = await p.$$eval('#listaTips details.tip .t', (e) => e.map((x) => x.textContent));
    caso('con el filtro S07, los tips solo de la S05 Max no aparecen', titulos.length > 0 && !titulos.some((x) => /^S05 Max/.test(x)), titulos.join(' | '));
    await p.click('#limpiar');
    await p.click('.opciones[data-k="modelo"] button[data-v="all"]');
    await p.goto(`${BASE}#tip/s05-max-el-manual-pide-gasolina-ron-91`);
    await p.waitForTimeout(800);
    caso('la ficha de la gasolina cita el manual de la S05 Max y la prensa', /manual S05 Max \(PDF p\. 226\)/.test(await p.textContent('body')) && /El Tiempo/.test(await p.textContent('body')));
    const [sw, iw] = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    caso('celular: los tips nuevos no desbordan la pantalla', sw <= iw + 1, `${sw} > ${iw}`);
  } catch (e) { caso('el recorrido en el navegador se pudo completar', false, e.message.split('\n')[0]); }
  caso('sin errores de JavaScript en la página', errores.length === 0, errores.join(' | '));
  await nav.close();
}

console.log(`\n${total - fallas}/${total} afirmaciones pasaron`);
process.exit(fallas ? 1 : 0);
