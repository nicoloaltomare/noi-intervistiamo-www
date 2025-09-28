import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

export interface UserArea {
  role: 'HR' | 'ADMIN' | 'INTERVIEWER';
  displayName: string;
  route: string;
  icon: string;
  description: string;
}

export interface LoginResponse {
  user: User;
  availableRoles: string[];
  token: string;
  refreshToken: string;
  expiresIn: number;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  currentUser = signal<User | null>(null);

  private readonly AREA_DEFINITIONS: Record<'HR' | 'INTERVIEWER' | 'ADMIN', UserArea> = {
    'HR': {
      role: 'HR',
      displayName: 'Risorse Umane',
      route: '/hr',
      icon: 'fas fa-users',
      description: 'Gestione colloqui conoscitivi e valutazione soft skills'
    },
    'INTERVIEWER': {
      role: 'INTERVIEWER',
      displayName: 'Area Tecnica',
      route: '/interviews',
      icon: 'fas fa-code',
      description: 'Valutazioni tecniche e competenze specifiche'
    },
    'ADMIN': {
      role: 'ADMIN',
      displayName: 'Amministrazione',
      route: '/admin',
      icon: 'fas fa-cog',
      description: 'Gestione sistema e configurazioni avanzate'
    }
  };

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.setAuthState(user, token);
    }
  }

  login(credentials: LoginCredentials): Observable<{ success: boolean; user?: User; availableRoles?: string[] }> {
    return this.apiService.post<LoginResponse>('/auth/login', credentials, { skipAuth: true })
      .pipe(
        map(response => {
          const { user, availableRoles, token, refreshToken } = response;

          this.storeToken(token);
          this.storeRefreshToken(refreshToken);

          return {
            success: true,
            user,
            availableRoles
          };
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => ({
            success: false,
            error: error.error?.message || 'Credenziali non valide'
          }));
        })
      );
  }

  selectArea(user: User, area: UserArea): void {
    const userWithArea = {
      ...user,
      currentRole: area.role
    };

    this.storeUser(userWithArea);
    this.setAuthState(userWithArea);

    this.router.navigate([area.route]);
  }

  logout(): Observable<any> {
    return this.apiService.post('/auth/logout', {})
      .pipe(
        tap(() => {
          this.clearAuthState();
          this.router.navigate(['/']);
        }),
        catchError(() => {
          this.clearAuthState();
          this.router.navigate(['/']);
          return throwError(() => 'Logout failed');
        })
      );
  }


  forgotPassword(email: string): Observable<boolean> {
    return this.apiService.post('/auth/forgot-password', { email }, { skipAuth: true })
      .pipe(
        map(() => true)
      );
  }

  getAvailableAreas(availableRoles: string[]): UserArea[] {
    return availableRoles.map(role =>
      this.AREA_DEFINITIONS[role as keyof typeof this.AREA_DEFINITIONS]
    ).filter(Boolean);
  }

  private setAuthState(user: User, token?: string): void {
    this.currentUser.set(user);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);

    if (token) {
      this.storeToken(token);
    }
  }

  private clearAuthState(): void {
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
  }

  private storeToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private storeRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  private storeUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private getStoredUser(): User | null {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }

}