import { Asset, Status } from '../types';

// Original Forklift Data mixed with new Diverse Industrial Assets
export const REAL_FLEET_DATA = [
  // --- EXISTING TOYOTA FLEET ---
  { eco: '35526', brand: 'Toyota', model: '32-8FG30', type: 'GLP/Gasolina Dual', serial: '92719', sap: '4000026523', ops: ['Carlos Vazquez', 'Cristofer Rivera'] },
  { eco: '37191', brand: 'Toyota', model: '32-8FG30', type: 'GLP/Gasolina Dual', serial: '95159', sap: undefined, ops: ['Miguel Torres', 'Jose Hernandez'] },

  // --- NEW: DIVERSE INDUSTRIAL ASSETS (DEMO SCALABILITY) ---
  {
    eco: 'B-100',
    brand: 'Cleaver-Brooks',
    model: 'CB-200-500',
    type: 'Vapor/Gas',
    serial: 'CB-99821',
    sap: '500001',
    ops: ['Ing. Termodinámica', 'Op. Calderas'],
    location: 'Cuarto de Máquinas',
    supervisor: 'Ing. Pedro Boiler'
  },
  {
    eco: 'COMP-04',
    brand: 'Atlas Copco',
    model: 'GA 75 VSD',
    type: 'Neumático',
    serial: 'AII-7721',
    sap: '500002',
    ops: ['Téc. Neumático'],
    location: 'Nave Industrial B',
    supervisor: 'Ing. Aire'
  },
  {
    eco: 'PRESS-X1',
    brand: 'Komatsu',
    model: 'H1F 200',
    type: 'Hidráulico',
    serial: 'K-22019',
    sap: '500003',
    ops: ['Op. Prensa'],
    location: 'Línea de Estampado',
    supervisor: 'Ing. Procesos'
  },
  {
    eco: 'CONV-L2',
    brand: 'Siemens/Dematic',
    model: 'Roller Belt 5000',
    type: 'Eléctrico 440V',
    serial: 'SD-5510',
    sap: '500004',
    ops: ['Op. Línea'],
    location: 'Empaque Final',
    supervisor: 'Ing. Logística'
  },

  // --- REST OF FLEET ---
  { eco: '37192', brand: 'Toyota', model: '32-8FG30', type: 'GLP/Gasolina Dual', serial: '95162', sap: undefined, ops: ['Fernando Martínez'] },
  { eco: '40019', brand: 'Toyota', model: '32-8FG30', type: 'GLP/Gasolina Dual', serial: '97520', sap: undefined, ops: ['Hugo Herrera'] },
  { eco: '40020', brand: 'Toyota', model: '32-8FG30', type: 'GLP/Gasolina Dual', serial: '97519', sap: undefined, ops: ['Diego Rojas'] },
  { eco: '40338', brand: 'Toyota', model: '32-8FG30', type: 'GLP/Gasolina Dual', serial: '66458', sap: undefined, ops: ['Emilio Pacheco'] },
  { eco: '29439', brand: 'Toyota', model: '32-8FG30', type: 'GLP/Gasolina Dual', serial: '66454', sap: '4000018761', ops: ['Gerardo Lara'] },
];

export const SUPERVISOR = 'Sergio Guadarrama Gonzales';
export const LOCATION_DEFAULT = 'Planta Cuautitlán';

// Helper to hydrate the raw data into full Asset objects
export function hydrateRealAssets(statuses: Status[]): Asset[] {
  return REAL_FLEET_DATA.map((item, index) => {
    // Determine status logic
    let status = statuses.find(s => s.name === 'Operativo')!;

    // Make the Boiler Critical for Demo purposes
    if (item.eco === 'B-100') {
       status = statuses.find(s => s.name === 'Preventivo')!;
    }

    const statusDate = new Date();

    return {
      id: item.eco,
      brand: item.brand,
      model: item.model,
      serial: item.serial,
      sapCode: item.sap,
      acquisitionDate: '2020-06-15',
      fuelType: item.type as any,
      status: status,
      statusSince: statusDate.toISOString(),
      location: (item as any).location || LOCATION_DEFAULT,
      critical: index < 3 || item.type === 'Vapor/Gas', // Critical if top of list or High Risk (Boiler)
      cleanlinessStatus: 'Pending',
      supervisor: (item as any).supervisor || SUPERVISOR,
      operatingHours: Math.floor(Math.random() * (2500 - 1200 + 1) + 1200),
      assignedOperators: item.ops.map((name, i) => ({
        name: name,
        role: 'Operador',
        shift: `Turno ${(i % 4) + 1}`
      })),
      maintenanceTasks: []
    };
  });
}
