export interface Floor {
  readonly id: string;
  readonly name: string;
  readonly number: string;
}

export const HOTEL_FLOORS: readonly Floor[] = [
  { id: "lobby", name: "FRONT DESK", number: "G" },
  { id: "hallway", name: "FOURTH FLOOR", number: "4" },
  { id: "suite", name: "ROOM 404", number: "404" },
  { id: "basement", name: "SWITCHBOARD", number: "B" },
];

export const CLUE_IDS = ["REGISTER", "CAMERA", "MIRROR", "SWITCHBOARD"] as const;

export const GAME_CONSTANTS = {
  LOCAL_STORAGE_VISIT_KEY: "room-404-visit",
  EFFECT_DURATION_MS: 2800,
  HIGH_FEAR_THRESHOLD: 75,
  MAX_ALIAS_LENGTH: 24,
  MAX_SPEECH_LENGTH: 140,
  AUDIO_FREQUENCY_HZ: 54,
  AUDIO_GAIN_LEVEL: 0.014,
} as const;

