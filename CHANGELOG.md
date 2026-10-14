# Changelog

All notable changes to this project are documented in this file.

## [Unreleased] — 2026-10-14

### SEO, routing, and deployment

- Added `SeoService`: each route declares its kind in `data.seo`, and the title,
  description, canonical URL, `hreflang` alternates, and Open Graph/Twitter tags
  follow the route and the language, in the browser and while prerendering. The
  canonical host is the bare domain (`https://gusmonnerat.dev`, see `SITE_URL`).
- Every project page (`/portfolio/<id>`) is prerendered, with its own title,
  summary, and card image; `public/sitemap.xml` and `robots.txt` list them with
  English, Brazilian Portuguese, and `x-default` alternates, and tests keep the
  sitemap in step with the project catalog.
- Unknown addresses, assets, and project ids now answer with a real HTTP 404 and
  the translated not-found page, marked `noindex`. Vercel's builder adds the
  Angular preset's catch-all rewrite even under the "Other" preset, so the build
  ends with `scripts/create-build-output.mjs`, which writes a Build Output API
  directory with an explicit routing table (security headers, real files, then
  `404.html`). Pages are served at their clean address without a redirect.
- The language of a first visit follows the browser's language list; a choice
  made with the toggle is remembered, and an explicit `?locale=` always wins.

### Internationalization

- Visible text and accessible names that were fixed in English now come from the
  catalogs: header menu and navigation, the footer's theme credit, the CV
  download heading and buttons, project links, the 404 message, badges, and the
  age. "Hello, World!" and the footer's "Made with ♥ by" stay in English on
  purpose.
- Wording fixes in both languages (e.g. "Résumé", "Formação acadêmica", the
  scroll hints) and brand spellings (Go, JavaScript, LinkedIn).
- The 404 shows the missing path without its query string.
- Specs now fail when the English and Portuguese catalogs differ in keys or
  `{{placeholders}}`, and when the home intro's build-time layout copies drift
  from the catalogs.

### Accessibility

- Every page has one `h1` (`/portfolio` and the 404 had none); the boxed title
  inside a section is a paragraph instead of a second, repeated heading; project
  cards take a `headingLevel`.
- Added a skip link to the main content, and `scroll-padding-top` so focus and
  the skip link never end up behind the sticky header.
- The terminal command line exposes the full command as visually hidden text
  instead of an `aria-label` on an element with no role, which assistive
  technology ignored.
- `html` uses `font-size: 62.5%` instead of `10px`, so the visitor's own font size
  setting applies.
- The footer link is underlined, the heart has `role="img"`, the "command not
  found" red reaches 4.5:1, and each CV download button names its format.
- Checked with axe-core on the home, about, portfolio, project, and 404 pages in
  both languages (no violations), and with a contrast check over every text
  element.

### Portfolio

- Added Mangabound and mangapress, and featured them. Projects were reordered
  by relevance and their descriptions shortened.
- Project media is split into `cover` and `gallery`: a card shows the cover (or
  the first gallery image), and the project page has a thumbnail gallery with a
  full-screen viewer. Mangabound has a Documentation link.
- The portfolio links in the CVs point to `/portfolio`, in the CV's own language.

### Dependencies, CI, and documentation

- Angular 22.1.0 → 22.2.2 (all `@angular/*` packages), plus `express` 5.3,
  `zone.js` 0.16.3, `jsdom` 30.1, `vitest` 4.1.11, and the matching type
  packages. `npm audit` went from 22 vulnerabilities (3 critical) to 0.
  `typescript` 7, `vitest` 5, and `@types/node` 26 are held back on purpose.
- Test changes the update required: `fixture.detectChanges()` no longer runs
  `afterNextRender` hooks, so the home specs call `TestBed.tick()`; and
  `tsconfig.spec.json` lists the `node` types the specs that read files need.
  The home intro was checked in a real browser and still types and completes.
- Added GitHub Actions: `ci.yml` (`npm ci`, tests, production build on every push
  and pull request) and `audit.yml` (weekly `npm audit` of the production
  dependencies).
- Dependabot now groups the Angular packages into one pull request and the other
  minor and patch updates into another, ignores major bumps of `typescript` and
  `@types/node`, and also watches GitHub Actions.
- Documentation: the README's component-style budget (6 kB), the dependency
  section, and the ARCHITECTURE description of the home intro states (five
  states, not four) and of how `vercel.json` and the build output work.
- Result: 41 spec files, 210 tests.

## [Unreleased] — 2026-08-03 to 2026-09-11

### Interface and content

- Migrated every component to `ChangeDetectionStrategy.OnPush`.
- Tokenized the repeated colors, breakpoints, transition durations, and z-index
  layers in the SCSS and removed the unused light theme.
- Added the neo-tree-inspired mobile menu, and fixed the active menu item not
  following route changes that did not come from the menu itself.
- Project stack tags are Shields.io badges (the CSP allows `img.shields.io`);
  descriptions are split into short and full text; the swipe hint only shows
  when a horizontal container actually overflows.
- Added the dotfiles, RVWheel, JSON Visual Editor, and Mangabind projects, and
  rewrote the visible copy in a more personal voice.
- Enabled Vercel Web Analytics and Speed Insights.
- Limited Vercel deployments to `main` and `develop` (`git.deploymentEnabled` in
  `vercel.json`), so Dependabot branches no longer send failed-deployment emails.

## [Unreleased] — 2026-08-02

### Privacy, security, and performance

- Self-hosted JetBrains Mono (`public/fonts`, `src/styles/abstracts/_fonts.scss`),
  removing the `fonts.googleapis.com` / `fonts.gstatic.com` requests and the
  visitor IP disclosure to Google that came with them; subsetted to the
  `latin`/`latin-ext` Unicode ranges actually needed for English and
  Brazilian Portuguese.
- Added response headers in `vercel.json`: `Strict-Transport-Security`,
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, and a `Content-Security-Policy` (see
  [ARCHITECTURE.md](ARCHITECTURE.md#security-headers) for why `script-src`
  and `style-src` allow `'unsafe-inline'` on this static deployment).
- Added Open Graph and Twitter Card meta tags to `src/index.html` so shared
  links render a title, description, and image instead of a bare URL.
- Added `.github/dependabot.yml` for weekly npm dependency-update pull
  requests.

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
