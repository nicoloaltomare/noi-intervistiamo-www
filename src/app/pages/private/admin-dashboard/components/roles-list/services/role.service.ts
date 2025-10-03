import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../../../core/services/api.service';
import { Role, RoleFilters, PaginatedRolesResult } from '../../../../../../shared/models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiService = inject(ApiService);

  getAllRoles(activeOnly: boolean = false, showDeleted: boolean = false): Observable<Role[]> {
    const params: any = {};
    if (activeOnly) params.activeOnly = 'true';
    if (showDeleted) params.showDeleted = 'true';

    return this.apiService.get<Role[]>('roles', params);
  }

  getActiveRoles(): Observable<Role[]> {
    return this.getAllRoles(true, false);
  }

  getRoleById(id: string): Observable<Role> {
    return this.apiService.get<Role>(`roles/${id}`);
  }

  getPaginatedRoles(
    page: number = 1,
    pageSize: number = 10,
    filters?: RoleFilters
  ): Observable<PaginatedRolesResult> {
    return this.apiService.post<PaginatedRolesResult>('roles/search', {
      page,
      pageSize,
      filters: filters || {}
    });
  }

  createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Observable<Role> {
    return this.apiService.post<Role>('roles', role);
  }

  updateRole(id: string, role: Partial<Role>): Observable<Role> {
    return this.apiService.put<Role>(`roles/${id}`, role);
  }

  toggleRoleStatus(id: string): Observable<Role> {
    return this.apiService.patch<Role>(`roles/${id}/toggle-status`, {});
  }

  deleteRole(id: string): Observable<void> {
    return this.apiService.delete<void>(`roles/${id}`);
  }
}