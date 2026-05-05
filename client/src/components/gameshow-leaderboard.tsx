import AppHeader from "@/components/app-header";
import { Trophy } from "lucide-react";

interface LeaderboardPlayer {
    rank: number;
    name: string;
    score: number;
    avatar?: string;
}

interface GameShowLeaderboardProps {
    onBackToGame: () => void;
}

const mockLeaderboard: LeaderboardPlayer[] = [
    { rank: 1, name: "Nguyễn Minh Quân", score: 15420 },
    { rank: 2, name: "Lê Bảo Anh", score: 14850 },
    { rank: 3, name: "Trần Hoàng Nam", score: 13200 },
    { rank: 4, name: "Phạm Thùy Chi", score: 12910 },
    { rank: 5, name: "Đỗ Tuấn Tú", score: 12850 },
];

export default function GameShowLeaderboard({ onBackToGame }: GameShowLeaderboardProps) {
    const getMedalIcon = (rank: number) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return rank;
    };

    const getMedalColor = (rank: number) => {
        if (rank === 1) return "text-[#FFD700]";
        if (rank === 2) return "text-[#C0C0C0]";
        if (rank === 3) return "text-[#CD7F32]";
        return "text-[#0A2463]/40";
    };

    return (
        <div className="min-h-screen bg-[#EAF6FF] relative overflow-hidden">
            <AppHeader />

            {/* Bubbles Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-12 h-12 left-[10%] top-[20%] bg-white/40 border border-white/60 rounded-full shadow-inner"></div>
                <div className="absolute w-20 h-20 left-[80%] top-[15%] bg-white/40 border border-white/60 rounded-full shadow-inner"></div>
                <div className="absolute w-16 h-16 left-[40%] top-[70%] bg-white/40 border border-white/60 rounded-full shadow-inner"></div>
                <div className="absolute w-8 h-8 left-[70%] top-[85%] bg-white/40 border border-white/60 rounded-full shadow-inner"></div>
                <div className="absolute w-24 h-24 left-[5%] top-[60%] bg-white/40 border border-white/60 rounded-full shadow-inner"></div>
                <div className="absolute top-32 left-1/4 text-5xl font-extrabold text-[#00AEEF] opacity-10 select-none" style={{ fontFamily: 'Baloo 2, cursive' }}>1 + 1 = 2</div>
                <div className="absolute bottom-32 right-1/4 text-5xl font-extrabold text-[#00AEEF] opacity-10 select-none" style={{ fontFamily: 'Baloo 2, cursive' }}>x &gt; y</div>
                <div className="absolute top-1/2 left-[10%] text-4xl font-extrabold text-[#00AEEF] opacity-10 select-none" style={{ fontFamily: 'Baloo 2, cursive' }}>¾</div>
            </div>

            <main className="relative z-10 container mx-auto px-4 pt-10 pb-20 flex gap-8 min-h-[calc(100vh-88px)]">
                {/* Sidebar */}
                <aside className="hidden lg:flex flex-col w-72 shrink-0">
                    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-xl h-fit">
                        <h2 className="text-[#0A2463] text-2xl font-black mb-6 px-2 uppercase tracking-wider" style={{ fontFamily: 'Baloo 2, cursive' }}>
                            NỘI DUNG
                        </h2>
                        <div className="space-y-4">
                            <button
                                onClick={onBackToGame}
                                className="w-full bg-[#FF9F1C] text-white font-bold py-5 px-6 rounded-2xl flex items-center justify-between shadow-lg shadow-orange-500/20 hover:brightness-105 transition-all border-b-[6px] border-[#e68a00] hover:border-b-[2px] hover:translate-y-1 active:translate-y-1.5"
                            >
                                <span className="uppercase tracking-widest text-lg">GAME SHOW</span>
                                <span className="text-2xl">🎮</span>
                            </button>
                            <button
                                className="w-full bg-[#00A8E8] text-white font-bold py-5 px-6 rounded-2xl flex items-center justify-between shadow-lg shadow-blue-500/20 hover:brightness-105 transition-all border-b-[6px] border-[#0084b5] hover:border-b-[2px] hover:translate-y-1 active:translate-y-1.5"
                            >
                                <span className="uppercase tracking-widest text-lg">BXH</span>
                                <span className="text-2xl">📊</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <section className="flex-grow">
                    <div className="shadow-[0_20px_50px_rgba(0,174,239,0.1)] bg-white rounded-3xl p-10 border border-white/60 w-full relative overflow-hidden h-full flex flex-col">
                        <h1 className="text-3xl md:text-4xl font-black text-[#0A2463] mb-8 uppercase tracking-widest text-center" style={{ fontFamily: 'Baloo 2, cursive' }}>
                            BẢNG XẾP HẠNG THÀNH TÍCH
                        </h1>

                        <div className="flex-grow space-y-4 mb-8">
                            {mockLeaderboard.map((player) => (
                                <div
                                    key={player.rank}
                                    className="bg-[#FFE5E5] rounded-2xl p-4 flex items-center justify-between border border-red-100/50 shadow-sm hover:translate-x-2 transition-transform"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`flex items-center justify-center w-12 font-black text-4xl ${getMedalColor(player.rank)}`}>
                                            {getMedalIcon(player.rank)}
                                        </div>
                                        <span className="font-black text-[#0A2463] text-lg w-16 uppercase" style={{ fontFamily: 'Baloo 2, cursive' }}>
                                            TOP {player.rank}
                                        </span>
                                        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                                            {player.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-[#0A2463] text-xl">{player.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-2xl text-[#0A2463]" style={{ fontFamily: 'Baloo 2, cursive' }}>
                                            {player.score.toLocaleString()}
                                        </span>
                                        <span className="text-xs font-bold text-[#0A2463]/60 uppercase">ĐIỂM</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-[#0A2463]/5">
                            <div className="flex items-center gap-8">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        defaultChecked
                                        className="w-5 h-5 border-2 border-[#0A2463]/20 text-[#FF9F1C] focus:ring-[#FF9F1C]"
                                        name="filter"
                                        type="radio"
                                    />
                                    <span className="font-bold text-[#0A2463] uppercase tracking-wider text-sm">TỈNH</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        className="w-5 h-5 border-2 border-[#0A2463]/20 text-[#FF9F1C] focus:ring-[#FF9F1C]"
                                        name="filter"
                                        type="radio"
                                    />
                                    <span className="font-bold text-[#0A2463] uppercase tracking-wider text-sm">XÃ</span>
                                </label>
                            </div>
                            <div className="bg-[#0A2463]/5 px-6 py-3 rounded-full border border-[#0A2463]/10">
                                <p className="text-[#0A2463] font-bold text-sm tracking-wide uppercase">
                                    BẠN CẦN <span className="text-[#FF9F1C]">1000 ĐIỂM</span> ĐỂ VÀO BXH
                                </p>
                            </div>
                        </div>

                        {/* Decorative Icons */}
                        <div className="absolute top-10 left-10 opacity-5 pointer-events-none hidden md:block">
                            <span className="text-6xl">📐</span>
                        </div>
                        <div className="absolute top-10 right-10 opacity-5 pointer-events-none hidden md:block">
                            <span className="text-6xl">🧮</span>
                        </div>
                    </div>
                </section>
            </main>

            {/* Wave Footer */}
            <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none opacity-30 z-0">
                <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
                    <path d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#00AEEF" />
                </svg>
            </div>
        </div>
    );
}
