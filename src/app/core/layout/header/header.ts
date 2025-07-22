import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  currentLocale: string = 'en';
  currentPath: string = '/';

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentPath = this.router.url.split('?')[0];
        const urlLocale = this.router.parseUrl(this.router.url).queryParams[
          'locale'
        ];
        this.currentLocale = urlLocale === 'pt' ? 'pt' : 'en';
      }
    });
  }

  ngOnInit() {
    this.currentPath = this.router.url.split('?')[0];
    const urlLocale = this.router.parseUrl(this.router.url).queryParams[
      'locale'
    ];
    this.currentLocale = urlLocale === 'pt' ? 'pt' : 'en';
  }

  navigateWithLocale(route: string) {
    const queryParams = this.currentLocale === 'pt' ? { locale: 'pt' } : {};
    this.router.navigate([route], { queryParams });
  }

  toggleLanguage() {
    const newLocale = this.currentLocale === 'en' ? 'pt' : 'en';
    this.currentLocale = newLocale;

    const queryParams = newLocale === 'pt' ? { locale: 'pt' } : {};
    this.router.navigate([this.currentPath], { queryParams });
  }

  isActive(route: string): boolean {
    return this.currentPath === route;
  }
}
