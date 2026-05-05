import { motion } from "framer-motion";
import AppHeader from "@/components/app-header";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function ParentWeakPoints() {
    const [, navigate] = useLocation();
    const [, params] = useRoute("/parent/children/:id/weak-points");
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

    const weakTopics = [
        { name: "Phép Nhân", gap: 40 },
        { name: "Phép Chia", gap: 40 }
    ];

    const allTopics = [
        { name: "Phép Cộng", gap: 5, color: "green" },
        { name: "Phép Chia", gap: 65, color: "red" },
        { name: "Phép Trừ", gap: 40, color: "yellow" },
        { name: "Phân Số", gap: 50, color: "yellow" },
        { name: "Phép Nhân", gap: 60, color: "red" },
        { name: "Tính Nhanh", gap: 5, color: "green" }
    ];

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

                {/* Header */}
                <header className="relative z-10 container mx-auto px-6 pt-32 pb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[#0A2463] text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-2"
                    >
                        ĐIỂM CẦN LƯU Ý VỚI CÁC EM
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-[#0A2463]/70 font-semibold"
                    >
                        Xem các chủ đề yếu và khoảng trống kiến thức của học sinh để tập trung luyện tập.
                    </motion.p>
                </header>

                <main className="relative z-10 container mx-auto px-6 pb-20">
                    {/* Top Weak Areas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {weakTopics.map((topic, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="content-card bg-white rounded-3xl p-8 border border-white/60"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-display text-2xl font-bold">{topic.name}</span>
                                    <span className="font-bold text-[#0A2463]">{topic.gap}%</span>
                                </div>
                                <div className="w-full h-5 bg-[#0A2463]/10 rounded-full overflow-hidden mb-4">
                                    <div className="h-full bg-[#0A2463]" style={{ width: `${topic.gap}%` }}></div>
                                </div>
                                <p className="text-sm font-bold text-[#0A2463]/60 uppercase tracking-wide">
                                    Chủ Đề Này Học Sinh Cần Luyện Tập Nhiều Hơn
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* All Topics Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-300/50 rounded-3xl p-10 border border-slate-200"
                    >
                        <h2 className="font-display text-3xl font-bold mb-8 text-[#0A2463]">Tổng Quát</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {allTopics.map((topic, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + (index * 0.05) }}
                                    className="content-card bg-white rounded-2xl p-6 flex flex-col justify-center"
                                >
                                    <span className="font-bold text-lg mb-2">{topic.name}</span>
                                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                                        <div
                                            className={`h-full ${topic.color === 'green' ? 'bg-green-500' : topic.color === 'red' ? 'bg-red-500' : 'bg-yellow-400'}`}
                                            style={{ width: `${topic.gap}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-500">Gap: {topic.gap}%</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/parent/children/${params?.id}`)}
                        className="mt-8 bg-[#00AEEF] hover:bg-[#0092c8] text-white px-8 py-3 rounded-xl font-extrabold flex items-center space-x-2 shadow-lg transition-all"
                    >
                        <ArrowLeft size={20} strokeWidth={3} />
                        <span className="uppercase tracking-wider">Quay Lại</span>
                    </motion.button>
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
