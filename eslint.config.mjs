import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated service worker — linting it produces noise from serwist's
    // compiled output (no-this-alias, etc.)
    "public/sw.js",
  ]),
  {
    rules: {
      // These are legacy pattern warnings that have been fixed in the source.
      "react/no-unescaped-entities": "warn",
    },
  },
]);

export default eslintConfig;
