import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "18.3" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-no-target-blank": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "unicode-bom": ["error", "never"],

      // This codebase does not use PropTypes anywhere, so react/prop-types
      // fired 705 times -- 67% of every problem eslint reported. A lint run
      // that returns a thousand results is a lint run nobody reads, and the
      // three genuine bugs in there (an undefined variable crashing the
      // statistics chart, duplicate object keys, unimported axios) were buried
      // under it. Turning the rule off is what makes the remaining output
      // worth looking at.
      "react/prop-types": "off",

      // Unused variables are worth seeing but should not fail a run; the real
      // errors are the ones that break at runtime.
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-useless-catch": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
];
