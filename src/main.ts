import { bootstrapApplication } from '@angular/platform-browser';
import { inject as injectAnalytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .then(() => {
    injectAnalytics({ framework: 'angular' });
    injectSpeedInsights({ framework: 'angular' });
  })
  .catch((err) => console.error(err));
