/**
 * Server-side Supabase client
 * Dùng anon key từ .env (không có VITE_ prefix trên server)
 * Nếu cần quyền cao hơn (bypass RLS), thêm SUPABASE_SERVICE_ROLE_KEY vào .env
 */

import { createClient } from "@supabase/supabase-js";

// tsx không tự load .env, nhưng các var VITE_ vẫn accessible nếu dotenv đã load
// Thứ tự ưu tiên: SERVICE_ROLE > ANON key
const supabaseUrl =
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    "";

const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??  // tốt nhất — bypass RLS
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??     // fallback lấy từ VITE_ var
    "";

if (!supabaseUrl || !supabaseKey) {
    console.warn("[Supabase Server] Missing Supabase credentials — game history and stats will not be saved.");
} else if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[Supabase Server] SUPABASE_SERVICE_ROLE_KEY is not set — using ANON key with RLS. Ensure RPCs are configured for user_stats.");
}

export const supabaseServer = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;

// ─── Database helpers ──────────────────────────────────────

export interface GameMatchRecord {
    room_id: string;
    player1_id: string;
    player2_id: string;
    player1_display_name: string;
    player2_display_name: string;
    player1_score: number;
    player2_score: number;
    player1_correct: number;
    player2_correct: number;
    player1_total_time_ms: number;
    player2_total_time_ms: number;
    winner_id: string | null;
    questions_count: number;
}

export async function saveGameMatch(record: GameMatchRecord): Promise<void> {
    if (!supabaseServer) {
        console.warn("[Supabase Server] Skipping save — no Supabase client.");
        return;
    }

    const { error } = await supabaseServer
        .from("game_matches")
        .insert(record);

    if (error) {
        console.error("[Supabase Server] Failed to save game match:", error.message);
    }

    // Dùng RPC để bypass RLS (hoạt động với ANON key). Đã chạy migration trong Supabase SQL Editor.
    const applyStats = async (userId: string, isWinner: boolean, isDraw: boolean) => {
        try {
            const pointDelta = isDraw ? 0 : (isWinner ? 5 : -3);
            const { error } = await supabaseServer!.rpc("upsert_user_stats_gameshow", {
                p_user_id: userId,
                p_point_delta: pointDelta,
                p_is_winner: isWinner,
            });
            if (error) {
                console.error("[Supabase Server] applyStats RPC failed for", userId, error.message, error.code);
            }
        } catch (err: any) {
            console.error("[Supabase Server] applyStats error:", err.message);
        }
    };

    const isDraw = !record.winner_id;
    await applyStats(record.player1_id, record.winner_id === record.player1_id, isDraw);
    await applyStats(record.player2_id, record.winner_id === record.player2_id, isDraw);
}

/**
 * Lấy lịch sử trận đấu của 1 user (cả 2 chiều player1 + player2)
 */
export async function getUserMatchHistory(userId: string, limit = 20) {
    if (!supabaseServer) return [];

    const { data, error } = await supabaseServer
        .from("game_match_history")
        .select("*")
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("[Supabase Server] ❌ Failed to get match history:", error.message);
        return [];
    }

    return data ?? [];
}

/**
 * Leaderboard: Top users theo tổng score từ tất cả trận
 */
export async function getGameLeaderboard(limit = 20) {
    if (!supabaseServer) return [];

    // Query thô: tổng điểm từ game_matches
    const { data, error } = await supabaseServer.rpc("get_gameshow_leaderboard", { p_limit: limit });

    if (error) {
        // Nếu function chưa có, fallback: query trực tiếp
        console.warn("[Supabase Server] leaderboard RPC not found, using raw query");
        return [];
    }

    return data ?? [];
}
