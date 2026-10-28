import { Router } from "express";
import { HauntingService } from "../application/haunting-service.js";
import { GameRuleError } from "../domain/game.js";

export function hauntingRouter(service: HauntingService): Router {
  const router = Router();

  router.post("/sessions", async (req, res) => {
    const alias = req.body?.alias === undefined ? "GUEST" : req.body.alias;
    if (typeof alias !== "string") throw new GameRuleError("Guest alias must be text.");
    res.status(201).json(await service.start(alias));
  });

  router.get("/sessions/:id", async (req, res) => {
    res.json(await service.get(String(req.params.id)));
  });

  router.post("/sessions/:id/actions", async (req, res) => {
    const { actionId, question = "" } = req.body ?? {};
    if (typeof actionId !== "string" || actionId.length > 40 || typeof question !== "string" || question.length > 140) {
      throw new GameRuleError("Choose an action and keep speech under 140 characters.");
    }
    res.json(await service.act(String(req.params.id), actionId, question));
  });

  router.get("/sessions/:id/export", async (req, res) => {
    const { filename, markdown } = await service.export(String(req.params.id));
    res.type("text/markdown").set("Content-Disposition", `attachment; filename="${filename}"`).send(markdown);
  });

  return router;
}
