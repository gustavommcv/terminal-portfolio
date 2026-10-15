import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';

import { ProjectsDataService } from './data/projects-data.service';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },

  {
    path: 'about',
    renderMode: RenderMode.Prerender,
  },

  {
    path: 'portfolio',
    renderMode: RenderMode.Prerender,
  },

  // One static page per project, so each has its own HTML, title, and
  // social-card tags for crawlers and link previews.
  {
    path: 'portfolio/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      inject(ProjectsDataService)
        .getAllProjects()
        .map((project) => ({ id: project.id })),
  },

  // The not-found page. The build copies its output to `404.html` (see
  // scripts/create-build-output.mjs), which the host serves with a 404 status for any
  // address that is neither a page nor an asset.
  {
    path: '404',
    renderMode: RenderMode.Prerender,
  },

  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
