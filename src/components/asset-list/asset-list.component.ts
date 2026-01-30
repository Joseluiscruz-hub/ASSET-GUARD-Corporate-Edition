
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Asset, MaintenanceTask } from '../../types';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Torre de Control</h2>
          <p class="text-sm text-gray-500">Monitoreo en tiempo real de la flota</p>
        </div>
        
        <div class="flex gap-2">
          <input 
            type="text" 
            placeholder="Buscar ID o Serie..." 
            class="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ce1126] w-full md:w-64"
            (input)="updateFilter($event)"
          >
          <button class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
            <i class="fas fa-filter"></i>
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
              <th class="p-4">ID Economico</th>
              <th class="p-4">Equipo</th>
              <th class="p-4">Serie</th>
              <th class="p-4">Estatus</th>
              <th class="p-4">Tiempo en Estatus</th>
              <th class="p-4">Mantenimiento Programado</th>
              <th class="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            @for (asset of filteredAssets(); track asset.id) {
              <tr 
                class="hover:bg-gray-50 transition cursor-pointer" 
                [class.bg-red-50]="isCriticalDelay(asset)"
                [class.animate-pulse-bg]="isCriticalDelay(asset)"
                [class.border-l-4]="isCriticalDelay(asset)"
                [class.border-[#ce1126]]="isCriticalDelay(asset)"
                (click)="selectAsset(asset)"
              >
                <td class="p-4 font-black text-gray-900">{{ asset.id }}</td>
                <td class="p-4 text-gray-600">
                  <div class="font-bold">{{ asset.brand }}</div>
                  <div class="text-xs">{{ asset.model }}</div>
                </td>
                <td class="p-4 text-gray-500 font-mono text-xs">{{ asset.serial }}</td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <span [class]="'px-3 py-1 rounded-full text-[10px] uppercase font-bold ' + asset.status.color">
                      {{ asset.status.name }}
                    </span>
                    @if (isCriticalDelay(asset)) {
                      <i class="fas fa-exclamation-triangle text-[#ce1126] text-base animate-bounce" title="Atención: Demora Crítica"></i>
                    }
                  </div>
                </td>
                <td class="p-4">
                  <!-- Time Alert Logic: Red text & pulsing icon if Taller > 48h -->
                  <div [class]="'flex items-center ' + getTimeClass(asset)">
                    <i class="fas fa-clock mr-2" [class.animate-pulse]="isCriticalDelay(asset)"></i>
                    {{ getHoursInStatus(asset.statusSince) }} hrs
                  </div>
                  @if (isCriticalDelay(asset)) {
                    <div class="text-[10px] text-[#ce1126] font-bold mt-1 uppercase tracking-wide">
                      ¡Demora Crítica!
                    </div>
                  }
                </td>
                <td class="p-4">
                   @if (getNextTask(asset); as task) {
                     <div class="flex items-start gap-2">
                       <div class="p-2 rounded bg-gray-100 text-gray-500">
                         <i class="fas fa-calendar-alt"></i>
                       </div>
                       <div>
                         <p class="font-bold text-gray-700 text-xs flex items-center gap-1">
                           {{ task.date | date:'dd MMM yyyy' }}
                           @if (task.status === 'Overdue') {
                             <span class="text-[9px] bg-red-100 text-red-600 px-1 rounded uppercase">Vencido</span>
                           }
                         </p>
                         <p class="text-[10px] text-gray-500 uppercase">{{ task.description }}</p>
                       </div>
                     </div>
                   } @else {
                     <span class="text-xs text-gray-400 italic">No programado</span>
                   }
                </td>
                <td class="p-4 text-right">
                  <button class="text-[#ce1126] hover:text-[#a30d1d] font-bold text-xs uppercase tracking-wide" (click)="selectAsset(asset); $event.stopPropagation()">
                    Ver Detalle <i class="fas fa-arrow-right ml-1"></i>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="p-8 text-center text-gray-500">No se encontraron equipos</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    @keyframes pulse-bg {
      0%, 100% { background-color: #fef2f2; }
      50% { background-color: #fee2e2; }
    }
    .animate-pulse-bg {
      animation: pulse-bg 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class AssetListComponent {
  private dataService = inject(DataService);
  
  filterText = signal('');
  
  filteredAssets = computed(() => {
    const text = this.filterText().toLowerCase();
    const assets = this.dataService.assets().filter(a => 
      a.id.toLowerCase().includes(text) || 
      a.serial.toLowerCase().includes(text) ||
      a.brand.toLowerCase().includes(text)
    );

    // Sort by Next Maintenance Date (Ascending)
    return [...assets].sort((a, b) => {
      const taskA = this.getNextTask(a);
      const taskB = this.getNextTask(b);

      if (!taskA && !taskB) return 0;
      if (!taskA) return 1; // No task goes to bottom
      if (!taskB) return -1;

      return new Date(taskA.date).getTime() - new Date(taskB.date).getTime();
    });
  });

  selectAsset(asset: Asset) {
    window.dispatchEvent(new CustomEvent('asset-selected', { detail: asset.id }));
  }

  updateFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filterText.set(input.value);
  }

  getHoursInStatus(dateStr: string): number {
    const start = new Date(dateStr).getTime();
    const now = new Date().getTime();
    return Math.floor((now - start) / (1000 * 60 * 60));
  }

  isCriticalDelay(asset: Asset): boolean {
    if (asset.status.name !== 'Taller') return false;
    const hours = this.getHoursInStatus(asset.statusSince);
    return hours > 48;
  }

  getTimeClass(asset: Asset): string {
    if (this.isCriticalDelay(asset)) {
      return 'text-[#ce1126] font-bold';
    }
    return 'text-gray-600';
  }

  getNextTask(asset: Asset): MaintenanceTask | undefined {
    if (!asset.maintenanceTasks || asset.maintenanceTasks.length === 0) return undefined;
    
    // Return the earliest Pending or Overdue task
    const pending = asset.maintenanceTasks
      .filter(t => t.status === 'Pending' || t.status === 'Overdue')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    return pending[0];
  }
}
