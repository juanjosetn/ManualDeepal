// =====================================================================
// version.js — ÚNICO lugar donde se escribe la versión de la app.
// Formato vXX.YY.ZZcl:
//   XX = rediseño o cambio que rompe los datos
//   YY = funciones nuevas o correcciones de fondo
//   ZZ = ajustes menores
// La usan: el pie de la página (js/app.js) y el service worker (sw.js),
// que guarda la copia sin conexión con este nombre. Al cambiarla, los
// celulares detectan la versión nueva y muestran «Actualizar».
// LECCIÓN: es un script clásico (no módulo) para que también lo pueda
// cargar el service worker con importScripts().
// =====================================================================
self.APP_VERSION = 'v02.05.00cl';
