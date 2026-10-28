import { randomUUID } from "node:crypto";
import { actions, availableActions, clues, rooms, type Effect } from "./world.js";
import type { Narration, NarrationMode, TurnPlan, Visit } from "./types.js";

export class GameRuleError extends Error {}
export class NarrationValidationError extends Error {}

const effectFear: Record<Effect, number> = { none: 0, flicker: 2, shadow: 4, knock: 3, mirror: 5, static: 2 };
const effects = new Set<Effect>(["none", "flicker", "shadow", "knock", "mirror", "static"]);

export function newVisit(alias: string): Visit {
  const clean = alias.trim();
  if (!/^[\p{L}\p{N} _'-]{1,24}$/u.test(clean)) throw new GameRuleError("Use a guest name of 1–24 letters or numbers.");
  const now = new Date().toISOString();
  return { id: randomUUID(), alias: clean, room: "lobby", fear: 4, clues: [], scenes: [], turns: 0, ended: false, ending: null, createdAt: now, updatedAt: now };
}

export function planOpening(visit: Visit): TurnPlan {
  return { visit, mode: "opening", action: "You entered the hotel at 03:17.", prompt: "The guest enters the abandoned hotel on Halloween night, 2026." };
}

export function planAction(current: Visit, actionId: string, question = ""): TurnPlan {
  if (current.ended) throw new GameRuleError("This haunting has ended. Start a new visit.");
  const visit = structuredClone(current);
  if (actionId === "speak") {
    if (!question.trim() || question.length > 140) throw new GameRuleError("Speak in 1–140 characters.");
    if (visit.turns >= 24) throw new GameRuleError("The ghost has gone quiet. Follow the room's remaining actions.");
    const prompt = `The guest says: ${question.trim()}`;
    return { visit, mode: "speak", action: prompt, prompt };
  }
  const action = actions.find((item) => item.id === actionId);
  if (!action || !availableActions(visit.room, visit.clues).includes(action)) throw new GameRuleError("That action is not available in this room.");
  if (action.target) visit.room = action.target;
  if (action.clue && !visit.clues.includes(action.clue)) visit.clues.push(action.clue);
  visit.fear = Math.min(100, visit.fear + action.fear);
  if (action.ending) {
    if (visit.clues.length !== clues.length || visit.room !== "suite") throw new GameRuleError("Recover all four records inside Room 404 first.");
    visit.ended = true;
    visit.ending = visit.fear >= 75 ? "claimed" : "escaped";
  }
  return { visit, mode: action.ending ? "ending" : "action", action: action.label, prompt: action.description };
}

export function validateNarration(value: unknown, discovered: Visit["clues"], mode: NarrationMode): Narration {
  if (!value || typeof value !== "object") throw new NarrationValidationError("The haunting returned no scene.");
  const story = value as Partial<Narration>;
  if (typeof story.prose !== "string" || story.prose.trim().length < 35 || story.prose.length > 850 ||
      typeof story.whisper !== "string" || !story.whisper.trim() || story.whisper.length > 180 ||
      typeof story.screenMessage !== "string" || story.screenMessage.length > 45 ||
      !effects.has(story.effect as Effect) || !Array.isArray(story.evidenceIds) ||
      story.evidenceIds.some((id) => typeof id !== "string" || !discovered.includes(id))) {
    throw new NarrationValidationError("The haunting returned an invalid scene. Please retry.");
  }
  if (discovered.length && !story.evidenceIds.length) throw new NarrationValidationError("The ghost did not cite a discovered record. Please retry.");
  if (mode === "ending" && discovered.some((id) => !story.evidenceIds?.includes(id))) throw new NarrationValidationError("The ending did not use every record. Please retry.");
  for (const match of story.prose.matchAll(/\broom\s+(\d+)\b/gi)) {
    if (match[1] !== "404") throw new NarrationValidationError("The ghost invented a room outside this story. Please retry.");
  }
  if (!discovered.includes("REGISTER") && /\bElena\s+Voss\b/i.test(story.prose)) throw new NarrationValidationError("The ghost revealed an unseen record. Please retry.");
  return story as Narration;
}

export function completeTurn(plan: TurnPlan, output: unknown): Visit {
  const narration = validateNarration(output, plan.visit.clues, plan.mode);
  const visit = plan.visit;
  visit.scenes.push({ id: randomUUID(), action: plan.action, room: visit.room, ...narration, at: new Date().toISOString() });
  visit.scenes = visit.scenes.slice(-30);
  visit.turns += 1;
  if (!visit.ended) visit.fear = Math.min(100, visit.fear + effectFear[narration.effect]);
  visit.updatedAt = new Date().toISOString();
  return visit;
}

export function publicView(visit: Visit) {
  return { ...visit,
    roomInfo: rooms[visit.room],
    evidence: clues.filter((clue) => visit.clues.includes(clue.id)),
    actions: availableActions(visit.room, visit.clues).map(({ id, label, clue, target, ending }) => ({ id, label, clue, target, ending })),
  };
}
