import { Component, inject, signal, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent, FiltroItem } from '../../../../../core/toolkit/search/search.component';
import { DataTableComponent, TableColumn, TableAction, PaginationData, PageEvent, SortEvent, ActionEvent } from '../../../../../core/toolkit/data-table/data-table.component';
import { DepartmentService } from './services/department.service';
import { Department, DepartmentFilters } from '../../../../../shared/models/department.model';
import { DepartmentFormModalComponent } from '../department-form-modal/department-form-modal.component';
import { BaseModalComponent } from '../../../../../core/toolkit/base-modal/base-modal.component';

@Component({
  selector: 'app-departments-list',
  standalone: true,
  imports: [CommonModule, SearchComponent, DataTableComponent, DepartmentFormModalComponent, BaseModalComponent],
  templateUrl: './departments-list.component.html',
  styleUrl: './departments-list.component.scss'
})
export class DepartmentsListComponent implements AfterViewInit {
  @ViewChild('departmentColumnTemplate') departmentColumnTemplate!: TemplateRef<any>;
  @ViewChild('userCountTemplate') userCountTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  private departmentService = inject(DepartmentService);

  // Signals
  departments = signal<Department[]>([]);
  loading = signal(false);
  currentFilters = signal<DepartmentFilters>({});

  // Modal signals
  showDepartmentModal = signal(false);
  selectedDepartment = signal<Department | undefined>(undefined);

  // Confirm modal signals
  showConfirmModal = signal(false);
  confirmModalConfig = signal<{
    title: string;
    message: string;
    confirmText: string;
    confirmVariant: 'primary' | 'danger' | 'warning';
    action: () => void;
  } | null>(null);

  // Info modal signals
  showInfoModal = signal(false);
  infoModalMessage = signal('');

  // Pagination
  pagination = signal<PaginationData>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });

  // Filtri di ricerca
  filtri: FiltroItem[] = [
    {
      id: 'searchText',
      label: 'Cerca',
      type: 'text',
      placeholder: 'Nome, Descrizione...',
      colSize: 'col-md-6'
    },
    {
      id: 'isActive',
      label: 'Stato',
      type: 'select',
      placeholder: 'Seleziona uno stato',
      options: [
        { value: '', label: 'Tutti gli stati' },
        { value: 'true', label: 'Attivo' },
        { value: 'false', label: 'Inattivo' }
      ],
      colSize: 'col-md-3'
    },
    {
      id: 'showDeleted',
      label: 'Mostra dipartimenti eliminati',
      type: 'checkbox',
      value: false,
      colSize: 'col-md-12'
    }
  ];

  // Colonne della tabella
  columns: TableColumn[] = [];

  // Azioni della tabella
  actions: TableAction[] = [
    {
      id: 'edit',
      label: 'Modifica',
      icon: 'fas fa-edit',
      variant: 'primary',
      visible: (item: Department) => !item.deletedAt
    },
    {
      id: 'toggleStatus',
      label: 'Attiva/Disattiva',
      icon: 'fas fa-power-off',
      variant: 'warning',
      visible: (item: Department) => !item.deletedAt
    },
    {
      id: 'delete',
      label: 'Elimina',
      icon: 'fas fa-trash',
      variant: 'danger',
      visible: (item: Department) => !item.deletedAt
    },
    {
      id: 'restore',
      label: 'Ripristina',
      icon: 'fas fa-undo',
      variant: 'success',
      visible: (item: Department) => !!item.deletedAt
    }
  ];

  ngAfterViewInit() {
    this.columns = [
      { id: 'department', label: 'Dipartimento', sortable: false, width: '200px', type: 'custom', customTemplate: this.departmentColumnTemplate },
      { id: 'userCount', label: 'Utenti', sortable: true, width: '100px', align: 'center', type: 'custom', customTemplate: this.userCountTemplate },
      { id: 'status', label: 'Stato', sortable: true, width: '100px', align: 'center', type: 'custom', customTemplate: this.statusTemplate }
    ];
  }

  getDepartmentInitials(department: Department): string {
    return department.name?.substring(0, 2)?.toUpperCase() || 'DP';
  }

  constructor() {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading.set(true);

    this.departmentService.getPaginatedDepartments(
      this.pagination().currentPage,
      this.pagination().pageSize,
      this.currentFilters()
    ).subscribe({
      next: (result) => {
        this.departments.set(result.departments);
        this.pagination.set({
          currentPage: result.currentPage,
          pageSize: this.pagination().pageSize,
          totalItems: result.total,
          totalPages: result.totalPages
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Errore nel caricamento dei dipartimenti:', error);
        this.loading.set(false);
      }
    });
  }

  onFiltroChange(event: { filtroId: string; value: any }): void {
    const filters = { ...this.currentFilters() };

    if (event.filtroId === 'showDeleted') {
      filters.showDeleted = event.value;
    } else if (event.filtroId === 'isActive') {
      if (event.value === '' || event.value === null || event.value === undefined) {
        delete filters[event.filtroId as keyof DepartmentFilters];
      } else {
        (filters as any)[event.filtroId] = event.value === 'true';
      }
    } else if (event.value === '' || event.value === null || event.value === undefined) {
      delete filters[event.filtroId as keyof DepartmentFilters];
    } else {
      (filters as any)[event.filtroId] = event.value;
    }

    this.currentFilters.set(filters);
    this.pagination.update(p => ({ ...p, currentPage: 1 }));
    this.loadDepartments();
  }

  onClearFiltri(): void {
    this.currentFilters.set({});
    this.pagination.update(p => ({ ...p, currentPage: 1 }));
    this.loadDepartments();
  }

  onPageChange(event: PageEvent): void {
    this.pagination.update(p => ({
      ...p,
      currentPage: event.page,
      pageSize: event.pageSize
    }));
    this.loadDepartments();
  }

  onSortChange(event: SortEvent): void {
    // TODO: Implementare ordinamento
    console.log('Sort:', event);
  }

  onActionClick(event: ActionEvent): void {
    const department = event.item as Department;

    switch (event.action) {
      case 'edit':
        this.editDepartment(department);
        break;
      case 'toggleStatus':
        this.toggleDepartmentStatus(department);
        break;
      case 'delete':
        this.deleteDepartment(department);
        break;
      case 'restore':
        this.restoreDepartment(department);
        break;
    }
  }

  private restoreDepartment(department: Department): void {
    this.confirmModalConfig.set({
      title: 'Ripristina Dipartimento',
      message: `Vuoi ripristinare il dipartimento ${department.name}?`,
      confirmText: 'Ripristina',
      confirmVariant: 'primary',
      action: () => {
        this.departmentService.restoreDepartment(department.id).subscribe({
          next: () => {
            this.loadDepartments();
            this.closeConfirmModal();
          },
          error: (error) => {
            console.error('Errore nel ripristino:', error);
            this.infoModalMessage.set('Errore nel ripristino del dipartimento');
            this.showInfoModal.set(true);
            this.closeConfirmModal();
          }
        });
      }
    });
    this.showConfirmModal.set(true);
  }

  openDepartmentModal(department?: Department) {
    if (department) {
      this.departmentService.getDepartmentById(department.id).subscribe({
        next: (data) => {
          this.selectedDepartment.set(data);
          this.showDepartmentModal.set(true);
        },
        error: (error) => {
          console.error('Errore nel caricamento dei dettagli dipartimento:', error);
        }
      });
    } else {
      this.selectedDepartment.set(undefined);
      this.showDepartmentModal.set(true);
    }
  }

  closeDepartmentModal() {
    this.showDepartmentModal.set(false);
    this.selectedDepartment.set(undefined);
  }

  onSaveDepartment(departmentData: Partial<Department>) {
    if (this.selectedDepartment()) {
      // Update existing department
      this.departmentService.updateDepartment(this.selectedDepartment()!.id, departmentData).subscribe({
        next: () => {
          this.closeDepartmentModal();
          this.loadDepartments();
        },
        error: (error) => {
          console.error('Errore nell\'aggiornamento del dipartimento:', error);
          this.infoModalMessage.set('Errore nell\'aggiornamento del dipartimento');
          this.showInfoModal.set(true);
        }
      });
    } else {
      // Create new department
      this.departmentService.createDepartment(departmentData as Omit<Department, 'id' | 'createdAt' | 'updatedAt'>).subscribe({
        next: () => {
          this.closeDepartmentModal();
          this.loadDepartments();
        },
        error: (error) => {
          console.error('Errore nella creazione del dipartimento:', error);
          this.infoModalMessage.set('Errore nella creazione del dipartimento');
          this.showInfoModal.set(true);
        }
      });
    }
  }

  editDepartment(department: Department | null): void {
    if (department) {
      this.openDepartmentModal(department);
    } else {
      this.openDepartmentModal();
    }
  }

  private toggleDepartmentStatus(department: Department): void {
    const action = department.isActive ? 'disattivare' : 'attivare';
    this.confirmModalConfig.set({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Dipartimento`,
      message: `Vuoi ${action} il dipartimento ${department.name}?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      confirmVariant: department.isActive ? 'warning' : 'primary',
      action: () => {
        this.departmentService.toggleDepartmentStatus(department.id).subscribe({
          next: () => {
            this.loadDepartments();
            this.closeConfirmModal();
          },
          error: (error) => {
            console.error('Errore nel cambio stato:', error);
            this.infoModalMessage.set('Errore nel cambio stato del dipartimento');
            this.showInfoModal.set(true);
            this.closeConfirmModal();
          }
        });
      }
    });
    this.showConfirmModal.set(true);
  }

  private deleteDepartment(department: Department): void {
    this.confirmModalConfig.set({
      title: 'Elimina Dipartimento',
      message: `Sei sicuro di voler eliminare il dipartimento ${department.name}?`,
      confirmText: 'Elimina',
      confirmVariant: 'danger',
      action: () => {
        this.departmentService.deleteDepartment(department.id).subscribe({
          next: () => {
            this.loadDepartments();
            this.closeConfirmModal();
          },
          error: (error) => {
            console.error('Errore nell\'eliminazione:', error);
            this.infoModalMessage.set('Impossibile eliminare il dipartimento');
            this.showInfoModal.set(true);
            this.closeConfirmModal();
          }
        });
      }
    });
    this.showConfirmModal.set(true);
  }

  closeConfirmModal() {
    this.showConfirmModal.set(false);
    this.confirmModalConfig.set(null);
  }

  closeInfoModal() {
    this.showInfoModal.set(false);
  }

  onConfirmAction() {
    const config = this.confirmModalConfig();
    if (config) {
      config.action();
    }
  }
}