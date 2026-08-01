# Terminal Portfolio

Gustavo Monnerat's personal portfolio, built with Angular and styled as a terminal interface. The site presents professional experience, services, technologies, selected projects, personal information, and a résumé available in Portuguese and English.

Live at [gusmonnerat.dev](https://gusmonnerat.dev).

## Technology stack

- Angular 22 with standalone components and route-level lazy loading
- TypeScript 6 in strict mode
- SCSS with shared global styles, variables, and animations
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
| `npm run preview` | Starts Angular using the production configuration. |
| `npm run build` | Generates the default build, configured as production. |
| `npm run build:production` | Explicitly generates the production build. |
| `npm run watch` | Rebuilds in development mode on every change. |
| `npm test` | Runs Vitest in interactive/watch mode. |
| `npm run test:ci` | Runs the full test suite once and exits. |
| `npm run ng -- <command>` | Runs a local Angular CLI command. |

## Project structure

```text
terminal-portfolio/
├── public/
│   ├── cv/                     # Résumé files in Portuguese and English
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
│   ├── styles/                 # Global SCSS, variables, and animations
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

The `/`, `/about`, and `/portfolio` routes are prerendered at build time. The dynamic `/portfolio/:id` route and the fallback route use client-side rendering. See [ARCHITECTURE.md](ARCHITECTURE.md) for the full diagram and detailed flows.

## Internationalization

The site supports English and Brazilian Portuguese through ngx-translate. The active locale is tracked via the `locale` query string (`en` is the default and fallback; `pt`/`pt_BR` selects Portuguese), so direct navigation, page refreshes, and shared links preserve the expected language. Translation catalogs live in `public/i18n/en.json` and `public/i18n/pt.json` and must be kept structurally in sync — the English catalog holds English text, the Portuguese catalog holds Portuguese text, and both are equally part of the product, not a translation of internal documentation.

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

- Framework preset: `angular`
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist/portfolio/browser`

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
