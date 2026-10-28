import { config as loadDotEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface AppConfig {
  readonly port: number;
  readonly host: string;
  readonly groqKey: string;
  readonly model: string;
  readonly dataDir: string;
  readonly allowedOrigins: readonly string[];
}

const DEFAULT_PORT = 4000;
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_MODEL = "gemma2-9b-it";
const DEFAULT_DATA_DIR = "data";
const DEFAULT_ALLOWED_ORIGINS = ["http://127.0.0.1:3000", "http://localhost:3000"];

export function loadConfig(): AppConfig {
  const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
  loadDotEnv({ path: path.join(projectRoot, ".env") });

  const rawPort = process.env.API_PORT;
  const port = rawPort ? Number(rawPort) : DEFAULT_PORT;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`API_PORT must be a valid port number between 1 and 65535, received: "${rawPort}"`);
  }

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;

  return {
    port,
    host: process.env.API_HOST || DEFAULT_HOST,
    groqKey: process.env.GROQ_API_KEY?.trim() || "",
    model: process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL,
    dataDir: path.resolve(projectRoot, process.env.DATA_DIR || DEFAULT_DATA_DIR),
    allowedOrigins,
  };
}
