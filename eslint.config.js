const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node
      }
    },
    rules: {
      "no-unused-vars": "warn"
    }
  },
  {
    // Abaikan folder frontend dan node_modules karena dasbor-keamanan punya config Vite/ESLint sendiri
    ignores: ["node_modules/**", "dasbor-keamanan/**"]
  }
];