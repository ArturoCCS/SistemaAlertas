import { describe, expect, it } from 'vitest';

import { obtenerEtiquetaEstadoReporte, tieneClaveGoogleMapsConfigurada } from './mapa';

describe('tieneClaveGoogleMapsConfigurada', () => {
  it('devuelve false cuando la clave no existe o está vacía', () => {
    expect(tieneClaveGoogleMapsConfigurada(undefined)).toBe(false);
    expect(tieneClaveGoogleMapsConfigurada('')).toBe(false);
    expect(tieneClaveGoogleMapsConfigurada('   ')).toBe(false);
  });

  it('devuelve true cuando hay una clave no vacía', () => {
    expect(tieneClaveGoogleMapsConfigurada('AIzaSyFake')).toBe(true);
  });
});

describe('obtenerEtiquetaEstadoReporte', () => {
  it('mapea estados a etiquetas en español', () => {
    expect(obtenerEtiquetaEstadoReporte('no_confirmada')).toBe('Reporte ciudadano sin confirmar');
    expect(obtenerEtiquetaEstadoReporte('verificada')).toBe('Alerta verificada');
    expect(obtenerEtiquetaEstadoReporte('manual_verificada')).toBe('Alerta verificada');
    expect(obtenerEtiquetaEstadoReporte('rechazada')).toBe('Reporte rechazado');
    expect(obtenerEtiquetaEstadoReporte('resuelta')).toBe('Alerta resuelta');
  });
});
