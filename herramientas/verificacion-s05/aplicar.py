# =====================================================================
# aplicar.py — Contraste de los tips con el manual de la Deepal S05 (22 nov 2026).
#
# Qué manual se usó (lo entregó el administrador):
#   - «DEEPAL_S05_ESPA_OL.pdf» (265 páginas): manual de la S05 ELÉCTRICA, edición de
#     enero de 2025 traducida del inglés. Sus datos coinciden con la S05 E-Max que se
#     vende en Colombia: batería LFP de 56,12 kWh, 175 kW (234 hp), 320 Nm, 1.777 kg,
#     458 km. Las páginas que se citan son las del PDF («PDF p.»).
#   - «Manual_de_usuario_S05.pdf» (274 páginas): S05 eléctrica europea (68,82 kWh,
#     WLTP, 2WD y 4WD). Esa versión NO se vende en Colombia; solo se usa para avisar
#     donde difiere (presión de llantas).
#   - No hubo manual de la S05 Max (rango extendido), que es la mayoría en Colombia.
#
# LECCIÓN: cada cambio es un «reemplazo exacto». Si el texto viejo no aparece, el
# programa se detiene: así nunca queda un cambio a medias ni se pisa algo que ya
# había cambiado otra persona.
# Uso:  python3 herramientas/verificacion-s05/aplicar.py data/tips.json
# =====================================================================
import json
import sys

RUTA = sys.argv[1] if len(sys.argv) > 1 else 'data/tips.json'
HOY = '2026-11-22'
M = 'manual S05 eléctrica'  # nombre corto de la fuente en las tarjetas

datos = json.load(open(RUTA, encoding='utf-8'))
tips = datos['tips']
por_id = {t['id']: t for t in tips}
tocados = set()


def tip(id_):
    if id_ not in por_id:
        raise SystemExit(f'No existe el tip {id_}')
    return por_id[id_]


def cambiar(id_, campo, viejo, nuevo):
    """Reemplazo exacto dentro de un campo de texto."""
    t = tip(id_)
    if t[campo].count(viejo) != 1:
        raise SystemExit(f'{id_}.{campo}: no encontré exactamente una vez «{viejo[:60]}»')
    t[campo] = t[campo].replace(viejo, nuevo)
    tocados.add(id_)


def poner(id_, **campos):
    """Reemplaza campos completos (con el valor anterior como seguro)."""
    t = tip(id_)
    for k, (antes, despues) in campos.items():
        if t[k] != antes:
            raise SystemExit(f'{id_}.{k} no es el esperado: {t[k]!r}')
        t[k] = despues
    tocados.add(id_)


def fuente(id_, ref, tipo='manual', despues_de=None):
    """Agrega una fuente (si no está) después de la última del mismo tipo."""
    t = tip(id_)
    if any(f['ref'] == ref for f in t['fuentes']):
        return
    pos = max([i for i, f in enumerate(t['fuentes']) if f['tipo'] == tipo], default=-1) + 1
    t['fuentes'].insert(pos, {'tipo': tipo, 'ref': ref})
    tocados.add(id_)


def quitar_fuente(id_, ref):
    t = tip(id_)
    antes = len(t['fuentes'])
    t['fuentes'] = [f for f in t['fuentes'] if f['ref'] != ref]
    if len(t['fuentes']) == antes:
        raise SystemExit(f'{id_}: no tenía la fuente {ref}')
    tocados.add(id_)


def nuevo(despues_de, t):
    """Inserta un tip nuevo justo después de otro (queda en su categoría)."""
    if t['id'] in por_id:
        raise SystemExit(f'El tip {t["id"]} ya existe')
    i = next(i for i, x in enumerate(tips) if x['id'] == despues_de)
    base = {'tipo': 'hacer', 'cuando': '', 'como': '', 'ojo': '', 'saber': '', 'modelos': [], 'motor': [],
            'confianza': 'oficial', 'verificacion': '', 'claves': '', 'fuentes': [], 'actualizado': HOY}
    base.update(t)
    tips.insert(i + 1, base)
    por_id[t['id']] = base


# ---------- Llantas ----------
cambiar('calibra-las-llantas-en-la-manana-antes-de-encend', 'como',
        'S05 a 41 PSI; S07 a 39 PSI (2,7 bar) según su manual.',
        'S05 a 41 PSI (2,8 bar; así lo dice el manual de la S05 eléctrica); S07 a 39 PSI (2,7 bar) según su manual.')
fuente('calibra-las-llantas-en-la-manana-antes-de-encend', f'{M} (PDF p. 210)')

poner('s05-41-psi-en-las-cuatro-llantas',
      confianza=('consenso', 'oficial'),
      verificacion=('Confirmado por varios dueños con la etiqueta de la puerta. No se tuvo el manual de la S05 para contrastar.',
                    'Confirmado con el manual de la S05 eléctrica (E-Max): 280 kPa (2,8 bar, unos 41 PSI) adelante y atrás, '
                    'vacía o cargada, en rines de 18 y de 20. No se tuvo el manual de la S05 Max: los dueños leen 41 PSI en su etiqueta. '
                    'El manual europeo de la S05 (68,8 kWh, no se vende en Colombia) dice 290 kPa (42 PSI).'))
cambiar('s05-41-psi-en-las-cuatro-llantas', 'ojo', 'la etiqueta de tu carro manda.',
        'la etiqueta de tu carro manda. El manual de la eléctrica trae además una presión «cómoda» de 250 kPa (unos 36 PSI), solo para ir sin carga, '
        'y pide volver a 280 kPa si vas a más de 160 km/h.')
cambiar('s05-41-psi-en-las-cuatro-llantas', 'como', 'Aplica a la REEV y a la eléctrica.',
        'Aplica a la REEV y a la eléctrica (en la eléctrica lo confirma su manual).')
fuente('s05-41-psi-en-las-cuatro-llantas', f'{M} (PDF p. 225)')

cambiar('si-el-medidor-y-la-pantalla-no-coinciden-guiate-', 'como',
        'El manual de la S07 dice que la referencia es la lectura del TPMS.',
        'Los manuales de la S07 y de la S05 eléctrica dicen que la referencia es la lectura del TPMS.')
fuente('si-el-medidor-y-la-pantalla-no-coinciden-guiate-', f'{M} (PDF p. 210)')

fuente('rota-alinea-y-balancea-cada-10-000-km', f'{M} (PDF p. 203)')
fuente('rota-alinea-y-balancea-cada-10-000-km', f'{M} (PDF p. 205)')
cambiar('rota-alinea-y-balancea-cada-10-000-km', 'ojo', 'un dueño cambió llantas a los 15.000 km por llevarlas bajas.',
        'un dueño cambió llantas a los 15.000 km por llevarlas bajas. El manual de la S05 pide cambiar toda llanta de más de 6 años, aunque se vea bien.')

poner('arma-tu-kit-de-pinchazo-el-carro-no-trae-llanta-', confianza=('consenso', 'oficial'))
cambiar('arma-tu-kit-de-pinchazo-el-carro-no-trae-llanta-', 'como',
        'En la S05 la toma de 12 V está en el baúl y el cable no llega a las delanteras',
        'En la S05 la única toma de 12 V está en el baúl (lo confirma su manual) y el cable no llega a las delanteras')
cambiar('arma-tu-kit-de-pinchazo-el-carro-no-trae-llanta-', 'ojo',
        'El sellante es de un solo uso y vence: revisa la fecha en la botella.',
        'El sellante es de un solo uso, solo sirve para huecos de menos de 6 mm en la banda y vence: revisa la fecha en la botella.')
fuente('arma-tu-kit-de-pinchazo-el-carro-no-trae-llanta-', f'{M} (PDF p. 37)')
fuente('arma-tu-kit-de-pinchazo-el-carro-no-trae-llanta-', f'{M} (PDF p. 203)')

# ---------- Carga ----------
poner('ajusta-el-amperaje-desde-el-menu-de-energia',
      confianza=('reporte', 'oficial'),
      como=('S05: menú de Energía > tuerca arriba a la derecha > elige 8 A, 13 A o Máximo. S07: el límite viene en 32 A y se baja en la pantalla central (solo aplica a la carga lenta).',
            'S05: Centro del vehículo > Energía > Más > Límite de corriente de carga. Viene en «Máximo»; los dueños ven también 8 A y 13 A. '
            'S07: el límite viene en 32 A y se baja en la pantalla central. En los dos, solo aplica a la carga lenta.'),
      ojo=('En un toma doméstico, el manual de la S07 pide que soporte al menos 16 A. En tomas dudosas o extensiones, usa el valor más bajo.',
           'En un toma doméstico, los manuales de la S07 y de la S05 piden que soporte al menos 16 A. En tomas dudosas o extensiones, usa el valor más bajo, '
           'y nunca pongas más corriente de la que aguanta el cable.'))
fuente('ajusta-el-amperaje-desde-el-menu-de-energia', f'{M} (PDF p. 179)')

# ---------- Batería ----------
poner('s05-carga-al-100-una-vez-al-mes-en-carga-lenta',
      titulo=('S05: carga al 100 % una vez al mes, en carga lenta',
              'S05: carga al 100 % en carga lenta (la eléctrica, cada semana)'),
      cuando=('Una vez al mes, idealmente la noche antes de un viaje o de un día de mucho uso.',
              'S05 Max (rango extendido): una vez al mes, según el grupo. S05 E-Max (eléctrica): su manual pide carga completa '
              'al menos una vez a la semana si usas el carro con frecuencia. Mejor la noche antes de un viaje o de un día de mucho uso.'),
      verificacion=('', 'Ampliado con el manual de la S05 eléctrica: carga completa al menos una vez a la semana. '
                        'El manual de la S07 Max no trae esa recomendación y no se tuvo el de la S05 Max.'))
fuente('s05-carga-al-100-una-vez-al-mes-en-carga-lenta', f'{M} (PDF p. 185)')

cambiar('dia-a-dia-manten-la-bateria-entre-20-y-90', 'ojo',
        'Si cargas al 100 %, sal a usar el carro en menos de 24 horas.',
        'Si cargas al 100 %, sal a usar el carro en menos de 24 horas. En la S05 eléctrica, además, una carga completa a la semana (ver el tip de la S05).')
cambiar('dia-a-dia-manten-la-bateria-entre-20-y-90', 'ojo', 'El manual de la S07 pide', 'Los manuales de la S07 y de la S05 piden')
fuente('dia-a-dia-manten-la-bateria-entre-20-y-90', f'{M} (PDF p. 186)')

poner('quimica-de-la-bateria-casi-todas-son-lfp-solo-la',
      saber=('S05 (Max y E-Max): LFP de CATL según el grupo. S07 Max (rango extendido): LFP de 31,73 kWh según su manual. S07 E-Max (eléctrica): NCM de 79,47 kWh según la prensa del lanzamiento en Colombia. Las LFP toleran bien el 100 % y necesitan llegar ahí de vez en cuando para calibrar el porcentaje.',
             'S05 Max (rango extendido): LFP de 27,28 kWh según la prensa del lanzamiento en Colombia. S05 E-Max (eléctrica): LFP de 56,12 kWh '
             'con refrigeración líquida según su manual. S07 Max (rango extendido): LFP de 31,73 kWh según su manual. S07 E-Max (eléctrica): NCM de '
             '79,47 kWh según la prensa del lanzamiento en Colombia. Las LFP toleran bien el 100 % y necesitan llegar ahí de vez en cuando para calibrar el porcentaje.'),
      verificacion=('Corregido: el HTML anterior decía que la S07 es NMC sin distinguir versión.',
                    'Corregido: el HTML anterior decía que la S07 es NMC sin distinguir versión. Agregadas las capacidades de la S05 '
                    '(manual de la E-Max y prensa para la Max).'))
fuente('quimica-de-la-bateria-casi-todas-son-lfp-solo-la', f'{M} (PDF p. 223)')
fuente('quimica-de-la-bateria-casi-todas-son-lfp-solo-la', 'El Carro Colombiano: S05 Max LFP 27,28 kWh; S05 E-Max LFP 56,12 kWh', tipo='web')

cambiar('s07-e-max-electrica-dia-a-dia-al-80', 'ojo', 'esa usa LFP, como la S05.', 'esa usa LFP, como las dos S05.')

# ---------- Manejo y viajes ----------
cambiar('con-la-bateria-al-100-no-hay-freno-regenerativo-', 'ojo', 'El manual advierte',
        'Los manuales de la S07 y de la S05 eléctrica advierten')
fuente('con-la-bateria-al-100-no-hay-freno-regenerativo-', f'{M} (PDF p. 8)')

cambiar('regeneracion-alta-en-ciudad-y-bajadas-baja-en-ca', 'como', 'Se ajusta en el modo Personalizado.',
        'Se ajusta en el modo Personalizado (en la S05 eléctrica: Estándar, Fuerte o Personalizada).')
cambiar('regeneracion-alta-en-ciudad-y-bajadas-baja-en-ca', 'ojo', 'Al 100 % en plano frena mucho y cansa.',
        'Con regeneración fuerte se encienden las luces de freno al soltar el acelerador. Al 100 % en plano frena mucho y cansa.')
fuente('regeneracion-alta-en-ciudad-y-bajadas-baja-en-ca', f'{M} (PDF p. 98)')

# ---------- Funciones, grúa y remolque ----------
cambiar('si-necesitas-grua-pide-de-plataforma', 'como',
        'El gancho de arrastre viene en el kit del baúl (manual S05: pág. 213).',
        'El gancho de arrastre viene en la caja de herramientas del baúl; en la S05 se enrosca abajo a la derecha del bumper delantero, tras quitar la tapita.')
fuente('si-necesitas-grua-pide-de-plataforma', f'{M} (PDF p. 230)')
fuente('si-necesitas-grua-pide-de-plataforma', f'{M} (PDF p. 231)')

poner('modo-de-remolque-activalo-antes-de-que-lo-suban-',
      modelos=(['S07'], []),
      como=('Pantalla central > Modo de remolque y acepta el aviso. La transmisión pasa de P a N y se suelta el freno de mano.',
            'S07: pantalla central > Modo de remolque. S05: Centro del vehículo > Mantenimiento de seguridad > Modo de remolque '
            '(con el carro desbloqueado, en P y pisando el freno). Acepta el aviso: la transmisión pasa de P a N y se suelta el freno de mano.'),
      ojo=('Hazlo en terreno plano para que no se deslice. Sin el modo de remolque se pueden dañar piezas. En la S05 búscalo en la pantalla o pregunta en el taller.',
           'Hazlo en terreno plano para que no se deslice. Sin el modo de remolque se pueden dañar piezas. La ruta de la S05 sale del manual de la eléctrica; '
           'en la Max debería ser igual, pero confírmalo la primera vez.'))
fuente('modo-de-remolque-activalo-antes-de-que-lo-suban-', f'{M} (PDF p. 229)')

poner('ubica-la-apertura-mecanica-de-las-puertas-antes-',
      titulo=('Ubica la apertura mecánica de las puertas antes de necesitarla',
              'Aprende a abrir las puertas si se acaba la batería de 12 V'),
      como=('Busca en el manual la guaya de apertura mecánica de las puertas (manijas a ras). Existe en S05 y S07.',
            'En la S05 (según el manual de la eléctrica), desde adentro: con el carro quieto y cerrado, hala la manija interior dos veces (una vez si no tiene seguro). '
            'Desde afuera: si la batería de 12 V se descargó, quita la tapita del bumper trasero, conecta un arrancador '
            '(rojo al positivo, negro al negativo) al puerto de desbloqueo de emergencia y desbloquea enseguida. '
            'El baúl se abre desde adentro: abate los asientos traseros, quita la tapa de la compuerta y gira la manija blanca. '
            'En la S07 su manual no lo explica: pregunta en el taller cómo es el suyo.'),
      ojo=('', 'El arrancador en ese puerto no puede quedarse más de 30 segundos: se funde un fusible y la próxima vez no funcionará.'),
      confianza=('reporte', 'oficial'),
      claves=('guaya manija emergencia abrir puertas',
              'guaya manija emergencia abrir puertas bateria 12v descargada arrancador baul'))
quitar_fuente('ubica-la-apertura-mecanica-de-las-puertas-antes-', 'grupo de propietarios')
fuente('ubica-la-apertura-mecanica-de-las-puertas-antes-', f'{M} (PDF p. 22)')
fuente('ubica-la-apertura-mecanica-de-las-puertas-antes-', f'{M} (PDF p. 33)')
fuente('ubica-la-apertura-mecanica-de-las-puertas-antes-', f'{M} (PDF p. 215)')
fuente('ubica-la-apertura-mecanica-de-las-puertas-antes-', 'grupo de propietarios', tipo='chat')

# ---------- Software ----------
poner('s05-instala-las-actualizaciones-en-p-con-buena-s',
      como=('Con el carro parqueado, lee el aviso antes de aceptar (algunas versiones fueron beta). Si sale “actualización pausada” o error de validación, reinicia la pantalla e intenta de nuevo.',
            'Centro del vehículo > Sistema > Actualización del sistema. Con el carro parqueado en P, sin cargar ni dar corriente afuera y con la batería '
            'bien cargada, lee el aviso antes de aceptar (algunas versiones fueron beta). Puedes elegir «Actualizar ahora» o programarla para la noche. '
            'Si sale “actualización pausada” o error de validación, reinicia la pantalla e intenta de nuevo.'),
      ojo=('', 'Mientras se actualiza, el carro no se puede manejar.'))
fuente('s05-instala-las-actualizaciones-en-p-con-buena-s', f'{M} (PDF p. 219)')

# ---------- Mantenimiento ----------
cambiar('calendario-de-revisiones-por-kilometros-o-por-me', 'verificacion',
        'Ampliado: el manual de la S07 fija también meses',
        'Ampliado: los manuales de la S07 y de la S05 eléctrica fijan también meses')
fuente('calendario-de-revisiones-por-kilometros-o-por-me', f'{M} (PDF p. 181)')

poner('que-piden-en-cada-revision',
      saber=('Manual S07 Max: el aceite y el filtro del motor a gasolina se cambian en cada revisión (5.000, 15.000, 25.000 km…); las bujías cada 20.000 km; el lubricante del reductor la primera vez a los 10.000 km y luego cada 60.000 km; el filtro del aire acondicionado desde los 15.000 km y cada 10.000; el líquido de frenos a los 45.000 km. En la práctica, Vardí cambia el aceite del reductor a los 5.000 km. 10.000 km: rotación de llantas, pila del control y líquidos.',
             'Manual S07 Max: el aceite y el filtro del motor a gasolina se cambian en cada revisión (5.000, 15.000, 25.000 km…); las bujías cada 20.000 km; '
             'el lubricante del reductor la primera vez a los 10.000 km y luego cada 60.000 km; el filtro del aire acondicionado desde los 15.000 km y cada 10.000; '
             'el líquido de frenos a los 45.000 km. Manual S05 eléctrica (no tiene motor a gasolina): lubricante del reductor cada 3 años o 60.000 km; '
             'líquido de frenos a los 45.000 y a los 85.000 km; filtro del aire acondicionado desde los 10.000 km; refrigerante revisado cada 10.000 km y '
             'cambiado a los 36 meses u 80.000 km; en cada revisión, inspección de la batería de alto voltaje y su cableado. '
             'En la práctica, Vardí cambia el aceite del reductor a los 5.000 km. 10.000 km: rotación de llantas, pila del control y líquidos.'),
      verificacion=('Corregido y ampliado con el plan de mantenimiento del manual de la S07. No se tuvo el manual de la S05.',
                    'Corregido y ampliado con los planes de mantenimiento de los manuales de la S07 Max y de la S05 eléctrica. '
                    'No se tuvo el manual de la S05 Max (rango extendido): para su motor a gasolina, pregunta el plan en el taller.'))
fuente('que-piden-en-cada-revision', f'{M} (PDF p. 182)')
fuente('que-piden-en-cada-revision', f'{M} (PDF p. 183)')

fuente('si-el-carro-va-a-estar-quieto-mucho-tiempo', f'{M} (PDF p. 186)')

poner('cambia-el-filtro-del-aire-acondicionado-cada-10-', confianza=('consenso', 'oficial'),
      verificacion=('', 'El manual de la S05 eléctrica recomienda cambiarlo después de los 10.000 km; el de la S07 Max, desde los 15.000 y cada 10.000.'))
fuente('cambia-el-filtro-del-aire-acondicionado-cada-10-', f'{M} (PDF p. 183)')
fuente('cambia-el-filtro-del-aire-acondicionado-cada-10-', 'manual S07 Max (PDF p. 203)')

# ---------- Nuevos ----------
nuevo('ajusta-el-amperaje-desde-el-menu-de-energia', {
    'id': 'si-la-pistola-de-carga-lenta-no-sale-usa-la-cuerda',
    'cat': 'carga',
    'titulo': 'Si la pistola de carga lenta no sale, usa la cuerda de emergencia del baúl',
    'cuando': 'Cuando terminaste de cargar en AC, desbloqueaste el carro y la pistola sigue trabada.',
    'como': 'Primero desbloquea el carro con la llave e intenta otra vez. Si sigue trabada, en la S05 quita la tapa decorativa del lado derecho del baúl '
            'y hala la cuerda de desbloqueo de emergencia. En la carga rápida (DC) es distinto: la suelta el cargador cuando lo detienes.',
    'ojo': 'Puedes activar el «Desbloqueo automático del puerto de carga lenta» (Centro del vehículo > Energía > Carga y descarga) para que suelte la pistola sola al terminar. '
           'La ubicación de la cuerda sale del manual de la S05 eléctrica; en la S07 y en la S05 Max confírmala en el taller.',
    'modelos': ['S05'],
    'claves': 'pistola cargador trabada atascada no sale desbloqueo emergencia cuerda puerto carga',
    'fuentes': [{'tipo': 'manual', 'ref': f'{M} (PDF p. 176)'}, {'tipo': 'manual', 'ref': f'{M} (PDF p. 178)'}],
})

nuevo('ubica-la-apertura-mecanica-de-las-puertas-antes-', {
    'id': 'usa-el-carro-como-toma-de-220-v-v2l',
    'cat': 'funciones',
    'titulo': 'Usa el carro como toma de 220 V con un adaptador V2L',
    'cuando': 'Para un paseo, un corte de luz o una herramienta en el campo.',
    'como': 'El carro entrega 220 V por la toma de carga lenta. Necesitas un adaptador de descarga (V2L) tipo 2: se compra aparte. Con el carro encendido y en P, en un lugar ventilado, conéctalo, '
            'activa la descarga (en la S05: Centro del vehículo > Energía > Carga y descarga > Descarga externa) y prende el interruptor del adaptador. '
            'Al terminar, apaga el interruptor y desconecta.',
    'ojo': 'Da 220 V: no conectes aparatos de 110 V ni más potencia de la que permite el adaptador. Se detiene sola cuando la batería queda baja. '
           'No es para cargar otro carro (los dueños lo discuten, pero no está en el manual). Nunca lo toques con las manos mojadas ni lo dejes al alcance de niños. '
           'Está en los manuales de la S07 Max y de la S05 eléctrica; en la S05 Max confírmalo en el taller.',
    'claves': 'v2l descarga externa 220 toma corriente electrodomesticos camping apagon adaptador',
    'fuentes': [{'tipo': 'manual', 'ref': f'{M} (PDF p. 179)'}, {'tipo': 'manual', 'ref': f'{M} (PDF p. 180)'},
                {'tipo': 'manual', 'ref': 'manual S07 Max (PDF p. 199)'}, {'tipo': 'chat', 'ref': 'varios propietarios (adaptador comprado aparte)'}],
})

for i in tocados:
    por_id[i]['actualizado'] = HOY
datos['version'] = '2026.11.22'
open(RUTA, 'w', encoding='utf-8').write(json.dumps(datos, ensure_ascii=False, indent=1))
print(f'{len(tocados)} tips actualizados y 2 nuevos: {len(tips)} en total.')
