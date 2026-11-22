// =====================================================================
// Script árbitro de la versión v02.02 — pestaña «Trámites» y guía de
// devolución del IVA mejorada (v01.02.00cl de la guía).
// Pedidos del autor:
//   1. «Agrega una nueva sección para la guía de Devolución IVA» → pestaña Trámites.
//   2. «implementa un árbitro adversarial UI/UX para mejorar la guía».
//   3. Normas nuevas: «Debe aparecer tachado lo anterior y resaltado los nuevos
//      cambios. Cada uno con la fecha de vigencia».
//   4. «La guía se debe poder descargar en html para cualquiera».
//   5. «Todo debe ser AGNÓSTICO» (sin marca, sin servicios de terceros, cualquier navegador).
//   6. Las casillas siguen en orden estricto (decisión del autor).
// Debe FALLAR contra v02.01.01cl (y la parte A contra la guía original v1.01).
// Uso: servidor en la carpeta y BASE=http://localhost:8080/ node tests/arbitro-v02-02.mjs
//      RAIZ=/otra/carpeta para comparar; GUIA=/ruta/guia.html para revisar otra guía.
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = process.env.RAIZ || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE || 'http://localhost:8080/';
const GUIA = process.env.GUIA || path.join(RAIZ, 'guias/devolucion-iva.html');
let fallas = 0, total = 0;
function caso(nombre, ok, detalle = '') { total++; if (ok) console.log('✔', nombre); else { fallas++; console.log('✘', nombre, detalle ? `\n    ${String(detalle).slice(0, 300)}` : ''); } }
const leer = (r) => { try { return fs.readFileSync(path.isAbsolute(r) ? r : path.join(RAIZ, r), 'utf8'); } catch { return ''; } };
const g = leer(GUIA);

// ---------- A1. Guía: revisión estática ----------
caso('la guía existe como un solo archivo HTML', g.startsWith('<!DOCTYPE html>'));
caso('agnóstica: no carga nada de internet (ni fuentes ni scripts ni estilos externos)', g.length > 0 && !/<link[^>]+href="https?:/i.test(g) && !/<script[^>]+src=/i.test(g) && !/@import|url\(\s*['"]?https?:/i.test(g));
caso('agnóstica: no menciona ninguna marca de vehículos fuera del registro de versiones', g.length > 0 && !/Deepal|Changan|BYD|Renault|Kia|Hyundai|Toyota/i.test(g) && !/Tesla/i.test(g.replace(/<details class="panel">\s*<summary>Control de versiones[\s\S]*?<\/details>/, '')));
caso('sin ventanas del navegador (alert, confirm, prompt)', g.length > 0 && !/\b(alert|confirm|prompt)\s*\(/.test(g.replace(/\/\*[\s\S]*?\*\//g, '')));
caso('la guía declara su versión en formato vXX.YY.ZZcl', /<meta name="version" content="v\d{2}\.\d{2}\.\d{2}cl">/.test(g));
const ins = (g.match(/<ins class="nuevo">/g) || []).length, del = (g.match(/<del class="antes">/g) || []).length;
caso('lo nuevo resaltado (<ins>) y lo anterior tachado (<del>)', ins >= 15 && del >= 8, `ins ${ins}, del ${del}`);
const vig = [...g.matchAll(/<span class="vigencia">([^<]+)<\/span>/g)].map((m) => m[1]);
caso('cada cambio trae su fecha de vigencia', vig.length >= 12 && vig.every((v) => /\d{1,2} \w{3} \d{4}|NO vigente|consultado/.test(v)), vig.slice(0, 4).join(' | '));
caso('cada recuadro de cambio y cada novedad tiene su etiqueta de vigencia', (() => {
  const bloques = [...g.matchAll(/<div class="cambio">([\s\S]*?)<\/div>/g), ...g.matchAll(/<ul class="novedades">([\s\S]*?)<\/ul>/g)];
  const lis = bloques.flatMap((b) => b[1].split('<li>').slice(b[0].startsWith('<ul') ? 1 : 0));
  return bloques.length >= 3 && lis.every((x) => x.includes('class="vigencia"'));
})());
caso('Res. UPME 563 de 2026 con vigencia 7 ago 2026, y la 400 tachada', /Vigente desde el 7 ago 2026 · Res\. UPME 563 de 2026/.test(g) && /<del class="antes">Resolución (UPME )?000400 de 2026/.test(g));
caso('Comunicado DIAN 127 (1 oct 2026): cita solo en 4 ciudades y formulario electrónico del 010', /Desde el 1 oct 2026 · Comunicado DIAN 127/.test(g) && /formulario electrónico/.test(g));
caso('Manizales señalada como dudosa (el abecé y el comunicado no coinciden)', /Manizales:<\/b> el abecé de la DIAN también la incluye/.test(g));
caso('asunto oficial del abecé DIAN y el viejo tachado', /Solicitud devolución vehículos eléctricos o híbridos - Nombre o razón social - NIT - Fecha \(año-mes-día\)/.test(g) && /<del class="antes">La DIAN pide que el asunto incluya/.test(g));
caso('20 MB por cada PDF (antes «por correo», tachado)', /<del class="antes">La DIAN pide que los PDF no superen 20 MB por correo/.test(g) && /Cada PDF puede pesar hasta <b>20 MB<\/b>/.test(g));
caso('agendamiento nuevo (agendamiento.dian.gov.co) y el viejo tachado', /href="https:\/\/agendamiento\.dian\.gov\.co\/"/.test(g) && !/href="https:\/\/agendamientodigiturno/.test(g));
caso('Concepto DIAN 12670 (nota crédito no) con vigencia 4 ago 2026', /Vigente desde el 4 ago 2026 · Concepto DIAN 12670/.test(g) && /nota crédito/.test(g));
caso('Concepto DIAN 2242 (antes de comprar: factura sin IVA) con vigencia 12 nov 2026', /Vigente desde el 12 nov 2026 · Concepto DIAN 2242/.test(g) && /id="antesDeComprar"/.test(g));
caso('aviso neutral de la Ley de Rescate: en trámite y NO vigente', /En trámite desde el 29 oct 2026 · NO vigente/.test(g) && /No está aprobado/.test(g));
caso('UVT por año (no queda fija en 2026)', /const UVT = \{ 2025:49799, 2026:52374 \}/.test(g) && /function uvtVigente/.test(g));
const sitio = (() => { try { return JSON.parse(leer('config/sitio.json')); } catch { return {}; } })();
caso('el manual usa la dirección /exec del administrador para estrellas y «Quiero aparecer»', sitio.comunidad?.servicio === 'https://script.google.com/macros/s/AKfycbyufnuvwdFEz0Vtj_nTJnBDnOC6vRGLx_kC8SyZWTnutWS89mL0MPORjv9rkaCbY4Q/exec');
caso('el orden estricto de las casillas se mantiene', /cb\.disabled=!\(unlocked && \(prevOk \|\| on\)\)/.test(g));

// ---------- Navegador ----------
let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.log('(sin Playwright: se omiten las pruebas de navegador)'); }
if (chromium) {
  const nav = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const urlGuia = pathToFileURL(GUIA).href;

  // ---------- A2. Guía en el navegador (abierta como archivo descargado) ----------
  for (const [ancho, alto, oscuro] of [[390, 844, false], [390, 844, true], [1280, 900, false]]) {
    const et = `${oscuro ? 'oscuro' : 'claro'} ${ancho}px`;
    const ctx = await nav.newContext({ viewport: { width: ancho, height: alto }, colorScheme: oscuro ? 'dark' : 'light' });
    const p = await ctx.newPage(); p.setDefaultTimeout(5000);
    const externas = [], dialogos = [], errores = [];
    p.on('request', (r) => { if (/^https?:/.test(r.url())) externas.push(r.url()); });
    p.on('dialog', (d) => { dialogos.push(d.message()); d.dismiss(); });
    p.on('pageerror', (e) => errores.push(e.message));
    try {
      await p.goto(urlGuia); await p.waitForTimeout(500);
      const m = await p.evaluate(() => ({ desborde: document.documentElement.scrollWidth - innerWidth, rail: document.querySelector('.rail').offsetHeight, fondo: getComputedStyle(document.body).backgroundColor }));
      caso(`${et}: la página no se sale de la pantalla`, m.desborde <= 0, `${m.desborde}px de más`);
      caso(`${et}: la barra superior ocupa poco (≤ 100 px)`, m.rail <= 100, `${m.rail}px`);
      if (oscuro) caso(`${et}: respeta el modo oscuro del sistema`, /rgb\((\d{1,2}), (\d{1,2}), (\d{1,2})\)/.test(m.fondo), m.fondo);
      caso(`${et}: no pide nada a internet al abrir`, externas.length === 0, externas.join(' '));
      if (ancho === 390 && !oscuro) {
        const sinNombre = await p.evaluate(() => [...document.querySelectorAll('button')].filter((b) => !(b.getAttribute('aria-label') || b.textContent.trim())).length);
        caso('todos los botones tienen nombre (los «?» incluidos)', sinNombre === 0, `${sinNombre} sin nombre`);
        const tt = await p.evaluate(() => { const b = document.querySelector('.tt'); b.focus(); return [b.getAttribute('aria-label'), b.getAttribute('aria-describedby'), document.getElementById('tip').textContent.length]; });
        caso('al enfocar un «?» su explicación queda asociada (aria-describedby)', tt[0] && tt[1] === 'tip' && tt[2] > 20, JSON.stringify(tt));
        const tam = await p.evaluate(() => { const r = document.querySelector('.tt').getBoundingClientRect(); return [r.width, r.height]; });
        caso('los «?» miden al menos 24 × 24 px', tam[0] >= 24 && tam[1] >= 24, tam.join('×'));
        caso('«Descargar esta guía» no aparece si ya es un archivo descargado', await p.locator('#btnDescargar').isHidden());
        // Orden estricto
        await p.click('#btnStart');
        caso('orden estricto: el punto 2 del Paso 1 está bloqueado hasta marcar el 1', await p.locator('#c-1-1').isDisabled() && !(await p.locator('#c-1-0').isDisabled()));
        // Plantillas: sin cita (Ruta A) no dice «Cita agendada»
        await p.evaluate(() => { location.hash = ''; });
        await p.click('.navbtn[data-goto="0"]');
        await p.evaluate(() => { document.getElementById('misdatos').open = true; });
        await p.fill('#d_nombre', 'Ana María Pérez Gómez'); await p.fill('#d_cedula', '52000111');
        await p.click('.navbtn[data-goto="3"]');
        await p.selectOption('#ruta', 'virtual');
        const sinCita = await p.evaluate(() => [document.getElementById('txtB').textContent, document.getElementById('mailBody').textContent, document.getElementById('mailSubject').textContent]);
        caso('Ruta virtual: la carta y el correo no dicen «Cita agendada»', !/Cita agendada/.test(sinCita[0] + sinCita[1]));
        caso('asunto con el formato oficial y tus datos', /^Solicitud devolución vehículos eléctricos o híbridos - ANA MARÍA PÉREZ GÓMEZ - 52000111 - \d{4}-\d{2}-\d{2}$/.test(sinCita[2]), sinCita[2]);
        await p.selectOption('#ruta', 'cita');
        await p.click('.navbtn[data-goto="0"]');
        await p.evaluate(() => { document.getElementById('misdatos').open = true; });
        await p.fill('#d_fcita', '14/10/2026 a las 9:00 a. m.'); await p.press('#d_fcita', 'Tab');
        const conCita = await p.evaluate(() => [document.getElementById('txtB').textContent, document.getElementById('mailSubject').textContent]);
        caso('Ruta con cita: la carta sí lo dice y el asunto usa la fecha de la cita', /Cita agendada/.test(conCita[0]) && /- 2026-10-14$/.test(conCita[1]), conCita[1]);
        // Reiniciar: ventana propia, «Cancelar» con el foco y no borra
        await p.click('#opciones > summary'); await p.click('#btnReset');
        caso('«Reiniciar» abre una ventana propia con el foco en «Cancelar»', await p.locator('#dlgConfirmar[open]').isVisible() && await p.evaluate(() => document.activeElement?.hasAttribute('data-no')));
        await p.keyboard.press('Escape');
        caso('Escape cancela y no borra tus datos', await p.inputValue('#d_nombre') === 'Ana María Pérez Gómez');
        await p.click('#opciones > summary'); await p.click('#btnReset'); await p.click('#dlgConfirmar [data-si]');
        caso('«Borrar todo» sí borra', await p.inputValue('#d_nombre') === '');
        // Restaurar: solo claves conocidas; lo raro se descarta
        const copia = path.join(fs.mkdtempSync(path.join(fs.realpathSync('/tmp'), 'guia-')), 'copia.json');
        fs.writeFileSync(copia, JSON.stringify({ v: 1, checks: { '1-0': true, '9-9': true, x: true }, data: { nombre: '<img src=x onerror="window.__x=1">Ana', hack: 'nada' }, ruta: 'otra', __proto__x: 1 }));
        await p.setInputFiles('#fileIn', copia);
        await p.click('#dlgConfirmar [data-si]'); await p.waitForTimeout(300);
        const guardado = await p.evaluate(() => JSON.parse(localStorage.getItem('guia-iva-ve-v1')));
        caso('restaurar una copia descarta claves desconocidas y valores raros', guardado.checks['1-0'] === true && !('9-9' in guardado.checks) && !('x' in guardado.checks) && !('hack' in guardado.data) && guardado.ruta === '', JSON.stringify(guardado).slice(0, 200));
        caso('el texto restaurado se muestra como texto (sin ejecutar HTML)', await p.evaluate(() => window.__x === undefined && !document.querySelector('#txtB img')));
        // Tema
        await p.click('#opciones > summary'); await p.click('#btnTema');
        caso('el botón de tema cambia a oscuro y se recuerda', await p.evaluate(() => document.documentElement.dataset.tema === 'oscuro' && localStorage.getItem('guia-iva-tema') === 'oscuro'));
      }
      caso(`${et}: sin ventanas del navegador ni errores`, dialogos.length === 0 && errores.length === 0, [...dialogos, ...errores].join(' | '));
    } catch (e) { caso(`${et}: el recorrido se pudo completar`, false, e.message.split('\n')[0]); }
    await ctx.close();
  }

  // ---------- B. Pestaña «Trámites» del manual ----------
  {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
    const p = await ctx.newPage(); p.setDefaultTimeout(6000);
    const errores = []; p.on('pageerror', (e) => errores.push(e.message));
    try {
      await p.goto(BASE + '#tramites'); await p.waitForTimeout(1200);
      caso('hay una pestaña «Trámites» en la navegación', (await p.locator('.pestanas a[data-vista="tramites"]').count()) === 1);
      caso('la pestaña muestra la guía de devolución del IVA', await p.locator('#tramite-devolucion-iva').isVisible());
      caso('la tarjeta muestra la versión que trae la propia guía', /Guía v\d{2}\.\d{2}\.\d{2}cl/.test(await p.locator('#tramite-devolucion-iva').textContent()));
      const abrir = p.locator('#tramite-devolucion-iva a', { hasText: 'Abrir la guía' });
      caso('«Abrir la guía» lleva al archivo de la guía en una pestaña nueva', await abrir.getAttribute('href') === 'guias/devolucion-iva.html' && await abrir.getAttribute('target') === '_blank');
      const [descarga] = await Promise.all([p.waitForEvent('download'), p.locator('#tramite-devolucion-iva a[download]').click()]);
      const ruta = await descarga.path();
      const bajado = fs.readFileSync(ruta, 'utf8');
      caso('«Descargar (HTML)» entrega la guía completa con nombre y versión', /^Guia_Devolucion_IVA_v\d{2}\.\d{2}\.\d{2}cl\.html$/.test(descarga.suggestedFilename()) && bajado === g, descarga.suggestedFilename());
      await p.locator('.novedades-tramite > summary').click();
      const nov = await p.locator('.novedades-tramite li').allTextContents();
      caso('las novedades de la tarjeta traen su fecha de vigencia', nov.length >= 5 && nov.every((t) => /Vigente desde el \d{1,2} de \w+ de \d{4}|En trámite: no vigente/.test(t)), nov[0]);
      caso('la pestaña no se sale de la pantalla en el celular', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      // La guía abierta desde el manual (con el ayudante sin conexión activo) es la guía, no la portada del manual
      const g2 = await ctx.newPage(); await g2.goto(BASE + 'guias/devolucion-iva.html'); await g2.waitForTimeout(600);
      caso('la guía abre como página propia desde el manual', /Cómo recuperar el IVA/.test(await g2.title()));
      caso('desde la web, la guía ofrece «Descargar esta guía» (en «Opciones»)', await g2.evaluate(() => document.getElementById('btnDescargar').hidden === false));
      const sw = leer('sw.js');
      caso('la guía y la lista de trámites quedan guardadas para usarlas sin conexión', /'guias\/devolucion-iva\.html'/.test(sw) && /'data\/tramites\.json'/.test(sw) && /\\\/guias\\\//.test(sw));
    } catch (e) { caso('pestaña Trámites: el recorrido se pudo completar', false, e.message.split('\n')[0]); }
    caso('pestaña Trámites: sin errores de JavaScript', errores.length === 0, errores.join(' | '));
    await ctx.close();
  }
  // ---------- C. Tableta: cuatro pestañas sin apretar el aviso «no oficial» ----------
  for (const ancho of [768, 820, 1024]) {
    const ctx = await nav.newContext({ viewport: { width: ancho, height: 1000 } });
    const p = await ctx.newPage();
    await p.route('https://script.google.com/**', (r) => r.abort()); // las pruebas no tocan el servicio real
    try {
      await p.goto(BASE + '#tramites'); await p.waitForTimeout(700);
      const r = await p.evaluate(() => { const sm = document.getElementById('subtituloSitio'); const t = document.querySelector('.titulo-sitio').getBoundingClientRect(); return { completo: sm.scrollWidth <= sm.clientWidth + 1 && /no oficial/.test(sm.textContent), ancho: t.width, desborde: document.documentElement.scrollWidth - innerWidth }; });
      caso(`${ancho}px: con cuatro pestañas el título y «no oficial» se leen completos`, r.completo && r.ancho >= 200 && r.desborde <= 0, JSON.stringify(r));
    } catch (e) { caso(`${ancho}px: el recorrido se pudo completar`, false, e.message.split('\n')[0]); }
    await ctx.close();
  }
  await nav.close();
}

console.log(`\n${total - fallas}/${total} afirmaciones pasaron`);
process.exit(fallas ? 1 : 0);
