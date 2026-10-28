import { completeTurn, newVisit, planAction, planOpening, publicView } from "../domain/game.js";
import type { SceneNarrator, VisitRepository } from "./ports.js";

export class VisitBusyError extends Error {}

export class HauntingService {
  private readonly inFlight = new Set<string>();

  constructor(private readonly visits: VisitRepository, private readonly narrator: SceneNarrator) {}

  async start(alias: string) {
    const plan = planOpening(newVisit(alias));
    const narration = await this.narrator.generate(plan.visit, plan.mode, plan.prompt);
    const visit = completeTurn(plan, narration);
    await this.visits.save(visit);
    return publicView(visit);
  }

  async get(id: string) { return publicView(await this.visits.load(id)); }

  async act(id: string, actionId: string, question = "") {
    if (this.inFlight.has(id)) throw new VisitBusyError("The hotel is already responding. Wait for it.");
    this.inFlight.add(id);
    try {
      const plan = planAction(await this.visits.load(id), actionId, question);
      const narration = await this.narrator.generate(plan.visit, plan.mode, plan.prompt);
      const visit = completeTurn(plan, narration);
      await this.visits.save(visit);
      return publicView(visit);
    } finally { this.inFlight.delete(id); }
  }

  async export(id: string) {
    const visit = await this.visits.load(id);
    const lines = ["# Room 404 — case transcript", "", "An original fictional horror experience. No real guest or emergency is depicted.", "",
      `Guest alias: ${visit.alias}`, `Ending: ${visit.ending ?? "unfinished"}`, "",
      ...visit.scenes.flatMap((scene, index) => [`## ${index + 1}. ${scene.room.toUpperCase()} — ${scene.action}`, "", scene.prose, "", `> ${scene.whisper}`, "", `Manifestation: ${scene.effect} · Evidence: ${scene.evidenceIds.join(", ") || "none"}`, ""])];
    return { filename: `room-404-${visit.id.slice(0, 8)}.md`, markdown: lines.join("\n") };
  }
}
