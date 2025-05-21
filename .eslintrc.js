module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    // Add custom rules here
    "react/react-in-jsx-scope": "off", // Not needed with newer React versions
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    // Rules specific to Air Gourmet Hellas project
    "no-restricted-globals": ["error", "event", "fdescribe"],
    // Prevent hardcoded price values
    "no-magic-numbers": ["warn", { 
      "ignore": [0, 1, -1, 2, 100],
      "ignoreArrayIndexes": true
    }]
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  ignorePatterns: ["node_modules/", "dist/", "build/", "eslint.config.js"]
};