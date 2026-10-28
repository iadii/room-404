import type { NarrationMode, Visit } from "../domain/types.js";

export interface VisitRepository {
  load(id: string): Promise<Visit>;
  save(visit: Visit): Promise<void>;
}

export interface SceneNarrator {
  generate(visit: Visit, mode: NarrationMode, action: string): Promise<unknown>;
}
