# Manual práctico Deepal · S05 · S07

**Versión de la app:** ver `js/version.js` (formato `vXX.YY.ZZcl`).

Aplicación web progresiva (PWA) con los aprendizajes de la **comunidad de propietarios Deepal en Colombia**: llantas, carga, batería, modos de energía, mantenimiento, trámites y un directorio de contactos. Se instala en el celular, funciona sin internet y se publica gratis en GitHub Pages.

> Contenido aportado por usuarios, verificado contra el manual del fabricante cuando fue posible. **No es información oficial** de Deepal, Changan ni Grupo Vardí.

## Créditos
- **Alejandro Urreta** — versión inicial del manual en HTML.
- **Miguel Rodríguez** y **Miguel Vargas** — administradores del grupo de WhatsApp Deepal.
- **El profe Juan Tapia** (ProEduLab, [www.impulso.click](https://www.impulso.click)) — rediseño como app, verificación y actualizaciones.
- **Los propietarios del grupo** — las experiencias que alimentan cada tip.

## Qué trae
- **Búsqueda en vivo** desde 3 letras: entiende sinónimos (neumático = llanta), palabras a medio escribir y errores de digitación; resalta lo encontrado.
- **Filtros** por modelo (S05/S07), motor (rango extendido / eléctrico) y categoría.
- **Nivel de confianza** en cada tip: Manual oficial · Varios lo confirman · Pocos reportes · En disputa, con su fuente.
- **Preguntar**: responde con los tips del manual; con una IA activada redacta la respuesta y enlaza los tips.
- **Directorio** por ciudad y tipo de servicio, en fichas plegables, con WhatsApp y llamada en un toque.
- **Estrellas y opiniones** de los propietarios (los mejor calificados arriba; los de 2 estrellas o menos, en una sección aparte) y formulario **«Quiero aparecer en el directorio»**. Se encienden con [COMUNIDAD.md](COMUNIDAD.md).
- **Panel de administrador** (`#admin`) para convertir el chat exportado de WhatsApp en tips nuevos, sin que el chat salga del navegador.
- Diseño «Cabina»: tipografía Archivo alojada en la app, íconos SVG propios de trazo fino, línea de energía que muestra cuántos tips encuentras, tablero de categorías en el celular y riel lateral en el computador.
- Instalable, **sin conexión**, tema claro (predeterminado) y oscuro, accesible (teclado, lector de pantalla, contraste AA, botones de 44 px, respeta «reducir movimiento»).

## Estructura
| Ruta | Qué es |
|---|---|
| `index.html` | Estructura de la página |
| `css/app.css` | Apariencia (colores, celular/computador, modo oscuro) |
| `js/version.js` | **Única** fuente de la versión de la app |
| `js/app.js` | Lógica principal: carga datos, pinta, busca, pregunta |
| `js/buscador.js` | Motor de búsqueda (índice, sinónimos, errores de digitación) |
| `js/texto.js` | Utilidades de texto |
| `js/iconos.js` | Set propio de íconos SVG de trazo fino |
| `js/tema.js` | Tema claro (predeterminado) u oscuro, antes de pintar |
| `fonts/` | Fuente Archivo (licencia OFL) para que funcione sin internet |
| `js/ia.js` | IAs en cascada, llaves por usuario |
| `js/chat.js` | Lector del chat de WhatsApp (.zip/.txt), anonimizador, candidatos |
| `js/admin.js` | Panel del administrador |
| `js/comunidad.js` | Habla con el servicio de calificaciones y solicitudes |
| `apps-script/` | Servidor gratuito en Google Apps Script (se pega en una hoja de Google; ver COMUNIDAD.md) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Lo que la hace PWA. En `icons/` van el logo (`logo-deepal.svg`) y el ícono de la app (`icono-app.svg`: emblema de Deepal en trazo fino con un libro pequeño) |
| `herramientas/generar-iconos.mjs` | Genera el ícono de la app y sus PNG a partir del logo (`npm run iconos`) |
| `data/tips.json` | **Los tips** (lo que más se actualiza) |
| `data/directorio.json` | Contactos |
| `data/catalogos.json` | Categorías (con el nombre de su ícono), modelos y motores (agregar un modelo nuevo = editar aquí) |
| `config/sitio.json` | Nombre, créditos, opciones de privacidad, repositorio y dirección del servicio de calificaciones |
| `config/ia.json` | IAs disponibles y cuáles están aprobadas |
| `tests/` | Pruebas automáticas |

## Documentos
- **[PUBLICAR.md](PUBLICAR.md)** — paso a paso para publicar en GitHub, desde cero.
- **[COMUNIDAD.md](COMUNIDAD.md)** — encender estrellas, opiniones y «Quiero aparecer» (hoja de Google + Apps Script).
- **[VERIFICACION.md](VERIFICACION.md)** — qué se corrigió y por qué (con 7 árbitros adversariales).
- **[IAS.md](IAS.md)** — lista de IAs para aprobar.
- **[APRENDE.md](APRENDE.md)** — curso de programación usando esta app.
- **[docs/CHANGELOG.md](docs/CHANGELOG.md)** — historial de versiones.
- **[LEEME.md](LEEME.md)** — qué trae esta entrega y qué archivos cambiaron.

## Para desarrolladores
No hay que compilar nada. Para verla localmente: `python -m http.server 8080` y abrir `http://localhost:8080`.
Pruebas: `npm test` (Node 20+). Pruebas en navegador: `npm i -D playwright && npx playwright install chromium`, servidor encendido y `npm run test:navegador`.
