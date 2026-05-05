import { motion } from "framer-motion";
import AppHeader from "@/components/app-header";
import { useLocation, useRoute } from "wouter";
import { TrendingUp, BookOpen, Trophy, Flame, Map, Bell, ArrowLeft, Droplet, Target, Lock, Ship } from "lucide-react";
import { useEffect, useState } from "react";

export default function ParentChildDetail() {
    const [, navigate] = useLocation();
    const [, params] = useRoute("/parent/children/:id");
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('mathocean_user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.role !== 'parent') {
                navigate('/');
                return;
            }
            setUser(userData);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    if (!user) return null;

    const childData = {
        name: "Thanh Nga",
        level: 3,
        xp: 320,
        maxXp: 500,
        streak: 7,
        topics: [
            { name: "Phương trình bậc hai", progress: 100, status: "Đã hoàn thành - 12 bài học", color: "green" },
            { name: "Hàm số bậc nhất", progress: 53, status: "Đang học - 8/15 bài học", color: "primary" },
            { name: "Hình học không gian", progress: 0, status: "Chưa bắt đầu", color: "gray" }
        ],
        challenges: [
            { name: "Giải 15 Bài Toán", current: 9, total: 15 },
            { name: "Chuỗi 7 Ngày", current: 5, total: 7 }
        ]
    };

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Baloo+2:wght@500;600;700;800&display=swap" rel="stylesheet" />
            <style>{`
                body { font-family: 'Nunito', sans-serif; overflow-x: hidden; background-color: #EAF6FF; }
                h1, h2, h3, .font-display { font-family: 'Baloo 2', cursive; }
                .bubble { position: absolute; background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(255, 255, 255, 0.6); border-radius: 50%; pointer-events: none; box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.05), inset 5px 5px 10px rgba(255, 255, 255, 0.8); }
                .content-card { box-shadow: 0 10px 30px rgba(10, 36, 99, 0.05); }
                .floating-math { opacity: 0.1; user-select: none; pointer-events: none; }
            `}</style>

            <div className="min-h-screen text-[#0A2463]">
                {/* Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="bubble w-12 h-12 left-[5%] top-[15%]"></div>
                    <div className="bubble w-20 h-20 left-[85%] top-[10%]"></div>
                    <div className="bubble w-16 h-16 left-[45%] top-[80%]"></div>
                    <div className="bubble w-8 h-8 left-[75%] top-[90%]"></div>
                    <div className="bubble w-24 h-24 left-[2%] top-[65%]"></div>
                    <div className="floating-math absolute top-40 left-10 text-4xl font-extrabold text-[#00AEEF]">Σ</div>
                    <div className="floating-math absolute bottom-20 right-20 text-5xl font-extrabold text-[#00AEEF]">π</div>
                    <div className="floating-math absolute top-1/2 left-[5%] text-4xl font-extrabold text-[#00AEEF]">x + y</div>
                    <div className="floating-math absolute top-[30%] right-[5%] text-4xl font-extrabold text-[#00AEEF]">∞</div>
                </div>

                <AppHeader />

                {/* Header Section */}
                <header className="relative z-10 container mx-auto px-6 pt-32 pb-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[#0A2463] text-3xl md:text-5xl font-extrabold uppercase tracking-tight flex items-center gap-4"
                        >
                            <span className="text-4xl">👤</span>
                            CHI TIẾT HỌC SINH: <span className="text-[#00AEEF]">{childData.name.toUpperCase()}</span>
                        </motion.h1>
                    </div>
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/parent/children/${params?.id}/weak-points`)}
                        className="bg-[#FF7F6A]/10 text-[#FF7F6A] border-2 border-[#FF7F6A] px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-[#FF7F6A] hover:text-white transition-all"
                    >
                        <Bell size={20} />
                        Điểm cần lưu ý
                    </motion.button>
                </header>

                <main className="relative z-10 container mx-auto px-6 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-7 space-y-8">
                            {/* Progress Chart */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="content-card bg-white rounded-3xl p-8 border border-white/60"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <TrendingUp className="text-[#00AEEF]" size={28} />
                                        Tiến Trình Học
                                    </h2>
                                    <span className="px-3 py-1 bg-[#D6F0FF] text-[#00AEEF] text-xs font-bold rounded-full">Tháng này</span>
                                </div>
                                <div className="h-64 w-full relative">
                                    <svg className="w-full h-full" viewBox="0 0 400 150">
                                        <path d="M0,130 Q50,110 80,120 T150,80 T220,90 T300,40 T400,20" fill="none" stroke="#00AEEF" strokeLinecap="round" strokeWidth="4"></path>
                                        <path d="M0,130 Q50,110 80,120 T150,80 T220,90 T300,40 T400,20 V150 H0 Z" fill="url(#grad1)" opacity="0.1"></path>
                                        <defs>
                                            <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                                                <stop offset="0%" style={{ stopColor: "#00AEEF", stopOpacity: 1 }}></stop>
                                                <stop offset="100%" style={{ stopColor: "#00AEEF", stopOpacity: 0 }}></stop>
                                            </linearGradient>
                                        </defs>
                                        <circle cx="80" cy="120" fill="#00AEEF" r="4"></circle>
                                        <circle cx="150" cy="80" fill="#00AEEF" r="4"></circle>
                                        <circle cx="300" cy="40" fill="#00AEEF" r="4"></circle>
                                    </svg>
                                    <div className="absolute bottom-0 w-full flex justify-between text-[10px] font-bold text-gray-400 mt-2">
                                        <span>Tuần 1</span><span>Tuần 2</span><span>Tuần 3</span><span>Tuần 4</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Topics */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="content-card bg-white rounded-3xl p-8 border border-white/60"
                            >
                                <h2 className="text-2xl font-bold flex items-center gap-2 mb-8">
                                    <BookOpen className="text-[#FF9F1C]" size={28} />
                                    Chủ Đề Học
                                </h2>
                                <div className="space-y-6">
                                    {childData.topics.map((topic, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className={`bg-gray-50 rounded-2xl p-6 border border-gray-100 ${topic.progress === 0 ? 'opacity-60' : ''}`}
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-bold text-lg">{topic.name}</span>
                                                <span className={`font-black ${topic.color === 'green' ? 'text-green-500' : topic.color === 'primary' ? 'text-[#00AEEF]' : 'text-gray-400'}`}>
                                                    {topic.progress}%
                                                </span>
                                            </div>
                                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${topic.color === 'green' ? 'bg-green-500' : topic.color === 'primary' ? 'bg-[#00AEEF]' : 'bg-gray-300'}`}
                                                    style={{ width: `${topic.progress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">{topic.status}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-5 space-y-8">
                            {/* Level Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="content-card bg-gradient-to-br from-[#00AEEF] to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="font-display text-3xl font-bold">Cấp độ {childData.level}</h3>
                                            <p className="text-white/80 font-bold">Thám hiểm đại dương</p>
                                        </div>
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-center">
                                            <span className="block text-2xl font-black">{childData.streak}</span>
                                            <span className="text-[10px] uppercase font-bold">Chuỗi ngày</span>
                                        </div>
                                    </div>
                                    <div className="mb-2 flex justify-between text-sm font-bold">
                                        <span>{childData.xp} / {childData.maxXp} XP</span>
                                        <span>Level {childData.level + 1}</span>
                                    </div>
                                    <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white" style={{ width: `${(childData.xp / childData.maxXp) * 100}%` }}></div>
                                    </div>
                                </div>
                                <Ship className="absolute -bottom-4 -right-4 text-white/10 rotate-12" size={120} />
                            </motion.div>

                            {/* Achievements */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="content-card bg-white rounded-3xl p-8 border border-white/60"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Trophy className="text-[#FF9F1C]" size={24} />
                                        Thành Tích
                                    </h2>
                                    <span className="text-xs font-bold text-gray-400 uppercase">2/12 Badges</span>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-2xl bg-[#FFF0EA] flex items-center justify-center shadow-inner group cursor-pointer hover:scale-105 transition-transform">
                                        <Droplet className="text-[#FF9F1C]" size={36} />
                                    </div>
                                    <div className="w-20 h-20 rounded-2xl bg-[#EAF6FF] flex items-center justify-center shadow-inner group cursor-pointer hover:scale-105 transition-transform">
                                        <Target className="text-[#00AEEF]" size={36} />
                                    </div>
                                    <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
                                        <Lock className="text-gray-300" size={24} />
                                    </div>
                                    <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
                                        <Lock className="text-gray-300" size={24} />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Weekly Challenge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="content-card bg-white rounded-3xl p-8 border border-white/60"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Flame className="text-[#FF7F6A]" size={24} />
                                        Thử Thách Tuần
                                    </h2>
                                    <span className="text-[10px] font-bold bg-[#FF7F6A]/10 text-[#FF7F6A] px-2 py-1 rounded">3 Ngày Còn Lại</span>
                                </div>
                                <div className="space-y-4">
                                    {childData.challenges.map((challenge, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span>{challenge.name}</span>
                                                <span>{challenge.current}/{challenge.total}</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#FF7F6A]" style={{ width: `${(challenge.current / challenge.total) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Knowledge Map */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="content-card bg-[#FFF0EA] rounded-3xl p-8 border border-white relative overflow-hidden h-48 flex items-center justify-center group cursor-pointer"
                            >
                                <div className="text-center z-10">
                                    <Map className="text-[#FF9F1C] mb-2 mx-auto group-hover:scale-110 transition-transform" size={48} />
                                    <h2 className="text-xl font-display font-bold text-[#0A2463]">Bản Đồ Tri Thức</h2>
                                    <p className="text-xs font-bold text-[#FF9F1C] uppercase tracking-widest">Khám phá ngay</p>
                                </div>
                            </motion.div>

                            {/* Back Button */}
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/parent/children')}
                                className="w-full bg-[#00AEEF] hover:bg-[#0092c8] text-white px-8 py-3 rounded-xl font-extrabold flex items-center justify-center space-x-2 shadow-lg transition-all"
                            >
                                <ArrowLeft size={20} strokeWidth={3} />
                                <span className="uppercase tracking-wider">Quay Lại</span>
                            </motion.button>
                        </div>
                    </div>
                </main>

                {/* Bottom Wave */}
                <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none opacity-20 z-0">
                    <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
                        <path d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#00AEEF"></path>
                    </svg>
                </div>
            </div>
        </>
    );
}
