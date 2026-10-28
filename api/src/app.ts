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
    new GroqSceneNarrator(config.groqKey, config.model),
  ),
) {
  const app = express();
  app.disable("x-powered-by");

  // Security: block cross-origin mutating requests
  app.use((req, res, next) => {
    res.set("X-Request-ID", randomUUID());
    const origin = req.get("origin");
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && origin && !config.allowedOrigins.includes(origin)) {
      return res.status(403).json({ error: "Cross-origin writes are blocked." });
    }
    next();
  });

  app.use(express.json({ limit: "4kb" }));

  // Health and readiness check
  app.get("/api/health", (_req, res) =>
    res.json({
      status: "ok",
      model: config.model,
      aiReady: Boolean(config.groqKey),
    }),
  );

  app.use("/api", hauntingRouter(service));

  // Central error boundary
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
    if (error instanceof NarrationError && error.retryAfter) {
      res.set("Retry-After", String(error.retryAfter));
    }
    if (status === 500) {
      console.error("Room 404 internal error", req.path, message);
    }
    res.status(status).json({ error: status === 500 ? "The hotel stopped responding." : message });
  };

  app.use(onError);
  return app;
}
