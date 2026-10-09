// h3-js v4 usa un núcleo WebAssembly que Hermes (motor JS de React Native) no
// soporta ("Unknown encoding: utf-16le" al cargar el WASM). v3 es JS puro y
// funciona en RN; por eso la app fija `h3-js@3.7.2` mientras que la Edge
// Function (Deno) sí puede usar v4 sin problema.
import { geoToH3 } from 'h3-js';

// Resolución 8 (~0.7 km² por celda): suficiente para agrupar candidatos sin
// guardar la coordenada exacta del usuario en el servidor.
export const RESOLUCION_H3 = 8;

export function celdaDeCoordenada(latitud: number, longitud: number): string {
  return geoToH3(latitud, longitud, RESOLUCION_H3);
}
