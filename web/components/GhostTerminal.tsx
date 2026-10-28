"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import type { Effect, Session } from "../types/game";

interface GhostTerminalProps {
  readonly session: Session;
  readonly isBusy: boolean;
  readonly onRunCommand: (
    command: string,
  ) => Promise<{ output: string; effect?: Effect; screenMessage?: string } | null>;
}

interface LogEntry {
  readonly id: string;
  readonly type: "user" | "system" | "ghost" | "error";
  readonly text: string;
}

export function GhostTerminal({
  session,
  isBusy,
  onRunCommand,
}: GhostTerminalProps) {
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<readonly LogEntry[]>([
    {
      id: "boot-1",
      type: "system",
      text: [
        "BRIAR-OS v4.04 (PDP-11 / RSTS-E ARCHITECTURE)",
        "SYSTEM DATE: OCTOBER 31, 1978 — CURRENT RETRIEVAL: 03:17 AM",
        "CONNECTING TTY04 TO HOTEL WIRE HARNESS...",
        "TYPE 'help' FOR AVAILABLE SUBSYSTEM COMMANDS.",
      ].join("\n"),
    },
  ]);

  const [cmdHistory, setCmdHistory] = useState<readonly string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const logEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isBusy]);

  async function handleCommandSubmit(e?: FormEvent) {
    if (e) e.preventDefault();
    const clean = inputVal.trim();
    if (!clean || isBusy) return;

    if (clean.toLowerCase() === "clear") {
      setHistory([]);
      setInputVal("");
      return;
    }

    setCmdHistory((prev) => [clean, ...prev]);
    setHistoryIndex(-1);

    const userEntry: LogEntry = {
      id: `usr-${Date.now()}`,
      type: "user",
      text: `${session.alias}@BRIAR-404:[/${session.room}]$ ${clean}`,
    };

    setHistory((prev) => [...prev, userEntry]);
    setInputVal("");

    const res = await onRunCommand(clean);
    if (!res) {
      setHistory((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          type: "error",
          text: "[COMMUNICATION FAILURE]: The wire signal dissolved in static.",
        },
      ]);
      return;
    }

    if (res.output) {
      setHistory((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          type: res.output.includes("WHISPER") ? "ghost" : "system",
          text: res.output,
        },
      ]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = Math.min(cmdHistory.length - 1, historyIndex + 1);
      setHistoryIndex(nextIdx);
      setInputVal(cmdHistory[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInputVal("");
      } else {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    }
  }

  function runQuickCommand(cmd: string) {
    if (isBusy) return;
    setInputVal(cmd);
    inputRef.current?.focus();
  }

  const promptPrefix = `${session.alias.toUpperCase()}@BRIAR-404:[/${session.room}]$`;

  return (
    <div className="ghost-terminal-container">
      <div className="terminal-topbar">
        <div className="terminal-title">
          <span className="terminal-dot" /> BRIAR-OS v4.04 (TTY04) · PDP-11 CONSOLE
        </div>
        <div className="terminal-stats">
          <span>SECTOR: {session.room.toUpperCase()}</span>
          <span>PULSE: {session.fear}%</span>
          <span>RECORDS: {session.clues.length}/4</span>
        </div>
      </div>

      <div className="terminal-body" onClick={() => inputRef.current?.focus()}>
        {history.map((entry) => (
          <div key={entry.id} className={`terminal-line line-${entry.type}`}>
            <pre>{entry.text}</pre>
          </div>
        ))}
        {isBusy && (
          <div className="terminal-line line-busy">
            <span className="blinking-dot">●</span> ACCESSING SECTOR WIRES...
          </div>
        )}
        <div ref={logEndRef} />
      </div>

      <div className="terminal-quick-actions">
        <span className="quick-label">QUICK MACROS:</span>
        <button type="button" onClick={() => runQuickCommand("help")}>
          help
        </button>
        <button type="button" onClick={() => runQuickCommand("ls")}>
          ls
        </button>
        <button
          type="button"
          onClick={() =>
            runQuickCommand(
              session.room === "lobby"
                ? "cat ledger_1978.log"
                : session.room === "hallway"
                  ? "cat corridor_cctv.raw"
                  : session.room === "suite"
                    ? "cat mirror_note.txt"
                    : "cat switchboard_tape.dat",
            )
          }
        >
          cat [record]
        </button>
        <button type="button" onClick={() => runQuickCommand("whoami")}>
          whoami
        </button>
        <button type="button" onClick={() => runQuickCommand("status")}>
          status
        </button>
        <button type="button" onClick={() => runQuickCommand("dial 404")}>
          dial 404
        </button>
        <button type="button" onClick={() => runQuickCommand("clear")}>
          clear
        </button>
      </div>

      <form className="terminal-input-bar" onSubmit={handleCommandSubmit}>
        <span className="terminal-prompt">{promptPrefix}</span>
        <input
          ref={inputRef}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isBusy}
          placeholder="Type a command or speak into the machine..."
          autoComplete="off"
          autoFocus
        />
        <button type="submit" disabled={isBusy || !inputVal.trim()}>
          EXECUTE ↵
        </button>
      </form>
    </div>
  );
}

