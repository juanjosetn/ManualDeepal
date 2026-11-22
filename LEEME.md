# Manual práctico Deepal — entrega v02.01.01cl

**Fecha:** 22 de noviembre de 2026 · **Versión anterior:** v02.01.00cl

## Qué cambia
- **Las calificaciones de 1 estrella no cuentan.** Se reciben y quedan en la hoja de Google para que las leas, pero no entran al promedio, al orden de «los mejores arriba» ni a «Calificación baja», y su texto no se publica.
- En el panel `#admin` (paso 6), esas opiniones dicen «no cuenta ni se publica» y solo tienen el botón **Archivar**.
- Al calificar, todos ven el mismo mensaje: «¡Gracias! Recibimos tu calificación.»
- Lo demás de v02.01.00cl sigue igual: directorio por ciudad y servicio, estrellas, «Quiero aparecer» y moderación.

**Para decidir:** como 2 estrellas es ahora la calificación más baja que cuenta, con `"umbralBajo": 2` un negocio solo baja si todas sus calificaciones que cuentan son de 2. Si quieres que también bajen los que tienen, por ejemplo, 2, 2 y 3, cambia en `config/sitio.json` `"umbralBajo": 2` por `"umbralBajo": 2.5` (con punto).

## Cómo actualizar lo que ya publicaste en GitHub
**Si todavía no habías subido la v02.01.00cl**, sube todo lo de esta: arrastra las carpetas `apps-script`, `config`, `css`, `data`, `docs`, `js` y `tests`, y los archivos `index.html`, `sw.js`, `package.json`, `COMUNIDAD.md`, `LEEME.md`, `README.md`, `APRENDE.md`, `PUBLICAR.md` y `VERIFICACION.md`.

**Si ya habías subido la v02.01.00cl**, basta con:
1. En GitHub: **Add file › Upload files**.
2. **Arrastra** las carpetas `apps-script`, `docs`, `js` y `tests`, y los archivos `package.json`, `APRENDE.md`, `COMUNIDAD.md`, `LEEME.md` y `VERIFICACION.md`.
3. **Commit changes** con la nota `Versión v02.01.01cl`. A los 2 o 3 minutos, el pie debe decir **v02.01.01cl**.

**En Google (solo si ya habías encendido las estrellas con COMUNIDAD.md):** pega el `apps-script/Codigo.gs` nuevo en el editor de Apps Script, guarda, y ve a **Implementar › Gestionar implementaciones** › lápiz › Versión: **Nueva versión** › **Implementar**. La dirección `/exec` no cambia. Si aún no lo has encendido, no hagas nada: cuando sigas COMUNIDAD.md ya usarás este código.

## Inventario (calculado comparando con v02.01.00cl)
**2 creados · 12 modificados · 0 eliminados · 49 sin cambios.**

### Creados
| Archivo | Qué es |
|---|---|
| `tests/arbitro-v02-01-01.mjs` | Script árbitro de esta versión (17 afirmaciones) |
| `tests/mutaciones-v02-01-01.mjs` | 5 defectos sembrados para comprobar que el árbitro los detecta |

### Modificados
| Archivo | Qué cambió |
|---|---|
| `apps-script/Codigo.gs` | Regla `ESTRELLAS_MINIMAS_QUE_CUENTAN = 2`: las de 1 estrella no entran al resumen ni se pueden publicar; el panel recibe la marca «cuenta». Servicio 1.1.0 |
| `js/admin.js` | Opinión de 1 estrella: «no cuenta ni se publica» y solo «Archivar» |
| `js/app.js` | Mensaje al calificar igual para todos |
| `js/version.js`, `package.json` | Versión v02.01.01cl |
| `tests/gas.test.mjs` | Prueba nueva de la regla; la de «Revisar calificaciones» usa 2 y 3 estrellas |
| `tests/arbitro-v02-01.mjs` | La «calificación baja» se siembra con 2 estrellas (antes con 1, que ya no cuenta) |
| `COMUNIDAD.md`, `APRENDE.md` | La regla explicada |
| `docs/CHANGELOG.md`, `LEEME.md`, `VERIFICACION.md` | Documentación de la versión (VERIFICACION §8) |

### Sin cambios
`.gitignore`, `.nojekyll`, `IAS.md`, `PUBLICAR.md`, `README.md`, `apps-script/appsscript.json`, `config/ia.json`, `config/sitio.json`, `css/app.css`, `data/catalogos.json`, `data/directorio.json`, `data/tips.json`, `fonts/OFL-Archivo.txt`, `fonts/archivo-latin.woff2`, `herramientas/generar-iconos.mjs`, `icons/apple-touch-icon.png`, `icons/icon-192.png`, `icons/icon-512.png`, `icons/icono-app-maskable.svg`, `icons/icono-app.svg`, `icons/logo-deepal.svg`, `icons/maskable-512.png`, `index.html`, `js/buscador.js`, `js/chat.js`, `js/comunidad.js`, `js/ia.js`, `js/iconos.js`, `js/tema.js`, `js/texto.js`, `manifest.webmanifest`, `sw.js`, `tests/admin.test.mjs`, `tests/apoyo-comunidad.mjs`, `tests/arbitro-v01-01.mjs`, `tests/arbitro-v02-00-01.mjs`, `tests/arbitro-v02-00.mjs`, `tests/fixtures/LEEME.md`, `tests/fixtures/chat-ejemplo.txt`, `tests/fixtures/chat-ejemplo.zip`, `tests/fixtures/taller-ejemplo.vcf`, `tests/gas-simulador.mjs`, `tests/ia.test.mjs`, `tests/mutaciones-v01-01.mjs`, `tests/mutaciones-v02-00-01.mjs`, `tests/mutaciones-v02-00.mjs`, `tests/mutaciones-v02-01.mjs`, `tests/navegador.mjs`, `tests/unidad.test.mjs`

## Pruebas de esta entrega
| Banco | Resultado |
|---|---|
| Pruebas unitarias y del servidor (`npm test`) | 41 de 41 (27 de la app + 14 del servidor) |
| Pruebas en navegador (`tests/navegador.mjs`) | 21 de 21 |
| Árbitro v01.01 (versión y logo) | 70 de 70 |
| Árbitro v02.00 (UI/UX y diseño gráfico) | 143 de 143 |
| Árbitro v02.00.01 (ícono) | 21 de 21 |
| Árbitro v02.01 (estrellas, formularios, orden, nada amontonado) | 73 de 73 |
| **Árbitro v02.01.01** (1 estrella no cuenta) | **17 de 17** (contra v02.01.00cl: 4 de 17; fallan 13) |
| Mutaciones v02.01.01 | 5 de 5 detectadas |

Los bancos se corrieron desde el ZIP descomprimido en una carpeta limpia; las mutaciones, sobre la carpeta de trabajo, idéntica al ZIP.

## Limitaciones honestas
- El servicio se probó con un simulador de Apps Script, no contra Google en vivo.
- Quien dé 1 estrella no sabe que no cuenta (así lo pediste). Si algún día se quiere ser transparente con eso, basta con agregar una línea en el formulario.
