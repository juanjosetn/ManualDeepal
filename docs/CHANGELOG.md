# Registro de cambios

Formato de versión **vXX.YY.ZZcl** — XX: rediseño o cambio que rompe datos · YY: funciones nuevas o correcciones de fondo · ZZ: ajustes menores. La más reciente va arriba.

## v02.00.01cl — 21 de noviembre de 2026

### Diseño
- **Ícono nuevo de la app:** el emblema de Deepal en trazo fino (solo contorno, plateado) con un libro abierto pequeño en ámbar, sobre fondo grafito. Sale del logo entregado, sin redibujarlo. Hay versión redondeada, versión a sangre para Android (todo el dibujo dentro de la zona segura) y versión para iPhone.
- El ícono también es el favicon (en SVG) de la pestaña del navegador.
- Los colores del manifiesto (barra y pantalla de arranque) pasan al gris claro del tema; antes quedaba el verde azulado de la primera versión.

### Nuevo
- `herramientas/generar-iconos.mjs` (`npm run iconos`): genera el SVG y los PNG a partir del logo. Los PNG ya no se hacen a mano.

### Pruebas
- Script árbitro `tests/arbitro-v02-00-01.mjs`: 21 afirmaciones, entre ellas emblema tomado del logo, trazo fino, libro pequeño, tamaños, zona segura medida píxel a píxel, manifiesto y favicon. Contra v02.00.00cl pasan 6 y fallan 15; contra esta versión pasan las 21.
- `tests/mutaciones-v02-00-01.mjs`: 8 defectos sembrados, los 8 detectados. Cuando la mutación toca el generador, los íconos se regeneran antes de probar.

## v02.00.00cl — 21 de noviembre de 2026

Rediseño completo de la interfaz. Cambia el número grande (02) porque cambió la forma de un archivo de datos (`data/catalogos.json`: los íconos de categoría ya no son emojis sino nombres de íconos).

### Diseño
- Concepto **«Cabina»**: grises fríos tomados del titanio del logo y un único acento, el **ámbar de carga**, que solo aparece donde hay «energía» (línea de carga, pestaña activa, tip abierto, foco del teclado).
- **Tipografía Archivo** alojada en la app (funciona sin internet). El titular usa su versión ancha, como el logotipo, y el texto el ancho normal.
- **Íconos SVG propios de trazo fino** (1,25 px), todos de la misma familia, en lugar de emojis: categorías, pestañas, partes del tip (Cuándo, Cómo, Ojo), niveles de confianza y acciones.
- **Línea de energía** bajo el buscador: se carga al abrir la app y se llena según los resultados («5 de 108»).
- **Tema claro predeterminado** y tema oscuro con un botón; la elección se recuerda.

### Nuevo
- **Botón pequeño de créditos** (la medalla, arriba) que abre una ventana con todos los créditos.
- Créditos para **Miguel Rodríguez** y **Miguel Vargas** (administradores del grupo de WhatsApp Deepal) y **El profe Juan Tapia** (ProEduLab, www.impulso.click), además de Alejandro Urreta.
- **Tablero de categorías** con íconos en la portada del celular y la tableta.
- **Riel lateral** fijo con las categorías en el computador.

### Interfaz
- Al buscar, el titular se recoge y deja el espacio a los resultados.
- Los tips se abren y cierran con una transición suave. El cambio entre secciones también es fluido (en los navegadores que lo permiten).
- En el celular, los filtros de modelo y motor van en una sola fila deslizable y las pestañas de categoría no se repiten con el tablero.
- El conteo de resultados ya no se repite en texto: está en la línea de energía (y se sigue anunciando al lector de pantalla).
- Directorio con acciones de WhatsApp, llamada y web en círculos de trazo fino.

### Cambiado
- `data/catalogos.json`: `icono` ahora es el nombre de un ícono de `js/iconos.js`.
- El tema ya no sigue al del celular: arranca en claro.
- Se quitaron los puntos medios («·») y los emojis de los textos de la interfaz y del panel de administrador.

### Pruebas
- Script árbitro nuevo `tests/arbitro-v02-00.mjs` (árbitros UI/UX y diseño gráfico): 143 afirmaciones en 5 anchos (390, 820, 1024, 1280 y 1440 px), en claro y oscuro: contraste AA, tamaño de toque, trazo de los íconos, fuente cargada, sin emojis, tablero o riel según la pantalla, línea de energía, créditos y movimiento reducido. Contra v01.01.00cl fallan 91; contra esta versión pasan las 143.
- `tests/mutaciones-v02-00.mjs`: 14 defectos sembrados.
- **Pruebas tocadas:**
  - `tests/navegador.mjs` lee el total en la línea de energía (`#cuentaEnergia`).
  - En `tests/arbitro-v01-01.mjs`, el orden de los scripts se revisa por etiqueta, y el oscuro se activa con el botón y no con el tema del sistema.

## v01.01.00cl — 21 de noviembre de 2026

### Nuevo
- Versión de la app en **un solo lugar** (`js/version.js`). El pie de la página la muestra y la copia sin conexión la usa como nombre: al publicar una versión nueva, los celulares con la app instalada ven el aviso «Actualizar».
- `LEEME.md` en cada entrega con la lista calculada de archivos creados, modificados y sin cambios.

### Corregido
- Los celulares (también iPhone) ya no pueden quedarse con la versión vieja: la app registra la copia sin conexión con la versión en la dirección (`sw.js?v=…`) y sin caché del navegador.
- Al instalar una versión, la copia sin conexión pide cada archivo fresco al servidor; antes podía guardar archivos viejos que el navegador tenía en caché (defecto presente desde v01.00).

### Diseño
- **Logo de Deepal** en la cabecera, junto a «Manual práctico» y la aclaración «Comunidad de propietarios en Colombia · no oficial». En modo oscuro se aclara para que se lea.
- En el celular, la aclaración «no oficial» se lee completa junto al logo (antes se cortaba con «…»).
- El logo se configura en `config/sitio.json` (`logo.archivo`, `logo.texto`): para otra marca solo se cambia ahí.

### Cambiado
- El registro de cambios pasa a `docs/CHANGELOG.md`.
- `PUBLICAR.md` (parte 10) y `APRENDE.md` (lección 9) explican el nuevo versionado.
- El aviso del pie aclara que la marca y el logo son de su titular.

### Pruebas
- Script árbitro nuevo `tests/arbitro-v01-01.mjs`: 70 afirmaciones (versión única, logo, cabecera en 390/820/1024/1280/1440 px en claro y oscuro, «no oficial» visible, actualización en todos los navegadores). Contra v01.00.00cl fallan 58; contra esta versión pasan las 70.
- `tests/mutaciones-v01-01.mjs`: 12 defectos sembrados a propósito; las 12 se detectan.
- Siguen en verde las 27 pruebas unitarias y las 21 de navegador de v01.00.

## v01.00.00cl — 21 de noviembre de 2026
Primera versión PWA (se entregó como «2026.11.21»; se renombra con el formato de versionado).

### Nuevo
- App instalable (PWA) que funciona sin conexión, publicable en GitHub Pages sin compilar nada.
- Búsqueda en vivo desde 3 letras, con sinónimos, prefijos, tolerancia a errores de digitación, resaltado y «¿Quisiste decir…?».
- Pestaña «Preguntar»: responde con los tips del manual y, si la persona activa una IA, redacta la respuesta citando los tips.
- 10 IAs gratuitas y 5 de pago en cascada, con aprobación del administrador (`IAS.md`).
- Panel de administrador (`#admin`): carga el chat de WhatsApp (.zip o .txt), lo anonimiza, propone conversaciones útiles, redacta tips (a mano o con IA), agrega contactos .vcf y publica en GitHub.
- Niveles de confianza «Manual oficial» y «En disputa»; cada tip muestra su fuente.

### Corregido
- 17 correcciones y 5 tips nuevos tras verificar contra el manual de la S07 (ver `VERIFICACION.md`).

### Diseño
- Responsivo (celular, tableta, computador), modo oscuro, pestañas abajo en el celular, botones de 44 px, compartir un tip con enlace directo.

### Pruebas
- 27 pruebas unitarias y 21 en navegador.

## Versión inicial
- Manual en un solo HTML con tips y directorio, por **Alejandro Urreta**.
