import { randomUUID } from "node:crypto";
import express, { type ErrorRequestHandler } from "express";
import { HauntingService, VisitBusyError } from "./modules/haunting/application/haunting-service.js";
import { GameRuleError, NarrationValidationError } from "./modules/haunting/domain/game.js";
import { FileVisitRepository, VisitNotFoundError } from "./modules/haunting/infrastructure/file-visit-repository.js";
import { GroqSceneNarrator, NarrationError } from "./modules/haunting/infrastructure/groq-scene-narrator.js";
import { hauntingRouter } from "./modules/haunting/http/haunting-router.js";
import type { AppConfig } from "./shared/config.js";

export function createApp(
  config: AppConfig,
  service = new HauntingService(
    new FileVisitRepository(config.dataDir),
    new GroqSceneNarrator(config.groqKey, config.model, config.ollamaUrl),
  ),
) {
  const app = express();
  app.disable("x-powered-by");

  app.use((req, res, next) => {
    res.set("X-Request-ID", randomUUID());
    const origin = req.get("origin");
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && origin && !config.allowedOrigins.includes(origin)) {
      return res.status(403).json({ error: "Cross-origin writes are blocked." });
    }
    next();
  });

  app.use(express.json({ limit: "4kb" }));

  app.get("/api/health", (_req, res) =>
    res.json({
      status: "ok",
      model: config.model,
      aiReady: Boolean(config.groqKey || config.ollamaUrl),
      isLocal: Boolean(config.ollamaUrl),
      elevenLabsEnabled: Boolean(config.elevenLabsKey),
    }),
  );

  app.post("/api/whisper-audio", async (req, res) => {
    if (!config.elevenLabsKey) return res.status(501).json({ error: "ElevenLabs not configured." });
    const text = typeof req.body?.text === "string" ? req.body.text.trim().slice(0, 200) : "";
    if (!text) return res.status(400).json({ error: "Missing whisper text." });
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.elevenLabsVoiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": config.elevenLabsKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: { stability: 0.85, similarity_boost: 0.75, style: 0.5 },
        }),
      });
      if (!response.ok) return res.status(502).json({ error: "Voice generation failed." });
      res.setHeader("Content-Type", "audio/mpeg");
      const buffer = Buffer.from(await response.arrayBuffer());
      res.send(buffer);
    } catch {
      res.status(502).json({ error: "Voice channel timed out." });
    }
  });

  app.use("/api", hauntingRouter(service));

  const onError: ErrorRequestHandler = (error: unknown, req, res, _next) => {
    if (error instanceof SyntaxError && "status" in error && error.status === 400) {
      return void res.status(400).json({ error: "Send valid JSON." });
    }
    const status =
      error instanceof GameRuleError
        ? 400
        : error instanceof VisitNotFoundError
          ? 404
          : error instanceof VisitBusyError
            ? 409
            : error instanceof NarrationError
              ? error.status
              : error instanceof NarrationValidationError
                ? 502
                : 500;

    const message = error instanceof Error ? error.message : "The hotel stopped responding.";
    if (error instanceof NarrationError && error.retryAfter) res.set("Retry-After", String(error.retryAfter));
    if (status === 500) console.error("Room 404 internal error", req.path, message);
    res.status(status).json({ error: status === 500 ? "The hotel stopped responding." : message });
  };

  app.use(onError);
  return app;
}
