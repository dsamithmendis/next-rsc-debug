import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.next/**",
      "**/out/**",
      "**/node_modules/**",
      "**/coverage/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mjs,js}"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      // Libraries and the docs site have no business logging to the console
      // that a user would see; CI scripts are exempted below.
      "no-console": "warn",
    },
  },
  {
    // CI/maintenance scripts are CLI tools; printing to stdout is the point.
    files: [".github/scripts/**/*.mjs"],
    rules: {
      "no-console": "off",
    },
  },
  {
    // Test files legitimately use empty-ish blocks and loose matchers.
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // The DevTools package ships untranspiled JSX to consumers; React must be
    // in scope without an explicit import in every file.
    files: ["packages/devtools/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
);