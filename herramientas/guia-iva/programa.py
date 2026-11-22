# -*- coding: utf-8 -*-
# programa.py — Cambios del JavaScript de la guía (se ejecuta dentro de construir.py).

# Listas numeradas con el mismo estilo de las viñetas
rep('''ul.plain{margin:0 0 16px; padding-left:20px; max-width:72ch}
ul.plain li{margin-bottom:7px}''', '''ul.plain,ol.plain{margin:0 0 16px; padding-left:22px; max-width:72ch}
ul.plain li,ol.plain li{margin-bottom:7px}''')

# ═════════ Restaurar una copia: solo se aceptan las claves y tipos esperados ═════════
rep('''const blank = () => ({ v:1, checks:{}, stamps:{}, stepDates:{}, data:{}, ruta:"" });
let S = Object.assign(blank(), Store.read()||{});
S.checks = S.checks||{}; S.stamps = S.stamps||{}; S.stepDates = S.stepDates||{}; S.data = S.data||{};''',
'''const blank = () => ({ v:1, checks:{}, stamps:{}, stepDates:{}, data:{}, ruta:"" });
/**
 * Limpia un avance (guardado o restaurado desde un archivo): solo deja las claves conocidas,
 * con textos cortos y fechas AAAA-MM-DD. Un archivo manipulado no puede meter nada más.
 */
const CAMPOS = ["nombre","cedula","direccion","correo","ciudad","departamento","seccional","buzon","banco","nitBanco","tipoCuenta","numeroCuenta",
  "marca","modelo","anio","vin","concesionario","nitConcesionario","factura","fechaFactura","cufe","valorSinIva","valorIva","valorInc","valorTotal",
  "radicadoUpme","fechaUpme","codigoCita","fechaCita","radicadoDian","fechaRadicacion"];
const esFecha = v => typeof v==="string" && /^\\d{4}-\\d{2}-\\d{2}$/.test(v);
function limpiarAvance(o){
  const out = blank();
  if(!o || typeof o!=="object") return out;
  const obj = x => (x && typeof x==="object" && !Array.isArray(x)) ? x : {};
  // Pasos 1 a 5; el que más casillas tiene es el 1 (11: de 0 a 10)
  const CLAVE=/^[1-5]-(\\d|10)$/;
  for(const [k,v] of Object.entries(obj(o.checks))) if(CLAVE.test(k) && v===true) out.checks[k]=true;
  for(const [k,v] of Object.entries(obj(o.stamps))) if(CLAVE.test(k) && esFecha(v)) out.stamps[k]=v;
  for(const [k,v] of Object.entries(obj(o.stepDates))) if(/^[1-5]$/.test(k) && esFecha(v)) out.stepDates[k]=v;
  for(const k of CAMPOS){ const v=obj(o.data)[k]; if(typeof v==="string") out.data[k]=v.slice(0,300); }
  if(o.ruta==="virtual"||o.ruta==="cita") out.ruta=o.ruta;
  return out;
}
let S = limpiarAvance(Store.read());''')

# ═════════ UVT por año: la guía no se queda vieja el 1 de enero ═════════
rep('''const money=v=>{ const n=num(v); return n ? n.toLocaleString("es-CO") : ""; };''',
'''const money=v=>{ const n=num(v); return n ? n.toLocaleString("es-CO") : ""; };
/* UVT oficial por año (resolución DIAN). Cuando la DIAN publique la de un año nuevo, se agrega aquí. */
const UVT = { 2025:49799, 2026:52374 };
function uvtVigente(){
  const y = new Date().getFullYear();
  if(UVT[y]) return { anio:y, valor:UVT[y], exacta:true };
  const ultimo = Math.max(...Object.keys(UVT).map(Number));
  return { anio:ultimo, valor:UVT[ultimo], exacta:false };
}''')
rep('''    const iv=num(S.data.valorIva);
    un.innerHTML = iv
      ? (iv>52374000
          ? "Tu IVA (<b>$"+money(iv)+"</b>) supera 1.000 UVT ($52.374.000 en 2026): la DIAN devolvería en TIDIS y no por abono en cuenta."
          : "Tu IVA (<b>$"+money(iv)+"</b>) está por debajo de 1.000 UVT ($52.374.000 en 2026), así que la devolución se abona a tu cuenta.")
      : "El IVA se calcula solo, al 5% del valor sin IVA, en cuanto escribas ese valor.";''',
'''    const iv=num(S.data.valorIva), u=uvtVigente(), tope=u.valor*1000;
    const ref="1.000 UVT ($"+tope.toLocaleString("es-CO")+" con la UVT "+u.anio+(u.exacta?"":", la última publicada")+")";
    un.innerHTML = iv
      ? (iv>tope
          ? "Tu IVA (<b>$"+money(iv)+"</b>) supera "+ref+": la DIAN devolvería en TIDIS y no por abono en cuenta."
          : "Tu IVA (<b>$"+money(iv)+"</b>) está por debajo de "+ref+", así que la devolución se abona a tu cuenta.")
      : "El IVA se calcula solo, al 5% del valor sin IVA, en cuanto escribas ese valor.";''')

# ═════════ Plantillas: asunto oficial y cuerpo del correo con tus datos; sin «cita» si no aplica ═════════
rep('''function tplB(){
  const hoy=parseISO(todayISO());
  const ciudad=g("ciudad","Ciudad");''', '''/** ¿Tu radicación va con cita? Sí si elegiste la Ruta B o escribiste un código o fecha de cita. */
const conCita = () => S.ruta==="cita" || !!(S.data.codigoCita||"").trim() || !!(S.data.fechaCita||"").trim();
/** Fecha AAAA-MM-DD de la cita (si se escribió como 14/10/2026) o de hoy. */
function fechaAsunto(){
  const m=(S.data.fechaCita||"").match(/(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})/);
  if(m) return m[3]+"-"+m[2].padStart(2,"0")+"-"+m[1].padStart(2,"0");
  return todayISO();
}
function tplAsunto(){
  return "Solicitud devolución vehículos eléctricos o híbridos - "+g("nombre","Nombre completo").toUpperCase()+" - "+g("cedula","NIT o cédula")+" - "+fechaAsunto();
}
function tplCorreo(){
  return "Señores Dirección Seccional de Impuestos de "+g("seccional","tu ciudad")+" — DIAN\\n\\n"+
    (conCita() ? "Cita agendada No. "+g("codigoCita","código de cita")+" para el "+g("fechaCita","fecha y hora")+". " : "")+
    "Por medio del presente correo, enviado desde mi dirección registrada en el RUT, presento solicitud de devolución de IVA por pago de lo no debido, conforme al artículo 12 de la Ley 1715 de 2014, el parágrafo 3 del artículo 1.3.1.12.24 del Decreto 1625 de 2016 y el Concepto DIAN No. 000673-int-0063 del 16 de enero de 2026.\\n\\n"+
    "Valor solicitado: "+gm("valorIva","valor del IVA, sin decimales")+"\\n"+
    "Datos cuenta: "+g("banco","Banco")+" — Cuenta "+g("tipoCuenta","tipo")+" No. "+g("numeroCuenta","número")+" — Titular: "+g("nombre","nombre")+"\\n\\n"+
    "Adjunto los 9 documentos requeridos, cada uno en PDF.\\n\\n"+
    g("nombre","Nombre completo")+" — CC "+g("cedula","número")+" — "+g("correo","Correo del RUT");
}
function tplB(){
  const hoy=parseISO(todayISO());
  const ciudad=g("ciudad","Ciudad");''')
rep('''"Ref: Concepto DIAN 000673-int-0063 del 16/01/2026 · Cita agendada "+g("fechaCita","fecha")+"\\n\\n"+''',
    '''"Ref: Concepto DIAN 000673-int-0063 del 16/01/2026"+(conCita() ? " · Cita agendada "+g("fechaCita","fecha") : "")+"\\n\\n"+''')
rep('''function buildTemplates(){
  const b=document.getElementById("txtB"); if(b) b.textContent=tplB();''', '''function buildTemplates(){
  const as=document.getElementById("mailSubject"); if(as) as.textContent=tplAsunto();
  const mb=document.getElementById("mailBody"); if(mb) mb.textContent=tplCorreo();
  const b=document.getElementById("txtB"); if(b) b.textContent=tplB();''')
rep('''  if(e.target.id==="ruta"){ S.ruta=e.target.value; save(); return; }''', '''  if(e.target.id==="ruta"){ S.ruta=e.target.value; save(); render(); return; }''')

# ═════════ Copia, restauración y reinicio sin ventanas del navegador ═════════
rep('''document.getElementById("btnBackup").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"});
  download(blob,"avance-devolucion-iva.json");
  toast("Copia descargada. Puedes restaurarla con el mismo botón.");
  setTimeout(()=>{ if(confirm("¿Quieres restaurar un avance guardado desde un archivo?")) document.getElementById("fileIn").click(); },600);
});
document.getElementById("fileIn").addEventListener("change",e=>{
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ try{ const o=JSON.parse(r.result); S=Object.assign(blank(),o); save(); render(); toast("Avance restaurado"); }
                 catch(err){ toast("El archivo no se pudo leer"); } };
  r.readAsText(f); e.target.value="";
});
document.getElementById("btnReset").addEventListener("click",()=>{
  if(!confirm("Se borrarán las casillas marcadas, las fechas y tus datos guardados en este navegador. ¿Continuar?")) return;
  Store.clear(); S=blank(); save();
  document.querySelectorAll("[data-d]").forEach(el=>el.value="");
  const r=document.getElementById("ruta"); if(r) r.value="";
  render(); show("0"); toast("Todo reiniciado");
});''', '''/** Pregunta con una ventana propia (no la del navegador). Devuelve una promesa con true o false. */
function preguntar(titulo, texto, si, peligro){
  return new Promise(ok=>{
    const d=document.getElementById("dlgConfirmar");
    if(!d || typeof d.showModal!=="function"){ ok(false); return; }
    d.querySelector("h2").textContent=titulo; d.querySelector("p").textContent=texto;
    const bSi=d.querySelector("[data-si]"), bNo=d.querySelector("[data-no]");
    bSi.textContent=si; bSi.className=peligro?"btn-peligro":"btn";
    const fin=v=>{ d.close(); ok(v); };
    bSi.onclick=()=>fin(true); bNo.onclick=()=>fin(false);
    d.oncancel=e=>{ e.preventDefault(); fin(false); };
    d.showModal(); bNo.focus(); // en lo destructivo, el foco queda en «Cancelar»
  });
}
function cerrarOpciones(){ const o=document.getElementById("opciones"); if(o) o.open=false; }
document.getElementById("btnBackup").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"});
  download(blob,"avance-devolucion-iva.json");
  toast("Copia descargada. Contiene tus datos: guárdala en un lugar seguro.");
  cerrarOpciones();
});
document.getElementById("btnRestore").addEventListener("click",()=>{ document.getElementById("fileIn").click(); cerrarOpciones(); });
document.getElementById("fileIn").addEventListener("change",e=>{
  const f=e.target.files[0]; if(!f) return;
  if(f.size>200000){ toast("Ese archivo es demasiado grande para ser una copia de la guía"); e.target.value=""; return; }
  const r=new FileReader();
  r.onload=async ()=>{
    let o; try{ o=JSON.parse(r.result); }catch(err){ toast("El archivo no se pudo leer"); return; }
    if(!await preguntar("¿Restaurar esta copia?","Reemplaza el avance y los datos que tienes ahora en este navegador.","Restaurar",false)) return;
    S=limpiarAvance(o); save(); render(); show(currentStep()); toast("Avance restaurado");
  };
  r.readAsText(f); e.target.value="";
});
document.getElementById("btnReset").addEventListener("click",async ()=>{
  cerrarOpciones();
  if(!await preguntar("¿Reiniciar la guía?","Se borrarán las casillas marcadas, las fechas y tus datos guardados en este navegador. No se puede deshacer.","Borrar todo",true)) return;
  Store.clear(); S=blank(); save();
  document.querySelectorAll("[data-d]").forEach(el=>el.value="");
  const r=document.getElementById("ruta"); if(r) r.value="";
  render(); show("0"); toast("Todo reiniciado");
});

/* Tema claro u oscuro: el del sistema, salvo que elijas otro (se recuerda en este navegador) */
function temaActual(){ const t=document.documentElement.dataset.tema; if(t) return t; return matchMedia("(prefers-color-scheme: dark)").matches?"oscuro":"claro"; }
function pintarBotonTema(){ document.getElementById("btnTema").textContent = temaActual()==="oscuro" ? "Modo claro" : "Modo oscuro"; }
document.getElementById("btnTema").addEventListener("click",()=>{
  const t = temaActual()==="oscuro" ? "claro" : "oscuro";
  document.documentElement.dataset.tema=t;
  try{ localStorage.setItem("guia-iva-tema",t); }catch(e){}
  pintarBotonTema(); cerrarOpciones();
});
pintarBotonTema();

/* «Descargar esta guía»: solo cuando se abre desde una página web (si ya es un archivo, ya la tienes).
   Se descarga el archivo original del servidor, nunca la página con tus datos. */
(function(){
  const b=document.getElementById("btnDescargar");
  if(!/^https?:$/.test(location.protocol)) return;
  b.hidden=false;
  b.addEventListener("click",async ()=>{
    cerrarOpciones();
    try{
      const r=await fetch(location.href.split("#")[0],{cache:"no-cache"});
      if(!r.ok) throw new Error(r.status);
      download(await r.blob(),"Guia_Devolucion_IVA_"+(document.querySelector('meta[name="version"]')||{}).content+".html");
      toast("Guía descargada: ábrela con doble clic, funciona sin internet");
    }catch(e){ toast("No se pudo descargar. Usa «Guardar como» de tu navegador."); }
  });
})();''')

# ═════════ Ayudas «?»: con nombre para el lector de pantalla y descritas por el globo ═════════
rep('''function placeTip(el){
  const txt=el.dataset.tip; if(!txt) return;
  tip.textContent=txt; tip.classList.add("on");''', '''document.querySelectorAll(".tt").forEach(b=>{
  b.type="button";
  const t=b.textContent.trim();
  b.setAttribute("aria-label", t ? t+": ver explicación" : "Ver explicación");
});
function placeTip(el){
  const txt=el.dataset.tip; if(!txt) return;
  tip.textContent=txt; tip.classList.add("on");
  document.querySelectorAll(".tt[aria-describedby]").forEach(x=>x.removeAttribute("aria-describedby"));
  el.setAttribute("aria-describedby","tip");''')
rep('''function hideTip(){ tip.classList.remove("on"); tipFor=null; }''', '''function hideTip(){ tip.classList.remove("on"); if(tipFor) tipFor.removeAttribute("aria-describedby"); tipFor=null; }''')

# ═════════ Barra superior: alto real (para que la navegación pegajosa no quede debajo) y menú ═════════
rep('''/* ═══════════════ 11. ARRANQUE ═══════════════ */''', '''/* ═══════════════ 11. BARRA SUPERIOR ═══════════════ */
(function(){
  const rail=document.querySelector(".rail"), op=document.getElementById("opciones");
  const medir=()=>document.documentElement.style.setProperty("--rail-h", rail.offsetHeight+"px");
  if(window.ResizeObserver) new ResizeObserver(medir).observe(rail); else window.addEventListener("resize",medir);
  medir();
  // «Opciones» se cierra al tocar fuera o con Escape
  document.addEventListener("click",e=>{ if(op.open && !op.contains(e.target)) op.open=false; });
  document.addEventListener("keydown",e=>{ if(e.key==="Escape" && op.open){ op.open=false; op.querySelector("summary").focus(); } });
})();

/* ═══════════════ 12. ARRANQUE ═══════════════ */''')

# Ventana de confirmación (una sola, reutilizable)
rep('''<div id="tip" role="tooltip"></div>''', '''<div id="tip" role="tooltip"></div>
<dialog class="confirmar" id="dlgConfirmar" aria-labelledby="dlgTitulo">
  <h2 id="dlgTitulo"></h2>
  <p></p>
  <div class="fila"><button type="button" class="btn-line" data-no>Cancelar</button><button type="button" class="btn" data-si>Aceptar</button></div>
</dialog>''')
