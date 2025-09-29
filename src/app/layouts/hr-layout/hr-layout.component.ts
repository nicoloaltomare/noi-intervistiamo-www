import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderBarComponent } from '../../core/toolkit/header-bar';
import { SidebarComponent, type SidebarConfig } from '../../core/toolkit/sidebar';

@Component({
  selector: 'app-hr-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderBarComponent,
    SidebarComponent
  ],
  templateUrl: './hr-layout.component.html',
  styleUrl: './hr-layout.component.scss'
})
export class HrLayoutComponent {
  hrSidebarConfig: SidebarConfig = {
    headerTitle: 'HR Panel',
    headerIcon: 'fas fa-user-tie',
    homeRoute: '/private/hr',
    footerText: 'BVTech HR v1.0',
    menuItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'fas fa-tachometer-alt',
        route: '/private/hr'
      },
      {
        id: 'candidate-management',
        label: 'Gestione Candidati',
        icon: 'fas fa-users',
        route: '/private/hr/candidates'
      },
      {
        id: 'interview-management',
        label: 'Gestione Colloqui',
        icon: 'fas fa-calendar-check',
        route: '/private/hr/interviews'
      },
      {
        id: 'reports',
        label: 'Report',
        icon: 'fas fa-chart-bar',
        route: '/private/hr/reports'
      }
    ]
  };
}