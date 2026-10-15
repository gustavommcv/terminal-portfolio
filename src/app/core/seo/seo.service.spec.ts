import { DOCUMENT } from '@angular/common';
import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { SITE_URL } from '../../data/site.config';
import { LanguageCatalogState, LanguageService } from '../i18n/language.service';
import { SeoService } from './seo.service';

const catalogs = {
  en: {
    seo: {
      home: { title: 'Home EN', description: 'Home description EN' },
      about: { title: 'About EN', description: 'About description EN' },
      portfolio: { title: 'Portfolio EN', description: 'Portfolio description EN' },
      project: { title: '{{title}} | Site' },
      'not-found': { title: 'Missing EN', description: 'Missing description EN' },
    },
    'projects-page': {
      projects: {
        mangabound: { title: 'Mangabound', shortDescription: 'Desktop app EN' },
        maquetaria: { title: 'Veronese', shortDescription: 'Platform EN' },
      },
    },
  },
  pt: {
    seo: {
      home: { title: 'Início PT', description: 'Descrição início PT' },
      about: { title: 'Sobre PT', description: 'Descrição sobre PT' },
      portfolio: { title: 'Portfólio PT', description: 'Descrição portfólio PT' },
      project: { title: '{{title}} | Site' },
      'not-found': { title: 'Faltando PT', description: 'Descrição faltando PT' },
    },
    'projects-page': {
      projects: {
        mangabound: { title: 'Mangabound', shortDescription: 'App desktop PT' },
        maquetaria: { title: 'Veronese', shortDescription: 'Plataforma PT' },
      },
    },
  },
};

describe('SeoService', () => {
  let catalogState: ReturnType<typeof signal<LanguageCatalogState>>;
  let router: Router;
  let document: Document;
  let appRef: ApplicationRef;

  beforeEach(() => {
    catalogState = signal<LanguageCatalogState>({
      status: 'ready',
      language: 'en',
      translations: catalogs.en,
    });

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', data: { seo: 'home' }, children: [] },
          { path: 'about', data: { seo: 'about' }, children: [] },
          { path: 'portfolio', data: { seo: 'portfolio' }, children: [] },
          { path: 'portfolio/:id', data: { seo: 'project' }, children: [] },
          { path: '**', data: { seo: 'not-found' }, children: [] },
        ]),
        { provide: LanguageService, useValue: { catalogState } },
      ],
    });

    TestBed.inject(SeoService);
    router = TestBed.inject(Router);
    document = TestBed.inject(DOCUMENT);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    document.head
      .querySelectorAll('meta, link[rel="canonical"], link[rel="alternate"]')
      .forEach((element) => element.remove());
  });

  const go = async (url: string) => {
    await router.navigateByUrl(url);
    appRef.tick();
  };
  const meta = (attribute: 'name' | 'property', key: string) =>
    document.head
      .querySelector(`meta[${attribute}="${key}"]`)
      ?.getAttribute('content') ?? null;
  const canonical = () =>
    document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ??
    null;
  const alternates = () =>
    Array.from(
      document.head.querySelectorAll('link[rel="alternate"][hreflang]'),
    ).map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]);

  it('sets the title, description, canonical URL and social tags for the home page', async () => {
    await go('/');

    expect(document.title).toBe('Home EN');
    expect(meta('name', 'description')).toBe('Home description EN');
    expect(canonical()).toBe(`${SITE_URL}/`);
    expect(meta('property', 'og:url')).toBe(`${SITE_URL}/`);
    expect(meta('property', 'og:title')).toBe('Home EN');
    expect(meta('property', 'og:locale')).toBe('en_US');
    expect(meta('property', 'og:locale:alternate')).toBe('pt_BR');
    expect(meta('name', 'twitter:title')).toBe('Home EN');
    expect(meta('name', 'robots')).toBeNull();
  });

  it('builds every address on the canonical host, ignoring any query string or fragment', async () => {
    await go('/about?utm_source=cv#top');

    expect(canonical()).toBe(`${SITE_URL}/about`);
    expect(canonical()).not.toContain('://www.');
  });

  it('declares each language as an alternate, with English as the default', async () => {
    await go('/about');

    expect(alternates()).toEqual([
      ['en', `${SITE_URL}/about`],
      ['pt-BR', `${SITE_URL}/about?locale=pt`],
      ['x-default', `${SITE_URL}/about`],
    ]);
  });

  it('re-applies everything in Portuguese, with a self-referencing ?locale=pt canonical', async () => {
    await go('/about');

    catalogState.set({
      status: 'ready',
      language: 'pt',
      translations: catalogs.pt,
    });
    appRef.tick();

    expect(document.title).toBe('Sobre PT');
    expect(meta('name', 'description')).toBe('Descrição sobre PT');
    expect(canonical()).toBe(`${SITE_URL}/about?locale=pt`);
    expect(meta('property', 'og:locale')).toBe('pt_BR');
    expect(meta('property', 'og:locale:alternate')).toBe('en_US');
  });

  it('leaves the tags alone while a catalog is still loading', async () => {
    await go('/about');
    catalogState.set({ status: 'loading', language: 'pt' });
    appRef.tick();

    expect(document.title).toBe('About EN');
  });

  it('describes a project page with its own title, summary and card image', async () => {
    await go('/portfolio/mangabound');

    expect(document.title).toBe('Mangabound | Site');
    expect(meta('name', 'description')).toBe('Desktop app EN');
    expect(canonical()).toBe(`${SITE_URL}/portfolio/mangabound`);
    // Mangabound declares a cover, which is what a shared link should show.
    expect(meta('property', 'og:image')).toBe(
      `${SITE_URL}/images/projects/mangabound/images/mangabound-cover.webp`,
    );
    expect(meta('name', 'twitter:card')).toBe('summary_large_image');
    // The default image's dimensions must not leak onto a different image.
    expect(meta('property', 'og:image:width')).toBeNull();
    expect(meta('property', 'og:image:height')).toBeNull();
  });

  it('uses the first gallery image for a project without a cover', async () => {
    await go('/portfolio/maquetaria');

    expect(meta('property', 'og:image')).toBe(
      `${SITE_URL}/images/projects/maquetaria/images/maquetaria-home.webp`,
    );
  });

  it('goes back to the default social image, with its dimensions, on other pages', async () => {
    await go('/portfolio/mangabound');
    await go('/about');

    expect(meta('property', 'og:image')).toBe(`${SITE_URL}/images/me.webp`);
    expect(meta('property', 'og:image:width')).toBe('584');
    expect(meta('property', 'og:image:height')).toBe('855');
    expect(meta('name', 'twitter:card')).toBe('summary');
  });

  it('marks an unknown page noindex, with no canonical URL or alternates', async () => {
    await go('/about');
    expect(canonical()).not.toBeNull();

    await go('/nowhere');

    expect(document.title).toBe('Missing EN');
    expect(meta('name', 'robots')).toBe('noindex');
    expect(canonical()).toBeNull();
    expect(alternates()).toEqual([]);
    expect(meta('property', 'og:url')).toBeNull();
  });

  it('treats a project id that does not exist as a missing page', async () => {
    await go('/portfolio/not-a-project');

    expect(document.title).toBe('Missing EN');
    expect(meta('name', 'robots')).toBe('noindex');
  });

  it('becomes indexable again once the visitor leaves a missing page', async () => {
    await go('/nowhere');
    await go('/portfolio');

    expect(meta('name', 'robots')).toBeNull();
    expect(canonical()).toBe(`${SITE_URL}/portfolio`);
    expect(alternates()).toHaveLength(3);
  });

  it('does not duplicate canonical or alternate links across navigations', async () => {
    await go('/');
    await go('/about');
    await go('/portfolio');

    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(
      document.head.querySelectorAll('link[rel="alternate"][hreflang]'),
    ).toHaveLength(3);
  });

  it('leaves a text empty when the catalog does not have it, never a key or "undefined"', async () => {
    catalogState.set({
      status: 'ready',
      language: 'en',
      translations: { seo: { home: { title: 'Only a title' } } },
    });

    await router.navigateByUrl('/');
    appRef.tick();

    expect(document.title).toBe('Only a title');
    expect(
      document.head.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    ).toBe('');
  });

  it('fills no placeholder with "undefined" when what it should hold is missing', async () => {
    catalogState.set({
      status: 'ready',
      language: 'en',
      translations: { seo: { project: { title: '{{title}} | Site' } } },
    });

    await router.navigateByUrl('/portfolio/mangabound');
    appRef.tick();

    expect(document.title).not.toContain('{{');
    expect(document.title).not.toContain('undefined');
  });


  it('gives an empty text, not an exception, when an entry on the way to a text is null', async () => {
    catalogState.set({
      status: 'ready',
      language: 'en',
      translations: { seo: { home: null } } as never,
    });

    await router.navigateByUrl('/');

    expect(() => appRef.tick()).not.toThrow();
    expect(document.title).toBe('');
  });

});
