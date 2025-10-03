import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User, UserFilters, PaginatedUsersResult } from '../../../../../../shared/models/user.model';
import { ApiService } from '../../../../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiService = inject(ApiService);

  getPaginatedUsers(
    page: number = 1,
    pageSize: number = 10,
    filters?: UserFilters
  ): Observable<PaginatedUsersResult> {
    const body: any = {
      page,
      pageSize,
      filters: {}
    };

    if (filters) {
      if (filters.searchText) {
        body.filters.search = filters.searchText;
      }
      if (filters.roleId) {
        body.filters.role = filters.roleId;
      }
      if (filters.status) {
        body.filters.status = filters.status;
      }
      if (filters.department) {
        body.filters.department = filters.department;
      }
      if (filters.showDeleted !== undefined) {
        body.filters.showDeleted = filters.showDeleted;
      }
    }

    return this.apiService.post<PaginatedUsersResult>('users/search', body);
  }

  getUserById(id: string): Observable<User> {
    return this.apiService.get<User>(`users/${id}`);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Observable<User> {
    return this.apiService.post<User>('users', userData);
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.apiService.put<User>(`users/${id}`, userData);
  }

  deleteUser(id: string): Observable<void> {
    return this.apiService.delete<void>(`users/${id}`);
  }

  toggleUserStatus(id: string): Observable<User> {
    return this.apiService.patch<User>(`users/${id}/toggle-status`);
  }

  restoreUser(id: string): Observable<User> {
    return this.apiService.patch<User>(`users/${id}/restore`);
  }
}