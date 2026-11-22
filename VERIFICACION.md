# Informe de verificación del Manual práctico Deepal

**Fecha:** 21 de noviembre de 2026 · **Versión de datos:** 2026.11.21 · **Versión de la app:** ver `js/version.js`

## 1. Qué se revisó y contra qué

| Fuente | Alcance | Peso |
|---|---|---|
| **Manual del propietario Deepal S07 Max (REEV)**, PDF en español, 247 páginas | Presiones, batería, modos de energía, carga, remolque, mantenimiento, kit de pinchazo | Manda sobre todo lo demás (se marca **«Manual oficial»**) |
| **Chat del grupo «General»** exportado | 28.754 mensajes de 363 participantes, del **27-abr-2026 al 21-nov-2026** | Consenso si 3 o más propietarios coinciden |
| **Web** (prensa automotriz colombiana, Ministerio de Transporte, fichas técnicas) | Química de batería por versión, norma de llanta de repuesto | Para lo que no está en el manual |

**Límites:**
- No se tuvo el **manual de la S05**. Los tips solo de la S05 se contrastaron con el chat, no con el fabricante.
- El chat exportado empieza el 27-abr-2026. El HTML anterior decía «septiembre 2025 – noviembre 2026»; ese rango no se pudo comprobar y se quitó del pie.
- La S07 E-Max (eléctrica) no tiene manual en este paquete; sus datos vienen de prensa.

**Resultado global:** 103 tips revisados → **108 tips** (5 nuevos), de los cuales **16 son «Manual oficial»**, 47 «consenso», 44 «reporte» y 1 «en disputa». Cada tip muestra ahora su fuente y, cuando hubo cambios, una nota «✔ Verificación».

## 2. Correcciones importantes

| # | Tema | Decía el HTML | Dice ahora | Fuente |
|---|---|---|---|---|
| 1 | Presión llantas **S07** | 41–42 PSI | **2,7 bar = 39 PSI** adelante y atrás; atrás 2,9 bar (42 PSI) solo con carga completa | Manual S07, PDF p. 242 |
| 2 | Química batería **S07** | «S07 usa NMC» (toda) | **S07 Max = LFP 31,73 kWh** (como la S05); solo la **S07 E-Max = NCM 79,47 kWh** | Manual S07 p. 242; El Carro Colombiano; Xataka |
| 3 | Medidor vs. pantalla | «Usa tu medidor como referencia» | **La referencia es el TPMS de la pantalla** | Manual S07 p. 227 |
| 4 | Bajadas con batería llena | (no estaba) | **Con 100 % no hay freno regenerativo en bajada.** Salir con 90–95 % si el viaje empieza bajando | Manual S07 p. 15 + 1 propietario |
| 5 | «100 % la noche antes del viaje» | Sin matiz | Mismo tip + advertencia del punto 4 | Manual S07 p. 15 |
| 6 | Calendario de revisiones | 1.000, 5.000 y cada 10.000 km | Por **km o meses, lo que ocurra primero**: 5.000 km/6 meses, luego cada 10.000 km/12 meses | Manual S07 p. 203 |
| 7 | Qué se hace en cada revisión | Reductor a los 5.000 km | Manual S07: **aceite y filtro del motor a gasolina en cada revisión**, bujías cada 20.000, reductor a los 10.000 y luego cada 60.000, líquido de frenos a los 45.000. Vardí cambia el reductor a los 5.000 (práctica del taller) | Manual S07 p. 203–205 + chat |
| 8 | Llanta de repuesto | «Resolución» | Es una **circular del MinTransporte (2017)**; la regla general es la Ley 769 de 2002, art. 30. Número exacto por confirmar | Vanguardia, 17-jul-2025 |
| 9 | «La dona de la S07 sirve en la S05» | Afirmación | **Retirada** (sin respaldo; el manual pide llantas del mismo tamaño por el ABS) | Manual S07 p. 226 |
| 10 | Carga de aparcamiento S07 | «La S07 no la tendría» | **En disputa:** un dueño de S07 Max la ubica en Conducción; el manual no la documenta | Chat |
| 11 | Kit de pinchazo | Toma 12 V solo en el baúl | S07 tiene además **toma de 12 V en el apoyabrazos** (120 W máx.); el compresor trabaja máx. 10 min seguidos; sellante de un uso, revisar vencimiento; solo para huecos de menos de 6 mm en la banda | Manual S07 p. 47, 223 |
| 12 | Carga rápida REEV | 70 kW | Reportes de **50 a 80 kW** según la electrolinera | Chat |
| 13 | Amperaje | 8/13 A (sin modelo) | 8/13 A es la **S05**; la S07 viene en 32 A ajustable; enchufe doméstico de al menos 16 A | Manual S07 p. 199 |
| 14 | Modos de energía S07 | Nombres de la S05 | Tip nuevo: **Urbano / Alta velocidad / Montaña** y «Memoria de gestión de energía» (si está apagada, vuelve a Urbano al encender) | Manual S07 p. 113 |
| 15 | Grúa | Solo «de plataforma» | + **Modo de remolque** en la pantalla (pasa a N y suelta el freno; hacerlo en plano) | Manual S07 p. 231–233 |
| 16 | Guardar el carro mucho tiempo | (no estaba) | Tip nuevo: ≥40 % de batería, no más de 7 días por debajo de 20 %, desconectar la 12 V si pasa de un mes | Manual S07 p. 207 |
| 17 | Alerta de colisión frontal | «Desactivarlo es decisión de cada quien» | «En tarde» reduce falsas alarmas; apagar el frenado automático quita protección; si persiste, garantía | Criterio de seguridad |

### Directorio
- Fijos de Bogotá con el formato viejo (`+57 1 …`) pasados al actual **`+57 601 …`** (Deepal Salitre, Foxcol).
- **Evectric:** el número tenía un dígito de menos; se dejó solo la web.
- 5 duplicados unidos (mismo número y servicio: Héctor/PDR Colombia, Diamantados JE/JR, Soena, Sanlu, Luis Hincapié).
- Muchos números se confirmaron contra las tarjetas `.vcf` del chat; los demás quedan como estaban.

## 3. Revisión con 7 árbitros adversariales

Cada árbitro atacó la app y los datos desde su especialidad. Abajo, lo que encontró y cómo quedó.

| Árbitro | Pregunta con la que atacó | Hallazgos | Estado |
|---|---|---|---|
| **1. Experto en Changan / Deepal** | «¿Cada cifra corresponde al modelo y a la versión correctos?» | Batería S07 mal atribuida; presión S07; nombres de modos S05 usados para la S07; la toma de 12 V delantera existe solo en la S07 | ✅ Corregido (puntos 1, 2, 11, 14) |
| **2. Experto en talleres Vardí (Colombia)** | «¿Lo que dice el manual coincide con lo que de verdad hace el taller?» | El taller cambia el reductor a los 5.000 km aunque el manual dice 10.000; la revisión de 1.000 km es de Vardí, no del manual; las S07 se actualizan en el taller; fijos con indicativo viejo | ✅ Corregido; se distinguen «manual» y «práctica del taller» |
| **3. Experto en vehículos en general** | «¿Algún tip puede causar un accidente o un daño?» | Bajadas al 100 % sin regeneración; dona de otro modelo; consejo de apagar el AEB; medidor del compresor por encima del TPMS | ✅ Corregido (puntos 4, 5, 9, 17, 3) |
| **4. Experto en UI/UX** | «¿Una persona encuentra la respuesta en el celular, con una mano, sin conexión?» | Cabecera fija que ocupaba un tercio de la pantalla; búsqueda que no toleraba errores ni sinónimos; sin aviso de mínimo de letras; pestañas lejos del pulgar | ✅ Solo la barra de búsqueda queda fija; pestañas abajo en celular; búsqueda desde 3 letras con sinónimos, prefijos y errores de digitación; modo oscuro; botones de 44 px |
| **5. Protección de datos (Ley 1581) y seguridad web** | «¿Qué dato personal puede terminar publicado o en una IA?» | El chat tiene 363 participantes con teléfono; el directorio publica celulares de personas naturales; riesgo de inyección de código en respuestas de IA | ✅ El chat se procesa solo en el navegador y se anonimiza (teléfonos, correos, placas, menciones, nombres de autores, documentos); `.gitignore` bloquea subir chats; respuestas de IA escapadas; CSP; llaves solo en el navegador. ⚠️ **Decisión pendiente:** ver punto 4 |
| **6. Ingeniero de integración de IA** | «¿Qué pasa con un 429, un 401 y un modelo retirado?» | — | ✅ La cascada distingue cuota (espera), llave inválida (salta proveedor), caída/red (salta) y modelo retirado (prueba otro modelo). Probado con 9 pruebas automáticas. La IA solo puede citar tips que existen; la que redacta tips nunca puede marcarlos «oficial» |
| **7. Normativa colombiana (tránsito, tributaria, eléctrica)** | «¿Cada norma citada existe y está vigente?» | «Resolución» de llanta de repuesto era circular; fechas UPME 2026 solo confirmadas a medias; Concepto DIAN 9040 con un solo reporte; RETIE bien citado | ✅ Corregido y marcado con nota de verificación |

### Pruebas automáticas que respaldan la revisión
- **27 pruebas unitarias** (`npm test`): buscador, datos, anonimizador, lector de ZIP, cascada de IA y fusión de cambios.
- **21 pruebas en navegador real** (`node tests/navegador.mjs`, celular y escritorio): búsqueda en vivo, filtros, enlace directo, directorio, preguntas con y sin IA, intento de inyección de código, panel de administrador (sin fugas de datos personales), funcionamiento **sin conexión**, manifiesto e íconos, cero errores de consola.
- **Mutaciones:** se dañó el código a propósito (mínimo de letras, anonimizador, cascada, aprobación de IAs) y las pruebas lo detectaron en todos los casos.

## 4. Decisiones que quedan en manos del administrador

1. **Celulares de personas naturales en el directorio** (asesores, abogadas, técnicos). Se compartieron en un grupo privado; publicarlos en una página abierta es otro uso. Recomendación: pedirles permiso o activar `"ocultarPersonasNaturales": true` en `config/sitio.json`.
2. **Crédito a Miguel:** en el chat se menciona «el manual práctico de la comunidad que subió Miguel». Si ese contenido es la base del HTML, conviene darle crédito junto a Alejandro Urreta.
3. **Confirmar con el taller** los datos de la S05 que solo vienen del chat (41 PSI, menú de amperaje, reinicio con joystick).
4. **Aprobar las IAs de pago** (ver `IAS.md`).

## 5. Revisión de la versión v01.01 (logo y versionado)

> **Autorrevisión, no independiente:** los perfiles los aplicó quien hizo los cambios, en una pasada aparte, con pruebas que se corrieron de verdad.

| Perfil | Ataque | Hallazgo | Gravedad | Estado |
|---|---|---|---|---|
| Ingeniería de sistemas | «Si solo cambia `js/version.js`, ¿todos los celulares se enteran?» | Safari y la caché HTTP de GitHub Pages (10 min) podían dejar el service worker viejo o guardar archivos viejos en la copia sin conexión | Alta | ✅ `sw.js?v=VERSION` con `updateViaCache: 'none'` y `cache: 'reload'` al instalar |
| Usuario sin experiencia | «¿Sabe qué versión tiene y qué subir?» | — | — | ✅ Versión al pie; `LEEME.md` con la lista exacta de archivos; `PUBLICAR.md` parte 10 |
| Diseño e interacción | Cabecera en 390/820/1024/1280/1440 px, claro y oscuro | En 390 px la aclaración «no oficial» se cortaba; en oscuro el logo gris perdía contraste | Media | ✅ Texto en dos líneas en el celular; logo aclarado en oscuro |
| Seguridad y privacidad | «¿El SVG puede ejecutar código? ¿Hay datos reales en la entrega?» | SVG sin scripts ni enlaces externos, verificado por huella SHA-256; los datos de prueba son ficticios | — | ✅ Adecuado |
| Release manager | «¿El ZIP limpio corre todo en verde?» | — | — | ✅ Ver LEEME |
| Gestión de configuración | «¿Queda otra cadena de versión suelta?» | Un comentario en `js/app.js` traía el número completo | Baja | ✅ Quitado; el árbitro lo revisa en cada corrida |
| Marca (Changan/Deepal) | «¿El logo hace pasar la app por oficial?» | El logo va junto a «Manual práctico» y «no oficial»; el aviso del pie aclara que la marca es de su titular; el ícono de la app instalada sigue siendo genérico | Media | ✅ Mitigado; ver decisión 5 |

### Decisión adicional para el administrador
5. **Ícono de la app instalada:** sigue siendo el genérico (libro con rayo). Ponerle el logo de Deepal haría que en la pantalla del celular parezca la app oficial de la marca; por eso no se cambió sin consultarte.

## 6. Revisión de la versión v02 (rediseño): árbitros de UI/UX y de diseño gráfico

> **Autorrevisión, no independiente:** los dos árbitros los aplicó quien hizo el rediseño, en una pasada aparte, con capturas reales en 5 anchos (390, 820, 1024, 1280 y 1440 px), en claro y oscuro, y con el script `tests/arbitro-v02-00.mjs`.

**Pregunta del árbitro de UI/UX:** «¿La persona encuentra su respuesta más rápido y con menos ruido que antes, con una mano, de día o de noche?»
**Pregunta del árbitro de diseño gráfico:** «¿Cada elemento visual pertenece a un mismo sistema (color, tipo, trazo) y hay un solo protagonista?»

| Árbitro | Hallazgo (verificado en captura o prueba) | Gravedad | Estado |
|---|---|---|---|
| Diseño gráfico | Emojis de distintos estilos en categorías, pestañas y panel de admin: rompían la sobriedad y se veían distinto en cada celular | Alta | ✅ Set propio de íconos SVG de 1,25 px; ningún emoji en la interfaz (lo revisa el árbitro) |
| Diseño gráfico | Fuente del sistema: la app se veía distinta en cada equipo y sin personalidad | Media | ✅ Archivo alojada en la app; titular ancho que dialoga con el logotipo |
| Diseño gráfico | Acento ámbar con contraste 4,2:1 sobre el fondo claro (bajo AA) | Media | ✅ Ámbar ajustado a #8F5B10 (4,9:1) |
| UI/UX | En el celular, el tablero de categorías y la fila de pestañas mostraban lo mismo dos veces | Media | ✅ Las pestañas se ocultan mientras se ve el tablero |
| UI/UX | Filtros de modelo y motor en dos filas en el celular | Baja | ✅ Una sola fila deslizable |
| UI/UX | Al buscar, el titular grande empujaba los resultados hacia abajo | Media | ✅ El titular se recoge con transición al escribir |
| UI/UX | El total aparecía repetido («108 tips» en la línea y en texto) | Baja | ✅ Solo en la línea de energía; el lector de pantalla lo sigue escuchando |
| UI/UX | En el computador, el directorio quedaba apretado en la columna del riel | Alta | ✅ Corregido antes de entregar; el árbitro mide el ancho del contenido |
| UI/UX | El tema seguía al del sistema; el administrador pidió claro por defecto | Media | ✅ Claro por defecto, botón para oscuro, se recuerda |

**Revisado y correcto:** contraste AA de texto principal (13,9:1), secundario (≥ 5,3:1) y acento en ambos temas; áreas de toque de 44 px en pestañas, botones y tablero; sin desbordamiento horizontal en los 5 anchos; foco visible en ámbar; «reducir movimiento» apaga todas las transiciones; transiciones de apertura y cambio de sección solo en respuesta a una acción, salvo la carga inicial de la línea de energía (el único movimiento automático); créditos completos en el pie y en la ventana, que se cierra con Escape.

**Sugerencias que no se aplicaron (decide el administrador):**
- Usar el logo de Deepal como ícono de la app instalada (ver decisión 5).
- Agregar fotos propias de los carros del grupo en la portada. Requiere permiso de los dueños y aumentaría el peso de la app.
