import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/app-header";

export default function PaymentSuccessPage() {
    const [, navigate] = useLocation();
    const searchParams = new URLSearchParams(window.location.search);
    const plan = searchParams.get('plan') || 'monthly';
    const planName = plan === 'yearly' ? 'GÓI NĂM' : 'GÓI THÁNG';

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Baloo+2:wght@500;600;700;800&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <style>{`
        body {
          font-family: 'Nunito', sans-serif;
          overflow-x: hidden;
          background-color: #EAF6FF;
        }
        h1, h2, h3, .font-display {
          font-family: 'Baloo 2', cursive;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
        }
        .bubble {
          position: absolute;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          pointer-events: none;
          box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.05), inset 5px 5px 10px rgba(255, 255, 255, 0.8);
        }
        .floating-math {
          opacity: 0.15;
          user-select: none;
          pointer-events: none;
        }
        .treasure-container {
          position: relative;
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: rotate 20s linear infinite;
        }
      `}</style>

            <div className="min-h-screen">
                {/* Floating Bubbles Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="bubble w-12 h-12 left-[10%] top-[20%]"></div>
                    <div className="bubble w-20 h-20 left-[80%] top-[15%]"></div>
                    <div className="bubble w-16 h-16 left-[40%] top-[70%]"></div>
                    <div className="bubble w-8 h-8 left-[70%] top-[85%]"></div>
                    <div className="bubble w-24 h-24 left-[5%] top-[60%]"></div>
                    <div className="floating-math absolute top-32 left-1/4 text-5xl font-extrabold text-primary">1 + 1 = 2</div>
                    <div className="floating-math absolute bottom-32 right-1/4 text-5xl font-extrabold text-primary">3/4</div>
                    <div className="floating-math absolute top-1/2 left-[8%] text-4xl font-extrabold text-primary">√9 = 3</div>
                    <div className="floating-math absolute top-[20%] right-[10%] text-4xl font-extrabold text-primary">5 x 2</div>
                </div>

                {/* Header */}
                <AppHeader />

                {/* Main Content */}
                <main className="relative z-10 container mx-auto px-4 py-12 pt-32 flex justify-center items-center min-h-[calc(100vh-88px)]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="bg-white rounded-3xl p-10 md:p-14 w-full max-w-2xl relative overflow-hidden flex flex-col items-center shadow-2xl"
                    >
                        {/* Success Title */}
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-center mb-8"
                        >
                            <h1 className="text-navy-blue text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                                THANH TOÁN THÀNH CÔNG!
                            </h1>
                            <p className="text-navy-blue text-lg md:text-xl font-body font-semibold">
                                Gói thành viên hiện tại: <span className="text-primary font-extrabold">{planName}</span>
                            </p>
                        </motion.div>

                        {/* Treasure Icon with Animations */}
                        <div className="treasure-container mb-12 flex justify-center items-center">
                            <div className="relative w-64 h-64 flex items-center justify-center">
                                <div className="absolute inset-0 bg-blue-50 rounded-full scale-110 opacity-50 blur-xl animate-pulse"></div>

                                {/* Main Icon - Using Emoji */}
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="relative z-10 text-[160px]"
                                >
                                    📦
                                </motion.div>

                                {/* Floating Math Symbols */}
                                <motion.div
                                    animate={{ y: [-10, 10, -10], rotate: [-15, -15, -15] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute -top-4 -left-4 bg-white p-2 rounded-xl shadow-lg border-2 border-primary"
                                >
                                    <span className="text-primary font-bold">1+1=2</span>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [10, -10, 10], rotate: [10, 10, 10] }}
                                    transition={{ duration: 2.5, repeat: Infinity }}
                                    className="absolute top-0 -right-4 bg-white p-2 rounded-xl shadow-lg border-2 border-secondary"
                                >
                                    <span className="text-secondary font-bold">3/4</span>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [-5, 15, -5], rotate: [-5, -5, -5] }}
                                    transition={{ duration: 3.5, repeat: Infinity }}
                                    className="absolute -bottom-2 -left-2 bg-white p-2 rounded-xl shadow-lg border-2 border-green-400"
                                >
                                    <span className="text-green-500 font-bold">π</span>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [15, -5, 15], rotate: [20, 20, 20] }}
                                    transition={{ duration: 2.8, repeat: Infinity }}
                                    className="absolute bottom-4 -right-8 bg-white p-2 rounded-xl shadow-lg border-2 border-purple-400"
                                >
                                    <span className="text-purple-500 font-bold">x+y</span>
                                </motion.div>

                                {/* Sparkles */}
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute top-4 left-0 text-yellow-400 text-3xl"
                                >
                                    ✨
                                </motion.div>
                                <motion.div
                                    animate={{ scale: [1.3, 1, 1.3], opacity: [1, 0.8, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute bottom-12 right-0 text-yellow-400 text-2xl"
                                >
                                    ✨
                                </motion.div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                        >
                            <Button
                                onClick={() => navigate('/')}
                                className="bg-[#FF9F1C] hover:bg-[#E68A0A] text-white px-16 py-5 rounded-full font-extrabold uppercase tracking-widest text-lg md:text-xl transition-all shadow-xl border-b-4 border-[#CC7700] hover:scale-105"
                            >
                                BẮT ĐẦU HỌC NGAY
                            </Button>
                        </motion.div>

                        {/* Decorative Icons */}
                        <div className="absolute top-8 left-8 opacity-5 pointer-events-none hidden md:block">
                            <span className="material-symbols-outlined text-6xl text-navy-blue">celebration</span>
                        </div>
                        <div className="absolute bottom-8 right-8 opacity-5 pointer-events-none hidden md:block">
                            <span className="material-symbols-outlined text-6xl text-navy-blue">workspace_premium</span>
                        </div>
                    </motion.div>
                </main>

                {/* Wave Bottom */}
                <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none opacity-20">
                    <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
                        <path
                            d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                            fill="#00AEEF"
                        />
                    </svg>
                </div>
            </div>
        </>
    );
}
