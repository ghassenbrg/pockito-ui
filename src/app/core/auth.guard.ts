import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from './keycloak.service';

export const authGuard = () => {
  const kc = inject(KeycloakService);
  const router = inject(Router);
  
  if (kc.isAuthenticated()) return true;
  kc.login();
  return false;
};
