import { Component, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-service-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-orange-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
          <i
            class="fas fa-wrench absolute -right-4 -bottom-4 text-8xl text-orange-700 opacity-50"
          ></i>
          <p class="text-xs uppercase font-bold text-orange-100">Unidades en Taller</p>
          <p class="text-4xl font-black mt-2">{{ openFailures().length }}</p>
        </div>

        <div
          class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center"
        >
          <p class="text-xs uppercase font-bold text-slate-400">Refacciones Pendientes</p>
          <p class="text-3xl font-black text-slate-700 mt-1">{{ pendingParts() }}</p>
        </div>

        <div
          class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center"
        >
          <p class="text-xs uppercase font-bold text-slate-400">Prioridad Alta</p>
          <p class="text-3xl font-black text-red-500 mt-1">{{ criticalCount() }}</p>
        </div>
      </div>

      <!-- Main Content -->
      <div
        class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]"
      >
        <div class="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 class="font-bold text-slate-700 uppercase tracking-wide text-sm">
            Órdenes de Trabajo Activas
          </h3>
        </div>

        <div class="divide-y divide-slate-100">
          @for (f of openFailures(); track f.id) {
            <div class="p-6 hover:bg-slate-50 transition-colors">
              <!-- Top Row: ID + Status -->
              <div
                class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-lg"
                  >
                    {{ f.economico.slice(-3) }}
                  </div>
                  <div>
                    <h4 class="font-black text-xl text-slate-800">{{ f.economico }}</h4>
                    <p class="text-xs text-slate-500">{{ f.fechaIngreso | date: 'medium' }}</p>
                  </div>
                </div>

                <div class="flex gap-2">
                  <span
                    [class]="
                      'px-3 py-1 rounded text-xs font-bold uppercase ' +
                      (f.prioridad === 'Alta'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-600')
                    "
                  >
                    {{ f.prioridad }}
                  </span>
                  <span
                    class="px-3 py-1 rounded text-xs font-bold uppercase bg-blue-100 text-blue-700"
                  >
                    {{ f.estatus }}
                  </span>
                </div>
              </div>

              <!-- Diagnosis & Form -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left: Diagnosis -->
                <div class="lg:col-span-1">
                  <p class="text-xs font-bold text-slate-400 uppercase mb-2">
                    Diagnóstico Reportado
                  </p>
                  <div
                    class="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-700 font-medium"
                  >
                    {{ f.falla }}
                  </div>
                  <div class="mt-4">
                    <p class="text-xs font-bold text-slate-400 uppercase mb-2">Historial Técnico</p>
                    <div class="space-y-2 max-h-32 overflow-y-auto custom-scroll text-xs">
                      @for (msg of f.seguimiento; track msg.fecha) {
                        <div class="p-2 rounded bg-slate-50 border border-slate-100">
                          <span class="font-bold text-orange-600">{{ msg.usuario }}:</span>
                          {{ msg.mensaje }}
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Middle: Logistics -->
                <div class="lg:col-span-2 bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h5 class="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <i class="fas fa-box-open"></i> Logística de Refacciones
                  </h5>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label class="text-xs font-bold text-slate-400 uppercase"
                        >Orden de Compra (PO)</label
                      >
                      <input
                        type="text"
                        #po
                        [value]="f.ordenCompra || ''"
                        class="w-full mt-1 p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label class="text-xs font-bold text-slate-400 uppercase"
                        >Estatus Refacción</label
                      >
                      <select
                        #status
                        [value]="f.estatusRefaccion || 'N/A'"
                        class="w-full mt-1 p-2 rounded border border-slate-300 text-sm bg-white"
                      >
                        <option value="N/A">N/A (Solo Mano de Obra)</option>
                        <option value="En Stock">En Stock</option>
                        <option value="Pedida">Pedida a Planta</option>
                        <option value="Por Recibir">En Tránsito</option>
                      </select>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex gap-2 mt-4">
                    <input
                      #note
                      type="text"
                      placeholder="Agregar nota técnica..."
                      class="flex-1 p-2 rounded border border-slate-300 text-sm"
                    />
                    <button
                      (click)="addNote(f.id, note.value); note.value = ''"
                      class="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded text-xs hover:bg-slate-300 transition"
                    >
                      <i class="fas fa-comment"></i>
                    </button>
                  </div>

                  <div class="flex gap-3 mt-4 pt-4 border-t border-slate-200">
                    <button
                      (click)="saveLogistics(f.id, po.value, status.value)"
                      class="flex-1 py-2 bg-slate-800 text-white rounded font-bold text-xs uppercase hover:bg-slate-900 transition"
                    >
                      Guardar Cambios
                    </button>
                    <button
                      (click)="closeTicket(f.id)"
                      class="px-6 py-2 bg-green-600 text-white rounded font-bold text-xs uppercase hover:bg-green-700 transition"
                    >
                      Liberar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          } @empty {
            <div class="py-20 text-center">
              <div
                class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 text-slate-300 mb-4"
              >
                <i class="fas fa-check text-4xl"></i>
              </div>
              <h3 class="font-bold text-slate-600">Todo limpio</h3>
              <p class="text-slate-400 text-sm">No hay unidades pendientes en taller.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ServicePanelComponent {
  dataService = inject(DataService);

  openFailures = this.dataService.forkliftFailures;

  pendingParts = computed(
    () => this.dataService.forkliftFailures().filter(f => f.estatusRefaccion === 'Pedida').length
  );

  criticalCount = computed(
    () =>
      this.dataService
        .forkliftFailures()
        .filter(f => f.prioridad === 'Alta' && f.estatus !== 'Cerrada').length
  );

  saveLogistics(id: string, po: string, status: any) {
    this.dataService.updateToyotaLogistics(id, po, status);
  }

  addNote(id: string, note: string) {
    if (!note) return;
    this.dataService.addFailureUpdate(id, note, 'Toyota Tech');
  }

  closeTicket(id: string) {
    if (confirm('¿Confirmar liberación de equipo?')) {
      this.dataService.closeLiveFailure(id);
    }
  }
}
