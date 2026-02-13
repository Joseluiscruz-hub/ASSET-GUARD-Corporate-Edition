export interface Status {
  id: string;
  name: 'Operativo' | 'Taller' | 'Baja' | 'Preventivo';
  color: string; // Tailwind class or Hex
  hex: string;
}

export interface MaintenanceTask {
  id: string;
  date: string;
  description: string;
  status: 'Pending' | 'Overdue' | 'Completed';
}

export interface Operator {
  name: string;
  role: string;
  shift: string;
}

export interface Asset {
  id: string; // Economic ID (e.g., 35526)
  brand: string;
  model: string;
  serial: string;
  sapCode?: string; // New: SAP Code
  acquisitionDate: string;
  fuelType: 'Eléctrico' | 'Gas LP' | 'Diesel' | 'GLP/Gasolina Dual';
  status: Status;
  statusSince: string; // ISO Date
  image?: string;

  // New fields from architecture
  location: string; // Ubicacion (e.g. Pasillo 4)
  lastFailure?: string; // Description of last failure
  critical: boolean; // Priority flag

  // Real Data Integration
  assignedOperators?: Operator[];
  supervisor?: string;
  operatingHours?: number;

  // HACCP / Food Safety Integration
  cleanlinessStatus: 'Sanitized' | 'Pending' | 'Critical';
  lastSanitization?: string; // ISO Date

  // Scheduled Maintenance
  maintenanceTasks?: MaintenanceTask[];
}

export interface FailureReport {
  id: string;
  assetId: string;
  entryDate: string; // ISO Date
  exitDate?: string | null; // ISO Date or null
  failureDescription: string;
  diagnosis?: string;
  partsUsed: string[];
  estimatedCost: number;
  technician: string;
  type:
    | 'Eléctrico'
    | 'Mecánico'
    | 'Hidráulico'
    | 'Operador'
    | 'Llantas'
    | 'Estructural'
    | 'Software';
}

export interface KPIData {
  availability: number; // Percentage
  mttr: number; // Hours
  totalCostMonth: number;
  budgetMonth: number;
}

// Interface for the bidirectional tracking thread
export interface FailureUpdate {
  usuario: string; // "Planta" or "Toyota"
  mensaje: string;
  fecha: string; // ISO Date
}

// Interface specific for the Live Audit Log
export interface ForkliftFailureEntry {
  id: string;
  economico: string;
  falla: string;
  reporta: string;
  fechaIngreso: string;
  fechaSalida?: string; // Added for closing workflow
  prioridad: 'Alta' | 'Media' | 'Baja';
  estatus: 'Abierta' | 'En Proceso' | 'Cerrada';
  seguimiento: FailureUpdate[]; // Historial de interacción

  // Toyota Management Fields
  ordenCompra?: string;
  estatusRefaccion?: 'N/A' | 'En Stock' | 'Pedida' | 'Por Recibir';
  fechaPromesa?: string; // ISO Date for expected parts
}

// AI Inspection Response Interface (Prompt 2)
export interface AIInspectionResponse {
  inspection: {
    timestamp: string;
    asset: {
      component_affected: string;
      visual_condition: string;
    };
    damage_analysis: {
      damage_type: string;
      visible_signs: string[];
      affected_area_percentage: string;
    };
    severity: {
      level: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';
      risk_score: string;
      safety_impact: string;
      operational_impact: string;
    };
    root_cause_analysis: {
      probable_cause: string;
      why_analysis: string;
    };
    immediate_actions: {
      safety_measures: string[];
    };
    repair_plan: {
      estimated_parts: Array<{ part_name: string; generic_code: string; quantity: string }>;
      estimated_mttr_hours: string;
      estimated_cost_usd: { min: number; max: number };
    };
    image_quality_warning?: string;
  };
}
