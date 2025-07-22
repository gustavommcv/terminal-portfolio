import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private localeSubject = new BehaviorSubject<string>('en');
  currentLocale$ = this.localeSubject.asObservable();

  private _currentPath = '/';

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._currentPath = this.router.url.split('?')[0];
        const urlLocale = this.router.parseUrl(this.router.url).queryParams[
          'locale'
        ];
        const detected = urlLocale === 'pt' ? 'pt' : 'en';
        this.localeSubject.next(detected);
      }
    });
  }

  toggleLanguage() {
    const newLocale = this.localeSubject.value === 'en' ? 'pt' : 'en';
    this.localeSubject.next(newLocale);
    const queryParams = newLocale === 'pt' ? { locale: 'pt' } : {};
    this.router.navigate([this._currentPath], { queryParams });
  }

  get currentLocale(): string {
    return this.localeSubject.value;
  }

  navigateWithLocale(route: string) {
    const queryParams = this.currentLocale === 'pt' ? { locale: 'pt' } : {};
    this.router.navigate([route], { queryParams });
  }

  isActive(route: string): boolean {
    return this._currentPath === route;
  }
}
