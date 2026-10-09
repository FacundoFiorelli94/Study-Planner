import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize GoogleGenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper for model fallback
function getEffectiveModel(requestedModel?: string): string {
  if (requestedModel === "gemini-3.1-pro-preview") {
    return "gemini-3.1-pro-preview";
  }
  if (requestedModel === "gemini-3.1-flash-lite") {
    return "gemini-3.1-flash-lite";
  }
  return "gemini-3.5-flash";
}

// 1. Multi-turn Chat API with Gemini, High Thinking mode and Google Search Grounding
app.post("/api/chat", async (req, res) => {
  try {
    const {
      messages = [],
      model = "gemini-3.5-flash",
      systemInstruction = "Eres un mentor de estudio técnico y arquitecto de software de alto nivel.",
      enableHighThinking = false,
      useGoogleSearch = false,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Se requiere un array de mensajes no vacío." });
    }

    // If Google Search is requested, use gemini-3.5-flash
    const selectedModel = useGoogleSearch ? "gemini-3.5-flash" : getEffectiveModel(model);

    // Format contents for Gemini SDK
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const config: any = {
      systemInstruction,
    };

    if (useGoogleSearch) {
      config.tools = [{ googleSearch: {} }];
    } else if (enableHighThinking || selectedModel === "gemini-3.1-pro-preview") {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
      // Important: Do not set maxOutputTokens when using thinking
    }

    try {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config,
      });

      const responseText = response.text || "No se pudo generar respuesta.";

      // Extract search grounding metadata if available
      const groundingChunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks;
      const searchSources = groundingChunks
        ?.map((c: any) => (c.web?.uri ? { title: c.web.title || c.web.uri, url: c.web.uri } : null))
        .filter(Boolean) || [];

      return res.json({
        response: responseText,
        modelUsed: selectedModel,
        highThinkingEnabled: Boolean(!useGoogleSearch && (enableHighThinking || selectedModel === "gemini-3.1-pro-preview")),
        groundedWithSearch: Boolean(useGoogleSearch),
        sources: searchSources,
      });
    } catch (modelError: any) {
      console.warn(`Error with ${selectedModel}, falling back to gemini-3.5-flash:`, modelError?.message);
      
      // Graceful fallback to gemini-3.5-flash if pro-preview encounters permission or rate limits
      if (selectedModel !== "gemini-3.5-flash") {
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction,
          },
        });
        return res.json({
          response: fallbackResponse.text || "Respuesta generada con modelo de respaldo.",
          modelUsed: "gemini-3.5-flash (respaldo)",
          highThinkingEnabled: false,
          warning: "Se utilizó gemini-3.5-flash debido a restricciones temporales del modelo pro.",
        });
      }
      throw modelError;
    }
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message || "Error procesando mensaje con Gemini." });
  }
});

// Audio Transcription API using gemini-3.5-transcribe
app.post("/api/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm" } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: "Se requiere audioBase64." });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType.split(";")[0], // Clean mime type (e.g., audio/webm)
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          audioPart,
          { text: "Transcribe fielmente el contenido hablado en este audio. Devuelve exclusivamente el texto transcrito sin comentarios ni prefacios." },
        ],
      },
    });

    const transcription = response.text?.trim() || "";
    return res.json({ text: transcription });
  } catch (error: any) {
    console.error("Transcription error:", error);
    res.status(500).json({ error: error.message || "Error al transcribir el audio con gemini-3.5-transcribe." });
  }
});

// 2. Intelligent Roadmap Generator based on user available time & goals
app.post("/api/planner/generate", async (req, res) => {
  try {
    const {
      topic = "Automatización con IA y Clean Architecture",
      weeklyHours = 8,
      preferredDays = ["Lunes", "Miércoles", "Viernes", "Sábado"],
      currentLevel = "Intermedio",
      targetWeeks = 12,
      notes = "",
    } = req.body;

    const prompt = `Actúa como un Arquitecto de Software y Especialista en Pedagogía Técnica.
Diseña una ruta de estudio personalizada e hiper-estructurada con las siguientes restricciones del alumno:
- Tema/Objetivo: "${topic}"
- Disponibilidad semanal: ${weeklyHours} horas por semana
- Días dedicados: ${preferredDays.join(", ")}
- Nivel actual: ${currentLevel}
- Duración deseada: ${targetWeeks} semanas
- Notas y contexto adicional: "${notes}"

Debes calcular exactamente la cantidad de semanas y horas requeridas para cada fase, garantizando entregables reales de portafolio y recursos oficiales recomendados.
Genera la respuesta estrictamente con el siguiente esquema JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            totalWeeks: { type: Type.INTEGER },
            totalEstimatedHours: { type: Type.INTEGER },
            targetPace: { type: Type.STRING, description: "Intensivo, Balanceado o Sostenible" },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  weeksRange: { type: Type.STRING, description: "ej: Semanas 1-3" },
                  estimatedHours: { type: Type.INTEGER },
                  modules: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        topics: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        deliverable: { type: Type.STRING, description: "Proyecto o entregable concreto" },
                        resources: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              type: { type: Type.STRING, description: "Documentación, Curso, Video o Práctica" },
                              url: { type: Type.STRING },
                            },
                            required: ["name", "type"],
                          },
                        },
                        estimatedHours: { type: Type.INTEGER },
                      },
                      required: ["id", "title", "topics", "deliverable", "estimatedHours"],
                    },
                  },
                },
                required: ["phaseNumber", "title", "description", "weeksRange", "estimatedHours", "modules"],
              },
            },
            weeklySchedulePlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  suggestedFocus: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                },
                required: ["day", "suggestedFocus", "durationMinutes"],
              },
            },
            methodologyAdvice: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["title", "description", "totalWeeks", "totalEstimatedHours", "phases", "weeklySchedulePlan"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Planner generation error:", error);
    res.status(500).json({ error: error.message || "Error al generar la ruta de estudio." });
  }
});

// 3. Interactive Technical Challenge & Evaluation for Milestone Verification
app.post("/api/study/evaluate", async (req, res) => {
  try {
    const { moduleTitle, phaseTitle, topics = [], userCodeOrAnswer = "" } = req.body;

    const prompt = `Actúa como un Evaluador Técnico de élite (Arquitecto SOLID y Mentor de IA).
El estudiante está estudiando el módulo "${moduleTitle}" de la fase "${phaseTitle}".
Temas cubiertos: ${topics.join(", ")}.

Respuesta o código entregado por el estudiante:
"""
${userCodeOrAnswer || "El estudiante solicita un desafío técnico interactivo para evaluar su comprensión."}
"""

Evalúa su respuesta o, si no envió código/solución previa, plantea un desafío técnico práctico puntual (ejemplo: diseñar un JSON schema con validación, estructurar un endpoint Clean Architecture, o un grafo ReAct).
Proporciona:
1. Feedback constructivo y directo.
2. Calificación del 1 al 100.
3. Sugerencia de mejora o solución de referencia.
4. Si se considera APROBADO (score >= 70).
Devuelve estrictamente en JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            passed: { type: Type.BOOLEAN },
            summaryFeedback: { type: Type.STRING },
            detailedCritique: { type: Type.STRING },
            recommendedAction: { type: Type.STRING },
            followUpChallenge: { type: Type.STRING },
          },
          required: ["score", "passed", "summaryFeedback", "detailedCritique", "recommendedAction"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Evaluation error:", error);
    res.status(500).json({ error: error.message || "Error evaluando el hito de estudio." });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
