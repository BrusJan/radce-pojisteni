import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/shared/interceptors/auth.interceptor';
import { authGuard } from './app/shared/guards/auth.guard';
import { LoginComponent } from './app/auth/login.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { ClientsComponent } from './app/clients/clients.component';
import { FilesComponent } from './app/files/files.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter([
      { path: 'login', component: LoginComponent },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
        children: [
          { path: 'clients', component: ClientsComponent },
          { path: 'files', component: FilesComponent },
          { path: '', redirectTo: 'clients', pathMatch: 'full' }
        ]
      },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: '/dashboard' }
    ])
  ]
}).catch((error: unknown) => {
  console.error('Bootstrap failed', error);
});
