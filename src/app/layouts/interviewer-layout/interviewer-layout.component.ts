import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderBarComponent } from '../../core/toolkit/header-bar';
import { SidebarComponent, type SidebarConfig } from '../../core/toolkit/sidebar';

@Component({
  selector: 'app-interviewer-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderBarComponent,
    SidebarComponent
  ],
  templateUrl: './interviewer-layout.component.html',
  styleUrl: './interviewer-layout.component.scss'
})
export class InterviewerLayoutComponent {
  interviewerSidebarConfig: SidebarConfig = {
    headerTitle: 'Interviewer Panel',
    headerIcon: 'fas fa-user-check',
    homeRoute: '/private/interviewer',
    footerText: 'BVTech Interviewer v1.0',
    menuItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'fas fa-tachometer-alt',
        route: '/private/interviewer'
      },
      {
        id: 'my-interviews',
        label: 'I miei Colloqui',
        icon: 'fas fa-calendar-alt',
        route: '/private/interviewer/my-interviews'
      },
      {
        id: 'calendar',
        label: 'Calendario',
        icon: 'fas fa-calendar',
        route: '/private/interviewer/calendar'
      },
      {
        id: 'evaluations',
        label: 'Valutazioni',
        icon: 'fas fa-star',
        route: '/private/interviewer/evaluations'
      }
    ]
  };
}