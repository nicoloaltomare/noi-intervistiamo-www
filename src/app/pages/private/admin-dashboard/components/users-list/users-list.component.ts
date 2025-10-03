import { Component, inject, signal, ViewChild, TemplateRef, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SearchComponent, FiltroItem } from '../../../../../core/toolkit/search/search.component';
import { DataTableComponent, TableColumn, TableAction, PaginationData, PageEvent, SortEvent, ActionEvent } from '../../../../../core/toolkit/data-table/data-table.component';
import { UserService } from './services/user.service';
import { User, UserFilters } from '../../../../../shared/models/user.model';
import { UserFormModalComponent } from '../user-form-modal/user-form-modal.component';
import { SelectOption } from '../../../../../core/toolkit/custom-select';
import { BaseModalComponent } from '../../../../../core/toolkit/base-modal/base-modal.component';
import { UsersListData } from './resolvers/users-list.resolver';
import { UserFormData } from '../user-form-modal/resolvers/user-form.resolver';
import { ApiService } from '../../../../../core/services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, SearchComponent, DataTableComponent, UserFormModalComponent, BaseModalComponent],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit, AfterViewInit {
  @ViewChild('userColumnTemplate') userColumnTemplate!: TemplateRef<any>;
  @ViewChild('accessAreasTemplate') accessAreasTemplate!: TemplateRef<any>;
  @ViewChild('lastLoginTemplate') lastLoginTemplate!: TemplateRef<any>;
  @ViewChild('statusColumnTemplate') statusColumnTemplate!: TemplateRef<any>;
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private api = inject(ApiService);

  // Signals
  users = signal<User[]>([]);
  loading = signal(false);
  currentFilters = signal<UserFilters>({});
  showUserModal = signal(false);
  selectedUser = signal<User | undefined>(undefined);
  showConfirmModal = signal(false);
  confirmModalConfig = signal<{
    title: string;
    message: string;
    confirmText: string;
    confirmVariant: 'primary' | 'danger' | 'warning';
    action: () => void;
  } | null>(null);
  rolesCache = signal<any[]>([]);
  resolverData = signal<UsersListData | null>(null);
  userFormData = signal<UserFormData | null>(null);
  loadingFormData = signal(false);

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

  // Colori e icone per gli stati (loaded from API)
  statusConfig = signal<Record<string, { color: string; icon: string }>>({});

  // Filtri di ricerca
  filtri: FiltroItem[] = [];

  // Colonne della tabella
  columns: TableColumn[] = [];

  // Azioni della tabella
  actions: TableAction[] = [
    {
      id: 'edit',
      label: 'Modifica',
      icon: 'fas fa-edit',
      variant: 'primary',
      visible: (item: User) => !item.deletedAt
    },
    {
      id: 'toggleStatus',
      label: 'Attiva/Disattiva',
      icon: 'fas fa-power-off',
      variant: 'warning',
      visible: (item: User) => !item.deletedAt
    },
    {
      id: 'delete',
      label: 'Elimina',
      icon: 'fas fa-trash',
      variant: 'danger',
      visible: (item: User) => !item.deletedAt
    }
  ];

  ngOnInit() {
    // Get pre-loaded data from resolver
    const data = this.route.snapshot.data['data'] as UsersListData;

    if (data) {
      // Store resolver data for passing to modal
      this.resolverData.set(data);

      // Set roles cache
      this.rolesCache.set(data.roles);

      // Setup status config
      const config: Record<string, { color: string; icon: string }> = {};
      data.userStatuses.forEach((status: any) => {
        config[status.value] = {
          color: status.color,
          icon: status.icon
        };
      });
      this.statusConfig.set(config);

      // Setup filters with pre-loaded data
      this.filtri = [
        {
          id: 'searchText',
          label: 'Cerca',
          type: 'text',
          placeholder: 'Nome, Cognome, Email, Username...',
          colSize: 'col-md-4'
        },
        {
          id: 'roleId',
          label: 'Ruolo',
          type: 'select',
          placeholder: 'Seleziona un ruolo',
          options: [
            { value: '', label: 'Tutti i ruoli' },
            ...data.roles.map((role: any) => ({
              value: role.id,
              label: role.name,
              color: role.color
            }))
          ],
          colSize: 'col-md-3'
        },
        {
          id: 'status',
          label: 'Stato',
          type: 'select',
          placeholder: 'Seleziona uno stato',
          options: [
            { value: '', label: 'Tutti gli stati' },
            ...data.userStatuses.map((status: any) => ({
              value: status.value,
              label: status.label,
              color: status.color,
              icon: status.icon
            }))
          ],
          colSize: 'col-md-2'
        },
        {
          id: 'department',
          label: 'Dipartimento',
          type: 'select',
          placeholder: 'Seleziona un dipartimento',
          options: [
            { value: '', label: 'Tutti i dipartimenti' },
            ...data.departments.map((dept: any) => ({
              value: dept.name,
              label: dept.name,
              color: dept.color
            }))
          ],
          colSize: 'col-md-3'
        },
        {
          id: 'showDeleted',
          label: 'Mostra utenti eliminati',
          type: 'checkbox',
          value: false,
          colSize: 'col-md-12'
        }
      ];
    }
  }

  ngAfterViewInit() {
    this.columns = [
      { id: 'user', label: 'Utente', sortable: false, width: '200px', type: 'custom', customTemplate: this.userColumnTemplate },
      { id: 'accessAreas', label: 'Aree di Accesso', sortable: false, width: '320px', type: 'custom', customTemplate: this.accessAreasTemplate },
      { id: 'lastLogin', label: 'Ultimo Accesso', sortable: true, width: '150px', align: 'center', type: 'custom', customTemplate: this.lastLoginTemplate },
      { id: 'status', label: 'Stato', sortable: true, width: '100px', align: 'center', type: 'custom', customTemplate: this.statusColumnTemplate }
    ];

    // Forza il change detection dopo aver impostato le colonne
    this.cdr.detectChanges();

    // Carica i dati dopo che la vista è stata inizializzata
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);

    this.userService.getPaginatedUsers(
      this.pagination().currentPage,
      this.pagination().pageSize,
      this.currentFilters()
    ).subscribe({
      next: (result) => {
        setTimeout(() => {
          this.users.set(result.users);
          this.pagination.set({
            currentPage: result.currentPage,
            pageSize: this.pagination().pageSize,
            totalItems: result.total,
            totalPages: result.totalPages
          });
          this.loading.set(false);
        }, 0);
      },
      error: (error) => {
        console.error('Errore nel caricamento degli utenti:', error);
        this.loading.set(false);
      }
    });
  }

  onFiltroChange(event: { filtroId: string; value: any }): void {
    const filters = { ...this.currentFilters() };

    if (event.filtroId === 'showDeleted') {
      filters.showDeleted = event.value;
    } else if (event.value === '' || event.value === null || event.value === undefined) {
      delete filters[event.filtroId as keyof UserFilters];
    } else {
      (filters as any)[event.filtroId] = event.value;
    }

    this.currentFilters.set(filters);
    this.pagination.update(p => ({ ...p, currentPage: 1 })); // Reset to first page
    this.loadUsers();
  }

  onClearFiltri(): void {
    this.currentFilters.set({});
    this.pagination.update(p => ({ ...p, currentPage: 1 }));
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pagination.update(p => ({
      ...p,
      currentPage: event.page,
      pageSize: event.pageSize
    }));
    this.loadUsers();
  }

  onSortChange(event: SortEvent): void {
    // TODO: Implementare ordinamento
    console.log('Sort:', event);
  }

  onActionClick(event: ActionEvent): void {
    const user = event.item as User;

    switch (event.action) {
      case 'edit':
        this.editUser(user);
        break;
      case 'toggleStatus':
        this.toggleUserStatus(user);
        break;
      case 'delete':
        this.deleteUser(user);
        break;
      case 'restore':
        this.restoreUser(user);
        break;
    }
  }

  private editUser(user: User): void {
    this.openUserModal(user);
  }

  private toggleUserStatus(user: User): void {
    const action = user.isActive ? 'disattivare' : 'attivare';
    this.confirmModalConfig.set({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Utente`,
      message: `Vuoi ${action} l'utente ${user.firstName} ${user.lastName}?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      confirmVariant: user.isActive ? 'warning' : 'primary',
      action: () => {
        this.userService.toggleUserStatus(user.id).subscribe({
          next: () => {
            this.loadUsers();
            this.closeConfirmModal();
          },
          error: (error) => {
            console.error('Errore nel cambio stato:', error);
            this.infoModalMessage.set('Errore nel cambio stato dell\'utente');
            this.showInfoModal.set(true);
            this.closeConfirmModal();
          }
        });
      }
    });
    this.showConfirmModal.set(true);
  }

  private deleteUser(user: User): void {
    this.confirmModalConfig.set({
      title: 'Elimina Utente',
      message: `Sei sicuro di voler eliminare l'utente ${user.firstName} ${user.lastName}?`,
      confirmText: 'Elimina',
      confirmVariant: 'danger',
      action: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.loadUsers();
            this.closeConfirmModal();
          },
          error: (error) => {
            console.error('Errore nell\'eliminazione:', error);
            this.infoModalMessage.set('Errore nell\'eliminazione dell\'utente');
            this.showInfoModal.set(true);
            this.closeConfirmModal();
          }
        });
      }
    });
    this.showConfirmModal.set(true);
  }

  private restoreUser(user: User): void {
    this.confirmModalConfig.set({
      title: 'Ripristina Utente',
      message: `Vuoi ripristinare l'utente ${user.firstName} ${user.lastName}?`,
      confirmText: 'Ripristina',
      confirmVariant: 'primary',
      action: () => {
        this.userService.restoreUser(user.id).subscribe({
          next: () => {
            this.loadUsers();
            this.closeConfirmModal();
          },
          error: (error) => {
            console.error('Errore nel ripristino:', error);
            this.infoModalMessage.set('Errore nel ripristino dell\'utente');
            this.showInfoModal.set(true);
            this.closeConfirmModal();
          }
        });
      }
    });
    this.showConfirmModal.set(true);
  }

  getUserInitials(user: User): string {
    const firstInitial = user.firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = user.lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  }

  getRoleColor(user: User): string {
    return user.roleColor || '#6c757d';
  }

  getDepartmentColor(user: User): string {
    return user.departmentColor || '#6c757d';
  }

  getStatusIcon(user: User): string {
    return this.statusConfig()[user.status]?.icon || 'fas fa-question-circle';
  }

  getStatusColor(user: User): string {
    return this.statusConfig()[user.status]?.color || '#6c757d';
  }

  getUserAccessAreas(user: User): Array<{ id: string; label: string; icon: string; color: string }> {
    const areas = [];
    const colors = (user as any).accessAreaColors || {};

    if ((user as any).hasHRAccess) {
      areas.push({
        id: 'hasHRAccess',
        label: 'HR',
        icon: 'fas fa-users',
        color: colors['hasHRAccess'] || '#2563eb'
      });
    }

    if ((user as any).hasTechnicalAccess) {
      areas.push({
        id: 'hasTechnicalAccess',
        label: 'Tecnica',
        icon: 'fas fa-code',
        color: colors['hasTechnicalAccess'] || '#7c3aed'
      });
    }

    if ((user as any).hasAdminAccess) {
      areas.push({
        id: 'hasAdminAccess',
        label: 'Admin',
        icon: 'fas fa-cog',
        color: colors['hasAdminAccess'] || '#dc2626'
      });
    }

    if ((user as any).hasCandidateAccess) {
      areas.push({
        id: 'hasCandidateAccess',
        label: 'Candidato',
        icon: 'fas fa-user',
        color: colors['hasCandidateAccess'] || '#059669'
      });
    }

    return areas;
  }

  openUserModal(user?: User) {
    console.log('[UsersListComponent] openUserModal called', user);

    // If editing an existing user, load fresh data from server
    if (user) {
      console.log('[UsersListComponent] Loading user details from server for user:', user.id);
      this.loadingFormData.set(true);

      const requests: any = {
        user: this.userService.getUserById(user.id)
      };

      // Also load form data if not already loaded
      if (!this.userFormData()) {
        requests.accessAreas = this.api.get<any[]>('datalist/user-access-areas');
        requests.colorPalettes = this.api.get<any[]>('datalist/user-color-palettes');
      }

      forkJoin(requests).subscribe({
        next: (data: any) => {
          console.log('[UsersListComponent] User details loaded:', data.user);
          this.selectedUser.set(data.user);

          if (data.accessAreas && data.colorPalettes) {
            this.userFormData.set({
              accessAreas: data.accessAreas,
              colorPalettes: data.colorPalettes
            });
          }

          this.loadingFormData.set(false);
          this.showUserModal.set(true);
        },
        error: (error) => {
          console.error('Errore nel caricamento dei dettagli utente:', error);
          this.loadingFormData.set(false);
        }
      });
    } else {
      // Creating new user - just load form data if needed
      this.selectedUser.set(undefined);

      if (!this.userFormData()) {
        console.log('[UsersListComponent] Loading form data (access areas & color palettes)');
        this.loadingFormData.set(true);
        forkJoin({
          accessAreas: this.api.get<any[]>('datalist/user-access-areas'),
          colorPalettes: this.api.get<any[]>('datalist/user-color-palettes')
        }).subscribe({
          next: (data) => {
            this.userFormData.set(data);
            this.loadingFormData.set(false);
            this.showUserModal.set(true);
          },
          error: (error) => {
            console.error('Errore nel caricamento dei dati del form:', error);
            this.loadingFormData.set(false);
          }
        });
      } else {
        this.showUserModal.set(true);
      }
    }
  }

  closeUserModal() {
    this.showUserModal.set(false);
    this.selectedUser.set(undefined);
  }

  onSaveUser(userData: Partial<User>) {
    if (this.selectedUser()) {
      // Update existing user
      this.userService.updateUser(this.selectedUser()!.id, userData).subscribe({
        next: () => {
          this.closeUserModal();
          this.loadUsers();
        },
        error: (error) => {
          console.error('Errore nell\'aggiornamento dell\'utente:', error);
          this.infoModalMessage.set('Errore nell\'aggiornamento dell\'utente');
          this.showInfoModal.set(true);
        }
      });
    } else {
      // Create new user
      this.userService.createUser(userData as Omit<User, 'id' | 'createdAt' | 'updatedAt'>).subscribe({
        next: () => {
          this.closeUserModal();
          this.loadUsers();
        },
        error: (error) => {
          console.error('Errore nella creazione dell\'utente:', error);
          this.infoModalMessage.set('Errore nella creazione dell\'utente');
          this.showInfoModal.set(true);
        }
      });
    }
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
