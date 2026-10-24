import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { RenderMode } from '@angular/ssr';

import { routes } from './app.routes';
import { NAV_ROUTES } from './core/layout/header/nav-routes';
import { serverRoutes } from './app.routes.server';
import { AboutPage } from './features/about/about-page/about-page';
import { ErrorPage } from './features/error/error-page/error-page';
import { HomePage } from './features/home/home-page/home-page';
import { PortfolioPage } from './features/portfolio/portfolio-page/portfolio-page';
import { ProjectDetailPage } from './features/project-detail/project-detail-page/project-detail-page';

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

  describe('the routes, run for real', () => {
    function configure(): void {
      TestBed.configureTestingModule({
        providers: [provideRouter(routes, withComponentInputBinding())],
      });
    }

    it('lazy loads the page that each route names', async () => {
      const expected = new Map<string, unknown>([
        ['', HomePage],
        ['about', AboutPage],
        ['portfolio', PortfolioPage],
        ['portfolio/mangabound', undefined],
        ['portfolio/mangapress', undefined],
        ['portfolio/:id', ProjectDetailPage],
        ['404', ErrorPage],
        ['**', ErrorPage],
      ]);

      expect(routes.map((route) => route.path ?? '')).toEqual([...expected.keys()]);
      for (const route of routes) {
        if (route.redirectTo) continue;
        const load = route.loadComponent as () => Promise<unknown>;
        expect(await load(), `route "${route.path}"`).toBe(expected.get(route.path ?? ''));
      }
    });

    it('hands the project id in the address to the project page', async () => {
      configure();
      const harness = await RouterTestingHarness.create();

      const page = await harness.navigateByUrl('/portfolio/maquetaria', ProjectDetailPage);

      expect(page.id()).toBe('maquetaria');
      expect(harness.routeNativeElement?.querySelector('h1')?.textContent?.trim()).toBe(
        'maquetaria',
      );
    });

    it.each([
      ['mangabound', 'manga2ink'],
      ['mangapress', 'mangaprep'],
    ])('redirects the former project address %s and keeps its language', async (oldId, id) => {
      configure();
      const harness = await RouterTestingHarness.create();
      const page = await harness.navigateByUrl(`/portfolio/${oldId}?locale=pt`, ProjectDetailPage);
      expect(page.id()).toBe(id);
      expect(TestBed.inject(Router).url).toBe(`/portfolio/${id}?locale=pt`);
    });

    it('shows the not-found page, not an empty project page, for an id that is no project', async () => {
      configure();
      const harness = await RouterTestingHarness.create();

      await harness.navigateByUrl('/portfolio/no-such-project', ErrorPage);

      expect(harness.routeNativeElement?.textContent).toContain('404');
    });

    it('shows the not-found page for an address that does not exist at all', async () => {
      configure();
      const harness = await RouterTestingHarness.create();

      const page = await harness.navigateByUrl('/definitely/not/here', ErrorPage);

      expect(page.currentPath).toBe('/definitely/not/here');
    });
  });

});
