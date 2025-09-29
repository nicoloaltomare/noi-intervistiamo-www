import { Component, OnInit, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

interface NavigationItem {
  label: string;
  route?: string;
  action?: string;
}

interface HeaderConfig {
  title: string;
  subtitle?: string;
  logo: {
    src: string;
    alt: string;
  };
  navigation: NavigationItem[];
  showUserMenu: boolean;
  userMenuItems?: NavigationItem[];
  backgroundColor: string;
  textColor: string;
}

@Component({
  selector: 'app-header-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.scss'
})
export class HeaderBarComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  @Input() variant: 'public' | 'private' | 'admin' = 'public';
  @Input() sidebarExpanded: boolean = false;

  config = signal<HeaderConfig | null>(null);
  isDropdownOpen = signal(false);
  currentUser = this.authService.currentUser;

  ngOnInit() {
    this.loadConfig();
    this.setupRouterSubscription();
  }

  private loadConfig() {
    this.http.get<any>('/assets/config/header-bar.config.json').subscribe({
      next: (data) => {
        const configKey = this.variant;
        if (data[configKey]) {
          this.config.set(data[configKey]);
        }
      },
      error: (error) => {
        console.error('Failed to load header configuration:', error);
      }
    });
  }

  private setupRouterSubscription() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isDropdownOpen.set(false);
      });
  }

  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  onNavigationClick(item: NavigationItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    } else if (item.action) {
      this.handleAction(item.action);
    }
    this.isDropdownOpen.set(false);
  }

  onUserMenuClick(item: NavigationItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    } else if (item.action) {
      this.handleAction(item.action);
    }
    this.isDropdownOpen.set(false);
  }

  private handleAction(action: string): void {
    switch (action) {
      case 'logout':
        this.logout();
        break;
      default:
        console.log('Unhandled action:', action);
    }
  }

  private logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Il router.navigate è già gestito nell'AuthService
        console.log('Logout successful');
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Anche in caso di errore, naviga alla home
      }
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/admin']);
  }
}