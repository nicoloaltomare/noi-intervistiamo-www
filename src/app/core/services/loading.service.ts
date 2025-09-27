import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCounters = signal(new Map<string, number>());

  // Global loading state - true if any operation is loading
  isLoading = computed(() => {
    const counters = this.loadingCounters();
    return Array.from(counters.values()).some(count => count > 0);
  });

  // Check if a specific operation is loading
  isLoadingOperation(operationId: string): boolean {
    return (this.loadingCounters().get(operationId) ?? 0) > 0;
  }

  // Start loading for the default global operation
  show(): void {
    this.showOperation('global');
  }

  // Stop loading for the default global operation
  hide(): void {
    this.hideOperation('global');
  }

  // Start loading for a specific operation
  showOperation(operationId: string): void {
    const counters = new Map(this.loadingCounters());
    const currentCount = counters.get(operationId) ?? 0;
    counters.set(operationId, currentCount + 1);
    this.loadingCounters.set(counters);
  }

  // Stop loading for a specific operation
  hideOperation(operationId: string): void {
    const counters = new Map(this.loadingCounters());
    const currentCount = counters.get(operationId) ?? 0;

    if (currentCount > 0) {
      const newCount = currentCount - 1;
      if (newCount === 0) {
        counters.delete(operationId);
      } else {
        counters.set(operationId, newCount);
      }
      this.loadingCounters.set(counters);
    }
  }

  // Reset all loading states
  reset(): void {
    this.loadingCounters.set(new Map());
  }

  // Get all active operations
  getActiveOperations(): string[] {
    return Array.from(this.loadingCounters().keys());
  }

  // Get count for a specific operation
  getOperationCount(operationId: string): number {
    return this.loadingCounters().get(operationId) ?? 0;
  }
}