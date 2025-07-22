import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Header } from './core/layout/header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    translate.addLangs(['en', 'pt']);
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const locale = params['locale'];
      const lang = locale?.split('_')[0] || 'en';

      if (this.translate.getLangs().includes(lang)) {
        this.translate.use(lang);
      }
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentLang = this.translate.currentLang;
        const currentParams = this.route.snapshot.queryParams;

        if (!currentParams['locale'] && currentLang !== 'en') {
          this.router.navigate([], {
            queryParams: {
              locale: currentLang === 'pt' ? 'pt_BR' : currentLang,
            },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }
      });
  }
}
