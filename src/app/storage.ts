import {
  PricePost,
  Store,
  Category,
  UserProfile,
  RankingEntry,
  MonthlyBudget,
  Favorite,
  PointEntry,
  ShoppingItem,
  ShoppingGroup,
} from "./types";

const STORAGE_KEY = "kagotoku_prices";
const PROFILE_KEY = "kagotoku_profile";
const BUDGET_KEY = "kagotoku_budgets";
const FAVORITES_KEY = "kagotoku_favorites";
const ONBOARDING_KEY = "kagotoku_onboarded";
const POINTS_HISTORY_KEY = "kagotoku_points_history";
const WELCOME_BONUS_KEY = "kagotoku_welcome_bonus";
const SHOPPING_LIST_KEY = "kagotoku_shopping_list";

// ===== 投稿 CRUD =====

export function getPosts(): PricePost[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function savePosts(posts: PricePost[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function addPost(
  post: Omit<PricePost, "id" | "postedAt">
): PricePost {
  const newPost: PricePost = {
    ...post,
    id: crypto.randomUUID(),
    postedAt: new Date().toISOString(),
  };
  const posts = getPosts();
  posts.unshift(newPost);
  savePosts(posts);
  addPoints(10);
  return newPost;
}

export function deletePost(id: string): void {
  const posts = getPosts().filter((p) => p.id !== id);
  savePosts(posts);
}

export function searchPosts(productName: string): PricePost[] {
  return getPosts().filter((p) =>
    p.productName.toLowerCase().includes(productName.toLowerCase())
  );
}

export function getRecentPosts(limit: number = 10): PricePost[] {
  return getPosts().slice(0, limit);
}

/** 指定日数より古い投稿を削除する。削除件数を返す */
export function cleanupOldPosts(days: number = 14): number {
  const posts = getPosts();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const fresh = posts.filter((p) => new Date(p.postedAt).getTime() > cutoff);
  const removed = posts.length - fresh.length;
  if (removed > 0) savePosts(fresh);
  return removed;
}

// ===== ユーザープロファイル =====

export function getProfile(): UserProfile {
  if (typeof window === "undefined")
    return { nickname: "", avatar: "😊", points: 0, postCount: 0, createdAt: "" };
  const raw = localStorage.getItem(PROFILE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (!parsed.avatar) parsed.avatar = "😊";
    return parsed;
  }
  const profile: UserProfile = {
    nickname: "",
    avatar: "😊",
    points: 0,
    postCount: 0,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function setNickname(name: string): void {
  const p = getProfile();
  p.nickname = name;
  saveProfile(p);
}

export function setAvatar(emoji: string): void {
  const p = getProfile();
  p.avatar = emoji;
  saveProfile(p);
}

// ===== ポイント履歴管理 =====

export function getPointEntries(): PointEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(POINTS_HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

function savePointEntries(entries: PointEntry[]): void {
  localStorage.setItem(POINTS_HISTORY_KEY, JSON.stringify(entries));
}

/** 既存のprofile.pointsをエントリに移行（初回のみ） */
function migratePointsIfNeeded(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(POINTS_HISTORY_KEY) !== null) return;
  const p = getProfile();
  if (p.points <= 0) {
    savePointEntries([]);
    return;
  }
  const earnedAt = p.createdAt || new Date().toISOString();
  const expiresAt = new Date(
    new Date(earnedAt).getTime() + 365 * 24 * 60 * 60 * 1000
  ).toISOString();
  const entry: PointEntry = {
    id: crypto.randomUUID(),
    amount: p.points,
    consumed: 0,
    earnedAt,
    expiresAt,
  };
  savePointEntries([entry]);
}

/** 有効なポイントエントリのみを返す（未失効・残りあり） */
export function getValidPointEntries(): PointEntry[] {
  migratePointsIfNeeded();
  const now = Date.now();
  return getPointEntries().filter(
    (e) => new Date(e.expiresAt).getTime() > now && e.amount - e.consumed > 0
  );
}

/** 有効ポイントの合計 */
export function getValidPoints(): number {
  return getValidPointEntries().reduce(
    (sum, e) => sum + (e.amount - e.consumed),
    0
  );
}

/** 30日以内に失効するエントリ（有効なもののみ） */
export function getExpiringSoonEntries(): PointEntry[] {
  const now = Date.now();
  const threshold = now + 30 * 24 * 60 * 60 * 1000;
  return getValidPointEntries().filter(
    (e) => new Date(e.expiresAt).getTime() <= threshold
  );
}

/** 失効済みポイントの合計 */
export function getExpiredPointsTotal(): number {
  migratePointsIfNeeded();
  const now = Date.now();
  return getPointEntries()
    .filter((e) => new Date(e.expiresAt).getTime() <= now)
    .reduce((sum, e) => sum + (e.amount - e.consumed), 0);
}

export function addPoints(pts: number, incrementPostCount: boolean = true): void {
  migratePointsIfNeeded();
  const p = getProfile();
  if (incrementPostCount) p.postCount += 1;
  p.points = getValidPoints() + pts;
  saveProfile(p);

  const earnedAt = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + 365 * 24 * 60 * 60 * 1000
  ).toISOString();
  const entry: PointEntry = {
    id: crypto.randomUUID(),
    amount: pts,
    consumed: 0,
    earnedAt,
    expiresAt,
  };
  const entries = getPointEntries();
  entries.push(entry);
  savePointEntries(entries);
}

/** ウェルカムボーナス（初回のみ100pt） */
export function grantWelcomeBonus(): boolean {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(WELCOME_BONUS_KEY) === "true") return false;
  addPoints(100, false);
  localStorage.setItem(WELCOME_BONUS_KEY, "true");
  return true;
}

/** FIFO順（古い順）でポイントを消費する */
export function consumePoints(amount: number): boolean {
  migratePointsIfNeeded();
  if (getValidPoints() < amount) return false;

  const entries = getPointEntries();
  const now = Date.now();
  // 古い順にソート
  const validIndices = entries
    .map((e, i) => ({ entry: e, index: i }))
    .filter(
      ({ entry }) =>
        new Date(entry.expiresAt).getTime() > now &&
        entry.amount - entry.consumed > 0
    )
    .sort(
      (a, b) =>
        new Date(a.entry.earnedAt).getTime() -
        new Date(b.entry.earnedAt).getTime()
    );

  let remaining = amount;
  for (const { index } of validIndices) {
    const available = entries[index].amount - entries[index].consumed;
    const deduct = Math.min(available, remaining);
    entries[index].consumed += deduct;
    remaining -= deduct;
    if (remaining <= 0) break;
  }

  savePointEntries(entries);
  const p = getProfile();
  p.points = getValidPoints();
  saveProfile(p);
  return true;
}

export function getBadge(points: number): { label: string; emoji: string } {
  if (points >= 1000) return { label: "節約の神", emoji: "👑" };
  if (points >= 500) return { label: "節約マスター", emoji: "🏆" };
  if (points >= 200) return { label: "節約上手", emoji: "⭐" };
  if (points >= 50) return { label: "節約見習い", emoji: "🌱" };
  return { label: "はじめたばかり", emoji: "🥚" };
}

// ===== ポイント特典（広告非表示） =====

const AD_FREE_KEY = "kagotoku_ad_free_expiry";

export function redeemAdFree(): boolean {
  if (getValidPoints() < 1000) return false;
  consumePoints(1000);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  localStorage.setItem(AD_FREE_KEY, expiry.toISOString());
  return true;
}

export function isAdFreeActive(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(AD_FREE_KEY);
  if (!raw) return false;
  return new Date(raw).getTime() > Date.now();
}

export function getAdFreeRemainingDays(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(AD_FREE_KEY);
  if (!raw) return 0;
  const diff = new Date(raw).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

// ===== ランキング =====

export function getWeeklyRanking(): RankingEntry[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const posts = getPosts().filter((p) => new Date(p.postedAt) >= weekAgo);

  const profile = getProfile();
  const myCount = posts.length;

  const entries: RankingEntry[] = [
    { nickname: profile.nickname || "あなた", weeklyPosts: myCount },
    { nickname: "おトクママ", weeklyPosts: Math.max(0, myCount - 1) },
    { nickname: "節約パパ", weeklyPosts: Math.max(0, myCount - 2) },
    { nickname: "かしこい主婦", weeklyPosts: Math.max(0, myCount - 3) },
  ].filter((e) => e.weeklyPosts > 0);

  return entries.sort((a, b) => b.weeklyPosts - a.weeklyPosts);
}

// ===== 節約貢献額 =====

export function getSavingsContribution(): number {
  const posts = getPosts();
  const productMaxPrice = new Map<string, number>();
  for (const p of posts) {
    const cur = productMaxPrice.get(p.productName) ?? 0;
    if (p.price > cur) productMaxPrice.set(p.productName, p.price);
  }
  let total = 0;
  for (const p of posts) {
    const max = productMaxPrice.get(p.productName) ?? p.price;
    total += max - p.price;
  }
  return total;
}

// ===== 節約額計算 =====

export function getTodaySavings(): number {
  const today = new Date().toISOString().slice(0, 10);
  const posts = getPosts().filter((p) => p.postedAt.slice(0, 10) === today);
  const byProduct = new Map<string, number[]>();
  for (const p of posts) {
    const arr = byProduct.get(p.productName) ?? [];
    arr.push(p.price);
    byProduct.set(p.productName, arr);
  }
  let savings = 0;
  for (const prices of byProduct.values()) {
    if (prices.length >= 2) {
      savings += Math.max(...prices) - Math.min(...prices);
    }
  }
  return savings;
}

export function getMonthSavings(): number {
  const ym = new Date().toISOString().slice(0, 7);
  const posts = getPosts().filter((p) => p.postedAt.slice(0, 7) === ym);
  const byProduct = new Map<string, number[]>();
  for (const p of posts) {
    const arr = byProduct.get(p.productName) ?? [];
    arr.push(p.price);
    byProduct.set(p.productName, arr);
  }
  let savings = 0;
  for (const prices of byProduct.values()) {
    if (prices.length >= 2) {
      savings += Math.max(...prices) - Math.min(...prices);
    }
  }
  return savings;
}

// ===== 予算 =====

export function getBudgets(): MonthlyBudget[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(BUDGET_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function setBudget(yearMonth: string, amount: number): void {
  const budgets = getBudgets();
  const idx = budgets.findIndex((b) => b.yearMonth === yearMonth);
  if (idx >= 0) {
    budgets[idx].amount = amount;
  } else {
    budgets.push({ yearMonth, amount });
  }
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
}

export function getBudget(yearMonth: string): number | null {
  const b = getBudgets().find((b) => b.yearMonth === yearMonth);
  return b ? b.amount : null;
}

// ===== お気に入り =====

export function getFavorites(): Favorite[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addFavorite(productName: string): Favorite {
  const favs = getFavorites();
  const existing = favs.find(
    (f) => f.productName.toLowerCase() === productName.toLowerCase()
  );
  if (existing) return existing;

  const fav: Favorite = {
    id: crypto.randomUUID(),
    productName,
    targetPrice: null,
    addedAt: new Date().toISOString(),
  };
  favs.unshift(fav);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  addPoints(5, false);
  return fav;
}

export function removeFavorite(id: string): void {
  const favs = getFavorites().filter((f) => f.id !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export function setTargetPrice(id: string, price: number | null): void {
  const favs = getFavorites();
  const fav = favs.find((f) => f.id === id);
  if (fav) {
    fav.targetPrice = price;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  }
}

export function isFavorited(productName: string): boolean {
  return getFavorites().some(
    (f) => f.productName.toLowerCase() === productName.toLowerCase()
  );
}

export function getFavoriteAlerts(): { favorite: Favorite; post: PricePost }[] {
  const favs = getFavorites().filter((f) => f.targetPrice !== null);
  const posts = getPosts();
  const alerts: { favorite: Favorite; post: PricePost }[] = [];

  for (const fav of favs) {
    const matching = posts.filter(
      (p) =>
        p.productName.toLowerCase() === fav.productName.toLowerCase() &&
        p.price <= fav.targetPrice!
    );
    if (matching.length > 0) {
      alerts.push({ favorite: fav, post: matching[0] });
    }
  }
  return alerts;
}

export function getAlertCount(): number {
  return getFavoriteAlerts().length;
}

// ===== オンボーディング =====

export function isOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function completeOnboarding(): void {
  localStorage.setItem(ONBOARDING_KEY, "true");
}

// ===== カレンダー用 =====

export interface DaySummary {
  date: string;
  total: number;
  count: number;
}

export function getPostsByDateRange(start: string, end: string): PricePost[] {
  return getPosts().filter((p) => {
    const d = p.postedAt.slice(0, 10);
    return d >= start && d <= end;
  });
}

export function getPostsByDate(dateStr: string): PricePost[] {
  return getPosts().filter((p) => p.postedAt.slice(0, 10) === dateStr);
}

export function getDailySummaries(year: number, month: number): DaySummary[] {
  const posts = getPosts();
  const map = new Map<string, DaySummary>();

  for (const p of posts) {
    const d = p.postedAt.slice(0, 10);
    const [y, m] = d.split("-").map(Number);
    if (y !== year || m !== month) continue;
    const existing = map.get(d);
    if (existing) {
      existing.total += p.price;
      existing.count += 1;
    } else {
      map.set(d, { date: d, total: p.price, count: 1 });
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export function getMonthlySummaries(
  year: number
): { month: number; total: number; count: number }[] {
  const posts = getPosts();
  const map = new Map<number, { total: number; count: number }>();

  for (const p of posts) {
    const [y, m] = p.postedAt.slice(0, 10).split("-").map(Number);
    if (y !== year) continue;
    const existing = map.get(m);
    if (existing) {
      existing.total += p.price;
      existing.count += 1;
    } else {
      map.set(m, { total: p.price, count: 1 });
    }
  }

  return Array.from(map.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month - b.month);
}

export function getYearlySummaries(): {
  year: number;
  total: number;
  count: number;
}[] {
  const posts = getPosts();
  const map = new Map<number, { total: number; count: number }>();

  for (const p of posts) {
    const y = Number(p.postedAt.slice(0, 4));
    const existing = map.get(y);
    if (existing) {
      existing.total += p.price;
      existing.count += 1;
    } else {
      map.set(y, { total: p.price, count: 1 });
    }
  }

  return Array.from(map.entries())
    .map(([year, data]) => ({ year, ...data }))
    .sort((a, b) => a.year - b.year);
}

export function getCategorySummary(
  year: number,
  month: number
): { category: Category; total: number }[] {
  const posts = getPosts();
  const map = new Map<Category, number>();

  for (const p of posts) {
    const [y, m] = p.postedAt.slice(0, 10).split("-").map(Number);
    if (y !== year || m !== month) continue;
    const cat = p.category ?? "other";
    map.set(cat, (map.get(cat) ?? 0) + p.price);
  }

  return Array.from(map.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

// ===== 地図用 =====

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearbyStores(
  userLat: number,
  userLng: number,
  radiusKm: number = 5
): Store[] {
  const posts = getPosts().filter(
    (p) => p.lat !== undefined && p.lng !== undefined
  );

  const storeMap = new Map<string, Store>();

  for (const p of posts) {
    const dist = haversineDistance(userLat, userLng, p.lat!, p.lng!);
    if (dist > radiusKm) continue;

    const key = p.storeName;
    const existing = storeMap.get(key);
    if (existing) {
      existing.posts.push(p);
    } else {
      storeMap.set(key, {
        name: p.storeName,
        location: p.location,
        lat: p.lat!,
        lng: p.lng!,
        posts: [p],
      });
    }
  }

  return Array.from(storeMap.values());
}

// ===== 買い物リスト（グループ管理） =====

export function getShoppingGroups(): ShoppingGroup[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SHOPPING_LIST_KEY);
  if (!raw) return [];
  const data = JSON.parse(raw);
  // 旧フラットリスト → グループへの移行
  if (Array.isArray(data) && data.length > 0 && !("items" in data[0])) {
    const group: ShoppingGroup = {
      id: crypto.randomUUID(),
      name: "買い物リスト",
      items: data as ShoppingItem[],
      createdAt: new Date().toISOString(),
    };
    const groups = [group];
    saveShoppingGroups(groups);
    return groups;
  }
  return data as ShoppingGroup[];
}

function saveShoppingGroups(groups: ShoppingGroup[]): void {
  localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(groups));
}

export function getShoppingGroup(id: string): ShoppingGroup | null {
  return getShoppingGroups().find((g) => g.id === id) ?? null;
}

export function createShoppingGroup(name: string): ShoppingGroup {
  const groups = getShoppingGroups();
  const group: ShoppingGroup = {
    id: crypto.randomUUID(),
    name,
    items: [],
    createdAt: new Date().toISOString(),
  };
  groups.unshift(group);
  saveShoppingGroups(groups);
  return group;
}

export function deleteShoppingGroup(id: string): void {
  const groups = getShoppingGroups().filter((g) => g.id !== id);
  saveShoppingGroups(groups);
}

export function renameShoppingGroup(id: string, name: string): void {
  const groups = getShoppingGroups();
  const group = groups.find((g) => g.id === id);
  if (group) {
    group.name = name;
    saveShoppingGroups(groups);
  }
}

export function addShoppingItem(groupId: string, productName: string): ShoppingItem {
  const groups = getShoppingGroups();
  const group = groups.find((g) => g.id === groupId);
  if (!group) throw new Error("Group not found");
  const item: ShoppingItem = {
    id: crypto.randomUUID(),
    productName,
    completed: false,
    addedAt: new Date().toISOString(),
    completedAt: null,
  };
  group.items.push(item);
  saveShoppingGroups(groups);
  addPoints(2, false);
  return item;
}

export function toggleShoppingItem(groupId: string, itemId: string): void {
  const groups = getShoppingGroups();
  const group = groups.find((g) => g.id === groupId);
  const item = group?.items.find((i) => i.id === itemId);
  if (item) {
    item.completed = !item.completed;
    item.completedAt = item.completed ? new Date().toISOString() : null;
    saveShoppingGroups(groups);
  }
}

export function deleteShoppingItem(groupId: string, itemId: string): void {
  const groups = getShoppingGroups();
  const group = groups.find((g) => g.id === groupId);
  if (group) {
    group.items = group.items.filter((i) => i.id !== itemId);
    saveShoppingGroups(groups);
  }
}

export function clearCompletedItems(groupId: string): number {
  const groups = getShoppingGroups();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return 0;
  const before = group.items.length;
  group.items = group.items.filter((i) => !i.completed);
  saveShoppingGroups(groups);
  return before - group.items.length;
}
