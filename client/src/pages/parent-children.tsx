import { motion } from "framer-motion";
import AppHeader from "@/components/app-header";
import { useLocation } from "wouter";
import { Star, GraduationCap, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function ParentChildren() {
    const [, navigate] = useLocation();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check if user is parent
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

    if (!user) {
        return null;
    }

    const children = [
        {
            id: 1,
            name: "Thanh Nga",
            username: "@thanhnga",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVr7sQ0MkIJTNkFXC_ccNNhQ_MfH5-3L_i7oTEDt7IiN4vE4fU82f2gF11O2keONAlTLMBwaaMBLn0pcBrGcHJC6rijsOnE7KrE-D-sj7mYzw0OpUTfgKJBstxNweYWlIFHQn3FNqlHPsklSpDe9AYkS-Zjdq_0uKsQtF_zHqo0_HSLYQ7WwR-F7aBEml-D8PB6T8x6Yvik2ZsHYsrqOinxQESaEVsW1F5dgAY_ovBzjqWxvKu98KsiWnlaq2yuwJfAO3NKbaVPoM",
            points: 1250,
            grade: "3A2"
        },
        {
            id: 2,
            name: "Hoàng Việt",
            username: "@hoangviet",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUek0DdEJUKDctNitegpUjddW2Hnw3Hyk8_Ne6z5J6s0PC20Tz__htlcdLw038lZK7-rZfofSNMUSiX1qdf26OhdAad4SXKCeAmNdZBBgRVNCqpPSVxtyYX4AXSGM9pvuW61z-NMRvpfRQkbE-I_YWgst7jDG81PaaVPu7bBc4vvqy6XXKvWiHameRBVHTWTeZYWHBrOiaCxqtqViziJIDhAgd2b5hkIRXPnW5OhVfna825dQiBWzfrlbRu0BM_f3WZEeGDohqesE",
            points: 750,
            grade: "6A1"
        }
    ];

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Baloo+2:wght@500;600;700;800&display=swap" rel="stylesheet" />
            <style>{`
                body {
                    font-family: 'Nunito', sans-serif;
                    overflow-x: hidden;
                    background-color: #EAF6FF;
                }
                h1, h2, h3, .font-display {
                    font-family: 'Baloo 2', cursive;
                }
                .bubble {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    border-radius: 50%;
                    pointer-events: none;
                    box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.05), inset 5px 5px 10px rgba(255, 255, 255, 0.8);
                }
                .content-card {
                    box-shadow: 0 20px 50px rgba(0, 174, 239, 0.1);
                }
                .btn-pill-3d {
                    transition: all 0.2s;
                    box-shadow: 0 4px 0 #CC7F16;
                }
                .btn-pill-3d:active {
                    transform: translateY(2px);
                    box-shadow: 0 1px 0 #CC7F16;
                }
                .floating-math {
                    opacity: 0.15;
                    user-select: none;
                    pointer-events: none;
                }
            `}</style>

            <div className="min-h-screen text-[#0A2463]">
                {/* Background Bubbles */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="bubble w-12 h-12 left-[10%] top-[20%]"></div>
                    <div className="bubble w-20 h-20 left-[80%] top-[15%]"></div>
                    <div className="bubble w-16 h-16 left-[40%] top-[70%]"></div>
                    <div className="bubble w-8 h-8 left-[70%] top-[85%]"></div>
                    <div className="bubble w-24 h-24 left-[5%] top-[60%]"></div>

                    {/* Floating Math Symbols */}
                    <div className="floating-math absolute top-32 left-1/4 text-5xl font-extrabold text-[#00AEEF]">1 + 1 = 2</div>
                    <div className="floating-math absolute bottom-32 right-1/4 text-5xl font-extrabold text-[#00AEEF]">3/4</div>
                    <div className="floating-math absolute top-1/2 left-[8%] text-4xl font-extrabold text-[#00AEEF]">√9 = 3</div>
                    <div className="floating-math absolute top-[20%] right-[10%] text-4xl font-extrabold text-[#00AEEF]">5 x 2</div>
                </div>

                {/* Header */}
                <AppHeader />

                {/* Main Content */}
                <main className="relative z-10 container mx-auto px-4 py-12 pt-32 flex justify-center items-center min-h-[calc(100vh-88px)]">
                    <div className="content-card bg-white rounded-3xl p-10 md:p-14 w-full max-w-4xl relative overflow-hidden flex flex-col items-center">
                        {/* Title */}
                        <div className="text-center mb-10">
                            <motion.h1
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[#0A2463] text-3xl md:text-4xl font-extrabold tracking-tight uppercase"
                            >
                                DANH SÁCH TÀI KHOẢN CON
                            </motion.h1>
                        </div>

                        {/* Children Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-4">
                            {children.map((child, index) => (
                                <motion.div
                                    key={child.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-[#FFEFEA] rounded-2xl p-8 flex flex-col items-center text-center shadow-sm"
                                >
                                    {/* Avatar */}
                                    <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-md mb-4 bg-white">
                                        <img
                                            alt={`${child.name} Avatar`}
                                            className="w-full h-full object-cover"
                                            src={child.avatar}
                                        />
                                    </div>

                                    {/* Name & Username */}
                                    <h3 className="text-2xl font-bold text-[#0A2463] mb-1">{child.name}</h3>
                                    <p className="text-[#00AEEF] font-bold mb-4">{child.username}</p>

                                    {/* Stats */}
                                    <div className="space-y-2 mb-8 w-full">
                                        <div className="flex items-center justify-center space-x-2 text-[#0A2463]">
                                            <Star className="text-[#FF9F1C]" size={20} fill="#FF9F1C" />
                                            <span className="font-bold">{child.points.toLocaleString()} điểm</span>
                                        </div>
                                        <div className="flex items-center justify-center space-x-2 text-[#0A2463]">
                                            <GraduationCap className="text-[#00AEEF]" size={20} />
                                            <span className="font-bold">Lớp: {child.grade}</span>
                                        </div>
                                    </div>

                                    {/* Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate(`/parent/children/${child.id}`)}
                                        className="btn-pill-3d bg-[#FF9F1C] text-white px-8 py-3 rounded-full font-extrabold tracking-widest text-sm hover:brightness-105 transition-all"
                                    >
                                        XEM CHI TIẾT
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Add Child Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-8"
                        >
                            <button
                                onClick={() => navigate('/parent/add-child')}
                                className="text-[#0A2463] font-bold flex items-center space-x-2 hover:text-[#00AEEF] transition-colors"
                            >
                                <PlusCircle size={24} />
                                <span>Thêm tài khoản con</span>
                            </button>
                        </motion.div>

                        {/* Decorative Icons */}
                        <div className="absolute top-8 left-8 opacity-5 pointer-events-none hidden lg:block">
                            <span className="text-6xl">👨‍👩‍👧‍👦</span>
                        </div>
                        <div className="absolute bottom-8 right-8 opacity-5 pointer-events-none hidden lg:block">
                            <span className="text-6xl">🎓</span>
                        </div>
                    </div>
                </main>

                {/* Bottom Wave */}
                <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none opacity-20">
                    <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
                        <path
                            d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                            fill="#00AEEF"
                        ></path>
                    </svg>
                </div>
            </div>
        </>
    );
}
