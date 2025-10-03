import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../../../core/services/api.service';

export interface DepartmentFormData {
  accessAreas: any[];
}

export const departmentFormResolver: ResolveFn<DepartmentFormData> = () => {
  const api = inject(ApiService);

  // Load access areas for department form
  return api.get<any[]>('datalist/user-access-areas').pipe(
    map((accessAreas) => ({ accessAreas }))
  );
};
