import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCounters = signal(new Map<string, number>());

  isLoading = computed(() => {
    const counters = this.loadingCounters();
    return Array.from(counters.values()).some(count => count > 0);
  });

  isLoadingOperation(operationId: string): boolean {
    return (this.loadingCounters().get(operationId) ?? 0) > 0;
  }

  show(): void {
    this.showOperation('global');
  }

  hide(): void {
    this.hideOperation('global');
  }

  showOperation(operationId: string): void {
    const counters = new Map(this.loadingCounters());
    const currentCount = counters.get(operationId) ?? 0;
    counters.set(operationId, currentCount + 1);
    this.loadingCounters.set(counters);
  }

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

  reset(): void {
    this.loadingCounters.set(new Map());
  }

  getActiveOperations(): string[] {
    return Array.from(this.loadingCounters().keys());
  }

  getOperationCount(operationId: string): number {
    return this.loadingCounters().get(operationId) ?? 0;
  }
}