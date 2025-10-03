import { Component, Input, signal, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
}

export interface SidebarConfig {
  headerTitle: string;
  headerIcon: string;
  homeRoute: string;
  menuItems: MenuItem[];
  footerText?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() config!: SidebarConfig;

  private router = inject(Router);

  isExpanded = signal(true);
  expandedMenus = signal<Set<string>>(new Set());
  dropdownTop = 0;
  isMobile = signal(false);

  ngOnInit() {
    if (!this.config) {
      console.error('SidebarComponent requires config input');
      return;
    }
    this.setupRouterSubscription();
    this.checkScreenSize();
  }

  private setupRouterSubscription() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveMenus(event.url);
      });

    this.updateActiveMenus(this.router.url);
  }

  private updateActiveMenus(url: string) {
    // Espandi automaticamente i menu che contengono la route attiva
    const expanded = new Set<string>();

    this.config.menuItems.forEach(item => {
      if (item.children) {
        // Controlla se uno dei figli è attivo
        const hasActiveChild = item.children.some(child =>
          child.route && (url === child.route || url.startsWith(child.route + '/'))
        );

        if (hasActiveChild) {
          expanded.add(item.id);
        }
      }
    });

    this.expandedMenus.set(expanded);
  }

  toggleSidebar() {
    // Previeni l'espansione su dispositivi piccoli
    if (this.isMobile()) {
      return;
    }

    this.isExpanded.set(!this.isExpanded());
    // Chiudi tutti i menu quando si collassa la sidebar
    if (!this.isExpanded()) {
      this.expandedMenus.set(new Set());
    } else {
      // Quando si riapre la sidebar, riapri i menu con route attive
      this.updateActiveMenus(this.router.url);
    }
  }

  private checkScreenSize() {
    const width = window.innerWidth;
    this.isMobile.set(width <= 991);

    // Se siamo su mobile, mantieni la sidebar collassata
    if (this.isMobile()) {
      this.isExpanded.set(false);
      this.expandedMenus.set(new Set());
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  toggleMenu(menuId: string) {
    const expanded = new Set(this.expandedMenus());
    if (expanded.has(menuId)) {
      expanded.delete(menuId);
    } else {
      expanded.add(menuId);
    }
    this.expandedMenus.set(expanded);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  onMenuItemClick(item: MenuItem) {
    if (item.route) {
      this.navigateTo(item.route);
      // Chiudi il dropdown dopo la navigazione se la sidebar è collassata
      if (!this.isExpanded()) {
        this.expandedMenus.set(new Set());
      }
    }
  }

  onParentClick(item: MenuItem, element?: HTMLElement) {
    if (item.children) {
      this.toggleMenu(item.id);

      // Calcola la posizione verticale del dropdown quando la sidebar è collassata
      if (!this.isExpanded() && element) {
        const rect = element.getBoundingClientRect();
        this.dropdownTop = rect.top;
      }
    }
  }

  isMenuExpanded(menuId: string): boolean {
    return this.expandedMenus().has(menuId);
  }

  isActiveRoute(route: string): boolean {
    if (!route) return false;

    // Match esatto per la dashboard
    if (route === this.config.homeRoute) {
      return this.router.url === route;
    }

    // Per le altre route, controlla anche i percorsi figli
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  hasActiveChild(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => this.isActiveRoute(child.route || ''));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Chiudi i dropdown quando si clicca fuori dalla sidebar e la sidebar è collassata
    if (!this.isExpanded()) {
      const target = event.target as HTMLElement;
      const sidebar = document.querySelector('.sidebar');
      const dropdown = document.querySelector('.dropdown');

      if (sidebar && !sidebar.contains(target) && dropdown && !dropdown.contains(target)) {
        this.expandedMenus.set(new Set());
      }
    }
  }
}