# Registro de cambios

## 2026.11.21 — Versión PWA
- App instalable (PWA) que funciona sin conexión, publicable en GitHub Pages sin compilar nada.
- Búsqueda en vivo desde 3 letras, con sinónimos, prefijos, tolerancia a errores de digitación, resaltado y «¿Quisiste decir…?».
- Tercer nivel de confianza «Manual oficial» y cuarto «En disputa»; cada tip muestra su fuente.
- 17 correcciones y 5 tips nuevos tras verificar contra el manual de la S07 (ver VERIFICACION.md).
- Pestaña «Preguntar»: responde con los tips del manual y, si la persona activa una IA, redacta la respuesta citando los tips.
- 10 IAs gratuitas y 5 de pago en cascada, con aprobación del administrador (IAS.md).
- Panel de administrador (#admin): carga el chat de WhatsApp (.zip o .txt), lo anonimiza, propone conversaciones útiles, redacta tips (a mano o con IA), agrega contactos .vcf y publica en GitHub.
- Diseño responsivo (celular, tableta, computador), modo oscuro, pestañas abajo en el celular, botones de 44 px, compartir un tip por WhatsApp con enlace directo.
- Datos separados del código (data/*.json) y catálogo de modelos editable: agregar un modelo nuevo no exige tocar código.
- 27 pruebas unitarias y 21 en navegador.

## Versión inicial
- Manual en un solo HTML con tips y directorio, por **Alejandro Urreta**.
