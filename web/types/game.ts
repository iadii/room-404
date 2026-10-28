export type Effect = "none" | "flicker" | "shadow" | "knock" | "mirror" | "static";

export interface Scene {
  readonly id: string;
  readonly action: string;
  readonly room: string;
  readonly prose: string;
  readonly whisper: string;
  readonly effect: Effect;
  readonly screenMessage: string;
  readonly evidenceIds: readonly string[];
  readonly at: string;
}

export interface Evidence {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly room: string;
}

export interface Action {
  readonly id: string;
  readonly label: string;
  readonly clue?: string;
  readonly target?: string;
  readonly ending?: boolean;
}

export interface RoomInfo {
  readonly name: string;
  readonly number: string;
  readonly ambience: string;
}

export interface Session {
  readonly id: string;
  readonly alias: string;
  readonly room: string;
  readonly roomInfo: RoomInfo;
  readonly fear: number;
  readonly clues: readonly string[];
  readonly evidence: readonly Evidence[];
  readonly actions: readonly Action[];
  readonly scenes: readonly Scene[];
  readonly turns: number;
  readonly ended: boolean;
  readonly ending: "escaped" | "claimed" | null;
}

export interface Health {
  readonly status: string;
  readonly model: string;
  readonly aiReady: boolean;
}

