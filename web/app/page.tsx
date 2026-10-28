"use client";

import { useEffect, useState } from "react";
import { CasePanel } from "../components/CasePanel";
import { ClueModal } from "../components/ClueModal";
import { Footer } from "../components/Footer";
import { GhostTerminal } from "../components/GhostTerminal";
import { Header } from "../components/Header";
import { LandingView } from "../components/LandingView";
import { StoryPanel } from "../components/StoryPanel";
import { SurveillanceStage } from "../components/SurveillanceStage";
import { GAME_CONSTANTS } from "../constants/game";
import { useAtmosphereAudio } from "../hooks/useAtmosphereAudio";
import { useHauntingSession } from "../hooks/useHauntingSession";
import type { Effect, Evidence } from "../types/game";

export default function Home() {
  const {
    session,
    health,
    isBusy,
    isBooting,
    error,
    checkIn,
    performAction,
    executeTerminalCommand,
    leaveHotel,
  } = useHauntingSession();

  const { isPlaying: isSoundActive, toggleAudio } = useAtmosphereAudio();

  const [activeEffect, setActiveEffect] = useState<Effect>("none");
  const [selectedClue, setSelectedClue] = useState<Evidence | null>(null);
  const [activeView, setActiveView] = useState<"terminal" | "surveillance">("terminal");

  // Trigger transient screen glitch effect on every new scene
  const latestScene = session?.scenes.at(-1);
  useEffect(() => {
    if (!latestScene) return;
    setActiveEffect(latestScene.effect);
    const timer = window.setTimeout(
      () => setActiveEffect("none"),
      GAME_CONSTANTS.EFFECT_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [latestScene?.id]);

  async function handleTerminalExecution(command: string) {
    const result = await executeTerminalCommand(command);
    if (result?.effect && result.effect !== "none") {
      setActiveEffect(result.effect);
      window.setTimeout(
        () => setActiveEffect("none"),
        GAME_CONSTANTS.EFFECT_DURATION_MS,
      );
    }
    return result;
  }

  const isHighFear = (session?.fear ?? 0) >= GAME_CONSTANTS.HIGH_FEAR_THRESHOLD;
  const siteClasses = [
    "site",
    session ? "playing" : "landing",
    `effect-${activeEffect}`,
    isHighFear ? "high-fear" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={siteClasses}>
      {/* Background and CRT post-processing layers */}
      <div className="hotel-image" aria-hidden="true" />
      <div className="film-grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />

      {/* Screen glitch flash message */}
      {activeEffect !== "none" && latestScene && (
        <div className="haunt-flash" aria-hidden="true">
          <span>{latestScene.screenMessage || "SHE IS HERE"}</span>
        </div>
      )}

      <Header
        health={health}
        isSoundActive={isSoundActive}
        onToggleSound={toggleAudio}
      />

      {!session ? (
        <LandingView
          health={health}
          isBusy={isBusy}
          isBooting={isBooting}
          error={error}
          onCheckIn={checkIn}
        />
      ) : (
        <main className="game">
          <div className="game-top">
            <span className="tiny-label">
              <span /> VISIT #{session.id.slice(0, 6).toUpperCase()} ·{" "}
              {session.roomInfo.name.toUpperCase()}
            </span>

            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="view-switch">
                <button
                  className={activeView === "terminal" ? "active" : ""}
                  onClick={() => setActiveView("terminal")}
                  type="button"
                >
                  ⌨ GHOST TERMINAL
                </button>
                <button
                  className={activeView === "surveillance" ? "active" : ""}
                  onClick={() => setActiveView("surveillance")}
                  type="button"
                >
                  📹 CCTV CONSOLE
                </button>
              </div>
              <button onClick={leaveHotel}>← LEAVE</button>
              <a href={`/api/sessions/${session.id}/export`}>
                ↓ TRANSCRIPT
              </a>
            </div>
          </div>

          <div className="game-grid">
            {activeView === "terminal" ? (
              <GhostTerminal
                session={session}
                isBusy={isBusy}
                onRunCommand={handleTerminalExecution}
              />
            ) : (
              <>
                <StoryPanel
                  session={session}
                  isBusy={isBusy}
                  error={error}
                  onAction={performAction}
                  onLeave={leaveHotel}
                />
                <SurveillanceStage
                  currentScene={latestScene}
                  activeEffect={activeEffect}
                />
              </>
            )}

            <CasePanel
              session={session}
              health={health}
              onSelectClue={setSelectedClue}
            />
          </div>
        </main>
      )}

      {selectedClue && (
        <ClueModal
          clue={selectedClue}
          onClose={() => setSelectedClue(null)}
        />
      )}

      <Footer />
    </div>
  );
}
