# Architecture

## Overview

Terminal Portfolio is a standalone, feature-organized Angular application. There is no `AppModule` and no feature modules: providers are registered in `ApplicationConfig`, pages are loaded with `loadComponent`, and each component declares its template dependencies directly.

The build combines:

- browser-side rendering;
- static prerendering of the known public pages;
- client-side hydration;
- static output hosted by Vercel.

## Component diagram

```mermaid
flowchart TD
    Browser["Browser / Vercel CDN"] --> Bootstrap["main.ts<br/>bootstrapApplication"]
    Bootstrap --> AppConfig["app.config.ts<br/>Router, HttpClient, i18n, hydration"]
    AppConfig --> App["App"]
    App --> Header["Header"]
    App --> Outlet["RouterOutlet"]

    Header --> LanguageToggle["LanguageToggleButton"]
    Header --> LanguageService["LanguageService"]

    Outlet --> Home["HomePage"]
    Outlet --> About["AboutPage"]
    Outlet --> Portfolio["PortfolioPage"]
    Outlet --> Detail["ProjectDetailPage"]
    Outlet --> Error["ErrorPage"]

    Home --> Presentation["PresentationSection"]
    Home --> Services["ServicesSection"]
    Home --> Tech["TechStackSection"]
    Home --> Featured["FeaturedProjectsSection"]
    Home --> Contact["ContactSection"]
    Home --> Footer["Footer"]
    Home --> Intro["HomeIntro<br/>first eligible visit only"]
    Intro --> IntroCommand["HomeIntroCommandService"]
    IntroCommand --> LanguageService

    About --> AboutSection["AboutSection"]
    About --> Education["EducationSection"]
    About --> Interests["InterestsSection"]
    About --> Languages["LanguagesSection"]
    About --> Download["DownloadSection"]

    Portfolio --> ProjectCard["ProjectCard"]
    Featured --> ProjectCard
    ProjectCard --> LanguageService

    Portfolio --> ProjectsService["ProjectsDataService"]
    Detail --> ProjectsService
    Featured --> ProjectsService
    ProjectsService --> ProjectData["projects.data.ts"]

    AppConfig --> Translate["TranslateService"]
    Translate --> Dictionaries["public/i18n/en.json<br/>public/i18n/pt.json"]
    LanguageService --> Query["Query string ?locale=..."]
```

## Layers and responsibilities

### Bootstrap and configuration

- `src/main.ts`: bootstraps `App` in the browser.
- `src/app/app.config.ts`: registers Router, scroll restoration, preloading, hydration, HttpClient, and ngx-translate.
- `src/main.server.ts`: adapts the bootstrap process to the rendering context.
- `src/app/app.config.server.ts`: merges the browser providers with `provideServerRendering`.
- `src/server.ts`: creates the Angular engine on top of Express, used by the rendering infrastructure.

### Application shell

`App` is the global shell. It keeps `Header` visible, delegates page content to
`RouterOutlet`, and eagerly creates `LanguageService`. Locale ownership and
translation loading are not duplicated in the shell.

### Features

| Feature | Responsibility | Main components |
| --- | --- | --- |
| `home` | Presentation, services, stack, featured projects, and contact. | `HomePage` and five sections. |
| `about` | Biography, education, interests, languages, and résumé. | `AboutPage` and five sections. |
| `portfolio` | Full project catalog listing. | `PortfolioPage`, `ProjectCard`. |
| `projectDetail` | Resolves `:id` and displays a single project. | `ProjectDetailPage`. |
| `error` | Shows a visual response for unknown routes. | `ErrorPage`. |

### Home intro lifecycle

`HomeIntroService` is a root-provided, in-memory state machine with four states:

```text
idle ── browser post-hydration claim ──► waiting
  └── reduced motion ──────────────────► completed
waiting ── active catalog + command ready ──► typing
waiting ── catalog unavailable / route destruction ──► completed
typing ── final character + final pause ──────────────► completed
typing ── route destruction / reduced motion ────────► completed
```

`HomePage` owns the structural rendering boundary. `HomeIntro` and its terminal
shell remain mounted across the transition. While the service is `idle`,
`waiting`, or `typing`, every secondary `@if` block is absent. Presentation content, services,
stack, projects, contact, and footer are created only in `completed` and are
inserted immediately with their final styles, without a secondary animation.
Consequently, secondary hooks, image loads, observers, and other side effects
cannot run during typing, while the terminal component and DOM node keep the
same identity.

`HomeIntroCommandService` derives a discriminated command state directly from
the catalog exposed by `LanguageService`: `waiting`, `ready`, or `unavailable`.
It never uses the temporary return value of a translation pipe. `HomeIntro`
freezes the first ready command for the duration of typing, so a language change
cannot mix two commands. Once completed, later resolved catalogs can update the
display without replaying the intro.

`HomeIntro` owns one recursively scheduled timeout. Each callback appends one
Unicode code point and schedules at most one successor. It clears the pending
timeout on destruction and reports completion only after the last character is
present. A catalog error completes without typing or exposing a raw key, so the
rest of the site is not permanently blocked.

The sequence is configured in
`src/app/features/home/home-intro.config.ts`. `HOME_INTRO_CONFIG` controls the
initial delay, per-character interval, final pause, and cursor blink. Translated
command text remains in `public/i18n`.

Browser-only startup and `matchMedia` access run inside `afterNextRender`, which
Angular skips during server rendering and runs after hydration. The server and
initial browser render therefore agree on the intro-only tree. A non-home
initial route never constructs `HomeIntro` and does not consume the sequence.
Reduced-motion users transition to the complete tree at that post-hydration
boundary without typing or an unnecessary delay. If their catalog is still
loading, the terminal remains empty until the resolved command becomes
available.

### Core and shared

- `core/layout`: structural components, including the header, footer, and the visual composition that simulates a terminal.
- `core/shared`: reusable UI elements, such as the button, title, language toggle, and project card.

### Data and services

`projects.data.ts` is the local, typed source of the catalog. There is no remote API and no persistent storage. `ProjectsDataService` exposes three read-only operations:

- list all projects;
- find a project by id;
- filter featured projects.

`LanguageService` tracks `NavigationEnd`, normalizes the locale, owns the
`TranslateService.use()` subscription, preserves the locale across navigation,
updates `<html lang>`, and publishes a signal-based catalog state. A stale load
cannot overwrite a newer URL language. `TranslateService` remains responsible
for fetching and storing catalogs.

## Routes and rendering

| Route | Page | Loading | Rendering |
| --- | --- | --- | --- |
| `/` | `HomePage` | Lazy | Prerendered |
| `/about` | `AboutPage` | Lazy | Prerendered |
| `/portfolio` | `PortfolioPage` | Lazy | Prerendered |
| `/portfolio/:id` | `ProjectDetailPage` | Lazy | Client |
| `**` | `ErrorPage` | Lazy | Client |

The build uses `outputMode: "static"`. The prerendering step generates HTML for the three static routes and a CSR shell for the client-rendered routes.

## Project data flow

```text
projects.data.ts
      │
      ▼
ProjectsDataService
      ├── getFeaturedProjects() ──► FeaturedProjectsSection
      ├── getAllProjects() ───────► PortfolioPage
      └── getProjectById(id) ─────► ProjectDetailPage
                                         ▲
                                         │ :id
ProjectCard ── locale-aware navigation ──► Router
```

Components receive typed `Project` objects. Titles and descriptions are not stored in this catalog; they are resolved from the translation files, using the id as part of the key.

## Language flow

1. `LanguageService` reads `locale` from each completed navigation.
2. The locale is normalized to `en` or `pt` and published as `loading`.
3. `TranslateService.use()` loads `public/i18n/<language>.json`.
4. Only the winning request publishes `ready`; errors publish `failed`.
5. `TranslatePipe` updates regular templates while command-sensitive flows use
   the resolved catalog state directly.
6. Locale-aware links preserve standard browser behavior and the language
   button updates the URL.

English is the initial and fallback language. The loader is configured with `failOnError: true`; a missing catalog is treated as an error instead of silently resulting in empty translations.

## Styles

Each component has encapsulated SCSS. Shared styles live in `src/styles`:

- `abstracts/_variables.scss`: tokens and variables;
- `styles.scss`: global stylesheet registered in `angular.json`.

`stylePreprocessorOptions.includePaths` allows importing resources from `src/styles`.

## Testing

The `@angular/build:unit-test` builder runs Vitest on top of jsdom. Every
component has a spec file. Intro tests use controlled catalog states and cover
delayed loads, both languages, stale completion, failures, navigation
interruption, reduced motion, Unicode, and one-run behavior. The production
build additionally verifies SSR/SSG compilation and prerendering.

## Build and delivery

```text
Source code
   │ npm ci
   ▼
Angular 22 build + prerender
   │
   └── dist/portfolio/browser
             │
             ▼
        Vercel Edge CDN
```

`vercel.json` selects the Angular preset, runs `npm ci` and `npm run build`, and publishes only `dist/portfolio/browser`. The project does not require any environment variables in its current state.
