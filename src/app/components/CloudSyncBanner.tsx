"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { migrateToSupabase, hasMigrated } from "../lib/supabaseSync";

export default function CloudSyncBanner() {
  const { user, loading } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (user && !hasMigrated()) {
      // 初回ログイン — データ移行
      setMigrating(true);
      migrateToSupabase(user.id).then(() => {
        setMigrating(false);
        setMigrated(true);
        setTimeout(() => setMigrated(false), 3000);
      });
    } else if (user) {
      setShowBanner(true);
    }
  }, [user, loading]);

  if (loading) return null;

  // 移行中
  if (migrating) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-center animate-fade-in">
        <p className="text-xs text-blue-600 font-medium flex items-center justify-center gap-2">
          <span className="inline-block w-3 h-3 border-2 border-blue-500 border-t-transparent
                           rounded-full animate-spin" />
          データをクラウドに移行中...
        </p>
      </div>
    );
  }

  // 移行完了
  if (migrated) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-center animate-fade-in">
        <p className="text-xs text-green-700 font-medium">
          ✅ データをクラウドに保存しました！
        </p>
      </div>
    );
  }

  // ログイン済み
  if (user && showBanner) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2.5 flex items-center justify-between">
        <p className="text-xs text-blue-600 font-medium">
          ☁️ データはクラウドに守られています
        </p>
        <button
          onClick={() => setShowBanner(false)}
          className="text-blue-400 text-xs hover:text-blue-600 ml-2"
        >
          ✕
        </button>
      </div>
    );
  }

  // 未ログイン
  if (!user) {
    return null;
  }

  return null;
}
