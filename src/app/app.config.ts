import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import {
  SITE_CONTACT_INFO,
  siteContactInfoValue,
} from './core/config/site-contact.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    provideHttpClient(
      withInterceptors([authInterceptor]),
    ),
    { provide: SITE_CONTACT_INFO, useValue: siteContactInfoValue },
  ],
};