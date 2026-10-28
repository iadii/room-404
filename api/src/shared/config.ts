import { config as loadDotEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type AppConfig = {
  port: number;
  host: string;
  groqKey: string;
  model: string;
  ollamaUrl: string;
  elevenLabsKey: string;
  elevenLabsVoiceId: string;
  dataDir: string;
  allowedOrigins: string[];
};

export function loadConfig(): AppConfig {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  loadDotEnv({ path: path.join(root, ".env") });
  const port = Number(process.env.API_PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("API_PORT must be a valid port.");
  return {
    port,
    host: "[IP_ADDRESS]",
    groqKey: process.env.GROQ_API_KEY || "",
    model: process.env.GROQ_MODEL || "gemma2-9b-it",
    ollamaUrl: process.env.OLLAMA_BASE_URL || "",
    elevenLabsKey: process.env.ELEVENLABS_API_KEY || "",
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB",
    dataDir: path.resolve(root, process.env.DATA_DIR || "data"),
    allowedOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
  };
}
