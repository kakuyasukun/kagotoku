"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import LoginModal from "./LoginModal";

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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
            {loading ? null : user ? (
              <div>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="bg-white/20 backdrop-blur rounded-xl px-3 py-2 text-sm font-medium
                             hover:bg-white/30 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-xs">👤</span>
                  {user.user_metadata?.name?.split(" ")[0] ||
                    user.email?.split("@")[0] ||
                    "ユーザー"}
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-card-bg rounded-xl shadow-lg
                                  border border-border overflow-hidden z-50 min-w-[140px]">
                    <p className="px-3 py-2 text-xs text-muted truncate border-b border-border">
                      {user.email}
                    </p>
                    <button
                      onClick={() => {
                        signOut();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-foreground
                                 hover:bg-primary/5 transition-colors"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
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
