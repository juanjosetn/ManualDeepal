# Cómo publicar el Manual Deepal en GitHub (paso a paso, desde cero)

Esta guía es para quien **nunca ha usado GitHub**. No necesitas instalar nada: todo se hace desde el navegador (Chrome o Edge en un computador).
Tiempo estimado: 20 a 30 minutos la primera vez.

> **Qué vas a lograr:** que el manual quede en una dirección como `https://tu-usuario.github.io/manual-deepal/`, que cualquiera del grupo pueda abrir e **instalar como app** en su celular. Es gratis.

**Dos palabras que verás mucho:**
- **Repositorio (repo):** una carpeta en internet donde GitHub guarda los archivos de tu proyecto y recuerda cada cambio.
- **Commit:** «guardar un cambio» con una nota que explica qué cambiaste. GitHub guarda la historia de todos los commits, así que siempre puedes volver atrás.

---

## Parte 1 · Crear tu cuenta (una sola vez)

1. Entra a **https://github.com/signup**.
2. Escribe tu correo, una contraseña y un **nombre de usuario**. Elígelo bien: va a ser parte de la dirección del manual (por ejemplo, con el usuario `deepalclubco` la dirección queda `deepalclubco.github.io`). Usa solo minúsculas, números y guiones.
3. Resuelve la verificación y escribe el código que te llega al correo.
4. Cuando te pregunte por un plan, escoge **Free** (gratis).
5. **Activa la verificación en dos pasos.** GitHub la exige. Ve a tu foto (arriba a la derecha) › **Settings** › **Password and authentication** › **Enable two-factor authentication**, y usa una app como Google Authenticator. Guarda los «recovery codes» en un lugar seguro.

## Parte 2 · Preparar los archivos en tu computador

1. Descarga el ZIP que te entregué (`manual-deepal.zip`).
2. Haz clic derecho › **Extraer todo** (Windows) o doble clic (Mac). Te queda una carpeta `manual-deepal`.
3. Ábrela. Debes ver `index.html`, `manifest.webmanifest`, `sw.js` y las carpetas `css`, `js`, `data`, `config`, `icons` y `tests`.

> ⚠️ **Nunca subas el chat de WhatsApp** (`.txt` o `.zip`) a GitHub. El repositorio es **público**: cualquiera puede ver lo que subes. El chat se procesa en el panel de administrador, solo dentro de tu navegador.

## Parte 3 · Crear el repositorio

1. En GitHub, haz clic en el **+** (arriba a la derecha) › **New repository**.
2. **Repository name:** `manual-deepal`.
3. **Description** (opcional): `Manual práctico de la comunidad Deepal Colombia`.
4. Marca **Public**. (Con la cuenta gratuita, GitHub Pages solo publica repositorios públicos.)
5. **No** marques «Add a README file» ni ninguna otra casilla.
6. Clic en **Create repository**.

## Parte 4 · Subir los archivos

1. En la página del repositorio vacío verás el texto «Quick setup». Busca y haz clic en el enlace **uploading an existing file**.
2. Abre la carpeta `manual-deepal` en tu computador, **selecciona todo su contenido** (Ctrl+A en Windows, Cmd+A en Mac) y **arrástralo** al recuadro de GitHub.
   - Arrastra lo que está **dentro** de la carpeta, no la carpeta misma. Si arrastras la carpeta, `index.html` queda en `manual-deepal/index.html` y la página no abre.
   - En Mac, los archivos que empiezan por punto (`.nojekyll`, `.gitignore`) están ocultos. Presiona **Cmd + Shift + .** para verlos. Si no los subes no pasa nada grave.
3. Espera a que termine la barra de carga (son unos 30 archivos).
4. Abajo, en **Commit changes**, escribe: `Primera versión del manual`.
5. Clic en **Commit changes**.
6. **Comprueba:** en la página principal del repositorio debe verse `index.html` directamente, junto a las carpetas `css`, `js`, `data`…

## Parte 5 · Activar GitHub Pages (la publicación)

1. En el repositorio, clic en **Settings** (la tuerca, en la barra de arriba del repositorio).
2. En el menú de la izquierda, clic en **Pages**.
3. En **Build and deployment › Source**, elige **Deploy from a branch**.
4. En **Branch**, elige **main** y la carpeta **/ (root)**. Clic en **Save**.
5. Espera de 1 a 3 minutos y recarga esa página. Arriba aparece: **«Your site is live at https://tu-usuario.github.io/manual-deepal/»**.
6. Abre ese enlace. ¡Ya está publicado!

> Si sale un error 404: espera dos minutos más. Si sigue, revisa que `index.html` esté en la raíz del repositorio (Parte 4, paso 6).
> En la pestaña **Actions** del repositorio puedes ver el avance de cada publicación (círculo amarillo = trabajando, chulo verde = listo).

## Parte 6 · Personalizar los datos del sitio

1. En el repositorio, entra a la carpeta **config** y abre **sitio.json**.
2. Clic en el **lápiz** (Edit this file).
3. Cambia lo que necesites. Respeta las comillas y las comas:
   - En `"github"`, pon tu usuario y el nombre del repositorio: `"usuario": "tu-usuario", "repositorio": "manual-deepal"`.
   - En `"creditos"` puedes poner tu nombre en «Administración y actualizaciones». **No quites el crédito de Alejandro Urreta.**
   - `"ocultarPersonasNaturales": true` oculta del directorio los números de personas (asesores, abogadas…) y deja solo empresas. Mira la nota de privacidad en `VERIFICACION.md`.
4. Clic en **Commit changes…** › escribe una nota › **Commit changes**.
5. En 1 a 3 minutos el sitio se actualiza solo.

## Parte 7 · Instalar la app en el celular

- **Android (Chrome):** abre el enlace › menú ⋮ › **Instalar aplicación** (o «Agregar a pantalla principal»).
- **iPhone (Safari):** abre el enlace › botón **Compartir** (cuadrado con flecha) › **Agregar a inicio**.
- **Computador (Chrome/Edge):** aparece el botón **Instalar app** arriba, o el ícono de instalar en la barra de direcciones.

Después de abrirla una vez con internet, la app funciona **sin conexión** (en un parqueadero subterráneo, por ejemplo).

Comparte el enlace en el grupo de WhatsApp: se ve con título y descripción.

## Parte 8 · Agregar tips nuevos desde el chat (rutina del administrador)

Cada cierto tiempo (por ejemplo, una vez al mes):

1. **Exporta el chat** desde WhatsApp: entra al grupo › ⋮ (o el nombre del grupo en iPhone) › **Más** › **Exportar chat** › **Sin archivos**. Guárdalo en tu computador.
2. Abre el manual publicado y agrega `#admin` al final de la dirección: `https://tu-usuario.github.io/manual-deepal/#admin` (también está el enlace «Administrar» al pie de la página).
3. En el **paso 1** del panel, sube el `.zip` o el `.txt`. El panel muestra cuántos mensajes leyó y desde qué fecha falta procesar.
4. En el **paso 2** aparecen las conversaciones que podrían convertirse en tips. Para cada una:
   - **Ver conversación anonimizada:** lees el hilo sin nombres ni teléfonos.
   - **Redactar con IA:** la IA te propone el tip (necesitas tener una IA activa en «Preguntar › Ajustes de IA»).
   - **Redactar a mano:** llenas tú el formulario.
   - **Actualizar el tip parecido:** si ya existe un tip sobre el tema, lo editas.
   - Revisa siempre lo que propone la IA. Marca **«oficial»** solo si lo comprobaste en el manual del fabricante.
5. En el **paso 3** puedes agregar al directorio los contactos (.vcf) que compartieron, si aceptarían aparecer en una página pública.
6. En el **paso 5** ves los cambios pendientes. Para publicarlos tienes dos caminos:

**Camino A (sin token, más sencillo):**
1. Clic en **Descargar tips.json** (y en **Descargar directorio.json** si agregaste contactos).
2. En GitHub, entra a la carpeta **data** › **Add file** › **Upload files**.
3. Arrastra el `tips.json` descargado. GitHub reemplaza el anterior.
4. **Commit changes**. En 1 a 3 minutos el manual está actualizado para todos.

**Camino B (un clic, con token):**
1. En GitHub: tu foto › **Settings** › **Developer settings** (al final del menú) › **Personal access tokens** › **Fine-grained tokens** › **Generate new token**.
2. **Token name:** `manual-deepal`. **Expiration:** 30 días.
3. **Repository access:** **Only select repositories** › elige `manual-deepal`.
4. **Permissions › Repository permissions › Contents:** **Read and write**. Nada más.
5. **Generate token** y copia el código (empieza por `github_pat_`). GitHub no lo vuelve a mostrar.
6. En el panel de administrador, abre **Publicar directo en GitHub**, llena usuario, repositorio, `main` y pega el token. Clic en **Publicar cambios**.
7. El token no se guarda en ninguna parte. No lo compartas por WhatsApp. Si se te filtra, bórralo en la misma página de GitHub.

## Parte 9 · Aprobar IAs

En el panel de administrador, **paso 6**, marca las IAs que quieres ofrecer, **Descargar ia.json** y súbelo a la carpeta **config** igual que en el Camino A. La lista con lo que implica cada una está en `IAS.md`.

## Parte 10 · Subir una versión nueva del código

Si te entrego archivos nuevos de `js`, `css` o `index.html`:
1. Súbelos a su carpeta con **Add file › Upload files**.
2. Abre `sw.js` con el lápiz y cambia la línea `const VERSION = '…'` (por ejemplo `'2026.12.05-1'`). Así los celulares saben que hay versión nueva y muestran el aviso **«Actualizar»**.
3. **Commit changes**.

## Problemas frecuentes

| Problema | Solución |
|---|---|
| Error 404 al abrir el enlace | Espera 3 minutos. Revisa que `index.html` esté en la raíz y que Pages esté en **main / (root)**. |
| El celular muestra la versión vieja | Cierra la app y ábrela de nuevo; aparecerá «Actualizar». Los datos (tips) se actualizan solos al abrir con internet. |
| «No se pudieron cargar los datos» | Algún `.json` quedó mal escrito (falta una coma o una comilla). En GitHub abre el archivo y, en **History**, vuelve a la versión anterior. |
| El botón «Instalar app» no aparece | En iPhone se instala desde Compartir › Agregar a inicio. En Android, desde el menú ⋮. |
| La IA dice «No hubo conexión» | Ese proveedor no permite llamadas desde páginas web (CORS) o no hay internet. Usa otra en Ajustes de IA. |

## Ver el sitio en tu computador antes de publicar (opcional)

Si tienes Python instalado, abre una terminal en la carpeta `manual-deepal` y escribe:

```
python -m http.server 8080
```

Luego abre `http://localhost:8080` en el navegador. (Abrir `index.html` con doble clic no funciona del todo: los navegadores bloquean la lectura de los `.json` desde archivos locales.)
