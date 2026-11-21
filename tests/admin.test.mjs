import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { validarTip, fusionarTips } = await import('../js/admin.js');
const CAT = JSON.parse(fs.readFileSync(new URL('../data/catalogos.json', import.meta.url), 'utf8'));
const TIPS = JSON.parse(fs.readFileSync(new URL('../data/tips.json', import.meta.url), 'utf8'));

test('validarTip limpia lo que devuelve una IA (aunque venga con trampas)', () => {
  const t = validarTip({ cat: 'inventada', titulo: ' Hola\n<script>x</script> ', tipo: 'otro', modelos: ['s07', 'S99'], motor: 'reev ev', confianza: 'maxima', claves: 'Presión, LLANTAS!' }, CAT);
  assert.equal(t.cat, CAT.categorias[0].id);
  assert.equal(t.tipo, 'hacer');
  assert.deepEqual(t.modelos, ['S07']);
  assert.deepEqual(t.motor, ['REEV', 'EV']);
  assert.equal(t.confianza, 'reporte');
  assert.equal(t.claves, 'presion llantas');
  assert.ok(t.titulo.length <= 120);
});

test('fusionarTips: edita, agrega en su categoría y elimina', () => {
  const primero = TIPS.tips[0];
  const borr = {
    tips: { [primero.id]: { ...primero, titulo: 'Editado' }, nuevo: { id: 'nuevo', cat: 'carga', titulo: 'Nuevo tip', tipo: 'hacer', como: 'x', modelos: [], motor: [], confianza: 'reporte', claves: '', fuentes: [] } },
    borrados: [TIPS.tips[1].id], contactos: [],
  };
  const f = fusionarTips(TIPS, borr, '2026-11-21');
  assert.equal(f.tips[0].titulo, 'Editado');
  assert.ok(!f.tips.some((t) => t.id === TIPS.tips[1].id));
  const i = f.tips.findIndex((t) => t.id === 'nuevo');
  assert.equal(f.tips[i - 1].cat, 'carga');
  assert.notEqual(f.tips[i + 1].cat, 'carga');
  assert.equal(f.ultimoChat, '2026-11-21');
  assert.equal(f.tips.length, TIPS.tips.length);
});
