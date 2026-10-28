import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { HauntingService } from "./modules/haunting/application/haunting-service.js";
import { FileVisitRepository } from "./modules/haunting/infrastructure/file-visit-repository.js";
import { GroqSceneNarrator } from "./modules/haunting/infrastructure/groq-scene-narrator.js";
import { loadConfig } from "./shared/config.js";

// ANSI color codes for terminal atmosphere
const RED = "\x1b[31m";
const BOLD_RED = "\x1b[1;31m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

async function main() {
  const config = loadConfig();
  if (!config.groqKey) {
    console.error(`${RED}Error: GROQ_API_KEY is missing from api/.env${RESET}`);
    process.exit(1);
  }

  const repository = new FileVisitRepository(config.dataDir);
  const narrator = new GroqSceneNarrator(config.groqKey, config.model);
  const service = new HauntingService(repository, narrator);

  console.clear();
  console.log(`${BOLD_RED}╔════════════════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD_RED}║   ✝  BRIAR HOUSE HOTEL — MANAGEMENT TERMINAL (PDP-11 / OCT 31, 1978)       ║${RESET}`);
  console.log(`${BOLD_RED}║         THE GHOST IN THE MACHINE · HALLOWEEN NIGHT · 03:17 AM              ║${RESET}`);
  console.log(`${BOLD_RED}║         POWERED BY OPEN-WEIGHT GEMMA 2 (${config.model})                ║${RESET}`);
  console.log(`${BOLD_RED}╚════════════════════════════════════════════════════════════════════════════╝${RESET}\n`);

  const rl = readline.createInterface({ input, output });

  let alias = "";
  while (!alias) {
    const raw = await rl.question(`${YELLOW}ENTER GUEST ALIAS FOR HOTEL LEDGER: ${RESET}`);
    alias = raw.trim() || "GUEST";
  }

  console.log(`${DIM}Booting terminal memory sectors... Connecting to Room 404...${RESET}\n`);

  let session = await service.start(alias);
  const opening = session.scenes.at(-1);

  console.log(`${GREEN}[TERMINAL INITIALIZED]${RESET}`);
  console.log(`${DIM}${opening?.prose}${RESET}`);
  console.log(`${RED}WHISPER: “${opening?.whisper}”${RESET}\n`);
  console.log(`${CYAN}Type 'help' for available system commands, or type any phrase to speak into the walls.${RESET}\n`);

  while (!session.ended) {
    const prompt = `${BOLD_RED}${session.alias}@BRIAR-PDP11${RESET}:${YELLOW}[/${session.room}]${RESET}$ `;
    const line = await rl.question(prompt);
    const cmd = line.trim();

    if (!cmd) continue;
    if (cmd.toLowerCase() === "exit" || cmd.toLowerCase() === "quit") {
      console.log(`\n${DIM}Disconnecting terminal... The hotel remembers your footsteps.${RESET}\n`);
      break;
    }

    try {
      const result = await service.executeTerminalCommand(session.id, cmd);
      session = result.session;

      if (result.output) {
        console.log(`\n${result.output}\n`);
      }

      if (result.effect && result.effect !== "none") {
        console.log(`${BOLD_RED}[CRITICAL SCREEN MANIFESTATION: ${result.effect.toUpperCase()} - ${result.screenMessage || "GLITCH"}]${RESET}\n`);
      }
    } catch (err) {
      console.log(`${RED}[SYSTEM ERROR]: ${err instanceof Error ? err.message : "The machine halted."}${RESET}\n`);
    }
  }

  rl.close();
}

void main().catch((err) => {
  console.error("Fatal terminal error:", err);
  process.exit(1);
});
