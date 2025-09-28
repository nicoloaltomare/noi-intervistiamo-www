import { Component, Input, Output, EventEmitter, signal, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalConfig {
  title?: string;
  subtitle?: string;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  headerClass?: string;
  bodyClass?: string;
  footerClass?: string;
}

@Component({
  selector: 'app-base-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="modal-overlay"
      [class.visible]="isVisible()"
      [style.display]="isVisible() ? 'flex' : 'none'"
      (click)="onBackdropClick($event)"
      (keydown.escape)="onEscapeKey()">

      <div
        class="modal-container"
        [class]="getModalSizeClass()"
        [class.show]="isVisible()"
        (click)="$event.stopPropagation()">

        <div
          *ngIf="config.showHeader !== false"
          class="modal-header"
          [class]="config.headerClass || ''">

          <div class="brand-section">
            <div class="brand-info">
              <h1 class="brand-title">BVTech</h1>
              <p class="brand-subtitle">Interview Management System</p>
            </div>
          </div>

          <button
            *ngIf="config.showCloseButton !== false"
            type="button"
            class="close-button"
            (click)="close()"
            aria-label="Chiudi modal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div
          class="modal-body"
          [class]="config.bodyClass || ''">
          <ng-content></ng-content>
        </div>

        <div
          *ngIf="config.showFooter"
          class="modal-footer"
          [class]="config.footerClass || ''">
          <ng-content select="[slot=footer]"></ng-content>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(30px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 24px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.25s ease-out;
    }

    .modal-overlay.visible {
      opacity: 1;
      visibility: visible;
    }

    .modal-container {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      transform: scale(0.95) translateY(20px);
      transition: transform 0.25s ease-out;
      border: 0.5px solid var(--portal-border-primary);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .modal-container.show {
      transform: scale(1) translateY(0);
    }

    .modal-container.modal-sm {
      width: 100%;
      max-width: 420px;
    }

    .modal-container.modal-md {
      width: 100%;
      max-width: 600px;
    }

    .modal-container.modal-lg {
      width: 100%;
      max-width: 800px;
    }

    .modal-container.modal-xl {
      width: 100%;
      max-width: 1200px;
    }

    .modal-container.modal-full {
      width: 95vw;
      height: 90vh;
    }

    .modal-header {
      background: var(--portal-primary);
      color: white;
      padding: 28px 32px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: left;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-info {
      text-align: left;
    }

    .brand-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 4px 0;
      letter-spacing: -0.5px;
      color: white;
    }

    .brand-subtitle {
      font-size: 14px;
      margin: 0;
      opacity: 0.85;
      font-weight: 400;
      color: white;
    }

    .close-button {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.15s ease-out;
      font-size: 14px;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .modal-body {
      padding: 32px;
      flex: 1;
      overflow-y: auto;
      background: white;
    }

    .modal-footer {
      background: var(--portal-bg-primary);
      padding: 20px 32px;
      border-top: 1px solid var(--portal-border-primary);
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    @media (max-width: 768px) {
      .modal-overlay {
        padding: 10px;
      }

      .modal-container.modal-sm,
      .modal-container.modal-md,
      .modal-container.modal-lg,
      .modal-container.modal-xl {
        width: 100%;
        max-width: 100%;
      }

      .modal-container.modal-full {
        width: 100%;
        height: 100%;
        border-radius: 0;
      }

      .modal-header {
        padding: 20px 24px;
        min-height: 70px;
      }

      .modal-title {
        font-size: 20px;
      }

      .modal-subtitle {
        font-size: 14px;
      }

      .modal-body {
        padding: 24px;
      }

      .modal-footer {
        padding: 20px 24px;
        flex-direction: column-reverse;
        gap: 8px;
      }

      .modal-footer > * {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .modal-header {
        padding: 16px 20px;
        min-height: 60px;
      }

      .modal-title {
        font-size: 18px;
      }

      .modal-body {
        padding: 20px;
      }

      .modal-footer {
        padding: 16px 20px;
      }
    }
  `]
})
export class BaseModalComponent {
  @Input() isVisible = signal(false);
  @Input() config: ModalConfig = {};
  @Output() closeModal = new EventEmitter<void>();

  private defaultConfig: ModalConfig = {
    size: 'md',
    showCloseButton: true,
    closeOnBackdrop: true,
    closeOnEscape: true,
    showHeader: true,
    showFooter: false
  };

  ngOnInit() {
    this.config = { ...this.defaultConfig, ...this.config };
  }

  getModalSizeClass(): string {
    return `modal-${this.config.size || 'md'}`;
  }

  onBackdropClick(event: Event): void {
    if (this.config.closeOnBackdrop !== false) {
      this.close();
    }
  }

  onEscapeKey(): void {
    if (this.config.closeOnEscape !== false) {
      this.close();
    }
  }

  close(): void {
    this.closeModal.emit();
  }

  show(): void {
    this.isVisible.set(true);
  }

  hide(): void {
    this.isVisible.set(false);
  }
}
