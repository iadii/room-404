"use client";

import React, { FormEvent, useState } from "react";
import { GAME_CONSTANTS } from "../constants/game";
import type { Session } from "../types/game";

interface StoryPanelProps {
  readonly session: Session;
  readonly isBusy: boolean;
  readonly error: string;
  readonly onAction: (actionId: string, question?: string) => void;
  readonly onLeave: () => void;
}

export function StoryPanel({
  session,
  isBusy,
  error,
  onAction,
  onLeave,
}: StoryPanelProps) {
  const [question, setQuestion] = useState("");
  const currentScene = session.scenes.at(-1);

  function handleSpeakSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = question.trim();
    if (!clean || isBusy) return;
    onAction("speak", clean);
    setQuestion("");
  }

  const chapterDisplay = String(session.turns).padStart(2, "0");

  return (
    <section className="story-panel" aria-live="polite">
      <div className="panel-top">
        <span>CHAPTER {chapterDisplay}</span>
        <span>03:17 AM · OCT 31, 2026</span>
      </div>

      <div className="location-number">{session.roomInfo.number}</div>
      <p className="eyebrow">YOU ARE IN</p>
      <h2>{session.roomInfo.name}</h2>
      <p className="ambience">{session.roomInfo.ambience}</p>
      <div className="hairline" />

      <div className="scene-block">
        <p className="scene-action">
          ✦ {currentScene?.action ?? "THE HOTEL IS SILENT"}
        </p>
        <p className="scene-prose">
          {currentScene?.prose ?? "The screen waits for your first choice."}
        </p>
      </div>

      <div className="ghost-voice">
        <div>
          <span className="ghost-icon">◉</span>
          <span>THE GUEST WHISPERS</span>
          <span className="waveform" aria-hidden="true">
            ▮▯▮▮▯▮
          </span>
        </div>
        <blockquote>“{currentScene?.whisper}”</blockquote>
        <small>
          {currentScene?.evidenceIds?.length
            ? `FROM ${currentScene.evidenceIds.join(" · ")}`
            : "THE HOTEL IS LISTENING"}
        </small>
      </div>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {session.ended ? (
        <div className="ending-card">
          <span>YOUR CHECKOUT</span>
          <strong>
            {session.ending === "escaped"
              ? "YOU LEFT. IT REMEMBERS."
              : "YOUR NAME IS STILL HERE."}
          </strong>
          <button onClick={onLeave}>BEGIN ANOTHER VISIT ↗</button>
        </div>
      ) : (
        <div className="choices">
          <p className="eyebrow">WHAT DO YOU DO?</p>
          <div className="choice-grid">
            {session.actions.map((action, index) => (
              <button
                key={action.id}
                disabled={isBusy}
                onClick={() => onAction(action.id)}
                className={action.ending ? "final-choice" : ""}
              >
                <span>0{index + 1}</span>
                {action.label}
                <b>↗</b>
              </button>
            ))}
          </div>

          <form onSubmit={handleSpeakSubmit}>
            <label htmlFor="speak-input">OR SPEAK TO WHAT IS IN THE WALLS</label>
            <div>
              <input
                id="speak-input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={GAME_CONSTANTS.MAX_SPEECH_LENGTH}
                placeholder="Ask the ghost a question…"
                disabled={isBusy}
              />
              <button
                disabled={isBusy || !question.trim()}
                aria-label="Speak to the ghost"
              >
                ↵
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

