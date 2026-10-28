"use client";

import { useEffect, useRef, useState } from "react";
import { GAME_CONSTANTS } from "../constants/game";
import type { Health, Session } from "../types/game";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "The hotel has stopped responding.");
  }
  return data as T;
}

export function useHauntingSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [error, setError] = useState("");
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    async function initialize() {
      try {
        const healthData = await fetchJson<Health>("/api/health");
        setHealth(healthData);

        const savedVisitId = localStorage.getItem(GAME_CONSTANTS.LOCAL_STORAGE_VISIT_KEY);
        if (savedVisitId) {
          try {
            const activeSession = await fetchJson<Session>(`/api/sessions/${savedVisitId}`);
            setSession(activeSession);
          } catch {
            localStorage.removeItem(GAME_CONSTANTS.LOCAL_STORAGE_VISIT_KEY);
          }
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "The hotel is unavailable.");
      } finally {
        setIsBooting(false);
      }
    }

    void initialize();
  }, []);

  async function checkIn(alias: string) {
    if (isBusy) return;
    setIsBusy(true);
    setError("");

    try {
      const cleanAlias = alias.trim() || "GUEST";
      const newSession = await fetchJson<Session>("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias: cleanAlias }),
      });
      localStorage.setItem(GAME_CONSTANTS.LOCAL_STORAGE_VISIT_KEY, newSession.id);
      setSession(newSession);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The door would not open.");
    } finally {
      setIsBusy(false);
    }
  }

  async function performAction(actionId: string, question = "") {
    if (!session || isBusy) return;
    setIsBusy(true);
    setError("");

    try {
      const updated = await fetchJson<Session>(`/api/sessions/${session.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId, question }),
      });
      setSession(updated);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The hotel has stopped responding.");
    } finally {
      setIsBusy(false);
    }
  }

  function leaveHotel() {
    localStorage.removeItem(GAME_CONSTANTS.LOCAL_STORAGE_VISIT_KEY);
    setSession(null);
    setError("");
  }

  return {
    session,
    health,
    isBusy,
    isBooting,
    error,
    setError,
    checkIn,
    performAction,
    leaveHotel,
  };
}
