import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/app-header";
import { supabase } from "@/lib/supabase";

export default function PaymentCheckoutPage() {
    const [, navigate] = useLocation();
    const searchParams = new URLSearchParams(window.location.search);
    const plan = searchParams.get('plan') || 'monthly';
    const [isProcessing, setIsProcessing] = useState(false);

    // Define plan details

    const planDetails = {
        monthly: {
            price: "129.000 VNĐ",
            code: "TEN_THANHTOANGOITHANG_MATHUP",
            numericPrice: 129000,
            durationDays: 30
        },
        yearly: {
            price: "899.000 VNĐ",
            code: "TEN_THANHTOANGOINAM_MATHUP",
            numericPrice: 899000,
            durationDays: 365
        }
    };

    const details = planDetails[plan as keyof typeof planDetails] || planDetails.monthly;

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            const storedUser = localStorage.getItem('mathocean_user');
            if (storedUser) {
                const user = JSON.parse(storedUser);

                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(startDate.getDate() + details.durationDays);

                // Update localStorage immediately so UI reflects PRO status right away
                user.isPro = true;
                user.plan = plan;
                localStorage.setItem('mathocean_user', JSON.stringify(user));
                window.dispatchEvent(new Event('authChange'));

                // Also persist isPro into Supabase Auth user_metadata for reload persistence
                supabase.auth.updateUser({
                    data: { isPro: true, plan: plan }
                }).then(({ error }) => {
                    if (error) console.error('Auth metadata update error:', error);
                });

                // Save subscription record in DB (fire and forget)
                supabase.from('subscriptions').insert({
                    user_id: user.id,
                    plan_type: plan,
                    status: 'active',
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    price: details.numericPrice,
                    auto_renew: false
                }).then(({ error }) => {
                    if (error) console.error('Subscription insert error:', error);
                });
            }

            navigate(`/payment/success?plan=${plan}`);
        } catch (error) {
            console.error('Payment error:', error);
            navigate(`/payment/success?plan=${plan}`);
        } finally {
            setIsProcessing(false);
        }
    };

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
        .qr-container {
          background: #F0F4F8;
          border-radius: 24px;
          position: relative;
        }
        .qr-frame {
          position: relative;
          padding: 1rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .qr-corner {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 4px solid #0A2463;
        }
        .corner-tl { top: -10px; left: -10px; border-right: 0; border-bottom: 0; }
        .corner-tr { top: -10px; right: -10px; border-left: 0; border-bottom: 0; }
        .corner-bl { bottom: -10px; left: -10px; border-right: 0; border-top: 0; }
        .corner-br { bottom: -10px; right: -10px; border-left: 0; border-top: 0; }
        .floating-math {
          opacity: 0.1;
          user-select: none;
          pointer-events: none;
        }
        .text-navy-blue {
          color: #0A2463;
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
                <main className="relative z-10 container mx-auto px-4 py-12 pt-32 flex justify-center items-center min-h-[calc(100vh-88px)]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-10 md:p-14 w-full max-w-2xl relative overflow-hidden flex flex-col items-center shadow-2xl"
                    >
                        <div className="qr-container w-full aspect-square max-w-[400px] flex flex-col items-center justify-center p-12 mb-8">
                            <div className="relative mb-10">
                                <div className="qr-corner corner-tl"></div>
                                <div className="qr-corner corner-tr"></div>
                                <div className="qr-corner corner-bl"></div>
                                <div className="qr-corner corner-br"></div>
                                <div className="qr-frame">
                                    <motion.img
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                        alt="QR Code Payment"
                                        className="w-[200px] h-[200px] md:w-[250px] md:h-[250px] object-contain"
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MathUp-Payment-${details.numericPrice}VND`}
                                    />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-navy-blue font-extrabold text-xl md:text-2xl">SỐ TIỀN: {details.price}</p>
                                <p className="text-navy-blue font-extrabold text-sm md:text-base tracking-tight">
                                    NỘI DUNG: {details.code}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                onClick={() => navigate('/payment')}
                                className="bg-red-400 hover:bg-red-500 text-white px-12 py-3 rounded-full font-extrabold uppercase tracking-widest text-sm transition-all shadow-lg border-b-4 border-red-500"
                            >
                                QUAY LẠI
                            </Button>
                            <Button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="bg-green-500 hover:bg-green-600 focus:bg-green-600 text-white px-12 py-3 rounded-full font-extrabold uppercase tracking-widest text-sm transition-all shadow-lg border-b-4 border-green-600"
                            >
                                {isProcessing ? "ĐANG XỬ LÝ..." : "ĐÃ THANH TOÁN"}
                            </Button>
                        </div>

                        {/* Decorative Icons */}
                        <div className="absolute top-8 left-8 opacity-5 pointer-events-none hidden md:block">
                            <span className="material-symbols-outlined text-6xl text-navy-blue">account_balance_wallet</span>
                        </div>
                        <div className="absolute bottom-8 right-8 opacity-5 pointer-events-none hidden md:block">
                            <span className="material-symbols-outlined text-6xl text-navy-blue">qr_code_2</span>
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
