import assert from "node:assert/strict";
import http from "node:http";
import net from "node:net";
import { test } from "node:test";
import type express from "express";
import { createApp } from "../src/app.js";
import { HauntingService } from "../src/modules/haunting/application/haunting-service.js";
import type { SceneNarrator, VisitRepository } from "../src/modules/haunting/application/ports.js";
import { validateNarration } from "../src/modules/haunting/domain/game.js";
import type { Visit } from "../src/modules/haunting/domain/types.js";
import type { AppConfig } from "../src/shared/config.js";

class MemoryVisits implements VisitRepository {
  items = new Map<string, Visit>();
  async load(id: string) {
    const value = this.items.get(id);
    if (!value) throw new Error("Missing test visit");
    return structuredClone(value);
  }
  async save(visit: Visit) {
    this.items.set(visit.id, structuredClone(visit));
  }
}

const narrator: SceneNarrator = {
  async generate(visit) {
    return {
      prose: "The old hotel breathes through the wires. A slow footstep stops behind you, though no one is there when you turn.",
      whisper: "I kept your name.",
      effect: "none",
      screenMessage: "STAY",
      evidenceIds: [...visit.clues],
    };
  },
};

function makeRequest(
  app: express.Express,
  options: { method: string; url: string; headers?: Record<string, string>; body?: unknown },
) {
  return new Promise<{ status: number; body: any }>((resolve) => {
    const socket = new net.Socket();
    const req = new http.IncomingMessage(socket);
    req.method = options.method;
    req.url = options.url;
    req.headers = { ...options.headers };

    if (options.body !== undefined) {
      const payload = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
      req.headers["content-type"] = req.headers["content-type"] || "application/json";
      req.headers["content-length"] = String(Buffer.byteLength(payload));
      req.push(payload);
    }
    req.push(null);

    const res = new http.ServerResponse(req);
    let out = "";
    res.write = (c) => {
      out += c;
      return true;
    };
    res.end = (c) => {
      if (c) out += c;
      let body: any = out;
      try {
        body = JSON.parse(out);
      } catch {}
      resolve({ status: res.statusCode, body });
    };

    app.handle(req, res);
  });
}

test("a visit collects four records and gates its ending", async () => {
  const service = new HauntingService(new MemoryVisits(), narrator);
  let visit = await service.start("NIGHT GUEST");
  assert.equal(visit.actions.some((action) => action.id === "face_ghost"), false);
  for (const action of [
    "read_register",
    "go_hallway",
    "watch_camera",
    "go_basement",
    "read_switchboard",
    "go_hallway_from_basement",
    "go_suite",
    "touch_mirror",
  ]) {
    visit = await service.act(visit.id, action);
  }
  assert.equal(visit.clues.length, 4);
  assert.equal(visit.actions.some((action) => action.id === "face_ghost"), true);
  visit = await service.act(visit.id, "face_ghost");
  assert.equal(visit.ending, "escaped");
  assert.match((await service.export(visit.id)).markdown, /Elena|Room 404|REGISTER/);
});

test("failed narration leaves the saved visit untouched", async () => {
  const repository = new MemoryVisits();
  const service = new HauntingService(repository, narrator);
  const visit = await service.start("GUEST");
  const failing = new HauntingService(repository, {
    async generate() {
      throw new Error("Provider unavailable");
    },
  });
  await assert.rejects(failing.act(visit.id, "read_register"), /Provider unavailable/);
  assert.deepEqual((await service.get(visit.id)).clues, []);
});

test("ghost output cannot invent another room or cite an unseen record", () => {
  const base = {
    prose: "The old hotel breathes through the wires. A slow footstep stops behind you, though no one is there when you turn.",
    whisper: "I kept your name.",
    effect: "shadow",
    screenMessage: "STAY",
  };
  assert.throws(() => validateNarration({ ...base, evidenceIds: ["MIRROR"] }, ["REGISTER"], "action"), /invalid scene/);
  assert.throws(
    () =>
      validateNarration(
        {
          ...base,
          prose: "The door to Room 13 opens beyond the corridor, and the old hotel breathes through the wires.",
          evidenceIds: ["REGISTER"],
        },
        ["REGISTER"],
        "action",
      ),
    /invented a room/,
  );
});

test("HTTP boundary validates input and blocks cross-origin writes", async () => {
  const service = new HauntingService(new MemoryVisits(), narrator);
  const config: AppConfig = {
    port: 0,
    host: "127.0.0.1",
    groqKey: "test",
    model: "openai/gpt-oss-120b",
    dataDir: "unused",
    allowedOrigins: ["http://127.0.0.1:3000"],
  };
  const app = createApp(config, service);

  const blocked = await makeRequest(app, {
    method: "POST",
    url: "/api/sessions",
    headers: { origin: "https://wrong.example" },
    body: { alias: "GUEST" },
  });
  assert.equal(blocked.status, 403);

  const bad = await makeRequest(app, {
    method: "POST",
    url: "/api/sessions",
    body: { alias: "<script>" },
  });
  assert.equal(bad.status, 400);

  const created = await makeRequest(app, {
    method: "POST",
    url: "/api/sessions",
    body: { alias: "GUEST" },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.room, "lobby");
});
