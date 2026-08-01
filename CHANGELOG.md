# Changelog

All notable changes to this project are documented in this file.

## [Unreleased] — 2026-08-01

### Home intro and internationalization

- Fixed the cold-load race that could type
  `home-page.presentation-section.command` before the active catalog resolved.
- Consolidated URL locale ownership, catalog loading, stale-request protection,
  and document language updates in `LanguageService`.
- Added explicit loading, ready, and failure catalog states plus a dedicated
  command resolver for the home intro.
- Expanded the intro lifecycle with a waiting state, frozen per-run command,
  failure fallback, navigation interruption, and reduced-motion handling.
- Preserved the terminal DOM node while delaying all secondary home content
  until completion.

### Quality, accessibility, and performance

- Replaced click-only navigation surfaces with real links that retain modifier
  click, keyboard, focus, and copy-link behavior.
- Added mobile menu ARIA state, Escape handling, focus-visible styles, and body
  scroll cleanup.
- Added intrinsic image dimensions, deferred below-the-fold decoding/loading,
  and safe external-link relationships.
- Removed the unused Inter web-font request, duplicate SCSS variables, dead
  comments, an unnecessary URL sanitizer bypass, and avoidable untyped code.
- Aligned `npm run preview` with a production-like server without HMR or
  development prebundling.

### Validation

- Added deterministic tests for delayed English and Portuguese catalogs,
  missing/failed catalogs, out-of-order loads, mid-typing language changes,
  reduced motion, navigation interruption, and Unicode typing.
- Production build passes with three prerendered routes and a stable, empty
  terminal command in the initial home HTML.

## [22.1.0] — 2026-07-30

### Summary

- Upgraded the application from Angular 21.1.1 to Angular 22.1.0 using the official schematics.
- Upgraded TypeScript to the only line compatible with Angular 22, 6.0.x.
- Migrated ngx-translate from 16 to 18 and fully adapted the code to the standalone, signal-based API.
- Migrated the test runner from the legacy Karma/Jasmine stack to Vitest.
- Updated the static deployment configuration on Vercel.
- Authored technical, operational, and architectural documentation.

### Production dependencies

The versions below are the versions actually recorded in `package-lock.json`, not just the declared ranges.

| Package | Before | After | Note |
| --- | ---: | ---: | --- |
| `@angular/common` | 21.1.1 | 22.1.0 | Updated by `ng update`. |
| `@angular/compiler` | 21.1.1 | 22.1.0 | Updated by `ng update`. |
| `@angular/core` | 21.1.1 | 22.1.0 | Updated by `ng update`. |
| `@angular/forms` | 21.1.1 | 22.1.0 | Updated by `ng update`. |
| `@angular/platform-browser` | 21.1.1 | 22.1.0 | Updated by `ng update`. |
| `@angular/platform-server` | 21.1.1 | 22.1.0 | Updated by `ng update`. |
| `@angular/router` | 21.1.1 | 22.1.0 | Updated by `ng update`. |
| `@angular/ssr` | 21.1.1 | 22.1.0 | Updated by `ng update`. |
| `@ngx-translate/core` | 16.0.4 | 18.0.0 | Migrated to standalone, signal-based providers. |
| `@ngx-translate/http-loader` | 16.0.1 | 18.0.0 | Migrated to `provideTranslateHttpLoader`. |
| `express` | 5.2.1 | 5.2.1 | Already on the current compatible version. |
| `rxjs` | 7.8.2 | 7.8.2 | Kept on the line supported by Angular 22. |
| `tslib` | 2.8.1 | 2.8.1 | Already up to date. |
| `zone.js` | 0.15.1 | 0.16.2 | Updated within Angular 22's peer range. |

### Development dependencies

| Package | Before | After | Note |
| --- | ---: | ---: | --- |
| `@angular/build` | 21.1.1 | 22.1.0 | Official builder updated. |
| `@angular/cli` | 21.1.1 | 22.1.0 | CLI and schematics updated. |
| `@angular/compiler-cli` | 21.1.1 | 22.1.0 | AOT compiler updated. |
| `@types/express` | 5.0.6 | 5.0.6 | Already up to date. |
| `@types/node` | 20.19.30 | 24.13.3 | Aligned with the project's Node 24 runtime. |
| `typescript` | 5.9.3 | 6.0.3 | Updated per Angular 22's peer dependency. |
| `vitest` | — | 4.1.10 | New test runner. |
| `jsdom` | — | 30.0.1 | DOM environment for tests not running in a browser. |
| `@types/jasmine` | 5.1.15 | removed | Replaced by Vitest's global types. |
| `jasmine-core` | 5.8.0 | removed | Legacy runner removed. |
| `karma` | 6.4.4 | removed | Builder migrated to `@angular/build:unit-test`. |
| `karma-chrome-launcher` | 3.2.0 | removed | Browser launcher no longer needed. |
| `karma-coverage` | 2.2.1 | removed | Karma chain removed. |
| `karma-jasmine` | 5.1.0 | removed | Legacy adapter removed. |
| `karma-jasmine-html-reporter` | 2.1.0 | removed | Legacy reporter removed. |

### Code adaptations

- Added explicit `ChangeDetectionStrategy.Eager` to every component, applied by the Angular 22 schematic to preserve previous behavior.
- Added `withNoIncrementalHydration()` to preserve hydration semantics from before version 22.
- Temporarily suppressed the extended diagnostics `nullishCoalescingNotNullable` and `optionalChainNotNullable`, added automatically by the official migration.
- Replaced `TranslateModule` with `TranslatePipe` in standalone components.
- Replaced the manual `TranslateHttpLoader` factory with `provideTranslateHttpLoader`.
- Renamed the `defaultLanguage` setting to `fallbackLang`.
- Explicitly set the initial language with `lang: 'en'`.
- Replaced `translate.currentLang` with `translate.currentLang()` and handled the nullable return value.
- Removed `setDefaultLang`, an API removed in ngx-translate 18.
- Preserved the loader's fail-fast behavior with `failOnError: true`.

### Testing

- Changed the builder from `@angular/build:karma` to `@angular/build:unit-test`.
- Set the runner to Vitest.
- Added `src/test-setup.ts` with shared Router and translation providers.
- Fixed the application shell test, which still expected the initial Angular template's title.
- Added a minimal project to the `ProjectCard` test to satisfy the required input.
- Final result: 24 files and 25 tests passing.

### Build and deployment

- `vercel.json` now uses the official schema.
- The `angular` preset is set explicitly.
- `installCommand` changed from `npm install` to `npm ci`.
- Removed the legacy `version: 2` field.
- Confirmed the output directory as `dist/portfolio/browser`.
- Declared the runtime in `package.json`: Node `>=24.15.0 <25` and npm 11+.
- Added the `build:production` and `test:ci` scripts.
- Removed the executable SSR script, since `outputMode: "static"` does not generate a server for production execution.

### Security

- The initial audit found 47 vulnerabilities: 1 low, 12 moderate, 32 high, and 2 critical.
- After the upgrade, safe transitive fixes, and the removal of Karma/Jasmine, 3 moderate vulnerabilities remained in the `@angular/cli` development chain.
- An audit restricted to production dependencies finished with 0 vulnerabilities.
- `npm audit` suggests, as a "fix," downgrading Angular CLI to 21.0.4. This was not applied, since it would break alignment with Angular 22 and revert the requested upgrade.
- `npm audit fix --force` was not used.
- `@types/node` was kept on the 24 line to match the project's runtime; the 26 line was not adopted.
- TypeScript 7 was not adopted because Angular 22.1 requires TypeScript `>=6.0 <6.1`.

### Validation

- `npm run test:ci`: 25/25 tests passing.
- `npm run build:production`: passed, with 3 prerendered routes.
- Initial bundle: 350.30 kB raw and an estimated 98.10 kB transferred, below the 500 kB warning budget.
