"use client";

import { useCallback, useRef } from "react";

const SOUND_KEY = "kagotoku_sound_enabled";

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(SOUND_KEY) !== "false";
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(SOUND_KEY, enabled ? "true" : "false");
}

type SoundType =
  | "search"
  | "post"
  | "coin"
  | "favorite"
  | "receipt"
  | "error";

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const W = window as unknown as { _kagotokuAudioCtx?: AudioContext };
  if (!W._kagotokuAudioCtx) {
    W._kagotokuAudioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  }
  return W._kagotokuAudioCtx;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
  startTime: number = 0
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + startTime + duration
  );
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
}

function playSound(type: SoundType): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume if suspended (browser autoplay policy)
  if (ctx.state === "suspended") ctx.resume();

  const vol = 0.3;

  switch (type) {
    case "search": {
      // ポップな短い音: 高めの2音
      playTone(ctx, 880, 0.08, vol, "sine", 0);
      playTone(ctx, 1100, 0.1, vol, "sine", 0.07);
      break;
    }
    case "post": {
      // 明るい達成音: 上昇する3音
      playTone(ctx, 523, 0.12, vol, "sine", 0);
      playTone(ctx, 659, 0.12, vol, "sine", 0.1);
      playTone(ctx, 784, 0.2, vol, "sine", 0.2);
      break;
    }
    case "coin": {
      // コイン獲得音: キラキラした金属音
      playTone(ctx, 1319, 0.06, vol, "square", 0);
      playTone(ctx, 1568, 0.06, vol, "square", 0.05);
      playTone(ctx, 2093, 0.15, vol * 0.7, "sine", 0.1);
      break;
    }
    case "favorite": {
      // ハート音: 可愛い短い上昇音
      playTone(ctx, 698, 0.1, vol * 0.8, "sine", 0);
      playTone(ctx, 880, 0.08, vol * 0.8, "sine", 0.08);
      playTone(ctx, 1047, 0.15, vol * 0.6, "triangle", 0.14);
      break;
    }
    case "receipt": {
      // レジ音: ピッという電子音
      playTone(ctx, 1000, 0.05, vol, "square", 0);
      playTone(ctx, 1500, 0.05, vol * 0.8, "square", 0.08);
      playTone(ctx, 1000, 0.05, vol, "square", 0.16);
      playTone(ctx, 2000, 0.12, vol * 0.6, "sine", 0.24);
      break;
    }
    case "error": {
      // 短いブザー音
      playTone(ctx, 200, 0.15, vol * 0.8, "sawtooth", 0);
      playTone(ctx, 180, 0.15, vol * 0.6, "sawtooth", 0.12);
      break;
    }
  }
}

export function useSound() {
  const lastPlayedRef = useRef<number>(0);

  const play = useCallback((type: SoundType) => {
    // 短時間の重複再生を防ぐ
    const now = Date.now();
    if (now - lastPlayedRef.current < 100) return;
    lastPlayedRef.current = now;
    playSound(type);
  }, []);

  return { play };
}
