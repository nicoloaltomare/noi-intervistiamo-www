import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginCredentials, User, UserArea } from '../../../../../core/services/auth.service';
import { BaseModalComponent, ModalConfig } from '../../../../../core/toolkit/base-modal/base-modal.component';

type ViewType = 'login' | 'areas' | 'recovery';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent],
  template: `
    <app-base-modal
      [isVisible]="isVisible"
      [config]="modalConfig()"
      (closeModal)="onClose()">

      <div class="welcome-section">
        <h2 class="welcome-title">{{ getTitle() }}</h2>
        <p class="welcome-subtitle">{{ getSubtitle() }}</p>
      </div>
      <form
        *ngIf="currentView() === 'login'"
        #loginForm="ngForm"
        (ngSubmit)="onLogin()"
        class="auth-form">

        <div class="input-group">
          <label for="username" class="input-label">Username</label>
          <div class="input-wrapper">
            <i class="fas fa-user input-icon"></i>
            <input
              type="text"
              id="username"
              name="username"
              class="form-input"
              [(ngModel)]="credentials.username"
              placeholder="Inserisci username"
              autocomplete="username"
              required>
          </div>
        </div>

        <div class="input-group">
          <label for="password" class="input-label">Password</label>
          <div class="input-wrapper">
            <i class="fas fa-lock input-icon"></i>
            <input
              type="password"
              id="password"
              name="password"
              class="form-input"
              [(ngModel)]="credentials.password"
              placeholder="Inserisci password"
              autocomplete="current-password"
              required>
          </div>
        </div>

        <button
          type="submit"
          class="submit-button primary"
          [disabled]="!loginForm.form.valid || isLoading()">

          <span *ngIf="!isLoading()" class="button-content">
            <i class="fas fa-sign-in-alt"></i>
            Accedi
          </span>

          <span *ngIf="isLoading()" class="button-loading">
            <i class="fas fa-spinner loading-spinner"></i>
            Autenticazione...
          </span>
        </button>

        <div class="form-actions">
          <button
            type="button"
            class="link-button"
            (click)="showPasswordRecovery()">
            Password dimenticata?
          </button>
        </div>
      </form>

      <div
        *ngIf="currentView() === 'areas'"
        class="areas-container">

        <div class="areas-grid">
          <button
            *ngFor="let area of availableAreas()"
            type="button"
            class="area-option"
            (click)="selectArea(area)">

            <div class="area-icon">
              <i [class]="area.icon"></i>
            </div>

            <div class="area-details">
              <h3 class="area-title">{{ area.displayName }}</h3>
              <p class="area-description">{{ area.description }}</p>
            </div>

            <div class="area-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </button>
        </div>

        <div class="area-actions">
          <button
            type="button"
            class="link-button"
            (click)="backToLogin()">
            <i class="fas fa-arrow-left"></i>
            Indietro
          </button>
        </div>
      </div>

      <form
        *ngIf="currentView() === 'recovery'"
        #recoveryForm="ngForm"
        (ngSubmit)="onPasswordRecovery()"
        class="auth-form">

        <div class="input-group">
          <label for="recoveryEmail" class="input-label">Email</label>
          <div class="input-wrapper">
            <i class="fas fa-envelope input-icon"></i>
            <input
              type="email"
              id="recoveryEmail"
              name="recoveryEmail"
              class="form-input"
              [(ngModel)]="recoveryEmail"
              placeholder="inserisci@email.com"
              autocomplete="email"
              required>
          </div>
        </div>

        <button
          type="submit"
          class="submit-button secondary"
          [disabled]="!recoveryForm.form.valid">

          <span class="button-content">
            <i class="fas fa-paper-plane"></i>
            Invia Link
          </span>
        </button>

        <div class="form-actions">
          <button
            type="button"
            class="link-button"
            (click)="backToLogin()">
            <i class="fas fa-arrow-left"></i>
            Torna al login
          </button>
        </div>
      </form>

      <div *ngIf="errorMessage()" class="alert error-alert">
        <i class="fas fa-exclamation-circle"></i>
        <span>{{ errorMessage() }}</span>
      </div>

      <div *ngIf="successMessage()" class="alert success-alert">
        <i class="fas fa-check-circle"></i>
        <span>{{ successMessage() }}</span>
      </div>

      <div slot="footer" class="footer-content">
        <p class="system-version">
          <i class="fas fa-info-circle"></i>
          BVTech v2.0 - Sistema di Gestione Interviste
        </p>
        <p class="support-contact">
          Supporto tecnico:
          <a href="mailto:support&#64;bvtech.com" class="support-link">support&#64;bvtech.com</a>
        </p>
      </div>
    </app-base-modal>
  `,
  styleUrl: './login-modal.component.scss'
})
export class LoginModalComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Signals
  protected isVisible = signal(false);
  protected currentView = signal<ViewType>('login');
  protected isLoading = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);
  protected availableAreas = signal<UserArea[]>([]);
  protected tempUser = signal<User | null>(null);

  // Form data
  protected credentials: LoginCredentials = {
    username: '',
    password: ''
  };
  protected recoveryEmail = '';

  // Modal configuration
  protected modalConfig = computed(() => {
    const config: ModalConfig = {
      title: this.getTitle(),
      subtitle: this.getSubtitle(),
      size: 'md',
      showCloseButton: true,
      closeOnBackdrop: true,
      closeOnEscape: true,
      showHeader: true,
      showFooter: true
    };
    return config;
  });



  show(): void {
    this.isVisible.set(true);
    this.resetToLoginView();
  }

  hide(): void {
    this.isVisible.set(false);
    this.resetAllState();
  }

  onClose(): void {
    this.hide();
  }

  onLogin(): void {
    if (!this.validateLoginForm()) {
      return;
    }

    this.clearMessages();

    const loginData: LoginCredentials = {
      username: this.credentials.username,
      password: this.credentials.password,
      rememberMe: false
    };

    this.isLoading.set(true);

    this.authService.login(loginData).subscribe({
      next: (result: any) => {
        this.isLoading.set(false);
        if (result.success && result.user && result.availableRoles) {
          this.processLoginSuccess(result.user, result.availableRoles);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error || 'Errore durante l\'autenticazione. Riprova.');
      }
    });
  }

  onPasswordRecovery(): void {
    if (!this.recoveryEmail.trim()) {
      this.errorMessage.set('Inserisci un indirizzo email valido');
      return;
    }

    this.clearMessages();

    this.authService.forgotPassword(this.recoveryEmail).subscribe({
      next: () => {
        this.successMessage.set('Se l\'indirizzo email esiste nel sistema, riceverai un link di recupero.');
        setTimeout(() => {
          this.backToLogin();
        }, 3000);
      },
      error: () => {
        this.errorMessage.set('Errore durante l\'invio del link di recupero.');
      }
    });
  }

  selectArea(area: UserArea): void {
    const user = this.tempUser();
    if (!user) {
      this.errorMessage.set('Errore di sistema. Riprova ad accedere.');
      return;
    }

    this.successMessage.set(`Accesso effettuato nell'area ${area.displayName}`);

    setTimeout(() => {
      this.authService.selectArea(user, area);
      this.hide();
    }, 1500);
  }

  showPasswordRecovery(): void {
    this.currentView.set('recovery');
    this.clearMessages();
  }

  backToLogin(): void {
    this.currentView.set('login');
    this.clearMessages();
    this.recoveryEmail = '';
  }

  private showAreaSelection(user: User, areas: UserArea[]): void {
    this.tempUser.set(user);
    this.availableAreas.set(areas);
    this.currentView.set('areas');
    this.clearMessages();
  }

  private validateLoginForm(): boolean {
    if (!this.credentials.username.trim()) {
      this.errorMessage.set('Username è obbligatorio');
      return false;
    }

    if (!this.credentials.password.trim()) {
      this.errorMessage.set('Password è obbligatoria');
      return false;
    }

    return true;
  }

  private processLoginSuccess(user: User, availableRoles: string[]): void {
    const areas = this.authService.getAvailableAreas(availableRoles);

    if (areas.length === 0) {
      this.errorMessage.set('Nessuna area di accesso disponibile per questo utente');
      return;
    }

    if (areas.length === 1) {
      this.successMessage.set(`Accesso effettuato nell'area ${areas[0].displayName}`);
      setTimeout(() => {
        this.authService.selectArea(user, areas[0]);
        this.hide();
      }, 1500);
    } else {
      this.showAreaSelection(user, areas);
    }
  }




  private resetToLoginView(): void {
    this.currentView.set('login');
    this.clearMessages();
    this.credentials = { username: '', password: '' };
    this.recoveryEmail = '';
  }

  private resetAllState(): void {
    this.resetToLoginView();
    this.availableAreas.set([]);
    this.tempUser.set(null);
  }

  protected getTitle(): string {
    switch (this.currentView()) {
      case 'recovery':
        return 'Recupera Password';
      case 'areas':
        return 'Seleziona Area di Accesso';
      default:
        return 'Accedi a BVTech';
    }
  }

  protected getSubtitle(): string {
    switch (this.currentView()) {
      case 'recovery':
        return 'Inserisci la tua email per ricevere il link di recupero';
      case 'areas':
        return 'Scegli l\'area in cui desideri accedere';
      default:
        return 'Inserisci le tue credenziali per accedere al sistema';
    }
  }

  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}
