"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  onClose: () => void;
}

export default function LoginModal({ onClose }: Props) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleEmail = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    const err =
      mode === "login"
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else if (mode === "signup") {
      setSent(true);
    } else {
      onClose();
    }
  };

  if (sent) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div
          className="relative bg-card-bg rounded-2xl shadow-xl p-6 w-full max-w-sm animate-slide-up text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-3xl mb-3">📧</p>
          <h3 className="text-base font-bold mb-2">確認メールを送信しました</h3>
          <p className="text-sm text-muted mb-4">
            {email} に届いたリンクをクリックして登録を完了してください
          </p>
          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-2.5 rounded-xl font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-card-bg rounded-2xl shadow-xl p-6 w-full max-w-sm animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted text-lg hover:text-foreground"
        >
          ✕
        </button>

        <p className="text-3xl text-center mb-2">🔐</p>
        <h3 className="text-base font-bold text-center mb-1">
          {mode === "login" ? "ログイン" : "アカウント作成"}
        </h3>
        <p className="text-xs text-muted text-center mb-5">
          ログインするとデータがクラウドに保存されます
        </p>

        {/* Googleログイン */}
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-2 border border-border
                     rounded-xl py-3 text-sm font-medium hover:bg-primary/5
                     transition-colors mb-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Googleでログイン
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted">または</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* メール */}
        <div className="space-y-2.5 mb-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="w-full border border-border rounded-xl px-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEmail()}
            placeholder="パスワード（6文字以上）"
            className="w-full border border-border rounded-xl px-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 mb-3">{error}</p>
        )}

        <button
          onClick={handleEmail}
          disabled={loading || !email || !password}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium
                     hover:bg-primary-hover active:scale-95 transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed mb-3"
        >
          {loading
            ? "処理中..."
            : mode === "login"
              ? "ログイン"
              : "アカウント作成"}
        </button>

        <p className="text-xs text-center text-muted">
          {mode === "login" ? (
            <>
              アカウントがない方は
              <button
                onClick={() => { setMode("signup"); setError(""); }}
                className="text-primary font-medium ml-1"
              >
                新規登録
              </button>
            </>
          ) : (
            <>
              アカウントをお持ちの方は
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className="text-primary font-medium ml-1"
              >
                ログイン
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
