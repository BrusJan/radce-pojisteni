import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/shared/interceptors/auth.interceptor';
import { advisorGuard, clientGuard } from './app/shared/guards/auth.guard';
import { LoginComponent } from './app/auth/login.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { ClientDashboardComponent } from './app/client/client-dashboard.component';
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
        canActivate: [advisorGuard],
        children: [
          { path: 'clients', component: ClientsComponent },
          { path: 'files', component: FilesComponent },
          { path: '', redirectTo: 'clients', pathMatch: 'full' }
        ]
      },
      {
        path: 'client',
        component: ClientDashboardComponent,
        canActivate: [clientGuard]
      },
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      { path: '**', redirectTo: '/login' }
    ])
  ]
}).catch((error: unknown) => {
  console.error('Bootstrap failed', error);
});
