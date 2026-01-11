import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { YouthDashboardComponent } from './components/youth/dashboard/dashboard';
import { CheckInComponent } from './components/youth/check-in/check-in';
import { ResourcesComponent } from './components/youth/resources/resources';
export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'youth',
        children: [
            { path: '', component: YouthDashboardComponent },
            { path: 'check-in', component: CheckInComponent },
            { path: 'resources', component: ResourcesComponent },
        ]
    }
];
