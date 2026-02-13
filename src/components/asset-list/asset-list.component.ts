import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Asset } from '../../types';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="space-y-6">
      <!-- Summary Header -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs text-slate-500 uppercase font-bold">Total Flota</p>
          <p class="text-2xl font-black text-slate-800">{{ stats().total }}</p>
        </div>
        <div class="bg-white p-4 rounded-xl border-l-4 border-emerald-500 shadow-sm">
          <p class="text-xs text-slate-500 uppercase font-bold">Operativos</p>
          <p class="text-2xl font-black text-emerald-600">{{ stats().operative }}</p>
        </div>
        <div class="bg-white p-4 rounded-xl border-l-4 border-red-500 shadow-sm">
          <p class="text-xs text-slate-500 uppercase font-bold">En Taller</p>
          <p class="text-2xl font-black text-red-600">{{ stats().maintenance }}</p>
        </div>
        <div class="bg-white p-4 rounded-xl border-l-4 border-amber-500 shadow-sm">
          <p class="text-xs text-slate-500 uppercase font-bold">Preventivo</p>
          <p class="text-2xl font-black text-amber-600">{{ stats().preventive }}</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div
        class="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
      >
        <h2 class="font-bold text-slate-700">Inventario Detallado</h2>
        <div class="relative w-full md:w-64">
          <i class="fas fa-search absolute left-3 top-3 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Buscar por ID, Serie o Marca..."
            (input)="filter.set($any($event.target).value)"
            class="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead
              class="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-200"
            >
              <tr>
                <th class="p-4">ID Economico</th>
                <th class="p-4">Detalles</th>
                <th class="p-4">Ubicación</th>
                <th class="p-4">Estatus Actual</th>
                <th class="p-4">Supervisor</th>
                <th class="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (asset of filteredAssets(); track asset.id) {
                <tr
                  class="transition-colors group cursor-pointer border-l-4"
                  [class.hover:bg-slate-50]="!isCriticalMaintenance(asset)"
                  [class.border-transparent]="!isCriticalMaintenance(asset)"
                  [class.border-red-500]="isCriticalMaintenance(asset)"
                  [class.bg-red-50]="isCriticalMaintenance(asset)"
                  (click)="selectAsset(asset)"
                >
                  <td class="p-4 font-black text-slate-800">
                    {{ asset.id }}
                    @if (isCriticalMaintenance(asset)) {
                      <div
                        class="mt-1 inline-flex items-center gap-1 text-[9px] uppercase font-bold text-red-600 animate-pulse"
                      >
                        <i class="fas fa-clock"></i> > 48h
                      </div>
                    }
                  </td>
                  <td class="p-4">
                    <div class="font-bold text-slate-700">{{ asset.brand }} {{ asset.model }}</div>
                    <div class="text-xs text-slate-400 font-mono">SN: {{ asset.serial }}</div>
                  </td>
                  <td class="p-4 text-slate-600">
                    <i class="fas fa-map-marker-alt text-slate-300 mr-1"></i> {{ asset.location }}
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <span
                        [class]="
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ' +
                          asset.status.color
                        "
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                        {{ asset.status.name }}
                      </span>
                      @if (isCriticalMaintenance(asset)) {
                        <i
                          class="fas fa-exclamation-triangle text-red-500 text-sm animate-bounce"
                          title="Atención requerida: Tiempo excedido"
                        ></i>
                      }
                    </div>
                    @if (asset.status.name !== 'Operativo') {
                      <div class="text-[10px] text-slate-400 mt-1 pl-1">
                        Desde: {{ asset.statusSince | date: 'dd MMM HH:mm' }}
                      </div>
                    }
                  </td>
                  <td class="p-4 text-slate-600 text-xs">
                    {{ asset.supervisor || 'N/A' }}
                  </td>
                  <td class="p-4 text-right">
                    <button
                      class="text-slate-400 hover:text-blue-600 group-hover:translate-x-1 transition-transform"
                    >
                      <i class="fas fa-arrow-right"></i>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="p-8 text-center text-slate-400 italic">
                    No se encontraron activos.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AssetListComponent {
  dataService = inject(DataService);
  filter = signal('');

  filteredAssets = computed(() => {
    const text = this.filter().toLowerCase();
    return this.dataService
      .assets()
      .filter(
        a =>
          a.id.toLowerCase().includes(text) ||
          a.brand.toLowerCase().includes(text) ||
          a.serial.toLowerCase().includes(text)
      );
  });

  stats = computed(() => {
    const assets = this.dataService.assets();
    return {
      total: assets.length,
      operative: assets.filter(a => a.status.name === 'Operativo').length,
      maintenance: assets.filter(a => a.status.name === 'Taller').length,
      preventive: assets.filter(a => a.status.name === 'Preventivo').length
    };
  });

  selectAsset(asset: Asset) {
    window.dispatchEvent(new CustomEvent('asset-selected', { detail: asset.id }));
  }

  isCriticalMaintenance(asset: Asset): boolean {
    if (asset.status.name !== 'Taller' || !asset.statusSince) return false;
    const start = new Date(asset.statusSince).getTime();
    const now = new Date().getTime();
    // 48 hours in milliseconds = 48 * 60 * 60 * 1000 = 172,800,000
    return now - start > 172800000;
  }
}
