import { Injectable, signal, ComponentRef, ApplicationRef, createComponent, EnvironmentInjector, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ModalConfig } from '../toolkit/base-modal/base-modal.component';

export interface ModalAction {
  label: string;
  action: () => void | Promise<void>;
  class?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}

export interface ProgrammaticModalConfig extends ModalConfig {
  content?: string;
  html?: string;
  actions?: ModalAction[];
  icon?: string;
  iconClass?: string;
}

export interface ConfirmModalOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
}

export interface InfoModalOptions {
  title?: string;
  message: string;
  okText?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private activeModals = signal<ComponentRef<any>[]>([]);

  showModal(config: ProgrammaticModalConfig): Observable<any> {
    const subject = new Subject<any>();

    const modalRef = this.createModalComponent(config);

    modalRef.instance.closeModal.subscribe(() => {
      this.destroyModal(modalRef);
      subject.next(false);
      subject.complete();
    });

    this.activeModals.update(modals => [...modals, modalRef]);

    return subject.asObservable();
  }

  showConfirm(options: ConfirmModalOptions): Observable<boolean> {
    const subject = new Subject<boolean>();

    const config: ProgrammaticModalConfig = {
      title: options.title || 'Conferma',
      size: options.size || 'sm',
      content: options.message,
      icon: options.icon || 'fas fa-question-circle',
      iconClass: this.getIconClass(options.confirmVariant || 'primary'),
      actions: [
        {
          label: options.cancelText || 'Annulla',
          action: () => {
            subject.next(false);
            subject.complete();
          },
          variant: 'secondary'
        },
        {
          label: options.confirmText || 'Conferma',
          action: () => {
            subject.next(true);
            subject.complete();
          },
          variant: options.confirmVariant || 'primary'
        }
      ]
    };

    const modalRef = this.createConfirmationModal(config);

    modalRef.instance.closeModal.subscribe(() => {
      this.destroyModal(modalRef);
      subject.next(false);
      subject.complete();
    });

    this.activeModals.update(modals => [...modals, modalRef]);

    return subject.asObservable();
  }

  showInfo(options: InfoModalOptions): Observable<void> {
    const subject = new Subject<void>();

    const config: ProgrammaticModalConfig = {
      title: options.title || 'Informazione',
      size: options.size || 'sm',
      content: options.message,
      icon: this.getInfoIcon(options.variant || 'info'),
      iconClass: this.getIconClass(options.variant || 'info'),
      actions: [
        {
          label: options.okText || 'OK',
          action: () => {
            subject.next();
            subject.complete();
          },
          variant: 'primary'
        }
      ]
    };

    const modalRef = this.createInfoModal(config);

    modalRef.instance.closeModal.subscribe(() => {
      this.destroyModal(modalRef);
      subject.next();
      subject.complete();
    });

    this.activeModals.update(modals => [...modals, modalRef]);

    return subject.asObservable();
  }

  closeAll(): void {
    this.activeModals().forEach(modal => {
      this.destroyModal(modal);
    });
    this.activeModals.set([]);
  }

  closeLast(): void {
    const modals = this.activeModals();
    if (modals.length > 0) {
      const lastModal = modals[modals.length - 1];
      this.destroyModal(lastModal);
      this.activeModals.update(modals => modals.slice(0, -1));
    }
  }

  private createModalComponent(config: ProgrammaticModalConfig): ComponentRef<any> {
    return this.createProgrammaticModal(config);
  }

  private createProgrammaticModal(config: ProgrammaticModalConfig): ComponentRef<any> {
    const componentRef = createComponent(ProgrammaticModalComponent, {
      environmentInjector: this.injector
    });

    componentRef.instance.config = config;
    componentRef.instance.isVisible.set(true);

    this.appRef.attachView(componentRef.hostView);
    document.body.appendChild(componentRef.location.nativeElement);

    return componentRef;
  }

  private createConfirmationModal(config: ProgrammaticModalConfig): ComponentRef<any> {
    return this.createProgrammaticModal(config);
  }

  private createInfoModal(config: ProgrammaticModalConfig): ComponentRef<any> {
    return this.createProgrammaticModal(config);
  }

  private destroyModal(modalRef: ComponentRef<any>): void {
    modalRef.instance.isVisible.set(false);

    setTimeout(() => {
      this.appRef.detachView(modalRef.hostView);
      modalRef.destroy();
    }, 300);
  }

  private getIconClass(variant: string): string {
    switch (variant) {
      case 'primary': return 'text-primary';
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-danger';
      case 'error': return 'text-danger';
      case 'info': return 'text-info';
      default: return 'text-primary';
    }
  }

  private getInfoIcon(variant: string): string {
    switch (variant) {
      case 'success': return 'fas fa-check-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'error': return 'fas fa-times-circle';
      case 'info':
      default: return 'fas fa-info-circle';
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseModalComponent } from '../toolkit/base-modal/base-modal.component';

@Component({
  selector: 'app-programmatic-modal',
  standalone: true,
  imports: [CommonModule, BaseModalComponent],
  template: `
    <app-base-modal
      [isVisible]="isVisible"
      [config]="modalConfig"
      (closeModal)="onClose()">

      <!-- Header with icon -->
      <div slot="header" *ngIf="config.icon" class="icon-header">
        <i [class]="config.icon + ' ' + (config.iconClass || '')"></i>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <div *ngIf="config.content" class="content-text" [innerHTML]="config.content"></div>
        <div *ngIf="config.html" [innerHTML]="config.html"></div>
      </div>

      <!-- Actions -->
      <div slot="footer" *ngIf="config.actions && config.actions.length > 0" class="modal-actions">
        <button
          *ngFor="let action of config.actions"
          type="button"
          [class]="getActionClass(action)"
          [disabled]="action.loading"
          (click)="executeAction(action)">

          <i *ngIf="action.loading" class="fas fa-spinner fa-spin"></i>
          {{ action.label }}
        </button>
      </div>
    </app-base-modal>
  `,
  styles: [`
    .icon-header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .icon-header i {
      font-size: 48px;
      opacity: 0.8;
    }

    .content-text {
      font-size: 16px;
      line-height: 1.6;
      color: var(--portal-text-primary);
      text-align: center;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .modal-actions button {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 100px;
      justify-content: center;
    }

    .btn-primary {
      background: var(--portal-primary);
      color: white;
      border-color: var(--portal-primary);
    }

    .btn-primary:hover {
      background: var(--portal-primary-hover);
      border-color: var(--portal-primary-hover);
    }

    .btn-secondary {
      background: transparent;
      color: var(--portal-text-secondary);
      border-color: var(--portal-border-primary);
    }

    .btn-secondary:hover {
      background: var(--portal-bg-secondary);
      color: var(--portal-text-primary);
    }

    .btn-success {
      background: var(--portal-success);
      color: white;
      border-color: var(--portal-success);
    }

    .btn-success:hover {
      background: var(--portal-success-hover);
      border-color: var(--portal-success-hover);
    }

    .btn-warning {
      background: var(--portal-warning);
      color: white;
      border-color: var(--portal-warning);
    }

    .btn-warning:hover {
      background: var(--portal-warning-hover);
      border-color: var(--portal-warning-hover);
    }

    .btn-danger {
      background: var(--portal-danger);
      color: white;
      border-color: var(--portal-danger);
    }

    .btn-danger:hover {
      background: var(--portal-danger-hover);
      border-color: var(--portal-danger-hover);
    }

    .text-primary { color: var(--portal-primary); }
    .text-success { color: var(--portal-success); }
    .text-warning { color: var(--portal-warning); }
    .text-danger { color: var(--portal-danger); }
    .text-info { color: var(--portal-primary-light); }

    @media (max-width: 480px) {
      .modal-actions {
        flex-direction: column;
      }

      .modal-actions button {
        width: 100%;
      }
    }
  `]
})
export class ProgrammaticModalComponent {
  isVisible = signal(false);
  config: ProgrammaticModalConfig = {};

  closeModal = new Subject<void>();

  get modalConfig() {
    return {
      ...this.config,
      showFooter: this.config.actions && this.config.actions.length > 0
    };
  }

  onClose(): void {
    this.closeModal.next();
  }

  executeAction(action: ModalAction): void {
    if (action.loading) return;

    const result = action.action();
    if (result instanceof Promise) {
      action.loading = true;
      result.finally(() => {
        action.loading = false;
        this.closeModal.next();
      });
    } else {
      this.closeModal.next();
    }
  }

  getActionClass(action: ModalAction): string {
    const baseClass = action.class || '';
    const variantClass = `btn-${action.variant || 'primary'}`;
    return `${baseClass} ${variantClass}`.trim();
  }
}