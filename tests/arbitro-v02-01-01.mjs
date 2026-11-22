// =====================================================================
// Script árbitro de la versión v02.01.01 — las calificaciones de 1 estrella no cuentan.
// Pedido del autor: «Internamente las calificaciones de 1 estrella no deben contar ya que
// pueden deberse a un mal genio o retaliaciones individuales.»
// Se guardan en la hoja (el administrador las ve) pero no entran al promedio, al orden ni a
// «Calificación baja», y su texto no se publica.
// Debe FALLAR contra v02.01.00cl y PASAR contra v02.01.01cl.
// Uso: BASE=http://localhost:8080/ node tests/arbitro-v02-01-01.mjs   (RAIZ=/otra/carpeta para comparar)
// El servidor se simula con el Codigo.gs de la carpeta RAIZ.
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearGAS } from './gas-simulador.mjs';
import { conectar, CLAVE_PRUEBA, entrarPanel } from './apoyo-comunidad.mjs';

const RAIZ = process.env.RAIZ || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE || 'http://localhost:8080/';
let fallas = 0, total = 0;
function caso(nombre, ok, detalle = '') { total++; if (ok) console.log('✔', nombre); else { fallas++; console.log('✘', nombre, detalle ? `\n    ${String(detalle).slice(0, 300)}` : ''); } }
const gs = fs.readFileSync(path.join(RAIZ, 'apps-script/Codigo.gs'), 'utf8');

// ---------- A. Servidor (simulado con el Codigo.gs de RAIZ) ----------
caso('la regla está en un solo lugar del servidor: ESTRELLAS_MINIMAS_QUE_CUENTAN = 2', /var ESTRELLAS_MINIMAS_QUE_CUENTAN = 2;/.test(gs));
// Pruebas tocadas en v02.03: el servicio pasó a 2.0.0 (usuarios y datos en la hoja); se acepta 1.1.0 o posterior
caso('el servicio informa la versión 1.1.0 o posterior (cambió una regla)', (() => { const m = gs.match(/SERVICIO_VERSION = '(\d+)\.(\d+)\.\d+'/); return !!m && (+m[1] > 1 || (+m[1] === 1 && +m[2] >= 1)); })());
function servicio() { const g = crearGAS({ archivo: path.join(RAIZ, 'apps-script/Codigo.gs') }); g.ctx.fijarClaveAdmin_(CLAVE_PRUEBA); return g; }
let k = 0;
const votar = (g, id, e, t = '') => g.post({ accion: 'calificar', contactoId: id, estrellas: e, comentario: t, dispositivo: `voto${String(++k).padStart(4, '0')}${'0'.repeat(12)}`, reqId: `voto-${k}-prueba` });
{
  const g = servicio();
  ['negocio-uno-bogota', 'negocio-uno-bogota', 'negocio-uno-bogota', 'negocio-uno-bogota'].forEach((id) => votar(g, id, 1));
  votar(g, 'negocio-dos-bogota', 1, 'Me cayó mal el asesor'); votar(g, 'negocio-dos-bogota', 1); votar(g, 'negocio-dos-bogota', 5);
  const r = g.get().data.contactos;
  caso('cuatro calificaciones de 1 estrella: el negocio queda «sin calificaciones»', r['negocio-uno-bogota'] === undefined, JSON.stringify(r['negocio-uno-bogota']));
  caso('1 + 1 + 5: el promedio es 5 con 1 calificación', r['negocio-dos-bogota']?.promedio === 5 && r['negocio-dos-bogota']?.n === 1, JSON.stringify(r['negocio-dos-bogota']));
  caso('las de 1 estrella sí quedan guardadas en la hoja', g.filas('CALIFICACIONES').filter((f) => f.estrellas === '1').length === 6);
  const op = g.post({ accion: 'admin_pendientes', clave: CLAVE_PRUEBA }).data.opiniones.find((o) => o.estrellas === 1);
  caso('el administrador la ve marcada como «no cuenta»', op?.cuenta === false);
  caso('su texto no se puede publicar', g.post({ accion: 'admin_moderar', clave: CLAVE_PRUEBA, tipo: 'opinion', reqId: op?.reqId, estado: 'publicado' }).ok === false);
}

// ---------- B. Navegador ----------
let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.log('(sin Playwright: se omiten las pruebas de navegador)'); }
if (chromium) {
  const nav = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const errores = [];
  const salitre = 'deepal-salitre-fijo-bogota', morato = 'taller-autorizado-vardi-morato-bogota', vardiSalitre = 'taller-vardi-salitre-asesor-de-taller-bogota';
  const g = servicio();
  [4, 4, 5].forEach((e) => votar(g, salitre, e));
  [5, 1, 1, 1].forEach((e) => votar(g, morato, e));     // contando los 1 sería 2,0 y bajaría; sin ellos es 5,0
  [1, 1, 1, 1].forEach((e) => votar(g, vardiSalitre, e)); // solo «unos»: no baja, queda sin calificaciones
  async function pagina(hash, ancho = 390) {
    const ctx = await nav.newContext({ viewport: { width: ancho, height: 900 } });
    await conectar(ctx, g);
    const p = await ctx.newPage(); p.setDefaultTimeout(6000);
    p.on('pageerror', (e) => errores.push(e.message));
    await p.goto(BASE + hash); await p.waitForTimeout(1000);
    return { p, ctx };
  }
  {
    const { p, ctx } = await pagina('#directorio');
    try {
      const bajos = await p.$$eval('details.bajos [data-calificar]', (els) => els.map((e) => e.dataset.calificar)).catch(() => []);
      caso('un negocio con solo calificaciones de 1 estrella no baja a «Calificación baja»', !bajos.includes(vardiSalitre) && !bajos.includes(morato), bajos.join(', '));
      await p.click('details.ciudad[data-ciudad="Bogotá"] > summary');
      const oficial = await p.$$eval('details.ciudad[data-ciudad="Bogotá"] .subcat', (secs) => {
        const s = secs.find((x) => x.querySelector('h3').textContent.includes('Deepal oficial'));
        return s ? [...s.querySelectorAll('[data-calificar]')].map((b) => b.dataset.calificar) : [];
      });
      caso('los «unos» no hunden a nadie en el orden: Morato (5,0 sin ellos) va primero', oficial[0] === morato, oficial.join(', '));
      const ficha = (id) => p.locator(`details.ciudad article:has([data-calificar="${id}"]) .valoracion`);
      caso('la ficha muestra solo lo que cuenta: «5 (1)»', /5\s*\(1\)/.test(await ficha(morato).textContent().catch(() => '')));
      caso('con solo «unos», la ficha no muestra estrellas', (await ficha(vardiSalitre).count()) === 0);
      // El visitante califica con 1 estrella: se recibe, sin prometer que cuenta
      const otro = 'repuestos-deepal-bogota-bogota';
      const objetivo = (await p.locator(`[data-calificar="${otro}"]`).count()) ? otro : (await p.$$eval('details.ciudad[open] [data-calificar]', (els) => els.map((e) => e.dataset.calificar))).find((x) => ![salitre, morato, vardiSalitre].includes(x));
      await p.click(`details.ciudad [data-calificar="${objetivo}"]`);
      await p.click('label[for="est1"]');
      await p.click('#formCalificar [type="submit"]');
      await p.waitForFunction(() => /Gracias/.test(document.getElementById('estadoCalificar').textContent), null, { timeout: 8000 }).catch(() => {});
      const msj = await p.textContent('#estadoCalificar');
      caso('al calificar con 1 estrella: agradece sin decir que «ya cuenta»', /Gracias/.test(msj) && !/cuenta/.test(msj), msj);
      caso('…y el servidor la guardó', g.filas('CALIFICACIONES').some((f) => f.contactoId === objetivo && f.estrellas === '1'));
      await p.waitForTimeout(2600);
      caso('…pero no aparece promedio en esa ficha', (await ficha(objetivo).count()) === 0);
    } catch (e) { caso('el recorrido se pudo completar', false, e.message.split('\n')[0]); }
    await ctx.close();
  }
  {
    votar(g, salitre, 1, 'Retaliación de prueba');
    const { p, ctx } = await pagina('#admin', 1280);
    try {
      await entrarPanel(p, { seccion: 'opiniones' }); // Pruebas tocadas en v02.03: ingreso con usuario y contraseña
      await p.waitForSelector('#listaOpiniones tbody tr', { timeout: 8000 });
      const fila = p.locator('#listaOpiniones tbody tr', { hasText: 'Retaliación de prueba' });
      caso('panel: la opinión de 1 estrella dice que no cuenta ni se publica', /no cuenta ni se publica/.test(await fila.textContent()));
      caso('panel: para ella no hay botón «Publicar», solo «Archivar»', (await fila.locator('[data-estado="publicado"]').count()) === 0 && (await fila.locator('[data-estado="rechazado"]').count()) === 1);
    } catch (e) { caso('el recorrido se pudo completar', false, e.message.split('\n')[0]); }
    await ctx.close();
  }
  caso('sin errores de JavaScript en la página', errores.length === 0, errores.join(' | '));
  await nav.close();
}
console.log(`\n${total - fallas}/${total} afirmaciones pasaron`);
process.exit(fallas ? 1 : 0);
