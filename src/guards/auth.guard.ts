import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional para proteger rutas que requieren autenticación
 * Uso: canActivate: [authGuard]
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Si no está autenticado, redirigir al login
  // Nota: Esto requiere implementar router en la app
  // Por ahora, solo retornamos false para prevenir acceso
  console.warn('Intento de acceso no autorizado - usuario no autenticado');
  return false;
};

/**
 * Guard para rutas que solo deben ser accesibles por usuarios NO autenticados
 * (ej: página de login)
 */
export const guestGuard = () => {
  const authService = inject(AuthService);
  
  if (!authService.isAuthenticated()) {
    return true;
  }
  
  console.warn('Usuario ya autenticado intentando acceder a ruta de guest');
  return false;
};
