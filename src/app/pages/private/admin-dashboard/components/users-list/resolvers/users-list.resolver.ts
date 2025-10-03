import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../../../../core/services/api.service';

export interface UsersListData {
  roles: any[];
  departments: any[];
  userStatuses: any[];
}

export const usersListResolver: ResolveFn<UsersListData> = () => {
  const api = inject(ApiService);

  // Load all dropdown data in parallel before showing the page
  return forkJoin({
    roles: api.get<any[]>('datalist/roles'),
    departments: api.get<any[]>('datalist/departments'),
    userStatuses: api.get<any[]>('datalist/user-statuses')
  });
};
