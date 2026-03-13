"use client";

import { useState, useEffect } from "react";
import { isSoundEnabled, setSoundEnabled } from "../hooks/useSound";

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isSoundEnabled());
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
  };

  return (
    <button
      onClick={toggle}
      className="bg-white/20 backdrop-blur rounded-xl w-8 h-8 flex items-center justify-center
                 hover:bg-white/30 active:scale-90 transition-all"
      title={enabled ? "効果音をオフにする" : "効果音をオンにする"}
    >
      <span className="text-sm">{enabled ? "🔊" : "🔇"}</span>
    </button>
  );
}
