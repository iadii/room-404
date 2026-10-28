"use client";

import React from "react";
import type { Health } from "../types/game";

interface HeaderProps {
  readonly health: Health | null;
  readonly isSoundActive: boolean;
  readonly onToggleSound: () => void;
}

export function Header({ health, isSoundActive, onToggleSound }: HeaderProps) {
  const isAiReady = health?.aiReady ?? false;

  return (
    <header className="site-header">
      <div className="logo">
        <span className="logo-mark">✝</span> ROOM
        <span className="logo-number">404</span>
        <span className="logo-slash">/</span>
      </div>

      <div className="header-center">
        <span className="rec-dot" /> BRIAR HOUSE <span>·</span> HALLOWEEN NIGHT <span>·</span> 03:17 AM
      </div>

      <div className="header-actions">
        <span className="signal">
          <i /> {isAiReady ? "THE GUEST IS LISTENING" : "SIGNAL LOST"}
        </span>
        <button
          onClick={onToggleSound}
          aria-label={isSoundActive ? "Mute atmosphere audio" : "Enable atmosphere audio"}
        >
          {isSoundActive ? "SOUND ON" : "SOUND OFF"}{" "}
          <span>{isSoundActive ? "◖))" : "◖)"}</span>
        </button>
      </div>
    </header>
  );
}
