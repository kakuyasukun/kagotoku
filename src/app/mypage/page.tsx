"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getProfile,
  setNickname,
  setAvatar,
  getBadge,
  getSavingsContribution,
  getValidPoints,
} from "../storage";
import { supabase } from "../lib/supabase";

const AVATAR_OPTIONS = [
  "😊", "😎", "🥳", "🤗", "😺", "🐶", "🐱", "🐼",
  "🦊", "🐸", "🌸", "🌻", "🍀", "⭐", "🔥", "💎",
  "🎵", "🎨", "🏆", "👑", "🛒", "🍎", "🧁", "☕",
];

export default function MyPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(getProfile());
  const [nickInput, setNickInput] = useState(profile.nickname);
  const [emailInput, setEmailInput] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (user?.email) setEmailInput(user.email);
  }, [user]);

  const validPoints = useMemo(() => getValidPoints(), [profile]);
  const badge = useMemo(() => getBadge(validPoints), [validPoints]);
  const contribution = useMemo(() => getSavingsContribution(), []);

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSaveNickname = () => {
    const trimmed = nickInput.trim();
    setNickname(trimmed);
    setProfile(getProfile());
    showMessage("ニックネームを更新しました");
  };

  const handleSelectAvatar = (emoji: string) => {
    setAvatar(emoji);
    setProfile(getProfile());
    setShowAvatarPicker(false);
    showMessage("アイコンを変更しました");
  };

  const handleUpdateEmail = async () => {
    if (!emailInput.trim()) return;
    const { error } = await supabase.auth.updateUser({ email: emailInput.trim() });
    if (error) {
      showMessage(error.message, "error");
    } else {
      showMessage("確認メールを送信しました。メールを確認してください");
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      showMessage("パスワードは6文字以上で入力してください", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage("パスワードが一致しません", "error");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      showMessage(error.message, "error");
    } else {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage("パスワードを更新しました");
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "削除") return;
    // サインアウトしてアカウント削除リクエスト（サーバー側の処理が必要）
    await signOut();
    showMessage("アカウント削除をリクエストしました");
    router.push("/");
  };

  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen pb-24">
      {/* ヘッダー */}
      <div className="hero-gradient text-white px-4 pt-8 pb-10 shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="text-white/80 hover:text-white transition-colors">
              ← 戻る
            </Link>
          </div>
          <div className="flex flex-col items-center">
            {/* アバター */}
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center
                         justify-center text-4xl hover:bg-white/30 transition-colors mb-3
                         ring-2 ring-white/40"
            >
              {profile.avatar}
            </button>
            <p className="font-bold text-lg">{profile.nickname || "ゲスト"}</p>
            <p className="text-sm opacity-80 flex items-center gap-1">
              {badge.emoji} {badge.label}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* メッセージ */}
        {message && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium animate-fade-in ${
            messageType === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message}
          </div>
        )}

        {/* アバターピッカー */}
        {showAvatarPicker && (
          <div className="bg-card-bg rounded-2xl shadow-sm border border-border p-4 animate-slide-up">
            <h3 className="font-bold text-sm mb-3">アイコンを選択</h3>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSelectAvatar(emoji)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
                             hover:bg-primary/10 transition-colors ${
                               profile.avatar === emoji
                                 ? "bg-primary/15 ring-2 ring-primary"
                                 : "bg-background"
                             }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 統計カード */}
        <div className="bg-card-bg rounded-2xl shadow-sm border border-border p-4">
          <h3 className="font-bold text-sm mb-3">あなたの実績</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted mb-1">累計節約貢献額</p>
              <p className="text-lg font-bold text-accent">
                ¥{contribution.toLocaleString()}
              </p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted mb-1">投稿数</p>
              <p className="text-lg font-bold text-primary">
                {profile.postCount}<span className="text-xs font-normal">回</span>
              </p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted mb-1">ポイント</p>
              <p className="text-lg font-bold text-primary">
                {validPoints}<span className="text-xs font-normal">pt</span>
              </p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted mb-1">バッジ</p>
              <p className="text-lg font-bold">
                {badge.emoji} <span className="text-xs font-normal">{badge.label}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ニックネーム変更 */}
        <div className="bg-card-bg rounded-2xl shadow-sm border border-border p-4">
          <h3 className="font-bold text-sm mb-3">ニックネーム</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={nickInput}
              onChange={(e) => setNickInput(e.target.value)}
              placeholder="ニックネームを入力"
              className="flex-1 border border-border rounded-xl px-3 py-2.5 text-sm bg-background
                         focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={handleSaveNickname}
              className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium
                         hover:bg-primary-hover active:scale-95 transition-all"
            >
              保存
            </button>
          </div>
        </div>

        {/* メールアドレス変更 */}
        <div className="bg-card-bg rounded-2xl shadow-sm border border-border p-4">
          <h3 className="font-bold text-sm mb-3">メールアドレス</h3>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="メールアドレス"
              className="flex-1 border border-border rounded-xl px-3 py-2.5 text-sm bg-background
                         focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={handleUpdateEmail}
              disabled={emailInput === user.email}
              className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium
                         hover:bg-primary-hover active:scale-95 transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              変更
            </button>
          </div>
        </div>

        {/* パスワード変更 */}
        <div className="bg-card-bg rounded-2xl shadow-sm border border-border p-4">
          <h3 className="font-bold text-sm mb-3">パスワード変更</h3>
          <div className="space-y-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="新しいパスワード（6文字以上）"
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background
                         focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="新しいパスワード（確認）"
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background
                         focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={handleUpdatePassword}
              disabled={!newPassword || !confirmPassword}
              className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-medium
                         hover:bg-primary-hover active:scale-95 transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              パスワードを更新
            </button>
          </div>
        </div>

        {/* ログアウト */}
        <button
          onClick={handleLogout}
          className="w-full bg-card-bg border border-border rounded-2xl py-3 text-sm font-medium
                     text-foreground hover:bg-background transition-colors shadow-sm"
        >
          ログアウト
        </button>

        {/* アカウント削除 */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full text-sm text-red-400 hover:text-red-500 py-3 transition-colors"
        >
          アカウントを削除する
        </button>
      </main>

      {/* 削除確認モーダル */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-card-bg rounded-2xl shadow-xl p-6 w-full max-w-sm animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-3xl mb-3">⚠️</p>
            <h3 className="text-base font-bold text-center mb-2">
              アカウント削除
            </h3>
            <p className="text-sm text-center text-muted mb-4">
              この操作は取り消せません。すべてのデータが削除されます。
            </p>
            <p className="text-xs text-center text-muted mb-3">
              確認のため「削除」と入力してください
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="削除"
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background
                         focus:outline-none focus:ring-2 focus:ring-red-300 mb-4 text-center"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium
                           hover:bg-background transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "削除"}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium
                           hover:bg-red-600 active:scale-95 transition-all
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
