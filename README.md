# Terminal Portfolio

Gustavo Monnerat's personal portfolio, built with Angular and styled as a terminal interface. The site presents professional experience, services, technologies, selected projects, personal information, and a résumé available in Portuguese and English.

Live at [gusmonnerat.dev](https://gusmonnerat.dev) (`www.gusmonnerat.dev` redirects to it, so the bare domain is the canonical host).

## Technology stack

- Angular 22 with standalone components and route-level lazy loading
- TypeScript 6 in strict mode
- SCSS with shared global styles and variables
- Angular Router
- Angular SSR/SSG for prerendering static routes
- ngx-translate 18 for signal-based internationalization
- RxJS for reactive state and navigation events
- Vitest and jsdom for unit testing
- Express as the Angular engine infrastructure during rendering/build
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
| `npm test` | Runs Vitest in interactive/watch mode. |
| `npm run test:ci` | Runs the full test suite once and exits. |
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
│   │   │   ├── layout/         # Header, footer, and the terminal visual composition
│   │   │   └── shared/         # Buttons, titles, language toggle, and project cards
│   │   ├── data/               # Typed project catalog
│   │   ├── features/
│   │   │   ├── home/           # Home page and its sections
│   │   │   ├── about/          # About page and its sections
│   │   │   ├── portfolio/      # Project listing
│   │   │   ├── projectDetail/  # Project detail page
│   │   │   └── error/          # Fallback for unknown routes
│   │   ├── services/           # Language/navigation and project access
│   │   ├── app.config*.ts      # Browser and rendering providers
│   │   └── app.routes*.ts      # Client routes and rendering modes
│   ├── environments/           # Per-environment configuration
│   ├── styles/                 # Global SCSS and variables
│   ├── main.ts                 # Browser bootstrap
│   ├── main.server.ts          # Bootstrap used for rendering
│   ├── server.ts               # Angular/Express engine for the build process
│   └── test-setup.ts           # Global providers for Vitest tests
├── angular.json                # Builders, assets, budgets, and configuration
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

## Internationalization

The site supports English and Brazilian Portuguese through ngx-translate.
`LanguageService` is the single owner of the URL-derived locale and exposes the
active catalog as `loading`, `ready`, or `failed`. The `locale` query string
uses English as the default; `pt` and legacy/shared `pt_BR` values select
Portuguese. Translation catalogs live in `public/i18n/en.json` and
`public/i18n/pt.json` and must be kept structurally in sync.

On the very first page load without a `?locale=` parameter, the language is the
visitor's remembered choice (`localStorage` key `locale`) or, failing that, the
first supported language in the browser's language list; a Portuguese browser is
redirected to `?locale=pt`. An explicit `?locale=` always wins and is remembered,
and so is the language toggle's choice. Prerendered pages are always English
(there is no navigator on the server), and crawlers keep seeing English.

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
- Component styles: warning at 4 kB, error at 8 kB.

## Testing

To run the full suite once:

```bash
npm run test:ci
```

Tests use the official `@angular/build:unit-test` builder, Vitest, and jsdom. Shared Router and internationalization providers are configured in `src/test-setup.ts`.

## Deploying to Vercel

`vercel.json` defines:

- Framework preset: **Other**. That alone is not enough, though: Vercel's builder still detects `@angular/cli` in `package.json` and applies the Angular preset's catch-all rewrite to `index.html`, which answers every unknown address with status 200 (neither the project setting nor `"framework": null` in `vercel.json` prevents it). So the build ends with `scripts/create-build-output.mjs`, which writes a Build Output API v3 directory, `.vercel/output` (git-ignored). When that exists the builder uses it as is and skips the framework's routes; its `config.json` holds the only routing table: the security headers (read from `vercel.json`), then real files, then `404.html` with a real 404 status. This relies on **every page being prerendered**: a new route must also be added to `app.routes.server.ts`, and a test fails until it is.
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist/portfolio/browser`
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

Dependabot (`.github/dependabot.yml`) checks the npm dependencies weekly and
opens a pull request for each update; `npm audit --omit=dev` reports 0
vulnerabilities as of this writing.

## Contributing

1. Fork the repository or create a branch from `main`.
2. Make small, focused changes.
3. Run `npm run test:ci` and `npm run build:production`.
4. Open a pull request describing the motivation, the solution, and any visual impact.

## Image credits

- **Go Gopher (color):** original art by [Renee French](https://reneefrench.blogspot.com/), obtained from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Gogophercolor.png), under a [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) license.
- **Side Gopher:** art by [Takuya Ueda (@tenntenn)](https://twitter.com/tenntenn), under a [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) license.

## License and contact

Distributed under the MIT license. See [LICENSE](LICENSE).

Developed by [Gustavo Monnerat da Costa Veronese](https://www.linkedin.com/in/gustavommcv/).

Contact: [monnerat.gustavo@outlook.com](mailto:monnerat.gustavo@outlook.com)
