import { describe, expect, it } from 'vitest';

import { validarReglasConfirmacion } from './confirmaciones';

describe('validarReglasConfirmacion', () => {
  it('rechaza auto-confirmación', () => {
    expect(() =>
      validarReglasConfirmacion({
        reporteId: 'rep-1',
        creadorId: 'usuario-1',
        usuarioActualId: 'usuario-1',
        usuariosQueConfirmaron: [],
      }),
    ).toThrowError('No puedes confirmar tu propio reporte.');
  });

  it('rechaza doble confirmación', () => {
    expect(() =>
      validarReglasConfirmacion({
        reporteId: 'rep-1',
        creadorId: 'usuario-1',
        usuarioActualId: 'usuario-2',
        usuariosQueConfirmaron: ['usuario-2'],
      }),
    ).toThrowError('No puedes confirmar dos veces el mismo reporte.');
  });

  it('acepta confirmación válida', () => {
    expect(
      validarReglasConfirmacion({
        reporteId: 'rep-1',
        creadorId: 'usuario-1',
        usuarioActualId: 'usuario-2',
        usuariosQueConfirmaron: ['usuario-3'],
      }),
    ).toBe(true);
  });
});
