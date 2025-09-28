import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="global-loader-overlay"
      [class.visible]="loadingService.isLoading()"
      [style.display]="loadingService.isLoading() ? 'flex' : 'none'">

      <div class="loader-container">
        <div class="loader-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>

        <div class="loader-text">
          <p class="loading-message">Caricamento in corso...</p>
          <p class="loading-subtitle">Attendere prego</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .global-loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .global-loader-overlay.visible {
      opacity: 1;
      pointer-events: all;
    }

    .loader-container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      max-width: 300px;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-20px) scale(0.95);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }

    .loader-spinner {
      position: relative;
      width: 60px;
      height: 60px;
      margin: 0 auto 24px;
    }

    .spinner-ring {
      position: absolute;
      width: 60px;
      height: 60px;
      border: 3px solid transparent;
      border-top-color: var(--portal-primary);
      border-radius: 50%;
      animation: spin 1.2s linear infinite;
    }

    .spinner-ring:nth-child(1) {
      animation-delay: 0s;
    }

    .spinner-ring:nth-child(2) {
      width: 50px;
      height: 50px;
      top: 5px;
      left: 5px;
      border-top-color: var(--portal-primary-light);
      animation-delay: -0.3s;
    }

    .spinner-ring:nth-child(3) {
      width: 40px;
      height: 40px;
      top: 10px;
      left: 10px;
      border-top-color: var(--portal-secondary);
      animation-delay: -0.6s;
    }

    .spinner-ring:nth-child(4) {
      width: 30px;
      height: 30px;
      top: 15px;
      left: 15px;
      border-top-color: var(--portal-success);
      animation-delay: -0.9s;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .loader-text {
      color: var(--portal-text-primary);
    }

    .loading-message {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .loading-subtitle {
      font-size: 14px;
      color: var(--portal-text-secondary);
      margin: 0;
      opacity: 0.8;
    }

    @media (max-width: 480px) {
      .loader-container {
        padding: 32px 24px;
        margin: 20px;
        max-width: none;
      }

      .loader-spinner {
        width: 50px;
        height: 50px;
      }

      .spinner-ring {
        width: 50px;
        height: 50px;
      }

      .spinner-ring:nth-child(2) {
        width: 42px;
        height: 42px;
        top: 4px;
        left: 4px;
      }

      .spinner-ring:nth-child(3) {
        width: 34px;
        height: 34px;
        top: 8px;
        left: 8px;
      }

      .spinner-ring:nth-child(4) {
        width: 26px;
        height: 26px;
        top: 12px;
        left: 12px;
      }

      .loading-message {
        font-size: 16px;
      }

      .loading-subtitle {
        font-size: 13px;
      }
    }
  `]
})
export class GlobalLoaderComponent {
  protected loadingService = inject(LoadingService);
}