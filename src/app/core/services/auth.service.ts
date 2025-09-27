import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

// Interfaces matching mock-server
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

export interface AuthProfile extends User {
  lastLogin?: Date;
  createdAt: Date;
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      interview: boolean;
      evaluation: boolean;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Signals for reactive state management
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Signals
  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());

  // Area definitions - matching test-corso structure
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

          // Store tokens
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
    // Update user with current role
    const userWithArea = {
      ...user,
      currentRole: area.role
    };

    // Store user and set auth state
    this.storeUser(userWithArea);
    this.setAuthState(userWithArea);

    // Navigate to area
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
          // Even if logout fails on server, clear local state
          this.clearAuthState();
          this.router.navigate(['/']);
          return throwError(() => 'Logout failed');
        })
      );
  }

  refreshToken(): Observable<boolean> {
    const refreshToken = this.getStoredRefreshToken();

    if (!refreshToken) {
      return throwError(() => 'No refresh token available');
    }

    return this.apiService.post<{ token: string; refreshToken: string; expiresIn: number }>('/auth/refresh', { refreshToken }, { skipAuth: true })
      .pipe(
        map(response => {
          this.storeToken(response.token);
          this.storeRefreshToken(response.refreshToken);
          return true;
        }),
        catchError(() => {
          this.clearAuthState();
          return throwError(() => 'Token refresh failed');
        })
      );
  }

  getProfile(): Observable<AuthProfile> {
    return this.apiService.get<AuthProfile>('/auth/profile');
  }

  updateProfile(profileData: Partial<AuthProfile>): Observable<AuthProfile> {
    return this.apiService.put<AuthProfile>('/auth/profile', profileData)
      .pipe(
        map(response => {
          // Update current user if basic info changed
          const currentUser = this.currentUser();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              firstName: response.firstName,
              lastName: response.lastName
            };
            this.setAuthState(updatedUser);
          }
          return response;
        })
      );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<boolean> {
    return this.apiService.post('/auth/change-password', { currentPassword, newPassword })
      .pipe(
        map(() => true)
      );
  }

  forgotPassword(email: string): Observable<boolean> {
    return this.apiService.post('/auth/forgot-password', { email }, { skipAuth: true })
      .pipe(
        map(() => true)
      );
  }

  resetPassword(token: string, newPassword: string): Observable<boolean> {
    return this.apiService.post('/auth/reset-password', { token, newPassword }, { skipAuth: true })
      .pipe(
        map(() => true)
      );
  }

  getAvailableAreas(availableRoles: string[]): UserArea[] {
    return availableRoles.map(role =>
      this.AREA_DEFINITIONS[role as keyof typeof this.AREA_DEFINITIONS]
    ).filter(Boolean);
  }

  // Token management
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

  // Utility methods
  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  getCurrentRole(): string | null {
    return this.currentUser()?.role || null;
  }

  isTokenExpired(): boolean {
    // This would typically check JWT expiration
    // For mock implementation, we'll assume token is valid if it exists
    return !this.getStoredToken();
  }
}