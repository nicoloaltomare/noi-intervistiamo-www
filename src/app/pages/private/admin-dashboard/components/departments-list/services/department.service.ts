import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../../../core/services/api.service';
import { Department, DepartmentFilters, PaginatedDepartmentsResult } from '../../../../../../shared/models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiService = inject(ApiService);

  getAllDepartments(activeOnly: boolean = false, showDeleted: boolean = false): Observable<Department[]> {
    const params: any = {};
    if (activeOnly) params.activeOnly = 'true';
    if (showDeleted) params.showDeleted = 'true';

    return this.apiService.get<Department[]>('departments', params);
  }

  getActiveDepartments(): Observable<Department[]> {
    return this.getAllDepartments(true, false);
  }

  getDepartmentById(id: string): Observable<Department> {
    return this.apiService.get<Department>(`departments/${id}`);
  }

  getPaginatedDepartments(
    page: number = 1,
    pageSize: number = 10,
    filters?: DepartmentFilters
  ): Observable<PaginatedDepartmentsResult> {
    return this.apiService.post<PaginatedDepartmentsResult>('departments/search', {
      page,
      pageSize,
      filters: filters || {}
    });
  }

  createDepartment(department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Observable<Department> {
    return this.apiService.post<Department>('departments', department);
  }

  updateDepartment(id: string, department: Partial<Department>): Observable<Department> {
    return this.apiService.put<Department>(`departments/${id}`, department);
  }

  toggleDepartmentStatus(id: string): Observable<Department> {
    return this.apiService.patch<Department>(`departments/${id}/toggle-status`, {});
  }

  deleteDepartment(id: string): Observable<void> {
    return this.apiService.delete<void>(`departments/${id}`);
  }
}
