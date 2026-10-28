"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Effect = "none" | "flicker" | "shadow" | "knock" | "mirror" | "static";
type Scene = { id: string; action: string; room: string; prose: string; whisper: string; effect: Effect; screenMessage: string; evidenceIds: string[]; at: string };
type Evidence = { id: string; title: string; text: string; room: string };
type Action = { id: string; label: string; clue?: string; target?: string; ending?: boolean };
type Session = { id: string; alias: string; room: string; roomInfo: { name: string; number: string; ambience: string }; fear: number; clues: string[]; evidence: Evidence[]; actions: Action[]; scenes: Scene[]; turns: number; ended: boolean; ending: "escaped" | "claimed" | null };
type Health = { status: string; model: string; aiReady: boolean; isLocal?: boolean; elevenLabsEnabled?: boolean };

const floors = [
  { id: "lobby", name: "FRONT DESK", number: "G" },
  { id: "hallway", name: "FOURTH FLOOR", number: "4" },
  { id: "suite", name: "ROOM 404", number: "404" },
  { id: "basement", name: "SWITCHBOARD", number: "B" },
];
const clueIds = ["REGISTER", "CAMERA", "MIRROR", "SWITCHBOARD"];

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The hotel has stopped responding.");
  return data as T;
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [alias, setAlias] = useState("");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"evidence" | "history">("evidence");
  const [openedClue, setOpenedClue] = useState<Evidence | null>(null);
  const [haunt, setHaunt] = useState<Effect>("none");
  const [sound, setSound] = useState(false);
  const audio = useRef<{ context: AudioContext; oscillator: OscillatorNode } | null>(null);
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      try {
        const h = await api<Health>("/api/health");
        setHealth(h);
        const id = localStorage.getItem("room-404-visit");
        if (id) {
          try { setSession(await api<Session>(`/api/sessions/${id}`)); }
          catch { localStorage.removeItem("room-404-visit"); }
        }
      } catch (cause) { setError(cause instanceof Error ? cause.message : "The hotel is unavailable."); }
      finally { setBooting(false); }
    })();
  }, []);

  const scene = session?.scenes.at(-1);
  useEffect(() => {
    if (!scene) return;
    setHaunt(scene.effect);
    const timeout = window.setTimeout(() => setHaunt("none"), 2800);
    return () => window.clearTimeout(timeout);
  }, [scene?.id]);

  useEffect(() => {
    if (!scene?.whisper || !sound || !health?.elevenLabsEnabled) return;
    const voiceAudio = new Audio();
    fetch("/api/whisper-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: scene.whisper }),
    })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (blob) {
          voiceAudio.src = URL.createObjectURL(blob);
          void voiceAudio.play().catch(() => {});
        }
      })
      .catch(() => {});
    return () => {
      voiceAudio.pause();
    };
  }, [scene?.id, sound, health?.elevenLabsEnabled]);

  useEffect(() => () => { void audio.current?.context.close(); }, []);

  function toggleSound() {
    if (audio.current) {
      void audio.current.context.close();
      audio.current = null;
      setSound(false);
      return;
    }
    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const volume = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 54;
      volume.gain.value = 0.014;
      oscillator.connect(volume).connect(context.destination);
      oscillator.start();
      audio.current = { context, oscillator };
      setSound(true);
    } catch { setError("Audio is unavailable in this browser."); }
  }

  async function begin(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const next = await api<Session>("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alias: alias.trim() || "GUEST" }) });
      localStorage.setItem("room-404-visit", next.id);
      setSession(next);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The door would not open."); }
    finally { setBusy(false); }
  }

  async function act(actionId: string, spoken = "") {
    if (!session || busy) return;
    setBusy(true); setError("");
    try {
      const next = await api<Session>(`/api/sessions/${session.id}/actions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actionId, question: spoken }) });
      setSession(next); setQuestion("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The hotel has stopped responding."); }
    finally { setBusy(false); }
  }

  function leave() { localStorage.removeItem("room-404-visit"); setSession(null); setAlias(""); setQuestion(""); setError(""); setOpenedClue(null); }

  return <div className={`site ${session ? "playing" : "landing"} effect-${haunt} ${session && session.fear >= 75 ? "high-fear" : ""}`}>
    <div className="hotel-image" aria-hidden="true" />
    <div className="film-grain" aria-hidden="true" />
    <div className="vignette" aria-hidden="true" />
    <div className="scanlines" aria-hidden="true" />
    {haunt !== "none" && scene && <div className="haunt-flash" aria-hidden="true"><span>{scene.screenMessage || "SHE IS HERE"}</span></div>}

    <header className="site-header">
      <div className="logo"><span className="logo-mark">✝</span> ROOM<span className="logo-number">404</span><span className="logo-slash">/</span></div>
      <div className="header-center"><span className="rec-dot" /> BRIAR HOUSE <span>·</span> HALLOWEEN NIGHT <span>·</span> 03:17 AM</div>
      <div className="header-actions">
        <span className="signal"><i /> {health?.aiReady ? (health.isLocal ? "OFFLINE HOST (LOCAL)" : "THE GUEST IS LISTENING") : "SIGNAL LOST"}</span>
        <button onClick={toggleSound} aria-label={sound ? "Mute atmosphere" : "Enable atmosphere"}>{sound ? "SOUND ON" : "SOUND OFF"} <span>{sound ? "◖))" : "◖)"}</span></button>
      </div>
    </header>

    {!session ? <main className="landing-content">
      <div className="landing-copy"><div className="tiny-label"><span /> A GHOST IN THE MACHINE EXPERIENCE</div><p className="pretitle">BRIAR HOUSE HOTEL · OCTOBER 31, 2026</p><h1>THE HOTEL<br />HAS <em>YOUR</em><br />NAME.</h1><p className="landing-description">Room 404 has been sealed for forty-eight years. Tonight, the old computer checked someone in. You can hear three knocks behind its screen. The guest who never checked out is waiting for you to answer.</p>
        <form className="checkin" onSubmit={begin}><label htmlFor="alias">WHAT NAME SHOULD THE LEDGER KEEP?</label><div><input id="alias" value={alias} onChange={(event) => setAlias(event.target.value)} maxLength={24} placeholder="Enter an alias" autoComplete="off" /><button disabled={busy || booting || !health?.aiReady} type="submit">{busy ? "THE DOOR IS OPENING…" : "CHECK IN →"}</button></div><small>{health?.aiReady ? (health.isLocal ? "Running 100% offline with local open-weight model." : "Use an alias. Your visit is saved only on this computer.") : "Add a Groq key or Ollama URL to .env to wake the ghost."}</small></form>
        {error && <div className="error" role="alert">{error}</div>}
      </div>
      <div className="landing-side"><span>GUEST STATUS</span><strong>UNKNOWN</strong><div /><span>LAST CHECKOUT</span><strong>NEVER</strong><div /><span>PROPERTY CONDITION</span><strong>OCCUPIED</strong><p>HEADPHONES RECOMMENDED<br />NO REAL WORLD FILES ARE ACCESSED</p></div>
      <div className="bottom-warning">✦ THIS STORY REMEMBERS WHAT YOU FIND <span>SCROLL THE SHADOWS. ANSWER THE KNOCKS.</span></div>
    </main> : <main className="game">
      <div className="game-top"><span className="tiny-label"><span /> VISIT #{session.id.slice(0, 6).toUpperCase()}</span><div><button onClick={leave}>← LEAVE THE HOTEL</button><a href={`/api/sessions/${session.id}/export`}>↓ SAVE TRANSCRIPT</a></div></div>
      <div className="game-grid">
        <section className="story-panel" aria-live="polite"><div className="panel-top"><span>CHAPTER {String(session.turns).padStart(2, "0")}</span><span>03:17 AM · OCT 31, 2026</span></div><div className="location-number">{session.roomInfo.number}</div><p className="eyebrow">YOU ARE IN</p><h2>{session.roomInfo.name}</h2><p className="ambience">{session.roomInfo.ambience}</p><div className="hairline" />
          <div className="scene-block"><p className="scene-action">✦ {scene?.action ?? "THE HOTEL IS SILENT"}</p><p className="scene-prose">{scene?.prose ?? "The screen waits for your first choice."}</p></div>
          <div className="ghost-voice"><div><span className="ghost-icon">◉</span><span>THE GUEST WHISPERS</span><span className="waveform" aria-hidden="true">▮▯▮▮▯▮</span></div><blockquote>“{scene?.whisper}”</blockquote><small>{scene?.evidenceIds.length ? `FROM ${scene.evidenceIds.join(" · ")}` : "THE HOTEL IS LISTENING"}</small></div>
          {error && <div className="error" role="alert">{error}</div>}
          {session.ended ? <div className="ending-card"><span>YOUR CHECKOUT</span><strong>{session.ending === "escaped" ? "YOU LEFT. IT REMEMBERS." : "YOUR NAME IS STILL HERE."}</strong><button onClick={leave}>BEGIN ANOTHER VISIT ↗</button></div> : <div className="choices"><p className="eyebrow">WHAT DO YOU DO?</p><div className="choice-grid">{session.actions.map((action, index) => <button key={action.id} disabled={busy} onClick={() => void act(action.id)} className={action.ending ? "final-choice" : ""}><span>0{index + 1}</span>{action.label}<b>↗</b></button>)}</div><form onSubmit={(event) => { event.preventDefault(); void act("speak", question); }}><label htmlFor="speak">OR SPEAK TO WHAT IS IN THE WALLS</label><div><input id="speak" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={140} placeholder="Ask the ghost a question…" disabled={busy} /><button disabled={busy || !question.trim()} aria-label="Speak to the ghost">↵</button></div></form></div>}
        </section>

        <div className="haunted-stage" aria-hidden="true"><div className="stage-crosshair"><span>CAM 04</span><span>REC ●</span></div><div className="stage-message">{haunt !== "none" ? scene?.screenMessage : "NO OCCUPANT DETECTED"}</div><div className="stage-coordinates">X: 0404 <span>Y: 0317</span></div></div>

        <aside className="case-panel"><div className="case-header"><span>THE MACHINE REMEMBERS</span><strong>{session.clues.length.toString().padStart(2, "0")} <i>/ 04</i></strong></div><div className="fear-label"><span>YOUR PULSE</span><strong>{session.fear}%</strong></div><div className="fear-track"><i style={{ width: `${session.fear}%` }} /></div><p className="fear-copy">{session.fear >= 75 ? "The hotel knows your footsteps now." : "Stay calm. It can hear you through the walls."}</p>
          <div className="case-tabs"><button className={tab === "evidence" ? "selected" : ""} onClick={() => setTab("evidence")}>EVIDENCE</button><button className={tab === "history" ? "selected" : ""} onClick={() => setTab("history")}>HISTORY</button></div>
          {tab === "evidence" ? <div className="clue-list">{clueIds.map((id, index) => { const item = session.evidence.find((clue) => clue.id === id); return <button key={id} disabled={!item} onClick={() => setOpenedClue(item || null)} className={item ? "found" : ""}><span>0{index + 1}</span><div><strong>{item ? item.title : "UNRECOVERED"}</strong><small>{item ? item.room.toUpperCase() : "THE HOTEL IS HIDING THIS"}</small></div><b>{item ? "↗" : "×"}</b></button>; })}</div> : <div className="history-list">{session.scenes.map((item, index) => <div key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.action}</strong><small>{item.room.toUpperCase()} · {item.effect.toUpperCase()}</small></div></div>)}</div>}
          <div className="floor-map"><span>YOU ARE HERE</span>{floors.map((floor) => <div key={floor.id} className={session.room === floor.id ? "active" : ""}><b>{floor.number}</b><span>{floor.name}</span>{session.room === floor.id ? <i>●</i> : null}</div>)}</div>
          <p className="case-footer">OPEN-WEIGHT {health?.model ? health.model.toUpperCase() : "AI"}<br />{health?.isLocal ? "100% OFFLINE LOCAL RUNNER · " : ""}THE MODEL SPEAKS. CODE KEEPS THE RULES.</p>
        </aside>
      </div>
    </main>}
    {openedClue && <div className="clue-modal" role="dialog" aria-modal="true" aria-label={openedClue.title} onClick={() => setOpenedClue(null)}><div onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setOpenedClue(null)} aria-label="Close record">×</button><span>RECOVERED RECORD · {openedClue.id}</span><h2>{openedClue.title}</h2><p>{openedClue.text}</p><small>THE RECORD IS FIXED. THE GHOST CAN ONLY INTERPRET IT.</small></div></div>}
    <footer className="site-footer"><span>ROOM 404 © 2026 · AN ORIGINAL FICTIONAL HORROR GAME</span><span>GHOST IN THE MACHINE / HACKTOBERFEST WEEK 4</span><span>NO REAL SHELL OR CAMERA ACCESS</span></footer>
  </div>;
}
