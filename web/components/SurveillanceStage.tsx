"use client";

import React from "react";
import type { Effect, Scene } from "../types/game";

interface SurveillanceStageProps {
  readonly currentScene?: Scene;
  readonly activeEffect: Effect;
}

export function SurveillanceStage({
  currentScene,
  activeEffect,
}: SurveillanceStageProps) {
  const displayMessage =
    activeEffect !== "none" && currentScene?.screenMessage
      ? currentScene.screenMessage
      : "NO OCCUPANT DETECTED";

  return (
    <div className="haunted-stage" aria-hidden="true">
      <div className="stage-crosshair">
        <span>CAM 04</span>
        <span>REC ●</span>
      </div>
      <div className="stage-message">{displayMessage}</div>
      <div className="stage-coordinates">
        X: 0404 <span>Y: 0317</span>
      </div>
    </div>
  );
}

