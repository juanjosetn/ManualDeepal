// =====================================================================
// Script árbitro de la versión v02.00 — rediseño «Cabina».
// Árbitros: UI/UX (organización, toque, movimiento, contraste) y
// diseño gráfico (íconos de trazo fino, tipografía propia, sin emojis,
// tema claro por defecto y oscuro opcional, créditos).
// Debe FALLAR contra v01.01.00cl y PASAR contra v02.00.00cl.
// Uso: servidor en la carpeta de la versión y BASE=http://localhost:8080/ node tests/arbitro-v02-00.mjs
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE || 'http://localhost:8080/';
const SALIDA = process.env.CAPTURAS || '/tmp/capturas-v02';
fs.mkdirSync(SALIDA, { recursive: true });
let fallas = 0, total = 0;
function caso(nombre, ok, detalle = '') { total++; if (ok) console.log('✔', nombre); else { fallas++; console.log('✘', nombre, detalle ? `\n    ${String(detalle).slice(0, 300)}` : ''); } }
const leer = (r) => { try { return fs.readFileSync(path.join(RAIZ, r), 'utf8'); } catch { return ''; } };
const EMOJI = /\p{Extended_Pictographic}/u;

// ---------- A. Revisión estática ----------
const ico = leer('js/iconos.js');
const trazo = +((ico.match(/export const TRAZO = ([\d.]+)/) || [])[1] || 0);
caso('íconos SVG propios con trazo fino (≤ 1,5 px)', trazo > 0 && trazo <= 1.5, `TRAZO=${trazo}`);
let cat = {}; try { cat = JSON.parse(leer('data/catalogos.json')); } catch { /* */ }
const nombres = [...ico.matchAll(/^\s{2}([a-z]+): '/gm)].map((m) => m[1]);
caso('cada categoría usa un ícono del set (no emojis)', (cat.categorias || []).length > 0 && cat.categorias.every((c) => nombres.includes(c.icono) && !EMOJI.test(c.icono)), (cat.categorias || []).map((c) => c.icono).join(','));
const sinEmoji = ['index.html', 'js/app.js', 'js/admin.js', 'css/app.css', 'data/catalogos.json'].filter((f) => EMOJI.test(leer(f).replace(/\/\/.*$/gm, '')));
caso('sin emojis en la interfaz (HTML, JS, CSS, catálogo)', sinEmoji.length === 0, sinEmoji.join(', '));
const css = leer('css/app.css');
caso('tipografía propia alojada en la app (funciona sin internet)', /@font-face[\s\S]*url\("\.\.\/fonts\/archivo-latin\.woff2"\)/.test(css) && fs.existsSync(path.join(RAIZ, 'fonts/archivo-latin.woff2')) && !/fonts\.googleapis/.test(leer('index.html')));
caso('licencia OFL de la fuente incluida', /SIL Open Font License/.test(leer('fonts/OFL-Archivo.txt')));
caso('tema claro por defecto (tema.js)', /var tema = 'claro'/.test(leer('js/tema.js')));
caso('respeta «reducir movimiento»', /prefers-reduced-motion: reduce/.test(css));
let sitio = {}; try { sitio = JSON.parse(leer('config/sitio.json')); } catch { /* */ }
const cred = JSON.stringify(sitio.creditos || []);
caso('créditos: Alejandro Urreta, Miguel Rodríguez, Miguel Vargas y El profe Juan Tapia con www.impulso.click',
  ['Alejandro Urreta', 'Miguel Rodríguez', 'Miguel Vargas', 'El profe Juan Tapia', 'ProEduLab', 'https://www.impulso.click'].every((x) => cred.includes(x)), cred);
const sw = leer('sw.js');
caso('la copia sin conexión incluye íconos, tema y fuente', ['js/iconos.js', 'js/tema.js', 'fonts/archivo-latin.woff2'].every((x) => sw.includes(`'${x}'`)));

// ---------- B. En el navegador ----------
const lum = (hex) => { const c = hex.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.log('(sin Playwright: se omiten las pruebas de navegador)'); }
if (chromium) {
  const nav = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});

  // B1. Tema: claro por defecto, botón cambia a oscuro y se recuerda
  {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
    const p = await ctx.newPage();
    await p.goto(BASE); await p.waitForSelector('details.tip', { timeout: 10000 }).catch(() => {});
    caso('arranca en tema claro aunque el celular esté en oscuro', await p.evaluate(() => document.documentElement.dataset.tema) === 'claro');
    const hay = await p.$('#btnTema');
    if (hay) { await p.click('#btnTema'); await p.waitForTimeout(500); }
    caso('el botón de tema cambia a oscuro y lo anuncia', await p.evaluate(() => document.documentElement.dataset.tema === 'oscuro' && document.getElementById('btnTema')?.getAttribute('aria-pressed') === 'true'));
    await p.reload(); await p.waitForTimeout(500);
    caso('la elección de tema se recuerda', await p.evaluate(() => document.documentElement.dataset.tema) === 'oscuro');
    await ctx.close();
  }

  for (const tema of ['claro', 'oscuro']) {
    for (const ancho of [390, 820, 1024, 1280, 1440]) {
      const ctx = await nav.newContext({ viewport: { width: ancho, height: 900 } });
      const p = await ctx.newPage();
      const errores = []; p.on('pageerror', (e) => errores.push(e.message));
      if (tema === 'oscuro') await p.addInitScript(() => { try { localStorage.setItem('deepal-tema', 'oscuro'); } catch { /* */ } });
      await p.goto(BASE); await p.waitForSelector('details.tip', { timeout: 10000 }).catch(() => {});
      await p.waitForTimeout(1300);
      const n = `${tema} ${ancho}px`;
      const r = await p.evaluate(() => {
        const v = (k) => getComputedStyle(document.documentElement).getPropertyValue(k).trim();
        const visible = (el) => { if (!el) return false; const b = el.getBoundingClientRect(); const s = getComputedStyle(el); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
        const alto = (sel) => [...document.querySelectorAll(sel)].filter(visible).map((el) => Math.round(el.getBoundingClientRect().height));
        const icos = [...document.querySelectorAll('svg.ico')];
        const textoUI = ['.cabecera', '.zona-filtros', '#riel', '.tablero', '.pestanas'].map((s) => document.querySelector(s)?.innerText || '').join(' ');
        const h1 = document.querySelector('#tituloPortada');
        return {
          colores: { niebla: v('--niebla'), lamina: v('--lamina'), grafito: v('--grafito'), titanio: v('--titanio'), ambar: v('--ambar') },
          fuente: document.fonts.check('16px Archivo'), familia: getComputedStyle(document.body).fontFamily, ancho: h1 ? getComputedStyle(h1).fontStretch : '',
          trazos: [...new Set(icos.map((s) => s.getAttribute('stroke-width')))], nIcos: icos.length,
          emoji: /\p{Extended_Pictographic}/u.test(textoUI),
          toquePrincipal: [...alto('.pestanas a'), ...alto('.boton-icono'), ...alto('.tablero button')],
          toqueSecundario: [...alto('.chip'), ...alto('.opciones button'), ...alto('.riel button'), ...alto('details.tip > summary')],
          desborde: document.documentElement.scrollWidth > innerWidth + 1,
          riel: visible(document.getElementById('riel')) ? document.querySelectorAll('#riel button').length : 0,
          tablero: document.querySelector('.tablero') && visible(document.querySelector('.tablero')) ? document.querySelectorAll('.tablero button').length : 0,
          chips: visible(document.getElementById('chipsCategorias')),
          energia: document.getElementById('lineaEnergia')?.getBoundingClientRect().width || 0,
          pista: document.querySelector('.pista')?.getBoundingClientRect().width || 1,
          cuenta: document.getElementById('cuentaEnergia')?.textContent || '',
        };
      });
      const c = r.colores;
      const okHex = Object.values(c).every((x) => /^#[0-9a-f]{6}$/i.test(x));
      caso(`${n}: contraste AA del texto (principal ≥ 7, secundario ≥ 4,5 sobre fondo y superficie, acento ≥ 4,5)`,
        okHex && contraste(c.grafito, c.niebla) >= 7 && contraste(c.titanio, c.niebla) >= 4.5 && contraste(c.titanio, c.lamina) >= 4.5 && contraste(c.ambar, c.lamina) >= 4.5 && contraste(c.ambar, c.niebla) >= 4.5,
        okHex ? `grafito ${contraste(c.grafito, c.niebla).toFixed(2)}, titanio ${contraste(c.titanio, c.niebla).toFixed(2)}/${contraste(c.titanio, c.lamina).toFixed(2)}, ámbar ${contraste(c.ambar, c.lamina).toFixed(2)}/${contraste(c.ambar, c.niebla).toFixed(2)}` : JSON.stringify(c));
      caso(`${n}: fuente Archivo cargada y titular en su versión ancha`, r.fuente && /Archivo/.test(r.familia) && /125%|expanded/.test(r.ancho), `${r.fuente} ${r.familia} ${r.ancho}`);
      caso(`${n}: todos los íconos con el mismo trazo fino`, r.nIcos >= 15 && r.trazos.length === 1 && +r.trazos[0] <= 1.5, `${r.nIcos} íconos, trazos ${r.trazos}`);
      caso(`${n}: sin emojis en cabecera, filtros y navegación`, !r.emoji);
      caso(`${n}: áreas de toque principales ≥ 44 px y secundarias ≥ 36 px`, r.toquePrincipal.length > 0 && r.toquePrincipal.every((h) => h >= 44) && r.toqueSecundario.every((h) => h >= 36), `${r.toquePrincipal} / ${r.toqueSecundario}`);
      caso(`${n}: sin desbordamiento horizontal`, !r.desborde);
      if (ancho >= 1080) caso(`${n}: riel lateral con las categorías`, r.riel >= 10, r.riel);
      else caso(`${n}: tablero de categorías con íconos en la portada, sin duplicar las pestañas`, r.tablero >= 10 && !r.chips, `${r.tablero} ${r.chips}`);
      caso(`${n}: línea de energía cargada al total`, r.energia / r.pista > 0.95 && /108 tips/.test(r.cuenta), `${r.energia}/${r.pista} ${r.cuenta}`);
      // Búsqueda: el titular se recoge y la línea refleja los resultados
      await p.fill('#q', 'bajada'); await p.waitForTimeout(1300);
      const s = await p.evaluate(() => ({
        portada: document.getElementById('portada')?.getBoundingClientRect().height ?? 999,
        energia: document.getElementById('lineaEnergia')?.getBoundingClientRect().width || 0,
        pista: document.querySelector('.pista')?.getBoundingClientRect().width || 1,
        cuenta: document.getElementById('cuentaEnergia')?.textContent || '',
      }));
      caso(`${n}: al buscar, el titular se recoge y la línea muestra «N de 108»`, s.portada < 24 && /^\d+ de 108$/.test(s.cuenta) && s.energia / s.pista < 0.3, JSON.stringify(s));
      await p.screenshot({ path: `${SALIDA}/${tema}-${ancho}-busqueda.png` });
      // Directorio en computador: el contenido usa todo el ancho
      await p.goto(`${BASE}#directorio`); await p.waitForTimeout(700);
      const anchoMain = await p.evaluate(() => document.getElementById('contenido').getBoundingClientRect().width);
      caso(`${n}: el directorio usa el ancho disponible`, anchoMain > Math.min(ancho - 60, 700), anchoMain);
      // Créditos
      await p.goto(BASE); await p.waitForTimeout(500);
      const btn = await p.$('#btnCreditos');
      if (btn) { await btn.click(); await p.waitForTimeout(450); }
      const d = await p.evaluate(() => { const dl = document.getElementById('dlgCreditos'); return { abierto: !!dl?.open, texto: dl?.innerText || '', enlace: !!dl?.querySelector('a[href="https://www.impulso.click"][rel~="noopener"]') }; });
      caso(`${n}: el botón pequeño abre los créditos completos`, d.abierto && ['Alejandro Urreta', 'Miguel Rodríguez', 'Miguel Vargas', 'El profe Juan Tapia'].every((x) => d.texto.includes(x)) && d.enlace, d.texto.slice(0, 120));
      if (ancho === 1280) await p.screenshot({ path: `${SALIDA}/${tema}-creditos.png` });
      if (d.abierto) { await p.keyboard.press('Escape'); await p.waitForTimeout(200); }
      caso(`${n}: Escape cierra los créditos`, !(await p.evaluate(() => !!document.getElementById('dlgCreditos')?.open)));
      caso(`${n}: sin errores de JavaScript`, errores.length === 0, errores.join(' | '));
      await ctx.close();
    }
  }

  // B2. Movimiento reducido: sin animaciones
  {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE); await p.waitForSelector('details.tip', { timeout: 10000 }).catch(() => {});
    const dur = await p.evaluate(() => getComputedStyle(document.getElementById('lineaEnergia') || document.body).transitionDuration);
    caso('con «reducir movimiento» no hay transiciones', /^0s/.test(dur), dur);
    await ctx.close();
  }
  await nav.close();
}
console.log(`\n${total - fallas}/${total} afirmaciones pasaron`);
process.exit(fallas ? 1 : 0);
