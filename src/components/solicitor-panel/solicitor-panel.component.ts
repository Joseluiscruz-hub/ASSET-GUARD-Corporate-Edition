import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-solicitor-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full h-full bg-slate-50 flex flex-col overflow-hidden">
      <!-- Header Compacto (Landscape Friendly) -->
      <div
        class="bg-[#ce1126] text-white px-6 py-3 shadow-md flex justify-between items-center shrink-0 z-20"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <i class="fas fa-mobile-alt text-sm"></i>
          </div>
          <div>
            <h2 class="text-base font-black uppercase tracking-widest leading-none">
              Reporte Rápido
            </h2>
            <p class="text-[10px] text-red-100 opacity-90">Terminal Operador</p>
          </div>
        </div>
        <!-- Steps Indicator -->
        <div class="flex items-center gap-3 bg-black/10 px-3 py-1 rounded-full">
          <span class="text-[10px] font-bold opacity-80 uppercase tracking-wide"
            >Paso {{ step() }} de 2</span
          >
          <div class="flex gap-1.5">
            <div
              class="w-2 h-2 rounded-full transition-colors duration-300"
              [class]="step() >= 1 ? 'bg-white' : 'bg-white/30'"
            ></div>
            <div
              class="w-2 h-2 rounded-full transition-colors duration-300"
              [class]="step() >= 2 ? 'bg-white' : 'bg-white/30'"
            ></div>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 overflow-hidden relative">
        <!-- Step 1: Select Asset (Responsive Grid) -->
        @if (step() === 1) {
          <div class="h-full overflow-y-auto custom-scroll p-4 md:p-6 bg-slate-100/50">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 pl-1">
              1. Selecciona la unidad a reportar
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              @for (asset of assets(); track asset.id) {
                <button
                  (click)="selectAsset(asset.id)"
                  class="group relative bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-red-500 focus:border-red-500 transition-all p-4 flex flex-col items-center justify-between h-36 md:h-40 hover:shadow-md"
                >
                  <!-- Status Indicator -->
                  <div class="absolute top-3 right-3 flex gap-1">
                    @if (asset.status.name === 'Taller') {
                      <span class="flex h-2.5 w-2.5">
                        <span
                          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
                        ></span>
                        <span
                          class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"
                        ></span>
                      </span>
                    } @else {
                      <span
                        class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"
                        title="Operativo"
                      ></span>
                    }
                  </div>

                  <!-- Icon/Visual -->
                  <div
                    class="mt-2 text-slate-200 group-hover:text-red-50 transition-colors duration-300"
                  >
                    <i class="fas fa-truck-loading text-5xl"></i>
                  </div>

                  <!-- ID -->
                  <div class="text-center z-10 w-full">
                    <span
                      class="block text-xl md:text-2xl font-black text-slate-800 tracking-tighter group-hover:scale-110 transition-transform"
                      >{{ asset.id }}</span
                    >
                    <span
                      class="block text-[10px] text-slate-500 font-mono mt-1 border-t border-slate-100 pt-1 mx-4"
                      >{{ asset.model }}</span
                    >
                  </div>

                  <!-- Locked Overlay if Taller -->
                  @if (asset.status.name !== 'Operativo') {
                    <div
                      class="absolute inset-0 bg-slate-50/90 backdrop-blur-[1px] rounded-[10px] flex flex-col items-center justify-center z-20 cursor-not-allowed border-2 border-slate-100"
                    >
                      <div class="bg-white p-2 rounded-full shadow-sm mb-2">
                        <i class="fas fa-lock text-slate-400 text-lg"></i>
                      </div>
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wide"
                        >En Reparación</span
                      >
                    </div>
                  }
                </button>
              }
            </div>
          </div>
        }

        <!-- Step 2: Form (Split Layout for Landscape) -->
        @if (step() === 2) {
          <div
            class="h-full flex flex-col md:flex-row animate-fade-in divide-y md:divide-y-0 md:divide-x divide-slate-200"
          >
            <!-- Left: Selected Asset Context (Sidebar-like in landscape) -->
            <div
              class="md:w-1/3 lg:w-1/4 bg-white p-6 flex flex-col justify-center items-center text-center shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10"
            >
              <div
                class="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center mb-6"
              >
                <i class="fas fa-truck-moving text-4xl text-slate-700"></i>
              </div>

              <h3 class="text-4xl font-black text-slate-800 tracking-tight">{{ selectedId() }}</h3>
              <span
                class="inline-block mt-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest border border-red-100"
              >
                Reportando Falla
              </span>

              <div class="mt-auto w-full pt-8">
                <button
                  (click)="step.set(1)"
                  class="w-full px-6 py-3 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 hover:text-slate-800 transition flex items-center justify-center gap-2 group"
                >
                  <i class="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                  Cambiar Unidad
                </button>
              </div>
            </div>

            <!-- Right: Form Controls -->
            <div
              class="flex-1 bg-[#f8fafc] p-6 md:p-8 overflow-y-auto custom-scroll flex flex-col h-full"
            >
              <!-- Category Grid -->
              <div class="mb-6 shrink-0">
                <label
                  class="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-3 px-1"
                >
                  <span
                    class="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]"
                    >1</span
                  >
                  Selecciona el Sistema Afectado
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  @for (cat of categories; track cat.name) {
                    <button
                      (click)="category.set(cat.name)"
                      [class]="getCategoryClass(cat.name)"
                      class="p-2 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 h-24 hover:shadow-lg"
                    >
                      <i [class]="'fas ' + cat.icon + ' text-2xl mb-1'"></i>
                      <span class="text-[10px] font-bold uppercase leading-tight text-center">{{
                        cat.name
                      }}</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Notes Area (Flex grow to fill space) -->
              <div class="mb-6 flex-1 min-h-[120px] flex flex-col">
                <label
                  class="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-3 px-1"
                >
                  <span
                    class="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]"
                    >2</span
                  >
                  Detalles Adicionales (Opcional)
                </label>
                <textarea
                  [(ngModel)]="notes"
                  class="w-full flex-1 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ce1126]/20 focus:border-[#ce1126] outline-none resize-none text-sm transition-shadow shadow-sm placeholder:text-slate-300"
                  placeholder="Ej: Ruidos extraños al elevar la carga..."
                ></textarea>
              </div>

              <!-- Submit Action -->
              <button
                (click)="submitReport()"
                [disabled]="!category()"
                class="w-full py-4 bg-gradient-to-r from-[#ce1126] to-[#a30d1d] hover:from-[#a30d1d] hover:to-[#8a0b18] disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-red-900/20 hover:shadow-red-900/40 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none"
              >
                <span>ENVIAR REPORTE</span>
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  ]
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
    if (asset?.status.name === 'Taller') return;
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
      reporta: 'Operador Móvil',
      estatus: 'Abierta'
    });

    alert('Reporte enviado exitosamente. Toyota ha sido notificado.');
    this.step.set(1);
    this.category.set('');
    this.notes = '';
    this.selectedId.set('');
  }

  getCategoryClass(name: string) {
    if (this.category() === name) {
      return 'bg-gradient-to-br from-[#ce1126] to-[#a30d1d] border-transparent text-white shadow-lg shadow-red-900/30 scale-105 z-10';
    }
    return 'bg-white border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600';
  }
}
