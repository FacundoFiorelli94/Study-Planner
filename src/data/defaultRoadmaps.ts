import { StudyRoadmap } from '../types/study';
import { MODULE_PDF_GUIDES } from './moduleGuides';

export const FLAGSHIP_AI_AUTOMATION_ROADMAP: StudyRoadmap = {
  id: 'roadmap-ai-automation-30w',
  title: 'Carrera de IA y Automatización',
  description: 'Ruta integral para dominar la ingeniería de automatización con inteligencia artificial, arquitecturas ReAct, grafos de estado con LangGraph, backends en Python y MLOps.',
  category: 'Inteligencia Artificial & Automatización',
  totalWeeks: 30,
  weeklyHoursBudget: 10,
  targetPace: 'Balanceado',
  preferredDays: ['Lunes', 'Miércoles', 'Viernes', 'Sábado'],
  startDate: new Date().toISOString().split('T')[0],
  isFlagship: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  portfolioProjects: [
    {
      id: 'proj-1',
      phaseNumber: 2,
      requiredWeek: 14,
      title: 'Laboratorio 1: Automatización Operativa y Flujos de Eventos Resilientes',
      description: 'Orquestación de flujos de negocio en n8n integrando Webhooks transaccionales, manejo de errores Try/Catch, transformación de datos JSON, enriquecimiento con IA y alertas multicanal.',
      status: 'pending',
      labGuide: {
        objective: 'Construir e implementar un sistema de automatización empresarial autónomo con n8n, capaz de procesar eventos de entrada, enriquecerlos con modelos Gemini y recuperarse ante caídas de APIs externas con tolerancia a fallas.',
        scenario: 'Una empresa fintech recibe solicitudes de clientes a través de múltiples canales. Tu misión como Ingeniero de Automatización es implementar un orquestador que reciba los webhooks, verifique la firma de seguridad, clasifique la urgencia con IA, actualice el CRM y notifique por Slack/Telegram con reintentos y Dead-Letter Queue.',
        estimatedHours: 15,
        difficulty: 'Intermedio',
        prerequisites: [
          'Docker y Docker Compose instalados en máquina local',
          'Instancia de n8n corriendo (puerto 5678) o cuenta n8n Cloud',
          'API Key de Google Gemini o OpenAI',
          'Postman / cURL para pruebas de estrés de webhooks'
        ],
        architectureOverview: 'Arquitectura dirigida por eventos (Event-Driven): Webhook Trigger -> Validar Firma HMAC -> Nodo Code (Normalización JSON Schema) -> AI Agent Node (Clasificación & Sentiment) -> Branch Condicional -> Nodo HTTP (Persistencia CRM) -> Error Trigger (Dead Letter Queue & Alerta Slack).',
        steps: [
          {
            stepNumber: 1,
            title: 'Despliegue de Infraestructura y Configuración de Red',
            duration: '1.5 horas',
            explanation: 'Levantar el contenedor de n8n con persistencia en volumen local, configurar variables de entorno críticas y exponer el puerto 5678 de forma segura.',
            commandLanguage: 'bash',
            commandOrSnippet: `docker run -d --name n8n-lab \\
  -p 5678:5678 \\
  -e N8N_HOST=localhost \\
  -e N8N_PORT=5678 \\
  -e N8N_PROTOCOL=http \\
  -e WEBHOOK_URL=http://localhost:5678/ \\
  -v ~/.n8n:/home/node/.n8n \\
  n8nio/n8n:latest`,
            deliverableCheck: 'Acceder a http://localhost:5678 y verificar la consola de administración activa.'
          },
          {
            stepNumber: 2,
            title: 'Configuración del Webhook Receptor & Validación de Firma',
            duration: '2.5 horas',
            explanation: 'Crear el nodo Webhook en n8n con método POST. Validar que la cabecera X-Signature coincida con el hash SHA-256 del cuerpo de la petición para evitar spoofing.',
            commandLanguage: 'javascript',
            commandOrSnippet: `// Validación en nodo Code (JavaScript)
const crypto = require('crypto');
const secret = $env.WEBHOOK_SECRET;
const signature = $input.item.json.headers['x-signature'];
const body = JSON.stringify($input.item.json.body);

const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
if (signature !== expectedSignature) {
  throw new Error('Firma de webhook inválida. Petición abortada.');
}
return $input.item;`,
            deliverableCheck: 'Prueba con cURL enviando firma válida (HTTP 200) e inválida (HTTP 403).'
          },
          {
            stepNumber: 3,
            title: 'Enriquecimiento Inteligente con Gemini & LangChain Node',
            duration: '3.5 horas',
            explanation: 'Integrar el nodo AI Agent de n8n utilizando el modelo gemini-2.5-flash para extraer entidades (nombre, intención, monto, urgencia) y estructurar en JSON canónico.',
            commandLanguage: 'json',
            commandOrSnippet: `{\n  "prompt": "Analiza el mensaje entrante y clasifícalo estrictamente en JSON con claves: intent (support|sales|billing), urgency (high|medium|low), sentiment (positive|neutral|negative)",\n  "temperature": 0.1\n}`,
            deliverableCheck: 'El nodo de IA clasifica correctamente 5 casos de prueba de mensajes de usuarios.'
          },
          {
            stepNumber: 4,
            title: 'Estrategia de Error Handling: Try/Catch & Dead Letter Queue',
            duration: '3.0 horas',
            explanation: 'Implementar el Error Trigger Workflow de n8n. Si la API de destino responde 5xx o timeout, enviar el payload a una tabla de contingencia en Postgres y alertar a canal de soporte con stack trace.',
            commandLanguage: 'bash',
            commandOrSnippet: `# Simulación de fallo en endpoint destino para verificar el Dead-Letter Queue
curl -X POST http://localhost:5678/webhook/leads-incoming \\
  -H "Content-Type: application/json" \\
  -d '{"client_id": "test-error-500", "payload": "simulate_failure"}'`,
            deliverableCheck: 'Verificar la recepción de alerta de fallo con detalles en Slack y registro en DB.'
          },
          {
            stepNumber: 5,
            title: 'Empaquetado, Documentación y Publicación en GitHub',
            duration: '2.5 horas',
            explanation: 'Exportar el workflow en formato JSON sanitizado (sin claves API), redactar el archivo README.md con el diagrama de arquitectura y publicar el repositorio.',
            commandLanguage: 'bash',
            commandOrSnippet: `git init
git add README.md workflow-n8n-production.json docker-compose.yml
git commit -m "feat: Orquestador operativo con n8n, Gemini y manejo de errores"
git remote add origin https://github.com/tu-usuario/n8n-resilient-automation
git push -u origin main`,
            deliverableCheck: 'Repositorio público con instrucciones de despliegue en 1 comando.'
          }
        ],
        verificationChecklist: [
          'Workflow exportado como archivo .json validado y funcional.',
          'Uso de variables de entorno para todas las credenciales sensibles.',
          'Manejo de errores que captura fallos 5xx sin interrumpir el servidor.',
          'Clasificación con IA operando con temperatura baja (<= 0.2).',
          'README con diagrama Mermaid y guía de ejecución local.'
        ],
        suggestedDeliverableRepo: 'https://github.com/tu-usuario/n8n-resilient-automation'
      }
    },
    {
      id: 'proj-2',
      phaseNumber: 4,
      requiredWeek: 26,
      title: 'Laboratorio 2: Agente RAG Autónomo con LangGraph & pgvector',
      description: 'Implementación de un agente conversacional con arquitectura ReAct en LangGraph, base de datos vectorial en PostgreSQL con pgvector, memoria de contexto persistente y citas explícitas.',
      status: 'pending',
      labGuide: {
        objective: 'Construir un agente de búsqueda y razonamiento (RAG) con LangGraph que consulte documentación técnica, valide alucinaciones mediante nodos de control de calidad y cite exactamente las fuentes de cada afirmación.',
        scenario: 'Un equipo de ingenieros necesita un asistente que responda consultas complejas sobre especificaciones de arquitectura y contratos API. Si el agente alucina, puede causar errores costosos en producción. Desarrollarás un StateGraph con detección de respuestas espurias y autocorrección.',
        estimatedHours: 20,
        difficulty: 'Avanzado',
        prerequisites: [
          'Python 3.11+ y Poetry / uv instalados',
          'PostgreSQL 16 con extensión pgvector instalada',
          'Google GenAI SDK o OpenAI API Key',
          'Familiaridad con LangGraph StateGraph y Pydantic v2'
        ],
        architectureOverview: 'Pipeline de Grafo Cíclico: User Query -> Retrieve (pgvector HNSW) -> Grade Documents -> Generate Answer -> Hallucination Checker (Conditional Edge) -> Si aprueba: End con citas; Si falla: Re-escribir query o regenerar.',
        steps: [
          {
            stepNumber: 1,
            title: 'Base de Datos Vectorial: Setup de PostgreSQL + pgvector',
            duration: '2.0 horas',
            explanation: 'Configurar contenedor Docker con pgvector, crear la tabla de fragmentos con columna embedding vector(768) e índice HNSW para búsqueda coseno.',
            commandLanguage: 'sql',
            commandOrSnippet: `CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE technical_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_title VARCHAR(255) NOT NULL,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768)
);

CREATE INDEX ON technical_chunks USING hnsw (embedding vector_cosine_ops);`,
            deliverableCheck: 'Consultar "SELECT * FROM pg_extension WHERE extname = \'vector\';" retornando 1 fila.'
          },
          {
            stepNumber: 2,
            title: 'Pipeline de Ingestión & Chunking Semántico',
            duration: '3.5 horas',
            explanation: 'Desarrollar script Python para segmentar documentos en bloques de 500 tokens con overlap de 50 tokens y calcular embeddings con text-embedding-004.',
            commandLanguage: 'python',
            commandOrSnippet: `from google import genai
import psycopg

ai = genai.Client()

def embed_text(text: str) -> list[float]:
    result = ai.models.embed_content(
        model="text-embedding-004",
        contents=text
    )
    return result.embeddings[0].values`,
            deliverableCheck: 'Al menos 100 fragmentos indexados correctamente en la base de datos.'
          },
          {
            stepNumber: 3,
            title: 'Construcción del StateGraph con LangGraph',
            duration: '5.0 horas',
            explanation: 'Definir el estado tipado TypedDict y enlazar los nodos de recuperación, evaluación de relevancia y generación con branching condicional.',
            commandLanguage: 'python',
            commandOrSnippet: `from langgraph.graph import StateGraph, END
from typing import TypedDict, List

class RAGState(TypedDict):
    query: str
    documents: List[dict]
    answer: str
    citations: List[str]
    is_grounded: bool

graph = StateGraph(RAGState)
graph.add_node("retrieve", retrieve_node)
graph.add_node("grade_docs", grade_docs_node)
graph.add_node("generate", generate_node)
graph.add_node("verify_grounding", verify_grounding_node)

graph.set_entry_point("retrieve")
graph.add_edge("retrieve", "grade_docs")
graph.add_edge("grade_docs", "generate")
graph.add_edge("generate", "verify_grounding")
graph.add_conditional_edges("verify_grounding", check_grounding_decision, {"pass": END, "retry": "generate"})`,
            deliverableCheck: 'El grafo compila sin ciclos infinitos y se ejecuta correctamente con mocks.'
          },
          {
            stepNumber: 4,
            title: 'Mecanismo de Citas Estructuradas y Verificación',
            duration: '4.5 horas',
            explanation: 'Forzar mediante responseSchema que la respuesta contenga citas formales con formato [Doc, Seccion, Fragmento] vinculadas a los metadatos de Postgres.',
            commandLanguage: 'python',
            commandOrSnippet: `class CitationAnswer(BaseModel):
    summary: str
    claims: list[dict] # { claim: str, source_doc: str, chunk_id: str }
    unanswered_aspects: list[str]`,
            deliverableCheck: 'El agente responde con citas verificables y rechaza contestar cuando la información no está en los documentos.'
          },
          {
            stepNumber: 5,
            title: 'API FastAPI, Pruebas y Despliegue',
            duration: '3.0 horas',
            explanation: 'Exponer el grafo a través de un endpoint streaming en FastAPI con soporte para WebSockets o Server-Sent Events (SSE).',
            commandLanguage: 'bash',
            commandOrSnippet: `poetry run pytest tests/test_rag_agent.py -v
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`,
            deliverableCheck: 'Endpoint /api/v1/chat respondiendo en streaming con citas estructuradas.'
          }
        ],
        verificationChecklist: [
          'PostgreSQL con pgvector e índice HNSW operativo.',
          'StateGraph de LangGraph con detección y recuperación ante alucinaciones.',
          'Citas explícitas en cada afirmación técnica.',
          'Test suite con pytest evaluando al menos 5 preguntas complejas.',
          'README con diagrama del grafo y documentación de setup.'
        ],
        suggestedDeliverableRepo: 'https://github.com/tu-usuario/langgraph-rag-pgvector-agent'
      }
    },
    {
      id: 'proj-3',
      phaseNumber: 5,
      requiredWeek: 30,
      title: 'Laboratorio 3: Dashboard de Métricas de Impacto, Telemetría LangSmith & FinOps',
      description: 'Sistema integral de observabilidad con LangSmith, trazabilidad de llamadas a LLMs, monitorización financiera de costo de tokens, puntos de corte Human-in-the-Loop y cálculo de ROI.',
      status: 'pending',
      labGuide: {
        objective: 'Construir un panel de control y observabilidad empresarial para sistemas de IA en producción, monitoreando latencias, consumo financiero de tokens, precisión semántica y cálculo de retorno de inversión (ROI) para la alta gerencia.',
        scenario: 'Tu organización ha puesto en producción múltiples agentes de IA. La gerencia financiera exige visibilidad total de los costos de inferencia en tiempo real, control de riesgos para acciones delicadas (Human-in-the-loop) y reportes de ahorro generado frente a horas de consultoría.',
        estimatedHours: 20,
        difficulty: 'Experto',
        prerequisites: [
          'Cuenta activa en LangSmith (smith.langchain.com)',
          'Backend en FastAPI o Node.js con métricas Prometheus / OpenTelemetry',
          'Frontend moderno para dashboard (React / Vite o Streamlit)',
          'Agentes de los Laboratorios 1 y 2 listos para instrumentar'
        ],
        architectureOverview: 'Agentes en Producción -> Instrumentación LangSmith SDK (Trazas & Spans) -> OpenTelemetry Collector -> Base de Datos de Métricas -> Motor de FinOps (Cálculo de Tokens & Ahorro) -> Dashboard React con Alertas en Tiempo Real.',
        steps: [
          {
            stepNumber: 1,
            title: 'Instrumentación Distribuida con LangSmith Tracing',
            duration: '3.0 horas',
            explanation: 'Configurar el trazado automático de todas las llamadas de los agentes, etiquetando metadatos de usuario, versión del prompt y tenant.',
            commandLanguage: 'bash',
            commandOrSnippet: `export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_ENDPOINT="https://api.smith.langchain.com"
export LANGCHAIN_API_KEY="ls__..."
export LANGCHAIN_PROJECT="carrera-ia-produccion"`,
            deliverableCheck: 'Visualizar al menos 50 trazas con árboles de nodos en el dashboard de LangSmith.'
          },
          {
            stepNumber: 2,
            title: 'Implementación del Protocolo Human-in-the-Loop (HITL)',
            duration: '4.5 horas',
            explanation: 'Añadir puntos de interrupción (`interrupt`) en el grafo antes de mutaciones irreversibles. El sistema genera un enlace de aprobación que reanuda el workflow cuando el operador humano lo autoriza.',
            commandLanguage: 'python',
            commandOrSnippet: `# Pausa condicional en LangGraph
def check_threshold_node(state):
    if state["estimated_cost"] > 50.0:
        # Pausa execution y espera human input
        return interrupt({"reason": "Costo superior a $50 USD. Requiere aprobación manual."})
    return {"approved": True}`,
            deliverableCheck: 'Flujo pausado correctamente que espera confirmación antes de proseguir.'
          },
          {
            stepNumber: 3,
            title: 'Motor FinOps de Contabilidad de Tokens y Caching',
            duration: '4.5 horas',
            explanation: 'Crear el servicio de cálculo de costos acumulados: inputs, outputs y tokens en caché (Prompt Caching con descuento 75%). Generar agregaciones diarias y por usuario.',
            commandLanguage: 'python',
            commandOrSnippet: `def calculate_token_cost(input_tokens: int, output_tokens: int, cached_tokens: int) -> float:
    cost_input = (input_tokens / 1_000_000) * 0.10
    cost_output = (output_tokens / 1_000_000) * 0.40
    cost_cached = (cached_tokens / 1_000_000) * 0.025
    return round(cost_input + cost_output + cost_cached, 6)`,
            deliverableCheck: 'Tabla de base de datos registrando costos y ahorros exactos por sesión.'
          },
          {
            stepNumber: 4,
            title: 'Desarrollo del Dashboard Ejecutivo de ROI',
            duration: '5.0 horas',
            explanation: 'Construir el panel visual con métricas de tiempo ahorrado, costo de IA frente a costo de analista humano y gráfica de retorno de inversión porcentual.',
            commandLanguage: 'bash',
            commandOrSnippet: `# Fórmula calculada en backend:
# ROI = ((Horas Ahorradas * 45 USD/h) - Costo Tokens - Costo Infra) / Costo Desarrollo * 100`,
            deliverableCheck: 'Gráficas en tiempo real de consumo y ROI accesible vía interfaz web.'
          },
          {
            stepNumber: 5,
            title: 'Consolidación del Portafolio Maestro y Graduación',
            duration: '3.0 horas',
            explanation: 'Integrar los 3 laboratorios en un repositorio mono-repo o portal centralizado con documentación ejecutiva para reclutadores y clientes.',
            commandLanguage: 'bash',
            commandOrSnippet: `git status
# Verificar que los 3 laboratorios cuentan con tests, CI/CD y demos funcionales`,
            deliverableCheck: 'Portafolio profesional completo listo para inserción laboral en IA.'
          }
        ],
        verificationChecklist: [
          'Trazado LangSmith activo con 50+ ejecuciones registradas.',
          'Mecanismo de corte Human-in-the-Loop operativo con reanudación.',
          'Motor FinOps calculando costos de tokens y caching.',
          'Dashboard interactivo con cálculo transparente de ROI.',
          'Documentación completa y presentación final del portafolio.'
        ],
        suggestedDeliverableRepo: 'https://github.com/tu-usuario/ai-observability-roi-dashboard'
      }
    },
  ],
  phases: [
    {
      id: 'phase-0',
      phaseNumber: 0,
      title: 'Fase 0: Fundamentos Analíticos',
      description: 'Bases críticas de lógica estructural, contratos JSON Schema, protocolos de red HTTP/REST y esquemas de autenticación.',
      weeksRange: 'Semanas 1 - 3',
      estimatedHours: 30,
      modules: [
        {
          id: 'mod-0-1',
          title: 'Lógica Estructural y Algoritmos de Flujo',
          description: 'Modelado de toma de decisiones, bifurcaciones de control y diagramas de flujo formalizados.',
          topics: ['Estructuras de datos básicas', 'Árboles de decisión', 'Validación de invariantes', 'Mapeo de procesos'],
          status: 'completed',
          estimatedHours: 10,
          loggedMinutes: 600,
          deliverable: {
            title: 'Diagrama de flujo formalizado para un sistema de cotizaciones',
            description: 'Documentación en Markdown y diagrama Mermaid con todas las rutas de error cubiertas.',
            completed: true,
          },
          resources: [
            { name: 'Curso de Pensamiento Lógico', type: 'Curso', url: 'https://platzi.com' },
            { name: 'Estructuras de Datos y Algoritmos', type: 'Doc', url: 'https://developer.mozilla.org' },
          ],
        },
        {
          id: 'mod-0-2',
          title: 'JSON Schema y Validación de Contratos de Datos',
          description: 'Definición estricta de esquemas JSON, tipos de datos, restricciones y validación cruzada.',
          topics: ['JSON Schema Draft 7 & 2020-12', 'Validación de propiedades requeridas', 'Transformaciones de payloads', 'Patrones Regex en JSON'],
          status: 'in_progress',
          estimatedHours: 10,
          loggedMinutes: 320,
          deliverable: {
            title: 'Especificación JSON Schema para eventos de webhook transaccionales',
            description: 'Archivo schema.json con validaciones estrictas y casos de prueba.',
            completed: false,
          },
          resources: [
            { name: 'JSON Schema Official Guide', type: 'Doc', url: 'https://json-schema.org' },
            { name: 'DeepLearning.AI: Data Engineering Basics', type: 'Curso', url: 'https://www.deeplearning.ai' },
          ],
        },
        {
          id: 'mod-0-3',
          title: 'Protocolos HTTP/REST y Autenticación Segura',
          description: 'Métodos HTTP, códigos de estado, headers, flujos OAuth2, tokens Bearer y API Keys con manejo seguro.',
          topics: ['Verbos HTTP y semántica REST', 'Códigos de estado (2xx, 4xx, 5xx)', 'Flujos OAuth2 Grant Types', 'Almacenamiento de secretos y variables de entorno'],
          status: 'not_started',
          estimatedHours: 10,
          loggedMinutes: 0,
          deliverable: {
            title: 'Cliente de peticiones HTTP en cURL / Postman con autenticación Bearer',
            description: 'Colección documentada para consumir servicios protegidos.',
            completed: false,
          },
          resources: [
            { name: 'MDN Web Docs: HTTP & Auth', type: 'Doc', url: 'https://developer.mozilla.org/docs/Web/HTTP' },
            { name: 'Platzi: Curso de API REST y Postman', type: 'Curso', url: 'https://platzi.com' },
          ],
        },
      ],
    },
    {
      id: 'phase-1',
      phaseNumber: 1,
      title: 'Fase 1: IA Aplicada y Prompting Avanzado',
      description: 'Ingeniería de prompts sistemática, técnicas de razonamiento chain-of-thought y forzado de Structured Outputs en JSON.',
      weeksRange: 'Semanas 4 - 8',
      estimatedHours: 50,
      modules: [
        {
          id: 'mod-1-1',
          title: 'Arquitectura de Prompts y Roles Sistémicos',
          description: 'Estructuración de System Instructions, Few-Shot prompting, Delimitadores claros y reducción de alucinaciones.',
          topics: ['System Instructions vs User Prompts', 'Técnicas Few-Shot y Zero-Shot', 'Técnicas de guardrail sintáctico', 'Control de temperatura y topP'],
          status: 'not_started',
          estimatedHours: 12,
          loggedMinutes: 0,
          deliverable: {
            title: 'Batería de 10 prompts productivos para clasificación y análisis',
            description: 'Repositorio de prompts testeados con matriz de casos límite.',
            completed: false,
          },
          resources: [
            { name: 'DeepLearning.AI: ChatGPT Prompt Engineering', type: 'Curso', url: 'https://www.deeplearning.ai' },
            { name: 'Google AI Studio Prompt Gallery', type: 'Doc', url: 'https://ai.google.dev' },
          ],
        },
        {
          id: 'mod-1-2',
          title: 'Razonamiento Chain-of-Thought y Descomposición de Tareas',
          description: 'Técnicas CoT, desgloses paso a paso, pensamiento profundo y autorreflexión del modelo.',
          topics: ['Chain-of-Thought (CoT)', 'ReAct reasoning loop', 'Modelos con Thinking mode', 'Autoverificación del output'],
          status: 'not_started',
          estimatedHours: 18,
          loggedMinutes: 0,
          deliverable: {
            title: 'Agente de resolución paso a paso de problemas matemáticos/financieros',
            description: 'Prompt CoT evaluado con benchmarks de consistencia.',
            completed: false,
          },
          resources: [
            { name: 'Google Cloud: Advanced Prompting Techniques', type: 'Doc', url: 'https://cloud.google.com/vertex-ai' },
            { name: 'Platzi: Inteligencia Artificial Aplicada', type: 'Curso', url: 'https://platzi.com' },
          ],
        },
        {
          id: 'mod-1-3',
          title: 'Structured Outputs forzados en JSON',
          description: 'Forzado estricto de esquemas con responseSchema, Type SDK, validación semántica e integración en pipelines.',
          topics: ['responseSchema en Gemini SDK', 'Extracción de entidades a Pydantic / TypeScript', 'Reparación automática de JSON corrupto', 'Evaluación de precisión de schema'],
          status: 'not_started',
          estimatedHours: 20,
          loggedMinutes: 0,
          deliverable: {
            title: 'Pipeline de extracción de facturas a JSON canónico estructurado',
            description: 'Pruebas con 5 facturas en texto plano convertidas en objetos validados.',
            completed: false,
          },
          resources: [
            { name: 'Google GenAI SDK: Structured Outputs Reference', type: 'Doc', url: 'https://ai.google.dev/gemini-api/docs/structured-output' },
          ],
        },
      ],
    },
    {
      id: 'phase-2',
      phaseNumber: 2,
      title: 'Fase 2: Automatización Visual (n8n & Make)',
      description: 'Orquestación de workflows empresariales, webhooks, manejo de errores Try/Catch y certificaciones oficiales de n8n Academy.',
      weeksRange: 'Semanas 9 - 14',
      estimatedHours: 60,
      modules: [
        {
          id: 'mod-2-1',
          title: 'Arquitectura de Workflows y Webhooks en n8n',
          description: 'Despliegue local de n8n con Docker, configuración de triggers por Webhook, autenticación y parseo de eventos.',
          topics: ['Docker compose para n8n', 'Triggers HTTP y Webhooks', 'Nodos de transformación de datos (Code node)', 'Variables de entorno y credenciales'],
          status: 'not_started',
          estimatedHours: 18,
          loggedMinutes: 0,
          deliverable: {
            title: 'Servidor n8n local conectado a Webhook receptor de leads',
            description: 'Workflow operativo con recepción y normalización de campos.',
            completed: false,
          },
          resources: [
            { name: 'n8n Academy: Beginner Course (Level 1)', type: 'Curso', url: 'https://academy.n8n.io' },
            { name: 'n8n Documentation', type: 'Doc', url: 'https://docs.n8n.io' },
          ],
        },
        {
          id: 'mod-2-2',
          title: 'Manejo Robusto de Errores: Try/Catch y Resiliencia',
          description: 'Control de reintentos, fallback nodes, dead-letter queues y alertas a canales como Slack o Telegram.',
          topics: ['Estrategias de error handling en n8n', 'Sub-workflows de recuperación', 'Backoff exponencial y reintentos', 'Alertas y logs centralizados'],
          status: 'not_started',
          estimatedHours: 20,
          loggedMinutes: 0,
          deliverable: {
            title: 'Sub-workflow de contingencia y alerta ante fallos en API externa',
            description: 'Flujo con simulación de errores 500 y recuperación automática.',
            completed: false,
          },
          resources: [
            { name: 'n8n Academy: Intermediate Course (Level 2)', type: 'Curso', url: 'https://academy.n8n.io' },
          ],
        },
        {
          id: 'mod-2-3',
          title: 'Integración de IA en n8n y Certificación Academy',
          description: 'Uso del nodo LangChain/AI de n8n, conexión con modelos Gemini, orquestación de agentes visuales y certificación.',
          topics: ['Nodos de IA en n8n (AI Agent node, OpenAI/Gemini)', 'Memoria de buffer en workflows', 'Evaluación y obtención de certificado n8n Level 1 & 2', 'Entrega del Proyecto 1 del portafolio'],
          status: 'not_started',
          estimatedHours: 22,
          loggedMinutes: 0,
          deliverable: {
            title: 'Proyecto 1: Flujo completo n8n integrado con IA y base de datos',
            description: 'Workflow exportado en JSON listo para producción con certificación lograda.',
            completed: false,
          },
          resources: [
            { name: 'n8n Academy Certification Exam', type: 'Curso', url: 'https://academy.n8n.io' },
          ],
        },
      ],
    },
    {
      id: 'phase-3',
      phaseNumber: 3,
      title: 'Fase 3: Python Aplicado y APIs para Automatización',
      description: 'Pipelines ETL de datos, persistencia en PostgreSQL con SQLAlchemy, peticiones asíncronas con HTTPX y APIs en FastAPI para alimentar agentes de IA y flujos automatizados.',
      weeksRange: 'Semanas 15 - 20',
      estimatedHours: 60,
      modules: [
        {
          id: 'mod-3-1',
          title: 'Pipelines ETL con Python y Pydantic',
          description: 'Extracción, transformación y carga de datos heterogéneos con tipado estricto y validación de tipos con Pydantic v2.',
          topics: ['Pydantic v2 BaseModels y validadores', 'Pandas para procesamiento tabular', 'Manejo de ficheros CSV, Parquet y JSON', 'Entornos virtuales Poetry / venv'],
          status: 'not_started',
          estimatedHours: 18,
          loggedMinutes: 0,
          deliverable: {
            title: 'Script ETL automatizado para limpieza y estandarización de catálogo',
            description: 'Código Python con tests unitarios en pytest.',
            completed: false,
          },
          resources: [
            { name: 'Pydantic v2 Documentation', type: 'Doc', url: 'https://docs.pydantic.dev' },
            { name: 'Platzi: Curso de Python Avanzado', type: 'Curso', url: 'https://platzi.com' },
          ],
        },
        {
          id: 'mod-3-2',
          title: 'Persistencia en PostgreSQL & SQLAlchemy Asíncrono',
          description: 'Diseño de esquemas relacionales, migraciones con Alembic, sesiones async y repositorios desacoplados.',
          topics: ['PostgreSQL en Docker', 'SQLAlchemy 2.0 AsyncSession', 'Patrón Repository y Unit of Work', 'Migraciones con Alembic'],
          status: 'not_started',
          estimatedHours: 22,
          loggedMinutes: 0,
          deliverable: {
            title: 'Capa de persistencia con Repositorios testeables para usuarios y tareas',
            description: 'Esquema relacional con relaciones 1:N y M:N con scripts de seed.',
            completed: false,
          },
          resources: [
            { name: 'SQLAlchemy 2.0 Unified Tutorial', type: 'Doc', url: 'https://docs.sqlalchemy.org' },
          ],
        },
        {
          id: 'mod-3-3',
          title: 'FastAPI y Endpoints Robustos para Automatización',
          description: 'Endpoints RESTful asíncronos, inyección de dependencias con Depends, modelos Pydantic, manejo de Webhooks y background tasks.',
          topics: ['Creación de APIs asíncronas con FastAPI', 'Inyección de dependencias (Depends) para clientes HTTP y DB', 'Procesamiento en segundo plano (BackgroundTasks)', 'Documentación OpenAPI autogenerada para n8n y herramientas de agentes'],
          status: 'not_started',
          estimatedHours: 20,
          loggedMinutes: 0,
          deliverable: {
            title: 'API REST en FastAPI con endpoints para webhooks e integración con agentes de IA',
            description: 'Servicio backend completo con autenticación JWT, manejo de errores y tests con pytest.',
            completed: false,
          },
          resources: [
            { name: 'FastAPI Official Documentation', type: 'Doc', url: 'https://fastapi.tiangolo.com' },
          ],
        },
      ],
    },
    {
      id: 'phase-4',
      phaseNumber: 4,
      title: 'Fase 4: RAG y Grafos de Estado con LangGraph',
      description: 'Arquitecturas ReAct, grafos de estado cíclicos, memoria a largo plazo, embeddings e incrustaciones vectoriales con pgvector.',
      weeksRange: 'Semanas 21 - 26',
      estimatedHours: 60,
      modules: [
        {
          id: 'mod-4-1',
          title: 'Embeddings y Base Vectorial con pgvector',
          description: 'Generación de incrustaciones vectoriales, métricas de distancia (coseno, L2), indexación HNSW/IVFFlat y búsqueda híbrida.',
          topics: ['Modelos de embedding (text-embedding-004)', 'Extensión pgvector en PostgreSQL', 'Índices HNSW para latencia sub-10ms', 'Chunking semántico de documentos'],
          status: 'not_started',
          estimatedHours: 18,
          loggedMinutes: 0,
          deliverable: {
            title: 'Motor de búsqueda semántica sobre base de conocimiento técnica',
            description: 'Script de ingestión y endpoint de consulta por similitud.',
            completed: false,
          },
          resources: [
            { name: 'DeepLearning.AI: Vector Databases', type: 'Curso', url: 'https://www.deeplearning.ai' },
            { name: 'pgvector GitHub & Documentation', type: 'Repo', url: 'https://github.com/pgvector/pgvector' },
          ],
        },
        {
          id: 'mod-4-2',
          title: 'Arquitecturas ReAct y Function Calling',
          description: 'Llamada de herramientas (tools), validación de parámetros devueltos por el LLM y bucle de razonamiento autónomo.',
          topics: ['Function calling en Google GenAI y OpenAI', 'Tools desacopladas con typing estricto', 'Manejo de errores en ejecución de herramientas', 'Evitar bucles infinitos de llamada'],
          status: 'not_started',
          estimatedHours: 20,
          loggedMinutes: 0,
          deliverable: {
            title: 'Agente autónomo capaz de consultar APIs del clima, divisas y base de datos',
            description: 'Implementación con 3 tools reales ejecutables.',
            completed: false,
          },
          resources: [
            { name: 'Google AI Studio: Function Calling Reference', type: 'Doc', url: 'https://ai.google.dev/docs' },
          ],
        },
        {
          id: 'mod-4-3',
          title: 'LangGraph: Grafos Cíclicos de Estado y Memoria',
          description: 'StateGraph, checkpoints de estado persistente, ramas condicionales y entrega del Proyecto 2.',
          topics: ['StateGraph y Annotated State', 'Nodos, Edges y Conditional Edges', 'Checkpointers para reanudación de sesión', 'Entrega de Proyecto 2: Agente RAG con citas'],
          status: 'not_started',
          estimatedHours: 22,
          loggedMinutes: 0,
          deliverable: {
            title: 'Proyecto 2: Agente RAG Especializado con Citas Explícitas y LangGraph',
            description: 'Grafo de decisión con validación de alucinación y citas de fuentes verificables.',
            completed: false,
          },
          resources: [
            { name: 'LangGraph Official Documentation', type: 'Doc', url: 'https://langchain-ai.github.io/langgraph/' },
            { name: 'DeepLearning.AI: AI Agents in LangGraph', type: 'Curso', url: 'https://www.deeplearning.ai' },
          ],
        },
      ],
    },
    {
      id: 'phase-5',
      phaseNumber: 5,
      title: 'Fase 5: Observabilidad, MLOps y Portafolio de Impacto',
      description: 'Trazabilidad con LangSmith, telemetría de costos financieros de tokens, puntos de intervención humana (HITL) y cálculo de ROI.',
      weeksRange: 'Semanas 27 - 30',
      estimatedHours: 40,
      modules: [
        {
          id: 'mod-5-1',
          title: 'Trazado y Telemetría con LangSmith',
          description: 'Instrumentación de llamadas a LLMs, visualización de árboles de ejecución, latencias por nodo y métricas de error.',
          topics: ['Configuración de LangSmith Tracing', 'Etiquetado y metadatos de usuario', 'Detección de cuellos de botella de latencia', 'Feedback loops y recolección de fallos'],
          status: 'not_started',
          estimatedHours: 12,
          loggedMinutes: 0,
          deliverable: {
            title: 'Instrumentación completa del agente con trazas registradas en LangSmith',
            description: 'Panel con 50 ejecuciones y análisis de latencia.',
            completed: false,
          },
          resources: [
            { name: 'LangSmith Quickstart Guide', type: 'Doc', url: 'https://docs.smith.langchain.com' },
          ],
        },
        {
          id: 'mod-5-2',
          title: 'Human-in-the-Loop y FinOps de Tokens',
          description: 'Intervención humana para acciones de alto riesgo (aprobación de transacciones), cálculo de coste financiero de tokens y optimización.',
          topics: ['Interrupts en LangGraph para aprobación humana', 'Cálculo de costo de tokens input/output/cached', 'Estrategias de compresión de contexto', 'Métricas de ahorro y retorno de inversión'],
          status: 'not_started',
          estimatedHours: 14,
          loggedMinutes: 0,
          deliverable: {
            title: 'Módulo de aprobación humana con reporte de costos por ejecución',
            description: 'Simulador de auditoría financiera por cada 10,000 llamadas.',
            completed: false,
          },
          resources: [
            { name: 'FinOps for AI & Token Economics Guide', type: 'Doc', url: 'https://cloud.google.com' },
          ],
        },
        {
          id: 'mod-5-3',
          title: 'Dashboard de Métricas ROI y Portafolio Final',
          description: 'Consolidación de los 3 proyectos del portafolio, dashboard de métricas de impacto empresarial y presentación lista para el mercado.',
          topics: ['Métricas clave: Tiempo ahorrado, tasa de éxito, coste vs valor humano', 'Despliegue del portafolio en producción', 'Documentación de arquitectura (ADRs)', 'Presentación final y graduación'],
          status: 'not_started',
          estimatedHours: 14,
          loggedMinutes: 0,
          deliverable: {
            title: 'Proyecto 3: Dashboard de Métricas de Impacto y ROI de IA',
            description: 'Portafolio maestro con los 3 entregables operativos validados.',
            completed: false,
          },
          resources: [
            { name: 'Guía de Creación de Portafolio Técnico de Alto Impacto', type: 'Doc', url: 'https://github.com' },
          ],
        },
      ],
    },
  ],
};

export const MULTI_AGENT_AI_ROADMAP: StudyRoadmap = {
  id: 'roadmap-multi-agent-automation-12w',
  title: 'Especialización: Sistemas Multi-Agente & Automatización Autónoma',
  description: 'Ruta avanzada para diseñar redes de agentes inteligentes con LangGraph, CrewAI, Tool Calling y orquestación distribuida para automatizar procesos de negocio.',
  category: 'Inteligencia Artificial y Automatización',
  totalWeeks: 12,
  weeklyHoursBudget: 8,
  targetPace: 'Balanceado',
  preferredDays: ['Martes', 'Jueves', 'Sábado'],
  startDate: new Date().toISOString().split('T')[0],
  isFlagship: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  portfolioProjects: [
    {
      id: 'proj-ma-1',
      phaseNumber: 3,
      requiredWeek: 12,
      title: 'Sistema Multi-Agente Autónomo con LangGraph, n8n y Supervisión',
      description: 'Red distribuida de agentes de IA con enrutador semántico, memoria persistente en Redis, ejecución de herramientas n8n y panel de supervisión.',
      status: 'pending',
    },
  ],
  phases: [
    {
      id: 'ma-phase-1',
      phaseNumber: 1,
      title: 'Fase 1: Fundamentos de Agentes y Herramientas (Tool Calling)',
      description: 'Modelos de lenguaje como motores de razonamiento, Function Calling y esquemas JSON estrictos.',
      weeksRange: 'Semanas 1 - 4',
      estimatedHours: 32,
      modules: [
        {
          id: 'ma-mod-1',
          title: 'Function Calling y Tool Use con Modelos Gemini',
          description: 'Definición de herramientas estructuradas, validación de parámetros con Pydantic y ejecución segura.',
          topics: ['Function calling nativo', 'Pydantic schemas para herramientas', 'Manejo de errores en ejecución de tools', 'Políticas de timeout'],
          status: 'not_started',
          estimatedHours: 16,
          loggedMinutes: 0,
          deliverable: {
            title: 'Agente autónomo capaz de consultar APIs meteorológicas, bases de datos y cálculo dinámico',
            description: 'Código Python estructurado con llamadas a tools.',
            completed: false,
          },
          resources: [
            { name: 'Documentación Oficial de LangChain Tools', type: 'Doc', url: 'https://python.langchain.com' },
          ],
        },
        {
          id: 'ma-mod-2',
          title: 'Memoria y Contexto en Agentes Autónomos',
          description: 'Gestión de buffers de memoria, compresión semántica de historial y ventanas de contexto.',
          topics: ['Memoria episódica vs semántica', 'Compresión de prompts', 'Checkpoints en SQLite y Redis', 'Manejo de estados conversacionales'],
          status: 'not_started',
          estimatedHours: 16,
          loggedMinutes: 0,
          deliverable: {
            title: 'Sistema de memoria persistente para agente con capacidad de recordar preferencias',
            description: 'Implementación con persistencia en SQLite.',
            completed: false,
          },
          resources: [
            { name: 'Guía de Memoria en Agentes de IA', type: 'Doc', url: 'https://langchain-ai.github.io' },
          ],
        },
      ],
    },
    {
      id: 'ma-phase-2',
      phaseNumber: 2,
      title: 'Fase 2: Grafos de Estado y Flujos Cíclicos con LangGraph',
      description: 'Orquestación de agentes como máquinas de estado finitas con nodos, aristas condicionales y ciclos de corrección.',
      weeksRange: 'Semanas 5 - 8',
      estimatedHours: 32,
      modules: [
        {
          id: 'ma-mod-3',
          title: 'Arquitectura de Nodos y Reducción de Estado en LangGraph',
          description: 'Definición de TypedDict para el estado del grafo, nodos ejecutores y evaluación de condiciones.',
          topics: ['StateGraph y CompiledGraph', 'Annotated con add_messages', 'Aristas condicionales (Router edges)', 'Manejo de interrupciones'],
          status: 'not_started',
          estimatedHours: 16,
          loggedMinutes: 0,
          deliverable: {
            title: 'Grafo de control con ciclo de auto-corrección de código con LLM',
            description: 'Flujo que genera, prueba y corrige código automáticamente.',
            completed: false,
          },
          resources: [
            { name: 'LangGraph Official Docs & Tutorials', type: 'Doc', url: 'https://langchain-ai.github.io/langgraph/' },
          ],
        },
        {
          id: 'ma-mod-4',
          title: 'Patrón Supervisor y Redes Multi-Agente',
          description: 'Coordinación entre un agente líder que delega tareas a agentes especializados (Investigador, Redactor, Crítico).',
          topics: ['Patrón Supervisor vs Red Peer-to-Peer', 'Handoffs entre agentes', 'Estructuración de respuestas intermedias', 'Límites de iteraciones'],
          status: 'not_started',
          estimatedHours: 16,
          loggedMinutes: 0,
          deliverable: {
            title: 'Red multi-agente para investigación de mercado y síntesis ejecutiva',
            description: 'Ejecución coordinada con 3 agentes especializados.',
            completed: false,
          },
          resources: [
            { name: 'Multi-Agent Architectures Overview', type: 'Doc', url: 'https://blog.langchain.dev' },
          ],
        },
      ],
    },
    {
      id: 'ma-phase-3',
      phaseNumber: 3,
      title: 'Fase 3: Integración de Agentes con n8n, Webhooks y Producción',
      description: 'Conexión de agentes con flujos de trabajo empresariales y supervisión humana (Human-in-the-loop).',
      weeksRange: 'Semanas 9 - 12',
      estimatedHours: 32,
      modules: [
        {
          id: 'ma-mod-5',
          title: 'Webhooks Bidireccionales y Conexión LangGraph con n8n',
          description: 'Disparo de agentes desde eventos de n8n y ejecución de sub-flujos de automatización desde los agentes.',
          topics: ['Webhooks asíncronos', 'FastAPI bridge para LangGraph', 'Nodos AI Agent de n8n', 'Formato de respuestas estructuradas'],
          status: 'not_started',
          estimatedHours: 16,
          loggedMinutes: 0,
          deliverable: {
            title: 'Integración completa: Webhook de entrada -> Agente IA -> Flujo automatizado de n8n',
            description: 'Pipeline end-to-end testeable.',
            completed: false,
          },
          resources: [
            { name: 'n8n AI Agent Integration Guide', type: 'Doc', url: 'https://docs.n8n.io' },
          ],
        },
        {
          id: 'ma-mod-6',
          title: 'Human-in-the-Loop y Despliegue de Agentes',
          description: 'Pausa para aprobación humana en acciones críticas, observabilidad con LangSmith y métricas.',
          topics: ['Interrupciones humanas en LangGraph', 'Aprobaciones por email o Slack', 'Trazabilidad con LangSmith', 'Contención de costos de tokens'],
          status: 'not_started',
          estimatedHours: 16,
          loggedMinutes: 0,
          deliverable: {
            title: 'Proyecto Final: Sistema Multi-Agente con Aprobación Humana y Telemetría',
            description: 'Despliegue operativo listo para producción.',
            completed: false,
          },
          resources: [
            { name: 'LangSmith Observability Documentation', type: 'Doc', url: 'https://docs.smith.langchain.com' },
          ],
        },
      ],
    },
  ],
};
