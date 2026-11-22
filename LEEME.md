# Manual práctico Deepal — entrega v02.00.00cl

**Fecha:** 21 de noviembre de 2026 · **Versión anterior:** v01.01.00cl

## Qué cambia
- **Para quien usa la app:** diseño nuevo («Cabina»), sobrio y fluido: tipografía propia, íconos de trazo fino, línea de energía que muestra cuántos tips encuentras, tablero de categorías en el celular y riel lateral en el computador. Arranca en **tema claro**; el botón del círculo cambia a **oscuro**. La medalla de arriba abre los **créditos**.
- **Para el administrador:** nada cambia en la rutina de cargar el chat y publicar tips. Los tips y el directorio son los mismos.
- **Créditos:** Alejandro Urreta; Miguel Rodríguez y Miguel Vargas (administradores del grupo); El profe Juan Tapia, ProEduLab, www.impulso.click.

## Cómo actualizar lo que ya publicaste en GitHub
1. Descomprime el ZIP.
2. En GitHub, sube los archivos de las tablas **Creados** y **Modificados** a su misma carpeta (**Add file › Upload files**). La carpeta `fonts` es nueva: arrástrala completa. Arrastrar todo el contenido del ZIP también sirve.
3. **Commit changes** con la nota `Versión v02.00.00cl`.
4. Espera 1 a 3 minutos y abre el manual: al pie debe decir **v02.00.00cl**. Quien tenga la app instalada verá «Actualizar».

Si aún no habías publicado nada, sigue `PUBLICAR.md` desde el principio con esta carpeta.

## Inventario (calculado comparando con v01.01.00cl)
**6 creados · 16 modificados · 0 eliminados · 25 sin cambios.**

### Creados
| Archivo | Contenido |
|---|---|
| `fonts/OFL-Archivo.txt` | Licencia libre de la fuente (SIL OFL 1.1) |
| `fonts/archivo-latin.woff2` | Fuente Archivo variable (latín), alojada en la app |
| `js/iconos.js` | Set propio de íconos SVG de trazo fino (1,25 px) |
| `js/tema.js` | Tema claro por defecto u oscuro, aplicado antes de pintar |
| `tests/arbitro-v02-00.mjs` | Script árbitro del rediseño: UI/UX y diseño gráfico (143 afirmaciones) |
| `tests/mutaciones-v02-00.mjs` | 14 defectos de diseño sembrados que el árbitro debe detectar |

### Modificados
| Archivo | Qué cambió |
|---|---|
| `APRENDE.md` | Lección 2: sistema de diseño, ancho variable de la fuente e íconos SVG |
| `LEEME.md` | Esta entrega |
| `PUBLICAR.md` | Créditos, tema claro u oscuro, botón «Instalar» |
| `README.md` | Créditos completos, diseño «Cabina», archivos nuevos |
| `VERIFICACION.md` | Sección 6: árbitros de UI/UX y diseño gráfico |
| `config/sitio.json` | Créditos de Miguel Rodríguez, Miguel Vargas y El profe Juan Tapia (ProEduLab, www.impulso.click); subtítulo sin «·» |
| `css/app.css` | Reescrito: concepto «Cabina», tema claro u oscuro, línea de energía, tablero, riel, transiciones, créditos |
| `data/catalogos.json` | `icono` pasa de emoji a nombre de ícono (cambio de forma de datos) |
| `docs/CHANGELOG.md` | Entrada v02.00.00cl |
| `index.html` | Nueva estructura: portada, línea de energía, riel, botones de créditos y tema, ventana de créditos, fuente precargada |
| `js/admin.js` | Íconos SVG y textos sin emojis |
| `js/app.js` | Íconos, línea de energía, tablero, riel, transiciones, tema, créditos |
| `js/version.js` | Versión v02.00.00cl |
| `sw.js` | Guarda íconos, tema y fuente para uso sin conexión |
| `tests/arbitro-v01-01.mjs` | Pruebas tocadas: orden de scripts por etiqueta y tema oscuro por botón |
| `tests/navegador.mjs` | Pruebas tocadas: total en la línea de energía |

### Sin cambios
`.gitignore`, `.nojekyll`, `IAS.md`, `config/ia.json`, `data/directorio.json`, `data/tips.json`, `icons/apple-touch-icon.png`, `icons/icon-192.png`, `icons/icon-512.png`, `icons/logo-deepal.svg`, `icons/maskable-512.png`, `js/buscador.js`, `js/chat.js`, `js/ia.js`, `js/texto.js`, `manifest.webmanifest`, `package.json`, `tests/admin.test.mjs`, `tests/fixtures/LEEME.md`, `tests/fixtures/chat-ejemplo.txt`, `tests/fixtures/chat-ejemplo.zip`, `tests/fixtures/taller-ejemplo.vcf`, `tests/ia.test.mjs`, `tests/mutaciones-v01-01.mjs`, `tests/unidad.test.mjs`

## Pruebas de esta entrega
| Banco | Resultado |
|---|---|
| Pruebas unitarias (`npm test`) | 27 de 27 |
| Pruebas en navegador (`tests/navegador.mjs`, celular y escritorio) | 21 de 21 |
| Árbitro v01.01 (`tests/arbitro-v01-01.mjs`, versión y logo) | 70 de 70 |
| **Árbitro v02.00** (`tests/arbitro-v02-00.mjs`, UI/UX y diseño gráfico) | **143 de 143** (contra v01.01.00cl: 52 de 143; fallan 91) |
| Mutaciones v02.00 (`tests/mutaciones-v02-00.mjs`) | 14 de 14 detectadas |
| Mutaciones v01.01 (`tests/mutaciones-v01-01.mjs`) | 12 de 12 en la entrega v01.01. No se repiten aquí: varias siembran defectos en estilos que el rediseño reemplazó; lo que vigilaban (versión única, logo, créditos) lo sigue cubriendo el árbitro v01.01 |

Los cuatro primeros bancos se corrieron desde el ZIP descomprimido en una carpeta limpia. Las mutaciones se corrieron sobre la carpeta de trabajo, que es idéntica al ZIP (comparación archivo por archivo sin diferencias).

## Limitaciones honestas
- La revisión de diseño es **autorrevisión** (la hizo quien diseñó, en una pasada aparte, con capturas y pruebas reales), no la de un jurado independiente. «Digna de Awwwards» es un criterio de jurado: la app cumple lo que esos jurados miran primero (identidad propia, tipografía, detalle, movimiento con propósito, accesibilidad), pero eso no garantiza un premio.
- Las transiciones suaves al abrir tips y al cambiar de sección dependen del navegador: en Chrome y Edge recientes se ven; en Safari y Firefox algunas pasan al instante (la app funciona igual).
- No se probó en un iPhone físico.
- El logo es una marca registrada de su titular; se usa con la aclaración «no oficial».
