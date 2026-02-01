
import { Injectable, signal, computed, effect } from '@angular/core';
import { Asset, FailureReport, Status, KPIData, ForkliftFailureEntry, FailureUpdate, MaintenanceTask } from '../types';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, update, onDisconnect, goOffline, goOnline } from 'firebase/database';
import { hydrateRealAssets, REAL_FLEET_DATA } from '../data/real-fleet';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  // --- FIREBASE CONFIGURATION ---
  private firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
  };

  private app: any;
  private db: any;
  
  // --- System State Signals ---
  readonly connectionStatus = signal<'online' | 'offline' | 'syncing'>('syncing');
  readonly lastUpdate = signal<Date>(new Date());
  readonly plantMode = signal<boolean>(false); // Dark/Light Theme
  readonly isKioskMode = signal<boolean>(false);
  readonly activeSlide = signal<number>(0); 
  private kioskInterval: any;

  // --- Master Catalogs ---
  readonly statuses: Status[] = [
    { id: '1', name: 'Operativo', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', hex: '#10b981' },
    { id: '2', name: 'Taller', color: 'bg-red-100 text-red-800 border-red-200', hex: '#ef4444' },
    { id: '3', name: 'Preventivo', color: 'bg-amber-100 text-amber-800 border-amber-200', hex: '#f59e0b' },
    { id: '4', name: 'Baja', color: 'bg-slate-100 text-slate-800 border-slate-200', hex: '#64748b' },
  ];

  // --- Business Data Signals ---
  private assetsSignal = signal<Asset[]>(this.loadRealFleet());
  private reportsSignal = signal<FailureReport[]>(this.generateRealReports());
  readonly forkliftFailures = signal<ForkliftFailureEntry[]>(this.generateRealLiveFailures());

  // --- Public Read-Only Signals ---
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
    if (allAssets.length === 0) return { percentage: 100, label: 'Excelente', color: '#10b981' };

    const operativeUnits = allAssets.filter(m => m.status.name === 'Operativo').length;
    const percentage = (operativeUnits / allAssets.length) * 100;
    
    return {
      percentage: Math.round(percentage),
      label: percentage >= 90 ? 'Excelente' : percentage >= 80 ? 'Regular' : 'Crítico',
      color: percentage >= 90 ? '#10b981' : percentage >= 80 ? '#f59e0b' : '#ef4444'
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
    announcement: 'Uso obligatorio de EPP en Patio de Maniobras'
  });

  readonly crewLeaderboard = signal([
    { rank: 1, name: 'Turno 1 (Matutino)', score: 98, pallets: 1450 },
    { rank: 2, name: 'Turno 2 (Vespertino)', score: 94, pallets: 1320 },
    { rank: 3, name: 'Turno 3 (Nocturno)', score: 89, pallets: 1105 },
  ]);

  constructor() {
    this.initFirebase();
    this.syncAssetsWithFailures(this.forkliftFailures());
    
    effect(() => {
      if (this.isKioskMode()) this.startKioskRotation();
      else this.stopKioskRotation();
    });

    // Connectivity Listeners
    window.addEventListener('online', () => this.updateConnectionStatus());
    window.addEventListener('offline', () => this.updateConnectionStatus());
  }

  // --- Initialization ---
  private initFirebase() {
    try {
      this.app = initializeApp(this.firebaseConfig);
      this.db = getDatabase(this.app);
      
      // Monitor connection state
      const connectedRef = ref(this.db, '.info/connected');
      onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          this.connectionStatus.set('online');
        } else {
          this.connectionStatus.set('offline');
        }
      });

      this.setupListeners();
    } catch (e) {
      console.error("Firebase init error:", e);
      this.connectionStatus.set('offline');
    }
  }

  private updateConnectionStatus() {
     this.connectionStatus.set(navigator.onLine ? 'online' : 'offline');
  }

  private setupListeners() {
    // Listen for Failures
    const failuresRef = ref(this.db, 'failures');
    onValue(failuresRef, (snapshot) => {
      const data = snapshot.val();
      this.lastUpdate.set(new Date());
      
      if (data) {
        const list = Object.values(data) as ForkliftFailureEntry[];
        list.sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime());
        this.forkliftFailures.set(list);
        this.syncAssetsWithFailures(list);
      } else {
        this.seedDatabase();
      }
    }, (error) => {
      console.warn("Using Offline Mode.", error);
      this.connectionStatus.set('offline');
    });

    // Listen for Settings
    const kioskRef = ref(this.db, 'settings/kioskMode');
    onValue(kioskRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null && this.isKioskMode() !== val) this.isKioskMode.set(val);
    });
  }

  private seedDatabase() {
    const updates: any = {};
    const initialFailures = this.forkliftFailures();
    initialFailures.forEach(f => {
      updates['failures/' + f.id] = f;
    });
    updates['settings/kioskMode'] = false;
    update(ref(this.db), updates).catch(() => {});
  }

  // --- Logic & Actions ---

  toggleKioskMode() {
    const newValue = !this.isKioskMode();
    this.isKioskMode.set(newValue);
    if (this.connectionStatus() === 'online') {
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

  // --- CRUD Operations (Optimistic UI) ---

  addLiveFailure(entry: Omit<ForkliftFailureEntry, 'id' | 'fechaIngreso' | 'seguimiento'>) {
    const newEntry: ForkliftFailureEntry = {
      ...entry,
      id: 'F-' + Date.now(),
      fechaIngreso: new Date().toISOString(),
      seguimiento: []
    };

    // Optimistic Update
    this.connectionStatus.set('syncing');
    this.forkliftFailures.update(list => [newEntry, ...list]);
    this.syncAssetsWithFailures(this.forkliftFailures());

    if (this.connectionStatus() !== 'offline') {
      set(ref(this.db, 'failures/' + newEntry.id), newEntry)
        .then(() => this.connectionStatus.set('online'))
        .catch(() => this.connectionStatus.set('offline'));
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

    this.forkliftFailures.update(list => list.map(f => f.id === failureId ? updatedFailure : f));
    
    if (this.connectionStatus() !== 'offline') {
      update(ref(this.db, 'failures/' + failureId), updatedFailure).catch(console.error);
    }
  }

  updateToyotaLogistics(failureId: string, po: string, statusRef: ForkliftFailureEntry['estatusRefaccion'], promiseDate?: string) {
    const updates = { ordenCompra: po, estatusRefaccion: statusRef, fechaPromesa: promiseDate, estatus: 'En Proceso' };
    
    this.forkliftFailures.update(list => list.map(f => {
       if (f.id === failureId) return { ...f, ...updates, estatus: 'En Proceso' };
       return f;
    }));

    if (this.connectionStatus() !== 'offline') {
      update(ref(this.db, 'failures/' + failureId), updates).catch(console.error);
    }
  }

  closeLiveFailure(id: string) {
    const failure = this.forkliftFailures().find(f => f.id === id);
    if (!failure) return;
    
    const updatedFailure = { ...failure, estatus: 'Cerrada' as const, fechaSalida: new Date().toISOString() };
    
    this.forkliftFailures.update(list => list.map(f => f.id === id ? updatedFailure : f));
    this.syncAssetsWithFailures(this.forkliftFailures());

    if (this.connectionStatus() !== 'offline') {
      update(ref(this.db, 'failures/' + id), updatedFailure).catch(console.error);
    }
  }

  reportFailure(assetId: string, description: string, type: FailureReport['type']) {
    this.addLiveFailure({
      economico: assetId,
      falla: description,
      prioridad: 'Media',
      reporta: 'Operador (App)',
      estatus: 'Abierta'
    });
  }

  completeRepair(assetId: string, diagnosis: string, cost: number, parts: string[]) {
    const activeFailure = this.forkliftFailures().find(f => f.economico === assetId && f.estatus !== 'Cerrada');
    if (activeFailure) {
      this.closeLiveFailure(activeFailure.id);
    }
  }

  updateAssetsFromExcel(importedData: any[]) {
     // Excel Import logic placeholder
  }

  // --- Sync Helpers ---
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

  // --- MOCK DATA GENERATORS ---
  private loadRealFleet(): Asset[] {
    const realAssets = hydrateRealAssets(this.statuses);
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

  private generateRealReports(): FailureReport[] {
    return []; // Using Live Failures as source of truth for dashboard consistency
  }

  private generateRealLiveFailures(): ForkliftFailureEntry[] {
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
