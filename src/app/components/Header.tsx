"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getProfile } from "../storage";
import LoginModal from "./LoginModal";
import Link from "next/link";

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const profile = getProfile();
    setNickname(profile.nickname || "");
  }, [user]);

  const displayName = nickname || "ゲスト";

  return (
    <>
      <header className="bg-primary text-white py-4 px-4 shadow-md">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">🛒 カゴトク</h1>
            <p className="text-sm opacity-90 mt-1">
              かしこく買い物、もっとおトク
            </p>
          </div>
          <div className="relative">
            {user ? (
              <Link
                href="/mypage"
                className="bg-white/20 backdrop-blur rounded-xl px-3 py-2 text-sm font-medium
                           hover:bg-white/30 transition-colors flex items-center gap-1.5"
              >
                <span className="text-xs">👤</span>
                {displayName}
              </Link>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="bg-white/20 backdrop-blur rounded-xl px-3 py-2 text-sm font-medium
                           hover:bg-white/30 transition-colors"
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
