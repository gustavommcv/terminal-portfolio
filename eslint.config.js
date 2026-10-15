// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      // Some rules (no-uncalled-signals) need the type of what they look at.
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],

      // The Angular style guide and best practices for v22, as rules.
      "@angular-eslint/prefer-service-decorator": "error", // @Service(), not @Injectable({ providedIn: 'root' })
      "@angular-eslint/prefer-signals": "error", // input(), output(), viewChild(), not their decorators
      "@angular-eslint/prefer-signal-model": "error",
      "@angular-eslint/prefer-host-metadata-property": "error", // `host: {}`, not @HostListener / @HostBinding
      "@angular-eslint/prefer-output-readonly": "error",
      "@angular-eslint/no-uncalled-signals": "error", // a signal read without ()
      "@angular-eslint/no-forward-ref": "error",
    },
  },
  {
    // Test doubles are often empty on purpose (a ResizeObserver that does nothing).
    files: ["**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-empty-function": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/prefer-ngsrc": "error", // NgOptimizedImage, not a plain src
      "@angular-eslint/template/prefer-class-binding": "error",
      "@angular-eslint/template/prefer-style-binding": "error",
      "@angular-eslint/template/button-has-type": "error",
    },
  },
]);
