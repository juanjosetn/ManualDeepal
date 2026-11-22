# Estrellas, opiniones y «Quiero aparecer»: cómo encenderlos (paso a paso)

El manual es una página estática: GitHub solo entrega archivos, no puede guardar lo que la gente escribe.
Para guardar estrellas, opiniones y solicitudes usamos **una hoja de Google y un pequeño programa en
Apps Script** pegado a esa hoja. Es gratis y lo controlas tú.

Mientras no hagas estos pasos, el manual funciona igual que antes: simplemente no muestra estrellas ni el
botón «Quiero aparecer en el directorio».

Tiempo: unos 20 minutos, una sola vez.

---

## Antes de empezar: ¿con qué cuenta de Google?

Usa una cuenta **Gmail normal**, mejor una creada para el club (por ejemplo, `deepalclubco@gmail.com`),
con verificación en dos pasos activada. Así la hoja no depende de tu correo personal y la pueden
heredar otros administradores.

No uses la cuenta del colegio ni otra cuenta de Google Workspace: muchas organizaciones bloquean que
una aplicación quede abierta a «cualquier usuario», y el manual necesita exactamente eso.

---

## Parte 1 · Crear la hoja y pegar el programa

1. Entra a <https://sheets.new> con la cuenta del club. Se abre una hoja en blanco.
2. Ponle nombre arriba a la izquierda: **Manual Deepal · Comunidad**.
3. En el menú: **Extensiones › Apps Script**. Se abre el editor en otra pestaña.
4. A la izquierda verás el archivo `Código.gs`. Borra todo lo que tiene y pega **todo** el contenido de
   `apps-script/Codigo.gs` (ábrelo en tu computador con el Bloc de notas, `Ctrl+A`, `Ctrl+C`).
5. Muestra el archivo de configuración: engranaje **Configuración del proyecto** (a la izquierda) ›
   marca **«Mostrar el archivo de manifiesto "appsscript.json" en el editor»**.
6. Vuelve a **Editor** (ícono `< >`), abre `appsscript.json`, borra su contenido y pega el de
   `apps-script/appsscript.json`.
7. Guarda con el ícono del disquete (o `Ctrl+S`).

## Parte 2 · Configurar (crea las pestañas y tu clave)

1. Arriba, en la lista de funciones, elige **configurar** y pulsa **Ejecutar**.
2. Google pide permiso. Pulsa **Revisar permisos**, elige la cuenta del club.
   - Si aparece «Google no ha verificado esta aplicación», pulsa **Configuración avanzada › Ir a
     Manual Deepal (no seguro)**. Es tu propio programa; el aviso sale porque Google no lo ha revisado.
   - Marca **todas** las casillas de permisos. Si desmarcas una, la app fallará.
     Los permisos son: ver y editar **solo esta hoja**, mostrar ventanas en la hoja y enviarte correo.
3. Vuelve a la pestaña de la hoja: verás una ventana que pide la **clave de administración**.
   Escribe una clave larga (mínimo 12 caracteres), por ejemplo una frase: `rines-plateados-en-la-lluvia`.
   **Anótala en un lugar seguro.** No se guarda en ningún lado: solo su «huella» (un resumen que no se
   puede devolver a la clave). Si la olvidas, vuelve a ejecutar **configurar** y pon una nueva.
4. Luego pide un **correo para avisos** (opcional): te llega un correo cada vez que alguien pide
   aparecer en el directorio.
5. La hoja ahora tiene dos pestañas: **CALIFICACIONES** y **SOLICITUDES**. No cambies el nombre ni el
   orden de sus columnas.

## Parte 3 · Publicar el programa (implementar)

1. En el editor de Apps Script: botón azul **Implementar › Nueva implementación**.
2. Engranaje junto a «Seleccionar tipo» › **Aplicación web**.
3. Llena así:
   - Descripción: `Comunidad v1`
   - Ejecutar como: **Yo** (la cuenta del club)
   - Quién tiene acceso: **Cualquier usuario** (en inglés, *Anyone*)
4. **Implementar**. Copia la **URL de la aplicación web**: termina en `/exec`
   y se ve así: `https://script.google.com/macros/s/AKfy…larguísimo…/exec`.

## Parte 4 · Conectar el manual

1. En tu computador abre `config/sitio.json` con el Bloc de notas.
2. Busca `"servicio": ""` y pega la dirección entre las comillas:

   ```json
   "comunidad": {
     "servicio": "https://script.google.com/macros/s/AKfy…/exec",
     "umbralBajo": 2,
     "minimoParaBajar": 3,
   ```

3. Guarda y súbelo a GitHub como siempre (PUBLICAR.md, parte 10: arrastra el archivo a la carpeta
   `config` del repositorio y confirma).
4. Abre el manual, pestaña **Directorio**. Debe aparecer el botón **«Quiero aparecer en el directorio»**
   y, en cada ficha, una estrella para calificar. Si no aparece, recarga la página dos veces (la app
   guarda una copia para funcionar sin internet).

La dirección `/exec` no es secreta: cualquiera la puede ver en el manual. No pasa nada: solo acepta
calificaciones y solicitudes, con límites por hora, y lo de administración exige tu clave.

---

## Cómo se usa en el día a día

### Lo que ven los propietarios
- **Estrella en cada ficha:** abre un formulario corto (de 1 a 5 estrellas, «¿lo recomiendas?» y una
  opinión opcional). Las estrellas cuentan de inmediato; **el texto se publica solo cuando tú lo apruebas**.
- **Las calificaciones de 1 estrella no cuentan.** Se reciben y quedan en la hoja para que las leas (pueden
  avisarte de un problema real), pero no entran al promedio, al orden ni a «Calificación baja», y su texto
  no se publica. El visitante no ve diferencia: a todos se les dice «Recibimos tu calificación».
  La regla está en `apps-script/Codigo.gs`, en la línea `var ESTRELLAS_MINIMAS_QUE_CUENTAN = 2;`.
- Cada celular califica una vez por negocio. Si vuelve a calificar, reemplaza la anterior.
- **Orden:** ciudades plegables → tipo de servicio → los mejor calificados arriba.
- **Calificación baja:** un negocio con promedio de **2 o menos** y al menos **3 calificaciones** pasa a una
  sección plegada al final. Si mejora, vuelve solo a la lista principal. Los números se cambian en
  `config/sitio.json` (`umbralBajo`, `minimoParaBajar`).
- **«Quiero aparecer en el directorio»:** formulario con negocio, servicio, ciudad, WhatsApp, web y
  descripción, con autorización para publicar los datos (Ley 1581 de 2012).

### Lo que haces tú (panel `#admin`, paso 6)
1. Abre `https://TU-USUARIO.github.io/ManualDeepal/#admin`.
2. En **«6. Opiniones, calificaciones y solicitudes»** escribe tu clave y pulsa **Ver pendientes**.
3. Opiniones: **Publicar**, **Quitar solo el texto** (las estrellas siguen contando) o **Rechazar todo**
   (ni texto ni estrellas). Rechaza ofensas, datos personales y publicidad disfrazada.
   Las de **1 estrella** dicen «no cuenta ni se publica» y solo tienen el botón **Archivar** (léelas y archívalas).
4. Solicitudes: revisa el servicio y la ciudad, y pulsa **Agregar al directorio**. El contacto queda en
   **cambios pendientes** (paso 5) para publicarlo junto con lo demás. Antes, si quieres, escríbele al
   WhatsApp para verificar que es real.
5. **En «Calificación baja»:** pulsa **Revisar calificaciones**. Si ves muchas de 2 estrellas el mismo día
   y a la misma hora, puede ser una sola persona: usa **No contar** en las sospechosas.

Cinco intentos con clave equivocada bloquean el panel 15 minutos.

### Responder a quien pide que lo retiren
Cualquier negocio puede pedir que borren sus datos (Ley 1581). Quítalo de `data/directorio.json`, y en la
hoja borra sus filas de SOLICITUDES y CALIFICACIONES. Ojo: el **historial de versiones** de Google Sheets
guarda copias; si te lo exigen, bórralas en **Archivo › Historial de versiones**.

---

## Si actualizas el programa más adelante

Cuando una versión nueva del manual traiga cambios en `apps-script/Codigo.gs`:

1. Pega el código nuevo en el editor y guarda.
2. **Implementar › Gestionar implementaciones** › lápiz de la implementación actual ›
   Versión: **Nueva versión** › **Implementar**.

Así **la dirección `/exec` no cambia** y no tienes que tocar `config/sitio.json`.
Si haces «Nueva implementación» en vez de editar la existente, te da otra dirección y tendrías que
cambiarla en el manual.

## Problemas frecuentes

| Lo que ves | Qué hacer |
|---|---|
| No aparece la estrella ni «Quiero aparecer» | Revisa que la dirección en `config/sitio.json` termine en `/exec`, que el archivo esté subido y recarga dos veces. |
| «Falta ejecutar configurar» | Parte 2: ejecuta `configurar` y pon la clave. |
| «Clave incorrecta» | Escríbela de nuevo (distingue mayúsculas). Si la olvidaste, vuelve a ejecutar `configurar`. |
| «Has hecho muchas solicitudes seguidas» | Es el freno contra abusos; espera hasta una hora (un día, para solicitudes de aparecer). |
| Todo falla después de cambiar el código | Te faltó «Gestionar implementaciones › Nueva versión» (sección anterior). |
| «Se necesita autorización» | Ejecuta `configurar` otra vez y marca todas las casillas de permisos. |
