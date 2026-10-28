import { Router } from "express";
import { HauntingService } from "../application/haunting-service.js";
import { GAME_CONSTANTS } from "../domain/constants.js";
import { GameRuleError } from "../domain/game.js";

export function hauntingRouter(service: HauntingService): Router {
  const router = Router();

  router.post("/sessions", async (req, res) => {
    const alias = req.body?.alias === undefined ? "GUEST" : req.body.alias;
    if (typeof alias !== "string") {
      throw new GameRuleError("Guest alias must be text.");
    }
    const started = await service.start(alias);
    res.status(201).json(started);
  });

  router.get("/sessions/:id", async (req, res) => {
    const session = await service.get(String(req.params.id));
    res.json(session);
  });

  router.post("/sessions/:id/actions", async (req, res) => {
    const { actionId, question = "" } = req.body ?? {};
    if (
      typeof actionId !== "string" ||
      actionId.length > GAME_CONSTANTS.MAX_ACTION_ID_LENGTH ||
      typeof question !== "string" ||
      question.length > GAME_CONSTANTS.MAX_SPEECH_LENGTH
    ) {
      throw new GameRuleError(
        `Choose an action and keep speech under ${GAME_CONSTANTS.MAX_SPEECH_LENGTH} characters.`,
      );
    }
    const updated = await service.act(String(req.params.id), actionId, question);
    res.json(updated);
  });

  router.get("/sessions/:id/export", async (req, res) => {
    const { filename, markdown } = await service.export(String(req.params.id));
    res
      .type("text/markdown")
      .set("Content-Disposition", `attachment; filename="${filename}"`)
      .send(markdown);
  });

  return router;
}
