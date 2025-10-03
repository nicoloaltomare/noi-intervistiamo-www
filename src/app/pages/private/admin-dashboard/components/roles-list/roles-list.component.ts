import { Component, inject, signal, ViewChild, TemplateRef, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SearchComponent, FiltroItem } from '../../../../../core/toolkit/search/search.component';
import { DataTableComponent, TableColumn, TableAction, PaginationData, PageEvent, SortEvent, ActionEvent } from '../../../../../core/toolkit/data-table/data-table.component';
import { RoleService } from './services/role.service';
import { Role, RoleFilters } from '../../../../../shared/models/role.model';
import { RoleFormModalComponent } from '../role-form-modal/role-form-modal.component';
import { ApiService } from '../../../../../core/services/api.service';
import { forkJoin } from 'rxjs';
import { BaseModalComponent } from '../../../../../core/toolkit/base-modal/base-modal.component';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, SearchComponent, DataTableComponent, RoleFormModalComponent, BaseModalComponent],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss'
})
export class RolesListComponent implements AfterViewInit, OnInit {
  @ViewChild('roleColumnTemplate') roleColumnTemplate!: TemplateRef<any>;
  @ViewChild('accessAreasTemplate') accessAreasTemplate!: TemplateRef<any>;
  @ViewChild('userCountTemplate') userCountTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  private roleService = inject(RoleService);
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  // Signals
  roles = signal<Role[]>([]);
  loading = signal(false);
  currentFilters = signal<RoleFilters>({});

  // Modal signals
  showRoleModal = signal(false);
  selectedRole = signal<Role | undefined>(undefined);
  loadingFormData = signal(false);
  roleFormData = signal<{ accessAreas: any[] } | null>(null);

  // Access areas configuration loaded from API
  accessAreasConfig = signal<Record<string, { label: string; icon: string; color: string }>>({});

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
      label: 'Mostra ruoli eliminati',
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
      disabled: (item: Role) => !!item.deletedAt || item.isSystem
    },
    {
      id: 'toggleStatus',
      label: 'Attiva/Disattiva',
      icon: 'fas fa-power-off',
      variant: 'warning',
      disabled: (item: Role) => !!item.deletedAt
    },
    {
      id: 'delete',
      label: 'Elimina',
      icon: 'fas fa-trash',
      variant: 'danger',
      disabled: (item: Role) => !!item.deletedAt || item.isSystem
    }
  ];

  ngAfterViewInit() {
    this.columns = [
      { id: 'role', label: 'Ruolo', sortable: false, width: '35%', type: 'custom', customTemplate: this.roleColumnTemplate },
      { id: 'accessAreas', label: 'Aree di Accesso', sortable: false, width: '30%', type: 'custom', customTemplate: this.accessAreasTemplate },
      { id: 'userCount', label: 'Utenti', sortable: true, width: '80px', type: 'custom', customTemplate: this.userCountTemplate, align: 'center' },
      { id: 'updatedAt', label: 'Ultima Modifica', sortable: true, width: '130px', type: 'date', align: 'center' },
      { id: 'status', label: 'Stato', sortable: true, width: '80px', type: 'custom', customTemplate: this.statusTemplate, align: 'center' }
    ];
  }

  ngOnInit() {
    // Load preloaded data from resolver if available
    this.route.data.subscribe(data => {
      if (data['roleFormData']) {
        this.roleFormData.set(data['roleFormData']);

        // Setup access areas config
        const config: Record<string, { label: string; icon: string; color: string }> = {};
        if (data['roleFormData']?.accessAreas) {
          data['roleFormData'].accessAreas.forEach((area: any) => {
            config[area.id] = {
              label: area.label,
              icon: area.icon,
              color: area.color
            };
          });
        }
        this.accessAreasConfig.set(config);
      }
    });

    // Load access areas if not already loaded
    if (!this.roleFormData()) {
      this.api.get<any[]>('datalist/user-access-areas').subscribe({
        next: (accessAreas) => {
          this.roleFormData.set({ accessAreas });

          // Setup access areas config
          const config: Record<string, { label: string; icon: string; color: string }> = {};
          accessAreas.forEach((area: any) => {
            config[area.id] = {
              label: area.label,
              icon: area.icon,
              color: area.color
            };
          });
          this.accessAreasConfig.set(config);
        },
        error: (error) => {
          console.error('Errore nel caricamento delle aree di accesso:', error);
        }
      });
    }
  }

  constructor() {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);

    this.roleService.getPaginatedRoles(
      this.pagination().currentPage,
      this.pagination().pageSize,
      this.currentFilters()
    ).subscribe({
      next: (result) => {
        this.roles.set(result.roles);
        this.pagination.set({
          currentPage: result.currentPage,
          pageSize: this.pagination().pageSize,
          totalItems: result.total,
          totalPages: result.totalPages
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Errore nel caricamento dei ruoli:', error);
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
        delete filters[event.filtroId as keyof RoleFilters];
      } else {
        (filters as any)[event.filtroId] = event.value === 'true';
      }
    } else if (event.value === '' || event.value === null || event.value === undefined) {
      delete filters[event.filtroId as keyof RoleFilters];
    } else {
      (filters as any)[event.filtroId] = event.value;
    }

    this.currentFilters.set(filters);
    this.pagination.update(p => ({ ...p, currentPage: 1 }));
    this.loadRoles();
  }

  onClearFiltri(): void {
    this.currentFilters.set({});
    this.pagination.update(p => ({ ...p, currentPage: 1 }));
    this.loadRoles();
  }

  onPageChange(event: PageEvent): void {
    this.pagination.update(p => ({
      ...p,
      currentPage: event.page,
      pageSize: event.pageSize
    }));
    this.loadRoles();
  }

  onSortChange(event: SortEvent): void {
    // TODO: Implementare ordinamento
    console.log('Sort:', event);
  }

  onActionClick(event: ActionEvent): void {
    const role = event.item as Role;

    switch (event.action) {
      case 'edit':
        this.editRole(role);
        break;
      case 'toggleStatus':
        this.toggleRoleStatus(role);
        break;
      case 'delete':
        this.deleteRole(role);
        break;
    }
  }

  openRoleModal(role?: Role) {
    console.log('[RolesListComponent] openRoleModal called', role);

    // If editing an existing role, load fresh data from server
    if (role) {
      console.log('[RolesListComponent] Loading role details from server for role:', role.id);
      this.loadingFormData.set(true);

      const requests: any = {
        role: this.roleService.getRoleById(role.id)
      };

      // Also load form data if not already loaded
      if (!this.roleFormData()) {
        requests.accessAreas = this.api.get<any[]>('datalist/user-access-areas');
      }

      forkJoin(requests).subscribe({
        next: (data: any) => {
          console.log('[RolesListComponent] Role details loaded:', data.role);
          this.selectedRole.set(data.role);

          if (data.accessAreas) {
            this.roleFormData.set({
              accessAreas: data.accessAreas
            });
          }

          this.loadingFormData.set(false);
          this.showRoleModal.set(true);
        },
        error: (error) => {
          console.error('Errore nel caricamento dei dettagli ruolo:', error);
          this.loadingFormData.set(false);
        }
      });
    } else {
      // Creating new role - just load form data if needed
      this.selectedRole.set(undefined);

      if (!this.roleFormData()) {
        console.log('[RolesListComponent] Loading form data (access areas)');
        this.loadingFormData.set(true);

        this.api.get<any[]>('datalist/user-access-areas').subscribe({
          next: (accessAreas) => {
            this.roleFormData.set({ accessAreas });
            this.loadingFormData.set(false);
            this.showRoleModal.set(true);
          },
          error: (error) => {
            console.error('Errore nel caricamento dei dati del form:', error);
            this.loadingFormData.set(false);
          }
        });
      } else {
        this.showRoleModal.set(true);
      }
    }
  }

  closeRoleModal() {
    this.showRoleModal.set(false);
    this.selectedRole.set(undefined);
  }

  onSaveRole(roleData: Partial<Role>) {
    if (this.selectedRole()) {
      // Update existing role
      this.roleService.updateRole(this.selectedRole()!.id, roleData).subscribe({
        next: () => {
          this.closeRoleModal();
          this.loadRoles();
        },
        error: (error) => {
          console.error('Errore nell\'aggiornamento del ruolo:', error);
          this.infoModalMessage.set('Errore nell\'aggiornamento del ruolo');
          this.showInfoModal.set(true);
        }
      });
    } else {
      // Create new role
      this.roleService.createRole(roleData as Omit<Role, 'id' | 'createdAt' | 'updatedAt'>).subscribe({
        next: () => {
          this.closeRoleModal();
          this.loadRoles();
        },
        error: (error) => {
          console.error('Errore nella creazione del ruolo:', error);
          this.infoModalMessage.set('Errore nella creazione del ruolo');
          this.showInfoModal.set(true);
        }
      });
    }
  }

  editRole(role: Role | null): void {
    if (role) {
      this.openRoleModal(role);
    } else {
      this.openRoleModal();
    }
  }

  private toggleRoleStatus(role: Role): void {
    const action = role.isActive ? 'disattivare' : 'attivare';
    this.confirmModalConfig.set({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Ruolo`,
      message: `Vuoi ${action} il ruolo ${role.name}?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      confirmVariant: role.isActive ? 'warning' : 'primary',
      action: () => {
        this.roleService.toggleRoleStatus(role.id).subscribe({
          next: () => {
            this.loadRoles();
            this.closeConfirmModal();
          },
          error: (error) => {
            console.error('Errore nel cambio stato:', error);
            this.infoModalMessage.set('Errore nel cambio stato del ruolo');
            this.showInfoModal.set(true);
            this.closeConfirmModal();
          }
        });
      }
    });
    this.showConfirmModal.set(true);
  }

  private deleteRole(role: Role): void {
    if (role.isSystem) {
      this.infoModalMessage.set('Non è possibile eliminare un ruolo di sistema');
      this.showInfoModal.set(true);
      return;
    }

    this.confirmModalConfig.set({
      title: 'Elimina Ruolo',
      message: `Sei sicuro di voler eliminare il ruolo ${role.name}?`,
      confirmText: 'Elimina',
      confirmVariant: 'danger',
      action: () => {
        this.roleService.deleteRole(role.id).subscribe({
          next: () => {
            this.loadRoles();
            this.closeConfirmModal();
          },
          error: (error) => {
            console.error('Errore nell\'eliminazione:', error);
            this.infoModalMessage.set('Impossibile eliminare il ruolo');
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

  getRoleAccessAreas(role: Role): Array<{ id: string; label: string; icon: string; color: string }> {
    const areas = [];
    const config = this.accessAreasConfig();

    if (role.hasHRAccess && config['hasHRAccess']) {
      areas.push({
        id: 'hasHRAccess',
        ...config['hasHRAccess']
      });
    }

    if (role.hasTechnicalAccess && config['hasTechnicalAccess']) {
      areas.push({
        id: 'hasTechnicalAccess',
        ...config['hasTechnicalAccess']
      });
    }

    if (role.hasAdminAccess && config['hasAdminAccess']) {
      areas.push({
        id: 'hasAdminAccess',
        ...config['hasAdminAccess']
      });
    }

    if (role.hasCandidateAccess && config['hasCandidateAccess']) {
      areas.push({
        id: 'hasCandidateAccess',
        ...config['hasCandidateAccess']
      });
    }

    return areas;
  }
}