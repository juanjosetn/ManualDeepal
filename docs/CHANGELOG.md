# Registro de cambios

Formato de versión **vXX.YY.ZZcl** — XX: rediseño o cambio que rompe datos · YY: funciones nuevas o correcciones de fondo · ZZ: ajustes menores. La más reciente va arriba.

## v02.05.00cl — 22 de noviembre de 2026

### Datos: tips contrastados con el manual de la S05 Max (rango extendido)
- El manual que entregó el administrador es el de la **S05 Max** (rango extendido), en **inglés**, edición de enero de 2025. Coincide con la que se vende en Colombia: batería LFP de 27,28 kWh, 214 hp, motor 1.5 de gasolina como generador, 1.847 kg.
- Todo lo que se publica está **en español** y con palabras propias. El manual no se traduce ni se sube entero: tiene derechos de autor.
- 25 tips actualizados y 4 nuevos (114 en total). Lo que antes decía «en la Max confírmalo» quedó confirmado con su manual: 41 PSI (280 kPa), modo de remolque, cuerda de la pistola de carga, puertas con la 12 V descargada, toma de 12 V en el baúl, V2L y actualizaciones.
- **Carga al 100 %:** los manuales de las **dos** S05 piden una carga completa **al menos una vez a la semana** si el carro se usa a diario. En el grupo se decía una vez al mes.
- **Carga de aparcamiento:** pasa a «Manual oficial» (lugar abierto y ventilado, tres velocidades, solo para necesidades temporales).
- **Modos de energía:** el tip de la S05 suma lo que dice el manual (el «eléctrico forzado» de Prioridad eléctrica y para qué sirve cada modo).
- **V2L en la Max:** opción «Arrancar el motor con batería baja» para seguir dando corriente con el generador.
- **Nuevo:** «S05 Max: plan de mantenimiento del fabricante». Aceite 0W-16 y filtro en cada revisión; bujías después de 30.000 km recorridos con el motor de gasolina encendido; filtro de gasolina cada 4 años o 100.000 km; filtro de aire del motor, reductor, frenos, refrigerante.
- **Nuevo:** «S05 Max: el manual pide gasolina RON 91 o más». Se marca «Hay versiones contradictorias»: en Colombia la extra cumple y la corriente tiene menos octanaje; en el grupo la mayoría usa corriente. El tip pide la respuesta del taller por escrito.
- **Nuevo:** «S05 Max: para tanquear, desbloquea la tapa desde la pantalla» (tanque presurizado: encendido y en P, cerrar hasta oír dos clics).
- **Nuevo:** «S05 Max: usa el modo de emergencia para llegar a la bomba o al cargador».

### Pruebas
- Script árbitro `tests/arbitro-v02-05.mjs`: 29 afirmaciones (30 con el PDF en inglés a mano, que revisa las 31 páginas citadas). Revisa también que no se cuele ninguna frase en inglés en lo publicado. Contra v02.04.00cl pasan 4 de 29.
- `tests/mutaciones-v02-05.mjs`: 11 defectos sembrados; los 11 detectados.
- `herramientas/verificacion-s05/aplicar_max.py`: genera los cambios con reemplazos exactos y se niega a correr dos veces.
- **Pruebas tocadas** (cambio legítimo): `tests/arbitro-v02-04.mjs` ya no exige exactamente 110 tips (ahora son 114); pide al menos 110 y compara con el total real.

## v02.04.00cl — 22 de noviembre de 2026

### Datos: tips contrastados con el manual de la S05
- Los dos manuales de la S05 que entregó el administrador son de la **S05 eléctrica**. El de 265 páginas coincide con la **S05 E-Max** que se vende en Colombia (LFP de 56,12 kWh, 234 hp, 1.777 kg, 458 km); el de 274 páginas es la versión **europea** (68,8 kWh), que no se vende en Colombia. **No hubo manual de la S05 Max (rango extendido)**: lo que es solo de esa versión sigue apoyado en el grupo.
- 20 tips actualizados y 2 nuevos (110 en total). Cada dato del manual cita su página del PDF.
- **41 PSI en la S05:** confirmado (280 kPa = 2,8 bar) y marcado «Manual oficial». Se aclara la presión «cómoda» de 250 kPa, solo para ir sin carga, y que el manual europeo dice 290 kPa.
- **Carga al 100 %:** el manual de la S05 eléctrica pide una carga completa **cada semana** si el carro se usa a diario (antes el tip decía «una vez al mes» para todas).
- **Química de la batería:** S05 Max LFP de 27,28 kWh (prensa) y S05 E-Max LFP de 56,12 kWh (manual).
- **Amperaje:** ruta exacta del menú (Centro del vehículo › Energía › Más › Límite de corriente de carga).
- **Modo de remolque:** ahora también para la S05 (Centro del vehículo › Mantenimiento de seguridad › Modo de remolque). Antes aparecía solo con el filtro S07.
- **Grúa:** se corrigió una página equivocada («pág. 213» era la de las actualizaciones) y se agregó dónde se enrosca el gancho en la S05.
- **Puertas con la batería de 12 V descargada:** manija interior dos veces, puerto de desbloqueo de emergencia en el bumper trasero (máximo 30 segundos con el arrancador) y apertura del baúl desde adentro.
- **Mantenimiento:** plan de la S05 eléctrica (reductor cada 3 años o 60.000 km, líquido de frenos a los 45.000 y 85.000 km, refrigerante a los 36 meses u 80.000 km), separado del de la S07 Max.
- También se agregaron las fuentes del manual de la S05 a: kit de pinchazo (única toma de 12 V en el baúl, hasta 120 W), TPMS como referencia, rotación de llantas (y cambio de llantas de más de 6 años), batería entre 20 % y 90 %, bajadas al 100 %, regeneración, actualizaciones, calendario de revisiones, guardar el carro mucho tiempo y filtro del aire acondicionado.
- **Nuevo:** «Usa el carro como toma de 220 V con un adaptador V2L» (está en los manuales de la S07 Max y de la S05 eléctrica; el adaptador se compra aparte).
- **Nuevo:** «Si la pistola de carga lenta no sale, usa la cuerda de emergencia del baúl».
- El manual del fabricante **no** se sube al repositorio: el repositorio es público y el manual tiene derechos de autor. Los tips lo citan con sus propias palabras.

### Corregido
- Si la hoja de la comunidad respondía algo incompleto (por ejemplo, el servicio todavía sin actualizar), el manual podía quedarse sin tips al ponerse al día. Ahora conserva los datos que ya tenía.

### Pruebas
- Script árbitro `tests/arbitro-v02-04.mjs`: 30 afirmaciones (31 con el PDF del manual a mano, que revisa página por página que cada cita diga lo que el tip le atribuye). Contra v02.03.00cl pasan 4 de 30; contra esta versión pasan todas.
- `tests/mutaciones-v02-04.mjs`: 11 defectos sembrados (en los datos, en el manual y uno que sube el PDF al repositorio); los 11 detectados.
- `herramientas/verificacion-s05/aplicar.py`: genera los cambios de los datos con reemplazos exactos (si algo no coincide, se detiene).
- **Pruebas tocadas** (cambio legítimo): `tests/arbitro-v02-00.mjs` lee el total de tips de `data/tips.json` en vez de tener fijo «108».

## v02.03.00cl — 22 de noviembre de 2026

### Nuevo
- **Panel de administración con usuario y contraseña** (`#admin`, dentro del manual). Desde ahí se administra todo sin tocar GitHub: tips, directorio (agregar, editar, quitar), chat del grupo, opiniones, solicitudes, revisiones, usuarios, bitácora y copia de seguridad.
- **Los tips y el directorio viven en la hoja de Google** (pestañas TIPS y DIRECTORIO). Guardar en el panel publica en el manual en uno o dos minutos. «Retirar» saca un registro del manual sin borrarlo; se puede volver a publicar. «Guardar como borrador» guarda sin publicar.
- **Colaboradores:** usuarios que corroboran lo publicado. Pueden **marcar como verificado** (el manual muestra «Revisado por colaboradores el …»), **reportar un error**, **proponer un cambio** y **moderar opiniones**. No publican cambios, no ven usuarios, bitácora, copia ni el chat, ni los datos de quienes piden aparecer. En «Mis aportes» ven qué decidió el administrador.
- **Revisiones:** cada propuesta muestra lo actual tachado y lo propuesto resaltado; «Aceptar y publicar» la aplica tal cual. Los reportes se corrigen y se marcan como resueltos.
- **Usuarios:** crear, restablecer contraseña, activar o desactivar y cambiar el rol. La contraseña temporal se muestra una sola vez, con un mensaje listo para enviar por chat privado; al entrar, el sistema obliga a cambiarla.
- **Bitácora:** las últimas 300 acciones (quién, qué y cuándo), sin contraseñas.
- **Chat del grupo:** se sigue leyendo solo en tu computador. Ahora el tip aprobado se guarda directo en la hoja (publicado o como borrador) y el botón «Marcar el chat como revisado hasta…» deja la fecha en la hoja.
- **Copia y ajustes:** importar una sola vez a la hoja lo que hoy publica GitHub; descargar o publicar en GitHub la copia de `tips.json` y `directorio.json`; IAs aprobadas.
- El manual abre al instante con la última copia guardada en el celular (o con la de GitHub) y se pone al día con la hoja en segundo plano.

### Seguridad
- Las contraseñas nunca se guardan: solo una huella con «sal» (un texto al azar distinto por usuario) repetida 2.000 veces.
- La sesión es un pase al azar que vence a las 6 horas sin uso y se borra al cerrar la pestaña. En cada acción el servidor vuelve a leer el usuario en la hoja: desactivar a alguien le quita el acceso de inmediato.
- Cinco intentos fallidos con el mismo usuario lo bloquean 15 minutos.
- Los permisos los decide el servidor, no el navegador: aunque un colaborador fuerce una acción de administrador, recibe «sin permiso».
- Si dos personas editan el mismo registro, la segunda recibe un aviso en vez de pisar en silencio el cambio de la primera.
- Siempre queda al menos un administrador activo, y nadie puede quitarse su propio rol.
- Tras el primer ingreso, la clave antigua de administración deja de servir sola: siempre usuario y contraseña.

### Cambiado
- El servicio de Apps Script pasa a la versión 2.0.0 (pestañas nuevas: TIPS, DIRECTORIO, USUARIOS, REVISIONES y BITACORA; se crean solas). No pide permisos nuevos.
- «Agregar al directorio» desde una solicitud publica el contacto de una vez (antes quedaba en cambios pendientes).
- Los pasos numerados del panel anterior y sus «cambios pendientes» en el navegador desaparecen. Si un navegador aún los tiene, el Resumen ofrece descargarlos.

### Al publicar (lo que debe hacer el administrador)
1. Pegar el `apps-script/Codigo.gs` nuevo y usar «Gestionar implementaciones › Nueva versión» (la dirección /exec no cambia).
2. Subir los archivos del manual a GitHub como siempre.
3. Entrar a `#admin` con el usuario **admin** y la misma clave de administración que ya usaba.
4. «Copia y ajustes › Importar desde GitHub», una sola vez. Luego crear a los colaboradores.
Detalle en COMUNIDAD.md, sección «Actualizar a la versión 2.3».

### Pruebas
- Script árbitro `tests/arbitro-v02-03.mjs`: 66 afirmaciones (servidor simulado, escritorio, celular y modo oscuro, administrador y colaborador). Contra v02.02.00cl pasan 2 de 20 que alcanza a recorrer; contra esta versión pasan las 66.
- `tests/mutaciones-v02-03.mjs`: 18 defectos sembrados, los 18 detectados.
- `tests/gas-panel.test.mjs`: 9 pruebas nuevas del servidor (contraseñas con sal, bloqueo, migración, sesiones, roles, importación, conflictos, propuestas, usuarios y bitácora). El simulador del Apps Script ahora tiene `putAll`, `getAll`, `remove`, `deleteProperty` y `getUuid`.
- **Pruebas tocadas** (cambios legítimos): `tests/navegador.mjs` entra al panel con usuario y contraseña contra el simulador, guarda el tip del chat en la hoja y bloquea toda llamada al servicio real; `tests/arbitro-v02-01.mjs` (B7) y `tests/arbitro-v02-01-01.mjs` entran con usuario y contraseña, y «Agregar al directorio» se comprueba en la hoja; `tests/arbitro-v02-01-01.mjs` acepta el servicio 1.1.0 o posterior.

## v02.02.00cl — 22 de noviembre de 2026

### Nuevo
- **Pestaña «Trámites»** (cuarta pestaña, junto a Tips, Directorio y Preguntar). Trae la **guía de devolución del IVA** de vehículos eléctricos e híbridos con dos botones: **Abrir la guía** y **Descargar (HTML)**, más sus novedades normativas con fecha de vigencia. La lista de trámites vive en `data/tramites.json`: agregar otra guía es poner su HTML en `guias/` y una entrada en ese archivo.
- **Estrellas y «Quiero aparecer» encendidos:** `config/sitio.json` ya trae la dirección /exec del Apps Script de la comunidad (servicio 1.1.0, comprobado en línea el 22 de noviembre de 2026).
- **Guía de devolución del IVA, versión HTML v01.02.00cl** (contenido 5.5, revisado al 22 de noviembre de 2026). Es un solo archivo que funciona sin internet, en cualquier navegador, y sirve para cualquier marca de vehículo eléctrico o híbrido.

### Normatividad (en la guía: lo anterior tachado, lo nuevo resaltado y con fecha de vigencia)
- Resolución UPME 563 de 2026 (vigente desde el 7 de agosto de 2026) reemplaza a la 400 de 2026: ventana del 1 de febrero al 15 de diciembre de cada año, 30 días hábiles, el certificado no vence y el de un vehículo no se modifica.
- Comunicado DIAN 127 (1 de octubre de 2026) y abecé DIAN: cita solo en Bogotá, Medellín, Cali y Bucaramanga (Manizales señalada como dudosa); formulario electrónico de la DIAN para el Formato 010; asunto oficial; 20 MB por cada PDF; agendamiento en agendamiento.dian.gov.co.
- Concepto DIAN 12670 de 2026 (la nota crédito del concesionario no sirve) y Concepto DIAN 2242 de 2026 (con certificado UPME antes de comprar, la factura sale sin IVA).
- Aviso neutral del proyecto de Ley de Rescate (477 de 2026 Cámara): propone IVA del 19 %; no está aprobado.
- La UVT se toma por año (la de 2027 aún no está publicada).

### Interfaz del manual
- En tableta (720 a 1023 px), con cuatro pestañas arriba el título y el aviso «no oficial» quedaban apretados: ahora las pestañas van abajo, como en el celular.

### Interfaz de la guía (árbitro UI/UX)
- En el celular la página ya no se sale de la pantalla (medía 428 px de más).
- Barra superior compacta (de unos 216 px a 92 px en el celular) con un menú «Opciones».
- Los 15 botones «?» tienen nombre para el lector de pantalla, miden 24 px y su explicación queda asociada al enfocarlos.
- Letras del propio equipo: la guía ya no llama a Google Fonts (funciona igual sin internet y no avisa a terceros).
- Modo oscuro (automático según el sistema, o con el botón).
- «Guardar copia» y «Restaurar copia» por separado; reiniciar y restaurar piden confirmación en una ventana propia, con el foco en «Cancelar».
- La carta de remisión y el correo solo mencionan la cita si tu ruta la tiene; el asunto oficial y el cuerpo del correo se llenan con tus datos.
- Restaurar una copia acepta solo los datos esperados.
- Desde la web, «Opciones › Descargar esta guía» baja el archivo original (nunca la página con tus datos).
- Las casillas siguen marcándose en orden estricto, como decidió el administrador.

### Pruebas
- Script árbitro `tests/arbitro-v02-02.mjs`: 61 afirmaciones. Contra v02.01.01cl pasan 2 de 30 que alcanza a recorrer; contra la guía original v1.01 pasan 23 de 52; contra esta versión pasan las 61.
- `tests/mutaciones-v02-02.mjs`: 14 defectos sembrados, los 14 detectados.
- **Pruebas tocadas** (cambios legítimos): `tests/arbitro-v01-01.mjs` ya no busca cadenas de versión en `guias/` ni en `herramientas/guia-iva/`, porque cada guía es un producto aparte con su propia versión. `tests/arbitro-v02-01.mjs` acepta la dirección /exec configurada (antes exigía el campo vacío) y simula «sin servicio» bloqueando las llamadas reales.

## v02.01.01cl — 22 de noviembre de 2026

### Cambiado
- **Las calificaciones de 1 estrella no cuentan** (decisión del administrador: suelen venir de un mal momento o de una retaliación individual). Se reciben y quedan en la hoja para que el administrador las lea, pero no entran al promedio, al orden de los «mejores arriba» ni a «Calificación baja», y su texto no se publica.
- En el panel, la opinión de 1 estrella dice «no cuenta ni se publica» y solo trae el botón **Archivar**.
- El mensaje al calificar ahora es el mismo para todos: «¡Gracias! Recibimos tu calificación.» (antes decía «ya cuenta», que no sería cierto con 1 estrella).
- El servicio de Apps Script pasa a la versión 1.1.0. **Si ya lo habías publicado**, pega el `Codigo.gs` nuevo y usa «Gestionar implementaciones › Nueva versión» (la dirección `/exec` no cambia).

### Pruebas
- Script árbitro `tests/arbitro-v02-01-01.mjs`: 17 afirmaciones. Contra v02.01.00cl pasan 4 y fallan 13; contra esta versión pasan las 17.
- `tests/mutaciones-v02-01-01.mjs`: 5 defectos sembrados, los 5 detectados.
- Una prueba nueva en `tests/gas.test.mjs` (14 en total).
- **Pruebas tocadas** (cambio legítimo de la regla): en `tests/gas.test.mjs`, la prueba de «Revisar calificaciones» usa 2 y 3 estrellas en vez de 1 y 2; en `tests/arbitro-v02-01.mjs`, la «calificación baja» se siembra con 2 estrellas en vez de 1.

## v02.01.00cl — 22 de noviembre de 2026

### Nuevo
- **Estrellas y opiniones en el directorio.** Cada ficha tiene una estrella para calificar de 1 a 5, decir si lo recomiendas y dejar una opinión. Las estrellas cuentan de inmediato; el texto se publica cuando el administrador lo aprueba. Cada celular califica una vez por negocio (si vuelve, cambia su calificación).
- **«Quiero aparecer en el directorio»:** formulario con negocio, servicio, ciudad, WhatsApp, web y descripción, con autorización para publicar los datos (Ley 1581 de 2012). Llega al administrador para revisión; si lo configura, también le llega un correo.
- **Calificación baja:** un negocio con promedio de 2 estrellas o menos y al menos 3 calificaciones sale de la lista principal y pasa a una sección plegada al final. Si mejora, vuelve solo. Los dos números se cambian en `config/sitio.json`.
- **Panel del administrador, paso 6 «Opiniones, calificaciones y solicitudes»:** publicar, quitar solo el texto o rechazar opiniones; «Agregar al directorio» desde una solicitud (queda en cambios pendientes); revisar todas las calificaciones de un negocio en calificación baja y «No contar» las sospechosas.
- Servidor gratuito en Google Apps Script con una hoja de Google (`apps-script/`), y la guía **COMUNIDAD.md** para encenderlo paso a paso. Mientras no se configure, el manual se ve como antes.

### Interfaz
- **Directorio organizado por ciudad y tipo de servicio.** Cada ciudad es una sección plegable que resume sus servicios; adentro, subtítulos por servicio y **los mejor calificados arriba**.
- **Nada amontonado:** cada contacto es una ficha con aire alrededor (una columna en el celular, dos o tres en el computador), botones al pie y las estrellas en una sola línea discreta («4,3 (3)»). Las opiniones van plegadas dentro de la ficha.
- Al elegir una ciudad en los filtros, su sección se abre sola; las que abras se recuerdan mientras buscas.
- Al buscar, los resultados salen en fichas, los mejor calificados primero.

### Seguridad y privacidad
- Las opiniones se revisan antes de publicarse y el servidor tapa teléfonos, correos y placas que alguien escriba.
- La clave del administrador no se guarda en ningún lado: el servidor guarda solo su huella. Cinco intentos fallidos bloquean 15 minutos.
- Frenos por hora contra abusos, campo trampa para robots y textos que empiezan por `=`, `+`, `-` o `@` guardados como texto (no como fórmula).
- Para que una sola persona no esconda un negocio, hace falta un mínimo de 3 calificaciones antes de bajarlo; el orden usa un promedio prudente (un 5 con un solo voto no supera a un 4,8 con veinte).

### Pruebas
- `tests/gas.test.mjs` (13 pruebas) con un simulador del Apps Script que falla como Sheets real (fila 1.001, bloqueo ocupado, cupos por ventana fija).
- Script árbitro `tests/arbitro-v02-01.mjs` con el Apps Script simulado dentro del navegador: 73 afirmaciones. Contra v02.00.01cl pasan 4 de 30 que alcanza a recorrer (las demás no pueden ni empezar); contra esta versión pasan las 73.
- `tests/mutaciones-v02-01.mjs`: 14 defectos sembrados, los 14 detectados.

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
