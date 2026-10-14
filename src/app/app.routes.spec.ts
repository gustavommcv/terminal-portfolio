import { RenderMode } from '@angular/ssr';

import { routes } from './app.routes';
import { NAV_ROUTES } from './core/layout/header/header.utils';
import { serverRoutes } from './app.routes.server';

// The host has no SPA fallback: a path that is not a prerendered file or an
// asset gets `404.html`. So every real page must be prerendered, or it would
// show the not-found page in production while working fine in `ng serve`.
describe('routes and prerendering', () => {
  const clientPaths = routes.map((route) => route.path ?? '');
  const serverMode = new Map(
    serverRoutes.map((route) => [route.path, route.renderMode]),
  );

  it('prerenders every page route', () => {
    const pages = clientPaths.filter((path) => path !== '**');

    for (const path of pages) {
      expect(serverMode.get(path), `route "${path}"`).toBe(
        RenderMode.Prerender,
      );
    }
  });

  it('has no server route for a path the app does not define', () => {
    for (const path of serverMode.keys()) {
      expect(clientPaths, `server route "${path}"`).toContain(path);
    }
  });

  it('only links the main navigation to pages that exist and are prerendered', () => {
    for (const route of NAV_ROUTES) {
      const path = route.slice(1);

      expect(clientPaths, `nav link ${route}`).toContain(path);
      expect(serverMode.get(path), `nav link ${route}`).toBe(RenderMode.Prerender);
    }
  });

  it('keeps a /404 route, which the build copies to 404.html', () => {
    expect(clientPaths).toContain('404');
    expect(serverMode.get('404')).toBe(RenderMode.Prerender);
  });

  it('leaves the catch-all client-rendered, so unknown addresses are not prerendered', () => {
    expect(serverMode.get('**')).toBe(RenderMode.Client);
  });
});
