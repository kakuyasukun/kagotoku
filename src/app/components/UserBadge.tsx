"use client";

import { useMemo, useState, useEffect } from "react";
import {
  getProfile,
  setNickname,
  getBadge,
  getSavingsContribution,
  redeemAdFree,
  isAdFreeActive,
  getAdFreeRemainingDays,
  getValidPoints,
  getValidPointEntries,
  getExpiringSoonEntries,
} from "../storage";
import type { PointEntry } from "../types";
import { useSound } from "../hooks/useSound";

export default function UserBadge({
  onRedeem,
}: {
  onRedeem?: () => void;
} = {}) {
  const [profile, setProfile] = useState(getProfile());
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.nickname);
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [adFreeActive, setAdFreeActive] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);
  const [validPoints, setValidPoints] = useState(0);
  const [validEntries, setValidEntries] = useState<PointEntry[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<PointEntry[]>([]);
  const { play } = useSound();

  const refresh = () => {
    setProfile(getProfile());
    setAdFreeActive(isAdFreeActive());
    setRemainingDays(getAdFreeRemainingDays());
    setValidPoints(getValidPoints());
    setValidEntries(getValidPointEntries());
    setExpiringSoon(getExpiringSoonEntries());
  };

  useEffect(() => {
    refresh();
  }, []);

  const badge = useMemo(() => getBadge(validPoints), [validPoints]);
  const contribution = useMemo(() => getSavingsContribution(), []);

  const handleSave = () => {
    setNickname(name.trim());
    refresh();
    setEditing(false);
  };

  const handleRedeem = () => {
    if (redeemAdFree()) {
      play("coin");
      refresh();
      setShowModal(false);
      onRedeem?.();
    }
  };

  const canRedeem = validPoints >= 1000;
  const pointsNeeded = Math.max(0, 1000 - validPoints);

  const expiringSoonTotal = expiringSoon.reduce(
    (sum, e) => sum + (e.amount - e.consumed),
    0
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const daysUntil = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  return (
    <>
      <div className="bg-card-bg rounded-2xl shadow-sm border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{badge.emoji}</span>
            <div>
              {editing ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ニックネーム"
                    className="border border-border rounded-lg px-2 py-1 text-sm w-28
                               focus:outline-none focus:ring-2 focus:ring-primary/40"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  />
                  <button
                    onClick={handleSave}
                    className="text-xs text-primary font-medium"
                  >
                    保存
                  </button>
                </div>
              ) : (
                <p
                  className="font-bold text-sm cursor-pointer hover:text-primary"
                  onClick={() => setEditing(true)}
                >
                  {profile.nickname || "ニックネームを設定"}
                </p>
              )}
              <p className="text-xs text-muted">{badge.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              {validPoints}<span className="text-xs font-normal">pt</span>
            </p>
            <p className="text-[10px] text-muted">{profile.postCount}回投稿</p>
          </div>
        </div>

        {/* 次のバッジまでのプログレス */}
        {(() => {
          const thresholds = [50, 200, 500, 1000];
          const next = thresholds.find((t) => validPoints < t);
          if (!next) return null;
          const prev = thresholds[thresholds.indexOf(next) - 1] ?? 0;
          const pct = Math.min(
            100,
            ((validPoints - prev) / (next - prev)) * 100
          );
          return (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-muted mb-1">
                <span>次のバッジまで</span>
                <span>{next - validPoints}pt</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })()}

        {/* 失効間近の警告 */}
        {expiringSoonTotal > 0 && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <p className="text-xs font-medium text-amber-700">
              {expiringSoonTotal}pt がもうすぐ失効します
            </p>
            <ul className="mt-1 space-y-0.5">
              {expiringSoon.map((e) => (
                <li key={e.id} className="text-[10px] text-amber-600">
                  {e.amount - e.consumed}pt — 残り{daysUntil(e.expiresAt)}日（{formatDate(e.expiresAt)}まで）
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 広告非表示ステータス */}
        {adFreeActive && remainingDays > 0 && (
          <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 text-center">
            <p className="text-xs font-medium text-indigo-600">
              広告非表示 残り{remainingDays}日
            </p>
          </div>
        )}

        {/* ポイント交換ボタン */}
        <div className="mt-3">
          {!adFreeActive ? (
            <button
              onClick={() => canRedeem && setShowModal(true)}
              disabled={!canRedeem}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all
                ${
                  canRedeem
                    ? "bg-primary text-white hover:bg-primary-hover active:scale-95 shadow-sm"
                    : "bg-border/60 text-muted cursor-not-allowed"
                }`}
            >
              {canRedeem
                ? "🎁 ポイントを使う"
                : `🎁 あと${pointsNeeded}ポイントで交換可能`}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2.5 rounded-xl text-sm font-medium bg-border/60 text-muted cursor-not-allowed"
            >
              🎁 広告非表示 適用中
            </button>
          )}
        </div>

        {/* ポイントの貯め方 */}
        <div className="mt-3 pt-3 border-t border-border">
          <button
            onClick={() => setShowHowTo(!showHowTo)}
            className="w-full flex items-center justify-between text-xs text-muted
                       hover:text-primary transition-colors"
          >
            <span>ポイントの貯め方</span>
            <span className={`transition-transform ${showHowTo ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>

          {showHowTo && (
            <ul className="mt-2 space-y-1.5">
              {[
                { icon: "📍", label: "価格を投稿する", pts: 10 },
                { icon: "📰", label: "チラシを投稿する", pts: 50 },
                { icon: "🧾", label: "レシートを登録する", pts: 20 },
                { icon: "💛", label: "お気に入り商品を登録する", pts: 5 },
                { icon: "🔥", label: "連続ログイン（毎日）", pts: 3 },
                { icon: "🎉", label: "初回登録ボーナス", pts: 100 },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between bg-background rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold text-primary">+{item.pts}pt</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ポイント履歴トグル */}
        {validEntries.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between text-xs text-muted
                         hover:text-primary transition-colors"
            >
              <span>ポイント履歴（{validEntries.length}件）</span>
              <span className={`transition-transform ${showHistory ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {showHistory && (
              <ul className="mt-2 space-y-1.5">
                {validEntries
                  .sort(
                    (a, b) =>
                      new Date(b.earnedAt).getTime() -
                      new Date(a.earnedAt).getTime()
                  )
                  .map((entry) => {
                    const remaining = entry.amount - entry.consumed;
                    const days = daysUntil(entry.expiresAt);
                    const isSoon = days <= 30;
                    return (
                      <li
                        key={entry.id}
                        className={`rounded-lg px-3 py-2 text-xs ${
                          isSoon
                            ? "bg-amber-50 border border-amber-200"
                            : "bg-background"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            +{entry.amount}pt
                            {entry.consumed > 0 && (
                              <span className="text-muted font-normal">
                                （残{remaining}pt）
                              </span>
                            )}
                          </span>
                          {isSoon && (
                            <span className="text-[10px] text-amber-600 font-bold">
                              もうすぐ失効
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted mt-0.5">
                          取得: {formatDate(entry.earnedAt)} / 期限: {formatDate(entry.expiresAt)}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        )}

        {/* 節約貢献額 */}
        {contribution > 0 && (
          <div className="mt-3 pt-3 border-t border-border text-center">
            <p className="text-[10px] text-muted">あなたの投稿による節約貢献額</p>
            <p className="text-base font-bold text-accent">
              ¥{contribution.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* 確認モーダル */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-card-bg rounded-2xl shadow-xl p-6 w-full max-w-sm animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-3xl mb-3">🎁</p>
            <h3 className="text-base font-bold text-center mb-2">
              ポイント交換
            </h3>
            <p className="text-sm text-center text-muted mb-5">
              1000ポイントを使って
              <br />
              広告を1ヶ月非表示にしますか？
            </p>
            <div className="bg-background rounded-xl p-3 mb-5 text-center">
              <p className="text-xs text-muted">交換後のポイント</p>
              <p className="text-lg font-bold text-primary">
                {validPoints}<span className="text-sm font-normal">pt</span>
                <span className="mx-2 text-muted">{"\u2192"}</span>
                {validPoints - 1000}<span className="text-sm font-normal">pt</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium
                           hover:bg-background transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleRedeem}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium
                           hover:bg-primary-hover active:scale-95 transition-all shadow-sm"
              >
                交換する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
