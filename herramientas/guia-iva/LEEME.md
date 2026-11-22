# Generador de la guía de devolución del IVA

La guía publicada (`guias/devolucion-iva.html`) **no se edita a mano**: sale de la versión original v1.01 aplicando reemplazos exactos.

| Archivo | Qué hace |
|---|---|
| `original-v1.01.html` | La guía tal como llegó (base, no se toca) |
| `construir.py` | Estilos: letras del sistema, modo oscuro, celular sin desborde, barra compacta; versión de la guía |
| `contenido.py` | Textos: cambios normativos con `<del class="antes">`, `<ins class="nuevo">` y `<span class="vigencia">` |
| `programa.py` | JavaScript: validación al restaurar, UVT por año, asunto y correo con tus datos, ventanas propias, tema, descarga |

Regenerar (desde esta carpeta):

```
python3 construir.py original-v1.01.html ../../guias/devolucion-iva.html
```

Si un texto original no aparece exactamente, el programa se detiene y dice cuál: así nunca queda un cambio a medias.

Para una revisión normativa nueva: agrega el cambio en `contenido.py` (lo viejo en `<del class="antes">`, lo nuevo en `<ins class="nuevo">` y la fecha con `vig("Vigente desde el …")`), sube la versión en `VERSION` de `construir.py` y la fecha en `HOY`, regenera y corre `tests/arbitro-v02-02.mjs`.
