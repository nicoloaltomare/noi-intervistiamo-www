import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderBarComponent } from '../../core/toolkit/header-bar';
import { SidebarComponent, type SidebarConfig } from '../../core/toolkit/sidebar';
import { BreadcrumbComponent } from '../../core/toolkit/breadcrumb/breadcrumb.component';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderBarComponent,
    SidebarComponent,
    BreadcrumbComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  private breadcrumbService = inject(BreadcrumbService);
  breadcrumbs$ = this.breadcrumbService.breadcrumbs$;

  adminSidebarConfig: SidebarConfig = {
    headerTitle: 'Admin Panel',
    headerIcon: 'fas fa-shield-alt',
    homeRoute: '/private/admin',
    footerText: 'BVTech Admin v1.0',
    menuItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'fas fa-tachometer-alt',
        route: '/private/admin'
      },
      {
        id: 'user-management',
        label: 'Gestione Utenti',
        icon: 'fas fa-users',
        children: [
          {
            id: 'users-list',
            label: 'Elenco Utenti',
            icon: 'fas fa-user-friends',
            route: '/private/admin/users'
          },
          {
            id: 'roles-list',
            label: 'Elenco Ruoli',
            icon: 'fas fa-user-tag',
            route: '/private/admin/roles'
          },
          {
            id: 'departments-list',
            label: 'Elenco Dipartimenti',
            icon: 'fas fa-building',
            route: '/private/admin/departments'
          }
        ]
      },
      {
        id: 'interviewer-management',
        label: 'Gestione Intervistatori',
        icon: 'fas fa-user-tie',
        route: '/private/admin/interviewers'
      }
    ]
  };
}