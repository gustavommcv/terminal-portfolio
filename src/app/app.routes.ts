import { Routes } from '@angular/router';
import { HomePage } from './features/home/home-page/home-page';
import { ErrorPage } from './features/error/error-page/error-page';
import { AboutPage } from './features/about/about-page/about-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'about', component: AboutPage },
  { path: '**', component: ErrorPage },
];
