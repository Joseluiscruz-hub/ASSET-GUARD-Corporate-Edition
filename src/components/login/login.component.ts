import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 flex items-center justify-center p-4">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:40px_40px]"></div>

      <div class="relative w-full max-w-md">
        <!-- Logo & Title -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-2xl mb-4 shadow-2xl shadow-red-600/30">
            <i class="fas fa-shield-alt text-4xl text-white"></i>
          </div>
          <h1 class="text-3xl font-black text-white tracking-tight">ASSET GUARD</h1>
          <p class="text-slate-400 mt-1">Sistema de Gestión de Activos</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <!-- Tabs -->
          <div class="flex gap-2 mb-6">
            <button 
              (click)="isLoginMode.set(true)"
              [class]="isLoginMode() ? 'flex-1 py-2.5 rounded-xl font-semibold text-white bg-red-600 shadow-lg' : 'flex-1 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white transition-colors'">
              Iniciar Sesión
            </button>
            <button 
              (click)="isLoginMode.set(false)"
              [class]="!isLoginMode() ? 'flex-1 py-2.5 rounded-xl font-semibold text-white bg-red-600 shadow-lg' : 'flex-1 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white transition-colors'">
              Registrarse
            </button>
          </div>

          <!-- Error Message -->
          @if (authService.error()) {
            <div class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-300 text-sm">
              <i class="fas fa-exclamation-circle"></i>
              {{ authService.error() }}
            </div>
          }

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Name (only for register) -->
            @if (!isLoginMode()) {
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1.5">Nombre Completo</label>
                <div class="relative">
                  <i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="text" 
                    [(ngModel)]="displayName" 
                    name="displayName"
                    placeholder="Tu nombre"
                    class="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all">
                </div>
              </div>
            }

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Correo Electrónico</label>
              <div class="relative">
                <i class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="email" 
                  [(ngModel)]="email" 
                  name="email"
                  placeholder="tu@email.com"
                  required
                  class="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all">
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
              <div class="relative">
                <i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  [(ngModel)]="password" 
                  name="password"
                  placeholder="••••••••"
                  required
                  minlength="6"
                  class="w-full pl-11 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all">
                <button 
                  type="button" 
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  <i [class]="showPassword() ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              [disabled]="isSubmitting()"
              class="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              @if (isSubmitting()) {
                <i class="fas fa-circle-notch fa-spin"></i>
                Procesando...
              } @else {
                <i [class]="isLoginMode() ? 'fas fa-sign-in-alt' : 'fas fa-user-plus'"></i>
                {{ isLoginMode() ? 'Iniciar Sesión' : 'Crear Cuenta' }}
              }
            </button>
          </form>

          <!-- Demo Access -->
          <div class="mt-6 pt-6 border-t border-white/10">
            <p class="text-center text-slate-400 text-sm mb-3">¿Solo quieres probar?</p>
            <button 
              (click)="loginDemo()"
              [disabled]="isSubmitting()"
              class="w-full py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2">
              <i class="fas fa-play-circle"></i>
              Acceso Demo
            </button>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-slate-500 text-xs mt-6">
          © 2024 Asset Guard Corporate Edition. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  readonly authService = inject(AuthService);

  // Form state
  email = '';
  password = '';
  displayName = '';

  // UI state
  readonly isLoginMode = signal(true);
  readonly showPassword = signal(false);
  readonly isSubmitting = signal(false);

  async onSubmit() {
    if (!this.email || !this.password) return;

    this.isSubmitting.set(true);

    if (this.isLoginMode()) {
      await this.authService.login(this.email, this.password);
    } else {
      if (!this.displayName) {
        this.isSubmitting.set(false);
        return;
      }
      await this.authService.register(this.email, this.password, this.displayName);
    }

    this.isSubmitting.set(false);
  }

  async loginDemo() {
    this.isSubmitting.set(true);
    // Credenciales de demo - puedes crear este usuario en Firebase
    await this.authService.login('demo@assetguard.com', 'demo123456');
    this.isSubmitting.set(false);
  }
}
