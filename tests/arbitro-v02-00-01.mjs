// =====================================================================
// Script árbitro de la versión v02.00.01 — ícono de la app.
// Pedido: «el logo de Deepal con un pequeño libro, en SVG de trazo fino».
// Debe FALLAR contra v02.00.00cl y PASAR contra v02.00.01cl.
// Uso: servidor en la carpeta y BASE=http://localhost:8080/ node tests/arbitro-v02-00-01.mjs
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE || 'http://localhost:8080/';
let fallas = 0, total = 0;
function caso(nombre, ok, detalle = '') { total++; if (ok) console.log('✔', nombre); else { fallas++; console.log('✘', nombre, detalle ? `\n    ${String(detalle).slice(0, 300)}` : ''); } }
const leer = (r) => { try { return fs.readFileSync(path.join(RAIZ, r), 'utf8'); } catch { return ''; } };
const dims = (r) => { try { const b = fs.readFileSync(path.join(RAIZ, r)); return [b.readUInt32BE(16), b.readUInt32BE(20)]; } catch { return [0, 0]; } };

// ---------- A. Revisión estática ----------
const logo = leer('icons/logo-deepal.svg');
const emblema = [...logo.matchAll(/<path class="st0" d="([^"]+)"/g)].map((m) => m[1]).pop() || 'x';
const ico = leer('icons/icono-app.svg');
caso('existe el ícono maestro en SVG', ico.startsWith('<svg'));
caso('usa el emblema del logo entregado, sin redibujarlo', ico.includes(`d="${emblema}"`));
const trazoEmblema = +((ico.match(new RegExp(`d="${emblema.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" fill="none" stroke="[^"]+" stroke-width="([\\d.]+)"`)) || [])[1] || 0);
caso('el emblema va en trazo fino (solo contorno, trazo ≤ 1 unidad)', trazoEmblema > 0 && trazoEmblema <= 1, `trazo ${trazoEmblema}`);
const libro = ico.match(/stroke-width="([\d.]+)"[^>]*><path d="M12 6\.6C10 5 7 4\.6 4 5\.1v13/);
caso('incluye el libro de trazo fino (mismo dibujo del set de íconos)', !!libro && +libro[1] <= 1.2, libro?.[1]);
const libroEscala = +((ico.match(/translate\([\d.]+ [\d.]+\) scale\(([\d.]+)\)" fill="none" stroke="[^"]+" stroke-width="[\d.]+"[^>]*><path d="M12 6\.6/) || [])[1] || 99);
caso('el libro es pequeño frente al emblema (≤ 60 % de su ancho)', libroEscala * 16 <= 0.6 * 5.8 * 30.7, `libro ${libroEscala * 16}px, emblema ${(5.8 * 30.7).toFixed(0)}px`);
caso('el ícono no trae scripts ni enlaces', ico.length > 0 && !/<script|on\w+=|href=/i.test(ico));
caso('versión a sangre para Android (maskable) en SVG', /<rect width="512" height="512"\s+fill=/.test(leer('icons/icono-app-maskable.svg')));
for (const [f, t] of [['icons/icon-192.png', 192], ['icons/icon-512.png', 512], ['icons/maskable-512.png', 512], ['icons/apple-touch-icon.png', 180]]) {
  const [w, h] = dims(f);
  caso(`${f} mide ${t}×${t}`, w === t && h === t, `${w}×${h}`);
}
let man = {}; try { man = JSON.parse(leer('manifest.webmanifest')); } catch { /* */ }
caso('el manifiesto ofrece el ícono SVG, los PNG y el maskable', ['icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/icono-app.svg'].every((s) => (man.icons || []).some((i) => i.src === s)) && (man.icons || []).some((i) => i.purpose === 'maskable'));
caso('colores del manifiesto alineados con el tema claro (sin el verde azulado viejo)', man.theme_color === '#ECEFF0' && man.background_color === '#ECEFF0', `${man.theme_color} ${man.background_color}`);
caso('favicon en SVG en index.html', leer('index.html').includes('<link rel="icon" href="icons/icono-app.svg" type="image/svg+xml">'));
caso('la copia sin conexión guarda el ícono SVG', leer('sw.js').includes("'icons/icono-app.svg'"));
caso('hay un generador de íconos (los PNG no se hacen a mano)', /sharp/.test(leer('herramientas/generar-iconos.mjs')));

// ---------- B. Píxeles (navegador) ----------
let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.log('(sin Playwright: se omiten las pruebas de píxeles)'); }
if (chromium) {
  const nav = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const p = await nav.newPage();
  await p.goto(BASE);
  const r = await p.evaluate(async () => {
    const cargar = (src) => new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });
    const pix = async (src) => { const i = await cargar(src); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); return { w: i.width, d: x.getImageData(0, 0, i.width, i.height).data }; };
    const out = {};
    try {
      const a = await pix('icons/icon-512.png');
      out.esquinaTransparente = a.d[3] === 0;
      let claros = 0, ambar = 0;
      for (let k = 0; k < a.d.length; k += 4) { const [r, g, b, al] = [a.d[k], a.d[k + 1], a.d[k + 2], a.d[k + 3]]; if (al > 200 && r > 200 && g > 200 && b > 200) claros++; if (al > 200 && r > 190 && g > 130 && g < 190 && b < 110) ambar++; }
      out.claros = claros; out.ambar = ambar;
      const m = await pix('icons/maskable-512.png');
      let fuera = 0;
      for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
        const k = (y * 512 + x) * 4; const dist = Math.hypot(x - 256, y - 256);
        const fondo = Math.abs(m.d[k] - 0x1B) < 12 && Math.abs(m.d[k + 1] - 0x22) < 12 && Math.abs(m.d[k + 2] - 0x27) < 12;
        if (dist > 204.8 && !fondo) fuera++;
      }
      out.fueraZonaSegura = fuera; out.maskableOpaca = m.d[3] === 255;
    } catch (e) { out.error = String(e); }
    out.favicon = [...document.querySelectorAll('link[rel="icon"]')].map((l) => l.getAttribute('href'));
    return out;
  });
  caso('ícono con esquinas redondeadas (transparentes)', r.esquinaTransparente === true, JSON.stringify(r));
  caso('emblema plateado de trazo fino: presente pero liviano (menos del 8 % de los píxeles)', r.claros > 800 && r.claros < 0.08 * 512 * 512, r.claros);
  caso('libro en ámbar presente', r.ambar > 150, r.ambar);
  caso('maskable: fondo a sangre y todo el dibujo dentro de la zona segura (círculo del 80 %)', r.maskableOpaca && r.fueraZonaSegura === 0, `${r.maskableOpaca} ${r.fueraZonaSegura}`);
  caso('la página declara el favicon SVG', (r.favicon || []).includes('icons/icono-app.svg'), r.favicon);
  await nav.close();
}
console.log(`\n${total - fallas}/${total} afirmaciones pasaron`);
process.exit(fallas ? 1 : 0);
