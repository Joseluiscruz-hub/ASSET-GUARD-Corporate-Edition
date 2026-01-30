
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-solicitor-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
      
      <!-- Mobile Header -->
      <div class="bg-[#ce1126] text-white p-6 shadow-lg">
        <h2 class="text-2xl font-black uppercase tracking-widest text-center">Reporte Rápido</h2>
        <p class="text-xs text-center text-red-200 opacity-80 mt-1">Selecciona el equipo para reportar</p>
      </div>

      <!-- Step 1: Select Asset -->
      @if (step() === 1) {
        <div class="flex-1 p-4 overflow-y-auto custom-scroll">
          <div class="grid grid-cols-2 gap-4">
            @for (asset of assets(); track asset.id) {
              <button (click)="selectAsset(asset.id)" 
                      class="p-4 bg-white rounded-xl shadow border-2 border-transparent hover:border-red-500 focus:border-red-500 transition-all flex flex-col items-center justify-center h-32 relative overflow-hidden group">
                
                <!-- Status Dot -->
                <span class="absolute top-2 right-2 w-3 h-3 rounded-full" 
                      [class.bg-green-500]="asset.status.name === 'Operativo'"
                      [class.bg-red-500]="asset.status.name === 'Taller'"></span>
                
                <span class="text-2xl font-black text-gray-800 group-hover:scale-110 transition-transform">{{ asset.id }}</span>
                <span class="text-xs text-gray-500 mt-1 font-mono">{{ asset.model }}</span>
                
                @if (asset.status.name !== 'Operativo') {
                  <div class="absolute inset-0 bg-gray-100/80 flex items-center justify-center backdrop-blur-[1px]">
                    <span class="text-xs font-bold text-red-600 rotate-12 border border-red-600 px-2 py-1 rounded">EN TALLER</span>
                  </div>
                }
              </button>
            }
          </div>
        </div>
      }

      <!-- Step 2: Select Issue Type & Submit -->
      @if (step() === 2) {
        <div class="flex-1 p-6 flex flex-col animate-slide-up bg-white rounded-t-3xl shadow-negative -mt-4 z-10">
          
          <div class="flex justify-between items-center mb-6">
             <h3 class="text-xl font-bold text-gray-800">Unidad: <span class="text-[#ce1126]">{{ selectedId() }}</span></h3>
             <button (click)="step.set(1)" class="text-gray-400 font-bold text-sm">Cancelar</button>
          </div>

          <p class="text-sm font-bold text-gray-500 uppercase mb-3">¿Qué está fallando?</p>
          
          <div class="grid grid-cols-2 gap-3 mb-6">
            @for (cat of categories; track cat.name) {
              <button (click)="category.set(cat.name)"
                      [class.bg-[#ce1126]]="category() === cat.name"
                      [class.text-white]="category() === cat.name"
                      [class.bg-gray-100]="category() !== cat.name"
                      [class.text-gray-600]="category() !== cat.name"
                      class="p-4 rounded-lg font-bold text-sm flex flex-col items-center gap-2 transition-colors">
                <i [class]="'fas ' + cat.icon + ' text-xl'"></i>
                {{ cat.name }}
              </button>
            }
          </div>

          <div class="mb-6">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Nota de Voz / Texto</label>
            <textarea [(ngModel)]="notes" 
                      rows="3" 
                      class="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-[#ce1126]" 
                      placeholder="Describe el problema brevemente..."></textarea>
          </div>

          <div class="mt-auto">
             <button (click)="submitReport()" 
                     [disabled]="!category()"
                     class="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-paper-plane"></i> ENVIAR REPORTE
             </button>
          </div>

        </div>
      }
    </div>
  `,
  styles: [`
    .shadow-negative { box-shadow: 0 -4px 20px -5px rgba(0,0,0,0.1); }
    .animate-slide-up { animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  `]
})
export class SolicitorPanelComponent {
  dataService = inject(DataService);
  
  assets = this.dataService.assets;
  step = signal(1);
  selectedId = signal<string>('');
  category = signal<string>('');
  notes = '';

  categories = [
    { name: 'Llantas', icon: 'fa-truck-monster' },
    { name: 'Frenos', icon: 'fa-ban' },
    { name: 'Motor', icon: 'fa-cogs' },
    { name: 'Hidráulico', icon: 'fa-oil-can' },
    { name: 'Eléctrico', icon: 'fa-bolt' },
    { name: 'Daño Físico', icon: 'fa-car-crash' }
  ];

  selectAsset(id: string) {
    const asset = this.dataService.getAsset(id);
    if (asset?.status.name === 'Taller') {
      alert('Esta unidad ya está reportada en taller.');
      return;
    }
    this.selectedId.set(id);
    this.step.set(2);
  }

  submitReport() {
    if (!this.category()) return;
    
    const description = `[${this.category()}] ${this.notes || 'Sin detalles adicionales.'}`;
    
    this.dataService.addLiveFailure({
      economico: this.selectedId(),
      falla: description,
      prioridad: this.category() === 'Frenos' ? 'Alta' : 'Media',
      reporta: 'Operador Móvil', // In a real app, this would be the logged in user
      estatus: 'Abierta'
    });

    // Reset
    alert('Reporte enviado exitosamente. Toyota ha sido notificado.');
    this.step.set(1);
    this.category.set('');
    this.notes = '';
    this.selectedId.set('');
  }
}
