import 'zone.js';  // 1) añade esta línea

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
// import { provideExperimentalZonelessChangeDetection } from '@angular/core'; // 2) comenta o elimina

bootstrapApplication(AppComponent, {
  providers: [
    // provideExperimentalZonelessChangeDetection(), // 3) comenta o elimina
    provideHttpClient(),
    provideAnimations()
  ]
}).catch(err => console.error(err));
