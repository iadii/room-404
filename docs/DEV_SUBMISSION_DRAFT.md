---
title: "Room 404: The Haunted Terminal That Possesses Your Computer"
published: false
tags: devchallenge, hf26challenge, gemma, opensource
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26).*

---

## What I Built

**Room 404** is an interactive haunted terminal experience built for Halloween night.

The Hacktoberfest Week 4 prompt explicitly challenged builders:
> *“A haunted terminal that 'possesses' your shell and whispers back eerie commentary on the commands you run”*

Room 404 brings that exact concept to life.

On October 31, 1978, a guest named Elena Voss checked into Room 404 of the Briar House Hotel and never checked out. Her second line in the ledger was scraped away until the paper was thin enough to see light through. Exactly forty-eight years later—on October 31, 2026 at 03:17 AM—the hotel’s decommissioned management terminal (**BriarOS v4.04 on a PDP-11**) suddenly booted up and registered a new guest: **you**.

{% include "./demo/landing.png" %}

### Two Ways to Experience the Haunting:
1. **Interactive Web CRT Ghost Terminal & CCTV Console**:
   * Switch between **⌨ GHOST TERMINAL** (a full green/amber phosphor terminal command line) and **📹 CCTV CONSOLE** (visual surveillance feeds & scene cards).
   * Run real system commands: `ls`, `cat ledger_1978.log`, `cd hallway`, `whoami`, `status`, `dial 404`, and `knocks`.
   * Type any freeform phrase to speak directly into the machine.
   * Powered by Google's open-weight **Gemma 2 (`gemma2-9b-it`)** running on Groq, the ghost corrupts system outputs with glitched text, audio frequency shifts, and physical CRT flickers.
2. **Real Shell CLI Mode (`npm run haunt`)**:
   * Run the terminal directly inside your local macOS/Linux terminal (`zsh`/`bash`).
   * Takes over your shell with retro ANSI borders, processes commands, and streams eerie Gemma 2 AI whispers into your prompt.

{% include "./demo/game.png" %}

---

## Demo

* **Sample Case Transcript**: [Read an exported case transcript](https://github.com/REPLACE_WITH_YOUR_USERNAME/room-404/blob/main/docs/demo/sample-transcript.md)
* **Visual Tour**:
  * [The Landing Check-in Screen](https://raw.githubusercontent.com/REPLACE_WITH_YOUR_USERNAME/room-404/main/docs/demo/landing.png)
  * [The In-Game Haunting Interface](https://raw.githubusercontent.com/REPLACE_WITH_YOUR_USERNAME/room-404/main/docs/demo/game.png)
* **Testing Instructions for Judges**:
  1. Clone the repository and run `cd room-404/api && cp .env.example .env`.
  2. Add your Groq API key (`GROQ_API_KEY=...` with default `GROQ_MODEL=gemma2-9b-it`).
  3. Run `npm install && npm run dev` in `api/`, and `npm install && npm run dev` in `web/`.
  4. Open `http://127.0.0.1:3000` to play the Web Terminal & CCTV Console.
  5. Or in `api/`, run `npm run haunt` to experience the possessed shell in your local terminal!

---

## Code & Architecture

* **Repository**: [https://github.com/REPLACE_WITH_YOUR_USERNAME/room-404](https://github.com/REPLACE_WITH_YOUR_USERNAME/room-404) (MIT Licensed)

The backend is built as a clean TypeScript modular monolith with strict domain boundaries, separating **deterministic system truth** from **generative haunting**:

```mermaid
flowchart LR
  WEB[Next.js 16 Web UI\n(Ghost Terminal & CCTV Console)] --> HTTP[Express 5 API Router]
  CLI[haunt-cli.ts\n(Real Shell REPL)] --> HTTP
  HTTP --> APP[HauntingService\n(Turn & Command Processor)]
  APP --> DOMAIN[Deterministic Domain Engine\n(Constants, Rooms & File System)]
  APP --> PORTS[Repository & Narrator Ports]
  PORTS -.-> FILE[FileVisitRepository\n(Private Atomic JSON)]
  PORTS -.-> MODEL[GroqSceneNarrator\n(Google Gemma 2 9B Instruct)]
```

### Why Deterministic Bounds Matter in Horror AI
If an LLM can hallucinate whatever it wants, horror loses its stakes. If the AI can arbitrarily invent a fantasy room or pretend a clue was found, the puzzle dissolves.

In Room 404:
1. **Code owns the facts**: The four clues, room file system (`ROOM_FILES`), and ending gates are authored domain invariants. The model receives *only* clues the player has actually discovered.
2. **Strict Output Validation**: The backend checks the model's output schema, evidence citations, and text lengths. If the model hallucinates an unvisited room or invents a fake clue, the turn fails atomically and the game state remains untainted.
3. **Gemma 2 owns the voice**: Google's Gemma 2 interprets your commands, decides how the ghost perceives you, whispers back, and triggers physical terminal manifestations.

---

## Why Open Innovation Matters (Best Use of Gemma)

The Week 4 challenge asks: *Why does open innovation matter for what you built?*

### 1. Nuanced Psychological Dread Without Commercial Refusals
Commercial closed-source APIs frequently over-censor psychological horror, spooky fiction, and eerie lore due to blunt commercial safety filters. Google's open-weight **Gemma 2 (`gemma2-9b-it`)** allows developers to build creative, narrative art with nuanced tension without fear of arbitrary cloud account bans or prompt refusals.

### 2. Structured JSON Output Reliability
Gemma 2 excels at structured JSON extraction. In Room 404, every response from Gemma 2 reliably supplies:
* A second-person narrative prose snippet (45–70 words)
* An eerie whispered line
* A physical UI manifestation enum (`flicker`, `shadow`, `knock`, `mirror`, `static`)
* A short glitch message to flash on the CRT screen
* Citations of recovered evidence

### 3. Absolute Privacy for Player Stories
Every session transcript is saved locally in private JSON files (`api/data/`) with file mode `0600`. No telemetry, analytics, or story transcripts are monetized or collected.

---

## The Moment It Landed

During testing in the CLI terminal, I ran:
```
NIGHT GUEST@BRIAR-PDP11:[/suite]$ dial 404
```
A second later, the terminal output flickered, and Gemma 2 whispered back:
> *“Turn, turn—your fear fuels my circuit. I am the lock you cannot escape.”*

The entire terminal interface flashed a critical static glitch: `##ERROR##: line 404 not found`. 

In that moment, it wasn't just a chatbot output. The terminal felt genuinely possessed—a forgotten computer from 1978 talking back through modern silicon.
