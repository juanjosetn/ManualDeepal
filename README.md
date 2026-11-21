# Manual práctico Deepal · S05 · S07

Aplicación web progresiva (PWA) con los aprendizajes de la **comunidad de propietarios Deepal en Colombia**: llantas, carga, batería, modos de energía, mantenimiento, trámites y un directorio de contactos. Se instala en el celular, funciona sin internet y se publica gratis en GitHub Pages.

> Contenido aportado por usuarios, verificado contra el manual del fabricante cuando fue posible. **No es información oficial** de Deepal, Changan ni Grupo Vardí.

## Créditos
- **Alejandro Urreta** — versión inicial del manual en HTML.
- **Propietarios del grupo «General»** — las experiencias que alimentan cada tip.
- **Administración del grupo** — verificación, actualizaciones y esta versión PWA.

## Qué trae
- **Búsqueda en vivo** desde 3 letras: entiende sinónimos (neumático = llanta), palabras a medio escribir y errores de digitación; resalta lo encontrado.
- **Filtros** por modelo (S05/S07), motor (rango extendido / eléctrico) y categoría.
- **Nivel de confianza** en cada tip: Manual oficial · Varios lo confirman · Pocos reportes · En disputa, con su fuente.
- **Preguntar**: responde con los tips del manual; con una IA activada redacta la respuesta y enlaza los tips.
- **Directorio** con WhatsApp y llamada en un toque.
- **Panel de administrador** (`#admin`) para convertir el chat exportado de WhatsApp en tips nuevos, sin que el chat salga del navegador.
- Instalable, **sin conexión**, modo oscuro, accesible (teclado, lector de pantalla, botones de 44 px).

## Estructura
| Ruta | Qué es |
|---|---|
| `index.html` | Estructura de la página |
| `css/app.css` | Apariencia (colores, celular/computador, modo oscuro) |
| `js/app.js` | Lógica principal: carga datos, pinta, busca, pregunta |
| `js/buscador.js` | Motor de búsqueda (índice, sinónimos, errores de digitación) |
| `js/texto.js` | Utilidades de texto |
| `js/ia.js` | IAs en cascada, llaves por usuario |
| `js/chat.js` | Lector del chat de WhatsApp (.zip/.txt), anonimizador, candidatos |
| `js/admin.js` | Panel del administrador |
| `sw.js`, `manifest.webmanifest`, `icons/` | Lo que la hace PWA |
| `data/tips.json` | **Los tips** (lo que más se actualiza) |
| `data/directorio.json` | Contactos |
| `data/catalogos.json` | Categorías, modelos y motores (agregar un modelo nuevo = editar aquí) |
| `config/sitio.json` | Nombre, créditos, opciones de privacidad, repositorio |
| `config/ia.json` | IAs disponibles y cuáles están aprobadas |
| `tests/` | Pruebas automáticas |

## Documentos
- **[PUBLICAR.md](PUBLICAR.md)** — paso a paso para publicar en GitHub, desde cero.
- **[VERIFICACION.md](VERIFICACION.md)** — qué se corrigió y por qué (con 7 árbitros adversariales).
- **[IAS.md](IAS.md)** — lista de IAs para aprobar.
- **[APRENDE.md](APRENDE.md)** — curso de programación usando esta app.
- **[CHANGELOG.md](CHANGELOG.md)** — historial de versiones.

## Para desarrolladores
No hay que compilar nada. Para verla localmente: `python -m http.server 8080` y abrir `http://localhost:8080`.
Pruebas: `npm test` (Node 20+). Pruebas en navegador: `npm i -D playwright && npx playwright install chromium`, servidor encendido y `npm run test:navegador`.
