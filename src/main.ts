import 'zone.js'; // añade esta línea

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
// quita el zoneless experimental por ahora
// import { provideExperimentalZonelessChangeDetection } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    // provideExperimentalZonelessChangeDetection(), // comenta o elimina esta línea
    provideHttpClient(),
    provideAnimations()
  ]
}).catch(err => console.error(err));
