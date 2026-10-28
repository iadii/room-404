# Room 404

**The hotel has your name.** Room 404 is a playable browser horror experience built for the [Hacktoberfest 2026 Week 4 “Ghost in the Machine” challenge](https://dev.to/challenges/hacktoberfest-week4-2026-10-26).

On Halloween night, 2026, you enter an abandoned hotel whose obsolete management computer still holds the trace of a guest from October 31, 1978. Explore four rooms, recover four records, speak to the ghost through the machine, and answer the knocks behind the screen. An open-weight model narrating the ghost controls the prose, whisper, and typed visual manifestations (flicker, shadow, knock, mirror reversal, or signal static) while strict deterministic rules enforce the world invariants, clue discovery, and fear meter.

![Room 404 opening screen](docs/demo/landing.png)

[See the game screen](docs/demo/game.png) · [Read a sample transcript](docs/demo/sample-transcript.md)

---

## Why Open-Source AI & Open-Weight Models Matter

1. **True Offline Resilience ("Lights and Internet Off")**:
   Horror is intimate when it runs locally on your own machine. Room 404 supports **100% offline local inference** using open-weight models (such as Google's Gemma 2 via Ollama) or hosted open-weight inference via Groq. No player data, queries, or generated stories leave your laptop in offline mode.
2. **Freedom from Proprietary Censorship & Refusals**:
   Commercial closed APIs often refuse psychological dread, horror themes, or atmospheric ghost lore due to over-zealous commercial safety filters. Open-weight models like **Gemma 2 (`gemma2-9b-it`)** allow creators to author genuine artistic fiction with clear, structured boundaries.
3. **Deterministic Truth vs. Generative Haunting**:
   The AI cannot hallucinate rooms, invent false clues, or unlock an ending early. Code keeps the records, graph, and fear rules; the open model brings the machine to life.

---

## Features

- **Ghost in the Machine Narration**: Powered by open-weight models (`gemma2-9b-it` or `openai/gpt-oss-120b`).
- **Dynamic CRT Manifestations**: Glitch screen flashes, scanlines, camera crosshairs, and retro phosphor styling.
- **Audio Atmosphere & Whisper Voice**: Web Audio oscillator drone, plus optional **ElevenLabs** whisper voice synthesis.
- **Strict Evidence & Fear Engine**: 4 historical clues from 1978; fear pulse drives the path to two branching endings (`escaped` vs. `claimed`).
- **Local Private Storage & Export**: Visited sessions stored as private JSON files with one-click Markdown transcript export.

---

## Architecture & Verification

The project is structured as a TypeScript modular monolith with an Express API and a Next.js 16 frontend:

```mermaid
flowchart LR
  WEB[Next.js 16 Web UI] --> HTTP[Express 5 API Router]
  HTTP --> APP[HauntingService]
  APP --> DOMAIN[Deterministic Domain Engine]
  APP --> PORTS[Repository & Narrator Ports]
  PORTS -.-> FILE[FileVisitRepository]
  PORTS -.-> MODEL[Open-Weight Model Adapter\n(Gemma 2 / Groq / Ollama)]
  PORTS -.-> VOICE[ElevenLabs Whisper Audio]
```

### Run Tests and Build

```sh
# API tests, typecheck, and build
cd api
npm test
npm run typecheck
npm run build

# Web app build
cd ../web
npm run build
```

---

## Quickstart

### Prerequisites
- Node.js 20+
- A [Groq API key](https://console.groq.com/) (for cloud hosted open weights) OR a local [Ollama](https://ollama.ai) instance (e.g. `ollama run gemma2:9b`).
- *(Optional)* [ElevenLabs API key](https://elevenlabs.io/) for synthesized voice whispers.

### Terminal 1: Backend API

```sh
cd api
cp .env.example .env
# Set GROQ_API_KEY=... or OLLAMA_BASE_URL=http://127.0.0.1:11434/v1
npm install
npm run dev
```

### Terminal 2: Web Frontend

```sh
cd web
npm install
npm run dev
```

Open `http://127.0.0.1:3000` in your browser. Next.js proxies `/api/*` to the Express backend on port `4000`.

---

## Challenge Category Entries

Built for **Hacktoberfest 2026 Week 4: Ghost in the Machine** (#hf26challenge):
- **Overall Winner Track**: Psychological horror text adventure powered by open-weight AI.
- **Best Use of Gemma ($200 Featured Category)**: Native integration with Google Gemma 2 (`gemma2-9b-it`).
- **Best Use of ElevenLabs ($100 Partner Category)**: Optional real-time whisper voice synthesis for ghost dialogue.

---

## License

MIT. See [LICENSE](LICENSE).
