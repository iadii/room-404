import type { ClueId, Room } from "./world.js";

export interface RoomFile {
  readonly filename: string;
  readonly description: string;
  readonly associatedAction?: string;
  readonly associatedClue?: ClueId;
}

export const ROOM_FILES: Record<Room, readonly RoomFile[]> = {
  lobby: [
    {
      filename: "ledger_1978.log",
      description: "Guest register entry from October 31, 1978",
      associatedAction: "read_register",
      associatedClue: "REGISTER",
    },
    {
      filename: "front_desk_bell.sys",
      description: "Mechanical brass bell chime sensor",
    },
    {
      filename: "lift_control.cfg",
      description: "Elevator hoistway control protocol for floor 4",
      associatedAction: "go_hallway",
    },
  ],
  hallway: [
    {
      filename: "corridor_cctv.raw",
      description: "Surveillance still from camera 04 at 03:17 AM",
      associatedAction: "watch_camera",
      associatedClue: "CAMERA",
    },
    {
      filename: "fire_cabinet.log",
      description: "Glass inspection report — anomaly in reflection",
    },
    {
      filename: "room_404.key",
      description: "Brass key cylinder for suite 404",
      associatedAction: "go_suite",
    },
  ],
  suite: [
    {
      filename: "mirror_note.txt",
      description: "Scratched message discovered behind covered mirror",
      associatedAction: "touch_mirror",
      associatedClue: "MIRROR",
    },
    {
      filename: "phone_cord.dat",
      description: "Telephony connection diagnostic — dead line",
      associatedAction: "listen_phone",
    },
    {
      filename: "three_knocks.gate",
      description: "Access lock requiring 4 recovered records",
      associatedAction: "face_ghost",
    },
  ],
  basement: [
    {
      filename: "switchboard_tape.dat",
      description: "Magnetic audio tape recording dead calls from room 404",
      associatedAction: "read_switchboard",
      associatedClue: "SWITCHBOARD",
    },
    {
      filename: "power_breaker.sys",
      description: "Basement emergency lighting cut-off switch",
      associatedAction: "pull_breaker",
    },
  ],
};
