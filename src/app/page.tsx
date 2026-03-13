"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type { PricePost, AmazonProduct } from "./types";
import {
  searchPosts,
  addPost,
  getRecentPosts,
  getTodaySavings,
  getMonthSavings,
  getProfile,
  getBadge,
  isOnboarded,
  isFavorited,
  addFavorite,
  isAdFreeActive,
  getValidPoints,
} from "./storage";
import { searchAmazon } from "./mockAmazon";
import PointsAnimation from "./components/PointsAnimation";
import Onboarding from "./components/Onboarding";
import Toast from "./components/Toast";
import UserBadge from "./components/UserBadge";
import PushNotificationBanner from "./components/PushNotificationBanner";

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<PricePost[]>([]);
  const [amazonResults, setAmazonResults] = useState<AmazonProduct[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);
  const [showPointsAnim, setShowPointsAnim] = useState(false);
  const [userLat, setUserLat] = useState<number | undefined>();
  const [userLng, setUserLng] = useState<number | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [recognizing, setRecognizing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [adFree, setAdFree] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAdFree(isAdFreeActive());
  }, [refreshKey]);

  // オンボーディングチェック
  useEffect(() => {
    if (!isOnboarded()) setShowOnboarding(true);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
        },
        () => {}
      );
    }
  }, []);

  const profile = useMemo(() => {
    void refreshKey;
    return getProfile();
  }, [refreshKey]);
  const heroPoints = useMemo(() => {
    void refreshKey;
    return getValidPoints();
  }, [refreshKey]);
  const badge = useMemo(() => getBadge(heroPoints), [heroPoints]);
  const todaySavings = useMemo(() => {
    void refreshKey;
    return getTodaySavings();
  }, [refreshKey]);
  const monthSavings = useMemo(() => {
    void refreshKey;
    return getMonthSavings();
  }, [refreshKey]);
  const recentPosts = useMemo(() => {
    void refreshKey;
    return getRecentPosts(8);
  }, [refreshKey]);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    setPosts(searchPosts(query.trim()));
    setAmazonResults(searchAmazon(query.trim()));
    setHasSearched(true);
  }, [query]);

  const handlePost = useCallback(() => {
    if (!query.trim() || !storeName.trim() || !price) return;
    addPost({
      productName: query.trim(),
      storeName: storeName.trim(),
      price: Number(price),
      location: location.trim(),
      lat: userLat,
      lng: userLng,
    });
    setPosts(searchPosts(query.trim()));
    setStoreName("");
    setPrice("");
    setLocation("");
    setShowPointsAnim(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setShowPointsAnim(false), 2500);
  }, [query, storeName, price, location, userLat, userLng]);

  const handleFavorite = useCallback((productName: string) => {
    addFavorite(productName);
    setRefreshKey((k) => k + 1);
  }, []);

  /** 認識結果から検索を実行し、結果にスクロールする */
  const executeSearchAndScroll = useCallback(
    (productName: string, recognizedPrice?: number) => {
      setQuery(productName);
      setPosts(searchPosts(productName));
      setAmazonResults(searchAmazon(productName));
      setHasSearched(true);
      if (recognizedPrice) setPrice(String(recognizedPrice));
      // 次のレンダリング後にスクロール
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    },
    []
  );

  /** レシートの商品一覧から最大の節約効果がある商品を選ぶ */
  const pickBestSavingsItem = useCallback(
    (items: { name: string; price: number }[]): { name: string; price: number } | null => {
      if (items.length === 0) return null;
      if (items.length === 1) return items[0];

      let bestItem = items[0];
      let bestSavings = 0;

      for (const item of items) {
        const existingPosts = searchPosts(item.name);
        const amazonItems = searchAmazon(item.name);
        const allPricesForItem = [
          ...existingPosts.map((p) => p.price),
          ...amazonItems.map((a) => a.price),
          item.price,
        ];
        if (allPricesForItem.length >= 2) {
          const itemSavings = Math.max(...allPricesForItem) - Math.min(...allPricesForItem);
          if (itemSavings > bestSavings) {
            bestSavings = itemSavings;
            bestItem = item;
          }
        }
      }
      return bestItem;
    },
    []
  );

  const handleCameraCapture = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setRecognizing(true);
      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const res = await fetch("/api/recognize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();

        if (!res.ok) {
          setToastMsg(data.error || "認識に失敗しました");
          setShowToast(true);
          return;
        }

        if (data.type === "receipt" && data.items?.length > 0) {
          // レシート: 最大節約効果の商品を選択
          const best = pickBestSavingsItem(data.items);
          if (best) {
            const storeLabel = data.storeName ? `（${data.storeName}）` : "";
            setToastMsg(
              data.items.length > 1
                ? `📸 レシートから${data.items.length}商品を認識${storeLabel} → 「${best.name}」を比較中`
                : `📸 「${best.name}」¥${best.price.toLocaleString()} を認識しました${storeLabel}`
            );
            setShowToast(true);
            executeSearchAndScroll(best.name, best.price);
          } else {
            setToastMsg("レシートの商品を読み取れませんでした");
            setShowToast(true);
          }
        } else if (data.productName) {
          // 商品写真
          const priceLabel = data.price ? ` ¥${Number(data.price).toLocaleString()}` : "";
          setToastMsg(`📸 「${data.productName}」${priceLabel} を認識しました`);
          setShowToast(true);
          executeSearchAndScroll(data.productName, data.price ?? undefined);
        } else {
          setToastMsg("商品を認識できませんでした。もう一度お試しください");
          setShowToast(true);
        }
      } catch {
        setToastMsg("認識に失敗しました。もう一度お試しください");
        setShowToast(true);
      } finally {
        setRecognizing(false);
        if (cameraRef.current) cameraRef.current.value = "";
      }
    },
    [executeSearchAndScroll, pickBestSavingsItem]
  );

  const allPrices = [
    ...posts.map((p) => p.price),
    ...amazonResults.map((a) => a.price),
  ];
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;
  const savings = maxPrice - minPrice;

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "たった今";
    if (mins < 60) return `${mins}分前`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}時間前`;
    return `${Math.floor(hrs / 24)}日前`;
  };

  if (showOnboarding) {
    return <Onboarding onComplete={() => { setShowOnboarding(false); setRefreshKey((k) => k + 1); }} />;
  }

  return (
    <div className="min-h-screen pb-20">
      <PointsAnimation points={10} show={showPointsAnim} />
      <Toast message={toastMsg} show={showToast} type="success" onClose={() => setShowToast(false)} />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraCapture}
      />

      {/* ===== ヒーローセクション ===== */}
      <div className="hero-gradient text-white px-4 pt-8 pb-10 shadow-lg">
        <div className="max-w-lg mx-auto">
          {/* ユーザー情報 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{badge.emoji}</span>
              <div>
                <p className="font-bold text-sm">
                  {profile.nickname || "カゴトクユーザー"}
                </p>
                <p className="text-xs opacity-80">{badge.label}</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl px-3 py-1.5">
              <p className="text-sm font-bold">
                {heroPoints}<span className="text-xs font-normal ml-0.5">pt</span>
              </p>
            </div>
          </div>

          {/* キャッチコピー */}
          <h1 className="text-2xl font-bold mb-1">今日いくら節約できる？</h1>
          <p className="text-sm opacity-85 mb-6">
            みんなの投稿で、いちばんおトクを見つけよう
          </p>

          {/* 節約カード */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center">
              <p className="text-xs opacity-80 mb-1">今日の節約額</p>
              <p className="text-2xl font-bold">
                ¥{todaySavings.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center">
              <p className="text-xs opacity-80 mb-1">今月の累計節約</p>
              <p className="text-2xl font-bold">
                ¥{monthSavings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 -mt-4 space-y-5">
        {/* ===== 検索フォーム ===== */}
        <div className="bg-card-bg rounded-2xl shadow-md p-4 border border-border/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="商品名で価格をさがす..."
              className="flex-1 border border-border rounded-xl px-4 py-3 text-base bg-background
                         focus:outline-none focus:ring-2 focus:ring-primary/40
                         placeholder:text-muted/50"
            />
            <button
              onClick={() => cameraRef.current?.click()}
              disabled={recognizing}
              className="border border-border bg-background px-3 py-3 rounded-xl
                         hover:border-primary hover:text-primary transition-colors
                         disabled:opacity-40"
              title="写真で商品を認識"
            >
              {recognizing ? (
                <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent
                                 rounded-full animate-spin" />
              ) : (
                <span className="text-lg">📷</span>
              )}
            </button>
            <button
              onClick={handleSearch}
              className="bg-primary text-white px-5 py-3 rounded-xl font-medium
                         hover:bg-primary-hover active:scale-95 transition-all shadow-sm"
            >
              さがす
            </button>
          </div>
        </div>

        {hasSearched ? (
          <div ref={resultsRef} className="space-y-5">
            {/* 節約額 */}
            {allPrices.length >= 2 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-accent/30
                              rounded-2xl p-5 text-center shadow-sm">
                <p className="text-sm text-accent font-medium mb-1">
                  最大おトク額
                </p>
                <p className="text-4xl font-bold text-accent">
                  ¥{savings.toLocaleString()}
                </p>
                <p className="text-xs text-muted mt-2">
                  最安 ¥{minPrice.toLocaleString()} 〜 最高 ¥{maxPrice.toLocaleString()}
                </p>
              </div>
            )}

            {/* みんなの投稿 */}
            <section className="bg-card-bg rounded-2xl shadow-sm border border-border/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-base">📍 みんなの投稿価格</h2>
                <div className="flex items-center gap-2">
                  {!isFavorited(query) && (
                    <button
                      onClick={() => handleFavorite(query.trim())}
                      className="text-xs text-muted border border-border rounded-lg px-2.5 py-1
                                 hover:border-primary hover:text-primary transition-colors"
                    >
                      💛 お気に入り
                    </button>
                  )}
                  <button
                    onClick={() => setShowPostForm(!showPostForm)}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    {showPostForm ? "とじる" : "+ 投稿"}
                  </button>
                </div>
              </div>

              {isFavorited(query) && (
                <p className="text-xs text-primary mb-2">💛 お気に入り登録済み</p>
              )}

              {showPostForm && (
                <div className="bg-background rounded-xl p-4 mb-4 space-y-3">
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="お店の名前（例：イオン○○店）"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="価格（例：198）"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="場所（例：横浜市青葉区）"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    onClick={handlePost}
                    disabled={!storeName.trim() || !price}
                    className="w-full bg-primary text-white py-2.5 rounded-xl font-medium
                               hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed
                               active:scale-95 transition-all"
                  >
                    この価格を投稿する
                  </button>
                </div>
              )}

              {posts.length === 0 ? (
                <p className="text-sm text-muted py-4 text-center">
                  まだ投稿がありません。最初の投稿をしてみよう！
                </p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {posts.map((post) => (
                    <li key={post.id} className="py-3 flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{post.storeName}</p>
                        <p className="text-xs text-muted">
                          {post.location && `${post.location} · `}
                          {new Date(post.postedAt).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-primary">
                        ¥{post.price.toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Amazon */}
            <section className="bg-card-bg rounded-2xl shadow-sm border border-border/50 p-4">
              <h2 className="font-bold text-base mb-3">📦 Amazon 参考価格</h2>
              <p className="text-xs text-muted mb-3">※ モックデータ（後日API連携予定）</p>
              <ul className="divide-y divide-border/60">
                {amazonResults.map((item, i) => (
                  <li key={i} className="py-3 flex justify-between items-center">
                    <p className="text-sm flex-1 pr-3">{item.title}</p>
                    <p className="text-lg font-bold whitespace-nowrap">
                      ¥{item.price.toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <>
            {/* ===== プッシュ通知バナー ===== */}
            <PushNotificationBanner />

            {/* ===== バッジカード ===== */}
            <UserBadge onRedeem={() => setRefreshKey((k) => k + 1)} />

            {/* ===== 広告エリア ===== */}
            {!adFree && (
              <div className="bg-card-bg rounded-2xl shadow-sm border border-border/50 p-4 text-center">
                <p className="text-[10px] text-muted mb-2">広告</p>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl py-6 px-4">
                  <p className="text-sm font-medium text-amber-700">
                    📢 スポンサー広告エリア
                  </p>
                  <p className="text-xs text-amber-600/70 mt-1">
                    1000ptで1ヶ月非表示にできます
                  </p>
                </div>
              </div>
            )}

            {/* ===== リアルタイムフィード ===== */}
            <section className="bg-card-bg rounded-2xl shadow-sm border border-border/50 p-4">
              <h2 className="font-bold text-base mb-3">⚡ 最近の投稿</h2>
              {recentPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">🛍️</p>
                  <p className="text-sm text-muted">
                    まだ投稿がありません
                    <br />
                    商品を検索して最初の投稿をしよう！
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {recentPosts.map((post, i) => (
                    <li
                      key={post.id}
                      className="animate-feed-in flex items-center gap-3 bg-background
                                 rounded-xl p-3 hover:bg-primary/5 transition-colors cursor-pointer"
                      style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
                      onClick={() => {
                        setQuery(post.productName);
                        setPosts(searchPosts(post.productName));
                        setAmazonResults(searchAmazon(post.productName));
                        setHasSearched(true);
                      }}
                    >
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center
                                      justify-center shrink-0 text-sm">
                        🏷️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {post.productName}
                        </p>
                        <p className="text-xs text-muted truncate">
                          {post.storeName} · {timeAgo(post.postedAt)}
                        </p>
                      </div>
                      <p className="text-base font-bold text-primary shrink-0">
                        ¥{post.price.toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
