// =====================================================================
// Script árbitro de la versión v02.01 — estrellas, opiniones, formulario
// «Quiero aparecer», orden por ciudad y servicio, «Calificación baja».
// Pedidos del autor:
//   1. «que los visitantes puedan dar estrellas, feedback, etc.»
//   2. «quienes deseen aparecer allí lo hagan diligenciando un formulario»
//   3. «si tiene 2 estrellas o menos, no siga apareciendo o quede en una
//      sección no tan visible. Siempre los mejores arriba.»
//   4. «organizado por ciudad y tipo de servicio»
//   5. «la información/anunciantes no debe quedar amontonada»
// Debe FALLAR contra v02.00.01cl y PASAR contra v02.01.00cl.
// Uso: servidor en la carpeta y BASE=http://localhost:8080/ node tests/arbitro-v02-01.mjs
//      Para probar otra carpeta (la versión anterior): RAIZ=/ruta BASE=... node tests/arbitro-v02-01.mjs
// El Apps Script no se llama de verdad: lo responde el simulador (tests/gas-simulador.mjs).
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nuevoServicio, sembrar, conectar, entrarPanel, CLAVE_PRUEBA, URL_PRUEBA } from './apoyo-comunidad.mjs';

const RAIZ = process.env.RAIZ || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE || 'http://localhost:8080/';
let fallas = 0, total = 0;
function caso(nombre, ok, detalle = '') { total++; if (ok) console.log('✔', nombre); else { fallas++; console.log('✘', nombre, detalle ? `\n    ${String(detalle).slice(0, 300)}` : ''); } }
const leer = (r) => { try { return fs.readFileSync(path.join(RAIZ, r), 'utf8'); } catch { return ''; } };
const json = (r) => { try { return JSON.parse(leer(r)); } catch { return {}; } };

// ---------- A. Revisión estática ----------
const sitio = json('config/sitio.json');
const dir = json('data/directorio.json').contactos || [];
// Desde v02.02 el administrador ya configuró su dirección /exec: se acepta vacía o una dirección válida
caso('config/sitio.json trae la sección «comunidad»: vacía (apagado) o con una dirección /exec válida', sitio.comunidad && (sitio.comunidad.servicio === '' || /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{10,}\/exec$/.test(sitio.comunidad.servicio)));
caso('umbral de calificación baja = 2 y mínimo para bajar = 3', sitio.comunidad?.umbralBajo === 2 && sitio.comunidad?.minimoParaBajar === 3);
const ids = dir.map((d) => d.id);
caso('cada contacto del directorio tiene un id único (ahí se guardan sus estrellas)', ids.length > 0 && ids.every((x) => /^[a-z0-9][a-z0-9-]{2,79}$/.test(x || '')) && new Set(ids).size === ids.length);
const gs = leer('apps-script/Codigo.gs');
caso('existe el servidor de Apps Script (Codigo.gs) con doGet y doPost', /function doGet\(/.test(gs) && /function doPost\(/.test(gs));
caso('el servidor guarda solo la huella de la clave, nunca la clave', /ADMIN_HASH/.test(gs) && !/clave-de-prueba/.test(gs));
const man = json('apps-script/appsscript.json');
caso('manifiesto: V8, ejecuta como quien publica, acceso anónimo y alcance solo de la hoja propia', man.runtimeVersion === 'V8' && man.webapp?.executeAs === 'USER_DEPLOYING' && man.webapp?.access === 'ANYONE_ANONYMOUS' && (man.oauthScopes || []).includes('https://www.googleapis.com/auth/spreadsheets.currentonly') && !(man.oauthScopes || []).includes('https://www.googleapis.com/auth/spreadsheets'));
caso('la copia sin conexión incluye js/comunidad.js', leer('sw.js').includes("'js/comunidad.js'"));
caso('la guía COMUNIDAD.md existe y explica la implementación paso a paso', /Implementar|implementación/i.test(leer('COMUNIDAD.md')) && /configurar/.test(leer('COMUNIDAD.md')));
const html = leer('index.html');
caso('formulario de calificar con 5 estrellas como botones de opción', (html.match(/name="estrellas"/g) || []).length === 5);
caso('formulario «Quiero aparecer» con autorización de datos (Ley 1581)', /id="apAutoriza"/.test(html) && /Ley 1581/.test(html));
caso('ambos formularios traen campo trampa para robots', /id="calSitio"/.test(html) && /id="apSitio"/.test(html));

// ---------- B. Navegador con el Apps Script simulado ----------
let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.log('(sin Playwright: se omiten las pruebas de navegador)'); }
if (chromium) {
  const nav = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const errores = [];
  async function pagina(g, { ancho = 390, alto = 844, hash = '#directorio', oscuro = false, ...op } = {}) {
    const ctx = await nav.newContext({ viewport: { width: ancho, height: alto }, colorScheme: oscuro ? 'dark' : 'light' });
    if (oscuro) await ctx.addInitScript(() => { try { localStorage.setItem('deepal-tema', 'oscuro'); } catch { /* */ } });
    // Sin servicio (g = null): se simula la configuración vacía y se bloquea cualquier llamada real
    const llamadas = g ? await conectar(ctx, g, op) : await conectar(ctx, null, { url: '', caido: true });
    const p = await ctx.newPage();
    p.setDefaultTimeout(6000);
    p.on('pageerror', (e) => errores.push(e.message));
    await p.goto(BASE + hash);
    await p.waitForSelector('#listaDir, #vistaAdmin', { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(900);
    return { p, ctx, llamadas };
  }

  // B1. Sin servicio configurado: nada de estrellas ni formulario (la app sigue igual)
  {
    const { p, ctx, llamadas } = await pagina(null);
    try {
    caso('sin servicio: no aparecen botones de calificar', (await p.locator('[data-calificar]').count()) === 0);
    caso('sin servicio: el botón «Quiero aparecer» queda oculto', !(await p.locator('#btnAparecer').isVisible().catch(() => false)));
    caso('sin servicio: no se llama a ningún servidor', llamadas.length === 0);
    } catch (e) { caso('el recorrido se pudo completar', false, e.message.split('\n')[0]); }
    await ctx.close();
  }

  // Datos de prueba (ficticios): ids reales del directorio
  const salitre = 'deepal-salitre-fijo-bogota';
  const vardiSalitre = 'taller-vardi-salitre-asesor-de-taller-bogota';
  const morato = 'taller-autorizado-vardi-morato-bogota'; // va después de Salitre en el archivo: si sale primero, es por sus estrellas
  const deBogota = dir.filter((d) => d.ciudad === 'Bogotá');
  const unVoto = deBogota.find((d) => d.id && ![salitre, vardiSalitre, morato].includes(d.id))?.id || 'sin-id-en-esta-version';
  const g = nuevoServicio();
  sembrar(g, [
    [salitre, 4, 'Muy buena atención.'], [salitre, 4], [salitre, 5],
    [morato, 5], [morato, 5], [morato, 5],
    // Desde v02.01.01 las de 1 estrella no cuentan: la «calificación baja» se siembra con 2 estrellas
    [vardiSalitre, 2], [vardiSalitre, 2], [vardiSalitre, 2, 'Se demoraron <img src=x onerror="window.__xss=1"> tres semanas.'],
    [unVoto, 2],
  ]);

  // B2. Orden: ciudades plegables → tipo de servicio → mejores arriba
  {
    const { p, ctx } = await pagina(g);
    try {
    const ciudades = await p.$$eval('#listaDir > details.ciudad', (els) => els.map((e) => e.dataset.ciudad));
    caso('el directorio se organiza por ciudad (Bogotá primero, Nacional y Sin confirmar al final)', ciudades[0] === 'Bogotá' && ciudades.indexOf('Nacional') > ciudades.indexOf('Medellín') && ciudades.at(-1) === 'Sin confirmar', ciudades.join(' | '));
    caso('no amontonado: con todas las ciudades, cada ciudad empieza plegada', ciudades.length > 3 && (await p.locator('#listaDir > details.ciudad[open]').count()) === 0);
    caso('cada ciudad plegada resume sus tipos de servicio y cuántos hay', /\d/.test(await p.locator('details.ciudad[data-ciudad="Bogotá"] .servicios-ciudad').textContent().catch(() => '')));
    await p.click('details.ciudad[data-ciudad="Bogotá"] > summary');
    const subt = await p.$$eval('details.ciudad[data-ciudad="Bogotá"] .subcat h3', (els) => els.map((e) => e.firstChild.textContent.trim()));
    caso('dentro de la ciudad, subtítulos por tipo de servicio', subt.length >= 3 && subt.includes('Deepal oficial'), subt.join(' | '));
    const oficial = await p.$$eval('details.ciudad[data-ciudad="Bogotá"] .subcat', (secs) => {
      const s = secs.find((x) => x.querySelector('h3').textContent.includes('Deepal oficial'));
      return s ? [...s.querySelectorAll('[data-calificar]')].map((b) => b.dataset.calificar) : [];
    });
    caso('los mejor calificados van arriba en su grupo (aunque en el archivo estén después)', oficial[0] === morato && oficial[1] === salitre, oficial.join(', '));
    const principal = await p.$$eval('#listaDir > details.ciudad [data-calificar]', (els) => els.map((e) => e.dataset.calificar));
    caso('promedio de 2 o menos con 3 calificaciones: sale de la lista principal', !principal.includes(vardiSalitre));
    caso('…y queda en la sección plegada «Calificación baja»', (await p.locator(`details.bajos:not([open]) [data-calificar="${vardiSalitre}"]`).count()) === 1);
    caso('una sola calificación baja no esconde a nadie (mínimo 3)', principal.includes(unVoto));
    const fichaSalitre = p.locator(`details.ciudad [data-calificar="${salitre}"]`).locator('xpath=ancestor::article');
    caso('la ficha muestra el promedio y cuántos calificaron en una sola línea', /4,3\s*\(3\)/.test(await fichaSalitre.locator('.valoracion').textContent().catch(() => '')));
    caso('las opiniones quedan plegadas dentro de la ficha', (await fichaSalitre.locator('details.opiniones:not([open])').count()) === 1);
    await p.click('details.bajos > summary');
    await p.locator(`details.bajos article:has([data-calificar="${vardiSalitre}"]) details.opiniones > summary`).click();
    caso('una opinión con HTML se muestra como texto (sin ejecutar nada)', (await p.evaluate(() => window.__xss)) === undefined && (await p.locator('details.bajos .opiniones img').count()) === 0 && /onerror/.test(await p.locator('details.bajos .opiniones p').first().textContent()));
    // Filtrar una ciudad la abre; las abiertas se recuerdan
    await p.click('#chipsCiudad [data-v="Medellín"]');
    caso('al elegir una ciudad en los filtros, su sección se abre sola', (await p.locator('details.ciudad[data-ciudad="Medellín"][open]').count()) === 1);
    // Búsqueda: lista plana, mejores arriba, los bajos siguen aparte
    await p.click('#chipsCiudad [data-v="all"]');
    await p.fill('#q', 'vardi'); await p.waitForTimeout(500);
    const res = await p.$$eval('#listaDir > .fichas [data-calificar]', (els) => els.map((e) => e.dataset.calificar));
    caso('al buscar: resultados en fichas, el mejor calificado primero y los bajos aparte', res[0] === morato && !res.includes(vardiSalitre) && (await p.locator(`details.bajos [data-calificar="${vardiSalitre}"]`).count()) === 1, res.join(', '));
    } catch (e) { caso('el recorrido se pudo completar', false, e.message.split('\n')[0]); }
    await ctx.close();
  }

  // B3. No amontonado en ningún tamaño ni tema: sin desbordes y fichas con aire
  for (const [ancho, oscuro] of [[390, false], [390, true], [820, false], [1280, false], [1440, true]]) {
    const { p, ctx } = await pagina(g, { ancho, alto: 900, oscuro });
    try {
    await p.click('details.ciudad[data-ciudad="Bogotá"] > summary');
    const m = await p.evaluate(() => {
      const fichas = [...document.querySelectorAll('details.ciudad[open] .fichas > article')].slice(0, 12);
      const r = fichas.map((f) => f.getBoundingClientRect());
      let solape = 0, juntas = 0;
      for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) {
        const a = r[i], b = r[j];
        const sx = Math.min(a.right, b.right) - Math.max(a.left, b.left), sy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (sx > 1 && sy > 1) solape++;
        const gx = Math.max(a.left, b.left) - Math.min(a.right, b.right), gy = Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom);
        if (sx > 1 && gy >= 0 && gy < 8) juntas++; if (sy > 1 && gx >= 0 && gx < 8) juntas++;
      }
      const nombreCompleto = fichas.every((f) => { const n = f.querySelector('.nm'); return n.scrollWidth <= n.clientWidth + 1; });
      const botones = [...document.querySelectorAll('details.ciudad[open] .acts a, details.ciudad[open] .acts button')].every((b) => b.getBoundingClientRect().width >= 44);
      return { n: fichas.length, solape, juntas, nombreCompleto, botones, desborde: document.documentElement.scrollWidth - window.innerWidth };
    });
    const et = `${oscuro ? 'oscuro' : 'claro'} ${ancho}px`;
    caso(`${et}: sin desborde horizontal`, m.desborde <= 0, m.desborde);
    caso(`${et}: fichas sin solaparse y con al menos 8 px entre ellas`, m.n > 3 && m.solape === 0 && m.juntas === 0, JSON.stringify(m));
    caso(`${et}: nombres completos y botones de 44 px o más`, m.nombreCompleto && m.botones, JSON.stringify(m));
    if (ancho >= 1280) caso(`${et}: en pantalla ancha las fichas usan varias columnas`, await p.evaluate(() => getComputedStyle(document.querySelector('details.ciudad[open] .fichas')).gridTemplateColumns.split(' ').length >= 2));
    } catch (e) { caso('el recorrido se pudo completar', false, e.message.split('\n')[0]); }
    await ctx.close();
  }

  // B4. Calificar de punta a punta
  {
    const { p, ctx, llamadas } = await pagina(g);
    try {
    await p.click('details.ciudad[data-ciudad="Bogotá"] > summary');
    const objetivo = deBogota.find((d) => ![salitre, vardiSalitre, unVoto, morato].includes(d.id)).id;
    await p.click(`[data-calificar="${objetivo}"]`);
    caso('el botón de la estrella abre el formulario de calificar', await p.locator('#dlgCalificar[open]').isVisible());
    caso('el foco empieza en las estrellas', await p.evaluate(() => document.activeElement?.name === 'estrellas'));
    await p.keyboard.press('ArrowRight');
    caso('con el teclado se elige la cantidad de estrellas (flechas)', await p.evaluate(() => document.querySelector('#formCalificar').estrellas.value === '2'));
    await p.evaluate(() => { document.querySelectorAll('#formCalificar input[name="estrellas"]').forEach((x) => { x.checked = false; }); });
    const antes = llamadas.length;
    await p.click('#formCalificar [type="submit"]');
    caso('sin estrellas no se envía y avisa', llamadas.length === antes && /Elige de 1 a 5/.test(await p.textContent('#estadoCalificar')));
    await p.click('label[for="est4"]');
    caso('al tocar la 4.ª estrella se iluminan cuatro y lo dice en palabras', (await p.locator('.estrellas-opciones label.llena').count()) === 4 && /4 de 5/.test(await p.textContent('#textoEstrellas')));
    await p.check('#formCalificar input[name="recomienda"][value="si"]');
    await p.fill('#calComentario', 'Buen trabajo, llámenme al 3001234567');
    await p.click('#formCalificar [type="submit"]');
    await p.waitForFunction(() => /Gracias/.test(document.getElementById('estadoCalificar').textContent), null, { timeout: 8000 }).catch(() => {});
    caso('al enviar: agradece y avisa que la opinión se revisa antes de publicarse', /Gracias/.test(await p.textContent('#estadoCalificar')) && /revise/.test(await p.textContent('#estadoCalificar')));
    const post = llamadas.find((l) => l.metodo === 'POST' && /"calificar"/.test(l.cuerpo || ''));
    caso('se envía como texto plano (sin preflight de CORS) a la dirección configurada', post && post.tipo.startsWith('text/plain') && post.url === URL_PRUEBA);
    const fila = g.filas('CALIFICACIONES').find((f) => f.contactoId === objetivo);
    caso('el servidor guardó la calificación pendiente de revisión, con el teléfono oculto', fila && fila.estrellas === '4' && fila.estado === 'pendiente' && !/3001234567/.test(fila.comentario), JSON.stringify(fila));
    await p.waitForTimeout(2600);
    caso('después de calificar, su estrella queda marcada en la ficha', (await p.locator(`[data-calificar="${objetivo}"].hecha`).count()) === 1);
    caso('…y el promedio ya cuenta en la ficha', /4\s*\(1\)/.test(await p.locator(`article:has([data-calificar="${objetivo}"]) .valoracion`).first().textContent().catch(() => '')));
    } catch (e) { caso('el recorrido se pudo completar', false, e.message.split('\n')[0]); }
    await ctx.close();
  }

  // B5. Formulario «Quiero aparecer»
  {
    const { p, ctx, llamadas } = await pagina(g);
    try {
    await p.click('#btnAparecer');
    caso('«Quiero aparecer» abre el formulario con el foco en el primer campo', await p.locator('#dlgAparecer[open]').isVisible() && await p.evaluate(() => document.activeElement?.id === 'apNegocio'));
    caso('sugiere servicios y ciudades que ya existen', (await p.locator('#listaServicios option').count()) >= 5 && (await p.locator('#listaCiudades option').count()) >= 3);
    const antes = llamadas.length;
    await p.click('#formAparecer [type="submit"]');
    caso('vacío: no se envía, marca los campos y explica qué falta', llamadas.length === antes && (await p.locator('#formAparecer [aria-invalid]').count()) >= 4 && /autorizar/.test(await p.textContent('#estadoAparecer')));
    await p.fill('#apNegocio', 'Polarizados Ejemplo'); await p.fill('#apServicio', 'Polarizado, PPF y detailing'); await p.fill('#apCiudad', 'Bogotá');
    await p.fill('#apTelefono', '+57 300 000 0001'); await p.fill('#apWeb', 'http://inseguro.example');
    await p.check('#apAutoriza');
    await p.click('#formAparecer [type="submit"]');
    caso('web sin https: avisa y no envía', llamadas.length === antes && /https/.test(await p.textContent('#estadoAparecer')));
    await p.fill('#apWeb', 'https://ejemplo.com'); await p.fill('#apDescripcion', 'PPF y cerámico para S07.');
    await p.click('#formAparecer [type="submit"]');
    await p.waitForFunction(() => /Recibimos/.test(document.getElementById('estadoAparecer').textContent), null, { timeout: 8000 }).catch(() => {});
    caso('válido: confirma que llegó y que se revisa antes de publicar', /Recibimos/.test(await p.textContent('#estadoAparecer')));
    const s = g.filas('SOLICITUDES').find((f) => f.negocio === 'Polarizados Ejemplo');
    caso('la solicitud quedó en la hoja, pendiente, con la autorización registrada y el teléfono intacto', s && s.estado === 'pendiente' && /^s[ií]\b/i.test(s.autoriza) && s.telefono === '+57 300 000 0001', JSON.stringify(s));
    } catch (e) { caso('el recorrido se pudo completar', false, e.message.split('\n')[0]); }
    await ctx.close();
  }

  // B6. Sin internet o servicio caído: el directorio sigue funcionando
  {
    const g2 = nuevoServicio();
    const { p, ctx } = await pagina(g2, { caido: true });
    try {
    caso('servicio caído: el directorio se ve igual (sin estrellas de otros)', (await p.locator('#listaDir details.ciudad').count()) > 3);
    await ctx.setOffline(true);
    await p.click('details.ciudad[data-ciudad="Bogotá"] > summary');
    await p.locator('details.ciudad[open] [data-calificar]').first().click();
    caso('sin internet: el formulario lo dice y no deja enviar', /conexión/.test(await p.textContent('#estadoCalificar')) && await p.locator('#formCalificar [type="submit"]').isDisabled());
    } catch (e) { caso('el recorrido se pudo completar', false, e.message.split('\n')[0]); }
    await ctx.close();
  }

  // B7. Panel del administrador: moderar
  {
    const { p, ctx } = await pagina(g, { hash: '#admin', ancho: 1280, alto: 900 });
    try {
    // Pruebas tocadas en v02.03: el panel pide usuario y contraseña (antes, una clave en el paso 6)
    //   y «Agregar al directorio» publica el contacto en la hoja en un solo paso (antes iba a cambios pendientes).
    await p.fill('#inUsuario', 'admin'); await p.fill('#inClave', 'clave-equivocada-123'); await p.click('#btnEntrar'); await p.waitForTimeout(500);
    caso('clave equivocada: lo dice y no muestra nada', /incorrect/.test(await p.textContent('#estadoIngreso')) && (await p.locator('#listaOpiniones').count()) === 0);
    await entrarPanel(p, { seccion: 'opiniones' });
    caso('el panel trae la sección «Opiniones»', await p.waitForSelector('#listaOpiniones h4', { timeout: 8000 }).then(() => true).catch(() => false));
    await p.waitForSelector('#listaOpiniones tbody tr', { timeout: 8000 }).catch(() => {});
    caso('clave correcta: muestra la opinión y la solicitud pendientes', (await p.locator('#listaOpiniones tbody tr').count()) >= 1 && (await p.locator('#listaSolicitudes tbody tr').count()) >= 1);
    caso('la clave no queda guardada en el navegador', await p.evaluate((c) => !JSON.stringify({ ...localStorage, ...sessionStorage }).includes(c), CLAVE_PRUEBA));
    await p.locator('#listaOpiniones tbody tr').first().locator('[data-estado="publicado"]').click();
    await p.waitForTimeout(400);
    caso('«Publicar» publica la opinión en el servidor', g.filas('CALIFICACIONES').some((f) => f.estado === 'publicado' && /Buen trabajo/.test(f.comentario)));
    await p.locator('#listaSolicitudes tbody tr').first().locator('[data-estado="agregada"]').click();
    await p.waitForTimeout(600);
    const fila = g.filas('DIRECTORIO').find((f) => f.nombre === 'Polarizados Ejemplo');
    const nuevo = fila ? JSON.parse(fila.datos) : null;
    caso('«Agregar al directorio» crea el contacto en la hoja, con id propio', nuevo && /^polarizados-ejemplo-bogota/.test(nuevo.id) && nuevo.web === 'https://ejemplo.com' && fila.estado === 'publicado', JSON.stringify(nuevo));
    caso('…y marca la solicitud como agregada en la hoja', g.filas('SOLICITUDES').some((f) => f.negocio === 'Polarizados Ejemplo' && f.estado === 'agregada'));
    caso('lista los contactos en «Calificación baja» para revisarlos', (await p.locator(`[data-revisar="${vardiSalitre}"]`).count()) === 1);
    await p.click(`[data-revisar="${vardiSalitre}"]`);
    await p.waitForSelector(`#rev-${vardiSalitre} tr`, { timeout: 8000 }).catch(() => {});
    caso('«Revisar calificaciones» muestra todas, también las que no traen texto', (await p.locator(`#rev-${vardiSalitre} tr`).count()) === 3);
    await p.locator(`#rev-${vardiSalitre} tr`).first().locator('[data-estado="rechazado"]').click();
    await p.waitForTimeout(400);
    caso('«No contar» saca esa calificación del promedio', g.filas('CALIFICACIONES').filter((f) => f.contactoId === vardiSalitre && f.estado === 'rechazado').length === 1);
    } catch (e) { caso('el recorrido se pudo completar', false, e.message.split('\n')[0]); }
    await ctx.close();
  }

  caso('sin errores de JavaScript en la página', errores.length === 0, errores.join(' | '));
  await nav.close();
}

console.log(`\n${total - fallas}/${total} afirmaciones pasaron`);
process.exit(fallas ? 1 : 0);
