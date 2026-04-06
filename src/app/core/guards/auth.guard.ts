import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Vérifier la validité du token à chaque navigation
  if (auth.hasValidToken()) {
    return true;
  }

  // Token absent ou expiré → nettoyer et rediriger
  auth.logout();
  return router.createUrlTree(['/admin/login']);
};
