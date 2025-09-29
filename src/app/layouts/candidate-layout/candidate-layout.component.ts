import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderBarComponent } from '../../core/toolkit/header-bar';
import { SidebarComponent, type SidebarConfig } from '../../core/toolkit/sidebar';

@Component({
  selector: 'app-candidate-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderBarComponent,
    SidebarComponent
  ],
  templateUrl: './candidate-layout.component.html',
  styleUrl: './candidate-layout.component.scss'
})
export class CandidateLayoutComponent {
  candidateSidebarConfig: SidebarConfig = {
    headerTitle: 'Candidate Panel',
    headerIcon: 'fas fa-user',
    homeRoute: '/private/candidate',
    footerText: 'BVTech Candidate v1.0',
    menuItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'fas fa-tachometer-alt',
        route: '/private/candidate'
      },
      {
        id: 'quiz',
        label: 'Quiz',
        icon: 'fas fa-clipboard-list',
        route: '/private/candidate/quiz'
      },
      {
        id: 'feedback',
        label: 'Esprimi il tuo parere',
        icon: 'fas fa-comment-dots',
        route: '/private/candidate/feedback'
      }
    ]
  };
}