import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../../../../core/services/api.service';

export interface UserFormData {
  accessAreas: any[];
  colorPalettes: any[];
}

export const userFormResolver: ResolveFn<UserFormData> = () => {
  const api = inject(ApiService);

  // Load access areas and color palettes for user form
  return forkJoin({
    accessAreas: api.get<any[]>('datalist/user-access-areas'),
    colorPalettes: api.get<any[]>('datalist/user-color-palettes')
  });
};
