"use client";

import React, { useState } from "react";
import { CLUE_IDS, GAME_CONSTANTS, HOTEL_FLOORS } from "../constants/game";
import type { Evidence, Health, Session } from "../types/game";

interface CasePanelProps {
  readonly session: Session;
  readonly health: Health | null;
  readonly onSelectClue: (clue: Evidence) => void;
}

export function CasePanel({ session, health, onSelectClue }: CasePanelProps) {
  const [tab, setTab] = useState<"evidence" | "history">("evidence");

  const evidenceFoundCount = session.clues.length.toString().padStart(2, "0");
  const totalCluesCount = CLUE_IDS.length.toString().padStart(2, "0");
  const isHighFear = session.fear >= GAME_CONSTANTS.HIGH_FEAR_THRESHOLD;

  return (
    <aside className="case-panel">
      <div className="case-header">
        <span>THE MACHINE REMEMBERS</span>
        <strong>
          {evidenceFoundCount} <i>/ {totalCluesCount}</i>
        </strong>
      </div>

      <div className="fear-label">
        <span>YOUR PULSE</span>
        <strong>{session.fear}%</strong>
      </div>

      <div className="fear-track">
        <i style={{ width: `${session.fear}%` }} />
      </div>

      <p className="fear-copy">
        {isHighFear
          ? "The hotel knows your footsteps now."
          : "Stay calm. It can hear you through the walls."}
      </p>

      <div className="case-tabs">
        <button
          className={tab === "evidence" ? "selected" : ""}
          onClick={() => setTab("evidence")}
        >
          EVIDENCE
        </button>
        <button
          className={tab === "history" ? "selected" : ""}
          onClick={() => setTab("history")}
        >
          HISTORY
        </button>
      </div>

      {tab === "evidence" ? (
        <div className="clue-list">
          {CLUE_IDS.map((id, index) => {
            const item = session.evidence.find((clue) => clue.id === id);
            return (
              <button
                key={id}
                disabled={!item}
                onClick={() => item && onSelectClue(item)}
                className={item ? "found" : ""}
              >
                <span>0{index + 1}</span>
                <div>
                  <strong>{item ? item.title : "UNRECOVERED"}</strong>
                  <small>
                    {item ? item.room.toUpperCase() : "THE HOTEL IS HIDING THIS"}
                  </small>
                </div>
                <b>{item ? "↗" : "×"}</b>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="history-list">
          {session.scenes.map((item, index) => (
            <div key={item.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{item.action}</strong>
                <small>
                  {item.room.toUpperCase()} · {item.effect.toUpperCase()}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="floor-map">
        <span>YOU ARE HERE</span>
        {HOTEL_FLOORS.map((floor) => (
          <div
            key={floor.id}
            className={session.room === floor.id ? "active" : ""}
          >
            <b>{floor.number}</b>
            <span>{floor.name}</span>
            {session.room === floor.id ? <i>●</i> : null}
          </div>
        ))}
      </div>

      <p className="case-footer">
        OPEN-WEIGHT {health?.model ? health.model.toUpperCase() : "AI"}
        <br />
        THE MODEL SPEAKS. CODE KEEPS THE RULES.
      </p>
    </aside>
  );
}

