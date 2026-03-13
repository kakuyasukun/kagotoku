"use client";

import { useState, useEffect, useCallback } from "react";

export default function PushNotificationBanner() {
  const [isPWA, setIsPWA] = useState(false);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");

  useEffect(() => {
    // PWA判定: standalone モードかどうか
    const standalone =
      // iOS Safari
      ("standalone" in window.navigator &&
        (window.navigator as unknown as { standalone: boolean }).standalone) ||
      // Android Chrome / 汎用
      window.matchMedia("(display-mode: standalone)").matches;
    setIsPWA(standalone);

    if ("Notification" in window) {
      setPermission(Notification.permission);
    } else {
      setPermission("unsupported");
    }
  }, []);

  const handleRequest = useCallback(async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  // 通知非対応
  if (permission === "unsupported") return null;

  // 既に許可済み
  if (permission === "granted") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2.5 text-center">
        <p className="text-xs text-blue-600 font-medium">
          🔔 通知ON — 目標価格を下回ったらお知らせします
        </p>
      </div>
    );
  }

  // 拒否済み
  if (permission === "denied") return null;

  // PWAモード: 通知許可ボタンを表示
  if (isPWA) {
    return (
      <button
        onClick={handleRequest}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white
                   rounded-2xl py-3.5 font-bold text-sm shadow-md
                   hover:opacity-90 active:scale-[0.98] transition-all
                   flex items-center justify-center gap-2"
      >
        <span>🔔</span>
        通知を有効にして値下げをお知らせ
      </button>
    );
  }

  // ブラウザ直接アクセス: ホーム画面追加を促す
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200
                    rounded-2xl px-4 py-3 text-center">
      <p className="text-xs text-blue-700 font-medium mb-1">
        🔔 プッシュ通知を使うには
      </p>
      <p className="text-[11px] text-blue-600">
        ホーム画面に追加すると通知が使えます
      </p>
      <p className="text-[10px] text-blue-500 mt-1">
        共有ボタン → 「ホーム画面に追加」
      </p>
    </div>
  );
}
