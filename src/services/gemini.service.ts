
import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { FailureReport, Asset, KPIData, AIInspectionResponse } from '../types';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private ai: GoogleGenAI | null = null;
  private isConfigured = false;

  constructor() {
    if (environment.geminiApiKey && environment.geminiApiKey !== '') {
      this.ai = new GoogleGenAI({ apiKey: environment.geminiApiKey });
      this.isConfigured = true;
    } else {
      console.warn('⚠️ Gemini API Key no configurada. Las funciones de IA no estarán disponibles.');
    }
  }

  // --- BONUS 1: PREDICCIÓN DE FALLAS (MANTENIMIENTO PREDICTIVO) ---
  async analyzeMaintenanceHistory(asset: Asset, history: FailureReport[]): Promise<string> {
    if (!this.isConfigured || !this.ai) {
      return '<p class="text-amber-400">⚠️ Servicio de IA no disponible. Configure la API Key de Gemini.</p>';
    }
    try {
      const prompt = `
        Actúa como Analista de Mantenimiento Predictivo con especialización en Machine Learning aplicado a activos industriales.

        ENTRADA DE DATOS:
        Activo: ${asset.brand} ${asset.model} (ID: ${asset.id})
        Historial de Fallas:
        ${JSON.stringify(history.map(h => ({
          fecha: h.entryDate,
          tipo: h.type,
          componente: h.failureDescription,
          severidad: h.estimatedCost > 2000 ? 'Alta' : 'Media'
        })))}

        ANÁLISIS REQUERIDO:
        1. 🔮 DETECCIÓN DE PATRONES: Identifica fallas recurrentes y calcula MTBF aproximado.
        2. 📈 PREDICCIÓN: Estima qué componente tiene mayor probabilidad de fallar próximamente.
        3. ⚙️ RECOMENDACIONES: Sugiere inspecciones o reemplazos preventivos.

        FORMATO DE SALIDA:
        HTML limpio (sin markdown \`\`\`html). Usa iconos y negritas.
        Estructura:
        <div class="space-y-4">
          <div><h4 class="font-bold text-red-400">🔮 Patrones Detectados</h4>...</div>
          <div><h4 class="font-bold text-orange-400">⚠️ Riesgo Inminente</h4>...</div>
          <div><h4 class="font-bold text-green-400">✅ Acción Recomendada</h4>...</div>
        </div>
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || '<p>Datos insuficientes para predicción.</p>';
    } catch (error) {
      console.error('Gemini Error:', error);
      return '<p class="text-red-500">Error conectando con el servicio de IA.</p>';
    }
  }

  // --- PROMPT 5: RESUMEN EJECUTIVO SEMANAL ---
  async generateExecutiveReport(kpi: KPIData, activeFailures: any[], availability: any): Promise<string> {
    if (!this.isConfigured || !this.ai) {
      return '<p class="text-amber-400">⚠️ Servicio de IA no disponible. Configure la API Key de Gemini.</p>';
    }
    try {
      const prompt = `
        Analiza el estado actual de AssetGuard CMMS y genera un resumen ejecutivo profesional para Gerencia de Operaciones.

        DATOS:
        - Disponibilidad: ${availability.percentage}% (Meta: 95%)
        - MTTR Promedio: ${kpi.mttr} horas
        - Gasto Mes: $${kpi.totalCostMonth} USD
        - Equipos Detenidos (Top 3): ${JSON.stringify(activeFailures.slice(0,3).map(f => `${f.economico} (${f.falla})`))}

        ESTRUCTURA DEL REPORTE (HTML simple para renderizar):

        <h3>📊 1. KPIs DE DISPONIBILIDAD</h3>
        <p>Resumen de estado vs meta.</p>

        <h3>🔴 2. ANÁLISIS DE PARETO (Top Problemas)</h3>
        <p>Menciona los equipos críticos detenidos actualmente.</p>

        <h3>💡 3. RECOMENDACIONES ESTRATÉGICAS</h3>
        <ul>
          <li>Acción 1 para reducir downtime</li>
          <li>Acción 2 para optimizar costos</li>
        </ul>

        <h3>⚠️ 4. ALERTAS CRÍTICAS</h3>
        <p>Si disponibilidad < 90%, resalta urgencia.</p>

        TONO: Profesional, directo, español mexicano empresarial. Sin saludos.
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || 'No se pudo generar el reporte ejecutivo.';
    } catch (error) {
      console.error('Gemini Error:', error);
      return 'Error conectando con IA para el reporte.';
    }
  }

  // --- BONUS 3: GENERADOR DE PROCEDIMIENTOS DE SEGURIDAD (LOTO) ---
  async generateLotoProcedure(asset: Asset, failureDescription: string): Promise<string> {
    if (!this.isConfigured || !this.ai) {
      return '<p class="text-amber-400">⚠️ Servicio de IA no disponible. Configure la API Key de Gemini.</p>';
    }
    try {
      const prompt = `
        Actúa como Ingeniero de Seguridad Industrial certificado en LOTO (NOM-004-STPS-1999).
        Genera un procedimiento de bloqueo/etiquetado para:
        Equipo: ${asset.brand} ${asset.model} (${asset.fuelType})
        Tarea: Reparación de ${failureDescription}

        ESTRUCTURA HTML (Lista de verificación):
        <div class="loto-card">
          <h3 class="text-red-600 font-bold mb-2">🚨 IDENTIFICACIÓN DE PELIGROS</h3>
          [Lista de energías peligrosas: Eléctrica, Hidráulica, etc.]

          <h3 class="text-blue-600 font-bold mt-4 mb-2">🔒 SECUENCIA DE BLOQUEO</h3>
          <ol class="list-decimal pl-4 space-y-2">
            <li>Paso 1...</li>
            <li>Paso 2...</li>
          </ol>

          <h3 class="text-green-600 font-bold mt-4 mb-2">✅ VERIFICACIÓN ENERGÍA CERO</h3>
          [Cómo verificar que es seguro trabajar]
        </div>

        Resalta ADVERTENCIAS DE SEGURIDAD en negritas.
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || 'Error generando LOTO.';
    } catch (error) {
       return '<p>No disponible.</p>';
    }
  }

  // --- PROMPT 2: INSPECCIÓN VISUAL MULTIMODAL ---
  async analyzeImageInspection(imageBase64: string): Promise<AIInspectionResponse | null> {
    if (!this.isConfigured || !this.ai) {
      console.warn('⚠️ Servicio de IA no disponible.');
      return null;
    }
    try {
      const prompt = `
        Analiza esta imagen capturada por un operador en planta industrial. Actúa como Inspector de Mantenimiento Certificado.

        IDENTIFICA CON PRECISIÓN:
        1. Componente afectado
        2. Tipo de daño visible
        3. Nivel de severidad (BAJA, MEDIA, ALTA, CRÍTICA)
        4. Posible causa raíz
        5. Refacciones estimadas

        FORMATO DE RESPUESTA:
        Responde ÚNICAMENTE con un objeto JSON válido siguiendo esta estructura exacta:
        {
          "inspection": {
            "timestamp": "ISO string",
            "asset": { "component_affected": "String", "visual_condition": "String" },
            "damage_analysis": { "damage_type": "String", "visible_signs": ["String"], "affected_area_percentage": "String" },
            "severity": { "level": "String", "risk_score": "String", "safety_impact": "String", "operational_impact": "String" },
            "root_cause_analysis": { "probable_cause": "String", "why_analysis": "String" },
            "immediate_actions": { "safety_measures": ["String"] },
            "repair_plan": {
              "estimated_parts": [{ "part_name": "String", "generic_code": "String", "quantity": "String" }],
              "estimated_mttr_hours": "String",
              "estimated_cost_usd": { "min": number, "max": number }
            }
          }
        }
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64
            }
          },
          { text: prompt }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as AIInspectionResponse;
      }
      return null;
    } catch (error) {
      console.error('Vision Error:', error);
      return null;
    }
  }

  // --- Helper for Daily Summary (Legacy) ---
  async generateDailySummary(fleetData: any, activeFailures: any[], history: any[]): Promise<string> {
    return this.generateExecutiveReport(
      { availability: fleetData.percentage, mttr: 4.5, totalCostMonth: 12500, budgetMonth: 15000 },
      activeFailures,
      fleetData
    );
  }
}
