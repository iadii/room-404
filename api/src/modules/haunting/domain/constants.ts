import type { Effect } from "./world.js";

export const GAME_CONSTANTS = {
  // Fear progression
  INITIAL_FEAR: 4,
  MAX_FEAR: 100,
  CLAIMED_FEAR_THRESHOLD: 75,

  // Story constraints
  MAX_TURNS_SPEAK: 24,
  MAX_HISTORY_SCENES: 30,

  // Input boundaries
  MIN_ALIAS_LENGTH: 1,
  MAX_ALIAS_LENGTH: 24,
  MAX_SPEECH_LENGTH: 140,
  MAX_ACTION_ID_LENGTH: 40,

  // Narration validation bounds
  MIN_PROSE_LENGTH: 35,
  MAX_PROSE_LENGTH: 850,
  MAX_WHISPER_LENGTH: 180,
  MAX_SCREEN_MESSAGE_LENGTH: 45,

  // Fixed fictional dates & markers
  STORY_TARGET_ROOM: "404",
  HISTORICAL_YEAR: "1978",
  ANOMALOUS_GUEST_NAME: "Elena Voss",
} as const;

export const EFFECT_FEAR_COSTS: Readonly<Record<Effect, number>> = {
  none: 0,
  flicker: 2,
  shadow: 4,
  knock: 3,
  mirror: 5,
  static: 2,
};

export const ALLOWED_EFFECTS = new Set<Effect>([
  "none",
  "flicker",
  "shadow",
  "knock",
  "mirror",
  "static",
]);

