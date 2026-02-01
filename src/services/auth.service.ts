import { Injectable, signal, computed } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { environment } from '../environments/environment';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Usar la app existente o crear una nueva
  private app = getApps().length > 0 ? getApp() : initializeApp(environment.firebase);
  private auth = getAuth(this.app);

  // --- Auth State Signals ---
  readonly currentUser = signal<AuthUser | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  // --- Computed ---
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    // Escuchar cambios en el estado de autenticación
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.currentUser.set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      } else {
        this.currentUser.set(null);
      }
      this.isLoading.set(false);
    });
  }

  // --- Login con Email/Password ---
  async login(email: string, password: string): Promise<boolean> {
    this.error.set(null);
    this.isLoading.set(true);

    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      this.currentUser.set({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      });
      this.isLoading.set(false);
      return true;
    } catch (err: any) {
      this.handleAuthError(err);
      this.isLoading.set(false);
      return false;
    }
  }

  // --- Registro con Email/Password ---
  async register(email: string, password: string, displayName: string): Promise<boolean> {
    this.error.set(null);
    this.isLoading.set(true);

    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);

      // Actualizar el perfil con el nombre
      await updateProfile(result.user, { displayName });

      this.currentUser.set({
        uid: result.user.uid,
        email: result.user.email,
        displayName: displayName,
        photoURL: result.user.photoURL
      });
      this.isLoading.set(false);
      return true;
    } catch (err: any) {
      this.handleAuthError(err);
      this.isLoading.set(false);
      return false;
    }
  }

  // --- Logout ---
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUser.set(null);
    } catch (err: any) {
      console.error('Error al cerrar sesión:', err);
    }
  }

  // --- Manejo de errores ---
  private handleAuthError(err: any): void {
    const errorCode = err.code;
    let message = 'Error desconocido. Intenta de nuevo.';

    switch (errorCode) {
      case 'auth/invalid-email':
        message = 'El correo electrónico no es válido.';
        break;
      case 'auth/user-disabled':
        message = 'Esta cuenta ha sido deshabilitada.';
        break;
      case 'auth/user-not-found':
        message = 'No existe una cuenta con este correo.';
        break;
      case 'auth/wrong-password':
        message = 'Contraseña incorrecta.';
        break;
      case 'auth/invalid-credential':
        message = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        break;
      case 'auth/email-already-in-use':
        message = 'Ya existe una cuenta con este correo.';
        break;
      case 'auth/weak-password':
        message = 'La contraseña debe tener al menos 6 caracteres.';
        break;
      case 'auth/too-many-requests':
        message = 'Demasiados intentos. Espera un momento.';
        break;
    }

    this.error.set(message);
  }
}
