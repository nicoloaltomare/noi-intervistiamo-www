import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  icon?: string;
  route?: string;
  queryParams?: any;
  isActive?: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Input() showHome: boolean = true;
  @Input() homeRoute: string = '/';
  @Input() homeIcon: string = 'fas fa-home';
  @Input() homeLabel: string = 'Home';
  @Input() sidebarExpanded: boolean = false;

  constructor(private router: Router) {}

  navigateTo(item: BreadcrumbItem, event: Event): void {
    event.preventDefault();

    if (item.route && !item.isActive) {
      if (item.queryParams) {
        this.router.navigate([item.route], { queryParams: item.queryParams });
      } else {
        this.router.navigate([item.route]);
      }
    }
  }

  navigateHome(event: Event): void {
    event.preventDefault();
    this.router.navigate([this.homeRoute]);
  }
}