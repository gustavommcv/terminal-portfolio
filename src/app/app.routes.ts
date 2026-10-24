import { inject } from '@angular/core';
import { RedirectFunction, Router, Routes } from '@angular/router';

import { projectExistsGuard } from './features/project-detail/project-exists.guard';
import type { SeoPage } from './core/seo/seo.service';

// `data.seo` tells SeoService which kind of page a route is; it then builds
// the title, description, canonical URL, and social tags for it.
const seo = (page: SeoPage) => ({ seo: page });

const renamedProject = (id: string): RedirectFunction => ({ queryParams, fragment }) =>
  inject(Router).createUrlTree([`/portfolio/${id}`], { queryParams, fragment: fragment ?? undefined });

const errorPage = () =>
  import('./features/error/error-page/error-page').then((m) => m.ErrorPage);

export const routes: Routes = [
  {
    path: '',
    data: seo('home'),
    loadComponent: () =>
      import('./features/home/home-page/home-page').then((m) => m.HomePage),
  },
  {
    path: 'about',
    data: seo('about'),
    loadComponent: () =>
      import('./features/about/about-page/about-page').then((m) => m.AboutPage),
  },
  {
    path: 'portfolio',
    data: seo('portfolio'),
    loadComponent: () =>
      import('./features/portfolio/portfolio-page/portfolio-page').then(
        (m) => m.PortfolioPage,
      ),
  },
  {
    path: 'portfolio/mangabound',
    pathMatch: 'full',
    redirectTo: renamedProject('manga2ink'),
  },
  {
    path: 'portfolio/mangapress',
    pathMatch: 'full',
    redirectTo: renamedProject('mangaprep'),
  },
  {
    path: 'portfolio/:id',
    data: seo('project'),
    canMatch: [projectExistsGuard],
    loadComponent: () =>
      import(
        './features/project-detail/project-detail-page/project-detail-page'
      ).then((m) => m.ProjectDetailPage),
  },
  // Prerendered as `404/index.html`; the build copies it to `404.html`, which
  // the host serves, with a 404 status, for every unknown address.
  {
    path: '404',
    data: seo('not-found'),
    loadComponent: errorPage,
  },
  {
    path: '**',
    data: seo('not-found'),
    loadComponent: errorPage,
  },
];
