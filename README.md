# Terminal Portfolio

Gustavo Monnerat's personal portfolio, built with Angular and styled as a terminal interface. The site presents professional experience, services, technologies, selected projects, personal information, and a résumé available in Portuguese and English.

Live at [gusmonnerat.dev](https://gusmonnerat.dev) (`www.gusmonnerat.dev` redirects to it, so the bare domain is the canonical host).

## Technology stack

- Angular 22 with standalone components, signals, zoneless change detection, and route-level lazy loading
- TypeScript 6 in strict mode
- SCSS with shared global styles and variables
- Angular Router
- Angular SSR/SSG for prerendering static routes
- ngx-translate 18 for signal-based internationalization
- RxJS for reactive state and navigation events
- Vitest and jsdom for unit testing
- ESLint with `angular-eslint`: the Angular style guide and best practices, as rules
- Vercel for static build and hosting

## Prerequisites

- Node.js `>= 24.15.0 < 25`
- npm 11 or later
- Angular CLI 22, optionally installed globally

The project can always run through the local Angular CLI via npm scripts; a global install is not required.

## Installation

Clone the repository, enter the project directory, and install the exact versions recorded in the lockfile:

```bash
git clone https://github.com/gustavommcv/terminal-portfolio.git
cd terminal-portfolio
npm ci
```

To start the development server:

```bash
npm start
```

By default, the application is available at `http://localhost:4200`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Starts the local server in development mode. |
| `npm run dev` | Starts the local server accepting connections on `0.0.0.0`. |
| `npm run preview` | Starts the production configuration without development prebundling or HMR. |
| `npm run build` | Generates the production build, then writes `404.html` and the `.vercel/output` routing (see [Deploying to Vercel](#deploying-to-vercel)). |
| `npm run build:production` | Explicitly generates the production build, with the same extra steps. |
| `npm run watch` | Rebuilds in development mode on every change. |
| `npm run lint` | Checks the code against the Angular style guide and best practices (`eslint.config.js`). |
| `npm test` | Runs Vitest in interactive/watch mode. |
| `npm run test:ci` | Runs the full test suite once and exits. |
| `npm run test:scripts` | Tests the build scripts (header and caching rules) and checks that the badge files are up to date. |
| `npm run badges` | Draws the project badges into `public/images/badges` (see [Project badges](#project-badges)). |
| `npm run ng -- <command>` | Runs a local Angular CLI command. |

## Project structure

```text
terminal-portfolio/
├── public/
│   ├── cv/                     # Résumé files in Portuguese and English
│   ├── fonts/                  # Self-hosted JetBrains Mono (see public/fonts/README.md)
│   ├── i18n/                   # Translation catalogs, en.json and pt.json
│   ├── images/                 # Personal photos and project thumbnails
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── i18n/           # Language state, and the visitor's language preference
│   │   │   ├── layout/         # Header, footer, and the terminal visual composition
│   │   │   ├── seo/            # Title, description, canonical URL, and social tags per page
│   │   │   └── shared/         # Buttons, titles, language toggle, project cards, and their helpers
│   │   ├── data/               # Typed project catalog and the service that reads it
│   │   ├── features/
│   │   │   ├── home/           # Home page and its sections
│   │   │   ├── about/          # About page and its sections
│   │   │   ├── portfolio/      # Project listing
│   │   │   ├── projectDetail/  # Project detail page
│   │   │   └── error/          # Fallback for unknown routes
│   │   ├── app.config*.ts      # Browser and rendering providers
│   │   └── app.routes*.ts      # Client routes and rendering modes
│   ├── environments/           # Per-environment configuration
│   ├── styles/                 # Global SCSS and variables
│   ├── main.ts                 # Browser bootstrap
│   ├── main.server.ts          # Bootstrap used for rendering
│   └── test-setup.ts           # Global providers for Vitest tests
├── angular.json                # Builders, assets, budgets, and configuration
├── eslint.config.js            # Lint rules (Angular style guide and best practices)
├── tsconfig*.json               # Application and test TypeScript configuration
├── vercel.json                 # Build and static output on Vercel
├── ARCHITECTURE.md             # Architecture and internal flows
├── CHANGELOG.md                # Project history
└── package.json
```

## Architecture

The application uses standalone components exclusively. The root component renders the header and a `RouterOutlet`; each page is loaded on demand via `loadComponent`. Pages compose smaller sections and reusable components.

Project data lives in a local, typed catalog and is exposed through `ProjectsDataService`. Language state is coordinated by `LanguageService`, the `locale` query string, and `TranslateService`. The JSON catalogs are loaded from `public/i18n`.

The `/`, `/about`, and `/portfolio` routes, and one `/portfolio/:id` page per project, are prerendered at build time (the project ids come from the catalog). The fallback route uses client-side rendering; an unknown project id falls through to it, so it shows the not-found page. See [ARCHITECTURE.md](ARCHITECTURE.md) for the full diagram and detailed flows.

The home page's first-visit terminal sequence uses application-scoped in-memory
state and a structural rendering boundary: secondary home components do not
exist in the DOM until the active translation catalog resolves, the command is
typed, and the final pause finishes. The terminal shell itself is stable from
the server-rendered HTML onward. `HomeIntroCommandService` reads the command
directly from the resolved catalog, so a transient translation key can never be
captured as visitor-facing text. Terminal timing is centralized in
`src/app/features/home/home-intro.config.ts`; the lifecycle resets on a real
reload and is never persisted in browser storage.

## Angular conventions

The code follows the Angular 22 style guide and best practices; `npm run lint`
enforces them, and CI runs it.

- **Defaults are not repeated.** Components are standalone and `OnPush`, which
  Angular 22 does by default, so neither `standalone: true` nor
  `changeDetection` is written.
- **Signals for state and the signal APIs for the rest:** `input()`,
  `viewChild()`, `computed()`, `linkedSignal()`; no `@Input`/`@Output`
  decorators. Members are `readonly` when Angular fills them in, and
  `protected` when only the template uses them.
- **Dependencies come from `inject()`**, not constructor parameters, and the
  singleton services use `@Service()`.
- **Host bindings and listeners go in the `host` object**, not in
  `@HostListener`/`@HostBinding`.
- **Zoneless.** There is no zone.js. Angular re-renders a component when a signal
  it reads changes, when an event it listens to fires, or when an input changes,
  so anything a template shows has to live in a signal (the current path in
  `LanguageService` is one: the header's active link follows it). Do not set a
  field that a template reads and expect the screen to follow.
- **Route parameters arrive as inputs.** `withComponentInputBinding()` hands the
  `:id` of `/portfolio/:id` to `ProjectDetailPage`, so it reacts to the route
  instead of reading it once.
- **Selectors start with `app-`.** Files are named after what they contain
  (`plain-left-click.ts`, `nav-routes.ts`), not `utils.ts`, and the folders are
  themes (`core/i18n`, `core/seo`), not types (`services/`).
- **Images are `NgOptimizedImage`** (`ngSrc`, with width and height). The cards in
  the first row of `/portfolio` and the main image of a project page are
  `priority`: they load at once, at high priority, and the prerendered page
  preloads them. The rest are lazy. The lint rule `prefer-ngsrc` is switched off in
  two places, each with its reason: the badges (SVGs sized by height alone) and the
  lightbox image (no fixed size).

## Internationalization

The site supports English and Brazilian Portuguese through ngx-translate.
`LanguageService` is the single owner of the URL-derived locale and exposes the
active catalog as `loading`, `ready`, or `failed`. The `locale` query string
uses English as the default; `pt` and legacy/shared `pt_BR` values select
Portuguese. Translation catalogs live in `public/i18n/en.json` and
`public/i18n/pt.json` and must be kept structurally in sync; a spec fails when
they define different keys or `{{placeholders}}`. Every visible text and
accessible name goes through the catalogs, with two deliberate exceptions that
stay in English in both languages: the `Hello, World!` line and the footer's
`Made with ♥ by` credit (the footer marks it with `lang="en"`).

On the very first page load without a `?locale=` parameter, the language is the
visitor's remembered choice (`localStorage` key `locale`) or, failing that, the
first supported language in the browser's language list; a Portuguese browser is
redirected to `?locale=pt`. An explicit `?locale=` always wins and is remembered,
and so is the language toggle's choice. Prerendered pages are always English
(there is no navigator on the server), and crawlers keep seeing English.

**How the catalogs arrive.** The prerendered pages are English and carry the
English catalog inside the HTML (Angular's transfer state), so an English
visitor makes no catalog request at all. A Portuguese visitor needs
`i18n/pt.json`, which would otherwise be requested only once the app has
started; a small script in `src/index.html` asks for it while the scripts
download, using the same rule as the app to pick the language. On a simulated
slow 4G connection that put the Portuguese text on screen about 0.5 s sooner.
`src/app/catalog-preload.spec.ts` runs the script against `LanguagePreference`,
so the two cannot drift apart.

## SEO and metadata

`SeoService` keeps the title, description, canonical URL, `hreflang`
alternates, and Open Graph/Twitter tags in step with the current route and
language, in the browser and during prerendering, so each static page ships
with its own tags. Each route declares its kind in `data.seo` (`app.routes.ts`);
the texts live under `seo` in the translation catalogs, and a project page uses
the project's own title, summary, and card image. Unknown pages are marked
`noindex` and have no canonical URL.

The canonical host is `SITE_URL` in `src/app/data/site.config.ts`. `public/sitemap.xml`
is maintained by hand: **adding a project means adding its `/portfolio/<id>`
entry**, and a test fails until you do.

## Accessibility

- **Headings.** Each page has one `h1`: the first `app-terminal-section` of the
  page sets `isFirstTitle`. Section titles are `h2`; whatever sits under them
  (project cards, degrees, CV formats) is `h3`, and `project-card` takes a
  `headingLevel` so it can sit directly under an `h1` on `/portfolio`. The
  boxed `app-title` inside a section mimics the title of a rendered markdown
  file, so it is a paragraph, not a heading.
- **Skip link.** The first focusable element jumps to `<main id="main">`. It is
  handled in script because a bare `#main` would resolve against `<base href="/">`
  and navigate to the home page. `html` has `scroll-padding-top` so focus and the
  skip link never leave anything behind the sticky header.
- **Sizes.** `html` is `62.5%`, so `1rem` is 10px at the browser's default size
  but follows the visitor's own font-size setting. Size text in `rem`, not `px`.
- **Names.** A name (`aria-label`) only works on an element with a role, so
  text meant for assistive technology alone is real text in `.visually-hidden`
  (see the terminal command line). Links inside running text need more than a
  colour change to stand out, hence the underline on the footer link.
- **Colour.** Text must reach 4.5:1 (3:1 for large text) on its background; the
  "command not found" red was lightened for that.

## Project badges

The technology badges on the project pages (`flat-square` blocks with a logo)
are SVG files in `public/images/badges`, drawn from the `badges` of each project
in `src/app/data/projects.data.ts` by `npm run badges`. They used to be requested
from img.shields.io on every page view; now no third party hears about a visit,
and the Content-Security-Policy allows images from the site itself and `data:`
only. `badge-maker` (the library shields.io draws with) and `simple-icons` (the
logos) are pinned to exact versions in `devDependencies`, and Dependabot leaves
them alone, because a new version can change the files.

After adding or changing a badge, run `npm run badges` and commit the files;
`npm run test:scripts` and the unit tests fail while they are missing or out of
date. A logo that Simple Icons no longer has is drawn without it (the script
says so).

## Production build

```bash
npm run build:production
```

The publishable output is generated at:

```text
dist/portfolio/browser
```

Configured budgets are:

- Initial bundle: warning at 500 kB, error at 1 MB.
- Component styles: warning at 6 kB, error at 8 kB.

## Testing

To run the full suite once:

```bash
npm run test:ci
```

Tests use the official `@angular/build:unit-test` builder, Vitest, and jsdom. `src/test-setup.ts` provides the Router and loads the real English catalog, so specs assert the text visitors read, not translation keys. Two details worth knowing when writing specs:

- Tests run without zone.js, like the app. `fixture.detectChanges()` does not run `afterNextRender` hooks (since Angular 22.2); call `TestBed.tick()`, which also runs effects. Angular's own scheduler leaves a pair of timers pending after an input or signal change, and a tick clears them, so call it before counting timers with fake timers.
- Specs that read files (`node:fs`) rely on `"node"` being listed in `types` in `tsconfig.spec.json`.

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and on every pull request: `npm ci`, `npm run lint`, `npm run test:ci`, `npm run test:scripts`, then `npm run build` (the command Vercel runs, which also prerenders every route). `.github/workflows/audit.yml` runs `npm audit --omit=dev --audit-level=high` every Monday and on demand. Neither deploys anything; Vercel does that from Git.

## Deploying to Vercel

`vercel.json` defines:

- Framework preset: **Other**. That alone is not enough, though: Vercel's builder still detects `@angular/cli` in `package.json` and applies the Angular preset's catch-all rewrite to `index.html`, which answers every unknown address with status 200 (neither the project setting nor `"framework": null` in `vercel.json` prevents it). So the build ends with `scripts/create-build-output.mjs`, which writes a Build Output API v3 directory, `.vercel/output` (git-ignored). When that exists the builder uses it as is and skips the framework's routes; its `config.json` holds the only routing table: the security headers (read from `vercel.json`), then real files, then `404.html` with a real 404 status. This relies on **every page being prerendered**: a new route must also be added to `app.routes.server.ts`, and a test fails until it is.
- Branches: only `main` is deployed automatically. `git.deploymentEnabled` is `{ "**": false, "main": true }`, because a branch that is not listed deploys by default, and the patterns are minimatch (`**` also matches the slashes in names like `dependabot/...`). A branch matching several rules deploys when any of them is `true`.
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist/portfolio/browser`
- Caching, set by `headers` rules in `vercel.json` (the build script turns them
  into routes): the bundles Angular emits with a content hash in the name
  (`main-*.js`, `chunk-*.js`, `polyfills-*.js`, `styles-*.css`) are cached for a
  year as `immutable`; fonts, images, and the favicon for a day, then served
  stale while they refresh in the background; pages, translation catalogs, and
  the CVs are revalidated on every visit, so an edit shows at once. The build
  refuses to publish an `immutable` file whose name has no hash, and warns about
  a script or stylesheet no long-cache rule covers. A `source` in `vercel.json`
  may hold literal text and `(regex groups)` only; anything else fails the build
  instead of becoming a route that matches the wrong files.
- Response headers applied to every path: `Strict-Transport-Security`,
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, and `Content-Security-Policy`. See
  [ARCHITECTURE.md](ARCHITECTURE.md#security-headers) for the CSP tradeoffs.

To deploy via Git integration:

1. Import the repository into Vercel.
2. Confirm Node.js 24 in the project settings.
3. Keep the root directory pointing at the repository root.
4. Push to the production branch.

You can also deploy with the CLI:

```bash
npx vercel
npx vercel --prod
```

There are currently no required environment variables. The files in `src/environments` export empty objects. If new integrations are added, register their variables separately for Development, Preview, and Production in Vercel, and never commit secrets.

## Dependency updates

Dependabot (`.github/dependabot.yml`) checks the npm dependencies and the
GitHub Actions weekly. The Angular packages come in one pull request, since they
only work together at the same version, and the other minor and patch updates in
a second one. Major updates of `typescript` (Angular 22 supports 6.0.x only) and
`@types/node` (it follows the Node line in `engines`) are ignored. CI has to be
green before merging; `npm audit --omit=dev` shows what is currently known.

## Contributing

1. Fork the repository or create a branch from `main`.
2. Make small, focused changes.
3. Run `npm run lint`, `npm run test:ci`, `npm run test:scripts` and `npm run build:production`.
4. Open a pull request describing the motivation, the solution, and any visual impact.

## Image credits

- **Go Gopher (color):** original art by [Renee French](https://reneefrench.blogspot.com/), obtained from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Gogophercolor.png), under a [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) license.
- **Side Gopher:** art by [Takuya Ueda (@tenntenn)](https://twitter.com/tenntenn), under a [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) license.

## License and contact

Distributed under the MIT license. See [LICENSE](LICENSE).

Developed by [Gustavo Monnerat da Costa Veronese](https://www.linkedin.com/in/gustavommcv/).

Contact: [monnerat.gustavo@outlook.com](mailto:monnerat.gustavo@outlook.com)
