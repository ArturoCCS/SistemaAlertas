import type { EstadoReporte } from '@/src/types/database';

export function tieneClaveGoogleMapsConfigurada(claveGoogleMaps: string | undefined): boolean {
  return Boolean(claveGoogleMaps?.trim());
}

export function obtenerEtiquetaEstadoReporte(estado: EstadoReporte): string {
  if (estado === 'verificada' || estado === 'manual_verificada') {
    return 'Alerta verificada';
  }

  if (estado === 'no_confirmada') {
    return 'Reporte ciudadano sin confirmar';
  }

  if (estado === 'rechazada') {
    return 'Reporte rechazado';
  }

  return 'Alerta resuelta';
}
