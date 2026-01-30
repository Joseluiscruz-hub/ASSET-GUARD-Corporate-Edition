
import { Asset, Status } from '../types';

export const REAL_FLEET_DATA = [
  { eco: "35526", serial: "92719", sap: "4000026523", ops: ["Carlos Eduardo Vazquez Calderon", "Cristofer Ariel Rivera Cruz", "Juan Garduño Chaparro", "Victor Hugo Moreno De la cruz"] },
  { eco: "37191", serial: "95159", sap: undefined, ops: ["Miguel Ángel Torres", "José Luis Hernández", "Roberto Sánchez", "Alejandro Ruiz"] },
  { eco: "37192", serial: "95162", sap: undefined, ops: ["Fernando Martínez", "Ricardo López", "Daniel García"] },
  { eco: "37193", serial: "95074", sap: undefined, ops: ["Eduardo Pérez", "Jorge Ramírez", "Luis Morales", "Gabriel Flores"] },
  { eco: "37194", serial: "95056", sap: undefined, ops: ["Oscar González", "Adrián Castillo", "Manuel Díaz", "Rubén Romero"] },
  { eco: "37195", serial: "95049", sap: undefined, ops: ["Javier Ortiz", "Sergio Medina", "Andrés Vargas", "Raúl Castro"] },
  { eco: "40019", serial: "97520", sap: undefined, ops: ["Hugo Herrera", "Francisco Jiménez", "Martín Silva", "Pedro Mendoza"] },
  { eco: "40020", serial: "97519", sap: undefined, ops: ["Diego Rojas", "Alberto Cruz", "Mario Aguilar", "César Gutiérrez"] },
  { eco: "40021", serial: "97532", sap: undefined, ops: ["Enrique Álvarez", "Gustavo Méndez", "Felipe Ortega"] },
  { eco: "40060", serial: "97529", sap: undefined, ops: ["Pablo Rios", "Héctor Delgado", "Salvador Peña", "Tomás Navarro"] },
  { eco: "40327", serial: "97560", sap: undefined, ops: ["Ismael Guerrero", "Rafael Soto", "Ángel Campos", "Ramón Vega"] },
  { eco: "40328", serial: "97562", sap: undefined, ops: ["Vicente Molina", "Julio Cabrera", "Esteban Miranda"] },
  { eco: "40338", serial: "66458", sap: undefined, ops: ["Emilio Pacheco", "Félix Cordero", "Lorenzo Montes", "Benjamín Solís"] },
  { eco: "29439", serial: "66454", sap: "4000018761", ops: ["Gerardo Lara", "Mauricio Acosta"] },
  { eco: "29440", serial: "66541", sap: "4000018763", ops: ["Samuel Valencia", "Dario Espinoza"] },
  { eco: "35482", serial: "92714", sap: "4000026495", ops: ["Alfredo Beltrán", "Rogelio Cárdenas", "Simón Orozco", "Elias Villalobos"] },
  { eco: "35483", serial: "92730", sap: "4000026496", ops: ["Lucas Maldonado", "Mateo Ibarra", "Nicolás Zavala", "Joaquín Trejo"] },
  { eco: "35494", serial: "92732", sap: "4000026522", ops: ["Sebastián Gallegos", "Damián Ponce", "Julián Esquivel", "Leonardo Rocha"] }
];

export const SUPERVISOR = "Sergio Guadarrama Gonzales";
export const LOCATION = "Planta Cuautitlán - Cuautitlán Izcalli, Edo de Mex.";
export const MODEL = "Toyota 32-8FG30";

// Helper to hydrate the raw data into full Asset objects
export function hydrateRealAssets(statuses: Status[]): Asset[] {
  return REAL_FLEET_DATA.map((item, index) => {
    // 85% Operational, 10% Preventive, 5% Corrective (Simulation)
    const rand = Math.random();
    let statusIdx = 0; // Operativo
    if (rand > 0.95) statusIdx = 1; // Taller
    else if (rand > 0.85) statusIdx = 2; // Preventivo
    
    // Specific Override for simulation realism based on prompt
    if (item.eco === "35526") statusIdx = 1; // Force one known failure

    const status = statuses[statusIdx];
    const statusDate = new Date();
    if (statusIdx !== 0) statusDate.setDate(statusDate.getDate() - Math.floor(Math.random() * 5));

    return {
      id: item.eco,
      brand: 'Toyota',
      model: MODEL,
      serial: item.serial,
      sapCode: item.sap,
      acquisitionDate: '2020-06-15',
      fuelType: 'GLP/Gasolina Dual',
      status: status,
      statusSince: statusDate.toISOString(),
      location: LOCATION,
      critical: index < 5, // Top 5 are critical
      cleanlinessStatus: 'Pending',
      supervisor: SUPERVISOR,
      operatingHours: Math.floor(Math.random() * (2500 - 1200 + 1) + 1200), // Random between 1200-2500
      assignedOperators: item.ops.map((name, i) => ({
        name: name,
        role: 'Operador',
        shift: `Turno ${(i % 4) + 1}`
      })),
      maintenanceTasks: [] // Filled by service later
    };
  });
}
