import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderBarComponent } from '../../core/toolkit/header-bar/header-bar.component';
import { SidebarComponent } from '../../core/toolkit/sidebar/sidebar.component';

@Component({
  selector: 'app-private-layout',
  imports: [CommonModule, HeaderBarComponent, SidebarComponent],
  templateUrl: './private-layout.component.html',
  styleUrl: './private-layout.component.scss'
})
export class PrivateLayoutComponent implements OnInit {
  headerConfig: any;
  sidebarConfig: any;
  sidebarCollapsed = false;

  async ngOnInit() {
    await this.loadConfigurations();
  }

  private async loadConfigurations() {
    try {
      const [headerResponse, sidebarResponse] = await Promise.all([
        fetch('/assets/config/header-bar.config.json'),
        fetch('/assets/config/sidebar.config.json')
      ]);

      const headerData = await headerResponse.json();
      const sidebarData = await sidebarResponse.json();

      // Combine loaded titles with hardcoded configuration
      this.headerConfig = {
        title: headerData.private?.title || 'Dashboard',
        logo: {
          src: '/assets/images/logo.png',
          alt: 'Noi Intervistiamo Logo'
        },
        navigation: [
          { label: 'Dashboard', route: '/admin/dashboard' },
          { label: 'Utenti', route: '/admin/users' },
          { label: 'Report', route: '/admin/reports' }
        ],
        showUserMenu: true,
        userMenuItems: [
          { label: 'Profilo', route: '/profile' },
          { label: 'Impostazioni', route: '/settings' },
          { label: 'Logout', action: 'logout' }
        ],
        backgroundColor: 'var(--portal-primary)',
        textColor: 'white'
      };

      this.sidebarConfig = {
        title: sidebarData.private?.title || 'Menu',
        logo: {
          src: '/assets/images/logo-small.png',
          alt: 'Logo'
        },
        menuItems: [
          {
            label: 'Dashboard',
            route: '/admin/dashboard',
            icon: 'fas fa-tachometer-alt'
          },
          {
            label: 'Gestione Utenti',
            route: '/admin/users',
            icon: 'fas fa-users',
            children: [
              { label: 'Lista Utenti', route: '/admin/users/list', icon: 'fas fa-list' },
              { label: 'Nuovo Utente', route: '/admin/users/new', icon: 'fas fa-plus' }
            ]
          },
          {
            label: 'Colloqui',
            route: '/admin/interviews',
            icon: 'fas fa-calendar-check',
            children: [
              { label: 'Programmati', route: '/admin/interviews/scheduled', icon: 'fas fa-clock' },
              { label: 'Completati', route: '/admin/interviews/completed', icon: 'fas fa-check' },
              { label: 'Nuovo Colloquio', route: '/admin/interviews/new', icon: 'fas fa-plus' }
            ]
          },
          {
            label: 'Candidati',
            route: '/admin/candidates',
            icon: 'fas fa-user-tie'
          },
          {
            label: 'Valutazioni',
            route: '/admin/evaluations',
            icon: 'fas fa-star'
          },
          {
            label: 'Report',
            route: '/admin/reports',
            icon: 'fas fa-chart-bar'
          },
          {
            label: 'Impostazioni',
            route: '/admin/settings',
            icon: 'fas fa-cog'
          }
        ],
        backgroundColor: 'var(--portal-secondary)',
        textColor: 'white',
        activeColor: 'var(--portal-primary)',
        hoverColor: 'rgba(255, 255, 255, 0.1)',
        width: '250px',
        collapsedWidth: '60px'
      };
    } catch (error) {
      console.error('Error loading configurations:', error);
      // Fallback configuration
      this.headerConfig = {
        title: 'Dashboard',
        logo: {
          src: '/assets/images/logo.png',
          alt: 'Noi Intervistiamo Logo'
        },
        navigation: [
          { label: 'Dashboard', route: '/admin/dashboard' },
          { label: 'Utenti', route: '/admin/users' },
          { label: 'Report', route: '/admin/reports' }
        ],
        showUserMenu: true,
        userMenuItems: [
          { label: 'Profilo', route: '/profile' },
          { label: 'Impostazioni', route: '/settings' },
          { label: 'Logout', action: 'logout' }
        ],
        backgroundColor: 'var(--portal-primary)',
        textColor: 'white'
      };

      this.sidebarConfig = {
        title: 'Menu',
        logo: {
          src: '/assets/images/logo-small.png',
          alt: 'Logo'
        },
        menuItems: [
          {
            label: 'Dashboard',
            route: '/admin/dashboard',
            icon: 'fas fa-tachometer-alt'
          },
          {
            label: 'Gestione Utenti',
            route: '/admin/users',
            icon: 'fas fa-users'
          },
          {
            label: 'Colloqui',
            route: '/admin/interviews',
            icon: 'fas fa-calendar-check'
          },
          {
            label: 'Report',
            route: '/admin/reports',
            icon: 'fas fa-chart-bar'
          }
        ],
        backgroundColor: 'var(--portal-secondary)',
        textColor: 'white',
        activeColor: 'var(--portal-primary)',
        hoverColor: 'rgba(255, 255, 255, 0.1)',
        width: '250px',
        collapsedWidth: '60px'
      };
    }
  }

  onSidebarToggle(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }
}
