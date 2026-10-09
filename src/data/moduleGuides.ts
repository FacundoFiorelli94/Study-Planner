import { ModulePdfGuide } from '../types/study';

export const MODULE_PDF_GUIDES: Record<string, ModulePdfGuide> = {
  'mod-0-1': {
    title: 'Guía Maestra: Lógica Estructural y Algoritmos de Flujo',
    totalPages: 3,
    author: 'Facultad de Automatización & Arquitectura de Software',
    summary: 'Fundamentos de control de flujo, modelado de invariantes y diagramas de flujo formalizados para arquitecturas de misión crítica.',
    pages: [
      {
        pageNumber: 1,
        title: 'Principios de Flujo & Modelado Algorítmico',
        sections: [
          {
            heading: '1. Fundamentos del Pensamiento Algorítmico en Automatizaciones',
            content: 'En la automatización de procesos empresariales asistida por IA, un algoritmo no es simplemente una secuencia lineal de pasos, sino una máquina de estados finitos que debe garantizar invariantes bajo condiciones de falla, timeouts y datos corruptos.',
            bulletPoints: [
              'Determinismo: Ante el mismo payload de entrada, la bifurcación lógica debe ser predecible.',
              'Manejo de Invariantes: Condiciones que deben ser ciertas antes (pre-condición) y después (post-condición) de cada bloque de proceso.',
              'Idempotencia: La capacidad de re-ejecutar un flujo sin producir efectos colaterales indeseados (por ejemplo, duplicar un cobro o factura).'
            ]
          },
          {
            heading: '2. Mapeo de Flujos Formal con Sintaxis Mermaid',
            content: 'Todo pipeline de automatización debe formalizarse previamente en un diagrama de flujo estándar para auditar rutas de error antes de escribir código.',
            codeSnippet: `graph TD
    A[Webhook Recibido] --> B{Validar Payload}
    B -- Invalido --> C[Registrar 400 & Alerta]
    B -- Valido --> D[Transformar a Esquema Canonico]
    D --> E{Existe Cliente en DB?}
    E -- No --> F[Crear Registro en CRM]
    E -- Si --> G[Actualizar Historial]
    F --> H[Emitir Evento de Sincronizacion]
    G --> H
    H --> I[Respuesta HTTP 200 OK]`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Árboles de Decisión y Tablas de Verdad',
        sections: [
          {
            heading: '3. Reducción de Complejidad Ciclomática',
            content: 'La complejidad ciclomática mide la cantidad de caminos lógicamente independientes a través del código. Una complejidad alta (> 10) en un nodo de decisión incrementa drásticamente los errores no detectados.',
            callout: 'Regla de Oro: Si un bloque contiene más de 3 niveles de bifurcación anidada, descompóngalo en un sub-workflow o en un pipeline de funciones puras independientes.'
          },
          {
            heading: '4. Ejemplo Práctico: Validador de Decisiones en TypeScript',
            content: 'Implementación de un evaluador de reglas declarativas sin condicionales anidados:',
            codeSnippet: `interface RuleCondition {
  field: string;
  operator: 'equals' | 'greaterThan' | 'contains';
  value: any;
}

export function evaluateRules(data: Record<string, any>, rules: RuleCondition[]): boolean {
  return rules.every(rule => {
    const val = data[rule.field];
    switch (rule.operator) {
      case 'equals': return val === rule.value;
      case 'greaterThan': return Number(val) > Number(rule.value);
      case 'contains': return String(val).includes(String(rule.value));
      default: return false;
    }
  });
}`
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Verificación & Ejercicio Práctico',
        sections: [
          {
            heading: '5. Criterios de Aceptación para el Entregable',
            content: 'Antes de marcar este módulo como superado, verifique los siguientes puntos en su solución:',
            bulletPoints: [
              'El diagrama de flujo incluye explícitamente el canal de contingencia (Dead Letter Queue).',
              'Se han modelado al menos 3 casos límite (payload vacío, tipos incompatibles, desconexión de red).',
              'Cada bifurcación tiene condiciones mutuamente excluyentes y exhaustivas.'
            ]
          },
          {
            heading: '6. Recursos Complementarios y Preguntas de Repaso',
            content: '¿Por qué la idempotencia es indispensable al conectar webhooks con pasarelas de pago como Stripe o PayPal? Asegúrese de documentar su respuesta en sus notas de laboratorio.'
          }
        ]
      }
    ]
  },
  'mod-0-2': {
    title: 'Guía Técnica: JSON Schema y Validación de Contratos de Datos',
    totalPages: 3,
    author: 'Facultad de Automatización & Arquitectura de Software',
    summary: 'Especificación de esquemas JSON Draft 2020-12, validación en tiempo de ejecución, patrones regex y tipado canónico.',
    pages: [
      {
        pageNumber: 1,
        title: 'Especificación JSON Schema & Arquitectura de Contratos',
        sections: [
          {
            heading: '1. El Rol de JSON Schema en Automatización con IA',
            content: 'Los Modelos de Lenguaje (LLMs) generan texto probabilístico. Sin un contrato de datos estricto validado por JSON Schema en el receptor, cualquier cambio en el formato de respuesta del modelo romperá la base de datos o el CRM destinatario.',
            bulletPoints: [
              'Definición unívoca: Los campos requeridos no permiten valores undefined o nulos accidentales.',
              'Tipado semántico: Restricciones de formato (email, uri, date-time, uuid) aplicadas en el gateway.',
              'Interoperabilidad: El mismo schema se usa en Python (Pydantic), TypeScript (Zod/Ajv) y n8n.'
            ]
          },
          {
            heading: '2. Estructura Canónica de un JSON Schema 2020-12',
            content: 'Plantilla de especificación para eventos de webhook transaccionales:',
            codeSnippet: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "WebhookTransaccionalEvent",
  "type": "object",
  "required": ["eventId", "timestamp", "payload", "version"],
  "properties": {
    "eventId": {
      "type": "string",
      "format": "uuid"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "version": {
      "type": "string",
      "pattern": "^v[0-9]+\\\\.[0-9]+$"
    },
    "payload": {
      "type": "object",
      "required": ["totalAmount", "currency", "customerEmail"],
      "properties": {
        "totalAmount": { "type": "number", "minimum": 0 },
        "currency": { "type": "string", "enum": ["USD", "EUR", "MXN", "COP"] },
        "customerEmail": { "type": "string", "format": "email" }
      }
    }
  },
  "additionalProperties": false
}`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Validación en Tiempo de Ejecución con Ajv & Pydantic',
        sections: [
          {
            heading: '3. Implementación del Validador en TypeScript con Ajv',
            content: 'Uso de Ajv para validar payloads antes de permitir la entrada al pipeline de automatización:',
            codeSnippet: `import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, removeAdditional: false });
addFormats(ajv);

const validate = ajv.compile(schemaDefinition);

export function processWebhook(rawBody: unknown) {
  const isValid = validate(rawBody);
  if (!isValid) {
    throw new Error(\`Contrato Invalido: \${JSON.stringify(validate.errors)}\`);
  }
  return rawBody;
}`
          },
          {
            heading: '4. Buenas Prácticas de Versionado Semántico de Esquemas',
            content: 'Nunca modifique un esquema rompiendo compatibilidad hacia atrás en la misma ruta URL. Implemente rutas `/v1/events` y `/v2/events` cuando elimine campos obligatorios.'
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Verificación del Módulo',
        sections: [
          {
            heading: '5. Criterios de Aprobación',
            bulletPoints: [
              'El schema prohíbe explícitamente "additionalProperties: false" en entidades críticas.',
              'Los números monetarios tienen un límite inferior "minimum: 0".',
              'Se han escrito al menos 3 casos de prueba: 1 válido y 2 inválidos con reporte de error detallado.'
            ]
          }
        ]
      }
    ]
  },
  'mod-0-3': {
    title: 'Guía de Protocolos: HTTP/REST, OAuth2 y Seguridad de APIs',
    totalPages: 3,
    author: 'Facultad de Automatización & Arquitectura de Software',
    summary: 'Semántica HTTP, flujos de autenticación Bearer, tokens JWT, rate limiting y resguardo de variables de entorno.',
    pages: [
      {
        pageNumber: 1,
        title: 'Semántica HTTP y Códigos de Estado',
        sections: [
          {
            heading: '1. Verbos HTTP y Códigos de Estado en Automatización',
            content: 'El tratamiento de códigos de respuesta HTTP determina si un reintento debe ejecutarse o abortar inmediatamente:',
            bulletPoints: [
              '200 OK vs 201 Created vs 202 Accepted: Use 202 para tareas asíncronas encoladas.',
              '400 Bad Request: Error del cliente, NO reintentar.',
              '401 Unauthorized vs 403 Forbidden: 401 requiere refresco de token; 403 indica falta de permisos.',
              '429 Too Many Requests: Respetar header "Retry-After" con backoff exponencial.',
              '500 / 502 / 503: Errores transitorios de servidor, candidatos directos a retry.'
            ]
          },
          {
            heading: '2. Petición cURL Estándar con Autenticación Bearer',
            codeSnippet: `curl -X POST "https://api.tu-servicio.com/v1/jobs/process" \\
  -H "Authorization: Bearer \${ACCESS_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: idemp-928371-abc" \\
  -d '{
    "jobType": "ai_synthesis",
    "parameters": { "model": "gemini-1.5-pro", "temperature": 0.2 }
  }'`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Arquitectura de Tokens OAuth2 & Refresh Flows',
        sections: [
          {
            heading: '3. Flujo Authorization Code Grant con PKCE',
            content: 'Para integraciones con Google Workspace o Microsoft 365, el almacenamiento de access tokens dura 3600s. Su backend debe almacenar de forma cifrada el refresh token y renovar de forma transparente cuando el header `exp` haya caducado.'
          },
          {
            heading: '4. Script de Renovación Automática en Python',
            codeSnippet: `import httpx

async def get_fresh_token(client_id: str, client_secret: str, refresh_token: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post("https://oauth2.googleapis.com/token", data={
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        })
        response.raise_for_status()
        data = response.json()
        return data["access_token"]`
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Laboratorio de Pruebas & Seguridad',
        sections: [
          {
            heading: '5. Seguridad de Secretos',
            bulletPoints: [
              'Nunca commitear archivos .env a repositorios Git.',
              'Rotación de API keys cada 90 días.',
              'Uso de variables de entorno inyectadas en tiempo de ejecución en contenedores Docker.'
            ]
          }
        ]
      }
    ]
  },
  'mod-1-1': {
    title: 'Guía de Prompting Avanzado: System Instructions & Few-Shot',
    totalPages: 3,
    author: 'Facultad de Inteligencia Artificial',
    summary: 'Ingeniería de prompts estructurados, delimitadores XML, técnicas Few-Shot y reducción sistemática de alucinaciones.',
    pages: [
      {
        pageNumber: 1,
        title: 'Estructura de un System Instruction de Nivel Industrial',
        sections: [
          {
            heading: '1. Descomposición Anatómica de un Prompt de Producción',
            content: 'Un prompt productivo no es un texto libre, sino una plantilla parametrizada con secciones delimitadas explícitamente.',
            bulletPoints: [
              'Rol & Identidad: Define la competencia técnica, tono y límites del modelo.',
              'Contexto Operativo: Describe el negocio y los supuestos clave.',
              'Reglas Negativas (Guardrails): Acciones estrictamente prohibidas.',
              'Formato de Salida Requerido: JSON estricto, Markdown o código fuente.'
            ]
          },
          {
            heading: '2. Plantilla con Delimitadores XML para Gemini',
            codeSnippet: `<system_instruction>
Eres un Analista Senior de Contratos y Cumplimiento Normativo.
Tu objetivo es examinar cláusulas comerciales y extraer obligaciones y riesgos.

<rules>
1. Responde únicamente basándote en los fragmentos provistos dentro de <context>.
2. Si una cláusula no se menciona, declara explícitamente "NO_IDENTIFICADO".
3. No especules ni generes asesoría legal vinculante.
4. Tu respuesta final DEBE ser un JSON válido conforme a la especificación acordada.
</rules>
</system_instruction>`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Técnicas Few-Shot y Calibración de Temperatura',
        sections: [
          {
            heading: '3. Few-Shot In-Context Learning',
            content: 'Incluir entre 2 y 5 ejemplos de entrada y salida ideales (pares pregunta-respuesta) eleva la precisión de clasificación del 72% al 98% en tareas complejas de extracción.'
          },
          {
            heading: '4. Parámetros de Inferencia Recomendados',
            bulletPoints: [
              'Extracción de datos / JSON: temperature = 0.0 a 0.2 (determinismo máximo).',
              'Razonamiento / Análisis técnico: temperature = 0.3 a 0.5.',
              'Redacción creativa: temperature = 0.7 a 1.0.'
            ]
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Validación de Prompts',
        sections: [
          {
            heading: '5. Matriz de Pruebas de Estrés para Prompts',
            bulletPoints: [
              'Prueba con texto en blanco / espacios vacíos.',
              'Prueba de inyección de prompt (ej. "Ignora las instrucciones anteriores...").',
              'Prueba con documentos multilingües o caracteres especiales.'
            ]
          }
        ]
      }
    ]
  },
  'mod-1-2': {
    title: 'Guía de Razonamiento CoT & Thinking Mode',
    totalPages: 3,
    author: 'Facultad de Inteligencia Artificial',
    summary: 'Razonamiento Chain-of-Thought, ciclo ReAct (Reasoning + Acting) y modelos con modo de pensamiento profundo.',
    pages: [
      {
        pageNumber: 1,
        title: 'Arquitectura del Razonamiento Paso a Paso',
        sections: [
          {
            heading: '1. ¿Por qué el Chain-of-Thought supera al Zero-Shot?',
            content: 'Obligar al modelo a verbalizar sus pasos de cálculo y premisas lógicas antes de emitir la conclusión final reduce los errores de alucinación aritmética y lógica hasta en un 80%.'
          },
          {
            heading: '2. Patrón de Razonamiento Estructurado',
            codeSnippet: `Prompt de Descomposición:
"Para resolver esta consulta, sigue estrictamente este procedimiento:
PASO 1: Identifica las variables clave del problema y lista los datos conocidos.
PASO 2: Identifica las fórmulas o reglas aplicables.
PASO 3: Realiza los cálculos aritméticos paso a paso mostrando el trabajo.
PASO 4: Verifica si el resultado viola alguna regla de negocio.
PASO 5: Emite la conclusión en el bloque <final_answer>."`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Bucle ReAct (Reasoning + Acting)',
        sections: [
          {
            heading: '3. Fundamentos de Agentes ReAct',
            content: 'El patrón ReAct alterna recursivamente entre: Thought (Pensamiento sobre el estado actual) -> Action (Llamada a una herramienta) -> Observation (Resultado de la herramienta).',
            codeSnippet: `Thought: Necesito consultar el tipo de cambio USD/EUR de hoy.
Action: get_exchange_rate(pair="USD_EUR")
Observation: 0.92
Thought: Con la tasa 0.92, calculo 1500 * 0.92 = 1380 EUR.
Action: finish(result=1380)`
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Criterios de Verificación',
        sections: [
          {
            heading: '4. Checklist de Evaluación',
            bulletPoints: [
              'El prompt separa el bloque de razonamiento de la respuesta final.',
              'Se han testeado problemas de inferencia con ambigüedad intencional.',
              'El modelo reconoce cuando le faltan datos en lugar de inventarlos.'
            ]
          }
        ]
      }
    ]
  },
  'mod-1-3': {
    title: 'Guía de Structured Outputs Forzados con Google GenAI SDK',
    totalPages: 3,
    author: 'Facultad de Inteligencia Artificial',
    summary: 'Uso de responseSchema, enumeraciones estrictas, Pydantic y Type SDK para garantizar 100% JSON canónico sin fallos de parseo.',
    pages: [
      {
        pageNumber: 1,
        title: 'Forzado de Esquema en Nivel de Decodificación del Modelo',
        sections: [
          {
            heading: '1. De Prompts Frágiles a Salidas Estructuradas por Diseño',
            content: 'En lugar de pedir "responde en formato JSON", el SDK moderno de Google GenAI (`@google/genai`) permite compilar un esquema que restringe la decodificación de tokens para que sea matemáticamente imposible que el modelo devuelva sintaxis inválida.',
            codeSnippet: `import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI();

const invoiceSchema = {
  type: Type.OBJECT,
  properties: {
    invoiceNumber: { type: Type.STRING },
    vendorName: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          quantity: { type: Type.INTEGER },
          unitPrice: { type: Type.NUMBER },
        },
        required: ["description", "quantity", "unitPrice"],
      },
    },
    totalAmount: { type: Type.NUMBER },
  },
  required: ["invoiceNumber", "vendorName", "items", "totalAmount"],
};

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: rawInvoiceText,
  config: {
    responseMimeType: "application/json",
    responseSchema: invoiceSchema,
  },
});

const parsedData = JSON.parse(response.text);`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Manejo de Errores y Validaciones de Dominio',
        sections: [
          {
            heading: '2. Validación Semántica Posterior',
            content: 'Aunque el esquema JSON sea válido, siempre valide la coherencia de negocio (ej. que la suma de items coincida con el totalAmount).'
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Verificación',
        sections: [
          {
            heading: '3. Criterios de Aceptación',
            bulletPoints: [
              'Uso exclusivo de responseSchema en el SDK oficial.',
              'Tipado de números como NUMBER o INTEGER estricto.',
              'Prueba con 5 facturas en texto plano convertidas a JSON idéntico.'
            ]
          }
        ]
      }
    ]
  },
  'mod-2-1': {
    title: 'Guía de Automatización Visual: Despliegue y Webhooks en n8n',
    totalPages: 3,
    author: 'Facultad de Automatización de Procesos',
    summary: 'Despliegue con Docker Compose, arquitectura de triggers por Webhook, nodos Code y transformaciones de datos.',
    pages: [
      {
        pageNumber: 1,
        title: 'Despliegue Local de n8n con Docker Compose',
        sections: [
          {
            heading: '1. Configuración de Entorno de Producción Local',
            content: 'El despliegue con Docker garantiza reproducibilidad total y persistencia de workflows y credenciales.',
            codeSnippet: `version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=America/Mexico_City
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
    volumes:
      - ./n8n_data:/home/node/.n8n`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Configuración del Webhook Trigger y Nodo Code',
        sections: [
          {
            heading: '2. Transformación de Payloads Complejos en JavaScript',
            content: 'El nodo Code de n8n permite transformar y normalizar objetos en memoria:',
            codeSnippet: `// Nodo Code de n8n
const items = $input.all();

return items.map(item => {
  const raw = item.json;
  return {
    json: {
      leadId: raw.id || \`lead-\${Date.now()}\`,
      fullName: \`\${raw.first_name} \${raw.last_name}\`.trim(),
      email: raw.email.toLowerCase(),
      score: raw.interactions_count * 10,
      qualified: raw.interactions_count > 3,
      receivedAt: new Date().toISOString()
    }
  };
});`
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Verificación',
        sections: [
          {
            heading: '3. Criterios de Aceptación',
            bulletPoints: [
              'Servidor n8n respondiendo en el puerto 5678.',
              'Webhook configurado con método POST y Header Auth.',
              'Workflow probado con cURL emitiendo respuesta 200 en < 150ms.'
            ]
          }
        ]
      }
    ]
  },
  'mod-2-2': {
    title: 'Guía de Resiliencia: Try/Catch, Fallbacks & Dead Letter Queues',
    totalPages: 3,
    author: 'Facultad de Automatización de Procesos',
    summary: 'Sub-workflows de error en n8n, backoff exponencial, dead-letter queues y notificaciones de alerta a Slack/Telegram.',
    pages: [
      {
        pageNumber: 1,
        title: 'Patrones de Resiliencia en Workflows de Alta Disponibilidad',
        sections: [
          {
            heading: '1. Por qué fallan los workflows en producción',
            content: 'Terceros caídos, límites de tasa (429) o payloads mal formados causan interrupciones silenciosas si no se implementa un Error Trigger centralizado.',
            bulletPoints: [
              'Error Trigger Workflow: Workflow especial que se dispara automáticamente ante cualquier fallo no capturado.',
              'Dead Letter Queue: Almacenamiento seguro de eventos fallidos para su posterior reprocesamiento manual o automático.',
              'Idempotencia en reintentos: Garantía de que un retry no duplicará cobros ni emails.'
            ]
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Estrategia de Backoff Exponencial y Fallbacks',
        sections: [
          {
            heading: '2. Configuración de Reintentos en el Nodo HTTP Request',
            content: 'En n8n, configure en "Settings" del nodo HTTP Request: Retry on Fail: True, Max Tries: 4, Wait Between Tries: 2000ms con multiplicador exponencial.'
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Verificación',
        sections: [
          {
            heading: '3. Criterios de Evaluación',
            bulletPoints: [
              'Simulación de fallo 500 capturada por el nodo de contingencia.',
              'Alerta enviada a webhook de monitoreo con stack trace.',
              'Evento almacenado en base de datos para inspección.'
            ]
          }
        ]
      }
    ]
  },
  'mod-2-3': {
    title: 'Guía de Nodos de IA en n8n & Certificación Academy',
    totalPages: 3,
    author: 'Facultad de Automatización de Procesos',
    summary: 'Nodo AI Agent en n8n, memoria de buffer, conexión de herramientas y preparación del Proyecto 1 de portafolio.',
    pages: [
      {
        pageNumber: 1,
        title: 'Integración del AI Agent Node en n8n',
        sections: [
          {
            heading: '1. Arquitectura de Nodos de IA en n8n',
            content: 'n8n provee un ecosistema nativo de agentes que conecta Modelos de Lenguaje, Memoria (Window Buffer / Redis) y Tools (HTTP, Custom Code, Calculators).',
            bulletPoints: [
              'AI Agent Node: Orquesta el bucle cognitivo.',
              'Chat Model Provider: Conexión con Gemini API o OpenAI API.',
              'Memory Node: Persistencia de contexto conversacional en base de datos.',
              'Tool Nodes: Capacidades que el agente puede invocar de forma autónoma.'
            ]
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Preparación del Proyecto 1 de Portafolio',
        sections: [
          {
            heading: '2. Requisitos de Entrega para el Laboratorio 1',
            content: 'El workflow debe recibir leads por webhook, enriquecer los datos con IA, clasificar prioridad, almacenar en Postgres y notificar por Slack con manejo completo de errores.'
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Verificación',
        sections: [
          {
            heading: '3. Aprobación del Módulo',
            bulletPoints: [
              'Workflow exportado como archivo .json validado.',
              'Certificación n8n Academy Level 1 completada.',
              'README.md con diagrama de arquitectura y variables requeridas.'
            ]
          }
        ]
      }
    ]
  },
  'mod-3-1': {
    title: 'Guía de Backend: Pipelines ETL con Python y Pydantic v2',
    totalPages: 3,
    author: 'Facultad de Arquitectura de Backend',
    summary: 'Extracción, transformación y validación de datos heterogéneos con Pydantic v2 BaseModel, field_validator y tipado estricto.',
    pages: [
      {
        pageNumber: 1,
        title: 'Tipado Fuerte y Validación Declarativa con Pydantic v2',
        sections: [
          {
            heading: '1. Pydantic v2: El Núcleo de la Validación en Python Moderno',
            content: 'Escrito en Rust en su núcleo, Pydantic v2 ofrece validación ultrarrápida de datos con tipado estricto para pipelines ETL.',
            codeSnippet: `from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import datetime
from typing import Optional

class CustomerRecord(BaseModel):
    id: str = Field(..., pattern=r"^cust_[a-zA-Z0-9]+$")
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    monthly_budget: float = Field(..., gt=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    phone: Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def sanitize_name(cls, v: str) -> str:
        return " ".join(v.split()).title()`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Pipeline ETL Asíncrono',
        sections: [
          {
            heading: '2. Procesamiento de Lotes en Chunks',
            content: 'Nunca cargue archivos masivos completos en memoria RAM. Procese streams en lotes de 500 registros con generadores de Python.'
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Verificación',
        sections: [
          {
            heading: '3. Criterios de Aceptación',
            bulletPoints: [
              'Modelos Pydantic v2 con validadores personalizados.',
              'Tests unitarios con pytest cubriendo casos de datos corruptos.',
              'Pipeline testeado con lote de 1,000 registros.'
            ]
          }
        ]
      }
    ]
  },
  'mod-3-2': {
    title: 'Guía de Persistencia: PostgreSQL & SQLAlchemy 2.0 Async',
    totalPages: 3,
    author: 'Facultad de Arquitectura de Backend',
    summary: 'Patrón Repository, SQLAlchemy 2.0 AsyncSession, migraciones con Alembic y relaciones relacionales.',
    pages: [
      {
        pageNumber: 1,
        title: 'Persistencia Asíncrona con SQLAlchemy 2.0',
        sections: [
          {
            heading: '1. Modelos Declarativos con Mapped y mapped_column',
            content: 'SQLAlchemy 2.0 introduce soporte de tipado estático nativo compatible con mypy y Pylance.',
            codeSnippet: `from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Float, DateTime, func
from datetime import datetime

class Base(DeclarativeBase):
    pass

class LeadModel(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Patrón Repository Desacoplado',
        sections: [
          {
            heading: '2. Separación entre Lógica de Dominio y SQL',
            content: 'El patrón Repository abstrae el acceso a la base de datos permitiendo probar la lógica de negocio con mocks sin necesidad de levantar una base de datos real.'
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Verificación',
        sections: [
          {
            heading: '3. Criterios de Aceptación',
            bulletPoints: [
              'Migración Alembic generada y aplicada con éxito.',
              'Repositorio asíncrono implementado con AsyncSession.',
              'Contenedor PostgreSQL configurado en Docker Compose.'
            ]
          }
        ]
      }
    ]
  },
  'mod-3-3': {
    title: 'Guía de APIs Asíncronas en FastAPI para Automatización e IA',
    totalPages: 3,
    author: 'Facultad de Automatización & Backend',
    summary: 'Endpoints asíncronos de alto rendimiento, validación estricta con Pydantic, manejo de Webhooks e integración directa con agentes de IA y n8n.',
    pages: [
      {
        pageNumber: 1,
        title: 'Arquitectura de Endpoints y Recepción de Webhooks',
        sections: [
          {
            heading: '1. Estructura de un Servicio de Automatización con FastAPI',
            content: 'FastAPI proporciona capacidades nativas asíncronas con ASGI para recibir webhooks de n8n, Stripe o Slack y despachar tareas a modelos de IA concurrentemente sin bloquear el hilo principal.',
            bulletPoints: [
              'Validación automática de payloads entrantes con Pydantic v2.',
              'Inyección de clientes asíncronos HTTPX y conexiones a bases de datos con Depends().',
              'BackgroundTasks para disparar inferencias de IA y flujos pesados sin demorar la respuesta HTTP 200/201.',
              'Documentación OpenAPI Swagger interactiva accesible en /docs para probar integraciones.'
            ]
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Recepción de Webhook y Despacho en Segundo Plano',
        sections: [
          {
            heading: '2. Endpoint Asíncrono con BackgroundTasks',
            codeSnippet: `from fastapi import APIRouter, BackgroundTasks, Depends, status
from pydantic import BaseModel, EmailStr
import httpx

router = APIRouter(prefix="/automation", tags=["Automation"])

class LeadEventPayload(BaseModel):
    lead_id: str
    email: EmailStr
    source: str
    message: str

async def trigger_ai_enrichment_webhook(lead_id: str, message: str):
    # Enviar evento a n8n o agente de IA para enriquecimiento y scoring
    async with httpx.AsyncClient(timeout=10.0) as client:
        await client.post("https://n8n.webhook.internal/webhook/enrich", json={
            "lead_id": lead_id,
            "raw_text": message
        })

@router.post("/webhook/lead", status_code=status.HTTP_202_ACCEPTED)
async def receive_lead(
    payload: LeadEventPayload,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(trigger_ai_enrichment_webhook, payload.lead_id, payload.message)
    return {"status": "enqueued", "lead_id": payload.lead_id}`
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Verificación y Pruebas',
        sections: [
          {
            heading: '3. Criterios de Aprobación de la API',
            bulletPoints: [
              'Endpoints asíncronos con validación de tipos estricta y esquemas Pydantic completos.',
              'Documentación interactiva disponible en /docs con ejemplos reales de JSON para n8n.',
              'Pruebas con TestClient de FastAPI validando respuestas HTTP 200/202 exitosas y HTTP 422 ante payloads mal formateados.'
            ]
          }
        ]
      }
    ]
  },
  'mod-4-1': {
    title: 'Guía de RAG: Embeddings Vectoriales & PostgreSQL pgvector',
    totalPages: 3,
    author: 'Facultad de Inteligencia Artificial & MLOps',
    summary: 'Indexación HNSW, similitud coseno, chunking semántico y consultas de búsqueda híbrida sobre bases de conocimiento.',
    pages: [
      {
        pageNumber: 1,
        title: 'Fundamentos de Representación Vectorial & Embeddings',
        sections: [
          {
            heading: '1. Del Texto a la Geometría Semántica',
            content: 'Un modelo de embeddings mapea fragmentos textuales a vectores densos en un espacio de 768 o 1536 dimensiones donde la cercanía angular representa afinidad de significado.',
            bulletPoints: [
              'Modelo text-embedding-004: Dimensiones 768 con alta compresión semántica.',
              'Similitud Coseno: Mide el ángulo entre vectores normalizados (1.0 = idénticos, 0 = no relacionados).',
              'Indexación HNSW (Hierarchical Navigable Small World): Provee búsqueda de vecinos más cercanos con latencias < 10ms.'
            ]
          },
          {
            heading: '2. Creación de Tabla de Vectores en PostgreSQL',
            codeSnippet: `CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL,
    embedding vector(768)
);

CREATE INDEX ON document_chunks USING hnsw (embedding vector_cosine_ops);`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Chunking Semántico y Búsqueda por Similitud',
        sections: [
          {
            heading: '3. Consulta SQL de Búsqueda Vectorial',
            codeSnippet: `SELECT id, content, metadata, 1 - (embedding <=> :query_vector) AS similarity
FROM document_chunks
WHERE 1 - (embedding <=> :query_vector) > 0.75
ORDER BY embedding <=> :query_vector
LIMIT 5;`
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Verificación',
        sections: [
          {
            heading: '4. Criterios de Aprobación',
            bulletPoints: [
              'Extensión pgvector activada en contenedor de Postgres.',
              'Índice HNSW construido sobre la columna vector.',
              'Script de ingestión procesando documentos y generando embeddings.'
            ]
          }
        ]
      }
    ]
  },
  'mod-4-2': {
    title: 'Guía de Agentes: Function Calling & Arquitectura ReAct',
    totalPages: 3,
    author: 'Facultad de Inteligencia Artificial & MLOps',
    summary: 'Definición de Tools, esquemas de funciones, validación de parámetros devueltos por LLMs y guardrails contra bucles infinitos.',
    pages: [
      {
        pageNumber: 1,
        title: 'Llamada de Funciones (Function Calling) en Google GenAI',
        sections: [
          {
            heading: '1. Principio de Declaración de Herramientas',
            content: 'El modelo no ejecuta el código directamente, sino que devuelve una intención estructurada (`functionCall`) con los parámetros validados para que su aplicación ejecute la acción de forma segura.',
            codeSnippet: `const searchKnowledgeBaseTool = {
  functionDeclarations: [
    {
      name: "searchKnowledgeBase",
      description: "Busca articulos tecnicos y documentacion interna por consulta semantica",
      parameters: {
        type: "OBJECT",
        properties: {
          query: { type: "STRING", description: "Consulta tecnica a buscar" },
          maxResults: { type: "INTEGER", description: "Cantidad de fragmentos a devolver" }
        },
        required: ["query"]
      }
    }
  ]
};`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Bucle de Ejecución del Agente',
        sections: [
          {
            heading: '2. Ciclo de Ejecución de Tools y Retroalimentación',
            content: 'Al recibir `functionCalls`, su backend ejecuta la función local, empaqueta el resultado en una `functionResponse` y se lo reenvía al modelo para que elabore la síntesis final.'
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Verificación',
        sections: [
          {
            heading: '3. Criterios de Aprobación',
            bulletPoints: [
              'Al menos 2 tools reales conectadas (ej. consulta DB y API externa).',
              'Límite de profundidad (max 5 iteraciones) para evitar bucles.',
              'Manejo de errores si la tool arroja excepción.'
            ]
          }
        ]
      }
    ]
  },
  'mod-4-3': {
    title: 'Guía de LangGraph: Grafos Cíclicos de Estado y Memoria',
    totalPages: 3,
    author: 'Facultad de Inteligencia Artificial & MLOps',
    summary: 'StateGraph, checkpoints persistentes, bifurcaciones condicionales, detección de alucinaciones y entrega del Proyecto 2.',
    pages: [
      {
        pageNumber: 1,
        title: 'Arquitectura de StateGraph con LangGraph',
        sections: [
          {
            heading: '1. Por qué LangGraph supera a las cadenas lineales (Chains)',
            content: 'Las arquitecturas agenticas del mundo real requieren ciclos, autorreflexión y bifurcaciones condicionales que LangGraph modela como grafos de estado computacionales.',
            codeSnippet: `from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, END
import operator

class AgentState(TypedDict):
    question: str
    documents: List[str]
    generation: str
    hallucination_score: float
    iterations: int

workflow = StateGraph(AgentState)

workflow.add_node("retrieve", retrieve_docs_node)
workflow.add_node("grade_docs", grade_documents_node)
workflow.add_node("generate", generate_answer_node)
workflow.add_node("hallucination_check", check_hallucination_node)

workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "grade_docs")
workflow.add_edge("grade_docs", "generate")
workflow.add_edge("generate", "hallucination_check")

workflow.add_conditional_edges(
    "hallucination_check",
    route_after_eval,
    {"pass": END, "retry": "generate", "rewrite": "retrieve"}
)`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Citas Explícitas y Trazabilidad de Fuentes',
        sections: [
          {
            heading: '2. Garantía de Citas Estructuradas en el Proyecto 2',
            content: 'Toda afirmación en la respuesta del agente debe contener una cita verificable en el formato `[DocID, Sección 2.1]` vinculada al vector original recuperado de PostgreSQL.'
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Verificación',
        sections: [
          {
            heading: '3. Aprobación del Proyecto 2',
            bulletPoints: [
              'Grafo de LangGraph compilado con checkpoint de memoria.',
              'Detección de alucinación con reintento automático.',
              'Citas explícitas en cada párrafo con fuente contrastable.'
            ]
          }
        ]
      }
    ]
  },
  'mod-5-1': {
    title: 'Guía de MLOps: Trazado, Telemetría y LangSmith',
    totalPages: 3,
    author: 'Facultad de MLOps & Observabilidad de IA',
    summary: 'Instrumentación con LangSmith Tracing, árboles de llamadas, métricas de latencia por nodo y registro de feedback de usuarios.',
    pages: [
      {
        pageNumber: 1,
        title: 'Observabilidad Integral en Sistemas de IA Generativa',
        sections: [
          {
            heading: '1. La Necesidad del Trazado Distribuido',
            content: 'En un pipeline con múltiples llamadas a LLMs, embeddings y base de datos, depurar errores sin telemetría es imposible. LangSmith captura inputs, outputs, parámetros y latencias por nodo sin modificar la lógica central.',
            codeSnippet: `# Variables de entorno para LangSmith
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_ENDPOINT="https://api.smith.langchain.com"
export LANGCHAIN_API_KEY="ls__..."
export LANGCHAIN_PROJECT="carrera-ia-produccion"`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Análisis de Árboles de Ejecución y Cuellos de Botella',
        sections: [
          {
            heading: '2. Detección de Latencias Anómalas',
            content: 'Identifique nodos con tiempo de respuesta > 2000ms y optimice utilizando streaming de respuestas o llamadas asíncronas paralelas.'
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Verificación',
        sections: [
          {
            heading: '3. Criterios de Aprobación',
            bulletPoints: [
              '50 trazas reales registradas en panel de LangSmith.',
              'Etiquetas de metadata (user_id, environment) incluidas en cada run.',
              'Reporte de análisis de latencia mediana (p50) y percentil 95 (p95).'
            ]
          }
        ]
      }
    ]
  },
  'mod-5-2': {
    title: 'Guía de FinOps de IA & Human-in-the-Loop (HITL)',
    totalPages: 3,
    author: 'Facultad de MLOps & Observabilidad de IA',
    summary: 'Contabilidad financiera de tokens, caching de contexto, interrupciones humanas en LangGraph y gobernanza de riesgos.',
    pages: [
      {
        pageNumber: 1,
        title: 'Economía de Tokens y FinOps en Producción',
        sections: [
          {
            heading: '1. Fórmulas de Cálculo de Costos en Modelos Modernos',
            content: 'Monitoree constantemente los tokens de entrada, salida y tokens en caché (Prompt Caching) para calcular el costo por transacción.',
            bulletPoints: [
              'Coste Input: $0.10 por millón de tokens en Gemini Flash.',
              'Coste Output: $0.40 por millón de tokens en Gemini Flash.',
              'Prompt Caching: Descuento del 75% en tokens de contexto estáticos repetidos.',
              'Intervención HITL: Pausa obligatoria para transacciones > $500 USD o mutaciones de datos críticas.'
            ]
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Implementación de Interrupts Human-in-the-Loop',
        sections: [
          {
            heading: '2. Puntos de Corte en LangGraph',
            codeSnippet: `# Pausar ejecución antes de ejecutar un nodo crítico
workflow.compile(
    checkpointer=memory_saver,
    interrupt_before=["execute_wire_transfer"]
)`
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist de Verificación',
        sections: [
          {
            heading: '3. Criterios de Aprobación',
            bulletPoints: [
              'Simulador de FinOps con desglose de coste por 10,000 llamadas.',
              'Flujo HITL con reanudación por token de aprobación.',
              'Estrategia de Prompt Caching documentada.'
            ]
          }
        ]
      }
    ]
  },
  'mod-5-3': {
    title: 'Guía de Consolidación: Dashboard de ROI y Portafolio Final',
    totalPages: 3,
    author: 'Facultad de MLOps & Dirección Tecnológica',
    summary: 'Métricas de impacto empresarial, cálculo de ROI tangible, presentación ejecutiva y consolidación de los 3 proyectos maestros.',
    pages: [
      {
        pageNumber: 1,
        title: 'Cuantificación del Retorno de Inversión (ROI) en IA',
        sections: [
          {
            heading: '1. La Fórmula del ROI para Proyectos de Automatización',
            content: 'Para justificar la inversión en automatización ante la dirección general, traduzca las métricas técnicas en horas hombre y ahorro neto.',
            codeSnippet: `ROI = ((Horas Ahorradas * Costo Horario Humano) - Costo Infraestructura IA & Tokens) / Costo Inversion Inicial * 100`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Estructura de Presentación del Portafolio',
        sections: [
          {
            heading: '2. Los 3 Pilares del Portafolio de Graduación',
            bulletPoints: [
              'Proyecto 1: Orquestación Visual Resiliente n8n (Eficiencia operativa).',
              'Proyecto 2: Agente RAG Cognitivo LangGraph + pgvector (Precisión y conocimiento).',
              'Proyecto 3: Dashboard de Gobernanza, FinOps & ROI (Negocio y observabilidad).'
            ]
          }
        ]
      },
      {
        pageNumber: 3,
        title: 'Checklist Final de Graduación de la Carrera',
        sections: [
          {
            heading: '3. Acreditación de Carrera de IA y Automatización',
            bulletPoints: [
              'Los 3 repositorios públicos en GitHub con README profesional y diagramas.',
              'Demos en vivo o screencasts funcionando.',
              'Dashboard de métricas desplegado y accesible.'
            ]
          }
        ]
      }
    ]
  }
};

/**
 * Returns a fallback guide for any module without custom content
 */
export function getGuideForModule(moduleId: string, moduleTitle: string, topics: string[]): ModulePdfGuide {
  if (MODULE_PDF_GUIDES[moduleId]) {
    return MODULE_PDF_GUIDES[moduleId];
  }

  return {
    title: `Guía de Estudio: ${moduleTitle}`,
    totalPages: 2,
    author: 'Dirección Académica - Carrera de IA y Automatización',
    summary: `Material formativo, fundamentos conceptuales y prácticas guiadas para dominar "${moduleTitle}".`,
    pages: [
      {
        pageNumber: 1,
        title: 'Fundamentos Técnicos & Objetivos de Aprendizaje',
        sections: [
          {
            heading: '1. Visión General del Módulo',
            content: `Este módulo profundiza en los conceptos esenciales de ${moduleTitle}. Dominar estas competencias es fundamental para construir soluciones escalables y seguras en la Carrera de IA y Automatización.`,
            bulletPoints: topics.map((t) => `Competencia clave: ${t}`)
          },
          {
            heading: '2. Arquitectura de Implementación',
            content: 'Siga los lineamientos de código limpio, desacoplamiento y validación estricta de invariantes.',
            codeSnippet: `// Ejemplo canónico de implementación
export async function executeModuleTask(payload: Record<string, any>) {
  console.log("Iniciando procesamiento para:", "${moduleTitle}");
  // Validación de contrato y ejecución
  return { success: true, timestamp: new Date().toISOString() };
}`
          }
        ]
      },
      {
        pageNumber: 2,
        title: 'Práctica de Laboratorio & Criterios de Evaluación',
        sections: [
          {
            heading: '3. Checklist de Verificación de Entregable',
            bulletPoints: [
              'Lectura y comprensión de los recursos oficiales recomendados.',
              'Implementación del entregable práctico con pruebas unitarias.',
              'Validación del hito utilizando el evaluador de IA incorporado.'
            ]
          }
        ]
      }
    ]
  };
}
