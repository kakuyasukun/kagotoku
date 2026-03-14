export type Category = "food" | "daily" | "drink" | "other";

export interface PricePost {
  id: string;
  productName: string;
  storeName: string;
  price: number;
  location: string;
  lat?: number;
  lng?: number;
  category?: Category;
  postedAt: string; // ISO date string
}

export interface AmazonProduct {
  title: string;
  price: number;
  url: string;
  image: string;
}

export interface Store {
  name: string;
  location: string;
  lat: number;
  lng: number;
  posts: PricePost[];
}

export type ShopType = "supermarket" | "chemist" | "convenience";

export interface OverpassStore {
  id: number;
  name: string;
  lat: number;
  lng: number;
  shopType: ShopType;
  posts: PricePost[];
}

// --- ユーザープロファイル ---

export interface UserProfile {
  nickname: string;
  avatar: string;
  points: number;
  postCount: number;
  createdAt: string;
}

export interface RankingEntry {
  nickname: string;
  weeklyPosts: number;
}

// --- 予算 ---

export interface MonthlyBudget {
  yearMonth: string; // "2026-03"
  amount: number;
}

// --- カテゴリ ---

export const CATEGORY_LABELS: Record<Category, string> = {
  food: "食品",
  daily: "日用品",
  drink: "飲料",
  other: "その他",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  food: "#e8725a",
  daily: "#2563eb",
  drink: "#16a34a",
  other: "#a855f7",
};

// --- ポイント履歴 ---

export interface PointEntry {
  id: string;
  amount: number;
  consumed: number;
  earnedAt: string;   // ISO date
  expiresAt: string;  // ISO date (earnedAt + 1年)
}

// --- お気に入り ---

export interface Favorite {
  id: string;
  productName: string;
  targetPrice: number | null; // 目標価格
  addedAt: string;
}

// --- 買い物リスト ---

export interface ShoppingItem {
  id: string;
  productName: string;
  completed: boolean;
  addedAt: string;
  completedAt: string | null;
}

export interface ShoppingGroup {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: string;
}
