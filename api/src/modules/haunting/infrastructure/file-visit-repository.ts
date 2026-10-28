import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { VisitRepository } from "../application/ports.js";
import type { Visit } from "../domain/types.js";

export class VisitNotFoundError extends Error {}

export class FileVisitRepository implements VisitRepository {
  constructor(private readonly directory: string) {}

  private location(id: string) {
    if (!/^[0-9a-f-]{36}$/.test(id)) throw new VisitNotFoundError("Visit not found.");
    return path.join(this.directory, `${id}.json`);
  }

  async load(id: string): Promise<Visit> {
    try { return JSON.parse(await readFile(this.location(id), "utf8")) as Visit; }
    catch (error) {
      if (error instanceof VisitNotFoundError || (error instanceof Error && "code" in error && error.code === "ENOENT")) throw new VisitNotFoundError("Visit not found.");
      throw error;
    }
  }

  async save(visit: Visit): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const temp = path.join(this.directory, `${visit.id}.${randomUUID()}.tmp`);
    await writeFile(temp, JSON.stringify(visit), { mode: 0o600 });
    await rename(temp, this.location(visit.id));
  }
}
