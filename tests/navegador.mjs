// Prueba de punta a punta en un navegador real (Chrome) con Playwright.
// Requiere: npm i -D playwright  y  npx playwright install chromium
// Ejecuta:  python3 -m http.server 8080  (en otra terminal)  y luego  node tests/navegador.mjs
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { nuevoServicio, conectar, CLAVE_PRUEBA } from './apoyo-comunidad.mjs';

const BASE = process.env.BASE || 'http://localhost:8080/';
const SALIDA = process.env.CAPTURAS || '/tmp/capturas';
fs.mkdirSync(SALIDA, { recursive: true });
const TIPS = JSON.parse(fs.readFileSync(new URL('../data/tips.json', import.meta.url), 'utf8')).tips;
const navegador = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
let fallas = 0;
async function caso(nombre, fn) {
  try { await fn(); console.log('✔', nombre); } catch (e) { fallas++; console.log('✘', nombre, '\n   ', e.message.split('\n')[0]); }
}

for (const [disp, vp] of [['celular', { width: 390, height: 844 }], ['escritorio', { width: 1280, height: 860 }]]) {
  const ctx = await navegador.newContext({ viewport: vp, locale: 'es-CO', timezoneId: 'America/Bogota', acceptDownloads: true, serviceWorkers: 'allow' });
  // Pruebas tocadas en v02.03: el manual ahora consulta la hoja de la comunidad; en las pruebas nunca se llama al servicio real
  await ctx.route('https://script.google.com/**', (r) => r.abort());
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(m.text())) errores.push(m.text()); });
  page.on('dialog', (d) => d.accept());

  await caso(`${disp}: carga los tips`, async () => {
    await page.goto(BASE);
    await page.waitForSelector('details.tip');
    // Pruebas tocadas en v02.00: el total pasó a la línea de energía (#cuentaEnergia)
    await page.waitForFunction((n) => document.querySelector('#cuentaEnergia')?.textContent === `${n} tips`, TIPS.length);
    await page.screenshot({ path: `${SALIDA}/${disp}-inicio.png` });
  });

  await caso(`${disp}: no hay desbordamiento horizontal`, async () => {
    const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    assert.ok(sw <= iw + 1, `${sw} > ${iw}`);
  });

  await caso(`${disp}: búsqueda en vivo desde 3 letras`, async () => {
    await page.fill('#q', 'pr');
    await page.waitForTimeout(250);
    assert.match(await page.textContent('#ayudaBusqueda'), /al menos 3 letras/);
    const t0 = Date.now();
    await page.type('#q', 'e');
    await page.waitForSelector('#listaTips mark');
    assert.ok(Date.now() - t0 < 1500, 'tardó demasiado');
    await page.fill('#q', 'neumaticos s07');
    await page.waitForFunction(() => /S07: 39 PSI/.test(document.querySelector('#listaTips details.tip .t')?.textContent || ''), null, { timeout: 3000 });
    await page.screenshot({ path: `${SALIDA}/${disp}-busqueda.png` });
    await page.fill('#q', 'bateira');
    await page.waitForTimeout(300);
    assert.ok(await page.locator('#listaTips details.tip').count() > 0, 'tolera errores');
    await page.click('#limpiar');
  });

  await caso(`${disp}: filtro de modelo`, async () => {
    await page.click('.opciones[data-k="modelo"] button[data-v="S07"]');
    const t = await page.textContent('#listaTips');
    assert.ok(!t.includes('S05: 41 PSI'), 'tip solo S05 visible con filtro S07');
    await page.click('.opciones[data-k="modelo"] button[data-v="all"]');
  });

  await caso(`${disp}: enlace directo a un tip`, async () => {
    const id = TIPS.find((t) => t.id.startsWith('s07-39-psi')).id;
    await page.goto(`${BASE}#tip/${id}`);
    await page.waitForSelector(`#tip-${id}[open]`);
  });

  await caso(`${disp}: directorio`, async () => {
    await page.goto(`${BASE}#directorio`);
    await page.fill('#q', 'morato');
    await page.waitForFunction(() => document.querySelectorAll('#listaDir .contacto').length >= 2);
    await page.screenshot({ path: `${SALIDA}/${disp}-directorio.png` });
  });

  await caso(`${disp}: preguntar sin IA muestra tips locales`, async () => {
    await page.goto(`${BASE}#preguntar`);
    await page.fill('#pregunta', '¿A cuánto inflo las llantas de la S07?');
    await page.click('#formPregunta button[type="submit"]');
    await page.waitForSelector('#respuesta details.tip');
    assert.match(await page.textContent('#respuesta'), /39 PSI/);
  });

  await caso(`${disp}: preguntar con IA (simulada) escapa el HTML y enlaza solo citas válidas`, async () => {
    const id = TIPS.find((t) => t.id.startsWith('s07-39-psi')).id;
    await page.route('https://api.groq.com/**', (r) => {
      if (r.request().url().endsWith('/models')) return r.fulfill({ json: { data: [{ id: 'llama-3.3-70b-versatile' }] } });
      return r.fulfill({ json: { choices: [{ message: { content: `Infla a 39 PSI en frío [${id}] [inventado-123] <img src=x onerror="window.__xss=1">` } }] } });
    });
    await page.evaluate(() => { sessionStorage.setItem('deepal-ia-claves', JSON.stringify({ groq: 'gsk_prueba123456' })); });
    await page.click('#formPregunta button[type="submit"]');
    await page.waitForFunction(() => /Redactado por Groq/.test(document.querySelector('#iaRes')?.textContent || ''));
    assert.equal(await page.locator('#iaRes img').count(), 0);
    assert.equal(await page.evaluate(() => window.__xss), undefined);
    assert.equal(await page.locator(`#iaRes a[href="#tip/${id}"]`).count(), 1);
    assert.ok(!(await page.textContent('#iaRes')).includes('inventado-123'));
    await page.screenshot({ path: `${SALIDA}/${disp}-preguntar.png` });
    await page.evaluate(() => sessionStorage.clear());
  });

  if (disp === 'escritorio') {
    // Pruebas tocadas en v02.03: el panel pide usuario y contraseña y guarda en la hoja (aquí, el simulador del Apps Script)
    await caso('admin: entra, carga el ZIP, anonimiza y guarda un tip en la hoja', async () => {
      const g = nuevoServicio();
      const c2 = await navegador.newContext({ viewport: vp, locale: 'es-CO', timezoneId: 'America/Bogota', acceptDownloads: true });
      await conectar(c2, g);
      const pa = await c2.newPage();
      pa.on('pageerror', (e) => errores.push(e.message));
      await pa.goto(`${BASE}#admin`);
      await pa.fill('#inUsuario', 'admin'); await pa.fill('#inClave', CLAVE_PRUEBA); await pa.click('#btnEntrar');
      await pa.waitForSelector('.cifras', { timeout: 10000 });
      await pa.click('#navPanel [data-sec="copia"]'); await pa.click('#btnImportar');
      await pa.waitForFunction(() => /Listo/.test(document.getElementById('resImportar').textContent), null, { timeout: 15000 });
      await pa.click('#navPanel [data-sec="chat"]');
      await pa.setInputFiles('#archivoChat', new URL('./fixtures/chat-ejemplo.zip', import.meta.url).pathname);
      await pa.waitForSelector('#resumenChat:has-text("mensajes")');
      await pa.fill('#desde', '2026-11-01'); await pa.click('#btnBuscarCand');
      await pa.waitForSelector('.candidato');
      const html = await pa.content();
      for (const p of ['carla@example.com', 'ABC123', '3000000002', 'Ana Prueba']) assert.ok(!html.includes(p), `fuga: ${p}`);
      assert.ok(await pa.locator('#listaVcf tr').count() >= 2, 'contacto vcf nuevo');
      await pa.click('.candidato [data-acc="mano"]');
      await pa.fill('#fTitulo', 'Prueba: calibra en frío a 39 PSI');
      await pa.fill('#fComo', 'Con el carro frío.');
      await pa.click('#formTip button[value="borrador"]');
      await pa.waitForSelector('#editorChat .estado-form.ok', { timeout: 10000 });
      const fila = g.filas('TIPS').find((f) => f.titulo === 'Prueba: calibra en frío a 39 PSI');
      assert.ok(fila && fila.estado === 'borrador' && JSON.parse(fila.datos).cat === 'llantas', 'tip en la hoja como borrador');
      assert.ok(!JSON.stringify(g.filas('TIPS')).includes('Ana Prueba'), 'el chat no llega a la hoja');
      await pa.click('#btnUltimoChat');
      await pa.waitForFunction(() => /Listo/.test(document.getElementById('resUltimoChat').textContent));
      assert.equal(g.props.get('ULTIMO_CHAT'), '2026-11-03'); // fecha local, no UTC
      await pa.click('#navPanel [data-sec="copia"]'); await pa.waitForSelector('#btnDescTips');
      const [descarga] = await Promise.all([pa.waitForEvent('download'), pa.click('#btnDescTips')]);
      const json = JSON.parse(fs.readFileSync(await descarga.path(), 'utf8'));
      assert.equal(json.ultimoChat, '2026-11-03');
      assert.ok(!json.tips.some((t) => t.titulo.startsWith('Prueba:')), 'el borrador no va en la copia pública');
      assert.ok(!JSON.stringify(json).includes('_cat'), 'no exporta campos internos');
      await pa.screenshot({ path: `${SALIDA}/admin.png`, fullPage: false });
      await c2.close();
    });

    await caso('PWA: funciona sin conexión', async () => {
      await page.goto(BASE);
      await page.evaluate(async () => { await navigator.serviceWorker.ready; });
      await page.reload(); await page.waitForSelector('details.tip');
      await ctx.setOffline(true);
      await page.reload();
      await page.waitForSelector('details.tip', { timeout: 8000 });
      assert.ok(await page.isVisible('#avisoSinConexion'));
      await page.fill('#q', 'grua');
      await page.waitForSelector('#listaTips mark');
      await page.screenshot({ path: `${SALIDA}/sin-conexion.png` });
      await ctx.setOffline(false);
    });

    await caso('PWA: manifiesto e íconos', async () => {
      const m = await (await page.request.get(`${BASE}manifest.webmanifest`)).json();
      for (const i of m.icons) assert.equal((await page.request.get(BASE + i.src)).status(), 200, i.src);
      assert.equal(m.display, 'standalone');
    });
  }
  await caso(`${disp}: sin errores en consola`, async () => { assert.deepEqual(errores, []); });
  await ctx.close();
}
await navegador.close();
console.log(fallas ? `\n${fallas} prueba(s) fallaron` : '\nTodas las pruebas de navegador pasaron');
process.exit(fallas ? 1 : 0);
