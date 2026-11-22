// =====================================================================
// generar-iconos.mjs — Genera el ícono de la app a partir del logo.
// Toma el emblema (la «V») de icons/logo-deepal.svg SIN redibujarlo, lo
// pinta en trazo fino (solo contorno) y le agrega un libro abierto pequeño
// de trazo fino (el mismo dibujo de js/iconos.js)
// y produce:
//   icons/icono-app.svg           ícono maestro (bordes redondeados)
//   icons/icono-app-maskable.svg  versión a sangre para Android (zona segura 80 %)
//   icons/icon-192.png, icon-512.png, maskable-512.png, apple-touch-icon.png
// Uso (en la carpeta del proyecto):  npm i -D sharp  y luego  node herramientas/generar-iconos.mjs
// LECCIÓN: los PNG se GENERAN desde el SVG; nunca se editan a mano.
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logo = fs.readFileSync(path.join(RAIZ, 'icons/logo-deepal.svg'), 'utf8');
const trazos = [...logo.matchAll(/<path class="st0" d="([^"]+)"/g)].map((m) => m[1]);
const EMBLEMA = trazos[trazos.length - 1]; // el último trazo del logo es el emblema
if (!EMBLEMA || !EMBLEMA.startsWith('M28.1,1.6')) throw new Error('No encontré el emblema en icons/logo-deepal.svg');

// Colores del sistema «Cabina»
const FONDO = '#1B2227';   // grafito
const EMBLEMA_COLOR = '#E3E8EA'; // plata
const LIBRO_COLOR = '#E2A54C';   // ámbar de carga
// Trazo fino y parejo: unos 4 px en el ícono de 512 (≈ 1,5 px en el de 192)
const TRAZO_EMBLEMA = 0.7;  // en unidades del logo (×5,8)
const TRAZO_LIBRO = 0.85;   // en unidades del ícono de 24 px (×5)
const LIBRO = 'M12 6.6C10 5 7 4.6 4 5.1v13c3-.5 6-.1 8 1.5 2-1.6 5-2 8-1.5v-13c-3-.5-6-.1-8 1.5Z M12 6.6v13';

function svg({ redondeado, escalaContenido }) {
  const c = escalaContenido; // < 1 deja más margen (versión a sangre)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <title>Manual práctico Deepal</title>
  <rect width="512" height="512" ${redondeado ? 'rx="112"' : ''} fill="${FONDO}"/>
  <g transform="translate(256 256) scale(${c}) translate(-256 -256)">
    <g transform="translate(167 92) scale(5.8)"><path d="${EMBLEMA}" fill="none" stroke="${EMBLEMA_COLOR}" stroke-width="${TRAZO_EMBLEMA}" stroke-linejoin="round"/></g>
    <g transform="translate(196 328) scale(5)" fill="none" stroke="${LIBRO_COLOR}" stroke-width="${TRAZO_LIBRO}" stroke-linecap="round" stroke-linejoin="round"><path d="${LIBRO}"/></g>
  </g>
</svg>
`;
}
const maestro = svg({ redondeado: true, escalaContenido: 1 });
const sangre = svg({ redondeado: false, escalaContenido: 0.86 });
fs.writeFileSync(path.join(RAIZ, 'icons/icono-app.svg'), maestro);
fs.writeFileSync(path.join(RAIZ, 'icons/icono-app-maskable.svg'), sangre);

const { default: sharp } = await import('sharp');
const png = (texto, tam, archivo) => sharp(Buffer.from(texto), { density: 72 * (tam / 512) * 2 }).resize(tam, tam).png({ compressionLevel: 9 }).toFile(path.join(RAIZ, 'icons', archivo));
await png(maestro, 192, 'icon-192.png');
await png(maestro, 512, 'icon-512.png');
await png(sangre, 512, 'maskable-512.png');
await png(sangre, 180, 'apple-touch-icon.png'); // iPhone recorta las esquinas solo
console.log('Íconos generados en icons/');
