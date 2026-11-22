# -*- coding: utf-8 -*-
# contenido.py — Cambios de texto de la guía (se ejecuta dentro de construir.py).
# Regla pedida por el autor: lo anterior aparece TACHADO (<del class="antes">) y lo nuevo
# RESALTADO (<ins class="nuevo">), cada cambio con su fecha de vigencia (<span class="vigencia">).


def vig(texto):
    return f'<span class="vigencia">{texto}</span>'


V_563 = vig("Vigente desde el 7 ago 2026 · Res. UPME 563 de 2026")
V_127 = vig("Desde el 1 oct 2026 · Comunicado DIAN 127")
V_ABECE = vig("Vigente según el abecé DIAN del trámite (sin fecha impresa; consultado el 22 nov 2026)")
V_12670 = vig("Vigente desde el 4 ago 2026 · Concepto DIAN 12670 de 2026")
V_2242 = vig("Vigente desde el 12 nov 2026 · Concepto DIAN 2242 de 2026")
V_RESCATE = vig("En trámite desde el 29 oct 2026 · NO vigente")

# ─────────── Portada ───────────
rep('''        <span>Versión 5.4 · 22 de junio de 2026</span>''',
    '''        <span>Contenido 5.5 · revisado al ''' + HOY + '''</span>
        <span>Guía HTML ''' + VERSION + '''</span>''')
rep('''      <p class="norm">Ley 1715 de 2014 · Concepto DIAN 000673 de 2026. Una guía sencilla, escrita para que cualquier persona pueda hacer el trámite sin contador y sin intermediarios.</p>''',
    '''      <p class="norm">Ley 1715 de 2014 · Concepto DIAN 000673 de 2026. Una guía sencilla, escrita para que cualquier persona pueda hacer el trámite sin contador y sin intermediarios. Sirve para cualquier marca de vehículo eléctrico o híbrido y funciona sin internet en cualquier navegador.</p>''')
rep('''placeholder="JUAN JOSÉ TAPIA GÓMEZ"''', '''placeholder="ANA MARÍA PÉREZ GÓMEZ"''')

NOVEDADES = '''
    <h3 id="novedades">Novedades normativas (revisadas al ''' + HOY + ''')</h3>
    <p class="leyenda-cambios"><span><del class="antes">Tachado</del> = lo que decía la versión 5.4</span><span><ins class="nuevo">Resaltado</ins> = cambio nuevo</span><span>Etiqueta amarilla = desde cuándo rige</span></p>
    <ul class="novedades">
      <li>''' + V_563 + '''<br><b>La UPME unificó sus reglas.</b>
        <p><del class="antes">Resolución UPME 000400 de 2026</del> <ins class="nuevo">Resolución UPME 000563 de 2026, que deroga a la 400</ins>. Mantiene la ventana del 1 de febrero al 15 de diciembre de cada año, da 30 días hábiles para resolver, el certificado no vence y el de un vehículo no se puede modificar: si tiene un error, toca hacer una solicitud nueva. <a href="#" data-goto="1">Ver Paso 1</a></p></li>
      <li>''' + V_127 + '''<br><b>Cita solo en cuatro ciudades y formulario electrónico para el 010.</b>
        <p><ins class="nuevo">La cita se exige solo en Bogotá, Medellín, Cali y Bucaramanga; en el resto del país se envía al buzón de la seccional, sin cita. Las citas se liberan en varias franjas del día. La DIAN tiene un formulario electrónico que genera el Formato 010 ya diligenciado.</ins> <a href="#" data-goto="3">Ver Paso 3</a></p></li>
      <li>''' + V_ABECE + '''<br><b>Asunto oficial del correo y límite por archivo.</b>
        <p><del class="antes">Código de cita / Solicitud de devolución / Nombre / Identificación / Envío No. · 20 MB por correo</del> <ins class="nuevo">«Solicitud devolución vehículos eléctricos o híbridos - Nombre - NIT - año-mes-día» · cada PDF hasta 20 MB, sin unirlos en uno solo</ins>. <a href="#" data-goto="4">Ver Paso 4</a></p></li>
      <li>''' + V_12670 + '''<br><b>La nota crédito del concesionario no sirve.</b>
        <p><ins class="nuevo">La DIAN confirmó que el único camino es la devolución ante la DIAN por pago de lo no debido; no se le pide al vendedor una nota crédito.</ins></p></li>
      <li>''' + V_2242 + '''<br><b>Antes de comprar: factura sin IVA.</b>
        <p><ins class="nuevo">Si sacas el certificado UPME antes de comprar el vehículo nuevo, el concesionario debe facturarlo sin IVA y no necesitas pedir devolución.</ins> <a href="#antesDeComprar">Ver cómo</a></p></li>
      <li>''' + V_RESCATE + '''<br><b>Proyecto de Ley de Rescate (477 de 2026 Cámara).</b>
        <p>Propone subir el IVA de los vehículos eléctricos e híbridos del 5 % al 19 %. <b>No está aprobado:</b> hoy el IVA sigue en el 5 % y esta guía aplica igual. Si se aprueba, revisa la versión más reciente de la guía.</p></li>
      <li><span class="vigencia">Informativo · consultado el ''' + HOY + '''</span><br><b>UVT 2027 pendiente.</b>
        <p>La DIAN aún no publica la UVT de 2027. Hasta el 31 de diciembre de 2026 rige la de 2026 ($52.374). La guía usa sola la del año en curso cuando esté disponible.</p></li>
    </ul>

    <div class="note info" id="antesDeComprar">
      <h5>¿Todavía no has comprado el carro? ''' + V_2242 + '''</h5>
      <p><ins class="nuevo">Saca primero el certificado UPME: la Resolución 563 de 2026 no exige la factura para pedirlo. Con el certificado en la mano antes de la compra, el vehículo ya está excluido de IVA y el concesionario debe facturarlo sin IVA. Así te ahorras la devolución completa.</ins></p>
    </div>
'''
rep('''    <h3>¿De qué se trata? (en palabras simples)</h3>''', NOVEDADES + '''
    <h3>¿De qué se trata? (en palabras simples)</h3>''')

rep('''          <tr><td>¿Y si la DIAN «inadmite»?</td>''', '''          <tr><td>¿Puedo pedirle al concesionario una nota crédito por el IVA?</td><td><ins class="nuevo">No. La DIAN confirmó que el camino es la devolución ante la DIAN, no ante el vendedor.</ins> ''' + V_12670 + '''</td></tr>
          <tr><td>¿Y si la DIAN «inadmite»?</td>''')

rep('''      <p>1) <a href="https://www.youtube.com/watch?v=K_9ZtMpy-bE" target="_blank" rel="noopener">Video que explica el proceso de la UPME (YouTube)</a>.''',
    '''      <p><ins class="nuevo">Primero: el formulario electrónico de la DIAN, que genera el Formato 010 ya diligenciado y reduce las inadmisiones (está enlazado en el <a href="https://www.dian.gov.co/impuestos/Documents/Abece-devoluciones-vehiculos-hibridos-electricos.pdf" target="_blank" rel="noopener">abecé de la DIAN</a>).</ins> ''' + V_127 + '''</p>
      <p>1) <a href="https://www.youtube.com/watch?v=K_9ZtMpy-bE" target="_blank" rel="noopener">Video que explica el proceso de la UPME (YouTube)</a>.''')

# Referencias legales
rep('''          <tr><td>Resolución 000400 de 2026</td><td>Ventana continua de solicitudes (1 feb – 15 dic)</td></tr>''',
    '''          <tr><td><del class="antes">Resolución 000400 de 2026</del><br><ins class="nuevo">Resolución UPME 000563 de 2026</ins><br>''' + V_563 + '''</td><td><del class="antes">Ventana continua de solicitudes (1 feb – 15 dic)</del><br><ins class="nuevo">Reglas únicas del certificado: ventana del 1 feb al 15 dic de cada año (art. 6.1), 30 días hábiles (art. 6.3), el certificado no vence (art. 9) y el de vehículos no se modifica (art. 7, par. 3). Deroga la 400 de 2026.</ins></td></tr>''')
rep('''          <tr><td>Art. 855 E.T.</td>''', '''          <tr><td><ins class="nuevo">Concepto DIAN 12670 de 2026</ins><br>''' + V_12670 + '''</td><td><ins class="nuevo">La devolución se pide a la DIAN (parágrafo 3 del art. 1.3.1.12.24 del Decreto 1625 de 2016); no aplica la nota crédito del vendedor</ins></td></tr>
          <tr><td><ins class="nuevo">Concepto DIAN 2242 de 2026</ins><br>''' + V_2242 + '''</td><td><ins class="nuevo">Con certificado UPME antes de la compra, la factura no debe liquidar IVA</ins></td></tr>
          <tr><td><ins class="nuevo">Comunicado DIAN 127 de 2026 y abecé DIAN del trámite</ins><br>''' + V_127 + '''</td><td><ins class="nuevo">Ciudades con cita, formulario electrónico del 010, asunto oficial y 20 MB por archivo</ins></td></tr>
          <tr><td>Art. 855 E.T.</td>''')

# Control de versiones
rep('''              <tr><td class="cas">5.4-h</td><td>2026</td>''', '''              <tr><td class="cas">5.5-h</td><td>22 nov 2026</td><td><b>HTML ''' + VERSION + '''.</b> Revisión normativa: Resolución UPME 563 de 2026 (reemplaza la 400), Comunicado DIAN 127 y abecé DIAN (cita en 4 ciudades, asunto oficial, 20 MB por archivo, formulario electrónico del 010), conceptos DIAN 12670 y 2242 de 2026, aviso del proyecto de Ley de Rescate y UVT por año. Lo anterior queda tachado y lo nuevo resaltado con su fecha de vigencia. Revisión de experiencia de uso: el celular ya no se corta, barra compacta, ayudas con nombre para lector de pantalla, letras del propio equipo (sin conexión a Google), modo oscuro, copia y restauración por separado, sin ventanas del navegador y carta y correo sin «cita» cuando tu ciudad no la exige.</td></tr>
              <tr><td class="cas">5.4-h</td><td>2026</td>''')

# ─────────── Paso 1 · UPME ───────────
rep('''      <p>Desde la Resolución 000400 de 2026 ya no hay ciclos separados: hay una ventana continua de recepción entre el <b>1 de febrero y el 15 de diciembre</b> de cada año. Solo asegúrate de radicar dentro de ese rango.</p>''',
    '''      <p><del class="antes">Desde la Resolución 000400 de 2026 ya no hay ciclos separados: hay una ventana continua de recepción entre el 1 de febrero y el 15 de diciembre de cada año.</del></p>
      <p><ins class="nuevo">La Resolución UPME 563 de 2026 mantiene la ventana continua: puedes radicar entre el <b>1 de febrero y el 15 de diciembre de cada año</b>. Lo que se radique fuera de ese rango se tiene por no presentado.</ins> ''' + V_563 + '''</p>''')
rep('''      <p>Aunque al final no aprueben el certificado, la tarifa pagada no se reembolsa. Revisa bien tus datos antes de pagar.</p>''',
    '''      <p>Aunque al final no aprueben el certificado, la tarifa pagada no se reembolsa. Revisa bien tus datos antes de pagar. <ins class="nuevo">Solo se devuelve si la falla no depende de ti (Res. 563, arts. 5.1.4 y 10).</ins> ''' + V_563 + '''</p>''')
rep('''    <div class="note info">
      <h5>¿Tu vehículo no aparece en la lista?</h5>''', '''    <div class="cambio">
      ''' + V_563 + '''
      <p><ins class="nuevo"><b>El certificado no vence</b> (art. 9). Y el de un vehículo <b>no se puede modificar</b> (art. 7, par. 3): si sale con un error, hay que hacer una solicitud nueva y pagar otra vez la tarifa. Revisa marca, línea, VIN y valor antes de radicar.</ins></p>
    </div>

    <div class="note info">
      <h5>¿Tu vehículo no aparece en la lista?</h5>''')
rep('''La UPME puede tardar hasta 30 días hábiles, aunque suele salir antes. Cuando llegue por correo, descárgalo: lo necesitas para la DIAN.</p>''',
    '''<del class="antes">La UPME puede tardar hasta 30 días hábiles, aunque suele salir antes.</del> <ins class="nuevo">La UPME tiene 30 días hábiles desde el aviso de radicación exitosa. Si te pide aclaraciones, el plazo se suspende: tienes un mes para responder (prorrogable una vez) y, si no respondes, se entiende que desististe.</ins> ''' + V_563 + ''' Cuando llegue por correo, descárgalo: lo necesitas para la DIAN.</p>''')
rep('''          <li><a href="https://www.upme.gov.co/ventanilla-unica-de-tramites-y-servicios/incentivos-tributarios/vehiculos-electricos/preguntas-frecuentes-veh/" target="_blank" rel="noopener">Preguntas frecuentes de la UPME</a></li>''',
    '''          <li><a href="https://www.upme.gov.co/ventanilla-unica-de-tramites-y-servicios/incentivos-tributarios/vehiculos-electricos/preguntas-frecuentes-veh/" target="_blank" rel="noopener">Preguntas frecuentes de la UPME</a></li>
          <li><ins class="nuevo"><a href="https://docs.upme.gov.co/Incentivos/Documents/Guia_paso_a_paso_incentivos_tributarios_para_vehiculos_electricos_e_hibridos.pdf" target="_blank" rel="noopener">Guía paso a paso oficial de la UPME (2026, PDF)</a></ins></li>
          <li><ins class="nuevo"><a href="https://docs.upme.gov.co/Normatividad/563_2026.pdf" target="_blank" rel="noopener">Resolución UPME 563 de 2026 (PDF)</a></ins></li>''')

# ─────────── Paso 2 · Documentos ───────────
rep('''          <tr><td class="cas">1</td><td>Formulario 010 DIAN</td><td>La solicitud de devolución. Ver <a href="#" data-goto="anexos" data-anexo="A">Anexo A</a>.</td></tr>''',
    '''          <tr><td class="cas">1</td><td>Formulario 010 DIAN</td><td>La solicitud de devolución. Ver <a href="#" data-goto="anexos" data-anexo="A">Anexo A</a>. <ins class="nuevo">Puedes generarlo con el formulario electrónico de la DIAN.</ins></td></tr>''')
rep('''          <tr><td class="cas">9</td><td>RUT</td><td>Copia de tu RUT (mismo que usaste en la UPME).</td></tr>''',
    '''          <tr><td class="cas">9</td><td>RUT</td><td>Copia de tu RUT (mismo que usaste en la UPME). <ins class="nuevo">Actualizado, sin suspensión ni cancelación, y con la misma dirección que pones en la solicitud.</ins></td></tr>''')

# ─────────── Paso 3 · Ruta y cita ───────────
rep('''      <p class="lede">La cita solo es obligatoria para radicaciones manuales en Bogotá, Bucaramanga, Cali y Medellín.</p>
    </div>''', '''      <p class="lede">La cita solo es obligatoria para radicaciones manuales en Bogotá, Bucaramanga, Cali y Medellín.</p>
    </div>

    <div class="cambio">
      ''' + V_127 + '''
      <p><ins class="nuevo">La DIAN confirmó que la cita se exige solo en <b>Bogotá, Medellín, Cali y Bucaramanga</b>. En el resto del país envías los documentos al buzón de la seccional donde está tu domicilio fiscal, sin cita.</ins></p>
      <p class="small"><b>Ojo con Manizales:</b> el abecé de la DIAN también la incluye entre las ciudades con cita, pero el comunicado del 1 de octubre no. Si tu seccional es Manizales, búscala en el agendador: si aparece, agenda; si no, envía al buzón.</p>
    </div>''')
rep('''    <ul class="plain">
      <li>Entra a <a href="https://www.dian.gov.co" target="_blank" rel="noopener">www.dian.gov.co</a></li>
      <li>Busca «<a href="https://agendamientodigiturno.dian.gov.co/" target="_blank" rel="noopener">Agendar citas</a>»</li>
      <li>Selecciona: Persona natural → Videollamada → Devoluciones</li>
      <li>Elige fecha y hora y guarda la confirmación (anota el código de cita).</li>
    </ul>''', '''    <ul class="plain">
      <li><del class="antes">Entra a www.dian.gov.co y busca «Agendar citas» (agendamientodigiturno.dian.gov.co)</del></li>
      <li><del class="antes">Selecciona: Persona natural → Videollamada → Devoluciones</del></li>
    </ul>
    <p>''' + V_ABECE + '''</p>
    <ol class="plain">
      <li><ins class="nuevo">Entra a <a href="https://agendamiento.dian.gov.co/" target="_blank" rel="noopener">agendamiento.dian.gov.co</a> y elige «Agendar cita».</ins></li>
      <li><ins class="nuevo">Persona natural → Videoatención → Devoluciones.</ins></li>
      <li><ins class="nuevo">En la pestaña «Trámites», elige «Solicitud de devolución y/o compensación de vehículos eléctricos o híbridos» de tu ciudad.</ins></li>
      <li>Elige fecha y hora y guarda la confirmación (anota el código de cita). <ins class="nuevo">Al correo te llega la confirmación con el buzón al que debes enviar. La cita no es una videollamada: solo fija cuándo envías.</ins></li>
    </ol>''')
rep('''      <p>Se agotan rápido. Si ves «No se encontraron especialidades», no hay citas en ese momento. Las citas de videoatención normalmente se liberan los <b>viernes</b> para la semana siguiente; conviene estar muy pendiente esos días.</p>''',
    '''      <p>Se agotan rápido. Si ves «No se encontraron especialidades», no hay citas en ese momento. <del class="antes">Las citas de videoatención normalmente se liberan los viernes para la semana siguiente; conviene estar muy pendiente esos días.</del></p>
      <p><ins class="nuevo">La DIAN ahora libera unas 200 citas diarias en varias franjas del día, para que los programas automáticos no las acaparen. Revisa en distintos momentos del día. Demorarte por falta de cita no te hace perder el derecho: tienes 5 años.</ins> ''' + V_127 + '''</p>''')

# ─────────── Paso 4 · Envío ───────────
rep('''      <p>La DIAN pide que los PDF no superen <b>20 MB por correo</b>. Si tus archivos pesan más, divide la solicitud en varios correos con el mismo asunto y numéralos «Envío No. 1», «Envío No. 2»…</p>''',
    '''      <p><del class="antes">La DIAN pide que los PDF no superen 20 MB por correo. Si tus archivos pesan más, divide la solicitud en varios correos con el mismo asunto y numéralos «Envío No. 1», «Envío No. 2»…</del></p>
      <p><ins class="nuevo">Cada PDF puede pesar hasta <b>20 MB</b> y no debes unirlos en un solo archivo.</ins> ''' + V_ABECE + '''</p>''')
rep('''      <h5>Cuánto pesa cada envío (informativo)</h5>''', '''      <h5>Cuánto puede pesar cada archivo</h5>''')
rep('''    <p>La DIAN pide que el asunto incluya: <b>Código de cita / Solicitud de devolución / Nombre o razón social / Identificación / Envío No. XXX</b>. El «Envío No. XXX» solo aplica si la solicitud se manda en varios correos. Si tu seccional no exige cita, omite el código de cita.</p>
    <div class="note info">
      <h5>Formato oficial publicado por la DIAN (informativo)</h5>
      <p>En su portal, la DIAN escribe el asunto así: <code>Solicitud Devolución - Nombre o razón social del solicitante - NIT del solicitante - envío No. XXX - fecha</code>, agregando además el código de la cita asignada.</p>
    </div>''', '''    <p><del class="antes">La DIAN pide que el asunto incluya: Código de cita / Solicitud de devolución / Nombre o razón social / Identificación / Envío No. XXX.</del></p>
    <p><ins class="nuevo">El abecé de la DIAN fija este asunto: <b>Solicitud devolución vehículos eléctricos o híbridos - Nombre o razón social - NIT - Fecha (año-mes-día)</b>. La fecha es la de tu cita o, si no la necesitas, la del envío.</ins> ''' + V_ABECE + '''</p>
    <div class="model">
      <div class="model-top">
        <h5>Asunto con tus datos (para copiar)</h5>
        <button class="btn-line btn-sm" data-copy="mailSubject" type="button">Copiar asunto</button>
      </div>
      <pre id="mailSubject"></pre>
    </div>''')
rep('''      <pre id="mailBody">Señores Dirección Seccional de Impuestos de [tu ciudad] — DIAN

Cita agendada No. [código de cita] para el [fecha] a las [hora] (si tu seccional exige cita). Por medio del presente correo, radicado desde mi dirección registrada en el RUT, presento solicitud de devolución de IVA por pago de lo no debido, conforme al artículo 12 de la Ley 1715 de 2014 y el Concepto DIAN No. 000673-int-0063 del 16 de enero de 2026.

Valor solicitado: $[valor del IVA, sin decimales]
Datos cuenta: [Banco] — Cuenta [tipo] No. [número] — Titular: [nombre]

Adjunto los 9 documentos requeridos.

[Nombre completo] — CC [número] — [Correo del RUT]</pre>''', '''      <pre id="mailBody"></pre>''')
rep('''      <h5>Cuerpo del correo (modelo para copiar)</h5>
        <button class="btn-line btn-sm" data-copy="mailBody">Copiar texto</button>''',
    '''      <h5>Cuerpo del correo con tus datos (para copiar)</h5>
        <button class="btn-line btn-sm" data-copy="mailBody" type="button">Copiar texto</button>''')
rep('''      <p>Recibirás un correo de confirmación con el número de radicado. Desde ese momento empiezan a contar los 50 días hábiles.</p>''',
    '''      <p><del class="antes">Recibirás un correo de confirmación con el número de radicado.</del> <ins class="nuevo">El número de radicado te llega al correo un par de días después del envío.</ins> ''' + V_ABECE + ''' Desde la radicación empiezan a contar los 50 días hábiles.</p>''')

# ─────────── Anexo A ───────────
rep('''    <div class="note info">
      <h5>Atajo recomendado</h5>
      <p>Llénalo más fácil con la <a href="https://cyoung.github.io/dian-010-upme/" target="_blank" rel="noopener">herramienta gratuita para el Formulario 010</a>. También genera la declaración juramentada (Anexo D). No guarda datos personales y te ahorra el costo de que alguien lo diligencie.</p>
    </div>''', '''    <div class="note info">
      <h5><del class="antes">Atajo recomendado</del> <ins class="nuevo">Usa primero el formulario de la DIAN</ins></h5>
      <p><ins class="nuevo">La DIAN tiene un formulario electrónico: llenas tus datos y genera el Formato 010 ya diligenciado, lo que reduce las inadmisiones. Está enlazado en el <a href="https://www.dian.gov.co/impuestos/Documents/Abece-devoluciones-vehiculos-hibridos-electricos.pdf" target="_blank" rel="noopener">abecé de la DIAN</a>.</ins> ''' + V_127 + '''</p>
      <p>Alternativa: la <a href="https://cyoung.github.io/dian-010-upme/" target="_blank" rel="noopener">herramienta gratuita para el Formulario 010</a> (de un tercero), que también genera la declaración juramentada (Anexo D). No guarda datos personales. Las tablas de abajo sirven para revisar lo que generes con cualquiera de las dos.</p>
    </div>''')

# Botones sin type → type="button" (no envían formularios por accidente)
for viejo in ['<button class="btn-line btn-sm" data-copy="txtB">', '<button class="btn-line btn-sm" data-copy="txtC">', '<button class="btn-line btn-sm" data-copy="txtD">',
              '<button class="btn-line btn-sm" data-docx="B">', '<button class="btn-line btn-sm" data-docx="C">', '<button class="btn-line btn-sm" data-docx="D">']:
    rep(viejo, viejo.replace('<button ', '<button type="button" '))
rep('<button class="btn" id="btnStart">', '<button class="btn" id="btnStart" type="button">')
rep('<button class="btn-ghost" data-goto="anexos">', '<button class="btn-ghost" data-goto="anexos" type="button">')

# ─────────── Pie ───────────
rep('''    <p><strong>Guía Devolución IVA VE · Versión 5.4 · 22 de junio de 2026.</strong>''',
    '''    <p><strong>Guía Devolución IVA VE · Contenido 5.5 · revisado al ''' + HOY + ''' · HTML ''' + VERSION + '''.</strong>''')
rep('''    <p>Tu avance, tus fechas y tus datos se guardan únicamente en este navegador y en este dispositivo. Nada viaja por internet. Usa «Copia de seguridad» para llevártelos a otro equipo.</p>''',
    '''    <p>Tu avance, tus fechas y tus datos se guardan únicamente en este navegador y en este dispositivo. Nada viaja por internet. Usa «Opciones › Guardar copia de mi avance» para llevártelos a otro equipo.</p>
    <p>Es un solo archivo HTML: funciona sin internet, en cualquier navegador y sistema, y no depende de ninguna marca ni servicio. Puedes compartirlo tal cual.</p>''')

# Casilla del paso 4: el límite es por archivo
rep('''    "Verifiqué que ningún envío supera 20 MB",''', '''    "Verifiqué que ningún PDF supera 20 MB (y no los uní en uno solo)",''')
