import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  active?: boolean;
  children?: MenuItem[];
}

interface SidebarConfig {
  title: string;
  logo: {
    src: string;
    alt: string;
  };
  menuItems: MenuItem[];
  backgroundColor: string;
  textColor: string;
  activeColor: string;
  hoverColor: string;
  width: string;
  collapsedWidth: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() config!: SidebarConfig;
  @Input() collapsed = false;

  expandedItems: Set<string> = new Set();

  ngOnInit() {
    if (!this.config) {
      throw new Error('SidebarComponent requires config input');
    }
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
    if (this.collapsed) {
      this.expandedItems.clear();
    }
  }

  toggleSubmenu(item: MenuItem) {
    if (this.collapsed) return;

    const itemKey = item.route;
    if (this.expandedItems.has(itemKey)) {
      this.expandedItems.delete(itemKey);
    } else {
      this.expandedItems.add(itemKey);
    }
  }

  isExpanded(item: MenuItem): boolean {
    return this.expandedItems.has(item.route);
  }

  hasChildren(item: MenuItem): boolean {
    return !!(item.children && item.children.length > 0);
  }
}
