"use client";

import { useEffect, useRef, useState } from "react";
import { GAME_CONSTANTS } from "../constants/game";

export function useAtmosphereAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<{
    context: AudioContext;
    oscillator: OscillatorNode;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        void audioRef.current.context.close();
        audioRef.current = null;
      }
    };
  }, []);

  function toggleAudio(): boolean {
    if (audioRef.current) {
      void audioRef.current.context.close();
      audioRef.current = null;
      setIsPlaying(false);
      return false;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new AudioCtx();
      const oscillator = context.createOscillator();
      const volume = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = GAME_CONSTANTS.AUDIO_FREQUENCY_HZ;
      volume.gain.value = GAME_CONSTANTS.AUDIO_GAIN_LEVEL;

      oscillator.connect(volume).connect(context.destination);
      oscillator.start();

      audioRef.current = { context, oscillator };
      setIsPlaying(true);
      return true;
    } catch {
      setIsPlaying(false);
      return false;
    }
  }

  return { isPlaying, toggleAudio };
}
