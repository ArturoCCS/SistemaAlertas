// `h3-js` está compilado con Emscripten (asm.js, sin WebAssembly real) y su
// código de detección de entorno hace `document.currentScript` sin
// comprobar primero si `document` existe. Hermes (React Native) no tiene
// DOM, así que esa línea revienta con "Property 'document' doesn't exist"
// antes de llegar al código que sí funciona. Un stub vacío basta: nunca se
// usa de verdad, solo evita que la detección de entorno truene.
//
// Debe importarse antes que cualquier módulo que importe `h3-js`
// (ver `src/domain/h3.ts`), idealmente como primera línea de `app/_layout.tsx`.
// El cast pasa primero por `unknown` porque `globalThis.document` ya está
// tipado como `Document` (lib dom) y no acepta un stub vacío directamente.
const entornoGlobal = globalThis as unknown as { document?: Record<string, unknown> };

if (typeof entornoGlobal.document === 'undefined') {
  entornoGlobal.document = {};
}
