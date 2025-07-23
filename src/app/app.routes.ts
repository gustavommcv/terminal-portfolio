import { Routes } from '@angular/router';
import { HomePage } from './features/home/home-page/home-page';
import { ErrorPage } from './features/error/error-page/error-page';
import { AboutPage } from './features/about/about-page/about-page';
import { PortfolioPage } from './features/portfolio/portfolio-page/portfolio-page';
import { ProjectDetailPage } from './features/projectDetail/project-detail-page/project-detail-page';

// TODO
// Lazy
export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'about', component: AboutPage },
  { path: 'portfolio', component: PortfolioPage },
  { path: 'projects/:id', component: ProjectDetailPage },
  { path: '**', component: ErrorPage },
];
