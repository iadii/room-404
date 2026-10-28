# Room 404

**The hotel has your name.** Room 404 is a playable browser horror experience built for the [Hacktoberfest 2026 Week 4 “Ghost in the Machine” challenge](https://dev.to/challenges/hacktoberfest-week4-2026-10-26).

On Halloween night, 2026, you enter an abandoned hotel whose obsolete management computer still holds the trace of a guest from October 31, 1978. Explore four rooms, recover four historical records, speak to the entity inhabiting the machine, and answer the knocks behind the screen. An open-weight model running on Groq narrates the ghost—crafting the prose, whisper, and typed visual manifestations (flicker, shadow, knock, mirror reversal, or signal static)—while deterministic domain rules govern the world invariants, clue discovery, and fear meter.

![Room 404 opening screen](docs/demo/landing.png)

[See the game screen](docs/demo/game.png) · [Read a sample transcript](docs/demo/sample-transcript.md)

---

## Why the Open-Weight Model Matters

1. **Freedom from Corporate Content Guardrails**:
   Commercial closed-source APIs frequently over-censor psychological horror, spooky fiction, and atmospheric ghost stories due to blunt commercial safety filters. Serving an open-weight model on Groq (`openai/gpt-oss-120b`) allows genuine creative exploration of psychological dread with strict, structured output boundaries.
2. **Deterministic Rules vs. Generative Haunting**:
   Horror loses its tension if an AI can hallucinate whatever it wants. In Room 404, the AI cannot invent rooms, alter historical records, or prematurely unlock an ending. Deterministic domain code owns the hotel facts and ending gates; the open model brings the machine's voice and visual interference to life.
3. **Pluggable Architecture**:
   Because the narrator adheres to an explicit interface and standard OpenAI-compatible completions, the model provider is decoupled from game rules and presentation.

---

## Features

- **Ghost in the Machine Narration**: Driven by open-weight models served with sub-second latency on Groq.
- **Dynamic CRT Manifestations**: Glitch screen flashes, scanlines, surveillance crosshairs, and retro phosphor styling.
- **Atmospheric Audio Drone**: Web Audio oscillator drone providing low-frequency tension without external media files.
- **Strict Evidence & Fear Engine**: 4 historical clues from 1978; fear pulse drives the path to two branching endings (`escaped` vs. `claimed`).
- **Local Private Storage & Export**: Visited sessions stored as private JSON files with one-click Markdown transcript export.

---

## Architecture & Codebase Layout

The project is structured with clean separation of concerns across both frontend and backend:

```text
room-404/
├── api/                             # Express 5 modular backend (TypeScript)
│   └── src/
│       ├── app.ts                   # Express composition, CORS & error boundary
│       ├── server.ts                # HTTP listener entrypoint
│       ├── shared/config.ts         # Environment validation
│       └── modules/haunting/
│           ├── domain/              # Invariant rules, constants, and lore
│           │   ├── constants.ts     # Central game limits and thresholds
│           │   ├── game.ts          # State transitions and output validation
│           │   └── world.ts         # Authored rooms, clues, and action graph
│           ├── application/         # Orchestration service & ports
│           ├── infrastructure/      # Groq API narrator & file repository
│           └── http/                # Request validation router
└── web/                             # Next.js 16 frontend (TypeScript)
    ├── app/                         # App Router layout & top-level page
    ├── components/                  # Modular UI components
    │   ├── Header.tsx               # Status indicator & sound toggle
    │   ├── LandingView.tsx          # Guest check-in & lore card
    │   ├── StoryPanel.tsx           # Narrative, whisper, and action choices
    │   ├── SurveillanceStage.tsx    # CCTV viewport & glitch display
    │   ├── CasePanel.tsx            # Evidence viewer, pulse meter, floor map
    │   ├── ClueModal.tsx            # Document inspection modal
    │   └── Footer.tsx               # Project metadata
    ├── constants/game.ts            # UI limits, timings, and floor metadata
    ├── hooks/                       # Custom audio & session lifecycle hooks
    └── types/game.ts                # Strongly typed domain interfaces
```

---

## Quickstart

### Prerequisites
- Node.js 20+
- A [Groq API key](https://console.groq.com/keys)

### 1. Start the Backend API

```sh
cd api
cp .env.example .env
# Add your GROQ_API_KEY to api/.env
npm install
npm run dev
```

### 2. Start the Web Frontend

```sh
cd web
npm install
npm run dev
```

Open `http://127.0.0.1:3000` in your browser. Next.js proxies `/api/*` to the Express backend on port `4000`.

---

## Verification & Testing

```sh
# Run backend tests, typecheck, and build
cd api
npm test
npm run typecheck
npm run build

# Verify frontend build
cd ../web
npm run build
```

---

## License

MIT. See [LICENSE](LICENSE).
