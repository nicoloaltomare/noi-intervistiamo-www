import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/public/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'private',
    canActivate: [authGuard],
    children: [
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { role: 'ADMIN' },
        loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/private/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
          },
          {
            path: 'users',
            loadComponent: () => import('./pages/private/admin-dashboard/components/users-list/users-list.component').then(m => m.UsersListComponent)
          },
          {
            path: 'roles',
            loadComponent: () => import('./pages/private/admin-dashboard/components/roles-list/roles-list.component').then(m => m.RolesListComponent)
          },
          {
            path: 'departments',
            loadComponent: () => import('./pages/private/admin-dashboard/components/departments-list/departments-list.component').then(m => m.DepartmentsListComponent)
          },
          {
            path: 'interviewers',
            loadComponent: () => import('./pages/private/admin-dashboard/components/interviewers-list/interviewers-list.component').then(m => m.InterviewersListComponent)
          }
        ]
      },
      {
        path: 'hr',
        canActivate: [roleGuard],
        data: { role: 'HR' },
        loadComponent: () => import('./layouts/hr-layout/hr-layout.component').then(m => m.HrLayoutComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/private/hr-dashboard/hr-dashboard.component').then(m => m.HrDashboardComponent)
          },
          {
            path: 'candidates',
            loadComponent: () => import('./pages/private/hr-dashboard/hr-dashboard.component').then(m => m.HrDashboardComponent)
          },
          {
            path: 'interviews',
            loadComponent: () => import('./pages/private/hr-dashboard/hr-dashboard.component').then(m => m.HrDashboardComponent)
          },
          {
            path: 'reports',
            loadComponent: () => import('./pages/private/hr-dashboard/hr-dashboard.component').then(m => m.HrDashboardComponent)
          }
        ]
      },
      {
        path: 'interviewer',
        canActivate: [roleGuard],
        data: { role: 'INTERVIEWER' },
        loadComponent: () => import('./layouts/interviewer-layout/interviewer-layout.component').then(m => m.InterviewerLayoutComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/private/interviewer-dashboard/interviewer-dashboard.component').then(m => m.InterviewerDashboardComponent)
          },
          {
            path: 'my-interviews',
            loadComponent: () => import('./pages/private/interviewer-dashboard/interviewer-dashboard.component').then(m => m.InterviewerDashboardComponent)
          },
          {
            path: 'calendar',
            loadComponent: () => import('./pages/private/interviewer-dashboard/interviewer-dashboard.component').then(m => m.InterviewerDashboardComponent)
          },
          {
            path: 'evaluations',
            loadComponent: () => import('./pages/private/interviewer-dashboard/interviewer-dashboard.component').then(m => m.InterviewerDashboardComponent)
          }
        ]
      },
      {
        path: 'candidate',
        canActivate: [roleGuard],
        data: { role: 'CANDIDATE' },
        loadComponent: () => import('./layouts/candidate-layout/candidate-layout.component').then(m => m.CandidateLayoutComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/private/candidate-dashboard/candidate-dashboard.component').then(m => m.CandidateDashboardComponent)
          },
          {
            path: 'quiz',
            loadComponent: () => import('./pages/private/candidate-dashboard/candidate-dashboard.component').then(m => m.CandidateDashboardComponent)
          },
          {
            path: 'feedback',
            loadComponent: () => import('./pages/private/candidate-dashboard/candidate-dashboard.component').then(m => m.CandidateDashboardComponent)
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
