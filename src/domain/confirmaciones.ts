export type ValidacionConfirmacion = {
  reporteId: string;
  creadorId: string;
  usuarioActualId: string;
  usuariosQueConfirmaron: string[];
};

export function validarReglasConfirmacion(validacion: ValidacionConfirmacion) {
  if (validacion.creadorId === validacion.usuarioActualId) {
    throw new Error('No puedes confirmar tu propio reporte.');
  }

  if (validacion.usuariosQueConfirmaron.includes(validacion.usuarioActualId)) {
    throw new Error('No puedes confirmar dos veces el mismo reporte.');
  }

  return true;
}
