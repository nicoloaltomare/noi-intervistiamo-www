import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../../../core/services/api.service';

export interface RoleFormData {
  accessAreas: any[];
}

export const roleFormResolver: ResolveFn<RoleFormData> = () => {
  const api = inject(ApiService);

  // Load access areas for role form
  return api.get<any[]>('datalist/user-access-areas').pipe(
    map((accessAreas) => ({ accessAreas }))
  );
};
