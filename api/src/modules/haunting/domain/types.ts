import type { ClueId, Effect, Room } from "./world.js";

export type Scene = {
  id: string;
  action: string;
  room: Room;
  prose: string;
  whisper: string;
  effect: Effect;
  screenMessage: string;
  evidenceIds: ClueId[];
  at: string;
};

export type Visit = {
  id: string;
  alias: string;
  room: Room;
  fear: number;
  clues: ClueId[];
  scenes: Scene[];
  turns: number;
  ended: boolean;
  ending: "escaped" | "claimed" | null;
  createdAt: string;
  updatedAt: string;
};

export type Narration = {
  prose: string;
  whisper: string;
  effect: Effect;
  screenMessage: string;
  evidenceIds: ClueId[];
};

export type NarrationMode = "opening" | "action" | "speak" | "ending";

export type TurnPlan = { visit: Visit; mode: NarrationMode; action: string; prompt: string };
