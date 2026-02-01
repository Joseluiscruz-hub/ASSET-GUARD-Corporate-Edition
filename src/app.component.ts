
import { Component, signal, effect, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml, SecurityContext } from '@angular/platform-browser';
import { DataService } from './services/data.service';
import { GeminiService } from './services/gemini.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AssetListComponent } from './components/asset-list/asset-list.component';
import { AssetDetailComponent } from './components/asset-detail/asset-detail.component';
import { AdminComponent } from './components/admin/admin.component';
import { ServicePanelComponent } from './components/service-panel/service-panel.component';
import { SolicitorPanelComponent } from './components/solicitor-panel/solicitor-panel.component';

type View = 'dashboard' | 'assets' | 'service' | 'solicitor' | 'settings';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    DatePipe,
    DashboardComponent, 
    AssetListComponent, 
    AssetDetailComponent, 
    AdminComponent, 
    ServicePanelComponent,
    SolicitorPanelComponent
  ],
  templateUrl: './app.component.html',
  styles: [`
    .fade-enter { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AppComponent {
  dataService = inject(DataService);
  geminiService = inject(GeminiService);
  private sanitizer = inject(DomSanitizer);

  // State
  currentView = signal<View>('dashboard');
  selectedAssetId = signal<string | null>(null);
  showAiPanel = signal(false);
  
  // Data Signals
  connectionStatus = this.dataService.connectionStatus;
  lastUpdate = this.dataService.lastUpdate;
  plantMode = this.dataService.plantMode;
  failures = this.dataService.forkliftFailures;

  // AI Insights State
  aiInsights = signal<SafeHtml | null>(null);
  aiLoading = signal(false);

  private previousFailureCount = 0;

  // Derived
  syncText = computed(() => {
     if (this.connectionStatus() === 'online') return 'Conectado (Firebase RTDB)';
     if (this.connectionStatus() === 'syncing') return 'Sincronizando...';
     return 'Modo Offline (Solo Lectura)';
  });

  constructor() {
    // Notification Effect
    effect(() => {
      const list = this.failures();
      if (list.length > this.previousFailureCount) {
        const latest = list[0];
        if (latest.estatus === 'Abierta' && this.previousFailureCount > 0) {
           this.playAlert(latest.prioridad === 'Alta');
        }
      }
      this.previousFailureCount = list.length;
    });

    // Custom Events
    window.addEventListener('asset-selected', (e: any) => this.selectedAssetId.set(e.detail));
    window.addEventListener('asset-closed', () => this.selectedAssetId.set(null));
  }

  // Navigation Logic
  setView(view: View) {
    this.currentView.set(view);
    this.selectedAssetId.set(null);
    // Auto-switch theme based on view context
    if (view === 'dashboard' && !this.plantMode()) this.dataService.togglePlantMode();
    if (view !== 'dashboard' && this.plantMode()) this.dataService.togglePlantMode();
  }

  toggleAiPanel() {
    this.showAiPanel.update(v => !v);
    if (this.showAiPanel() && !this.aiInsights()) {
      // Don't auto-generate, let user choose action
    }
  }

  async generateExecutiveSummary() {
    this.aiLoading.set(true);
    const kpi = this.dataService.kpiData();
    const availability = this.dataService.fleetAvailability();
    const active = this.failures().filter(f => f.estatus !== 'Cerrada');
    
    const summary = await this.geminiService.generateExecutiveReport(kpi, active, availability);
    this.aiInsights.set(this.sanitizer.sanitize(SecurityContext.HTML, summary));
    this.aiLoading.set(false);
  }

  playAlert(critical: boolean) {
    const audio = new Audio(critical 
      ? 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' 
      : 'https://assets.mixkit.co/active_storage/sfx/2345/2345-preview.mp3');
    audio.play().catch(() => {});
  }

  get viewTitle(): string {
    switch(this.currentView()) {
      case 'dashboard': return 'Centro de Monitoreo (NOC)';
      case 'assets': return 'Inventario de Flota';
      case 'service': return 'Gestión Técnica Toyota';
      case 'solicitor': return 'App Operador';
      case 'settings': return 'Configuración';
      default: return 'AssetGuard';
    }
  }
}
