import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-5xl mx-auto">
      <!-- Header -->
      <div class="mb-8 border-b border-gray-100 pb-4">
        <h2 class="text-3xl font-black text-gray-800 tracking-tight">Panel de Administración</h2>
        <p class="text-gray-500">Gestión de fallas en vivo, control de pantallas y reportes IA.</p>
      </div>

      <!-- SECTION 0: MASTER CONTROL (KIOSK REMOTE) -->
      <div
        class="bg-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in relative overflow-hidden"
      >
        <!-- Decorative Background -->
        <div class="absolute -right-6 -top-6 text-indigo-100 opacity-50">
          <i class="fas fa-broadcast-tower text-9xl"></i>
        </div>

        <div class="relative z-10">
          <h3 class="text-xl font-bold text-indigo-900 flex items-center gap-2">
            <span class="bg-indigo-600 text-white p-1.5 rounded-lg text-xs shadow-md"
              ><i class="fas fa-desktop"></i
            ></span>
            Control Maestro de Pantallas
          </h3>
          <p class="text-sm text-indigo-700 mt-1 max-w-lg">
            Activa remotamente el <strong>Modo Quiosco</strong> en las Smart TVs de la planta. Esto
            iniciará la rotación automática de KPIs, Mejores Tripulaciones y Seguridad.
          </p>
        </div>

        <div
          class="flex items-center gap-4 relative z-10 bg-white px-6 py-3 rounded-2xl shadow-sm border border-indigo-100"
        >
          <div class="text-right">
            <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Estatus Transmisión
            </p>
            <p
              class="text-sm font-black transition-colors"
              [class.text-green-500]="isKioskMode()"
              [class.text-gray-400]="!isKioskMode()"
            >
              {{ isKioskMode() ? 'EN VIVO (ON AIR)' : 'OFFLINE' }}
            </p>
          </div>

          <button
            (click)="toggleKiosk()"
            class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
            [class.bg-indigo-600]="isKioskMode()"
            [class.bg-gray-300]="!isKioskMode()"
          >
            <span
              class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md"
              [class.translate-x-7]="isKioskMode()"
              [class.translate-x-1]="!isKioskMode()"
            ></span>
          </button>
        </div>
      </div>

      <!-- SECTION 1: AI EXECUTIVE CENTER -->
      <div
        class="bg-gradient-to-r from-gray-900 to-slate-800 rounded-xl p-6 text-white shadow-xl mb-8 relative overflow-hidden"
      >
        <div class="absolute top-0 right-0 p-8 opacity-10">
          <i class="fas fa-brain text-9xl text-white"></i>
        </div>

        <div class="relative z-10">
          <h3 class="text-xl font-bold flex items-center gap-2 mb-2">
            <span class="bg-[#ce1126] p-1.5 rounded text-xs"
              ><i class="fas fa-robot"></i> GEMINI 2.0</span
            >
            Centro de Inteligencia
          </h3>
          <p class="text-gray-400 text-sm mb-6 max-w-2xl">
            Genera un resumen ejecutivo instantáneo analizando KPIs, fallas activas y tiempos de
            respuesta para la junta diaria.
          </p>

          @if (!aiReport()) {
            <button
              (click)="generateDailyReport()"
              [disabled]="isAnalyzing()"
              class="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold shadow hover:bg-gray-100 transition flex items-center gap-2 disabled:opacity-50"
            >
              @if (isAnalyzing()) {
                <i class="fas fa-circle-notch fa-spin"></i> Analizando Flota...
              } @else {
                <i class="fas fa-magic"></i> Generar Reporte Diario
              }
            </button>
          } @else {
            <div
              class="bg-white/10 rounded-lg p-6 border border-white/10 backdrop-blur-sm animate-fade-in"
            >
              <div class="prose prose-invert prose-sm max-w-none" [innerHTML]="aiReport()"></div>
              <div class="mt-4 flex gap-3">
                <button
                  (click)="aiReport.set(null)"
                  class="text-gray-400 hover:text-white text-xs font-bold underline"
                >
                  Cerrar
                </button>
                <button
                  (click)="copyReport()"
                  class="text-[#ce1126] hover:text-red-400 text-xs font-bold uppercase"
                >
                  <i class="fas fa-copy mr-1"></i> Copiar
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- SECTION 2: LIVE FAILURE INPUT -->
      <div
        class="bg-white p-6 rounded-xl shadow-lg mb-8 border-t-4 border-[#ce1126] border border-gray-100"
      >
        <h3 class="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
          <span class="text-[#ce1126]"><i class="fas fa-broadcast-tower"></i></span> Registro de
          Falla (Torre de Control)
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1"
              >Unidad (ID)</label
            >
            <input
              [(ngModel)]="failureForm.economico"
              type="text"
              class="w-full p-2.5 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-[#ce1126] focus:outline-none"
              placeholder="Ej: M-105"
            />
          </div>

          <div class="lg:col-span-2">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1"
              >Descripción de Falla</label
            >
            <input
              [(ngModel)]="failureForm.falla"
              type="text"
              class="w-full p-2.5 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-[#ce1126] focus:outline-none"
              placeholder="Describe el problema..."
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1"
              >Prioridad</label
            >
            <select
              [(ngModel)]="failureForm.prioridad"
              class="w-full p-2.5 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-[#ce1126] focus:outline-none bg-white"
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta (Crítica)</option>
            </select>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <div class="w-1/3">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1"
              >Reporta</label
            >
            <input
              [(ngModel)]="failureForm.reporta"
              type="text"
              class="w-full p-2.5 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-[#ce1126] focus:outline-none"
              placeholder="Nombre Supervisor"
            />
          </div>
          <button
            (click)="registerFailure()"
            class="bg-[#ce1126] hover:bg-[#a30d1d] text-white px-8 py-3 rounded-lg font-bold shadow-md transition transform hover:scale-105 flex items-center gap-2"
          >
            <i class="fas fa-paper-plane"></i> ENVIAR ALERTA
          </button>
        </div>
      </div>

      <!-- SECTION 3: DATA MANAGEMENT -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Import -->
        <div class="p-6 border border-gray-200 rounded-xl bg-gray-50">
          <h3 class="font-bold text-gray-700 mb-2">
            <i class="fas fa-file-excel text-green-600 mr-2"></i> Importación Masiva
          </h3>
          <p class="text-xs text-gray-500 mb-4">
            Carga tu inventario o estatus desde Excel (.xlsx)
          </p>
          <input
            type="file"
            (change)="handleFileInput($event)"
            accept=".xlsx, .xls"
            class="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-green-50 file:text-green-700
            hover:file:bg-green-100 mb-2 cursor-pointer
          "
          />
          <p class="text-[10px] text-gray-400 italic">
            Columnas requeridas: Economico, Marca, Modelo, Estatus
          </p>
        </div>

        <!-- Export -->
        <div class="p-6 border border-gray-200 rounded-xl bg-gray-50">
          <h3 class="font-bold text-gray-700 mb-2">
            <i class="fas fa-download text-blue-600 mr-2"></i> Exportar Datos
          </h3>
          <p class="text-xs text-gray-500 mb-4">Descarga el reporte completo de KPIs y Fallas.</p>
          <button
            (click)="exportData()"
            class="w-full py-2 bg-white border border-gray-300 rounded text-gray-700 font-bold text-sm hover:bg-gray-100 transition"
          >
            Descargar Excel
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  ]
})
export class AdminComponent {
  private dataService = inject(DataService);
  private geminiService = inject(GeminiService);
  private sanitizer = inject(DomSanitizer);

  // Form State
  failureForm = {
    economico: '',
    falla: '',
    prioridad: 'Media' as 'Alta' | 'Media' | 'Baja',
    reporta: ''
  };

  // AI State
  isAnalyzing = signal(false);
  aiReport = signal<string | null>(null);

  // KIOSK REMOTE STATE
  isKioskMode = this.dataService.isKioskMode;

  // --- Methods ---

  toggleKiosk() {
    this.dataService.toggleKioskMode();
  }

  registerFailure() {
    if (!this.failureForm.economico || !this.failureForm.falla) {
      alert('Por favor complete los datos de la unidad y la falla.');
      return;
    }

    this.dataService.addLiveFailure({
      economico: this.failureForm.economico.toUpperCase(),
      falla: this.failureForm.falla,
      prioridad: this.failureForm.prioridad,
      reporta: this.failureForm.reporta || 'NOC Admin',
      estatus: 'Abierta'
    });

    this.failureForm = {
      economico: '',
      falla: '',
      prioridad: 'Media',
      reporta: ''
    };
  }

  async generateDailyReport() {
    this.isAnalyzing.set(true);

    const fleetData = this.dataService.fleetAvailability();
    const activeFailures = this.dataService.forkliftFailures().filter(f => f.estatus !== 'Cerrada');
    const history = this.dataService.forkliftFailures().slice(0, 10);

    const reportHtml = await this.geminiService.generateDailySummary(
      fleetData,
      activeFailures,
      history
    );

    this.aiReport.set(reportHtml);
    this.isAnalyzing.set(false);
  }

  copyReport() {
    if (this.aiReport()) {
      const el = document.createElement('div');
      el.innerHTML = this.aiReport()!;

      const blob = new Blob([el.innerText], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/plain': blob });
      navigator.clipboard.write([item]).then(() => alert('Reporte copiado al portapapeles!'));
    }
  }

  // --- Excel Import/Export using ExcelJS ---

  async handleFileInput(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Excel import functionality requires xlsx library
    // Commented out for now - can be enabled when xlsx is properly configured
    /*
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(e.target.result);
        const worksheet = workbook.worksheets[0];
        const data: any[] = [];

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            data.push({
              Economico: row.getCell(1).value,
              Marca: row.getCell(2).value,
              Modelo: row.getCell(3).value,
              Estatus: row.getCell(4).value
            });
          }
        });

        this.dataService.updateAssetsFromExcel(data);
        alert(`Se procesaron ${data.length} registros exitosamente.`);
      } catch (error) {
        alert('Error al procesar el archivo Excel.');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    */
  }

  async exportData() {
    const failures = this.dataService.forkliftFailures().map(f => ({
      ID: f.id,
      Unidad: f.economico,
      Falla: f.falla,
      Prioridad: f.prioridad,
      Estatus: f.estatus,
      Reporto: f.reporta,
      FechaIngreso: f.fechaIngreso,
      FechaCierre: f.fechaSalida || '-'
    }));

    const assets = this.dataService.assets().map(a => ({
      Economico: a.id,
      Marca: a.brand,
      Modelo: a.model,
      Serie: a.serial,
      Estatus: a.status.name,
      Desde: a.statusSince
    }));

    // Create workbook with ExcelJS (dynamic import to avoid bundling CommonJS at startup)
    const excelMod = await import('exceljs');
    const ExcelJSLib: any = excelMod && (excelMod.default ?? excelMod);
    const workbook = new ExcelJSLib.Workbook();

    // Assets sheet
    const wsAssets = workbook.addWorksheet('Inventario');
    if (assets.length > 0) {
      wsAssets.columns = Object.keys(assets[0]).map(key => ({ header: key, key }));
      assets.forEach(row => wsAssets.addRow(row));
    }

    // Failures sheet
    const wsFailures = workbook.addWorksheet('Reporte de Fallas');
    if (failures.length > 0) {
      wsFailures.columns = Object.keys(failures[0]).map(key => ({ header: key, key }));
      failures.forEach(row => wsFailures.addRow(row));
    }

    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AssetGuard_Reporte_${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
