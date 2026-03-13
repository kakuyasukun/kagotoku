"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Toast from "../components/Toast";
import { useSound } from "../hooks/useSound";
import {
  getShoppingGroups,
  createShoppingGroup,
  deleteShoppingGroup,
} from "../storage";

export default function ShoppingListPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showNew, setShowNew] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const { play } = useSound();

  const groups = useMemo(() => {
    void refreshKey;
    return getShoppingGroups();
  }, [refreshKey]);

  const handleCreate = useCallback(() => {
    const name = groupName.trim();
    if (!name) return;
    play("favorite");
    createShoppingGroup(name);
    setGroupName("");
    setShowNew(false);
    setRefreshKey((k) => k + 1);
    setToastMsg(`「${name}」を作成しました`);
    setShowToast(true);
  }, [groupName, play]);

  const handleDelete = useCallback(
    (id: string, name: string) => {
      play("error");
      deleteShoppingGroup(id);
      setRefreshKey((k) => k + 1);
      setToastMsg(`「${name}」を削除しました`);
      setShowToast(true);
    },
    [play]
  );

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <Toast
        message={toastMsg}
        show={showToast}
        type="success"
        onClose={() => setShowToast(false)}
      />

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-5">
        {/* ヘッダー + 作成ボタン */}
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-lg">📝 買い物リスト</h1>
          <button
            onClick={() => setShowNew(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium
                       hover:bg-primary-hover active:scale-95 transition-all shadow-sm"
          >
            + 新しいリスト
          </button>
        </div>

        {/* 新規作成フォーム */}
        {showNew && (
          <div className="bg-card-bg rounded-2xl shadow-md p-4 border border-border/50 animate-fade-in">
            <p className="text-sm font-medium mb-2">リスト名</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="例：3/14 イオン、週末まとめ買い"
                className="flex-1 border border-border rounded-xl px-4 py-3 text-sm bg-background
                           focus:outline-none focus:ring-2 focus:ring-primary/40
                           placeholder:text-muted/50"
                autoFocus
              />
              <button
                onClick={handleCreate}
                disabled={!groupName.trim()}
                className="bg-primary text-white px-4 py-3 rounded-xl text-sm font-medium
                           hover:bg-primary-hover active:scale-95 transition-all
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                作成
              </button>
              <button
                onClick={() => { setShowNew(false); setGroupName(""); }}
                className="text-muted text-sm px-2 hover:text-foreground"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* グループ一覧 */}
        {groups.length === 0 ? (
          <div className="bg-card-bg rounded-2xl shadow-sm border border-border/50 p-8 text-center">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-sm text-muted">
              まだリストがありません
              <br />
              「+ 新しいリスト」で買い物リストを作ろう
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => {
              const total = group.items.length;
              const checked = group.items.filter((i) => i.completed).length;
              const allDone = total > 0 && checked === total;
              return (
                <div
                  key={group.id}
                  className={`bg-card-bg rounded-2xl shadow-sm border p-4 flex items-center gap-3
                    ${allDone ? "border-accent/40 bg-green-50/50" : "border-border/50"}`}
                >
                  <Link
                    href={`/shopping-list/${group.id}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm truncate">
                        {group.name}
                      </p>
                      {allDone && (
                        <span className="text-[10px] bg-accent text-white px-1.5 py-0.5 rounded-full font-bold">
                          完了
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span>
                        {new Date(group.createdAt).toLocaleDateString("ja-JP", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {total > 0 ? (
                        <>
                          <span>
                            {checked}/{total} チェック済み
                          </span>
                          <div className="flex-1 max-w-[80px] h-1.5 bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all"
                              style={{ width: `${(checked / total) * 100}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <span>商品なし</span>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(group.id, group.name);
                    }}
                    className="text-muted hover:text-red-500 transition-colors shrink-0 p-2"
                    title="削除"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
