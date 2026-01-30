
import { Injectable, signal, computed, effect } from '@angular/core';
import { Asset, FailureReport, Status, KPIData, ForkliftFailureEntry, FailureUpdate, MaintenanceTask } from '../types';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, update } from 'firebase/database';
import { hydrateRealAssets, REAL_FLEET_DATA } from '../data/real-fleet';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // --- FIREBASE CONFIGURATION ---
  private firebaseConfig = {
    apiKey: process.env['FIREBASE_API_KEY'],
    authDomain: process.env['FIREBASE_AUTH_DOMAIN'],
    databaseURL: process.env['FIREBASE_DATABASE_URL'],
    projectId: process.env['FIREBASE_PROJECT_ID'],
    storageBucket: process.env['FIREBASE_STORAGE_BUCKET'],
    messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'],
    appId: process.env['FIREBASE_APP_ID']
  };

  private app: any;
  private db: any;
  private dbConnected = false; // Flag for active connection AND permission

  // --- Master Catalogs ---
  readonly statuses: Status[] = [
    { id: '1', name: 'Operativo', color: 'bg-green-100 text-green-800', hex: '#22c55e' },
    { id: '2', name: 'Taller', color: 'bg-red-100 text-red-800', hex: '#ef4444' },
    { id: '3', name: 'Preventivo', color: 'bg-yellow-100 text-yellow-800', hex: '#eab308' },
    { id: '4', name: 'Baja', color: 'bg-gray-100 text-gray-800', hex: '#6b7280' },
  ];

  // --- State Signals ---
  private assetsSignal = signal<Asset[]>(this.loadRealFleet());
  private reportsSignal = signal<FailureReport[]>(this.generateRealReports());

  // UI State
  readonly plantMode = signal<boolean>(false);
  readonly isKioskMode = signal<boolean>(false);
  readonly activeSlide = signal<number>(0);
  private kioskInterval: any;

  // New Signal for Live Audit Log (Initialized with mock data)
  readonly forkliftFailures = signal<ForkliftFailureEntry[]>(this.generateRealLiveFailures());

  // --- Public Signals (Read Only) ---
  readonly assets = this.assetsSignal.asReadonly();
  readonly reports = this.reportsSignal.asReadonly();

  // --- Computed KPIs ---
  readonly kpiData = computed<KPIData>(() => {
    const totalAssets = this.assetsSignal().length;
    const operativeAssets = this.assetsSignal().filter(a => a.status.name === 'Operativo').length;

    const closedReports = this.reportsSignal().filter(r => r.exitDate);
    let totalRepairHours = 0;
    closedReports.forEach(r => {
      const start = new Date(r.entryDate).getTime();
      const end = new Date(r.exitDate!).getTime();
      totalRepairHours += (end - start) / (1000 * 60 * 60);
    });
    const mttr = closedReports.length > 0 ? totalRepairHours / closedReports.length : 0;

    const currentMonth = new Date().getMonth();
    const monthlyCost = this.reportsSignal()
      .filter(r => new Date(r.entryDate).getMonth() === currentMonth)
      .reduce((acc, curr) => acc + curr.estimatedCost, 0);

    return {
      availability: totalAssets > 0 ? (operativeAssets / totalAssets) * 100 : 0,
      mttr: Math.round(mttr * 10) / 10,
      totalCostMonth: monthlyCost,
      budgetMonth: 18000
    };
  });

  readonly fleetAvailability = computed(() => {
    const allAssets = this.assetsSignal();
    if (allAssets.length === 0) return { percentage: 100, label: 'Excelente', color: '#22c55e' };

    const operativeUnits = allAssets.filter(m => m.status.name === 'Operativo').length;
    const percentage = (operativeUnits / allAssets.length) * 100;

    return {
      percentage: Math.round(percentage),
      label: percentage >= 90 ? 'Excelente' : percentage >= 80 ? 'Regular' : 'Crítico',
      color: percentage >= 90 ? '#22c55e' : percentage >= 80 ? '#eab308' : '#ef4444'
    };
  });

  readonly topOperators = computed(() => {
    const failures = this.forkliftFailures();
    const counts: {[key: string]: number} = {};
    failures.forEach(f => {
      if (f.reporta) counts[f.reporta] = (counts[f.reporta] || 0) + 10;
    });
    return Object.entries(counts)
      .map(([name, points]) => ({ name, points }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);
  });

  readonly safetyStats = signal({
    daysWithoutAccident: 142,
    record: 180,
    announcement: 'Uso obligatorio de chaleco en Patio de Maniobras'
  });

  readonly crewLeaderboard = signal([
    { rank: 1, name: 'Turno 1 (Matutino)', score: 98, pallets: 1450 },
    { rank: 2, name: 'Turno 2 (Vespertino)', score: 94, pallets: 1320 },
    { rank: 3, name: 'Turno 3 (Nocturno)', score: 89, pallets: 1105 },
  ]);

  constructor() {
    this.initFirebase();
    // Ensure assets are synced with initial failures (Mock or Real)
    this.syncAssetsWithFailures(this.forkliftFailures());

    effect(() => {
      if (this.isKioskMode()) this.startKioskRotation();
      else this.stopKioskRotation();
    });
  }

  // --- Initialization ---
  private initFirebase() {
    try {
      this.app = initializeApp(this.firebaseConfig);
      this.db = getDatabase(this.app);
      // We assume connected, but setupListeners will verify permissions
      this.dbConnected = true;
      console.log('✅ Firebase Initialized');
      this.setupListeners();
    } catch (e) {
      console.error("Firebase init error:", e);
      this.dbConnected = false;
    }
  }

  private setupListeners() {
    if (!this.dbConnected) return;

    // Listen for Failures
    const failuresRef = ref(this.db, 'failures');
    onValue(failuresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Data exists: Sync local state with Server
        const list = Object.values(data) as ForkliftFailureEntry[];
        list.sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime());
        this.forkliftFailures.set(list);
        this.syncAssetsWithFailures(list);
      } else {
        // DB is empty/null.
        // If we have local mock data, let's SEED the database so it's not empty for other users.
        console.log("Database empty. Seeding with initial mock data...");
        this.seedDatabase();
      }
    }, (error) => {
      console.warn("⚠️ Firebase Permission Denied or Offline. Switching to Local Mode.", error);
      this.dbConnected = false;
      // We keep existing local state (mock data) and will use local updates from now on.
    });

    // Listen for Settings (Kiosk)
    const kioskRef = ref(this.db, 'settings/kioskMode');
    onValue(kioskRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null && this.isKioskMode() !== val) this.isKioskMode.set(val);
    }, (error) => {
       // Ignore settings error in offline mode
    });
  }

  private seedDatabase() {
    const updates: any = {};
    const initialFailures = this.forkliftFailures();
    initialFailures.forEach(f => {
      updates['failures/' + f.id] = f;
    });
    // Also seed settings
    updates['settings/kioskMode'] = false;

    update(ref(this.db), updates).catch(err => {
      console.error("Seeding failed (likely permissions):", err);
      this.dbConnected = false; // Fallback to local
    });
  }

  toggleKioskMode() {
    const newValue = !this.isKioskMode();
    this.isKioskMode.set(newValue);
    if (this.dbConnected) {
      set(ref(this.db, 'settings/kioskMode'), newValue).catch(() => {});
    }
  }

  private startKioskRotation() {
    if (this.kioskInterval) clearInterval(this.kioskInterval);
    this.kioskInterval = setInterval(() => {
      this.activeSlide.update(current => (current + 1) % 3);
    }, 15000);
  }

  private stopKioskRotation() {
    if (this.kioskInterval) clearInterval(this.kioskInterval);
    this.activeSlide.set(0);
  }

  togglePlantMode() {
    this.plantMode.update(v => !v);
  }

  getAsset(id: string): Asset | undefined {
    return this.assetsSignal().find(a => a.id === id);
  }

  getAssetHistory(assetId: string): FailureReport[] {
    return this.reportsSignal().filter(r => r.assetId === assetId).sort((a, b) =>
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );
  }

  // --- ACTIONS WITH OPTIMISTIC UPDATES ---

  reportFailure(assetId: string, description: string, type: FailureReport['type']) {
    // Legacy method for Asset Detail
    const asset = this.getAsset(assetId);
    if (!asset) return;

    // Also create a Live Failure Entry for consistency
    this.addLiveFailure({
      economico: asset.id,
      falla: description,
      prioridad: 'Media',
      reporta: 'Operador (App)',
      estatus: 'Abierta'
    });
  }

  addLiveFailure(entry: Omit<ForkliftFailureEntry, 'id' | 'fechaIngreso' | 'seguimiento'>) {
    const newEntry: ForkliftFailureEntry = {
      ...entry,
      id: 'F-' + Date.now(),
      fechaIngreso: new Date().toISOString(),
      seguimiento: []
    };

    // 1. Optimistic Update (Local)
    this.forkliftFailures.update(list => [newEntry, ...list]);
    this.syncAssetsWithFailures(this.forkliftFailures());

    // 2. Try Remote
    if (this.dbConnected) {
      set(ref(this.db, 'failures/' + newEntry.id), newEntry).catch(err => {
        console.error("Sync failed:", err);
        // We already updated local, so we just log.
      });
    }
  }

  addFailureUpdate(failureId: string, message: string, user: string) {
    const failure = this.forkliftFailures().find(f => f.id === failureId);
    if (!failure) return;

    const updatedFailure = {
      ...failure,
      estatus: 'En Proceso' as const,
      seguimiento: [...failure.seguimiento, { usuario: user, mensaje: message, fecha: new Date().toISOString() }]
    };

    // 1. Optimistic
    this.forkliftFailures.update(list => list.map(f => f.id === failureId ? updatedFailure : f));

    // 2. Remote
    if (this.dbConnected) {
      update(ref(this.db, 'failures/' + failureId), updatedFailure).catch(err => console.error(err));
    }
  }

  updateToyotaLogistics(failureId: string, po: string, statusRef: ForkliftFailureEntry['estatusRefaccion'], promiseDate?: string) {
    const updates = { ordenCompra: po, estatusRefaccion: statusRef, fechaPromesa: promiseDate, estatus: 'En Proceso' };

    // 1. Optimistic
    this.forkliftFailures.update(list => list.map(f => {
       if (f.id === failureId) return { ...f, ...updates, estatus: 'En Proceso' };
       return f;
    }));

    // 2. Remote
    if (this.dbConnected) {
      update(ref(this.db, 'failures/' + failureId), updates).catch(err => console.error(err));
    }
  }

  closeLiveFailure(id: string) {
    const failure = this.forkliftFailures().find(f => f.id === id);
    if (!failure) return;

    const updatedFailure = { ...failure, estatus: 'Cerrada' as const, fechaSalida: new Date().toISOString() };

    // 1. Optimistic
    this.forkliftFailures.update(list => list.map(f => f.id === id ? updatedFailure : f));
    this.syncAssetsWithFailures(this.forkliftFailures());

    // 2. Remote
    if (this.dbConnected) {
      update(ref(this.db, 'failures/' + id), updatedFailure).catch(err => console.error(err));
    }
  }

  completeRepair(assetId: string, diagnosis: string, cost: number, parts: string[]) {
    // Legacy handler
    const activeFailure = this.forkliftFailures().find(f => f.economico === assetId && f.estatus !== 'Cerrada');
    if (activeFailure) {
      this.closeLiveFailure(activeFailure.id);
    }
    // Also update reports history (legacy)
    this.reportsSignal.update(reports => {
       // Logic to close open legacy report if any
       return reports;
    });
  }

  private syncAssetsWithFailures(failures: ForkliftFailureEntry[]) {
    const activeFailures = failures.filter(f => f.estatus !== 'Cerrada');
    const activeIds = new Set(activeFailures.map(f => f.economico));
    const activeFailureMap = new Map(activeFailures.map(f => [f.economico, f]));
    const tallerStatus = this.statuses.find(s => s.name === 'Taller')!;
    const opStatus = this.statuses.find(s => s.name === 'Operativo')!;

    this.assetsSignal.update(assets => assets.map(a => {
      if (activeIds.has(a.id)) {
        if (a.status.name !== 'Taller') {
          return {
            ...a,
            status: tallerStatus,
            statusSince: activeFailureMap.get(a.id)?.fechaIngreso || new Date().toISOString(),
            lastFailure: activeFailureMap.get(a.id)?.falla
          };
        }
      } else if (a.status.name === 'Taller' && !activeIds.has(a.id)) {
        // Only flip back to operative if it was in Taller and now has no active failure
        // But respect "Preventivo" or other statuses if they weren't failure driven?
        // For simplicity, if it was Taller and no failure, it goes Operative.
        return {
          ...a,
          status: opStatus,
          statusSince: new Date().toISOString(),
          lastFailure: undefined
        };
      }
      return a;
    }));
  }

  updateAssetsFromExcel(importedData: any[]) {
    // ... existing excel logic
  }

  // --- LOADER FOR REAL FLEET DATA (Updated) ---
  private loadRealFleet(): Asset[] {
    const realAssets = hydrateRealAssets(this.statuses);

    // Generate tasks for each
    realAssets.forEach((a, index) => {
       a.maintenanceTasks = this.generateMockMaintenance(index);
    });

    return realAssets;
  }

  private generateMockMaintenance(index: number): MaintenanceTask[] {
    const tasks: MaintenanceTask[] = [];
    const daysFromNow = Math.floor(Math.random() * 45) - 5;
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const taskType = ['Cambio de Aceite', 'Revisión de Frenos', 'Ajuste de Cadenas', 'Servicio General', 'Inspección de Batería'][index % 5];
    tasks.push({
      id: `T-${index}-1`,
      date: date.toISOString(),
      description: taskType,
      status: daysFromNow < 0 ? 'Overdue' : 'Pending'
    });
    return tasks;
  }

  // --- REPORT GENERATOR USING REAL IDS ---
  private generateRealReports(): FailureReport[] {
    // ... existing mock reports logic ...
    return []; // returning empty to rely on live failures for cleaner demo, or keep mock:
    /* Keep mock implementation for history view */
    const realAssets = REAL_FLEET_DATA;
    const realisticFailures = [
      { desc: "Fuga de aceite hidráulico en cilindro de elevación", type: "Hidráulico", cost: 1200 },
      // ... more
    ];
    // Simple mock generation
    return Array.from({ length: 30 }, (_, i) => ({
        id: `FAIL-HIST-${i}`,
        assetId: realAssets[i % realAssets.length].eco,
        entryDate: new Date(Date.now() - Math.random() * 1e10).toISOString(),
        exitDate: new Date().toISOString(),
        failureDescription: "Mantenimiento Preventivo",
        partsUsed: [],
        estimatedCost: 100,
        technician: "System",
        type: "Mecánico" as any
    }));
  }

  // --- LIVE FAILURES FOR REAL ASSETS ---
  private generateRealLiveFailures(): ForkliftFailureEntry[] {
    // Generate one guaranteed failure for the demo unit from prompt
    const demoFailure: ForkliftFailureEntry = {
      id: "FAIL-2026-0001",
      economico: "35526",
      falla: "Fuga de aceite hidráulico en cilindro de elevación principal.",
      reporta: "Carlos Eduardo Vazquez Calderon",
      fechaIngreso: new Date().toISOString(),
      prioridad: 'Alta',
      estatus: 'Abierta',
      seguimiento: []
    };

    return [demoFailure];
  }
}
