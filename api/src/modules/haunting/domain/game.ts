import { randomUUID } from "node:crypto";
import { ALLOWED_EFFECTS, EFFECT_FEAR_COSTS, GAME_CONSTANTS } from "./constants.js";
import type { Narration, NarrationMode, TurnPlan, Visit } from "./types.js";
import { actions, availableActions, clues, rooms, type Effect } from "./world.js";

export class GameRuleError extends Error {}
export class NarrationValidationError extends Error {}

export function newVisit(alias: string): Visit {
  const clean = alias.trim();
  const aliasRegex = new RegExp(
    `^[\\p{L}\\p{N} _'-]{${GAME_CONSTANTS.MIN_ALIAS_LENGTH},${GAME_CONSTANTS.MAX_ALIAS_LENGTH}}$`,
    "u",
  );
  if (!aliasRegex.test(clean)) {
    throw new GameRuleError(
      `Use a guest name of ${GAME_CONSTANTS.MIN_ALIAS_LENGTH}–${GAME_CONSTANTS.MAX_ALIAS_LENGTH} letters or numbers.`,
    );
  }
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    alias: clean,
    room: "lobby",
    fear: GAME_CONSTANTS.INITIAL_FEAR,
    clues: [],
    scenes: [],
    turns: 0,
    ended: false,
    ending: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function planOpening(visit: Visit): TurnPlan {
  return {
    visit,
    mode: "opening",
    action: "You entered the hotel at 03:17.",
    prompt: "The guest enters the abandoned hotel on Halloween night, 2026.",
  };
}

export function planAction(current: Visit, actionId: string, question = ""): TurnPlan {
  if (current.ended) {
    throw new GameRuleError("This haunting has ended. Start a new visit.");
  }
  const visit = structuredClone(current);

  if (actionId === "speak") {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || trimmedQuestion.length > GAME_CONSTANTS.MAX_SPEECH_LENGTH) {
      throw new GameRuleError(`Speak in 1–${GAME_CONSTANTS.MAX_SPEECH_LENGTH} characters.`);
    }
    if (visit.turns >= GAME_CONSTANTS.MAX_TURNS_SPEAK) {
      throw new GameRuleError("The ghost has gone quiet. Follow the room's remaining actions.");
    }
    const prompt = `The guest says: ${trimmedQuestion}`;
    return { visit, mode: "speak", action: prompt, prompt };
  }

  const action = actions.find((item) => item.id === actionId);
  if (!action || !availableActions(visit.room, visit.clues).includes(action)) {
    throw new GameRuleError("That action is not available in this room.");
  }

  if (action.target) visit.room = action.target;
  if (action.clue && !visit.clues.includes(action.clue)) visit.clues.push(action.clue);
  visit.fear = Math.min(GAME_CONSTANTS.MAX_FEAR, visit.fear + action.fear);

  if (action.ending) {
    if (visit.clues.length !== clues.length || visit.room !== "suite") {
      throw new GameRuleError("Recover all four records inside Room 404 first.");
    }
    visit.ended = true;
    visit.ending = visit.fear >= GAME_CONSTANTS.CLAIMED_FEAR_THRESHOLD ? "claimed" : "escaped";
  }

  return {
    visit,
    mode: action.ending ? "ending" : "action",
    action: action.label,
    prompt: action.description,
  };
}

export function validateNarration(
  value: unknown,
  discovered: readonly Visit["clues"][number][],
  mode: NarrationMode,
): Narration {
  if (!value || typeof value !== "object") {
    throw new NarrationValidationError("The haunting returned no scene.");
  }
  const story = value as Partial<Narration>;

  const hasValidProse =
    typeof story.prose === "string" &&
    story.prose.trim().length >= GAME_CONSTANTS.MIN_PROSE_LENGTH &&
    story.prose.length <= GAME_CONSTANTS.MAX_PROSE_LENGTH;

  const hasValidWhisper =
    typeof story.whisper === "string" &&
    story.whisper.trim().length > 0 &&
    story.whisper.length <= GAME_CONSTANTS.MAX_WHISPER_LENGTH;

  const hasValidScreenMsg =
    typeof story.screenMessage === "string" &&
    story.screenMessage.length <= GAME_CONSTANTS.MAX_SCREEN_MESSAGE_LENGTH;

  const hasValidEffect = ALLOWED_EFFECTS.has(story.effect as Effect);

  const hasValidEvidence =
    Array.isArray(story.evidenceIds) &&
    story.evidenceIds.every((id) => typeof id === "string" && discovered.includes(id));

  if (!hasValidProse || !hasValidWhisper || !hasValidScreenMsg || !hasValidEffect || !hasValidEvidence) {
    throw new NarrationValidationError("The haunting returned an invalid scene. Please retry.");
  }

  if (discovered.length > 0 && story.evidenceIds!.length === 0) {
    throw new NarrationValidationError("The ghost did not cite a discovered record. Please retry.");
  }

  if (mode === "ending" && discovered.some((id) => !story.evidenceIds?.includes(id))) {
    throw new NarrationValidationError("The ending did not use every record. Please retry.");
  }

  for (const match of story.prose!.matchAll(/\broom\s+(\d+)\b/gi)) {
    if (match[1] !== GAME_CONSTANTS.STORY_TARGET_ROOM) {
      throw new NarrationValidationError("The ghost invented a room outside this story. Please retry.");
    }
  }

  const elenaRegex = new RegExp(`\\b${GAME_CONSTANTS.ANOMALOUS_GUEST_NAME}\\b`, "i");
  if (!discovered.includes("REGISTER") && elenaRegex.test(story.prose!)) {
    throw new NarrationValidationError("The ghost revealed an unseen record. Please retry.");
  }

  return story as Narration;
}

export function completeTurn(plan: TurnPlan, output: unknown): Visit {
  const narration = validateNarration(output, plan.visit.clues, plan.mode);
  const visit = plan.visit;

  visit.scenes.push({
    id: randomUUID(),
    action: plan.action,
    room: visit.room,
    ...narration,
    at: new Date().toISOString(),
  });

  visit.scenes = visit.scenes.slice(-GAME_CONSTANTS.MAX_HISTORY_SCENES);
  visit.turns += 1;

  if (!visit.ended) {
    visit.fear = Math.min(GAME_CONSTANTS.MAX_FEAR, visit.fear + EFFECT_FEAR_COSTS[narration.effect]);
  }
  visit.updatedAt = new Date().toISOString();
  return visit;
}

export function publicView(visit: Visit) {
  return {
    ...visit,
    roomInfo: rooms[visit.room],
    evidence: clues.filter((clue) => visit.clues.includes(clue.id)),
    actions: availableActions(visit.room, visit.clues).map(({ id, label, clue, target, ending }) => ({
      id,
      label,
      clue,
      target,
      ending,
    })),
  };
}
