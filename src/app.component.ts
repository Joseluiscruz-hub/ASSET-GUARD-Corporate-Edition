
import { Component, signal, HostListener, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AssetListComponent } from './components/asset-list/asset-list.component';
import { AssetDetailComponent } from './components/asset-detail/asset-detail.component';
import { AdminComponent } from './components/admin/admin.component';
import { ServicePanelComponent } from './components/service-panel/service-panel.component';
import { SolicitorPanelComponent } from './components/solicitor-panel/solicitor-panel.component';
import { DataService } from './services/data.service';

// Updated View Types
type View = 'dashboard' | 'assets' | 'settings' | 'service' | 'solicitor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardComponent, 
    AssetListComponent, 
    AssetDetailComponent, 
    AdminComponent, 
    ServicePanelComponent,
    SolicitorPanelComponent
  ],
  templateUrl: './app.component.html',
  styles: [`
    .view-animate {
      animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class AppComponent implements OnInit {
  currentView = signal<View>('dashboard');
  selectedAssetId = signal<string | null>(null);
  
  private dataService = inject(DataService);
  private previousFailureCount = 0;

  constructor() {
    // REAL-TIME NOTIFICATION EFFECT
    effect(() => {
      const failures = this.dataService.forkliftFailures();
      
      // Detect if a NEW failure has arrived (count increased)
      if (failures.length > this.previousFailureCount) {
        
        const latest = failures[0]; 
        
        // Alert logic: Only play sound if it's not a closed ticket loading initially
        if (latest.estatus === 'Abierta' && this.previousFailureCount > 0) {
          this.playAlertSound(latest.prioridad === 'Alta');
          
          if ('Notification' in window && Notification.permission === 'granted') {
             const notif = new Notification('NUEVA FALLA REPORTADA', {
                body: `Unidad ${latest.economico}: ${latest.falla}`,
                icon: 'https://cdn-icons-png.flaticon.com/512/564/564619.png',
                tag: latest.id
             });
             
             // CLICK HANDLER: Redirect to Toyota Panel
             notif.onclick = (e) => {
                e.preventDefault();
                window.focus();
                this.setView('service');
             };
          }
        }
      }
      
      this.previousFailureCount = failures.length;
    });
  }

  ngOnInit() {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    // Listen for custom events
    window.addEventListener('asset-selected', (e: any) => {
      this.selectedAssetId.set(e.detail);
    });
    
    window.addEventListener('asset-closed', () => {
      this.selectedAssetId.set(null);
    });
  }

  setView(view: View) {
    this.currentView.set(view);
    this.selectedAssetId.set(null);
    
    // Auto-toggle Plant Mode for Display View
    if (view === 'dashboard') {
       if (!this.dataService.plantMode()) this.dataService.togglePlantMode();
    } else {
       if (this.dataService.plantMode()) this.dataService.togglePlantMode();
    }
  }

  playAlertSound(isCritical: boolean) {
    try {
      const soundUrl = isCritical 
        ? 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' 
        : 'https://assets.mixkit.co/active_storage/sfx/2345/2345-preview.mp3'; 
        
      const audio = new Audio(soundUrl); 
      audio.volume = 0.8;
      audio.play().catch(e => console.log('Audio autoplay blocked:', e));
    } catch (err) {
      console.error('Error playing alert:', err);
    }
  }
}
