# Changelog

All notable changes to this project are documented in this file.

## [Unreleased] — 2026-10-14 to 2026-10-15

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
- Switching the language no longer sends the page back to the top: it is a
  navigation to the same page with another `?locale=`, which the router treated
  as any new page. The reader now stays at the same spot, on desktop and in the
  mobile menu, in both directions; navigating to another page still goes to the
  top and Back still restores the position. Measured in a browser with real
  clicks: the position went from 300 to 0 in 6 of 6 cases before, and stays at
  300 (103 on the short page) in 6 of 6 now. `language.service.spec.ts` checks it
  against the router's real scroller.
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

### Performance and privacy

- Long-lived caching, set by `headers` rules in `vercel.json`: the bundles with a
  content hash in the name (`main-*.js`, `chunk-*.js`, `polyfills-*.js`,
  `styles-*.css`) are `immutable` for a year; fonts, images, and the favicon are
  cached for a day and served stale while refreshing; pages, catalogs, and CVs
  are still revalidated. `scripts/create-build-output.mjs` now translates any such
  rule (literal text and regex groups; anything else fails loudly) and refuses to
  publish an `immutable` file without a hash. The generated routes and the
  `source` patterns were checked with Vercel's own routing schema and converter.
- The 31 technology badges are local SVG files (`public/images/badges`, made by
  `npm run badges` with `badge-maker` and `simple-icons`) instead of requests to
  img.shields.io, so no third party learns who visits a project page. They are
  pixel-identical to the images shields.io returned (compared for all 31, and on
  all 19 project pages), and the CSP's `img-src` is now `'self' data:`.
- The Portuguese catalog is preloaded by a small script in `src/index.html`, using
  the same rule as the app to choose the language: on a simulated slow 4G
  connection the Portuguese text appears about 0.5 s sooner (3.2 s to 2.7 s) for
  a `?locale=pt` link and for a Portuguese browser's first visit. English
  visitors still make no catalog request, since the prerendered page carries it.
  A spec runs the script against `LanguagePreference`.
- Only the month and year of birth are kept (the site shows an age), instead of
  the full date in the JavaScript every visitor downloads. The age counts from
  the first day of the birth month. The older commits still contain the date.

### Angular 22 conventions

- Updated to Angular 22.2.3 and checked the code against the current Angular style
  guide and best practices, applying what did not conform: no redundant
  `standalone: true` or `changeDetection: OnPush` (both are the defaults in
  Angular 22; a probe confirmed an unspecified component is `OnPush`), `input()`
  instead of `@Input`, `host` instead of `@HostListener`, `inject()` instead of
  constructor parameters, `@Service()` for the singleton services, and the `app-`
  prefix on every component selector (19 had none).
- Zoneless: removed `provideZoneChangeDetection`, the zone.js polyfills, and the
  `zone.js` dependency. The initial JavaScript went from 407.9 kB to 380.0 kB
  (128.5 kB to 119.8 kB compressed). `LanguageService`'s current path became a
  signal, so the header's active link no longer needs a manual refresh, and the
  `ProjectDetailPage` receives its `:id` as an input through
  `withComponentInputBinding()`, so it follows the route.
- Verified against the build from before these changes. Once zone.js was gone, the
  25 prerendered pages were identical apart from file hashes and Angular's internal
  ids; the only HTML changes since are intended (the image attributes and
  preloads, the buttons' `type`, the menu backdrop's role). Hydration reuses the
  server-rendered nodes on every route (the lower sections of the home page are
  created by the browser by design, as before), 33 scripted interactions behave
  identically (menu and Escape, the active link through back and forward,
  language switch, gallery and lightbox, the home intro, scroll hints, skip
  link), page heights are unchanged in 20 views, and axe still reports no
  violations.
- Images use `NgOptimizedImage`. The first row of cards on `/portfolio` and the main
  image of a project page load at once with high priority and are preloaded in
  the prerendered page; the rest stay lazy. On a simulated slow 4G connection the
  largest paint of `/portfolio` went from 1324 ms to 656 ms (desktop) and from
  2160 ms to 1892 ms (mobile).
- Added ESLint with `angular-eslint` (`npm run lint`, also a CI step), with the
  rules that encode these practices and type-aware checking (an uncalled signal is
  an error). It found what the manual review had missed: signal inputs without
  `readonly`, three buttons without a `type`, and an image without `ngSrc`.
- Removed what was dead: `src/server.ts` and its Express dependencies (nothing
  is served by it; the output is static), `@angular/forms` (never imported), the
  Node types and the two suppressed compiler diagnostics left by the Angular 22
  migration; the app's `tsconfig` now compiles from the two entry points instead
  of every file under `src`.
- Names and folders follow the style guide: `click.utils`, `age.utils`, and
  `header.utils` became `plain-left-click`, `age-from`, and `nav-routes`, and the
  type-based `services/` folder was split into `core/i18n`, `core/seo`, and `data`.
- A `ResizeObserver` that does not exist (a test DOM) no longer makes
  `OverflowWatch` fail.

### Tests and coverage

- Measured coverage for the first time (`npm run test:coverage`, with every file of
  `src/app` counted so an untested file cannot hide). It read 94.3% of statements,
  82.8% of branches, 90.1% of functions, and 94.4% of lines, but that overstated
  the protection: nine presentational components had a single `should create` test
  that renders them and asserts nothing about what they show.
- Replaced those with tests of the content: the lists and titles come from the
  catalog (`src/testing/english-catalog.ts`), the mailto/tel/profile links and
  their `rel`s are checked, the age is worked out from a fixed date, the footer
  year follows the clock, the toggle is checked in both languages, and the About
  page is checked section by section.
- Covered what the report showed was never run: the language service (leaving
  Portuguese, a catalog refreshed while on screen), the preference when
  prerendering on the server, the intro's reduced-motion changes and its lifecycle
  state machine, a catalog with no command, the lightbox's left arrow and the
  single-image case, the menu's keys, the button without a route, `formatEmail`
  (which had no test), and an SEO text missing from the catalog.
- New checks for failures nothing else catches: every project image exists and
  every project has texts in both languages (`projects.data.spec.ts`); every
  translation key written in a template exists in both catalogs
  (`translation-keys.spec.ts`); each route loads the page it names and the project
  id reaches the project page, run for real with the router.
- Checked that the tests notice when behaviour changes, not just that they run the
  code: a mutation test (an operator flipped, a condition forced, a call removed,
  one run of the suite per change) over 73 valid mutants in 18 files. With the
  earlier tests 63 were caught (86%); with the new ones 70 (96%), the same mutants.
  The three that remain change nothing a visitor or a test could observe. It also
  showed loose assertions, now tightened: a missing `ResizeObserver` was only
  logged, never asserted; the focus wrap did not check `preventDefault`; the intro
  was never run without `matchMedia`.
- Now 365 tests (280 before) and 45 for the build scripts (27 before). Coverage is
  98.98% of lines, 99.06% of statements, 93.1% of branches, 100% of functions
  (provider and bootstrap lists excluded: wiring, checked by the build). The floor
  is in `angular.json` (97% / 97% / 88% / 97%) and CI runs it; adding a file no test
  imports fails it, which was verified.
- `create-build-output.mjs`, which decides the headers, the caching, and the 404 in
  production, had no tests of its own. Its work moved to
  `scripts/lib/build-output.mjs` (the script only says where), with tests on
  fixture folders (a missing 404 page, an immutable file without a hash, nested
  pages, a stale output). The generated `config.json` was compared before and
  after: identical byte for byte. The script tests now report coverage and fail
  below 97% of lines.
- Removed `HomeIntroService.introVisible`, which nothing read.

### Layout

- The header was not as wide as the sections below it at most screen widths: the
  pages use a fluid side gutter (`clamp(0.5rem, 4vw, 8rem)`) while the header
  used fixed steps (`8rem`, `1rem`, `0.5rem`), so it sat 35px inside them at
  1120px and stuck out by 8 to 20px on phones, lining up only from about 1920px.
  Both now take the gutter from one mixin (`page-gutter`). Measured in a browser at
  21 widths on 5 kinds of page: 15 of 105 combinations were aligned before, 105 of
  105 are now; the header's height, the menu, and horizontal overflow are unchanged
  at 17 widths. `layout-gutter.spec.ts` guards the source.

### Components with one responsibility

Reviewed the 35 components, directives and services for ones doing more than one
thing, and separated the five clearest. Nothing changes for the visitor: all 20
page states (5 pages, desktop and phone, English and Portuguese) are
pixel-identical to the build before, the 274 links have the same addresses (plus
the three CV downloads below), and 44 steps of the mobile menu (focus, Tab,
Escape, backdrop, links, language toggle, 768px and 769px) behave the same.

- `ProjectDetailPage` was the project's text, its image gallery and a full-screen
  viewer: 610 lines. The gallery and the viewer are now `ProjectGallery`, which
  only needs the images and a name; the page is 169 lines.
- `Header` was the bar with the desktop links and the mobile menu (a panel with
  its own focus trap, scroll lock and Escape handling): 604 lines. The panel is
  now `MobileMenu`; the header (243 lines) draws the bar and decides whether the
  menu is open.
- The links to another page of the site (an address that keeps `?locale=pt`, and a
  plain click that stays in the application) were written out in the header twice,
  in `ProjectCard` and in `AppButton`, and `LanguageService` built them. They are
  now one directive, `LocalizedLink`; `LanguageService` only says which query
  parameters carry the language.
- The CV buttons built a hidden link and clicked it from code, and the markup was
  copied three times. They are now real links with the `download` attribute,
  one `@for` (they also work without JavaScript). The look is the same, down to the
  font: the buttons had the browser's own button font (Arial), which the link now
  names explicitly.
- `InterestsSection` and `LanguagesSection` were the same component with other
  texts; they are now `ListSection`.
- 396 tests before, 440 now; coverage 99.27% of statements and 94.5% of branches.
  The mobile menu and the localized link were mutation-checked (ten changes, all
  caught).

### Portfolio

- Added Mangabound and mangapress, and featured them. Projects were reordered
  by relevance and their descriptions shortened.
- Project media is split into `cover` and `gallery`: a card shows the cover (or
  the first gallery image), and the project page has a thumbnail gallery with a
  full-screen viewer. Mangabound has a Documentation link.
- The portfolio links in the CVs point to `/portfolio`, in the CV's own language.
- The Terminal Portfolio (this site) is no longer featured on the home page,
  which now shows five projects; it stays in the portfolio, with its own page.
  A spec keeps it out of the featured ones.
- Mangabound's gallery went from 1 image to 7: its cover, which now opens the
  gallery (and is still what its card and shared links show, as the first image),
  then the app's workflow: queue, chapter mapping, book details, conversion
  options, finished books with their warnings, and sharing to an e-reader. The
  screens are the app's own with the sample data of its tutorial (no manga
  pages), taken from the captures that Mangabound's guide generates, at 1600×900
  like Maquetaria's, 25 to 45 KB each. A spec pins the order, and another one
  that a cover a project declares is always among its gallery images.
- The images of the command-line projects (mangapress, mangabind, gomodoro) showed
  a small terminal window floating in the frame, with a margin all around it, so
  a card showed more empty frame than terminal. They are now the terminal edge to
  edge, with the largest text the frame allows (24 to 30px before, 29 to 40px
  now), made from the same real output as before. The Dotfiles image, a picture
  of a penguin, is now a terminal in the same style showing the repository for
  real: its branches (`main`, `notebook`, `wsl`), its folders, and the Lua files
  of the Hyprland configuration. The four files have new names (`*-terminal.webp`)
  because images are cached for a day plus a week of revalidation, so a visitor
  would otherwise keep seeing the old ones.
- The featured projects of the home page are now a carousel (the new `Carousel`
  component of `core/shared`) instead of a loose row with a scrollbar. It rests
  on one slide at a time (CSS `scroll-snap`, so swiping, the trackpad and keyboard
  focus work as on any page), has previous and next buttons that say when they do
  nothing, and a dot for each place it can rest, and it follows the WAI-ARIA
  carousel pattern without rotation (it never moves on its own): a group named
  after the section, each slide numbered, texts in both languages, no motion for
  visitors who asked for less. With everything in view it shows no controls. On
  narrow screens a card no longer runs past the edge of the carousel (it was 13px
  wider than the space at 390px). The "scroll sideways" hint is gone from this
  section, with its catalog entries; the About page keeps its own. Checked in a
  browser at eight widths from 320px to 2560px: snapping, buttons, dots, Tab to
  an off-screen card, no page overflow, no hydration warnings, no axe violations.

### Dependencies, CI, and documentation

- Angular 22.1.0 → 22.2.2 (all `@angular/*` packages), plus `express` 5.3,
  `zone.js` 0.16.3, `jsdom` 30.1, `vitest` 4.1.11, and the matching type
  packages. `npm audit` went from 22 vulnerabilities (3 critical) to 0.
  `typescript` 7, `vitest` 5, and `@types/node` 26 are held back on purpose.
- Test changes the update required: `fixture.detectChanges()` no longer runs
  `afterNextRender` hooks, so the home specs call `TestBed.tick()`; and
  `tsconfig.spec.json` lists the `node` types the specs that read files need.
  The home intro was checked in a real browser and still types and completes.
- Added GitHub Actions: `ci.yml` (`npm ci`, tests, build-script tests, production
  build on every push and pull request) and `audit.yml` (weekly `npm audit` of the production
  dependencies).
- Dependabot now groups the Angular packages into one pull request and the other
  minor and patch updates into another, ignores major bumps of `typescript` and
  `@types/node`, and also watches GitHub Actions.
- Only `main` exists now (the stale Dependabot branches and `develop` were removed). Vercel's
  `git.deploymentEnabled` is `{ "**": false, "main": true }`: the earlier setting listed
  `main` and `develop` as `true`, which changed nothing, because a branch that is not
  listed deploys by default, so Dependabot branches kept getting deployments. CI runs on
  pushes to `main` and on pull requests.
- Documentation: the README's component-style budget (6 kB), the dependency
  section, and the ARCHITECTURE description of the home intro states (five
  states, not four) and of how `vercel.json` and the build output work.
- Result: 45 spec files and 273 tests, plus 27 tests of the build scripts.

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
