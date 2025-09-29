import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as string;
  const currentUser = authService.currentUser();

  if (!currentUser) {
    router.navigate(['/home']);
    return false;
  }

  // Verifica se l'utente ha il ruolo richiesto
  if (requiredRole && currentUser.role !== requiredRole) {
    // Reindirizza all'area corretta dell'utente
    const userArea = authService.getUserArea(currentUser.role);
    if (userArea) {
      router.navigate([userArea.route]);
    } else {
      router.navigate(['/home']);
    }
    return false;
  }

  return true;
};