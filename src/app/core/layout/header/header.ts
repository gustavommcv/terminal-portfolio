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
  currentLocale: any;
  currentPath: string = '/';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentPath = this.router.url.split('?')[0];
      }
    });
  }

  ngOnInit() {
    this.currentPath = this.router.url.split('?')[0];
  }

  navigateWithLocale(route: string) {
    this.currentLocale = this.router.parseUrl(this.router.url).queryParams['locale'];
    this.router.navigate([route], {
      queryParams: this.currentLocale ? { locale: this.currentLocale } : {},
      queryParamsHandling: 'merge',
    });
  }

  isActive(route: string): boolean {
    return this.currentPath === route;
  }
}
