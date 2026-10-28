"use client";

import React, { FormEvent, useState } from "react";
import { GAME_CONSTANTS } from "../constants/game";
import type { Health } from "../types/game";

interface LandingViewProps {
  readonly health: Health | null;
  readonly isBusy: boolean;
  readonly isBooting: boolean;
  readonly error: string;
  readonly onCheckIn: (alias: string) => void;
}

export function LandingView({
  health,
  isBusy,
  isBooting,
  error,
  onCheckIn,
}: LandingViewProps) {
  const [alias, setAlias] = useState("");
  const isAiReady = health?.aiReady ?? false;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isBusy || isBooting || !isAiReady) return;
    onCheckIn(alias);
  }

  return (
    <main className="landing-content">
      <div className="landing-copy">
        <div className="tiny-label">
          <span /> A GHOST IN THE MACHINE EXPERIENCE
        </div>
        <p className="pretitle">BRIAR HOUSE HOTEL · OCTOBER 31, 2026</p>
        <h1>
          THE HOTEL
          <br />
          HAS <em>YOUR</em>
          <br />
          NAME.
        </h1>
        <p className="landing-description">
          Room 404 has been sealed for forty-eight years. Tonight, the old computer
          checked someone in. You can hear three knocks behind its screen. The guest
          who never checked out is waiting for you to answer.
        </p>

        <form className="checkin" onSubmit={handleSubmit}>
          <label htmlFor="alias-input">WHAT NAME SHOULD THE LEDGER KEEP?</label>
          <div>
            <input
              id="alias-input"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              maxLength={GAME_CONSTANTS.MAX_ALIAS_LENGTH}
              placeholder="Enter an alias"
              autoComplete="off"
            />
            <button disabled={isBusy || isBooting || !isAiReady} type="submit">
              {isBusy ? "THE DOOR IS OPENING…" : "CHECK IN →"}
            </button>
          </div>
          <small>
            {isAiReady
              ? "Use an alias. Your visit is saved only on this computer."
              : "Add a GROQ_API_KEY to api/.env to wake the ghost."}
          </small>
        </form>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
      </div>

      <div className="landing-side">
        <span>GUEST STATUS</span>
        <strong>UNKNOWN</strong>
        <div />
        <span>LAST CHECKOUT</span>
        <strong>NEVER</strong>
        <div />
        <span>PROPERTY CONDITION</span>
        <strong>OCCUPIED</strong>
        <p>
          HEADPHONES RECOMMENDED
          <br />
          NO REAL WORLD FILES ARE ACCESSED
        </p>
      </div>

      <div className="bottom-warning">
        ✦ THIS STORY REMEMBERS WHAT YOU FIND{" "}
        <span>SCROLL THE SHADOWS. ANSWER THE KNOCKS.</span>
      </div>
    </main>
  );
}
