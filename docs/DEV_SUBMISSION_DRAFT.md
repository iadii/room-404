---
title: "Room 404: The Haunted Terminal That Possesses Your Computer"
published: false
tags: devchallenge, hf26challenge, gemma, opensource
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26).*

---

## What I Built

**Room 404** is an interactive haunted terminal experience built for the Hacktoberfest 2026 Week 4 "Ghost in the Machine" challenge.

The prompt explicitly suggested:
> *“A haunted terminal that 'possesses' your shell and whispers back eerie commentary on the commands you run”*

Room 404 embodies this across both a retro browser console and a live shell CLI.

On October 31, 1978, a guest named Elena Voss checked into Room 404 of the Briar House Hotel and never checked out. Her second line in the ledger was scraped away until the paper was thin enough to see light through. Exactly forty-eight years later—on October 31, 2026 at 03:17 AM—the hotel’s obsolete management computer (**BriarOS v4.04 on a PDP-11**) suddenly rebooted and registered a new guest: **you**.

{% include "./demo/landing.png" %}

### Two Ways to Experience the Haunting:
1. **Interactive Web CRT Ghost Terminal & CCTV Console**:
   * Switch between **⌨ GHOST TERMINAL** (a full green/amber phosphor CRT terminal command line) and **📹 CCTV CONSOLE** (visual surveillance feeds & scene cards).
   * Run real system commands: `ls`, `cat ledger_1978.log`, `cd hallway`, `pwd`, `date`, `ps`, `whoami`, `status`, `dial 404`, and `knocks`.
   * Type any freeform question to speak directly to the entity inhabiting the machine.
   * Powered by Google's open-weight **Gemma 2 (`gemma2-9b-it`)** running on Groq, the ghost corrupts system outputs with glitched text, audio frequency shifts, and physical CRT flickers.
2. **Real Shell CLI Mode (`npm run haunt`)**:
   * Run the terminal directly inside your local macOS/Linux terminal (`zsh`/`bash`).
   * Takes over your shell with retro ANSI borders, processes commands, and streams eerie Gemma 2 AI whispers into your prompt.

{% include "./demo/game.png" %}

---

## Demo

* **Walkthrough Video**: <!-- REPLACE WITH YOUR 60-90 SECOND LOOM OR YOUTUBE DEMO LINK -->
* **Sample Case Transcript**: [Read an exported case transcript](https://github.com/REPLACE_WITH_YOUR_USERNAME/room-404/blob/main/docs/demo/sample-transcript.md)
* **Visual Tour**:
  * [The Landing Check-in Screen](https://raw.githubusercontent.com/REPLACE_WITH_YOUR_USERNAME/room-404/main/docs/demo/landing.png)
  * [The In-Game Haunting Interface](https://raw.githubusercontent.com/REPLACE_WITH_YOUR_USERNAME/room-404/main/docs/demo/game.png)
* **Instructions for Judges to Test Locally**:
  1. Clone the repository and run `cd room-404/api && cp .env.example .env`.
  2. Add your Groq API key (`GROQ_API_KEY=...` with default `GROQ_MODEL=gemma2-9b-it`).
  3. Run `npm install && npm run dev` in `api/`, and `npm install && npm run dev` in `web/`.
  4. Open `http://127.0.0.1:3000` to play the Web Terminal & CCTV Console.
  5. Or in `api/`, run `npm run haunt` to experience the possessed shell in your local terminal!

---

## Code

* **GitHub Repository**: [https://github.com/REPLACE_WITH_YOUR_USERNAME/room-404](https://github.com/REPLACE_WITH_YOUR_USERNAME/room-404) (MIT Licensed)

{% github https://github.com/REPLACE_WITH_YOUR_USERNAME/room-404 %}

---

## How I Built It

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

### 1. The Open-Source AI Stack
* **Model**: Google's open-weight **Gemma 2 (`gemma2-9b-it`)**.
* **Inference**: High-speed hosted open-weight inference on Groq, delivering sub-second token generation for real-time terminal responsiveness.
* **Structured Generation**: Configured with strict schema extraction so Gemma 2 outputs a typed JSON payload containing second-person narrative prose, whispers, physical screen effect enums (`flicker`, `shadow`, `knock`, `mirror`, `static`), and cited evidence IDs.

### 2. Why Deterministic Bounds Matter in Horror AI
If an LLM can hallucinate whatever it wants, horror loses its stakes. If the AI can arbitrarily invent a fantasy room or pretend a clue was found, the puzzle dissolves.

* **Code owns the facts**: The four clues, room file system (`ROOM_FILES`), and ending gates are authored domain invariants. The model receives *only* clues the player has actually discovered.
* **Strict Output Validation**: The backend checks the model's output schema, evidence citations, and text lengths. If the model hallucinates an unvisited room or invents a fake clue, the turn fails atomically and the game state remains untainted.
* **Gemma 2 owns the voice**: Google's Gemma 2 interprets your commands, decides how the ghost perceives you, whispers back, and triggers physical terminal manifestations.

---

## Why Does Open Innovation Matter?

The Week 4 challenge asks: *Why does open innovation matter for what you built? What did it make possible that a closed API wouldn't?*

### 1. Freedom from Corporate Content Filtering on Creative Horror
Commercial closed-source APIs frequently over-censor psychological horror, spooky fiction, and eerie lore due to blunt commercial safety filters. Google's open-weight **Gemma 2 (`gemma2-9b-it`)** allows developers to build creative, narrative art with nuanced tension without fear of arbitrary cloud account bans, prompt refusals, or sanitized output.

### 2. Zero Vendor Lock-in & Complete Model Decoupling
Because Room 404 is built on an explicit `SceneNarrator` port and OpenAI-compatible completions, the game is completely uncoupled from any single corporate provider. We can swap between Gemma 2 9B, Gemma 2 27B, or fine-tuned community horror models with a single environment variable change.

### 3. Absolute Privacy for Player Stories
Every session transcript is saved locally in private JSON files (`api/data/`) with file mode `0600`. No telemetry, player prompts, or transcripts are sold or harvested.

---

## My Agent Session

<!-- Optional: Embed your DevRelay session link or liquid tag below -->
{% agent_session REPLACE_WITH_SESSION_ID %}

---

## The Spirit of It

During testing in the CLI terminal, I ran:
```
NIGHT GUEST@BRIAR-PDP11:[/suite]$ dial 404
```
A second later, the terminal output flickered, and Gemma 2 whispered back:
> *“Turn, turn—your fear fuels my circuit. I am the lock you cannot escape.”*

The entire terminal interface flashed a critical static glitch: `##ERROR##: line 404 not found`. 

In that moment, it wasn't just a chatbot output. The terminal felt genuinely possessed—a forgotten computer from 1978 talking back through modern silicon.

---

## Prize Categories

* **Best Use of Gemma ($200 Featured Category)**:
  Room 404 is natively built around Google's open-weight **Gemma 2 (`gemma2-9b-it`)**, using structured JSON extraction to reliably drive retro terminal interactions, eerie whispers, and CRT screen manifestations.
