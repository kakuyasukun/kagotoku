"use client";

import { useState, useMemo, useCallback, useEffect, use } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Toast from "../../components/Toast";
import { useSound } from "../../hooks/useSound";
import {
  getShoppingGroup,
  renameShoppingGroup,
  addShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  clearCompletedItems,
} from "../../storage";

export default function ShoppingGroupDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [refreshKey, setRefreshKey] = useState(0);
  const [input, setInput] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const { play } = useSound();

  const group = useMemo(() => {
    void refreshKey;
    return getShoppingGroup(id);
  }, [id, refreshKey]);

  const activeItems = group?.items.filter((i) => !i.completed) ?? [];
  const completedItems = group?.items.filter((i) => i.completed) ?? [];
  const allDone =
    group !== null && group.items.length > 0 && activeItems.length === 0;

  // 全商品チェック完了アニメーション
  useEffect(() => {
    if (allDone && !showComplete) {
      play("post");
      setShowComplete(true);
      const timer = setTimeout(() => setShowComplete(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [allDone]);

  const handleAdd = useCallback(() => {
    const name = input.trim();
    if (!name || !group) return;
    play("favorite");
    addShoppingItem(group.id, name);
    setInput("");
    setRefreshKey((k) => k + 1);
  }, [input, group, play]);

  const handleToggle = useCallback(
    (itemId: string, completed: boolean) => {
      if (!group) return;
      play(completed ? "search" : "coin");
      toggleShoppingItem(group.id, itemId);
      setRefreshKey((k) => k + 1);
    },
    [group, play]
  );

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      if (!group) return;
      deleteShoppingItem(group.id, itemId);
      setRefreshKey((k) => k + 1);
    },
    [group]
  );

  const handleClearCompleted = useCallback(() => {
    if (!group) return;
    const count = clearCompletedItems(group.id);
    play("error");
    setRefreshKey((k) => k + 1);
    setToastMsg(`${count}件のチェック済み商品を削除しました`);
    setShowToast(true);
  }, [group, play]);

  const handleRename = useCallback(() => {
    const name = nameInput.trim();
    if (!name || !group) return;
    renameShoppingGroup(group.id, name);
    setEditingName(false);
    setRefreshKey((k) => k + 1);
  }, [nameInput, group]);

  if (!group) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="max-w-lg mx-auto px-4 mt-6 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm text-muted mb-4">リストが見つかりません</p>
          <Link
            href="/shopping-list"
            className="text-primary text-sm font-medium hover:underline"
          >
            ← リスト一覧に戻る
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <Toast
        message={toastMsg}
        show={showToast}
        type="success"
        onClose={() => setShowToast(false)}
      />

      {/* 買い物完了アニメーション */}
      {showComplete && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl px-10 py-8
                          text-center animate-slide-up">
            <p className="text-5xl mb-3">🎉</p>
            <p className="text-lg font-bold text-accent">買い物完了！</p>
            <p className="text-xs text-muted mt-1">全商品をチェックしました</p>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-5">
        {/* 戻るリンク + グループ名 */}
        <div>
          <Link
            href="/shopping-list"
            className="text-xs text-muted hover:text-primary transition-colors"
          >
            ← リスト一覧
          </Link>

          <div className="mt-2">
            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRename()}
                  className="flex-1 border border-border rounded-xl px-4 py-2 text-base font-bold
                             focus:outline-none focus:ring-2 focus:ring-primary/40"
                  autoFocus
                />
                <button
                  onClick={handleRename}
                  className="text-sm text-primary font-medium px-3"
                >
                  保存
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="text-muted text-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <h1
                onClick={() => {
                  setNameInput(group.name);
                  setEditingName(true);
                }}
                className="font-bold text-lg cursor-pointer hover:text-primary transition-colors"
              >
                {group.name}
              </h1>
            )}
            <p className="text-xs text-muted mt-0.5">
              {new Date(group.createdAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              作成 · {group.items.length}商品
            </p>
          </div>
        </div>

        {/* 商品追加フォーム */}
        <div className="bg-card-bg rounded-2xl shadow-md p-4 border border-border/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="商品名を入力して追加..."
              className="flex-1 border border-border rounded-xl px-4 py-3 text-sm bg-background
                         focus:outline-none focus:ring-2 focus:ring-primary/40
                         placeholder:text-muted/50"
            />
            <button
              onClick={handleAdd}
              disabled={!input.trim()}
              className="bg-primary text-white px-5 py-3 rounded-xl font-medium
                         hover:bg-primary-hover active:scale-95 transition-all shadow-sm
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              追加
            </button>
          </div>
        </div>

        {/* 進捗バー */}
        {group.items.length > 0 && (
          <div className="bg-card-bg rounded-2xl shadow-sm border border-border/50 p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-muted">進捗</p>
              <p className="text-xs font-bold text-primary">
                {completedItems.length}/{group.items.length}
              </p>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  allDone ? "bg-accent" : "bg-primary"
                }`}
                style={{
                  width: `${(completedItems.length / group.items.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* 未購入 */}
        {activeItems.length > 0 && (
          <section className="bg-card-bg rounded-2xl shadow-sm border border-border/50 p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5">
              🛒 未購入
              <span className="text-xs font-normal text-muted">
                ({activeItems.length}件)
              </span>
            </h3>
            <ul className="space-y-2">
              {activeItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 bg-background rounded-xl p-3"
                >
                  <button
                    onClick={() => handleToggle(item.id, item.completed)}
                    className="w-6 h-6 rounded-full border-2 border-border shrink-0
                               flex items-center justify-center
                               hover:border-primary transition-colors"
                  />
                  <p className="flex-1 min-w-0 text-sm font-medium truncate">
                    {item.productName}
                  </p>
                  <a
                    href={`/?q=${encodeURIComponent(item.productName)}`}
                    className="text-[10px] text-primary font-medium border border-primary/30
                               rounded-lg px-2 py-1 hover:bg-primary/5 transition-colors shrink-0"
                  >
                    最安値
                  </a>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-muted hover:text-red-500 transition-colors shrink-0 text-sm"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 購入済み */}
        {completedItems.length > 0 && (
          <section className="bg-card-bg rounded-2xl shadow-sm border border-border/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-muted flex items-center gap-1.5">
                ✅ 購入済み
                <span className="text-xs font-normal">
                  ({completedItems.length}件)
                </span>
              </h3>
              <button
                onClick={handleClearCompleted}
                className="text-[10px] text-red-500 font-medium hover:underline"
              >
                全部削除
              </button>
            </div>
            <ul className="space-y-2">
              {completedItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 bg-background/60 rounded-xl p-3"
                >
                  <button
                    onClick={() => handleToggle(item.id, item.completed)}
                    className="w-6 h-6 rounded-full border-2 bg-accent border-accent text-white
                               shrink-0 flex items-center justify-center transition-colors"
                  >
                    <span className="text-xs">✓</span>
                  </button>
                  <p className="flex-1 min-w-0 text-sm text-muted line-through truncate">
                    {item.productName}
                  </p>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-muted hover:text-red-500 transition-colors shrink-0 text-sm"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 空状態 */}
        {group.items.length === 0 && (
          <div className="bg-card-bg rounded-2xl shadow-sm border border-border/50 p-8 text-center">
            <p className="text-3xl mb-2">🛒</p>
            <p className="text-sm text-muted">
              商品名を入力して追加しよう
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
