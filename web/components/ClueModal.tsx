"use client";

import React from "react";
import type { Evidence } from "../types/game";

interface ClueModalProps {
  readonly clue: Evidence;
  readonly onClose: () => void;
}

export function ClueModal({ clue, onClose }: ClueModalProps) {
  return (
    <div
      className="clue-modal"
      role="dialog"
      aria-modal="true"
      aria-label={clue.title}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close record"
        >
          ×
        </button>
        <span>RECOVERED RECORD · {clue.id}</span>
        <h2>{clue.title}</h2>
        <p>{clue.text}</p>
        <small>THE RECORD IS FIXED. THE GHOST CAN ONLY INTERPRET IT.</small>
      </div>
    </div>
  );
}
