// =====================================================================
// tema.js — Tema claro (predeterminado) u oscuro.
// Corre en el <head>, ANTES de pintar, para que la página no "parpadee"
// cuando la persona eligió el tema oscuro. La elección se recuerda en
// ese navegador. El botón está en js/app.js (función conectarTema).
// =====================================================================
(function () {
  var tema = 'claro';
  try { if (localStorage.getItem('deepal-tema') === 'oscuro') tema = 'oscuro'; } catch (e) { /* sin almacenamiento */ }
  document.documentElement.dataset.tema = tema;
})();
