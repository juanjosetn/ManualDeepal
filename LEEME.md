# Manual práctico Deepal — entrega v02.00.01cl

**Fecha:** 21 de noviembre de 2026 · **Versión anterior:** v02.00.00cl

## Qué cambia
- **Ícono de la app:** el emblema de Deepal en trazo fino con un libro pequeño en ámbar, sobre grafito. Es el que se ve en la pantalla de inicio del celular, al instalar y en la pestaña del navegador.
- Todo lo demás sigue igual.

## Cómo actualizar lo que ya publicaste en GitHub
1. Descomprime el ZIP.
2. En GitHub: **Add file › Upload files**.
3. **Arrastra** (no uses «choose your files») estas carpetas y archivos: las carpetas `icons`, `js`, `docs`, `herramientas` y `tests`, y los archivos sueltos `index.html`, `manifest.webmanifest`, `sw.js`, `package.json`, `LEEME.md`, `README.md` y `VERIFICACION.md`.
4. Antes de confirmar, revisa que en la lista se vean con su carpeta adelante (por ejemplo `icons/icono-app.svg` y `js/version.js`).
5. **Commit changes** con la nota `Versión v02.00.01cl`.
6. Espera 2 o 3 minutos. El pie debe decir **v02.00.01cl**.

**Para ver el ícono nuevo en el celular:** si ya tenías la app instalada, ábrela y toca «Actualizar». Android cambia el ícono de la pantalla de inicio por su cuenta (puede tardar hasta un día). Para verlo de inmediato, desinstala la app (mantén presionado el ícono › Desinstalar) y vuelve a instalarla desde Chrome.

## Inventario (calculado comparando con v02.00.00cl)
**5 creados · 13 modificados · 0 eliminados · 34 sin cambios.**

### Creados
| Archivo | Contenido |
|---|---|
| `herramientas/generar-iconos.mjs` | Genera el ícono SVG y los PNG a partir del logo (`npm run iconos`) |
| `icons/icono-app-maskable.svg` | Versión a sangre para Android |
| `icons/icono-app.svg` | Ícono maestro: emblema de Deepal en trazo fino con un libro pequeño |
| `tests/arbitro-v02-00-01.mjs` | Script árbitro del ícono (21 afirmaciones) |
| `tests/mutaciones-v02-00-01.mjs` | 8 defectos sembrados en el ícono |

### Modificados
| Archivo | Qué cambió |
|---|---|
| `LEEME.md` | Esta entrega |
| `README.md` | Ícono nuevo y generador |
| `VERIFICACION.md` | Decisión 5 resuelta: ícono con el emblema |
| `docs/CHANGELOG.md` | Entrada v02.00.01cl |
| `icons/apple-touch-icon.png` | Ícono nuevo (iPhone) |
| `icons/icon-192.png` | Ícono nuevo |
| `icons/icon-512.png` | Ícono nuevo |
| `icons/maskable-512.png` | Ícono nuevo a sangre (Android) |
| `index.html` | Favicon en SVG |
| `js/version.js` | Versión v02.00.01cl |
| `manifest.webmanifest` | Ícono SVG agregado; colores de tema y arranque en gris claro |
| `package.json` | Comando `npm run iconos` |
| `sw.js` | Guarda el ícono SVG para uso sin conexión |

### Sin cambios
`.gitignore`, `.nojekyll`, `APRENDE.md`, `IAS.md`, `PUBLICAR.md`, `config/ia.json`, `config/sitio.json`, `css/app.css`, `data/catalogos.json`, `data/directorio.json`, `data/tips.json`, `fonts/OFL-Archivo.txt`, `fonts/archivo-latin.woff2`, `icons/logo-deepal.svg`, `js/admin.js`, `js/app.js`, `js/buscador.js`, `js/chat.js`, `js/ia.js`, `js/iconos.js`, `js/tema.js`, `js/texto.js`, `tests/admin.test.mjs`, `tests/arbitro-v01-01.mjs`, `tests/arbitro-v02-00.mjs`, `tests/fixtures/LEEME.md`, `tests/fixtures/chat-ejemplo.txt`, `tests/fixtures/chat-ejemplo.zip`, `tests/fixtures/taller-ejemplo.vcf`, `tests/ia.test.mjs`, `tests/mutaciones-v01-01.mjs`, `tests/mutaciones-v02-00.mjs`, `tests/navegador.mjs`, `tests/unidad.test.mjs`

## Pruebas de esta entrega
| Banco | Resultado |
|---|---|
| Pruebas unitarias (`npm test`) | 27 de 27 |
| Pruebas en navegador (`tests/navegador.mjs`) | 21 de 21 |
| Árbitro v01.01 (versión y logo) | 70 de 70 |
| Árbitro v02.00 (UI/UX y diseño gráfico) | 143 de 143 |
| **Árbitro v02.00.01** (ícono) | **21 de 21** (contra v02.00.00cl: 6 de 21; fallan 15) |
| Mutaciones v02.00.01 | 8 de 8 detectadas |

Los bancos de pruebas se corrieron desde el ZIP descomprimido en una carpeta limpia; las mutaciones, sobre la carpeta de trabajo, idéntica al ZIP.

## Limitaciones honestas
- El emblema es parte de una marca registrada de su titular. El ícono lo usa porque el administrador lo pidió; el nombre «Manual Deepal», el libro y el aviso «no oficial» indican que es un manual de la comunidad. Si la marca lo objetara, basta con cambiar el generador y volver a correr `npm run iconos`.
- Android puede tardar en refrescar el ícono de una app ya instalada.
