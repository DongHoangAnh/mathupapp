import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/app-header";

interface PricingCardProps {
    title: string;
    price: string;
    icon: string;
    features: string[];
    bgColor: string;
    textColor: string;
    iconBgColor: string;
    isPopular?: boolean;
    isSelected?: boolean;
    onSelect: () => void;
}

function PricingCard({
    title,
    price,
    icon,
    features,
    bgColor,
    textColor,
    iconBgColor,
    isPopular,
    isSelected,
    onSelect
}: PricingCardProps) {
    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className={`${bgColor} rounded-[2.5rem] p-8 ${isPopular ? 'border-4 border-secondary-custom scale-105 shadow-2xl' : 'border-2 border-transparent'
                } flex flex-col items-center relative overflow-hidden transition-all cursor-pointer`}
            onClick={onSelect}
        >
            {isPopular && (
                <div className="bg-secondary-custom text-white px-6 py-2 rounded-bl-3xl font-black text-xs tracking-widest uppercase absolute top-0 right-0">
                    PHỔ BIẾN
                </div>
            )}
            <div className={`mb-6 ${iconBgColor}`}>
                <span className="text-6xl drop-shadow-md">{icon}</span>
            </div>
            <h3 className="text-2xl font-black text-navy-blue-custom mb-1 font-display">{title}</h3>
            <div className={`text-3xl font-black ${textColor} mb-8 font-display`}>
                {price}
            </div>
            <ul className="space-y-4 w-full mb-10">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-navy-blue-custom font-bold text-sm">
                        <span className={`material-symbols-outlined ${textColor} text-xl`}>
                            {title === "GÓI FREE" ? "check_circle" : title === "GÓI THÁNG" ? "star" : "verified"}
                        </span>
                        {feature}
                    </li>
                ))}
            </ul>
            <Button
                className={`w-full mt-auto py-4 rounded-2xl font-black uppercase tracking-widest ${isSelected
                    ? 'bg-white text-navy-blue-custom border-2 border-gray-200'
                    : isPopular
                        ? 'bg-secondary-custom text-white shadow-secondary-custom'
                        : 'bg-white text-navy-blue-custom border-2 border-gray-200 hover:bg-gray-800 hover:text-white'
                    } transition-all`}
            >
                {isSelected ? "ĐÃ CHỌN" : "CHỌN GÓI"}
            </Button>
        </motion.div>
    );
}

export default function PaymentSelectionPage() {
    const [, navigate] = useLocation();
    const [selectedPlan, setSelectedPlan] = useState<string>("monthly");

    const pricingPlans = [
        {
            id: "free",
            title: "GÓI FREE",
            price: "0 VNĐ",
            icon: "🤿",
            features: [
                "Giới hạn 3 bài kiểm tra",
                "20% lộ trình học tập",
                "5 câu hỏi AI mỗi ngày",
                "Tự tạo bài kiểm tra",
                "Tính nhẩm không giới hạn"
            ],
            bgColor: "bg-soft-blue-custom",
            textColor: "text-primary-custom",
            iconBgColor: "text-primary-custom"
        },
        {
            id: "monthly",
            title: "GÓI THÁNG",
            price: "129.000 VNĐ",
            icon: "💎",
            features: [
                "Bài kiểm tra không giới hạn",
                "Hướng dẫn giải bằng AI",
                "Lộ trình học chi tiết",
                "Chatbot AI không giới hạn",
                "Mini-games không giới hạn",
                "Báo cáo học tập chuyên sâu"
            ],
            bgColor: "bg-white",
            textColor: "text-secondary-custom",
            iconBgColor: "text-secondary-custom",
            isPopular: true
        },
        {
            id: "yearly",
            title: "GÓI NĂM",
            price: "899.000 VNĐ",
            icon: "📦",
            features: [
                "Đầy đủ tính năng Gói Tháng",
                "Phân tích học lực định kỳ",
                "Lộ trình học tập dài hạn",
                "Ưu tiên hỗ trợ 24/7"
            ],
            bgColor: "bg-soft-coral-custom",
            textColor: "text-navy-blue-custom",
            iconBgColor: "text-navy-blue-custom"
        }
    ];

    const selectedPlanData = pricingPlans.find(p => p.id === selectedPlan);

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
          opacity: 0.1;
          user-select: none;
          pointer-events: none;
        }
        .bg-soft-blue-custom {
          background-color: rgba(214, 240, 255, 0.3);
        }
        .bg-soft-coral-custom {
          background-color: rgba(255, 229, 229, 0.3);
        }
        .text-secondary-custom {
          color: #FF9F1C;
        }
        .text-primary-custom {
          color: #00AEEF;
        }
        .text-navy-blue-custom {
          color: #0A2463;
        }
        .border-secondary-custom {
          border-color: #FF9F1C;
        }
        .bg-secondary-custom {
          background-color: #FF9F1C;
        }
        .shadow-secondary-custom {
          box-shadow: 0 10px 25px rgba(255, 159, 28, 0.3);
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
                    <div className="floating-math absolute bottom-32 right-1/4 text-5xl font-extrabold text-primary">x &gt; y</div>
                    <div className="floating-math absolute top-1/2 left-[10%] text-4xl font-extrabold text-primary">¾</div>
                </div>

                {/* Header */}
                <AppHeader />

                {/* Main Content */}
                <main className="relative z-10 container mx-auto px-4 py-10 pt-32 min-h-[calc(100vh-88px)]">
                    <div className="bg-white rounded-3xl p-10 border border-white/60 w-full relative overflow-hidden flex flex-col items-center shadow-2xl">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black text-navy-blue-custom mb-4 uppercase tracking-widest font-display text-center"
                        >
                            CHỌN GÓI HỌC CỦA BẠN
                        </motion.h1>
                        <p className="text-navy-blue-custom opacity-60 font-bold mb-12 uppercase tracking-widest">
                            Khám phá đại dương tri thức cùng MathUp
                        </p>

                        {/* Pricing Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-12">
                            {pricingPlans.map((plan, idx) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <PricingCard
                                        {...plan}
                                        isSelected={selectedPlan === plan.id}
                                        onSelect={() => setSelectedPlan(plan.id)}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Selected Plan Info */}
                        <div className="w-full flex flex-col items-center pt-8 border-t border-gray-200">
                            <div className="bg-gray-100 px-10 py-4 rounded-3xl mb-6 text-center">
                                <span className="text-navy-blue-custom font-bold uppercase tracking-widest text-sm">Gói đang chọn: </span>
                                <span className="text-secondary-custom font-black uppercase tracking-widest text-lg">
                                    {selectedPlanData?.title}
                                </span>
                            </div>

                            {selectedPlan !== "free" && (
                                <Button
                                    onClick={() => navigate(`/payment/checkout?plan=${selectedPlan}`)}
                                    className="bg-secondary-custom hover:brightness-110 text-white px-20 py-5 rounded-full font-black text-xl uppercase tracking-widest shadow-secondary-custom hover:scale-105 active:scale-95 transition-all border-b-4 border-orange-600"
                                >
                                    THANH TOÁN NGAY
                                </Button>
                            )}
                        </div>

                        {/* Decorative Icons */}
                        <div className="absolute top-10 left-10 opacity-5 pointer-events-none hidden md:block">
                            <span className="material-symbols-outlined text-6xl text-navy-blue">functions</span>
                        </div>
                        <div className="absolute top-10 right-10 opacity-5 pointer-events-none hidden md:block">
                            <span className="material-symbols-outlined text-6xl text-navy-blue">calculate</span>
                        </div>
                    </div>
                </main>

                {/* Wave Bottom */}
                <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none opacity-30">
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
