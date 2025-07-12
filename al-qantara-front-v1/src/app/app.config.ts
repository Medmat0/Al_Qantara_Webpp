import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import { AuthInterceptor } from './member/interceptors/auth.interceptor';
import {MemberInterceptor} from './member/interceptors/member.interceptor';
import {NotFoundInterceptor} from './member/interceptors/not-found.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {  provide: HTTP_INTERCEPTORS, useClass: MemberInterceptor, multi: true },
    {  provide: HTTP_INTERCEPTORS, useClass: NotFoundInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi())
  ]
};
