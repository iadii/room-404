export type Room = "lobby" | "hallway" | "suite" | "basement";
export type Effect = "none" | "flicker" | "shadow" | "knock" | "mirror" | "static";

export interface RoomDetails {
  readonly name: string;
  readonly number: string;
  readonly ambience: string;
}

export const rooms: Record<Room, RoomDetails> = {
  lobby: {
    name: "The Front Desk",
    number: "01",
    ambience: "A brass bell rings once. No one is behind the desk.",
  },
  hallway: {
    name: "The Fourth Floor",
    number: "02",
    ambience: "The carpet is damp. Every door is numbered 404 when you look away.",
  },
  suite: {
    name: "Room 404",
    number: "03",
    ambience: "The room is empty except for a covered mirror and a phone with no cord.",
  },
  basement: {
    name: "The Switchboard",
    number: "04",
    ambience: "The hotel's wires hum like voices behind plaster.",
  },
};

export const clues = [
  {
    id: "REGISTER",
    title: "The guest ledger",
    room: "lobby" as Room,
    text: "31 OCT 1978. Room 404: Elena Voss. Check-in: 03:17. Checkout: blank. A second line beneath her name has been scraped away, leaving the paper thin enough to see light through.",
  },
  {
    id: "CAMERA",
    title: "The corridor photograph",
    room: "hallway" as Room,
    text: "A security still marked 03:17 shows the fourth-floor corridor empty. In the glass of the fire cabinet, Elena's reflection stands beside the camera, though the hallway itself contains no one.",
  },
  {
    id: "MIRROR",
    title: "The writing beneath the sheet",
    room: "suite" as Room,
    text: "Behind the covered mirror, words are scratched into the silver backing: THEY LOCKED THE DOOR FROM OUTSIDE. The scratches are on the inside of the glass. Their author is unknown.",
  },
  {
    id: "SWITCHBOARD",
    title: "The dead calls",
    room: "basement" as Room,
    text: "The switchboard tape records nine calls from Room 404 after its line was disconnected. Each call lasted 41 seconds. No voice was captured, only three knocks followed by a long breath.",
  },
] as const;

export type ClueId = (typeof clues)[number]["id"];

export interface Action {
  readonly id: string;
  readonly label: string;
  readonly room: Room;
  readonly target?: Room;
  readonly clue?: ClueId;
  readonly fear: number;
  readonly description: string;
  readonly requiresAll?: boolean;
  readonly ending?: boolean;
}

export const actions: readonly Action[] = [
  {
    id: "read_register",
    label: "Read the guest ledger",
    room: "lobby",
    clue: "REGISTER",
    fear: 5,
    description: "Open the ledger to the last night of October.",
  },
  {
    id: "go_hallway",
    label: "Take the lift to floor four",
    room: "lobby",
    target: "hallway",
    fear: 3,
    description: "Ride the elevator that arrived before you called it.",
  },
  {
    id: "watch_camera",
    label: "Inspect the security still",
    room: "hallway",
    clue: "CAMERA",
    fear: 6,
    description: "Hold the old photograph under the emergency light.",
  },
  {
    id: "go_suite",
    label: "Open Room 404",
    room: "hallway",
    target: "suite",
    fear: 6,
    description: "Turn the key already warm in your hand.",
  },
  {
    id: "go_basement",
    label: "Follow the knocking downstairs",
    room: "hallway",
    target: "basement",
    fear: 7,
    description: "Descend toward the old switchboard.",
  },
  {
    id: "go_lobby",
    label: "Return to the front desk",
    room: "hallway",
    target: "lobby",
    fear: 2,
    description: "Walk back past doors that seem to shift.",
  },
  {
    id: "touch_mirror",
    label: "Pull the sheet from the mirror",
    room: "suite",
    clue: "MIRROR",
    fear: 8,
    description: "Reveal what someone wrote on the inside of the glass.",
  },
  {
    id: "listen_phone",
    label: "Lift the disconnected phone",
    room: "suite",
    fear: 8,
    description: "Listen to a line that cannot be connected.",
  },
  {
    id: "go_hallway_from_suite",
    label: "Step back into the corridor",
    room: "suite",
    target: "hallway",
    fear: 2,
    description: "Leave Room 404, if the door permits it.",
  },
  {
    id: "face_ghost",
    label: "Answer the three knocks",
    room: "suite",
    fear: 10,
    description: "Face whoever the hotel has kept in this room.",
    requiresAll: true,
    ending: true,
  },
  {
    id: "read_switchboard",
    label: "Play the switchboard tape",
    room: "basement",
    clue: "SWITCHBOARD",
    fear: 7,
    description: "Hear the calls that came from a dead line.",
  },
  {
    id: "pull_breaker",
    label: "Kill the basement lights",
    room: "basement",
    fear: 9,
    description: "Pull the rusted breaker and wait in the dark.",
  },
  {
    id: "go_hallway_from_basement",
    label: "Climb to the fourth floor",
    room: "basement",
    target: "hallway",
    fear: 3,
    description: "Follow the emergency lights back upstairs.",
  },
];

export function availableActions(room: Room, discovered: readonly ClueId[]): Action[] {
  return actions.filter(
    (action) => action.room === room && (!action.requiresAll || discovered.length === clues.length),
  );
}
