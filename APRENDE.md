# Aprende a programar con esta app (desde cero)

Esta guía usa el propio Manual Deepal como libro de texto. Cada lección te dice **qué aprender**, **dónde mirarlo en el código**, un **ejercicio** y **cómo comprobar** que te salió. Todo el código está comentado en español con marcas `LECCIÓN`.

**Lo único que necesitas:**
- Un editor de código gratis: **Visual Studio Code** (code.visualstudio.com).
- Para ver la app en tu computador: la extensión **Live Server** de VS Code (clic derecho en `index.html` › *Open with Live Server*) o `python -m http.server 8080`.
- Para las pruebas automáticas (lección 11): **Node.js** (nodejs.org, versión LTS).

Ve en orden. Cada lección toma de 30 a 60 minutos.

---

## Lección 0 · Cómo está organizado un proyecto web
- **Idea clave:** una página web son tres lenguajes que se reparten el trabajo: **HTML** (estructura), **CSS** (apariencia) y **JavaScript** (comportamiento). Aparte van los **datos** (JSON).
- **Mira:** la lista de carpetas en `README.md`.
- **Ejercicio:** abre cada carpeta y escribe en un papel, con tus palabras, para qué crees que sirve cada archivo.
- **Comprueba:** compara con la tabla del README.

## Lección 1 · HTML: los huesos
- **Idea clave:** las etiquetas (`<header>`, `<main>`, `<button>`) dicen *qué es* cada cosa. El atributo `id` le da un nombre único para que JavaScript la encuentre.
- **Mira:** `index.html`. Fíjate en `<input id="q">` (el buscador) y en las `<section>` de cada vista.
- **Ejercicio:** en el pie (`<footer>`), agrega un párrafo `<p>Hecho con cariño por la comunidad</p>`.
- **Comprueba:** recarga la página; tu texto aparece abajo.

## Lección 2 · CSS: la ropa
- **Idea clave:** un *selector* (`.boton`, `#q`) escoge elementos y les aplica reglas. Las *variables* (`--ambar`, `--niebla`) guardan un color en un solo lugar: es el «sistema de diseño» de la app. `@media` cambia el diseño según la pantalla (eso es «responsivo»). Un *eje variable* de la fuente (`font-stretch`) la hace más ancha o más angosta sin cargar otra fuente.
- **Mira:** `css/app.css`: el bloque `:root` (tema claro), `:root[data-tema="oscuro"]` (tema oscuro), `.portada h1` (titular ancho, `font-stretch: 125%`) y `@media (max-width: 719px)` (celular).
- **Ejercicio:** cambia `--ambar: #8F5B10;` por otro color (por ejemplo `#2F5DA8`) y `font-stretch: 125%` del titular por `100%`.
- **Comprueba:** la línea de energía, la pestaña activa y el tip abierto cambian de color; el titular se vuelve angosto. Achica la ventana: las pestañas pasan abajo. Devuelve los valores.
- **Extra — íconos SVG:** abre `js/iconos.js`. Cada ícono es un dibujo de pocas líneas en una cuadrícula de 24×24. Cambia `TRAZO` de `1.25` a `2` y mira cómo todos engruesan a la vez: por eso se ven como una familia.

## Lección 3 · JSON: los datos
- **Idea clave:** JSON es texto con una forma estricta: `{ "clave": "valor" }`, listas con `[ ]`, comillas dobles y comas entre elementos. Una coma de más o de menos lo rompe.
- **Mira:** `data/tips.json`. Cada tip tiene `titulo`, `cuando`, `como`, `ojo`, `modelos`, `confianza`, `fuentes`…
- **Ejercicio:** copia un tip completo (desde `{` hasta `},`), pégalo debajo y cámbiale el `id` y el `titulo`.
- **Comprueba:** tu tip aparece en la app. Si la app dice «No se pudieron cargar los datos», pega el archivo en jsonlint.com para encontrar el error.

## Lección 4 · JavaScript básico: variables, funciones y texto
- **Idea clave:** `const` guarda un valor; una *función* recibe datos y devuelve un resultado; un *módulo* exporta funciones con `export` para usarlas con `import`.
- **Mira:** `js/texto.js`, función `normalizar()`: convierte «Presión» en «presion» para comparar sin tildes.
- **Ejercicio:** en la consola del navegador (F12 › Console), escribe:
  `const { normalizar } = await import('./js/texto.js'); normalizar('Ñandú Eléctrico')`
- **Comprueba:** responde `'nandu electrico'`.

## Lección 5 · El DOM y los eventos
- **Idea clave:** el *DOM* es la página vista desde JavaScript. Un *evento* es algo que pasa (escribir, hacer clic) y un *escuchador* (`addEventListener`) ejecuta una función cuando ocurre.
- **Mira:** `js/app.js`, función `conectarEventos()`. Al escribir en el buscador se ejecuta `alEscribir`, que actualiza el *estado* y vuelve a *pintar*.
- **Ejercicio:** cambia `antirrebote(…, 110)` por `antirrebote(…, 1000)`.
- **Comprueba:** ahora los resultados tardan un segundo en aparecer. Eso es el «antirrebote»: esperar a que dejes de escribir. Devuélvelo a 110.

## Lección 6 · Algoritmos: cómo busca el buscador
- **Idea clave:** un *índice invertido* es como el índice alfabético al final de un libro: palabra → páginas donde aparece. La *distancia de edición* cuenta cuántas letras hay que cambiar para pasar de una palabra a otra (así «bateira» encuentra «batería»).
- **Mira:** `js/buscador.js`: `crearBuscador()`, `buscarTermino()` y la lista `GRUPOS` de sinónimos. En `js/texto.js`, `distancia()`.
- **Ejercicio:** agrega un grupo de sinónimos: `'baul maletero cajuela'`.
- **Comprueba:** busca «maletero» y aparecen los tips que dicen «baúl».

## Lección 7 · Programación asíncrona: pedir datos por internet
- **Idea clave:** pedir algo por internet tarda. `fetch()` devuelve una *promesa* (un «te aviso cuando llegue»); `await` espera sin congelar la página. `Promise.all` pide varias cosas a la vez.
- **Mira:** `js/app.js`, función `iniciar()`: carga los 4 archivos JSON en paralelo.
- **Ejercicio:** en F12 › Network, recarga y observa cómo llegan `tips.json`, `directorio.json`… al mismo tiempo.
- **Comprueba:** activa «Offline» en la pestaña Network y recarga: la app sigue funcionando (lección 9).

## Lección 8 · APIs e inteligencia artificial
- **Idea clave:** una *API* es una puerta para que un programa le pida algo a otro. Se le manda un JSON con la pregunta y devuelve otro JSON. La *llave* (API key) identifica quién paga o consume el cupo. La *cascada* intenta otra IA si la primera falla.
- **Mira:** `js/ia.js`: `preguntar()` (la cascada), `clasificar()` (tipos de error: 429 = cupo agotado, 401 = llave mala, 404 = modelo retirado) y `config/ia.json` (el catálogo).
- **Ejercicio:** crea una llave gratis de Gemini (aistudio.google.com/apikey), ponla en *Preguntar › Ajustes de IA* y pregunta algo.
- **Comprueba:** la respuesta dice «Redactado por Google Gemini» y trae enlaces «[ver tip]».

## Lección 9 · PWA: una página que se instala y funciona sin internet
- **Idea clave:** el *manifiesto* (`manifest.webmanifest`) dice nombre, íconos y colores para instalarla. El *service worker* (`sw.js`) es un ayudante que guarda una copia de los archivos y responde cuando no hay internet.
- **Mira:** `js/version.js` (la versión, en un solo lugar) y `sw.js`: la lista `APP`, la estrategia `primeroRed` (para los datos) y `primeroCache` (para el código).
- **Ejercicio:** cambia algo del CSS y sube la versión en `js/version.js` (por ejemplo, de `.00cl` a `.01cl` al final). Mira también cómo `sw.js` la toma con `importScripts`.
- **Comprueba:** con la app abierta, aparece el aviso «Hay una versión nueva… Actualizar».

## Lección 10 · Seguridad y privacidad
- **Idea clave:** nunca pintes en la página un texto ajeno sin *escaparlo* (si no, alguien podría inyectar código: ataque XSS). Nunca publiques llaves. Los datos personales (Ley 1581 de 2012) se anonimizan antes de enviarlos a cualquier servicio.
- **Mira:** `escaparHTML()` en `js/texto.js`; `anonimizar()` en `js/chat.js`; la etiqueta `Content-Security-Policy` en `index.html`.
- **Ejercicio:** lee la prueba «preguntar con IA (simulada) escapa el HTML» en `tests/navegador.mjs`: simula una IA que intenta meter `<img onerror=…>`.
- **Comprueba:** entiende por qué la prueba espera que `#iaRes img` sea 0.

## Lección 11 · Pruebas automáticas
- **Idea clave:** una prueba es un programa que verifica otro. Si un cambio daña algo, la prueba falla antes de que lo note el grupo. Una *mutación* es dañar el código a propósito para ver si las pruebas lo detectan.
- **Mira:** `tests/unidad.test.mjs`, `tests/ia.test.mjs`, `tests/admin.test.mjs`.
- **Ejercicio:** en la terminal, en la carpeta del proyecto: `npm test`. Luego cambia en `js/buscador.js` `MIN_LETRAS = 3` por `2` y vuelve a correr `npm test`.
- **Comprueba:** con 3 pasan todas; con 2 falla «menos de 3 letras no busca». Devuélvelo a 3.

## Lección 12 · Git y GitHub
- **Idea clave:** Git guarda la historia de cada cambio (*commit*). GitHub es el sitio donde vive esa historia y, con GitHub Pages, publica la página.
- **Mira:** `PUBLICAR.md`.
- **Ejercicio:** edita en GitHub `config/sitio.json` y cambia el texto del rol de alguno de los créditos.
- **Comprueba:** en la pestaña *History* del archivo ves tu commit; en 2 minutos el sitio muestra tu nombre.

---

### Lo que viene después
Cuando domines estas lecciones: un servidor propio para que el club pague una IA sin exponer la llave (Cloudflare Workers o Google Apps Script), y la sección de foro que describe el proyecto «Página web Deepal Club».
