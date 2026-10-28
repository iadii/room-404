import { completeTurn, newVisit, planAction, planOpening, publicView } from "../domain/game.js";
import { ROOM_FILES } from "../domain/terminal.js";
import type { SceneNarrator, VisitRepository } from "./ports.js";
import { clues, rooms, type Room } from "../domain/world.js";

export class VisitBusyError extends Error {}

export interface TerminalExecutionResult {
  readonly output: string;
  readonly session: ReturnType<typeof publicView>;
  readonly effect?: string;
  readonly screenMessage?: string;
}

export class HauntingService {
  private readonly inFlight = new Set<string>();

  constructor(
    private readonly visits: VisitRepository,
    private readonly narrator: SceneNarrator,
  ) {}

  async start(alias: string) {
    const plan = planOpening(newVisit(alias));
    const narration = await this.narrator.generate(plan.visit, plan.mode, plan.prompt);
    const visit = completeTurn(plan, narration);
    await this.visits.save(visit);
    return publicView(visit);
  }

  async get(id: string) {
    return publicView(await this.visits.load(id));
  }

  async act(id: string, actionId: string, question = "") {
    if (this.inFlight.has(id)) {
      throw new VisitBusyError("The hotel is already responding. Wait for it.");
    }
    this.inFlight.add(id);
    try {
      const plan = planAction(await this.visits.load(id), actionId, question);
      const narration = await this.narrator.generate(plan.visit, plan.mode, plan.prompt);
      const visit = completeTurn(plan, narration);
      await this.visits.save(visit);
      return publicView(visit);
    } finally {
      this.inFlight.delete(id);
    }
  }

  async executeTerminalCommand(id: string, rawInput: string): Promise<TerminalExecutionResult> {
    const trimmed = rawInput.trim();
    const currentSession = await this.get(id);

    if (!trimmed) {
      return { output: "", session: currentSession };
    }

    const [cmdName = "", ...argParts] = trimmed.split(/\s+/);
    const command = cmdName.toLowerCase();
    const arg = argParts.join(" ").trim();

    // 1. Help
    if (command === "help" || command === "?") {
      const helpText = [
        "BRIAR-OS v4.04 (PDP-11 TERMINAL SUBSYSTEM - ROOM 404)",
        "=============================================================",
        "EXPLORATION COMMANDS:",
        "  ls, dir              List files and sector logs in current room",
        "  cat <file>           Inspect and decrypt sector records",
        "  cd <room>, nav       Navigate sectors (lobby, hallway, suite, basement)",
        "  whoami               Inspect current ledger registration",
        "  status, pulse        Check fear pulse and recovered records",
        "  dial 404, call 404   Test telephony switchboard line 404",
        "  knocks, answer       Answer the three knocks (inside Room 404)",
        "  clear                Clear the terminal screen",
        "",
        "CONVERSATION:",
        "  talk <phrase>        Speak directly to the entity through the machine",
        "  <any sentence>       Any unhandled input is transmitted into the walls",
        "=============================================================",
      ].join("\n");
      return { output: helpText, session: currentSession };
    }

    // 2. Directory listing (ls / dir)
    if (command === "ls" || command === "dir") {
      const currentRoom = currentSession.room as Room;
      const files = ROOM_FILES[currentRoom] || [];
      const lines = [
        `total ${files.length + 2}`,
        `drwxr-x---  root  briar  4096 Oct 31 03:17 .`,
        `drwxr-x---  root  briar  4096 Oct 31 1978 ..`,
        ...files.map(
          (f) =>
            `-rw-r-----  voss  briar  1978 Oct 31 1978  ${f.filename.padEnd(22)} # ${f.description}`,
        ),
      ];
      return { output: lines.join("\n"), session: currentSession };
    }

    // 3. Inspect file (cat <filename>)
    if (command === "cat") {
      if (!arg) {
        return { output: "usage: cat <filename>\nTry 'ls' to see files in this sector.", session: currentSession };
      }
      const currentRoom = currentSession.room as Room;
      const files = ROOM_FILES[currentRoom] || [];
      const targetFile = files.find(
        (f) => f.filename.toLowerCase() === arg.toLowerCase(),
      );

      if (!targetFile) {
        return {
          output: `cat: ${arg}: No such file in sector '${currentRoom}'. Try 'ls'.`,
          session: currentSession,
        };
      }

      if (targetFile.associatedAction) {
        const updatedSession = await this.act(id, targetFile.associatedAction);
        const latestScene = updatedSession.scenes.at(-1);
        const clueRecord = targetFile.associatedClue
          ? clues.find((c) => c.id === targetFile.associatedClue)
          : null;

        const outLines = [
          `[DECRYPTING SECTOR RECORD: ${targetFile.filename}]`,
          "-------------------------------------------------------------",
          clueRecord ? clueRecord.text : targetFile.description,
          "-------------------------------------------------------------",
          `[TERMINAL INTERCEPTION FROM GUEST IN 404]:`,
          `“${latestScene?.whisper}”`,
          "",
          latestScene?.prose || "",
        ];
        return {
          output: outLines.join("\n"),
          session: updatedSession,
          effect: latestScene?.effect,
          screenMessage: latestScene?.screenMessage,
        };
      }

      return {
        output: `[SECTOR FILE: ${targetFile.filename}]\n${targetFile.description}`,
        session: currentSession,
      };
    }

    // 4. Navigation (cd / nav / go)
    if (command === "cd" || command === "nav" || command === "go") {
      if (!arg) {
        return {
          output: "usage: cd <lobby | hallway | suite | basement>",
          session: currentSession,
        };
      }

      const target = arg.toLowerCase().replace(/^(to\s+|the\s+)/, "");
      let targetRoom: Room | null = null;
      if (["lobby", "desk", "frontdesk", "front desk", "01"].includes(target)) targetRoom = "lobby";
      else if (["hallway", "floor4", "fourth", "corridor", "02"].includes(target)) targetRoom = "hallway";
      else if (["suite", "room404", "404", "room", "03"].includes(target)) targetRoom = "suite";
      else if (["basement", "switchboard", "sub", "04"].includes(target)) targetRoom = "basement";

      if (!targetRoom) {
        return {
          output: `Unknown sector '${arg}'. Available sectors: lobby, hallway, suite, basement`,
          session: currentSession,
        };
      }

      if (targetRoom === currentSession.room) {
        return {
          output: `You are already in ${rooms[targetRoom].name}.`,
          session: currentSession,
        };
      }

      const available = currentSession.actions.find((a) => a.target === targetRoom);
      if (!available) {
        return {
          output: `Cannot navigate directly to '${rooms[targetRoom].name}' from here. Follow hotel corridors.`,
          session: currentSession,
        };
      }

      const updatedSession = await this.act(id, available.id);
      const latestScene = updatedSession.scenes.at(-1);
      const outLines = [
        `[TRANSITIONING TO SECTOR: ${rooms[targetRoom].name.toUpperCase()}]`,
        rooms[targetRoom].ambience,
        "",
        latestScene?.prose || "",
        `[WHISPER]: “${latestScene?.whisper}”`,
      ];
      return {
        output: outLines.join("\n"),
        session: updatedSession,
        effect: latestScene?.effect,
        screenMessage: latestScene?.screenMessage,
      };
    }

    // 5. Whoami
    if (command === "whoami") {
      const roomDetails = rooms[currentSession.room as Room];
      const lines = [
        "ACTIVE GUEST RECORD:",
        `  ALIAS:       ${currentSession.alias}`,
        `  SECTOR:      ${roomDetails.name} (${roomDetails.number})`,
        `  PULSE:       ${currentSession.fear}%`,
        `  RECORDS:     ${currentSession.clues.length} / ${clues.length} recovered`,
        `  STATUS:      ${currentSession.ended ? currentSession.ending?.toUpperCase() : "CHECKED IN"}`,
        "",
        "[SYSTEM CORRUPTION DETECTED ON LINE 404]:",
        `  Record 31-OCT-1978: "Elena Voss. Check-in: 03:17. Checkout: [DELETED]"`,
        `  The obsolete terminal registers your footsteps in her place.`,
      ];
      return { output: lines.join("\n"), session: currentSession };
    }

    // 6. Status / Pulse / Fear
    if (command === "status" || command === "pulse" || command === "fear") {
      const isHigh = currentSession.fear >= 75;
      const lines = [
        "GUEST VITAL TELEMETRY:",
        `  PULSE RATE (FEAR): ${currentSession.fear}% [${isHigh ? "CRITICAL ELEVATION" : "NOMINAL"}]`,
        `  SECTOR:            ${rooms[currentSession.room as Room].name}`,
        `  DISCOVERED CLUES:  ${currentSession.clues.join(", ") || "None"} (${currentSession.clues.length}/${clues.length})`,
        `  TOTAL TURNS:       ${currentSession.turns}`,
        `  TERMINAL STATE:    ${currentSession.ended ? "SESSION CONCLUDED" : "CONNECTED TO WIRE CHANNEL"}`,
      ];
      return { output: lines.join("\n"), session: currentSession };
    }

    // 7. Dial 404 / Call 404
    if (trimmed.toLowerCase().includes("dial") || trimmed.toLowerCase().includes("call")) {
      if (currentSession.room === "suite") {
        const updatedSession = await this.act(id, "listen_phone");
        const latestScene = updatedSession.scenes.at(-1);
        return {
          output: `[LIFTING THE PHONE IN ROOM 404]...\n${latestScene?.prose}\n\n[WHISPER]: “${latestScene?.whisper}”`,
          session: updatedSession,
          effect: latestScene?.effect,
          screenMessage: latestScene?.screenMessage,
        };
      }
      return {
        output: "[DIALING LINE 404]... An ominous mechanical click rings from the upper floors. The line is dead.",
        session: currentSession,
      };
    }

    // 8. Knocks / Answer (Face ghost)
    if (["knocks", "answer", "face", "answer knocks"].includes(trimmed.toLowerCase())) {
      const faceAction = currentSession.actions.find((a) => a.id === "face_ghost");
      if (!faceAction) {
        return {
          output: `[GATE LOCKED]: You must be inside Room 404 with all 4 records recovered to answer the knocks.`,
          session: currentSession,
        };
      }
      const updatedSession = await this.act(id, "face_ghost");
      const latestScene = updatedSession.scenes.at(-1);
      const lines = [
        "=============================================================",
        `[ANSWERING THE THREE KNOCKS IN ROOM 404]`,
        "=============================================================",
        latestScene?.prose || "",
        "",
        `FINAL WHISPER: “${latestScene?.whisper}”`,
        `CHECKOUT VERDICT: ${updatedSession.ending === "escaped" ? "YOU LEFT. IT REMEMBERS." : "CLAIMED BY THE HOTEL."}`,
        "=============================================================",
      ];
      return {
        output: lines.join("\n"),
        session: updatedSession,
        effect: latestScene?.effect,
        screenMessage: latestScene?.screenMessage,
      };
    }

    // 9. Conversational input / talk / ask
    let speech = trimmed;
    if (speech.toLowerCase().startsWith("talk ")) speech = speech.slice(5).trim();
    else if (speech.toLowerCase().startsWith("ask ")) speech = speech.slice(4).trim();
    else if (speech.toLowerCase().startsWith("say ")) speech = speech.slice(4).trim();

    const updatedSession = await this.act(id, "speak", speech);
    const latestScene = updatedSession.scenes.at(-1);

    const outLines = [
      `[TRANSMITTING TO THE MACHINE]: "${speech}"`,
      "-------------------------------------------------------------",
      `THE GUEST WHISPERS:`,
      `“${latestScene?.whisper}”`,
      "",
      latestScene?.prose || "",
    ];
    return {
      output: outLines.join("\n"),
      session: updatedSession,
      effect: latestScene?.effect,
      screenMessage: latestScene?.screenMessage,
    };
  }

  async export(id: string) {
    const visit = await this.visits.load(id);
    const lines = [
      "# Room 404 — case transcript",
      "",
      "An original fictional horror experience. No real guest or emergency is depicted.",
      "",
      `Guest alias: ${visit.alias}`,
      `Ending: ${visit.ending ?? "unfinished"}`,
      "",
      ...visit.scenes.flatMap((scene, index) => [
        `## ${index + 1}. ${scene.room.toUpperCase()} — ${scene.action}`,
        "",
        scene.prose,
        "",
        `> ${scene.whisper}`,
        "",
        `Manifestation: ${scene.effect} · Evidence: ${scene.evidenceIds.join(", ") || "none"}`,
        "",
      ]),
    ];
    return { filename: `room-404-${visit.id.slice(0, 8)}.md`, markdown: lines.join("\n") };
  }
}
