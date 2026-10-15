import { DOCUMENT } from '@angular/common';
import { DestroyRef, effect, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import type { InterpolatableTranslationObject } from '@ngx-translate/core';
import { filter } from 'rxjs';

import { projectCardImage } from '../../data/project-media';
import { DEFAULT_SOCIAL_IMAGE, SITE_URL } from '../../data/site.config';
import { LanguageService, SupportedLanguage } from '../i18n/language.service';
import { ProjectsDataService } from '../../data/projects-data.service';

/** Which kind of page a route is, declared in its `data.seo`. */
export type SeoPage = 'home' | 'about' | 'portfolio' | 'project' | 'not-found';

interface ActiveRoute {
  readonly page: SeoPage;
  /** URL path without query or fragment, e.g. `/portfolio/maquetaria`. */
  readonly path: string;
  readonly projectId: string | null;
}

interface PageSeo {
  readonly title: string;
  readonly description: string;
  readonly image: { readonly url: string; readonly width?: number; readonly height?: number };
  readonly indexable: boolean;
}

const OG_LOCALE: Record<SupportedLanguage, string> = {
  en: 'en_US',
  pt: 'pt_BR',
};

const HREFLANG: Record<SupportedLanguage, string> = {
  en: 'en',
  pt: 'pt-BR',
};

/**
 * Keeps the document's title, description, canonical URL, language
 * alternates, and social-card tags in step with the current route and
 * language. It runs during prerendering too, so each static page ships with
 * its own tags, and it re-applies them when the language is switched.
 */
@Service()
export class SeoService {
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);
  private readonly projects = inject(ProjectsDataService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private readonly activeRoute = signal<ActiveRoute | null>(null);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.readRoute());

    // A blocking initial navigation (server rendering) can finish before this
    // service exists; the router state is already populated in that case.
    this.readRoute();

    effect(() => {
      const route = this.activeRoute();
      const catalog = this.language.catalogState();
      if (route === null || catalog.status !== 'ready') {
        return;
      }

      this.apply(route, catalog.language, catalog.translations);
    });
  }

  private readRoute(): void {
    const snapshot = this.router.routerState.snapshot;
    let route = snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const page = route.data['seo'] as SeoPage | undefined;
    if (page === undefined) {
      return;
    }

    this.activeRoute.set({
      page,
      path: snapshot.url.split(/[?#]/)[0] || '/',
      projectId: route.paramMap.get('id'),
    });
  }

  private apply(
    route: ActiveRoute,
    language: SupportedLanguage,
    translations: InterpolatableTranslationObject,
  ): void {
    const seo = this.describe(route, translations);

    this.title.setTitle(seo.title);
    this.setMeta('name', 'description', seo.description);
    this.setMeta('name', 'robots', seo.indexable ? null : 'noindex');

    this.setMeta('property', 'og:title', seo.title);
    this.setMeta('property', 'og:description', seo.description);
    this.setMeta('property', 'og:image', seo.image.url);
    this.setMeta('property', 'og:image:width', seo.image.width?.toString() ?? null);
    this.setMeta('property', 'og:image:height', seo.image.height?.toString() ?? null);
    this.setMeta('property', 'og:locale', OG_LOCALE[language]);
    this.setMeta(
      'property',
      'og:locale:alternate',
      OG_LOCALE[language === 'en' ? 'pt' : 'en'],
    );

    this.setMeta('name', 'twitter:title', seo.title);
    this.setMeta('name', 'twitter:description', seo.description);
    this.setMeta('name', 'twitter:image', seo.image.url);
    // The default image is a portrait photo; project images are 16:9.
    this.setMeta(
      'name',
      'twitter:card',
      seo.image.width === undefined ? 'summary_large_image' : 'summary',
    );

    // A page that is not indexable has no canonical address and no alternates.
    const canonical = seo.indexable ? this.urlFor(route.path, language) : null;
    this.setMeta('property', 'og:url', canonical);
    this.setCanonical(canonical);
    this.setAlternates(seo.indexable ? route.path : null);
  }

  private describe(
    route: ActiveRoute,
    translations: InterpolatableTranslationObject,
  ): PageSeo {
    const text = (path: string, params?: Record<string, string>): string =>
      this.translate(translations, path, params);

    const defaultImage = {
      url: `${SITE_URL}/${DEFAULT_SOCIAL_IMAGE.path}`,
      width: DEFAULT_SOCIAL_IMAGE.width,
      height: DEFAULT_SOCIAL_IMAGE.height,
    };

    if (route.page === 'project') {
      const project = this.projects.getProjectById(route.projectId ?? '');
      if (project !== undefined) {
        const projectKey = `projects-page.projects.${project.id}`;
        return {
          title: text('seo.project.title', { title: text(`${projectKey}.title`) }),
          description: text(`${projectKey}.shortDescription`),
          image: { url: `${SITE_URL}/${projectCardImage(project)}` },
          indexable: true,
        };
      }
    }

    // Anything else without a page of its own (including a project id that
    // does not exist) is treated as a missing page.
    const page = route.page === 'project' ? 'not-found' : route.page;
    return {
      title: text(`seo.${page}.title`),
      description: text(`seo.${page}.description`),
      image: defaultImage,
      indexable: page !== 'not-found',
    };
  }

  /** Looks a dotted key up in the loaded catalog and fills `{{param}}` slots. */
  private translate(
    translations: InterpolatableTranslationObject,
    path: string,
    params: Record<string, string> = {},
  ): string {
    let node: unknown = translations;
    for (const key of path.split('.')) {
      if (typeof node !== 'object' || node === null || Array.isArray(node)) {
        return '';
      }
      node = (node as Record<string, unknown>)[key];
    }

    return typeof node === 'string'
      ? node.replace(/{{\s*(\w+)\s*}}/g, (_, name: string) => params[name] ?? '')
      : '';
  }

  private urlFor(path: string, language: SupportedLanguage): string {
    const url = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
    return language === 'pt' ? `${url}?locale=pt` : url;
  }

  private setMeta(
    attribute: 'name' | 'property',
    key: string,
    content: string | null,
  ): void {
    const selector = `${attribute}="${key}"`;
    if (content === null) {
      this.meta.removeTag(selector);
      return;
    }

    this.meta.updateTag({ [attribute]: key, content }, selector);
  }

  private setCanonical(href: string | null): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (href === null) {
      link?.remove();
      return;
    }

    if (link === null) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  /** `hreflang` alternates: each language's address, plus English as the default. */
  private setAlternates(path: string | null): void {
    const head = this.document.head;
    head
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach((link) => link.remove());

    if (path === null) {
      return;
    }

    const alternates: [string, string][] = [
      [HREFLANG.en, this.urlFor(path, 'en')],
      [HREFLANG.pt, this.urlFor(path, 'pt')],
      ['x-default', this.urlFor(path, 'en')],
    ];

    for (const [hreflang, href] of alternates) {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      link.setAttribute('href', href);
      head.appendChild(link);
    }
  }
}
