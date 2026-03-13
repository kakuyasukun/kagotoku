import { supabase } from "./supabase";
import type { PricePost, Favorite, ShoppingGroup, PointEntry } from "../types";

const MIGRATED_KEY = "kagotoku_supabase_migrated";

export function hasMigrated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MIGRATED_KEY) === "true";
}

/** localStorageのデータをSupabaseに移行（初回ログイン時のみ） */
export async function migrateToSupabase(userId: string): Promise<void> {
  if (hasMigrated()) return;

  try {
    // 1. プロフィール
    const profileRaw = localStorage.getItem("kagotoku_profile");
    if (profileRaw) {
      const p = JSON.parse(profileRaw);
      await supabase
        .from("profiles")
        .upsert({
          id: userId,
          nickname: p.nickname || "",
          points: p.points || 0,
          post_count: p.postCount || 0,
        });
    }

    // 2. 価格投稿
    const postsRaw = localStorage.getItem("kagotoku_prices");
    if (postsRaw) {
      const posts: PricePost[] = JSON.parse(postsRaw);
      if (posts.length > 0) {
        const rows = posts.map((p) => ({
          user_id: userId,
          product_name: p.productName,
          store_name: p.storeName,
          price: p.price,
          location: p.location || "",
          lat: p.lat ?? null,
          lng: p.lng ?? null,
          category: p.category || "other",
          posted_at: p.postedAt,
        }));
        // バッチで挿入（最大100件ずつ）
        for (let i = 0; i < rows.length; i += 100) {
          await supabase.from("price_posts").insert(rows.slice(i, i + 100));
        }
      }
    }

    // 3. お気に入り
    const favsRaw = localStorage.getItem("kagotoku_favorites");
    if (favsRaw) {
      const favs: Favorite[] = JSON.parse(favsRaw);
      if (favs.length > 0) {
        const rows = favs.map((f) => ({
          user_id: userId,
          product_name: f.productName,
          target_price: f.targetPrice,
          added_at: f.addedAt,
        }));
        await supabase.from("favorites").insert(rows);
      }
    }

    // 4. 買い物リスト
    const shoppingRaw = localStorage.getItem("kagotoku_shopping_list");
    if (shoppingRaw) {
      const data = JSON.parse(shoppingRaw);
      const groups: ShoppingGroup[] = Array.isArray(data) && data.length > 0 && "items" in data[0]
        ? data
        : [];
      for (const g of groups) {
        const { data: inserted } = await supabase
          .from("shopping_groups")
          .insert({ user_id: userId, name: g.name, created_at: g.createdAt })
          .select("id")
          .single();
        if (inserted && g.items.length > 0) {
          const items = g.items.map((item) => ({
            group_id: inserted.id,
            user_id: userId,
            product_name: item.productName,
            completed: item.completed,
            added_at: item.addedAt,
            completed_at: item.completedAt,
          }));
          await supabase.from("shopping_items").insert(items);
        }
      }
    }

    // 5. ポイント履歴
    const pointsRaw = localStorage.getItem("kagotoku_points_history");
    if (pointsRaw) {
      const entries: PointEntry[] = JSON.parse(pointsRaw);
      if (entries.length > 0) {
        const rows = entries.map((e) => ({
          user_id: userId,
          amount: e.amount,
          consumed: e.consumed,
          earned_at: e.earnedAt,
          expires_at: e.expiresAt,
        }));
        await supabase.from("point_entries").insert(rows);
      }
    }

    localStorage.setItem(MIGRATED_KEY, "true");
  } catch (err) {
    console.error("Migration error:", err);
  }
}

// ===== Supabase CRUD ヘルパー =====

/** 共有価格投稿を取得（全ユーザー） */
export async function fetchSharedPosts(productName?: string): Promise<PricePost[]> {
  let query = supabase
    .from("price_posts")
    .select("*")
    .order("posted_at", { ascending: false })
    .limit(200);

  if (productName) {
    query = query.ilike("product_name", `%${productName}%`);
  }

  const { data } = await query;
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    productName: row.product_name,
    storeName: row.store_name,
    price: row.price,
    location: row.location || "",
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    category: row.category || "other",
    postedAt: row.posted_at,
  }));
}

/** 共有価格投稿を追加 */
export async function insertSharedPost(
  userId: string,
  post: Omit<PricePost, "id" | "postedAt">
): Promise<void> {
  await supabase.from("price_posts").insert({
    user_id: userId,
    product_name: post.productName,
    store_name: post.storeName,
    price: post.price,
    location: post.location || "",
    lat: post.lat ?? null,
    lng: post.lng ?? null,
    category: post.category || "other",
  });
}

/** プロフィールを同期 */
export async function syncProfile(
  userId: string,
  data: { nickname?: string; points?: number; post_count?: number }
): Promise<void> {
  await supabase.from("profiles").upsert({ id: userId, ...data });
}
