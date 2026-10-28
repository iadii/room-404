---
title: "Room 404: The Ghost That Lives Inside the Hotel Computer"
published: false
tags: devchallenge, hf26challenge, ai, opensource
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26).*

---

## What I Built

**Room 404** is a playable browser horror experience built for Halloween night.

On October 31, 1978, a guest named Elena Voss checked into Room 404 of the Briar House Hotel and never checked out. Her second line in the ledger was scraped away until the paper was thin enough to see light through. Exactly forty-eight years later—on October 31, 2026 at 03:17 AM—the hotel’s decommissioned management computer suddenly booted up and registered a new guest: **you**.

{% include "./demo/landing.png" %}

As the player, you navigate four rooms (Front Desk, Fourth Floor, Room 404, and the Basement Switchboard), recover four historical records, converse directly with the entity inhabiting the machine, and answer three knocks behind the screen.

The ghost is not a pre-rendered chat script. On every turn, an **open-weight model** served on Groq crafts a second-person psychological narrative, whispers directly into the console, and triggers real-time physical manifestations on the player’s screen:
- **CRT flicker** and power sags
- **Shadow silhouettes** creeping across the surveillance viewport
- **Knocks** rattling the audio oscillator
- **Mirror reversals** and scratched warnings
- **Signal static** and scrambled ASCII glitch messages

Your actions and dialogue directly affect your pulse (the fear meter). Accumulate too much dread before answering the knocks, and the hotel writes you into its ledger forever.

{% include "./demo/game.png" %}

---

## Demo

* **Sample Transcript**: [Read a complete exported case transcript](https://github.com/REPLACE_WITH_YOUR_USERNAME/room-404/blob/main/docs/demo/sample-transcript.md)
* **Visual Tour**:
  * [The Landing Check-in Screen](https://raw.githubusercontent.com/REPLACE_WITH_YOUR_USERNAME/room-404/main/docs/demo/landing.png)
  * [The In-Game Haunting Interface](https://raw.githubusercontent.com/REPLACE_WITH_YOUR_USERNAME/room-404/main/docs/demo/game.png)
* **Testing Instructions for Judges**:
  1. Clone the repository and run `cd room-404/api && cp .env.example .env`.
  2. Add your Groq API key (`GROQ_API_KEY=...`).
  3. Run `npm install && npm run dev` in `api/`, and `npm install && npm run dev` in `web/`.
  4. Open `http://127.0.0.1:3000`, enter an alias, and turn Sound ON for the full CRT audio atmosphere.

---

## Code & Architecture

* **Repository**: [https://github.com/REPLACE_WITH_YOUR_USERNAME/room-404](https://github.com/REPLACE_WITH_YOUR_USERNAME/room-404) (MIT Licensed)

The project is structured with a modular architecture that separates **deterministic domain truth** from **generative haunting**:

```mermaid
flowchart LR
  WEB[Next.js 16 Web UI\n(Modular Components & Custom Hooks)] --> HTTP[Express 5 API Router]
  HTTP --> APP[HauntingService]
  APP --> DOMAIN[Deterministic Domain Engine\n(State, Invariants & Limits)]
  APP --> PORTS[Repository & Narrator Ports]
  PORTS -.-> FILE[FileVisitRepository\n(Private Atomic JSON)]
  PORTS -.-> MODEL[GroqSceneNarrator\n(Open-Weight GPT OSS 120B / Gemma)]
```

### Why Deterministic Bounds Matter in Horror AI
If an LLM can hallucinate whatever it wants, horror loses its stakes. If the AI can arbitrarily move the player to a fantasy room or pretend a clue was found, the puzzle dissolves.

In Room 404:
1. **Code owns the facts**: The four clues, room graph, and ending gates are authored domain invariants. The model receives *only* clues the player has actually discovered.
2. **Strict Output Validation**: The backend checks the model's output schema, evidence citations, and text lengths. If the model hallucinates an unvisited room or invents a fake clue, the turn fails atomically and the game state remains untainted.
3. **The AI owns the atmosphere**: The open-weight model chooses how the ghost perceives you, what it whispers, and which physical screen effect to trigger.

---

## Why Open Innovation Matters

The Week 4 challenge asks: *Why does open innovation matter for what you built?*

### 1. Freedom from Corporate Content Filtering
Commercial closed-source APIs frequently over-censor psychological horror, spooky fiction, and eerie lore due to blunt commercial safety guardrails. Open-weight models like `openai/gpt-oss-120b` running on high-speed inference engines like Groq allow creators to author creative fiction with nuanced tension without fear of arbitrary account bans or prompt refusals.

### 2. Predictable, Structured Output Invariants
By using open models with strict JSON schema enforcement, the application guarantees that model responses map directly to typed UI state machine transitions (manifestations, evidence citations, screen messages) rather than untyped prose blobs.

### 3. Absolute Privacy for Player Stories
Every session transcript is saved locally in private JSON files (`api/data/`) with file mode `0600`. No telemetry, analytics, or story transcripts are monetized or collected.

---

## The Moment It Landed

During local testing, after recovering the second clue—the corridor photograph showing Elena's reflection in the glass—I typed into the terminal: *"Who was holding the camera?"*

The model returned:
> *“You turn, turn—your fear fuels my circuit. I am the lock you cannot escape.”*

At the exact same instant, the interface triggered the `static` manifestation: the CRT scanlines jittered violently, the audio oscillator plunged into a distorted hum, and `...error... echo...` flashed in red across the screen. 

In that moment, it ceased to be a simple text prompt. The model and the interface had converged: the ghost wasn't just in the prose—the ghost was in the machine.
