# -*- coding: utf-8 -*-
"""
construir.py — Genera la guía mejorada (v01.02.00cl) a partir de la v1.01 original.
Cada cambio es un reemplazo exacto: si el texto original no aparece, el script se detiene
(así nunca se aplica un cambio a medias). Uso: python3 construir.py ORIGINAL.html SALIDA.html
"""
import sys

ORIG, SALIDA = sys.argv[1], sys.argv[2]
s = open(ORIG, encoding="utf-8").read()


def rep(viejo, nuevo, veces=1):
    global s
    n = s.count(viejo)
    assert n == veces, f"Se esperaban {veces} apariciones y hay {n}: {viejo[:90]!r}"
    s = s.replace(viejo, nuevo)


VERSION = "v01.02.00cl"
HOY = "22 de noviembre de 2026"

# ═════════════════════ 1. CABECERA: sin fuentes externas, claro y oscuro ═════════════════════
rep('<meta name="color-scheme" content="light">', '<meta name="color-scheme" content="light dark">\n<meta name="version" content="' + VERSION + '">')
rep('''<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap" rel="stylesheet">
''', '''<script>
/* Tema antes de pintar (evita el destello): el que elegiste, o el de tu sistema */
(function(){ try{ var t=localStorage.getItem("guia-iva-tema"); if(t==="claro"||t==="oscuro") document.documentElement.dataset.tema=t; }catch(e){} })();
</script>
''')

# Fuentes del sistema: la guía se ve bien en cualquier equipo, sin internet y sin avisarle a terceros
rep('''  --sans:"Bricolage Grotesque","Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;
  --serif:"Source Serif 4",Georgia,"Times New Roman",serif;''',
'''  --sans:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif;
  --serif:Charter,"Bitstream Charter","Sitka Text",Cambria,Georgia,"Noto Serif",serif;
  /* superficies y estados (cambian en modo oscuro) */
  --card2:#F7F9F6; --zebra:#FAFBFA; --ok-bg:#F6FBF8; --line-soft:#F0F2EF; --off:#F1F3F0; --off-text:#8A928B;
  --hover:#E3E8E2; --pill:#EEF0ED; --dot:#C9D0C8; --box:#B5BEB6; --box-hover:#9AA69D;
  --link:#0C5F43; --link-hover:#0A4B35; --ok-text:#0B5C41; --th:var(--ink); --on-accent:#fff;
  --del-bg:#F6E3E0; --del-text:#7A3A33; --ins-bg:#FFF1C7; --ins-line:#C98A00;
  --rail-h:64px;''')

# Modo oscuro: automático según el sistema, o el que elijas con el botón
rep('''*{box-sizing:border-box}''', '''[data-tema="oscuro"]{
  --paper:#0F1316; --card:#171C21; --text:#E4E9EC; --muted:#A3AEB6; --hair:#2B343C;
  --charge-soft:#12271F; --amber:#E5B55A; --amber-bg:#2A2210; --red:#F08C7D; --red-bg:#2B1513;
  --blue:#9DB4F2; --blue-bg:#141D33;
  --card2:#1B2127; --zebra:#1A2025; --ok-bg:#13221B; --line-soft:#232B32; --off:#20272D; --off-text:#77838C;
  --hover:#1F262D; --pill:#232B32; --dot:#4A555E; --box:#5A6670; --box-hover:#7D8A93;
  --link:#6FD3A8; --link-hover:#9BE5C4; --ok-text:#7FD9B2; --th:#232B33;
  --del-bg:#3A1C18; --del-text:#F2B1A8; --ins-bg:#3A2E08; --ins-line:#E5B55A;
  color-scheme:dark;
}
@media (prefers-color-scheme:dark){
  :root:not([data-tema="claro"]){
    --paper:#0F1316; --card:#171C21; --text:#E4E9EC; --muted:#A3AEB6; --hair:#2B343C;
    --charge-soft:#12271F; --amber:#E5B55A; --amber-bg:#2A2210; --red:#F08C7D; --red-bg:#2B1513;
    --blue:#9DB4F2; --blue-bg:#141D33;
    --card2:#1B2127; --zebra:#1A2025; --ok-bg:#13221B; --line-soft:#232B32; --off:#20272D; --off-text:#77838C;
    --hover:#1F262D; --pill:#232B32; --dot:#4A555E; --box:#5A6670; --box-hover:#7D8A93;
    --link:#6FD3A8; --link-hover:#9BE5C4; --ok-text:#7FD9B2; --th:#232B33;
    --del-bg:#3A1C18; --del-text:#F2B1A8; --ins-bg:#3A2E08; --ins-line:#E5B55A;
    color-scheme:dark;
  }
}
*{box-sizing:border-box}''')

# Colores fijos → variables
for viejo, nuevo in [
    ('a{color:#0C5F43;', 'a{color:var(--link);'),
    ('a:hover{color:#0A4B35}', 'a:hover{color:var(--link-hover)}'),
    ('.btn-line:hover{border-color:#9AA69D; background:#F7F9F6}', '.btn-line:hover{border-color:var(--box-hover); background:var(--card2)}'),
    ('.navbtn .dot{width:8px;height:8px;border-radius:50%;background:#C9D0C8;flex:0 0 8px}', '.navbtn .dot{width:8px;height:8px;border-radius:50%;background:var(--dot);flex:0 0 8px}'),
    ('.navbtn:hover{background:#E3E8E2}', '.navbtn:hover{background:var(--hover)}'),
    ('margin:0 0 6px; color:#0B5C41}', 'margin:0 0 6px; color:var(--ok-text)}'),
    ('tbody tr:nth-child(even) td{background:#FAFBFA}', 'tbody tr:nth-child(even) td{background:var(--zebra)}'),
    ('border-bottom:1px solid var(--hair); background:#F7F9F6; flex-wrap:wrap}', 'border-bottom:1px solid var(--hair); background:var(--card2); flex-wrap:wrap}'),
    ('background:linear-gradient(180deg,#F7F9F6,#fff)}', 'background:var(--card2)}'),
    ('border-bottom:1px solid #F0F2EF}', 'border-bottom:1px solid var(--line-soft)}'),
    ('.items li.ok{background:#F6FBF8}', '.items li.ok{background:var(--ok-bg)}'),
    ('border:1.5px solid #B5BEB6; border-radius:6px; background:#fff;', 'border:1.5px solid var(--box); border-radius:6px; background:var(--card);'),
    ('.items input[type=checkbox]:disabled{cursor:not-allowed; background:#F1F3F0}', '.items input[type=checkbox]:disabled{cursor:not-allowed; background:var(--off)}'),
    ('border-top:1px solid var(--hair); background:#F7F9F6; display:flex;', 'border-top:1px solid var(--hair); background:var(--card2); display:flex;'),
    ('border-radius:8px; background:#fff; color:var(--text); min-width:0; width:100%;', 'border-radius:8px; background:var(--card); color:var(--text); min-width:0; width:100%;'),
    ('input:disabled{background:#F1F3F0; color:#9AA29B}', 'input:disabled{background:var(--off); color:var(--off-text)}'),
    ('border-radius:999px; background:#EEF0ED; color:var(--muted)}', 'border-radius:999px; background:var(--pill); color:var(--muted)}'),
    ('.state-pill.ok{background:var(--charge-soft); color:#0B5C41}', '.state-pill.ok{background:var(--charge-soft); color:var(--ok-text)}'),
    ('th{background:var(--ink); color:#EDF1F4;', 'th{background:var(--th); color:#EDF1F4;'),
    ('.skip:focus{left:8px; top:8px; z-index:400; background:#fff;', '.skip:focus{left:8px; top:8px; z-index:400; background:var(--card); color:var(--text);'),
]:
    rep(viejo, nuevo)

# Celular: el contenido no puede ensanchar la rejilla (la página medía 428 px de más)
rep('''.cols{display:grid; grid-template-columns:1fr; gap:0}''', '''.cols{display:grid; grid-template-columns:minmax(0,1fr); gap:0}
.cols>*{min-width:0}''')
rep('''.nav{position:sticky; top:57px; z-index:50;''', '''.nav-note{display:none}
.nav{position:sticky; top:var(--rail-h); z-index:50;''')
rep('''  .nav{position:sticky; top:81px; background:transparent;''', '''  .nav-note{display:block}
  .nav{position:sticky; top:calc(var(--rail-h) + 4px); background:transparent;''')

# Barra superior compacta en el celular: marca + porcentaje + «Opciones»; la línea de avance debajo
rep('''.rail-in{max-width:1220px; margin:0 auto; display:flex; align-items:center; gap:16px; flex-wrap:wrap}''',
'''.rail-in{max-width:1220px; margin:0 auto; display:grid; grid-template-columns:minmax(0,1fr) auto auto; align-items:center; gap:8px 12px}
.rail-in .meter{grid-column:1 / -1; grid-row:2}
@media (min-width:1024px){
  .rail-in{display:flex; gap:16px}
  .rail-in .meter{order:2}
  .rail-in .pct-wrap{order:3}
  .rail-in .opciones{order:4}
}''')
rep('''.meter{flex:1 1 320px; min-width:220px; display:flex; align-items:center; gap:12px}
.cells{display:flex; gap:4px; flex:1; height:16px}''', '''.meter{flex:1 1 320px; min-width:0; display:flex; align-items:center; gap:12px}
.cells{display:flex; gap:4px; flex:1; height:8px}
@media (min-width:1024px){ .cells{height:16px} }''')
rep('''.rail-actions{display:flex; gap:8px; flex-wrap:wrap}''', '''.rail-actions{display:flex; gap:8px; flex-wrap:wrap}
.opciones{position:relative}
.opciones>summary{list-style:none; cursor:pointer; font-family:var(--sans); font-size:13.5px; font-weight:600; color:#C6D2DA; border:1px solid #3A4550; border-radius:999px; padding:8px 14px; min-height:40px; display:flex; align-items:center}
.opciones>summary::-webkit-details-marker{display:none}
.opciones[open]>summary{background:#242D36; color:#fff}
.opciones .rail-actions{position:absolute; right:0; top:calc(100% + 8px); flex-direction:column; align-items:stretch; background:var(--panel); border:1px solid var(--line-d); border-radius:12px; padding:8px; min-width:230px; box-shadow:0 20px 40px -20px rgba(0,0,0,.6); z-index:70}
.opciones .rail-actions button{text-align:left; border-radius:8px}
/* Un solo menú «Opciones» en todos los tamaños: la barra queda en una sola fila */''')
rep('''.btn-ghost{background:transparent; color:#C6D2DA; border-color:#3A4550; padding:7px 14px; font-size:13.5px; font-weight:500}''',
    '''.btn-ghost{background:transparent; color:#C6D2DA; border-color:#3A4550; padding:7px 14px; font-size:13.5px; font-weight:500; min-height:40px}''')
rep('''.btn-sm{padding:6px 13px; font-size:13px}''', '''.btn-sm{padding:6px 13px; font-size:13px; min-height:36px}''')

# Botones de ayuda «?»: área de toque de 24 px (WCAG 2.2, 2.5.8)
rep('''.tt:after{content:"?"; display:inline-flex; align-items:center; justify-content:center; width:14px; height:14px; margin-left:4px;''',
    '''.tt{min-width:24px; min-height:24px; vertical-align:middle}
.tt:after{content:"?"; display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; margin-left:4px;''')
rep('''.items input[type=checkbox]{
  appearance:none; -webkit-appearance:none; width:22px; height:22px; flex:0 0 22px;''', '''.items input[type=checkbox]{
  appearance:none; -webkit-appearance:none; width:24px; height:24px; flex:0 0 24px;''')

# Estilos nuevos: cambios normativos (tachado / resaltado con fecha), ventana de confirmación, novedades
rep('''@media print{''', '''/* ─────────── Cambios normativos ─────────── */
del.antes{color:var(--del-text); background:var(--del-bg); text-decoration:line-through; text-decoration-thickness:1.5px; border-radius:3px; padding:0 3px}
ins.nuevo{text-decoration:none; background:var(--ins-bg); box-shadow:inset 0 -2px 0 var(--ins-line); border-radius:3px; padding:0 3px}
.vigencia{display:inline-block; font-family:var(--sans); font-size:12px; font-weight:700; line-height:1.3; color:var(--amber); background:var(--amber-bg); border:1px solid var(--amber-line); border-radius:999px; padding:2px 9px; margin:0 4px 4px 0; white-space:normal}
.cambio{border:1px dashed var(--amber-line); border-radius:var(--rs); padding:12px 14px; margin:0 0 16px; max-width:74ch; background:var(--card)}
.cambio p{margin:6px 0 0; font-size:15.5px}
.leyenda-cambios{font-family:var(--sans); font-size:13.5px; color:var(--muted); display:flex; flex-wrap:wrap; gap:6px 16px; margin:0 0 14px}
.novedades{list-style:none; margin:0 0 22px; padding:0; display:grid; gap:10px; max-width:76ch}
.novedades li{background:var(--card); border:1px solid var(--hair); border-radius:var(--rs); padding:12px 14px}
.novedades li p{margin:4px 0 0; font-size:15.5px}
.novedades .tramite{color:var(--muted); font-family:var(--sans); font-size:12.5px}
/* ─────────── Ventana de confirmación (en lugar de confirm()) ─────────── */
dialog.confirmar{border:1px solid var(--hair); border-radius:var(--r); background:var(--card); color:var(--text); padding:22px; max-width:min(440px,calc(100vw - 32px)); box-shadow:0 30px 70px -30px rgba(0,0,0,.5)}
dialog.confirmar::backdrop{background:rgba(10,14,17,.55)}
dialog.confirmar h2{font-size:20px; margin:0 0 8px}
dialog.confirmar p{font-size:15.5px}
dialog.confirmar .fila{display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap; margin-top:16px}
.btn-peligro{background:var(--red); color:#fff; border-color:var(--red); padding:9px 16px; font-size:14px; font-weight:600}
[data-tema="oscuro"] .btn-peligro{color:#1a0b09}
@media (prefers-color-scheme:dark){ :root:not([data-tema="claro"]) .btn-peligro{color:#1a0b09} }

@media print{''')
rep('''  .rail,.nav,.hero-cta,.checkfoot,.rail-actions,.toast{display:none!important}''', '''  .rail,.nav,.hero-cta,.checkfoot,.rail-actions,.toast,dialog{display:none!important}''')

# ═════════════════════ 2. BARRA SUPERIOR ═════════════════════
rep('''    <div class="meter">
      <div class="cells" id="cells" role="img" aria-label="Avance del trámite"></div>
      <div class="pct" id="pct">0%</div>
    </div>
    <div class="rail-actions">
      <button class="btn-ghost" id="btnResume">Mi paso actual</button>
      <button class="btn-ghost" id="btnBackup">Copia de seguridad</button>
      <button class="btn-ghost" id="btnReset">Reiniciar</button>
    </div>''', '''    <div class="meter">
      <div class="cells" id="cells" role="img" aria-label="Avance del trámite"></div>
    </div>
    <div class="pct-wrap"><div class="pct" id="pct" aria-live="polite">0%</div></div>
    <details class="opciones" id="opciones">
      <summary>Opciones</summary>
      <div class="rail-actions">
        <button class="btn-ghost" id="btnResume" type="button">Mi paso actual</button>
        <button class="btn-ghost" id="btnBackup" type="button">Guardar copia de mi avance</button>
        <button class="btn-ghost" id="btnRestore" type="button">Restaurar una copia</button>
        <button class="btn-ghost" id="btnTema" type="button">Modo oscuro</button>
        <button class="btn-ghost" id="btnDescargar" type="button" hidden>Descargar esta guía</button>
        <button class="btn-ghost" id="btnReset" type="button">Reiniciar</button>
      </div>
    </details>''')

exec(open("contenido.py", encoding="utf-8").read())
exec(open("programa.py", encoding="utf-8").read())

open(SALIDA, "w", encoding="utf-8").write(s)
print("Guía generada:", SALIDA)
