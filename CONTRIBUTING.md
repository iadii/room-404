# Contributing

Open an issue before changing the fixed hotel records or the ending rules. Keep the 1978 record facts and the 2026 visit timeline consistent.

The API and web app have separate dependencies and checks. In `api/`, run `npm ci`, `npm run typecheck`, `npm test`, and `npm run build`. In `web/`, run `npm ci`, `npm run typecheck`, and `npm run build`.

Do not commit Groq keys, real personal stories, or private transcripts. New model adapters should implement `SceneNarrator`; state transitions belong in the domain. Add a focused test for new rules or new trust boundaries. Contributions are licensed under MIT.
