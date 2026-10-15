import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import type { InterpolatableTranslationObject } from '@ngx-translate/core';
import { distinctUntilChanged, filter, map, take } from 'rxjs';

import { LanguagePreference } from './language-preference.service';

export type SupportedLanguage = 'en' | 'pt';

export type LanguageCatalogState =
  | { readonly status: 'loading'; readonly language: SupportedLanguage }
  | {
      readonly status: 'ready';
      readonly language: SupportedLanguage;
      readonly translations: InterpolatableTranslationObject;
    }
  | { readonly status: 'failed'; readonly language: SupportedLanguage };

@Service()
export class LanguageService {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly preference = inject(LanguagePreference);

  private readonly internalCatalogState = signal<LanguageCatalogState>({
    status: 'loading',
    language: 'en',
  });
  private awaitingFirstNavigation = true;
  private readonly currentPath = signal('/');
  private requestedLanguage: SupportedLanguage | undefined;
  private activeLoad?: { unsubscribe(): void };

  readonly catalogState = this.internalCatalogState.asReadonly();
  readonly currentLocale = computed(() => this.catalogState().language);

  constructor() {
    this.translate.addLangs(['en', 'pt']);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((url) => this.onNavigationEnd(url));

    this.translate.onTranslationRefresh
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshActiveCatalog());

    this.destroyRef.onDestroy(() => this.activeLoad?.unsubscribe());
    this.synchronizeFromUrl(this.router.url);
  }

  toggleLanguage(): Promise<boolean> {
    const language = this.currentLocale() === 'en' ? 'pt' : 'en';
    this.preference.remember(language);
    return this.router.navigate([this.currentPath()], {
      queryParams: this.queryParamsFor(language),
    });
  }

  navigateWithLocale(route: string): Promise<boolean> {
    return this.router.navigate([route], {
      queryParams: this.queryParamsFor(this.currentLocale()),
    });
  }

  localizedUrl(route: string): string {
    return this.router.serializeUrl(
      this.router.createUrlTree([route], {
        queryParams: this.queryParamsFor(this.currentLocale()),
      }),
    );
  }

  isActive(route: string): boolean {
    return this.currentPath() === route;
  }

  private onNavigationEnd(url: string): void {
    if (this.awaitingFirstNavigation) {
      this.awaitingFirstNavigation = false;
      if (this.applyInitialPreference(url)) {
        return;
      }
    }

    this.synchronizeFromUrl(url);
  }

  /**
   * Decides the language of the very first page load only; later navigations
   * keep following the URL. An explicit `?locale=` always wins (it is what a
   * shared link or the CV carries) and is remembered, so a reload after
   * in-app navigation - which drops the English parameter - stays in the same
   * language. Without one, the visitor's remembered choice, then the browser's
   * language list, decides. Returns true when it redirected: the redirected
   * navigation then loads the right catalog, instead of fetching English first.
   */
  private applyInitialPreference(url: string): boolean {
    const tree = this.router.parseUrl(url);
    const requested = tree.queryParams['locale'];

    if (requested !== undefined) {
      this.preference.remember(this.normalizeLocale(requested));
      return false;
    }

    if (this.preference.preferred() !== 'pt') {
      return false;
    }

    tree.queryParams = { ...tree.queryParams, locale: 'pt' };
    void this.router.navigateByUrl(tree, { replaceUrl: true });
    return true;
  }

  private synchronizeFromUrl(url: string): void {
    const tree = this.router.parseUrl(url);
    this.currentPath.set(
      tree.root.children['primary']
        ? `/${tree.root.children['primary'].segments
            .map((segment) => segment.path)
            .join('/')}`
        : '/',
    );

    const language = this.normalizeLocale(tree.queryParams['locale']);
    if (language === this.requestedLanguage) {
      return;
    }

    this.requestedLanguage = language;
    this.internalCatalogState.set({ status: 'loading', language });
    this.activeLoad?.unsubscribe();
    this.activeLoad = this.translate
      .use(language)
      .pipe(take(1))
      .subscribe({
        next: (translations) => {
          if (this.requestedLanguage !== language) {
            return;
          }

          this.internalCatalogState.set({
            status: 'ready',
            language,
            translations,
          });
          this.document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en';
        },
        error: () => {
          if (this.requestedLanguage === language) {
            this.internalCatalogState.set({ status: 'failed', language });
          }
        },
      });
  }

  private refreshActiveCatalog(): void {
    const state = this.internalCatalogState();
    if (
      state.status !== 'ready' ||
      this.translate.currentLang() !== state.language
    ) {
      return;
    }

    this.internalCatalogState.set({
      status: 'ready',
      language: state.language,
      translations: this.translate.getTranslations(state.language),
    });
  }

  private normalizeLocale(locale: unknown): SupportedLanguage {
    return typeof locale === 'string' && locale.toLowerCase().startsWith('pt')
      ? 'pt'
      : 'en';
  }

  private queryParamsFor(language: SupportedLanguage): Params {
    return language === 'pt' ? { locale: 'pt' } : {};
  }
}
