// =====================================================================
// iconos.js — Set propio de íconos SVG de trazo fino.
// LECCIÓN: un SVG es un dibujo hecho con instrucciones (líneas, círculos,
// curvas). No se pixela a ningún tamaño y toma el color del texto
// (currentColor). Todos usan la misma rejilla de 24×24 y el mismo grosor
// de trazo: eso es lo que hace que se vean como una familia.
// =====================================================================

/** Grosor del trazo, igual para todos los íconos. */
export const TRAZO = 1.25;

const P = {
  // Navegación y acciones
  buscar: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  cerrar: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  flecha: '<path d="m9.5 6 6 6-6 6"/>',
  libro: '<path d="M12 6.6C10 5 7 4.6 4 5.1v13c3-.5 6-.1 8 1.5 2-1.6 5-2 8-1.5v-13c-3-.5-6-.1-8 1.5Z"/><path d="M12 6.6v13"/>',
  contactos: '<rect x="4.5" y="3.5" width="15" height="17" rx="2"/><circle cx="12" cy="10" r="2.6"/><path d="M8 17c.8-1.9 2.2-2.9 4-2.9s3.2 1 4 2.9"/>',
  conversar: '<path d="M5.5 5h13a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H12l-4.5 3.5V16h-2A1.5 1.5 0 0 1 4 14.5v-8A1.5 1.5 0 0 1 5.5 5Z"/>',
  compartir: '<path d="M12 4v11M8 8l4-4 4 4M5.5 13v5.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V13"/>',
  instalar: '<path d="M12 4v11M8 11l4 4 4-4M5.5 19.5h13"/>',
  tema: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none" opacity=".85"/>',
  telefono: '<path d="M8.2 3.8 6 4.2c-.9.2-1.5 1-1.4 1.9.6 6.9 6.4 12.7 13.3 13.3.9.1 1.7-.5 1.9-1.4l.4-2.2c.1-.6-.2-1.2-.8-1.4l-2.8-1.1c-.5-.2-1.1-.1-1.5.3l-1 1.1a10.6 10.6 0 0 1-4.9-4.9l1.1-1c.4-.4.5-1 .3-1.5L9.6 4.6c-.2-.6-.8-.9-1.4-.8Z"/>',
  whatsapp: '<path d="M20 11.6a8.2 8.2 0 0 1-12.1 7.2L4 20l1.3-3.7A8.2 8.2 0 1 1 20 11.6Z"/><path d="M9.2 8.6c.3 2.6 2.3 4.6 4.9 5.2l.9-1.1 1.6.7-.4 1.4c-3.5.2-6.9-3.2-7-6.9l1.4-.4.7 1.6Z"/>',
  web: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17"/>',
  ajustes: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  ia: '<path d="M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5Z"/><path d="M18.5 15.5c.3 1.6 1 2.3 2.5 2.5-1.5.2-2.2.9-2.5 2.5-.3-1.6-1-2.3-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5Z"/>',
  // Partes de un tip
  cuando: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  como: '<path d="M10 7h10M10 12h10M10 17h10"/><path d="m4 7 1.2 1.2L7.5 6M4 12l1.2 1.2 2.3-2.2M4 17l1.2 1.2 2.3-2.2"/>',
  ojo: '<path d="M12 4.2 20.6 19H3.4Z"/><path d="M12 10v4.2M12 16.6v.1"/>',
  saber: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.2M12 7.9v.1"/>',
  verificado: '<path d="M12 3.5 18.5 6v5c0 4.3-2.7 7.6-6.5 9.5C8.2 18.6 5.5 15.3 5.5 11V6Z"/><path d="m9.2 12 2 2 3.8-4"/>',
  fuente: '<path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"/>',
  // Niveles de confianza
  oficial: '<path d="M12 3.5 18.5 6v5c0 4.3-2.7 7.6-6.5 9.5C8.2 18.6 5.5 15.3 5.5 11V6Z"/><path d="m9.2 12 2 2 3.8-4"/>',
  consenso: '<circle cx="8" cy="9" r="2.3"/><circle cx="16" cy="9" r="2.3"/><path d="M3.5 18c.6-2.4 2.3-3.8 4.5-3.8s3.9 1.4 4.5 3.8M11.5 18c.6-2.4 2.3-3.8 4.5-3.8s3.9 1.4 4.5 3.8"/>',
  reporte: '<circle cx="12" cy="12" r="7.5" stroke-dasharray="2.4 2.4"/>',
  disputa: '<path d="M4 8h12l-3-3M20 16H8l3 3"/>',
  // Categorías
  llantas: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.2"/><path d="M12 3.5v5.3M12 15.2v5.3M3.5 12h5.3M15.2 12h5.3"/>',
  carga: '<path d="M9 3v4M15 3v4M6.5 7h11v3.5a5.5 5.5 0 0 1-11 0Z"/><path d="M12 16v5"/>',
  bateria: '<rect x="3" y="7.5" width="16" height="9" rx="2"/><path d="M21 10.5v3"/><path d="m11.5 9.5-2 2.6h3.5l-2 2.4"/>',
  energia: '<path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h6A1.5 1.5 0 0 1 14 5.5V20M4 20h11M14 9.5h1.5a2 2 0 0 1 2 2v4.5a1.5 1.5 0 0 0 3 0V8.5L17.5 5.5"/><path d="M7.5 8h4"/>',
  manejo: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12.5" r="2"/><path d="M3.8 11.2c2.6-.8 5.4-1.2 8.2-1.2s5.6.4 8.2 1.2M10.3 13.6 7 19.5M13.7 13.6l3.3 5.9"/>',
  viajes: '<path d="M2.5 19.5 9 8.5l4 6.5 2.5-3.5 6 8Z"/><circle cx="17.5" cy="6" r="1.8"/>',
  software: '<rect x="3" y="4.5" width="18" height="12" rx="1.5"/><path d="M8.5 20h7M12 16.5V20"/>',
  app: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>',
  funciones: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  problemas: '<path d="M12 4.2 20.6 19H3.4Z"/><path d="M12 10v4.2M12 16.6v.1"/>',
  mantenimiento: '<path d="M14.7 5.3a4 4 0 0 0-5 5.1L4.2 15.9a1.8 1.8 0 0 0 2.6 2.6l5.5-5.5a4 4 0 0 0 5.1-5l-2.6 2.6-2.1-.5-.5-2.1Z"/>',
  tramites: '<path d="M7 3h7l4 4v14H7Z"/><path d="M14 3v4h4M9.5 12h6M9.5 15.5h6"/>',
  accesorios: '<path d="M12 3.5 18.5 6v5c0 4.3-2.7 7.6-6.5 9.5C8.2 18.6 5.5 15.3 5.5 11V6Z"/>',
  estrella: '<path d="m12 3.6 2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.5l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7Z"/>',
  estrellaLlena: '<path d="m12 3.6 2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.5l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7Z" fill="currentColor"/>',
  agregar: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>',
  creditos: '<circle cx="12" cy="9" r="5.5"/><path d="m9 13.8-1.5 6.7 4.5-2.3 4.5 2.3-1.5-6.7"/>',
  categoria: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
};

/** Nombres disponibles (para pruebas y para el catálogo de categorías). */
export const NOMBRES = Object.keys(P);

/**
 * Devuelve el SVG de un ícono como texto.
 * @param {string} nombre  uno de NOMBRES
 * @param {number} tam     tamaño en píxeles (ancho = alto)
 */
export function icono(nombre, tam = 20, clase = '') {
  const cuerpo = P[nombre] || P.categoria;
  return `<svg class="ico${clase ? ` ${clase}` : ''}" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${TRAZO}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${cuerpo}</svg>`;
}

/** Reemplaza cada <span data-icono="nombre"> de la página por su SVG. */
export function ponerIconos(raiz = document) {
  raiz.querySelectorAll('[data-icono]').forEach((el) => {
    el.innerHTML = icono(el.dataset.icono, +(el.dataset.tam || 20));
  });
}
