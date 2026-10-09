// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // Deno Edge Functions: runtime y módulo resolution distintos (npm:/Deno globals).
    ignores: ["dist/*", "supabase/functions/**"],
  }
]);
