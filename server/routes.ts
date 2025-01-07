import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import session from "express-session";
import MemoryStore from "memorystore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Declare session type
declare module "express-session" {
  interface SessionData {
    messages: Array<{ role: string; content: string }>;
    currentStep: number;
    userData: {
      basicInfo?: {
        name: string;
        age: string;
        location: string;
      };
      passion?: string;
      influencer?: string;
    };
  }
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

if (!process.env.ELEVEN_LABS_API_KEY) {
  throw new Error("Missing ELEVEN_LABS_API_KEY environment variable");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const promptPath = path.join(process.cwd(), "attached_assets", "veritas-prompt.txt");

console.log("Current directory:", process.cwd());
console.log("Loading prompt from:", promptPath);

const CONVERSATION_STEPS = {
  BASIC_INFO: 0,
  PASSION: 1,
  INFLUENCER: 2,
  MISSION_START: 3
};

let DR_VERITAS_PROMPT: string;
try {
  DR_VERITAS_PROMPT = fs.readFileSync(promptPath, "utf-8");
  console.log("Prompt loaded successfully");
} catch (error) {
  console.error("Error loading prompt:", error);
  throw new Error("Failed to load veritas-prompt.txt");
}

export function registerRoutes(app: Express): Server {
  const MemoryStoreSession = MemoryStore(session);

  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MemoryStoreSession({
        checkPeriod: 86400000,
      }),
      resave: false,
      secret: "dr_veritas_secret",
      saveUninitialized: true,
    })
  );

  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      console.log("Received message:", message);

      if (!req.session.messages) {
        console.log("Initializing new conversation");
        req.session.messages = [
          {
            role: "system",
            content: DR_VERITAS_PROMPT
          }
        ];
        req.session.currentStep = CONVERSATION_STEPS.BASIC_INFO;
        req.session.userData = {};
      }

      req.session.messages.push({
        role: "user",
        content: message
      });

      let contextMessage;
      switch (req.session.currentStep) {
        case CONVERSATION_STEPS.BASIC_INFO:
          contextMessage = {
            role: "system",
            content: `Sos el Dr. Veritas, un científico interdimensional excéntrico. 
            Presentate brevemente mencionando tu misión de combatir la desinformación en el multiverso.
            Luego, preguntá el nombre, edad y ubicación del recluta, manteniendo un tono científico y misterioso.
            No des explicaciones largas aún.`
          };
          break;
        case CONVERSATION_STEPS.PASSION:
          contextMessage = {
            role: "system",
            content: `Con entusiasmo científico, preguntá "¿Qué te apasiona en la vida?". 
            Mencioná que esta información es crucial para calibrar los instrumentos interdimensionales.`
          };
          break;
        case CONVERSATION_STEPS.INFLUENCER:
          contextMessage = {
            role: "system",
            content: `Preguntá sobre su influencer o creador de contenido favorito. 
            Mencioná que necesitás esta información para mapear las líneas de información que siguen en su dimensión.`
          };
          break;
        case CONVERSATION_STEPS.MISSION_START:
          contextMessage = {
            role: "system",
            content: `Basándote en sus intereses (${req.session.userData?.passion}) 
            y sus influencers favoritos (${req.session.userData?.influencer}), 
            inicia la misión dramáticamente. Describe cómo el multiverso está al borde del colapso 
            por la desinformación y necesitás su ayuda específica. Usa referencias a sus intereses 
            para personalizar la narrativa.`
          };
          break;
      }

      console.log("Sending request to OpenAI...");
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [...req.session.messages, contextMessage].map(msg => ({
          role: msg.role as "system" | "user" | "assistant",
          content: msg.content
        })),
        temperature: 0.9
      });

      const assistantMessage = response.choices[0].message.content;
      if (!assistantMessage) {
        throw new Error("Empty response from OpenAI");
      }

      req.session.messages.push({
        role: "assistant",
        content: assistantMessage
      });

      // Process user responses and advance steps
      if (message.length > 2) {
        switch (req.session.currentStep) {
          case CONVERSATION_STEPS.BASIC_INFO:
            if (message.includes(" ")) { // Simple check if response contains basic info
              req.session.userData = req.session.userData || {};
              req.session.userData.basicInfo = {
                name: message.split(" ")[0],
                age: message.split(" ")[1],
                location: message.split(" ").slice(2).join(" ")
              };
              req.session.currentStep = CONVERSATION_STEPS.PASSION;
            }
            break;
          case CONVERSATION_STEPS.PASSION:
            req.session.userData = req.session.userData || {};
            req.session.userData.passion = message;
            req.session.currentStep = CONVERSATION_STEPS.INFLUENCER;
            break;
          case CONVERSATION_STEPS.INFLUENCER:
            req.session.userData = req.session.userData || {};
            req.session.userData.influencer = message;
            req.session.currentStep = CONVERSATION_STEPS.MISSION_START;
            break;
        }
      }

      res.json({ message: assistantMessage });
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      res.status(500).json({ error: "Failed to process message", details: error.message });
    }
  });

  app.post("/api/synthesize", async (req, res) => {
    try {
      const { text } = req.body;
      console.log("Synthesizing text:", text);

      if (!process.env.ELEVEN_LABS_API_KEY) {
        throw new Error("ElevenLabs API key is missing");
      }

      const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/Fahco4VZzobUeiPqni1S", {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.85,
            style: 0.35,
            use_speaker_boost: true
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs API error response:", errorText);
        throw new Error(`ElevenLabs API returned ${response.status}: ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(Buffer.from(arrayBuffer));
    } catch (error: any) {
      console.error("ElevenLabs API error:", error);
      res.status(500).json({ error: "Speech synthesis failed", details: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}