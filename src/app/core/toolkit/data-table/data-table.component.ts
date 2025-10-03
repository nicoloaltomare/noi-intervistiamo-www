import { Component, Input, Output, EventEmitter, signal, computed, AfterContentInit, ContentChildren, QueryList, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  id: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'badge' | 'date' | 'datetime' | 'custom';
  customTemplate?: any; // TemplateRef per contenuto personalizzato
}

export interface TableAction {
  id: string;
  label: string;
  icon: string;
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  disabled?: (item: any) => boolean;
  visible?: (item: any) => boolean;
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc' | null;
}

export interface PageEvent {
  page: number;
  pageSize: number;
}

export interface ActionEvent {
  action: string;
  item: any;
}

export interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() pagination: PaginationData = {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  };
  @Input() loading = false;
  @Input() emptyStateMessage = 'Nessun elemento trovato';
  @Input() emptyStateIcon = 'fas fa-inbox';
  @Input() showPagination = true;
  @Input() pageSizeOptions = [5, 10, 25, 50];

  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() actionClick = new EventEmitter<ActionEvent>();

  currentSort = signal<{ column: string; direction: 'asc' | 'desc' | null }>({
    column: '',
    direction: null
  });

  Math = Math; // Expose Math object to template

  get visibleActions() {
    return this.actions.filter(action => !action.visible || this.data.some(item => action.visible!(item)));
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    const current = this.currentSort();
    let newDirection: 'asc' | 'desc' | null = 'asc';

    if (current.column === column.id) {
      if (current.direction === 'asc') {
        newDirection = 'desc';
      } else if (current.direction === 'desc') {
        newDirection = null;
      } else {
        newDirection = 'asc';
      }
    }

    this.currentSort.set({
      column: newDirection ? column.id : '',
      direction: newDirection
    });

    this.sortChange.emit({
      column: column.id,
      direction: newDirection
    });
  }

  getSortIcon(column: TableColumn): string {
    if (!column.sortable) return '';

    const current = this.currentSort();
    if (current.column !== column.id) {
      return 'fas fa-sort';
    }

    return current.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  getSortClass(column: TableColumn): string {
    if (!column.sortable) return '';

    const current = this.currentSort();
    if (current.column !== column.id) {
      return 'sortable';
    }

    return `sortable sorted-${current.direction}`;
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageChange.emit({
      page: 1, // Reset to first page when changing page size
      pageSize: newPageSize
    });
  }

  onPageNavigation(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pageChange.emit({
        page: page,
        pageSize: this.pagination.pageSize
      });
    }
  }

  getPaginationRange(): number[] {
    const range: number[] = [];

    if (this.pagination.totalPages === 0) {
      return [1]; // Show page 1 even when no results
    }

    const start = Math.max(1, this.pagination.currentPage - 2);
    const end = Math.min(this.pagination.totalPages, this.pagination.currentPage + 2);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }

  onActionClick(action: TableAction, item: any): void {
    if (action.disabled && action.disabled(item)) return;

    this.actionClick.emit({
      action: action.id,
      item: item
    });
  }

  isActionDisabled(action: TableAction, item: any): boolean {
    return action.disabled ? action.disabled(item) : false;
  }

  isActionVisible(action: TableAction, item: any): boolean {
    return action.visible ? action.visible(item) : true;
  }

  getActionButtonClass(action: TableAction): string {
    const baseClass = 'btn btn-sm';
    switch (action.variant) {
      case 'primary':
        return `${baseClass} btn-outline-primary`;
      case 'secondary':
        return `${baseClass} btn-outline-secondary`;
      case 'success':
        return `${baseClass} btn-outline-success`;
      case 'danger':
        return `${baseClass} btn-outline-danger`;
      case 'warning':
        return `${baseClass} btn-outline-warning`;
      case 'info':
        return `${baseClass} btn-outline-info`;
      default:
        return `${baseClass} btn-outline-secondary`;
    }
  }

  getColumnValue(item: any, column: TableColumn): any {
    return this.getNestedProperty(item, column.id);
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  formatValue(value: any, column: TableColumn): string {
    if (value === null || value === undefined) {
      return '-';
    }

    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      case 'datetime':
        if (!value) return 'Mai';
        return new Date(value).toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(',', ' -');
      default:
        return String(value);
    }
  }

  getBadgeClass(value: any): string {
    return 'badge';
  }

  getBadgeStyle(value: any): { [key: string]: string } {
    // Se il valore è un oggetto con style, usa quello
    if (typeof value === 'object' && value?.style) {
      return value.style;
    }

    // Se il valore è una stringa, applica colori personalizzati in base al valore
    const stringValue = String(value).toUpperCase();

    switch (stringValue) {
      case 'ACTIVE':
      case 'ATTIVO':
        return { 'background-color': '#10b981', 'color': 'white' };
      case 'INACTIVE':
      case 'INATTIVO':
        return { 'background-color': '#ef4444', 'color': 'white' };
      case 'PENDING':
      case 'IN ATTESA':
        return { 'background-color': '#f59e0b', 'color': 'white' };
      case 'SUSPENDED':
      case 'SOSPESO':
        return { 'background-color': '#6b7280', 'color': 'white' };
      default:
        return { 'background-color': '#64748b', 'color': 'white' };
    }
  }

  getBadgeText(value: any): string {
    // Se il valore è un oggetto con text, usa quello
    if (typeof value === 'object' && value?.text) {
      return value.text;
    }

    // Altrimenti usa il valore come stringa
    return String(value);
  }
}