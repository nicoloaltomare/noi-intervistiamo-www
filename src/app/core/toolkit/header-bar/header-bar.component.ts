import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavigationItem {
  label: string;
  route?: string;
  action?: string;
}

interface HeaderBarConfig {
  title: string;
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
  imports: [CommonModule, RouterModule],
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.scss'
})
export class HeaderBarComponent implements OnInit {
  @Input() config!: HeaderBarConfig;
  @Input() variant: 'public' | 'private' = 'public';

  showMobileMenu = false;

  ngOnInit() {
    if (!this.config) {
      throw new Error('HeaderBarComponent requires config input');
    }
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  onUserMenuAction(action: string) {
    if (action === 'logout') {
      // Emit logout event or handle logout logic
      console.log('Logout action triggered');
    }
  }
}
