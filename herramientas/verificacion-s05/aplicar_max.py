# =====================================================================
# aplicar_max.py — Contraste de los tips con el manual de la S05 Max (rango extendido).
# Corre DESPUÉS de aplicar.py (el del manual de la S05 eléctrica).
#
# Manual usado (lo entregó el administrador el 22 nov 2026):
#   «S05_G_ASE_LHD_REEV_English_15AUGUST.pdf» (239 páginas, en INGLÉS), edición de enero de
#   2025 del mismo distribuidor que el de la eléctrica. Coincide con la S05 Max que se vende
#   en Colombia: LFP de 27,28 kWh, motor eléctrico de 160 kW (214 hp) y 320 Nm, motor 1.5 de
#   gasolina como generador, 1.847 kg. Las páginas que se citan son las del PDF («PDF p.»).
#
# Todo lo que se publica va en ESPAÑOL y con palabras propias: el manual no se copia ni se
# traduce entero, porque tiene derechos de autor (lo dice su página 7).
#
# LECCIÓN: igual que aplicar.py, cada cambio es un «reemplazo exacto»; si el texto viejo no
# aparece, el programa se detiene y no deja nada a medias.
# Uso:  python3 herramientas/verificacion-s05/aplicar_max.py data/tips.json
# =====================================================================
import json
import sys

RUTA = sys.argv[1] if len(sys.argv) > 1 else 'data/tips.json'
HOY = '2026-11-22'
X = 'manual S05 Max'        # rango extendido (inglés)
E = 'manual S05 eléctrica'  # E-Max (ya citado desde v02.04)

datos = json.load(open(RUTA, encoding='utf-8'))
tips = datos['tips']
por_id = {t['id']: t for t in tips}
tocados = set()
nuevos = []


def tip(id_):
    if id_ not in por_id:
        raise SystemExit(f'No existe el tip {id_}')
    return por_id[id_]


def cambiar(id_, campo, viejo, nuevo):
    t = tip(id_)
    if t[campo].count(viejo) != 1:
        raise SystemExit(f'{id_}.{campo}: no encontré exactamente una vez «{viejo[:70]}»')
    t[campo] = t[campo].replace(viejo, nuevo)
    tocados.add(id_)


def poner(id_, **campos):
    t = tip(id_)
    for k, (antes, despues) in campos.items():
        if t[k] != antes:
            raise SystemExit(f'{id_}.{k} no es el esperado: {t[k]!r}')
        t[k] = despues
    tocados.add(id_)


def fuente(id_, ref, tipo='manual'):
    t = tip(id_)
    if any(f['ref'] == ref for f in t['fuentes']):
        raise SystemExit(f'{id_}: ya tenía la fuente {ref} (¿se corrió dos veces?)')
    pos = max([i for i, f in enumerate(t['fuentes']) if f['tipo'] == tipo], default=-1) + 1
    t['fuentes'].insert(pos, {'tipo': tipo, 'ref': ref})
    tocados.add(id_)


def nuevo(despues_de, t):
    if t['id'] in por_id:
        raise SystemExit(f'El tip {t["id"]} ya existe')
    i = next(i for i, x in enumerate(tips) if x['id'] == despues_de)
    base = {'tipo': 'hacer', 'cuando': '', 'como': '', 'ojo': '', 'saber': '', 'modelos': ['S05'], 'motor': ['REEV'],
            'confianza': 'oficial', 'verificacion': '', 'claves': '', 'fuentes': [], 'actualizado': HOY}
    base.update(t)
    tips.insert(i + 1, base)
    por_id[t['id']] = base
    nuevos.append(t['id'])


# ---------- Llantas: ahora los dos manuales de la S05 dicen 280 kPa ----------
cambiar('calibra-las-llantas-en-la-manana-antes-de-encend', 'como',
        '(2,8 bar; así lo dice el manual de la S05 eléctrica)', '(2,8 bar; así lo dicen los manuales de la S05 Max y de la eléctrica)')
fuente('calibra-las-llantas-en-la-manana-antes-de-encend', f'{X} (PDF p. 214)')

poner('s05-41-psi-en-las-cuatro-llantas',
      como=('41 PSI (unos 2,8 bar), adelante y atrás. Aplica a la REEV y a la eléctrica (en la eléctrica lo confirma su manual).',
            '41 PSI (unos 2,8 bar), adelante y atrás. Aplica a la S05 Max (rango extendido) y a la eléctrica: lo confirman sus dos manuales.'),
      verificacion=('Confirmado con el manual de la S05 eléctrica (E-Max): 280 kPa (2,8 bar, unos 41 PSI) adelante y atrás, '
                    'vacía o cargada, en rines de 18 y de 20. No se tuvo el manual de la S05 Max: los dueños leen 41 PSI en su etiqueta. '
                    'El manual europeo de la S05 (68,8 kWh, no se vende en Colombia) dice 290 kPa (42 PSI).',
                    'Confirmado con los manuales de la S05 Max y de la S05 eléctrica: 280 kPa (2,8 bar, unos 41 PSI) adelante y atrás, '
                    'vacía o cargada, en rines de 18 y de 20. Coincide con la etiqueta de la puerta que leen los dueños. '
                    'El manual europeo de la S05 (68,8 kWh, no se vende en Colombia) dice 290 kPa (42 PSI).'))
cambiar('s05-41-psi-en-las-cuatro-llantas', 'ojo', 'El manual de la eléctrica trae además', 'Los dos manuales traen además')
fuente('s05-41-psi-en-las-cuatro-llantas', f'{X} (PDF p. 230)')

cambiar('si-el-medidor-y-la-pantalla-no-coinciden-guiate-', 'como', 'de la S07 y de la S05 eléctrica dicen', 'de la S07 y de las dos S05 dicen')
fuente('si-el-medidor-y-la-pantalla-no-coinciden-guiate-', f'{X} (PDF p. 214)')
fuente('rota-alinea-y-balancea-cada-10-000-km', f'{X} (PDF p. 208)')
fuente('rota-alinea-y-balancea-cada-10-000-km', f'{X} (PDF p. 209)')
cambiar('arma-tu-kit-de-pinchazo-el-carro-no-trae-llanta-', 'como', '(lo confirma su manual)', '(lo confirman sus dos manuales)')
fuente('arma-tu-kit-de-pinchazo-el-carro-no-trae-llanta-', f'{X} (PDF p. 36)')
fuente('arma-tu-kit-de-pinchazo-el-carro-no-trae-llanta-', f'{X} (PDF p. 207)')

# ---------- Carga y batería ----------
fuente('ajusta-el-amperaje-desde-el-menu-de-energia', f'{X} (PDF p. 179)')
cambiar('si-la-pistola-de-carga-lenta-no-sale-usa-la-cuerda', 'ojo',
        'La ubicación de la cuerda sale del manual de la S05 eléctrica; en la S07 y en la S05 Max confírmala en el taller.',
        'La cuerda está en el mismo lugar en la S05 Max y en la eléctrica, según sus manuales; en la S07 confírmala en el taller.')
fuente('si-la-pistola-de-carga-lenta-no-sale-usa-la-cuerda', f'{X} (PDF p. 176)')

poner('s05-carga-al-100-una-vez-al-mes-en-carga-lenta',
      titulo=('S05: carga al 100 % en carga lenta (la eléctrica, cada semana)',
              'S05: carga al 100 % en carga lenta al menos una vez a la semana'),
      cuando=('S05 Max (rango extendido): una vez al mes, según el grupo. S05 E-Max (eléctrica): su manual pide carga completa '
              'al menos una vez a la semana si usas el carro con frecuencia. Mejor la noche antes de un viaje o de un día de mucho uso.',
              'Al menos una vez a la semana si usas el carro con frecuencia: lo piden los manuales de la S05 Max y de la eléctrica '
              '(en el grupo se decía una vez al mes). Mejor la noche antes de un viaje o de un día de mucho uso.'),
      verificacion=('Ampliado con el manual de la S05 eléctrica: carga completa al menos una vez a la semana. '
                    'El manual de la S07 Max no trae esa recomendación y no se tuvo el de la S05 Max.',
                    'Corregido con los manuales de las dos S05: carga completa al menos una vez a la semana (antes decía una vez al mes). '
                    'El manual de la S07 Max no trae esa recomendación.'))
fuente('s05-carga-al-100-una-vez-al-mes-en-carga-lenta', f'{X} (PDF p. 189)')

cambiar('dia-a-dia-manten-la-bateria-entre-20-y-90', 'ojo', 'En la S05 eléctrica, además, una carga completa a la semana',
        'En la S05 (las dos versiones), además, una carga completa a la semana')
fuente('dia-a-dia-manten-la-bateria-entre-20-y-90', f'{X} (PDF p. 190)')
fuente('si-el-carro-va-a-estar-quieto-mucho-tiempo', f'{X} (PDF p. 190)')

poner('quimica-de-la-bateria-casi-todas-son-lfp-solo-la',
      saber=('S05 Max (rango extendido): LFP de 27,28 kWh según la prensa del lanzamiento en Colombia. S05 E-Max (eléctrica): LFP de 56,12 kWh '
             'con refrigeración líquida según su manual. S07 Max (rango extendido): LFP de 31,73 kWh según su manual. S07 E-Max (eléctrica): NCM de '
             '79,47 kWh según la prensa del lanzamiento en Colombia. Las LFP toleran bien el 100 % y necesitan llegar ahí de vez en cuando para calibrar el porcentaje.',
             'S05 Max (rango extendido): LFP de 27,28 kWh. S05 E-Max (eléctrica): LFP de 56,12 kWh. Las dos con refrigeración líquida, según sus manuales. '
             'S07 Max (rango extendido): LFP de 31,73 kWh según su manual. S07 E-Max (eléctrica): NCM de 79,47 kWh según la prensa del lanzamiento '
             'en Colombia. Las LFP toleran bien el 100 % y necesitan llegar ahí de vez en cuando para calibrar el porcentaje.'),
      verificacion=('Corregido: el HTML anterior decía que la S07 es NMC sin distinguir versión. Agregadas las capacidades de la S05 '
                    '(manual de la E-Max y prensa para la Max).',
                    'Corregido: el HTML anterior decía que la S07 es NMC sin distinguir versión. Las capacidades de las dos S05 salen de sus manuales.'))
fuente('quimica-de-la-bateria-casi-todas-son-lfp-solo-la', f'{X} (PDF p. 228)')

# ---------- Energía (solo rango extendido) ----------
poner('s05-que-modo-usar-en-ciudad-carretera-y-montana',
      ojo=('En la S07 los modos se llaman distinto: mira el tip «S07: Urbano, Alta velocidad y Montaña».',
           'Según el manual, Prioridad eléctrica evita prender el generador y trae un interruptor de «eléctrico forzado» para usar más batería '
           '(solo si sabes que hay dónde cargar adelante: al salir de él, el motor trabaja más y gasta más). Prioridad combustible es para montaña '
           'y carretera rápida. En la S07 los modos se llaman distinto: mira el tip «S07: Urbano, Alta velocidad y Montaña».'),
      verificacion=('', 'Coincide con lo que recomienda el manual de la S05 Max para cada modo. Los porcentajes son del grupo y cambian con el software.'))
fuente('s05-que-modo-usar-en-ciudad-carretera-y-montana', f'{X} (PDF p. 97)')

poner('carga-de-aparcamiento-usala-solo-en-emergencia-y',
      confianza=('consenso', 'oficial'),
      ojo=('Nunca en garaje cerrado o sótano: el motor a gasolina genera gases. Tampoco como forma habitual de cargar.',
           'Nunca en garaje cerrado o sótano: el motor a gasolina genera gases (el manual pide un lugar abierto y ventilado). '
           'Tampoco como forma habitual de cargar: el manual la presenta para necesidades temporales. En la S05 tiene tres velocidades: baja, media y alta.'))
fuente('carga-de-aparcamiento-usala-solo-en-emergencia-y', f'{X} (PDF p. 98)')

cambiar('usa-gasolina-al-menos-cada-15-dias', 'ojo',
        'El manual de la S07 pide gasolina de grado 92 o superior según la norma china GB 17930; en el grupo hay debate sobre corriente o extra: pregunta en el taller.',
        'El manual de la S07 pide gasolina de grado 92 o superior según la norma china GB 17930 y el de la S05 Max, RON 91 o más '
        '(ver el tip «S05 Max: el manual pide gasolina RON 91 o más»).')
fuente('la-noche-antes-del-viaje-bateria-al-100-y-tanque', f'{X} (PDF p. 97)')

# ---------- Manejo y viajes ----------
cambiar('regeneracion-alta-en-ciudad-y-bajadas-baja-en-ca', 'como', '(en la S05 eléctrica: Estándar, Fuerte o Personalizada)',
        '(en la S05: Estándar, Fuerte o Personalizada)')
fuente('regeneracion-alta-en-ciudad-y-bajadas-baja-en-ca', f'{X} (PDF p. 96)')
cambiar('con-la-bateria-al-100-no-hay-freno-regenerativo-', 'ojo', 'Los manuales de la S07 y de la S05 eléctrica advierten',
        'Los manuales de la S07 y de las dos S05 advierten')
fuente('con-la-bateria-al-100-no-hay-freno-regenerativo-', f'{X} (PDF p. 8)')

# ---------- Funciones, grúa, puertas, V2L ----------
cambiar('ubica-la-apertura-mecanica-de-las-puertas-antes-', 'como', 'En la S05 (según el manual de la eléctrica), desde adentro',
        'En la S05 (Max y eléctrica, según sus manuales), desde adentro')
fuente('ubica-la-apertura-mecanica-de-las-puertas-antes-', f'{X} (PDF p. 23)')
fuente('ubica-la-apertura-mecanica-de-las-puertas-antes-', f'{X} (PDF p. 33)')
fuente('ubica-la-apertura-mecanica-de-las-puertas-antes-', f'{X} (PDF p. 220)')
fuente('si-necesitas-grua-pide-de-plataforma', f'{X} (PDF p. 237)')
cambiar('modo-de-remolque-activalo-antes-de-que-lo-suban-', 'ojo',
        'La ruta de la S05 sale del manual de la eléctrica; en la Max debería ser igual, pero confírmalo la primera vez.',
        'En la S05 la ruta es la misma en la Max y en la eléctrica, según sus manuales.')
fuente('modo-de-remolque-activalo-antes-de-que-lo-suban-', f'{X} (PDF p. 236)')

cambiar('usa-el-carro-como-toma-de-220-v-v2l', 'ojo',
        'Está en los manuales de la S07 Max y de la S05 eléctrica; en la S05 Max confírmalo en el taller.',
        'Está en los manuales de la S07 Max y de las dos S05. En la S05 Max puedes activar «Arrancar el motor con batería baja» '
        '(en los ajustes de descarga): el generador recarga mientras das corriente, y se detiene cuando se acaban la batería y la gasolina.')
fuente('usa-el-carro-como-toma-de-220-v-v2l', f'{X} (PDF p. 180)')

fuente('s05-instala-las-actualizaciones-en-p-con-buena-s', f'{X} (PDF p. 223)')

# ---------- Mantenimiento ----------
cambiar('calendario-de-revisiones-por-kilometros-o-por-me', 'verificacion', 'de la S07 y de la S05 eléctrica fijan', 'de la S07 y de las dos S05 fijan')
fuente('calendario-de-revisiones-por-kilometros-o-por-me', f'{X} (PDF p. 184)')
cambiar('que-piden-en-cada-revision', 'verificacion',
        'No se tuvo el manual de la S05 Max (rango extendido): para su motor a gasolina, pregunta el plan en el taller.',
        'El plan de la S05 Max (rango extendido) está en el tip siguiente.')
fuente('cambia-el-filtro-del-aire-acondicionado-cada-10-', f'{X} (PDF p. 186)')
cambiar('cambia-el-filtro-del-aire-acondicionado-cada-10-', 'verificacion', 'El manual de la S05 eléctrica recomienda',
        'Los manuales de las dos S05 recomiendan')

# ---------- Nuevos ----------
nuevo('que-piden-en-cada-revision', {
    'id': 's05-max-plan-de-mantenimiento-del-fabricante',
    'cat': 'mantenimiento',
    'tipo': 'saber',
    'titulo': 'S05 Max: plan de mantenimiento del fabricante',
    'saber': 'Aceite del motor y su filtro: en cada revisión (5.000, 15.000, 25.000 km…). Usa 0W-16 de calidad SP/GF-6 o superior; lleva unos 4 litros. '
             'Filtro de aire del motor: a los 25.000 km y luego cada 20.000 (45.000, 65.000…). Bujías: después de 30.000 km recorridos con el motor '
             'de gasolina encendido, no del kilometraje total. Filtro de gasolina (viene dentro de la bomba): cada 4 años o 100.000 km. Lubricante del '
             'reductor: cada 3 años o 60.000 km. Líquido de frenos: a los 45.000 y a los 85.000 km. Filtro del aire acondicionado: desde los 10.000 km. '
             'Refrigerante: revisión cada 10.000 km y cambio a los 36 meses u 80.000 km.',
    'ojo': 'En vías polvorientas el manual pide revisar el filtro de aire del motor cada 2.500 km o 3 meses. En la práctica, Vardí cambia el aceite del reductor a los 5.000 km.',
    'claves': 'mantenimiento aceite motor filtro bujias reductor 0w16 revision plan fabricante max rango extendido',
    'fuentes': [{'tipo': 'manual', 'ref': f'{X} (PDF p. 185)'}, {'tipo': 'manual', 'ref': f'{X} (PDF p. 186)'},
                {'tipo': 'manual', 'ref': f'{X} (PDF p. 187)'}, {'tipo': 'manual', 'ref': f'{X} (PDF p. 201)'}],
})

nuevo('usa-gasolina-al-menos-cada-15-dias', {
    'id': 's05-max-el-manual-pide-gasolina-ron-91',
    'cat': 'energia',
    'titulo': 'S05 Max: el manual pide gasolina RON 91 o más',
    'cuando': 'Cada vez que tanquees.',
    'como': 'El manual de la S05 Max pide gasolina de RON 91 o más y remite a las normas de cada país; el tanque es de 51 litros. En Colombia, la extra '
            'ronda RON 94–95 y cumple; la corriente tiene menos octanaje (la prensa la ubica alrededor de RON 84–85 con etanol).',
    'ojo': 'En el grupo la mayoría tanquea corriente sin problemas y varios dicen que el concesionario la acepta; otros prefieren extra porque la '
           'gasolina pasa semanas en el tanque. Pide al taller, por escrito, cuál exige la garantía de tu carro.',
    'confianza': 'disputa',
    'claves': 'gasolina corriente extra octanaje octanos ron 91 tanque 51 litros combustible garantia',
    'fuentes': [{'tipo': 'manual', 'ref': f'{X} (PDF p. 226)'}, {'tipo': 'manual', 'ref': f'{X} (PDF p. 234)'},
                {'tipo': 'web', 'ref': 'El Tiempo y La República: corriente ~RON 84–85; extra ~RON 94–95'},
                {'tipo': 'chat', 'ref': 'varios propietarios (debate corriente o extra)'}],
})

nuevo('la-noche-antes-del-viaje-bateria-al-100-y-tanque', {
    'id': 's05-max-para-tanquear-desbloquea-la-tapa-en-la-pantalla',
    'cat': 'viajes',
    'titulo': 'S05 Max: para tanquear, desbloquea la tapa desde la pantalla',
    'cuando': 'En la bomba, antes de que llegue el islero.',
    'como': 'Con el carro encendido y en P, toca el botón de la tapa del tanque en la pantalla (en el carro en 3D o en el menú que se baja). Luego presiona '
            'la tapa, que está atrás a la izquierda, y se abre sola. Al terminar, aprieta la tapa del tubo hasta oír dos o más clics y cierra la tapa con la mano.',
    'ojo': 'El tanque es presurizado: por eso no abre con el carro apagado. Si el motor estaba encendido, se apaga al desbloquear la tapa. '
           'Si la pistola salta muchas veces, deja de tanquear y consulta en el taller.',
    'claves': 'tanquear gasolina tapa tanque no abre presurizado bomba repostar',
    'fuentes': [{'tipo': 'manual', 'ref': f'{X} (PDF p. 182)'}, {'tipo': 'manual', 'ref': f'{X} (PDF p. 183)'}],
})

nuevo('si-se-acaba-la-bateria-en-la-via', {
    'id': 's05-max-modo-de-emergencia-para-llegar-a-la-bomba',
    'cat': 'viajes',
    'titulo': 'S05 Max: usa el modo de emergencia para llegar a la bomba o al cargador',
    'cuando': 'Cuando la autonomía total (gasolina más batería) no alcanza; el carro te lo propone en la pantalla.',
    'como': 'Centro del vehículo > Conducción > Modo de emergencia. Limita la potencia y apaga funciones de confort y entretenimiento para estirar la autonomía. '
            'Si necesitas el aire, la ventilación de los asientos o la música, los puedes prender a mano.',
    'ojo': 'El modo se apaga solo cuando tanqueas o cargas. Con la potencia limitada, ten cuidado al adelantar.',
    'claves': 'modo emergencia autonomia baja sin gasolina sin bateria llegar bomba cargador',
    'fuentes': [{'tipo': 'manual', 'ref': f'{X} (PDF p. 97)'}, {'tipo': 'manual', 'ref': f'{X} (PDF p. 98)'}],
})

for i in tocados:
    por_id[i]['actualizado'] = HOY
datos['version'] = '2026.11.22'
open(RUTA, 'w', encoding='utf-8').write(json.dumps(datos, ensure_ascii=False, indent=1))
print(f'{len(tocados)} tips actualizados y {len(nuevos)} nuevos: {len(tips)} en total.')
