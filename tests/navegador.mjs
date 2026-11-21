// Prueba de punta a punta en un navegador real (Chrome) con Playwright.
// Requiere: npm i -D playwright  y  npx playwright install chromium
// Ejecuta:  python3 -m http.server 8080  (en otra terminal)  y luego  node tests/navegador.mjs
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

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
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(m.text())) errores.push(m.text()); });
  page.on('dialog', (d) => d.accept());

  await caso(`${disp}: carga los tips`, async () => {
    await page.goto(BASE);
    await page.waitForSelector('details.tip');
    assert.match(await page.textContent('#estadoTips'), new RegExp(`${TIPS.length} tips`));
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
    await caso('admin: carga el ZIP, anonimiza y crea un tip', async () => {
      await page.goto(`${BASE}#admin`);
      await page.waitForSelector('#archivoChat');
      await page.setInputFiles('#archivoChat', new URL('./fixtures/chat-ejemplo.zip', import.meta.url).pathname);
      await page.waitForSelector('#resumenChat:has-text("mensajes")');
      await page.fill('#desde', '2026-11-01'); await page.click('#btnBuscarCand');
      await page.waitForSelector('.candidato');
      const html = await page.content();
      for (const p of ['carla@example.com', 'ABC123', '3000000002', 'Ana Prueba']) assert.ok(!html.includes(p), `fuga: ${p}`);
      assert.ok(await page.locator('#listaVcf tr').count() >= 2, 'contacto vcf nuevo');
      await page.click('.candidato [data-acc="mano"]');
      await page.fill('#fTitulo', 'Prueba: calibra en frío a 39 PSI');
      await page.fill('#fComo', 'Con el carro frío.');
      await page.click('#formTip button[type="submit"]');
      await page.waitForSelector('#borradores li:has-text("Prueba: calibra")');
      const [descarga] = await Promise.all([page.waitForEvent('download'), page.click('#btnDescTips')]);
      const json = JSON.parse(fs.readFileSync(await descarga.path(), 'utf8'));
      assert.ok(json.tips.some((t) => t.titulo === 'Prueba: calibra en frío a 39 PSI' && t.cat === 'llantas'));
      assert.equal(json.ultimoChat, '2026-11-03'); // fecha local, no UTC
      assert.ok(!JSON.stringify(json).includes('_cat'), 'no exporta campos internos');
      await page.screenshot({ path: `${SALIDA}/admin.png`, fullPage: false });
      globalThis.__ok = 1;
      await page.evaluate(() => { globalThis.__confirmar = () => true; });
      await page.click('#btnVaciar');
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
