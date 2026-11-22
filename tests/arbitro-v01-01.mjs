// =====================================================================
// Script árbitro de la versión v01.01 — versionado único y logo.
// Debe FALLAR contra v01.00.00cl y PASAR contra v01.01.00cl.
// Uso: servidor en la carpeta de la versión y luego
//      BASE=http://localhost:8080/ node tests/arbitro-v01-01.mjs
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE || 'http://localhost:8080/';
const SALIDA = process.env.CAPTURAS || '/tmp/capturas-arbitro';
fs.mkdirSync(SALIDA, { recursive: true });
const RE_VERSION = /v\d{2}\.\d{2}\.\d{2}cl/g;
const HASH_LOGO = 'a05495a04cc676e9dcb8a6ba76e634447b97553d7ea1bbce471c54791e4cd4ba'; // logo entregado por el administrador
let fallas = 0, total = 0;
function caso(nombre, ok, detalle = '') { total++; if (ok) console.log('✔', nombre); else { fallas++; console.log('✘', nombre, detalle ? `\n    ${detalle}` : ''); } }
const leer = (r) => { try { return fs.readFileSync(path.join(RAIZ, r), 'utf8'); } catch { return null; } };
function archivos(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...archivos(p)); else out.push(path.relative(RAIZ, p));
  }
  return out;
}

// ---------- A. Revisión estática ----------
const vjs = leer('js/version.js') || '';
const VERSION = (vjs.match(/APP_VERSION\s*=\s*'([^']+)'/) || [])[1];
caso('js/version.js define APP_VERSION con formato vXX.YY.ZZcl', !!VERSION && /^v\d{2}\.\d{2}\.\d{2}cl$/.test(VERSION), `encontrado: ${VERSION}`);
const fuera = archivos(RAIZ).filter((f) => !['docs/CHANGELOG.md', 'LEEME.md', 'js/version.js'].includes(f) && /\.(js|mjs|html|json|md|css|webmanifest)$/.test(f) && !f.startsWith('tests/')
  // Desde v02.02: cada guía de guias/ es un producto aparte con su propia versión (y su generador en herramientas/guia-iva)
  && !f.startsWith('guias/') && !f.startsWith('herramientas/guia-iva/'))
  .filter((f) => RE_VERSION.test(leer(f) || '') && (RE_VERSION.lastIndex = 0, true));
caso('ninguna otra cadena de versión fuera de version.js, CHANGELOG y LEEME', fuera.length === 0, fuera.join(', '));
const sw = leer('sw.js') || '';
caso('sw.js toma la versión de js/version.js (importScripts) y no la quema', /importScripts\(['"]js\/version\.js['"]\)/.test(sw) && !/const VERSION = '/.test(sw));
const appjs = leer('js/app.js') || '';
caso('la app registra sw.js?v=VERSION sin caché HTTP (todos los navegadores ven la versión nueva)', /register\(`sw\.js\?v=\$\{encodeURIComponent\(VERSION\)\}`, \{ updateViaCache: 'none' \}\)/.test(appjs));
caso('la copia sin conexión pide archivos frescos al instalar (cache: reload)', /new Request\(\w+, \{ cache: 'reload' \}\)/.test(sw));
caso('sw.js guarda version.js y el logo para uso sin conexión', sw.includes("'js/version.js'") && sw.includes("'icons/logo-deepal.svg'"));
const logo = fs.existsSync(path.join(RAIZ, 'icons/logo-deepal.svg')) ? fs.readFileSync(path.join(RAIZ, 'icons/logo-deepal.svg')) : null;
caso('el logo es exactamente el archivo entregado', !!logo && crypto.createHash('sha256').update(logo).digest('hex') === HASH_LOGO);
caso('el logo no trae scripts ni enlaces externos', !!logo && !/<script|on\w+=|href=["']https?:/i.test(logo.toString()));
let sitio = {}; try { sitio = JSON.parse(leer('config/sitio.json')); } catch { /* */ }
caso('config/sitio.json apunta al logo y el archivo existe', !!sitio.logo?.archivo && fs.existsSync(path.join(RAIZ, sitio.logo.archivo)));
caso('el aviso aclara que el sitio no es oficial', /no oficial|no es información oficial/i.test(JSON.stringify(sitio)));
const cl = leer('docs/CHANGELOG.md') || '';
caso('docs/CHANGELOG.md empieza por la versión vigente', !!VERSION && (cl.match(RE_VERSION) || [])[0] === VERSION);
caso('LEEME.md menciona la versión vigente', !!VERSION && (leer('LEEME.md') || '').includes(VERSION));
// Pruebas tocadas en v02.00: desde v02 version.js va en el <head>; basta con que cargue antes de app.js
const html = leer('index.html') || '';
caso('index.html carga version.js antes de app.js', html.includes('<script src="js/version.js"></script>') && html.indexOf('<script src="js/version.js">') < html.indexOf('<script type="module" src="js/app.js">'));
caso('créditos a Alejandro Urreta intactos', /Alejandro Urreta/.test(JSON.stringify(sitio)) && /Alejandro Urreta/.test(leer('README.md') || ''));

// ---------- B. En el navegador ----------
let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.log('(sin Playwright: se omiten las pruebas de navegador)'); }
if (chromium) {
  const nav = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  for (const esquema of ['light', 'dark']) {
    for (const ancho of [390, 820, 1024, 1280, 1440]) {
      const ctx = await nav.newContext({ viewport: { width: ancho, height: 860 }, colorScheme: esquema });
      const p = await ctx.newPage();
      // Pruebas tocadas en v02.00: el oscuro ya no sigue al sistema; se elige con el botón (se guarda en deepal-tema)
      if (esquema === 'dark') await p.addInitScript(() => { try { localStorage.setItem('deepal-tema', 'oscuro'); } catch { /* */ } });
      const errores = []; p.on('pageerror', (e) => errores.push(e.message));
      await p.goto(BASE); await p.waitForSelector('details.tip', { timeout: 10000 }).catch(() => {});
      const r = await p.evaluate(() => {
        const img = document.querySelector('.cabecera img.logo');
        const tit = document.getElementById('tituloSitio')?.getBoundingClientRect();
        const b = img?.getBoundingClientRect();
        const solapa = b && tit ? !(b.right <= tit.left || tit.right <= b.left || b.bottom <= tit.top || tit.bottom <= b.top) : true;
        return {
          hay: !!img, cargo: !!img && img.complete && img.naturalWidth > 0, alt: img?.alt, alto: b?.height, derecha: b?.right,
          solapa, desborde: document.documentElement.scrollWidth > innerWidth + 1,
          version: document.getElementById('versionApp')?.textContent || '', global: globalThis.APP_VERSION,
          filtro: img ? getComputedStyle(img).filter : '',
          avisoCompleto: (() => { const sm = document.getElementById('subtituloSitio'); return !!sm && /no oficial/.test(sm.textContent) && sm.scrollWidth <= sm.clientWidth + 1 && sm.getBoundingClientRect().right <= innerWidth; })(),
        };
      });
      const n = `${esquema === 'dark' ? 'oscuro' : 'claro'} ${ancho}px`;
      caso(`${n}: logo visible, cargado y con texto alternativo`, r.hay && r.cargo && r.alt === 'Deepal', JSON.stringify(r));
      caso(`${n}: logo de 18 a 40 px de alto, sin solaparse con el título ni desbordar`, r.alto >= 18 && r.alto <= 40 && !r.solapa && !r.desborde && r.derecha <= ancho, JSON.stringify(r));
      caso(`${n}: «no oficial» se lee completo junto al logo`, r.avisoCompleto);
      if (esquema === 'dark') caso(`${n}: el logo se aclara en modo oscuro`, /brightness/.test(r.filtro), r.filtro);
      caso(`${n}: el pie muestra la versión vigente`, !!VERSION && r.version === VERSION && r.global === VERSION, `${r.version} / ${r.global}`);
      caso(`${n}: sin errores de JavaScript`, errores.length === 0, errores.join(' | '));
      await p.screenshot({ path: `${SALIDA}/${esquema}-${ancho}.png` });
      if (esquema === 'light' && ancho === 1280) {
        const caches = await p.evaluate(async () => { await navigator.serviceWorker.ready; await new Promise((ok) => setTimeout(ok, 500)); return caches.keys(); }).catch(() => []);
        caso('la copia sin conexión lleva el nombre de la versión', !!VERSION && caches.includes(`deepal-app-${VERSION}`), caches.join(', '));
      }
      await ctx.close();
    }
  }
  await nav.close();
}
console.log(`\n${total - fallas}/${total} afirmaciones pasaron`);
process.exit(fallas ? 1 : 0);
