import { useEffect, useState } from "react";
import { Trophy, Bolt, Sparkles, Gamepad2, BarChart3, Wifi, WifiOff, CheckCircle2 } from "lucide-react";
import AppHeader from "@/components/app-header";
import GameResults from "@/components/game-results";
import { useGameShowWS } from "@/hooks/useGameShowWS";
import { supabase } from "@/lib/supabase";

// ───────────────────────────────────────────────────────────
// SHARED UI HELPERS
// ───────────────────────────────────────────────────────────

function BubbleBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute w-12 h-12 left-[10%] top-[20%] bg-white/40 border border-white/60 rounded-full shadow-inner" />
      <div className="absolute w-20 h-20 left-[80%] top-[15%] bg-white/40 border border-white/60 rounded-full shadow-inner" />
      <div className="absolute w-16 h-16 left-[40%] top-[70%] bg-white/40 border border-white/60 rounded-full shadow-inner" />
      <div className="absolute w-8 h-8 left-[70%] top-[85%] bg-white/40 border border-white/60 rounded-full shadow-inner" />
      <div className="absolute w-24 h-24 left-[5%] top-[60%] bg-white/40 border border-white/60 rounded-full shadow-inner" />
      <div className="absolute top-32 left-1/4 text-5xl font-extrabold text-[#00AEEF] opacity-10 select-none" style={{ fontFamily: "Baloo 2, cursive" }}>1 + 1 = 2</div>
      <div className="absolute bottom-32 right-1/4 text-5xl font-extrabold text-[#00AEEF] opacity-10 select-none" style={{ fontFamily: "Baloo 2, cursive" }}>x &gt; y</div>
    </div>
  );
}

function WaveFoot() {
  return (
    <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none opacity-30 z-0">
      <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
        <path d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#00AEEF" />
      </svg>
    </div>
  );
}

function PlayerCard({
  name, grade, winRate, totalScore, isMe, searching = false,
}: {
  name: string; grade?: string | number; winRate?: number; totalScore?: number;
  isMe: boolean; searching?: boolean;
}) {
  return (
    <div className={`flex-1 ${isMe ? "bg-[#D6F0FF]/50 border-[#D6F0FF]" : "bg-[#FFE5E5]/40 border-[#FFE5E5]"} rounded-2xl p-6 border-4 border-white shadow-lg flex flex-col items-center relative hover:-translate-y-1 transition-transform`}>
      <div className={`absolute -top-6 bg-white border-4 ${isMe ? "border-[#D6F0FF]" : "border-[#FFE5E5]"} w-20 h-20 rounded-full flex items-center justify-center shadow-md z-10 text-4xl`}>
        {searching ? "❔" : isMe ? "😊" : "🤖"}
      </div>
      <div className="mt-12 w-full text-center">
        <h2 className="text-2xl font-black text-[#0A2463] mb-2 uppercase tracking-wider" style={{ fontFamily: "Baloo 2, cursive" }}>
          {isMe ? "BẠN" : "ĐỐI THỦ"}
        </h2>
        <p className="text-[#0A2463]/70 font-bold mb-4 truncate text-sm">{name}</p>
        <div className="space-y-3 text-left px-4">
          <div className="flex items-center justify-between bg-white/60 p-3 rounded-xl">
            <span className="font-bold text-[#0A2463]">🎓 LỚP</span>
            <span className="font-black text-xl text-[#00AEEF]" style={{ fontFamily: "Baloo 2, cursive" }}>{searching ? "???" : (grade ?? "?")}</span>
          </div>
          <div className="flex items-center justify-between bg-white/60 p-3 rounded-xl">
            <span className="font-bold text-[#0A2463]">🏆 TỈ LỆ THẮNG</span>
            <span className="font-black text-xl text-yellow-500" style={{ fontFamily: "Baloo 2, cursive" }}>{searching ? "??%" : `${winRate ?? "?"}%`}</span>
          </div>
          <div className="flex items-center justify-between bg-white/60 p-3 rounded-xl">
            <span className="font-bold text-[#0A2463]">⭐ ĐIỂM</span>
            <span className="font-black text-xl text-green-600" style={{ fontFamily: "Baloo 2, cursive" }}>{searching ? "????" : (totalScore ?? "?")}</span>
          </div>
        </div>
      </div>
      <div className="mt-6">
        {searching ? (
          <span className="bg-gray-100 text-gray-500 px-6 py-2 rounded-full font-extrabold text-sm uppercase tracking-wide border-2 border-gray-200 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Đang tìm...
          </span>
        ) : (
          <span className="bg-green-100 text-green-700 px-6 py-2 rounded-full font-extrabold text-sm uppercase tracking-wide border-2 border-green-200 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            Sẵn sàng
          </span>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// LEADERBOARD TAB
// ───────────────────────────────────────────────────────────
function LeaderboardTab() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await fetch('/api/gameshow/leaderboard?limit=10', { cache: "no-store" });
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        const data = await res.json();

        if (mounted) {
          if (Array.isArray(data)) {
            setPlayers(data.map((p: any, index: number) => ({
              rank: p.rank,
              name: p.displayName || 'Ẩn danh',
              score: p.totalScore || 0,
              avatar: p.avatar || null,
              medal: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : (index + 1).toString(),
            })));
          } else {
            setPlayers([]);
          }
        }
      } catch (err: any) {
        if (mounted) {
          console.error("Exception fetching leaderboard:", err.message);
          setPlayers([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchLeaderboard();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="shadow-[0_20px_50px_rgba(0,174,239,0.08)] bg-white rounded-3xl p-10 border border-white/60 min-h-[500px] flex flex-col relative overflow-hidden">
      <h1 className="text-3xl md:text-4xl font-black text-[#0A2463] mb-8 uppercase tracking-widest text-center" style={{ fontFamily: "Baloo 2, cursive" }}>
        BẢNG XẾP HẠNG THÀNH TÍCH
      </h1>
      <div className="flex-grow space-y-4 mb-8">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <svg className="animate-spin h-8 w-8 text-[#00AEEF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center text-gray-500 font-bold py-10">
            Chưa có ai trên bảng xếp hạng! Hãy chơi ngay để giành vị trí top 1.
          </div>
        ) : (
          players.map((p) => (
            <div key={p.rank} className="bg-[#FFE5E5] rounded-2xl p-4 flex items-center justify-between border border-red-100/50 shadow-sm hover:translate-x-2 transition-transform">
              <div className="flex items-center gap-6">
                <div className={`flex items-center justify-center w-12 font-black text-4xl ${p.rank <= 3 ? "" : "text-[#0A2463]/40"}`}>{p.medal}</div>
                <span className="font-black text-[#0A2463] text-lg w-16 uppercase" style={{ fontFamily: "Baloo 2, cursive" }}>TOP {p.rank}</span>
                <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {p.avatar ? (
                    <img src={p.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    p.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="font-bold text-[#0A2463] text-xl truncate max-w-[150px] md:max-w-xs">{p.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl text-[#0A2463]" style={{ fontFamily: "Baloo 2, cursive" }}>{p.score.toLocaleString()}</span>
                <span className="text-xs font-bold text-[#0A2463]/60 uppercase">ĐIỂM</span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-auto flex items-center justify-between pt-6 border-t border-[#0A2463]/5">
        <div className="flex gap-8">
          <label className="flex items-center gap-2 cursor-pointer"><input defaultChecked className="w-5 h-5" name="filter" type="radio" /><span className="font-bold text-[#0A2463] uppercase text-sm">TỈNH</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><input className="w-5 h-5" name="filter" type="radio" /><span className="font-bold text-[#0A2463] uppercase text-sm">XÃ</span></label>
        </div>
        <div className="bg-[#0A2463]/5 px-6 py-3 rounded-full border border-[#0A2463]/10">
          <p className="text-[#0A2463] font-bold text-sm uppercase">CÀNG CHƠI NHIỀU, <span className="text-[#FF9F1C]">CÀNG ĐƯỢC NHIỀU ĐIỂM</span></p>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// MAIN COMPONENT
// ───────────────────────────────────────────────────────────
export default function GameShow() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<"game" | "leaderboard">("game");
  const [myStats, setMyStats] = useState<{ points: number, rank: number | null, matches: number, wins: number } | null>(null);

  const fetchMyStats = async (uid: string) => {
    try {
      const res = await fetch(`/api/gameshow/stats/${uid}`, { cache: "no-store" });
      if (!res.ok) {
        const errText = await res.text();
        console.error("Failed to fetch gameshow stats:", errText);
        return;
      }
      
      const data = await res.json();

      if (data && (data.totalScore !== undefined || data.points !== undefined)) {
        setMyStats({
          points: data.totalScore || data.points || 0,
          rank: data.rank || null,
          matches: data.matches || 0,
          wins: data.wins || 0
        });
      } else {
        console.warn("Gameshow stats: unexpected data format", data);
      }
    } catch (err: any) {
      console.error("Exception fetching gameshow stats:", err.message);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("mathocean_user");
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        
        if (parsedUser?.id) {
          fetchMyStats(parsedUser.id);
        }
      } catch { }
    }
  }, []);

  // Listen for view changes to refresh leaderboard if clicked
  useEffect(() => {
    if (view === "leaderboard" && user?.id) {
      fetchMyStats(user.id);
    }
  }, [view, user?.id]);

  const handleResetGame = async () => {
    resetGame();
    
    if (user?.id) {
      // Wait a bit then fetch new stats
      setTimeout(() => {
        fetchMyStats(user.id);
      }, 800);
    } else {
      console.warn("Gameshow reset: missing user id");
    }
  };

  const { state, joinQueue, leaveQueue, submitAnswer, resetGame } = useGameShowWS(
    user?.id ?? null,
    user?.fullName ?? user?.user_metadata?.full_name ?? "Ẩn danh",
    user?.grade ?? undefined,
    myStats?.points ?? 0,
    myStats?.matches && myStats?.matches > 0 ? Math.round((myStats.wins / myStats.matches) * 100) : 0
  );

  // Fetch stats when phase changes from game_over back to idle (after reset)
  useEffect(() => {
    if (state.phase === "idle" && user?.id && !myStats) {
      fetchMyStats(user.id);
    }
  }, [state.phase, user?.id]);

  // Ngay khi trận kết thúc (game_over), refetch stats để cập nhật điểm/hạng (tránh cache cũ)
  useEffect(() => {
    if (state.phase === "game_over" && user?.id) {
      fetchMyStats(user.id);
    }
  }, [state.phase, user?.id]);

  const totalQ = state.questions.length || 10;
  const myCorrect = Object.values(state.myAnswers).filter((a) => a.isCorrect).length;
  const myScore = myCorrect * 100;
  const opCorrect = 0; // we don't get opponent answers per-question (only count)

  // ── GAME OVER ─────────────────────────────────────────────
  if (state.phase === "game_over" && state.finalResults) {
    const myId = user?.id;
    const myResult = myId ? state.finalResults[myId] : null;
    const opResult = state.opponent?.userId ? state.finalResults[state.opponent.userId] : null;
    return (
      <GameResults
        playerCorrect={myResult?.correct ?? myCorrect}
        opponentCorrect={opResult?.correct ?? 0}
        playerScore={myResult?.score ?? myScore}
        opponentScore={opResult?.score ?? 0}
        playerTotalTimeMs={myResult?.totalTimeMs ?? 0}
        opponentTotalTimeMs={opResult?.totalTimeMs ?? 0}
        onFinish={handleResetGame}
      />
    );
  }

  // ── OPPONENT DISCONNECTED ─────────────────────────────────
  if (state.phase === "opponent_disconnected") {
    return (
      <div className="min-h-screen bg-[#EAF6FF] relative overflow-hidden flex flex-col items-center justify-center">
        <AppHeader />
        <BubbleBg />
        <div className="relative z-10 bg-white rounded-3xl p-12 shadow-xl text-center max-w-md">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-3xl font-black text-[#0A2463] mb-4" style={{ fontFamily: "Baloo 2, cursive" }}>BẠN THẮNG!</h1>
          <p className="text-gray-500 mb-8">{state.error ?? "Đối thủ đã ngắt kết nối."}</p>
          <button onClick={handleResetGame} className="bg-[#FF9F1C] text-white font-black py-4 px-12 rounded-full text-xl uppercase tracking-widest border-b-[6px] border-[#e68a00] hover:brightness-105 transition-all">
            TÌM TRẬN MỚI
          </button>
        </div>
        <WaveFoot />
      </div>
    );
  }

  // ── YOU FINISHED — waiting for opponent ───────────────────
  if (state.phase === "you_finished") {
    return (
      <div className="min-h-screen bg-[#EAF6FF] relative overflow-hidden flex flex-col items-center justify-center">
        <AppHeader />
        <BubbleBg />
        <main className="relative z-10 container mx-auto px-4 pt-24 pb-20 flex flex-col items-center justify-center min-h-[calc(100vh-88px)]">
          <div className="bg-white rounded-3xl p-10 md:p-16 shadow-xl border border-white/60 w-full max-w-lg flex flex-col items-center text-center">
            <div className="text-6xl mb-6 animate-bounce">⏳</div>
            <h1 className="text-3xl font-black text-[#0A2463] mb-4 uppercase" style={{ fontFamily: "Baloo 2, cursive" }}>
              BẠN ĐÃ HOÀN THÀNH!
            </h1>
            <p className="text-[#0A2463]/70 font-bold text-lg mb-8">
              Đang chờ <span className="text-[#FF9F1C]">{state.opponent?.displayName ?? "đối thủ"}</span> hoàn thành...
            </p>

            {/* My result preview */}
            <div className="w-full bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-100">
              <p className="text-xs font-bold text-[#0A2463]/50 uppercase mb-3">Kết quả của bạn</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0A2463]">Số câu đúng</span>
                <span className="font-black text-2xl text-[#0A2463]" style={{ fontFamily: "Baloo 2, cursive" }}>{myCorrect}/{totalQ}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="font-bold text-[#0A2463]">Điểm</span>
                <span className="font-black text-2xl text-green-600" style={{ fontFamily: "Baloo 2, cursive" }}>{myScore}</span>
              </div>
            </div>

            {/* Opponent progress */}
            <div className="w-full bg-red-50 rounded-2xl p-4 border border-red-100">
              <p className="text-xs font-bold text-[#0A2463]/50 uppercase mb-2">Tiến độ đối thủ</p>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[#0A2463] text-sm">{state.opponent?.displayName ?? "Đối thủ"}</span>
                <span className="font-black text-[#0A2463]">{state.opponentAnsweredCount}/{totalQ}</span>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-red-100">
                <div
                  className="h-full bg-[#FF9F1C] rounded-full transition-all duration-500"
                  style={{ width: `${(state.opponentAnsweredCount / totalQ) * 100}%` }}
                />
              </div>
              {state.opponentFinished && (
                <p className="text-green-600 font-bold text-sm mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Đã hoàn thành! Đang tính kết quả...
                </p>
              )}
            </div>
          </div>
        </main>
        <WaveFoot />
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────
  if ((state.phase === "playing") && state.questions.length > 0) {
    const currentQ = state.questions[state.currentQuestionIndex];
    // If we've answered all (edge case where YOU_FINISHED hasn't arrived yet)
    if (!currentQ) {
      return (
        <div className="min-h-screen bg-[#EAF6FF] flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl animate-pulse mb-4">⏳</div>
            <p className="font-bold text-[#0A2463] text-xl">Đang chờ kết quả...</p>
          </div>
        </div>
      );
    }

    const alreadyAnswered = !!state.myAnswers[state.currentQuestionIndex];
    const answerLetters = ["A", "B", "C", "D"];
    const diffLabel = state.currentQuestionIndex < 3 ? "DỄ" : state.currentQuestionIndex < 7 ? "TRUNG BÌNH" : "KHÓ";

    const handleSelect = (option: string) => {
      if (alreadyAnswered) return;
      submitAnswer(state.currentQuestionIndex, option);
    };

    return (
      <div className="min-h-screen bg-[#EAF6FF] relative overflow-hidden">
        <AppHeader />
        <BubbleBg />

        <main className="relative z-10 container mx-auto px-4 pt-24 pb-20 flex flex-col items-center justify-center min-h-[calc(100vh-88px)]">
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-white/60 w-full max-w-4xl flex flex-col items-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,174,239,0.1)]">

            {/* Score header */}
            <div className="w-full flex items-center justify-between mb-6 gap-4">
              {/* Me */}
              <div className="flex-1 bg-blue-50 rounded-2xl p-3 text-center border border-blue-100">
                <p className="text-xs font-bold text-[#0A2463]/60 uppercase mb-1">BẠN</p>
                <p className="font-black text-2xl text-[#0A2463]" style={{ fontFamily: "Baloo 2, cursive" }}>{myScore}</p>
                <p className="text-xs text-blue-400">{myCorrect}/{totalQ} đúng</p>
              </div>

              <div className="text-center px-2">
                <div className="bg-[#0A2463] text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mx-auto mb-1" style={{ fontFamily: "Baloo 2, cursive" }}>VS</div>
                <span className="text-xs font-bold text-[#0A2463]/50 uppercase">Câu {state.currentQuestionIndex + 1}/{totalQ}</span>
              </div>

              {/* Opponent progress */}
              <div className="flex-1 bg-red-50 rounded-2xl p-3 text-center border border-red-100">
                <p className="text-xs font-bold text-[#0A2463]/60 uppercase mb-1 truncate">{state.opponent?.displayName ?? "Đối thủ"}</p>
                <p className="font-black text-2xl text-[#0A2463]" style={{ fontFamily: "Baloo 2, cursive" }}>
                  {state.opponentFinished ? "✅" : `${state.opponentAnsweredCount}/${totalQ}`}
                </p>
                <p className="text-xs text-red-400">{state.opponentFinished ? "Đã xong" : "câu đã làm"}</p>
              </div>
            </div>

            {/* Progress bars */}
            <div className="w-full max-w-3xl mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 w-12 shrink-0">BẠN</span>
                <div className="flex-1 h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00AEEF] rounded-full transition-all duration-300"
                    style={{ width: `${((state.currentQuestionIndex) / totalQ) * 100}%` }} />
                </div>
                <span className="text-xs text-[#0A2463]/50 w-10 text-right">{state.currentQuestionIndex}/{totalQ}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-400 w-12 shrink-0 truncate">{state.opponent?.displayName?.split(" ")[0] ?? "ĐT"}</span>
                <div className="flex-1 h-2 bg-red-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF9F1C] rounded-full transition-all duration-500"
                    style={{ width: `${(state.opponentAnsweredCount / totalQ) * 100}%` }} />
                </div>
                <span className="text-xs text-[#0A2463]/50 w-10 text-right">{state.opponentAnsweredCount}/{totalQ}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-red-100 text-red-600 font-extrabold px-3 py-0.5 rounded-full text-xs">{diffLabel}</span>
              </div>
            </div>

            {/* Question */}
            <div className="w-full max-w-3xl bg-[#FFE5E5] border-2 border-red-200 rounded-2xl p-8 mb-8 text-center relative shadow-inner">
              <span className="absolute top-4 left-6 text-red-400 font-black tracking-widest text-sm uppercase">Câu hỏi {state.currentQuestionIndex + 1}</span>
              <h2 className="text-3xl md:text-4xl font-black text-[#0A2463] mt-4" style={{ fontFamily: "Baloo 2, cursive" }}>
                {currentQ.question}
              </h2>
            </div>

            {/* Options */}
            <div className="w-full max-w-2xl grid grid-cols-1 gap-4">
              {currentQ.options.map((option, idx) => {
                const myA = state.myAnswers[state.currentQuestionIndex];
                const showResult = !!myA;
                let btnClass = "bg-white border-2 border-slate-200 text-[#0A2463] hover:-translate-y-0.5 shadow-[0_4px_0_#CBD5E1] hover:shadow-[0_6px_0_#CBD5E1] active:translate-y-0.5 active:shadow-[0_1px_0_#CBD5E1]";
                let circleClass = "bg-slate-100 text-slate-500 border-slate-200 group-hover:bg-[#00AEEF] group-hover:text-white";

                if (showResult) {
                  if (option === currentQ.correctAnswer) {
                    btnClass = "bg-green-50 border-2 border-green-400";
                    circleClass = "bg-green-400 text-white border-green-400";
                  } else if (myA.answer === option) {
                    btnClass = "bg-red-50 border-2 border-red-400";
                    circleClass = "bg-red-400 text-white border-red-400";
                  } else {
                    btnClass = "opacity-40 border-2 border-slate-200";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(option)}
                    disabled={alreadyAnswered}
                    className={`w-full font-black text-xl py-3 px-6 rounded-full flex items-center gap-4 group transition-all ${btnClass}`}
                  >
                    <span className={`w-10 h-10 rounded-full font-bold flex items-center justify-center border text-lg transition-colors ${circleClass}`}>
                      {answerLetters[idx]}
                    </span>
                    <span className="tracking-wide text-2xl flex-grow text-left" style={{ fontFamily: "Baloo 2, cursive" }}>
                      {option}
                    </span>
                    {showResult && option === currentQ.correctAnswer && <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />}
                    {showResult && myA.answer === option && option !== currentQ.correctAnswer && <span className="text-red-500 text-xl shrink-0">✗</span>}
                  </button>
                );
              })}
            </div>

            {/* After answering — brief flash before next question */}
            {alreadyAnswered && state.currentQuestionIndex < totalQ - 1 && (
              <div className="mt-6 flex items-center gap-2 text-[#00AEEF] font-bold animate-pulse">
                <div className="w-2 h-2 bg-[#00AEEF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-[#00AEEF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-[#00AEEF] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                Đang chuyển sang câu tiếp...
              </div>
            )}
          </div>
        </main>
        <WaveFoot />
      </div>
    );
  }

  // ── MATCH FOUND (3s countdown before playing) ─────────────
  if (state.phase === "match_found" && state.opponent) {
    return (
      <div className="min-h-screen bg-[#EAF6FF] relative overflow-hidden">
        <AppHeader />
        <BubbleBg />
        <main className="relative z-10 container mx-auto px-4 pt-24 pb-20 flex flex-col items-center justify-center min-h-[calc(100vh-88px)]">
          <div className="bg-white rounded-3xl p-6 md:p-12 border border-white/60 w-full max-w-5xl flex flex-col items-center overflow-hidden shadow-[0_20px_50px_rgba(0,174,239,0.1)]">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-4xl md:text-5xl font-black text-[#0A2463] mb-2 uppercase tracking-wide text-center" style={{ fontFamily: "Baloo 2, cursive" }}>
              TÌM THẤY ĐỐI THỦ!
            </h1>
            <p className="text-[#00AEEF] font-bold mb-10 animate-pulse">Trận đấu bắt đầu sau 3 giây...</p>
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              <PlayerCard
                name={user?.fullName ?? user?.user_metadata?.full_name ?? "Bạn"}
                grade={user?.grade}
                winRate={myStats?.matches ? Math.round((myStats.wins / myStats.matches) * 100) : 0}
                totalScore={myStats?.points || 0}
                isMe
              />
              <div className="bg-white border-4 border-[#0A2463] text-[#0A2463] w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl shadow-xl" style={{ fontFamily: "Baloo 2, cursive" }}>VS</div>
              <PlayerCard
                name={state.opponent.displayName}
                grade={state.opponent.grade}
                winRate={state.opponent.winRate ?? 0}
                totalScore={state.opponent.totalScore ?? 0}
                isMe={false}
              />
            </div>
            <div className="mt-10 bg-blue-50 rounded-2xl px-8 py-4 text-center border border-blue-100">
              <p className="text-[#0A2463] font-bold">Hoàn thành <span className="text-[#FF9F1C] font-black">{state.questions.length} câu hỏi</span> nhanh nhất để giành chiến thắng!</p>
              <p className="text-[#0A2463]/60 text-sm mt-1">Không có giới hạn thời gian — ai xong trước đợi người kia, rồi so kết quả</p>
            </div>
          </div>
        </main>
        <WaveFoot />
      </div>
    );
  }

  // ── QUEUED (searching) ────────────────────────────────────
  if (state.phase === "queued") {
    return (
      <div className="min-h-screen bg-[#EAF6FF] relative overflow-hidden">
        <AppHeader />
        <BubbleBg />
        <main className="relative z-10 container mx-auto px-4 pt-24 pb-20 flex flex-col items-center justify-center min-h-[calc(100vh-88px)]">
          <div className="bg-white rounded-3xl p-6 md:p-12 border border-white/60 w-full max-w-5xl flex flex-col items-center overflow-hidden shadow-[0_20px_50px_rgba(0,174,239,0.1)]">
            <h1 className="text-4xl md:text-5xl font-black text-[#0A2463] mb-10 uppercase tracking-wide text-center" style={{ fontFamily: "Baloo 2, cursive" }}>
              ĐANG TÌM ĐỐI THỦ...
            </h1>
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-12">
              <PlayerCard
                name={user?.fullName ?? user?.user_metadata?.full_name ?? "Bạn"}
                grade={user?.grade}
                winRate={myStats?.matches ? Math.round((myStats.wins / myStats.matches) * 100) : 0}
                totalScore={myStats?.points || 0}
                isMe
              />
              <div className="bg-white border-4 border-[#0A2463] text-[#0A2463] w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl shadow-xl" style={{ fontFamily: "Baloo 2, cursive" }}>VS</div>
              <PlayerCard name="???" isMe={false} searching />
            </div>
            <button onClick={leaveQueue} className="bg-gray-200 text-gray-700 font-bold py-3 px-10 rounded-full uppercase tracking-widest hover:bg-gray-300 transition-all">
              Hủy tìm kiếm
            </button>
          </div>
        </main>
        <WaveFoot />
      </div>
    );
  }

  // ── LOBBY (default) ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#EAF6FF] relative overflow-hidden">
      <AppHeader />
      <BubbleBg />

      <main className="relative z-10 container mx-auto px-4 pt-24 pb-24 flex flex-col lg:flex-row items-start justify-center gap-8 min-h-[calc(100vh-88px)]">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-[0_20px_50px_rgba(0,174,239,0.08)]">
          {user && (
            <div className="bg-[#0A2463] rounded-2xl p-5 text-white mb-6 relative overflow-hidden shadow-lg border-2 border-[#0A2463]">
              <div className="absolute -right-4 -top-4 opacity-20"><Trophy size={80} /></div>
              <p className="text-xs font-black text-white/70 uppercase mb-1 tracking-widest">THÀNH TÍCH CỦA BẠN</p>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-black text-[#FF9F1C]" style={{ fontFamily: "Baloo 2, cursive" }}>{myStats?.points || 0}</span>
                <span className="text-sm font-bold mb-1 text-white/80">ĐIỂM</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-wider mb-0.5">HẠNG</p>
                  <p className="font-black text-white" style={{ fontFamily: "Baloo 2, cursive" }}>
                    {myStats?.rank ? `TOP ${myStats.rank}` : "UNRANK"}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-wider mb-0.5">TỈ LỆ THẮNG</p>
                  <p className="font-black text-[#00AEEF]" style={{ fontFamily: "Baloo 2, cursive" }}>
                    {myStats?.matches ? Math.round((myStats.wins / myStats.matches) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-center text-[#0A2463] font-extrabold text-xl mb-6 uppercase tracking-wider" style={{ fontFamily: "Baloo 2, cursive" }}>NỘI DUNG</h2>
          <div className="space-y-4">
            <button
              onClick={() => setView("game")}
              className={`w-full font-extrabold py-5 rounded-2xl flex items-center justify-center gap-3 text-lg uppercase shadow-lg transition-all border-b-[6px] hover:border-b-[2px] hover:translate-y-1 active:translate-y-1.5 ${view === "game" ? "bg-[#FF9F1C] text-white shadow-orange-500/20 border-[#e68a00]" : "bg-[#00A8E8] text-white shadow-blue-500/20 border-[#0084b5]"}`}
            >
              <Gamepad2 className="w-6 h-6" /> GAME SHOW
            </button>
            <button
              onClick={() => setView("leaderboard")}
              className={`w-full font-extrabold py-5 rounded-2xl flex items-center justify-center gap-3 text-lg uppercase shadow-lg transition-all border-b-[6px] hover:border-b-[2px] hover:translate-y-1 active:translate-y-1.5 ${view === "leaderboard" ? "bg-[#FF9F1C] text-white shadow-orange-500/20 border-[#e68a00]" : "bg-[#00A8E8] text-white shadow-blue-500/20 border-[#0084b5]"}`}
            >
              <BarChart3 className="w-6 h-6" /> BẢNG XẾP HẠNG
            </button>
          </div>

          <div className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${state.connected ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
            {state.connected ? <><Wifi className="w-4 h-4" /> Đã kết nối</> : <><WifiOff className="w-4 h-4" /> Chưa kết nối</>}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 w-full max-w-4xl">
          {view === "game" ? (
            <div className="shadow-[0_20px_50px_rgba(0,174,239,0.08)] bg-white rounded-3xl p-10 lg:p-14 border border-white/60 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
              <h1 className="text-4xl font-extrabold text-[#0A2463] mb-3 uppercase tracking-widest" style={{ fontFamily: "Baloo 2, cursive" }}>
                MATHUP - GAME SHOW
              </h1>
              <p className="text-[#0A2463]/60 font-semibold mb-8 text-center">Thi đấu toán học với người chơi thật trên toàn quốc!</p>

              {state.error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-2xl text-sm font-bold">{state.error}</div>
              )}

              <button
                onClick={joinQueue}
                disabled={!user}
                className="group relative bg-[#FF9F1C] text-white font-black py-8 px-16 rounded-full shadow-2xl shadow-orange-500/40 text-3xl uppercase tracking-widest flex items-center gap-4 transition-transform hover:scale-105 border-b-[6px] border-[#e68a00] active:border-b-[2px] active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "Baloo 2, cursive" }}
              >
                <Bolt className="w-10 h-10" />
                TÌM ĐỐI THỦ
              </button>
              {!user && <p className="mt-3 text-sm text-red-500 font-semibold">Vui lòng đăng nhập để chơi</p>}

              {/* How to play */}
              <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-lg">
                {[
                  { icon: "🎯", text: "10 câu hỏi toán" },
                  { icon: "⚡", text: "Ai xong nhanh hơn" },
                  { icon: "🏆", text: "Ai đúng nhiều hơn thắng" },
                ].map((item, i) => (
                  <div key={i} className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs font-bold text-[#0A2463]">{item.text}</div>
                  </div>
                ))}
              </div>

              <div className="absolute top-10 left-10 opacity-10"><Sparkles className="w-16 h-16" /></div>
              <div className="absolute bottom-10 right-10 opacity-10"><Trophy className="w-16 h-16" /></div>
            </div>
          ) : (
            <LeaderboardTab />
          )}
        </div>
      </main>
      <WaveFoot />
    </div>
  );
}
