import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BreadcrumbItem } from '../toolkit/breadcrumb/breadcrumb.component';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public breadcrumbs$: Observable<BreadcrumbItem[]> = this.breadcrumbsSubject.asObservable();

  private routeLabels: { [key: string]: string } = {
    // Admin routes
    'admin': 'Dashboard',
    'users': 'Elenco Utenti',
    'roles': 'Elenco Ruoli',
    'departments': 'Elenco Dipartimenti',
    'interviewers': 'Gestione Intervistatori',

    // HR routes
    'hr': 'Dashboard',
    'candidates': 'Gestione Candidati',
    'interviews': 'Gestione Colloqui',
    'reports': 'Report',

    // Interviewer routes
    'interviewer': 'Dashboard',
    'my-interviews': 'I miei Colloqui',
    'calendar': 'Calendario',
    'evaluations': 'Valutazioni',

    // Candidate routes
    'candidate': 'Dashboard',
    'quiz': 'Quiz',
    'feedback': 'Esprimi il tuo parere'
  };

  private routeIcons: { [key: string]: string } = {
    'admin': 'fas fa-shield-alt',
    'hr': 'fas fa-users',
    'interviewer': 'fas fa-user-check',
    'candidate': 'fas fa-user',
    'users': 'fas fa-user-friends',
    'roles': 'fas fa-user-tag',
    'departments': 'fas fa-building',
    'interviewers': 'fas fa-user-tie',
    'candidates': 'fas fa-users',
    'interviews': 'fas fa-calendar-check',
    'reports': 'fas fa-chart-bar',
    'my-interviews': 'fas fa-calendar-alt',
    'calendar': 'fas fa-calendar',
    'evaluations': 'fas fa-star',
    'quiz': 'fas fa-clipboard-list',
    'feedback': 'fas fa-comment-dots'
  };

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBreadcrumbs();
      });
  }

  private updateBreadcrumbs(): void {
    const url = this.router.url;
    const urlSegments = url.split('/').filter(segment => segment);

    const breadcrumbs: BreadcrumbItem[] = [];
    let currentRoute = '';

    urlSegments.forEach((segment, index) => {
      // Salta il segmento "private"
      if (segment === 'private') {
        return;
      }

      currentRoute += `/${segment}`;
      const label = this.routeLabels[segment] || this.formatLabel(segment);
      const icon = this.routeIcons[segment];
      const isLast = index === urlSegments.length - 1;

      breadcrumbs.push({
        label,
        icon,
        route: `/private${currentRoute}`,
        isActive: isLast
      });
    });

    this.breadcrumbsSubject.next(breadcrumbs);
  }

  private formatLabel(segment: string): string {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    this.breadcrumbsSubject.next(breadcrumbs);
  }
}