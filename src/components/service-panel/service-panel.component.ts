
import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-service-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  template: `
    <div class="bg-slate-50 min-h-screen p-4 md:p-8 font-sans">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 class="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
            <i class="fas fa-tools text-orange-600"></i> GESTIÓN TÉCNICA TOYOTA
          </h2>
          <p class="text-slate-500 font-medium">Control de Taller y Refaccionamiento</p>
        </div>
        <div class="flex gap-4 mt-4 md:mt-0">
           <div class="bg-white p-3 rounded-xl shadow-sm border border-slate-200 text-center min-w-[120px]">
              <p class="text-[10px] text-slate-400 uppercase font-bold">Refacciones Pendientes</p>
              <p class="text-2xl font-black text-orange-500 leading-none mt-1">
                {{ countWaitingParts() }}
              </p>
           </div>
        </div>
      </div>

      <!-- Horizontal List Container -->
      <div class="flex flex-col gap-6 max-w-6xl mx-auto">
        @for (f of dataService.forkliftFailures(); track f.id) {
          @if (f.estatus !== 'Cerrada') {
            <!-- Horizontal Card -->
            <div class="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-200 flex flex-col md:flex-row group transition-all hover:shadow-xl">
              
              <!-- Left: Asset Info (Dark) -->
              <div class="p-6 md:w-1/3 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
                <!-- Background Decoration -->
                <div class="absolute top-0 right-0 p-8 opacity-5 transform translate-x-1/2 -translate-y-1/2">
                   <i class="fas fa-truck-loading text-9xl"></i>
                </div>

                <div>
                  <div class="flex justify-between items-start mb-4 relative z-10">
                    <span class="text-4xl font-black text-orange-500 tracking-tighter">{{ f.economico }}</span>
                    <span [class]="'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ' + 
                      (f.prioridad === 'Alta' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300')">
                      {{ f.prioridad }}
                    </span>
                  </div>
                  
                  <div class="mb-4 relative z-10">
                     <p class="text-[10px] text-slate-400 uppercase font-bold mb-1">Diagnóstico Inicial</p>
                     <p class="text-lg font-medium leading-tight text-slate-100">{{ f.falla }}</p>
                  </div>

                  <div class="flex flex-col gap-1 text-xs text-slate-500 relative z-10">
                    <div class="flex items-center gap-2">
                       <i class="fas fa-user-circle"></i> {{ f.reporta }}
                    </div>
                    <div class="flex items-center gap-2">
                       <i class="fas fa-clock"></i> {{ f.fechaIngreso | date:'dd/MM HH:mm' }}
                    </div>
                  </div>
                </div>
                
                <!-- Chat Quick View -->
                <div class="mt-6 pt-4 border-t border-slate-700 relative z-10">
                   <div class="max-h-24 overflow-y-auto custom-scroll space-y-2 text-xs">
                     @if (f.seguimiento.length === 0) {
                        <p class="text-slate-600 italic">Sin notas técnicas.</p>
                     }
                     @for (msg of f.seguimiento; track msg.fecha) {
                       <div>
                         <span class="font-bold text-orange-500">{{ msg.usuario }}:</span>
                         <span class="text-slate-400 ml-1">{{ msg.mensaje }}</span>
                       </div>
                     }
                   </div>
                </div>
              </div>

              <!-- Right: Management Form (Light) -->
              <div class="p-6 md:w-2/3 flex flex-col justify-between">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  
                  <!-- PO Field -->
                  <div>
                    <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Orden de Compra (PO)</label>
                    <div class="relative">
                      <i class="fas fa-file-invoice absolute left-3 top-3 text-slate-300"></i>
                      <input type="text" 
                             [value]="f.ordenCompra || ''"
                             #poInput
                             placeholder="Pendiente..."
                             class="w-full pl-9 p-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 transition-all">
                    </div>
                  </div>

                  <!-- Parts Status -->
                  <div>
                    <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Estatus Refacción</label>
                    <select #statusInput
                            [value]="f.estatusRefaccion || 'N/A'"
                            class="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer">
                      <option value="N/A">N/A (Mano de Obra)</option>
                      <option value="En Stock">En Stock (Almacén)</option>
                      <option value="Pedida">Pedida (Backlog)</option>
                      <option value="Por Recibir">En Tránsito</option>
                    </select>
                  </div>

                  <!-- Promise Date (NEW) -->
                  <div>
                    <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Fecha Promesa</label>
                    <input type="date"
                           [value]="f.fechaPromesa ? (f.fechaPromesa | date:'yyyy-MM-dd') : ''"
                           #dateInput
                           class="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 transition-all">
                  </div>

                  <!-- Quick Note Input -->
                  <div>
                    <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Agregar Nota Técnica</label>
                    <div class="flex gap-2">
                       <input #noteInput type="text" 
                              placeholder="Avance..."
                              (keyup.enter)="enviarAvance(f.id, noteInput.value); noteInput.value=''"
                              class="flex-1 p-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-500">
                       <button (click)="enviarAvance(f.id, noteInput.value); noteInput.value=''"
                               class="bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl px-3 transition-colors">
                         <i class="fas fa-paper-plane"></i>
                       </button>
                    </div>
                  </div>

                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col md:flex-row gap-3 pt-4 border-t border-slate-100">
                   <button (click)="updateLogistics(f.id, poInput.value, statusInput.value, dateInput.value)"
                           class="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                      <i class="fas fa-save"></i> GUARDAR AVANCE
                   </button>
                   
                   <button (click)="closeFailureReport(f.id)" 
                           class="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                      <i class="fas fa-check-circle"></i> FINALIZAR & LIBERAR
                   </button>
                </div>

              </div>
            </div>
          }
        } @empty {
           <div class="py-20 flex flex-col items-center justify-center text-slate-400">
             <div class="bg-white p-8 rounded-full shadow-sm mb-4">
                <i class="fas fa-clipboard-check text-6xl text-green-200"></i>
             </div>
             <p class="text-xl font-bold text-slate-600">Todo al día</p>
             <p class="text-sm">No hay unidades reportadas en taller.</p>
           </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-track { background: #0f172a; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
  `]
})
export class ServicePanelComponent {
  dataService = inject(DataService);

  countWaitingParts() {
    return this.dataService.forkliftFailures()
      .filter(f => f.estatusRefaccion === 'Pedida' || f.estatusRefaccion === 'Por Recibir').length;
  }

  updateLogistics(id: string, po: string, status: any, date: string) {
    this.dataService.updateToyotaLogistics(id, po, status, date);
    alert('Información técnica actualizada.');
  }

  enviarAvance(id: string, msg: string) {
    if (!msg.trim()) return;
    this.dataService.addFailureUpdate(id, msg, 'Toyota');
  }

  closeFailureReport(id: string) {
    if(confirm('¿Confirmar que la unidad está operativa y lista para producción?')) {
      this.dataService.closeLiveFailure(id);
    }
  }
}
