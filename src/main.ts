import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { appConfig } from './app/core/config/app.config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loading_interceptor } from './app/core/interceptors/loading.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([loading_interceptor]))
  ]
}).catch(err => console.error(err));
