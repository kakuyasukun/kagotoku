"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Header from "../components/Header";
import Toast from "../components/Toast";
import UserBadge from "../components/UserBadge";
import PushNotificationBanner from "../components/PushNotificationBanner";
import {
  getFavorites,
  removeFavorite,
  setTargetPrice,
  searchPosts,
  getFavoriteAlerts,
} from "../storage";
import type { Favorite } from "../types";

export default function FavoritesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [targetInput, setTargetInput] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const favorites = useMemo(() => {
    void refreshKey;
    return getFavorites();
  }, [refreshKey]);

  const alerts = useMemo(() => {
    void refreshKey;
    return getFavoriteAlerts();
  }, [refreshKey]);

  // アラート発生時にトースト通知
  useEffect(() => {
    if (alerts.length > 0) {
      const a = alerts[0];
      setToastMsg(`🔔 ${a.favorite.productName} が ¥${a.post.price.toLocaleString()} で見つかりました！`);
      setShowToast(true);
    }
  }, [alerts.length]);

  const alertMap = useMemo(() => {
    const map = new Map<string, { price: number; storeName: string }>();
    for (const a of alerts) {
      map.set(a.favorite.id, {
        price: a.post.price,
        storeName: a.post.storeName,
      });
    }
    return map;
  }, [alerts]);

  const handleRemove = useCallback(
    (id: string) => {
      removeFavorite(id);
      setRefreshKey((k) => k + 1);
    },
    []
  );

  const handleSetTarget = useCallback(
    (id: string) => {
      const val = Number(targetInput);
      setTargetPrice(id, val > 0 ? val : null);
      setEditingId(null);
      setTargetInput("");
      setRefreshKey((k) => k + 1);
    },
    [targetInput]
  );

  const getLatestPrice = (productName: string) => {
    const posts = searchPosts(productName);
    if (posts.length === 0) return null;
    const min = Math.min(...posts.map((p) => p.price));
    const max = Math.max(...posts.map((p) => p.price));
    return { min, max, count: posts.length };
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <Toast message={toastMsg} show={showToast} type="success" onClose={() => setShowToast(false)} />
      <main className="max-w-lg mx-auto px-4 mt-6 space-y-5">
        {/* プッシュ通知バナー */}
        <PushNotificationBanner />

        {/* アラート通知 */}
        {alerts.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-accent/30
                          rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-sm text-accent mb-2">
              🔔 目標価格を下回りました！
            </h2>
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li
                  key={alert.favorite.id}
                  className="bg-white rounded-xl p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {alert.favorite.productName}
                    </p>
                    <p className="text-xs text-muted">
                      {alert.post.storeName} で
                      <span className="text-accent font-bold">
                        {" "}¥{alert.post.price.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">目標</p>
                    <p className="text-sm font-bold line-through text-muted">
                      ¥{alert.favorite.targetPrice?.toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* バッジカード（ポイント特典） */}
        <UserBadge onRedeem={() => setRefreshKey((k) => k + 1)} />

        {/* お気に入りリスト */}
        <section className="bg-card-bg rounded-2xl shadow-sm border border-border/50 p-4">
          <h2 className="font-bold text-base mb-3">💛 お気に入り商品</h2>

          {favorites.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">💛</p>
              <p className="text-sm text-muted">
                まだお気に入りがありません
                <br />
                商品を検索して「お気に入り」ボタンを押してね
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {favorites.map((fav) => {
                const priceInfo = getLatestPrice(fav.productName);
                const alert = alertMap.get(fav.id);

                return (
                  <li
                    key={fav.id}
                    className={`bg-background rounded-xl p-4 transition-colors
                      ${alert ? "ring-2 ring-accent/40" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm truncate">
                            {fav.productName}
                          </p>
                          {alert && (
                            <span className="bg-accent text-white text-[10px] font-bold
                                             px-1.5 py-0.5 rounded-full animate-alert-pulse">
                              安い！
                            </span>
                          )}
                        </div>
                        {priceInfo && (
                          <p className="text-xs text-muted mt-0.5">
                            ¥{priceInfo.min.toLocaleString()} 〜 ¥
                            {priceInfo.max.toLocaleString()} ·{" "}
                            {priceInfo.count}件
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(fav.id)}
                        className="text-muted text-sm hover:text-red-500 ml-2"
                      >
                        ✕
                      </button>
                    </div>

                    {/* 目標価格 */}
                    <div className="flex items-center gap-2">
                      {editingId === fav.id ? (
                        <div className="flex gap-1.5 flex-1">
                          <input
                            type="number"
                            value={targetInput}
                            onChange={(e) => setTargetInput(e.target.value)}
                            placeholder="目標価格"
                            className="flex-1 border border-border rounded-lg px-2.5 py-1.5 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-primary/40"
                            autoFocus
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSetTarget(fav.id)
                            }
                          />
                          <button
                            onClick={() => handleSetTarget(fav.id)}
                            className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                          >
                            設定
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setTargetInput("");
                            }}
                            className="text-muted text-xs px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(fav.id);
                            setTargetInput(
                              fav.targetPrice ? String(fav.targetPrice) : ""
                            );
                          }}
                          className="flex items-center gap-1.5 text-xs border border-border
                                     rounded-lg px-3 py-1.5 hover:border-primary hover:text-primary
                                     transition-colors"
                        >
                          <span>🎯</span>
                          {fav.targetPrice
                            ? `目標: ¥${fav.targetPrice.toLocaleString()}`
                            : "目標価格を設定"}
                        </button>
                      )}
                    </div>

                    {/* アラート発動中の詳細 */}
                    {alert && (
                      <div className="mt-2 bg-accent/10 rounded-lg p-2 text-center">
                        <p className="text-xs text-accent font-medium">
                          🎉 {alert.storeName}で ¥{alert.price.toLocaleString()}{" "}
                          で見つかりました！
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
