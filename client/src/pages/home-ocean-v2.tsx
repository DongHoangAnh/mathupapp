import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import AppHeader from "@/components/app-header";
import { supabase } from "@/lib/supabase";

// Helper component for horizontal milestone
interface MilestoneProps {
    emoji: string;
    name: string;
    subtitle: string;
    number: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    unlocked: boolean;
    delay: number;
}

function Milestone({ emoji, name, subtitle, number, bgColor, textColor, borderColor, unlocked, delay }: MilestoneProps) {
    return (
        <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 120, damping: 10 }}
            className="flex flex-col items-center group relative"
        >
            {/* Circle */}
            <motion.div
                whileHover={{ scale: 1.15, y: -5 }}
                className={`w-24 h-24 md:w-28 md:h-28 ${unlocked ? bgColor : 'bg-gray-300'} rounded-full flex items-center justify-center shadow-2xl border-4 border-white cursor-pointer relative z-10 transition-all`}
                style={{
                    animation: unlocked ? 'float 3s ease-in-out infinite' : 'none'
                }}
            >
                <span className="text-4xl md:text-5xl filter drop-shadow-lg">{emoji}</span>
                <div className={`absolute -top-2 -right-2 w-8 h-8 bg-white ${unlocked ? textColor : 'text-gray-500'} rounded-full flex items-center justify-center font-black text-sm border-2 ${borderColor}`}>
                    {number}
                </div>
            </motion.div>

            {/* Label */}
            <div className={`mt-4 bg-white/90 backdrop-blur px-3 py-2 rounded-xl shadow-md border-2 ${borderColor} max-w-[140px] w-full text-center`}>
                <h3
                    className={`font-black ${textColor} leading-tight ${name.length > 20 ? 'text-[10px]' :
                        name.length > 14 ? 'text-xs' :
                            name.length > 9 ? 'text-sm' : 'text-base'
                        }`}
                    style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                >
                    {name}
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1">{subtitle}</p>
            </div>

            {/* Pulsing ring */}
            {unlocked && (
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute top-0 w-24 h-24 md:w-28 md:h-28 ${bgColor} rounded-full opacity-30`}
                />
            )}
        </motion.div>
    );
}

interface UserStats {
    total_points: number;
    lessons_completed: number;
    study_time_minutes: number;
    win_streak: number;
    total_wins: number;
    total_matches: number;
    best_rank: number | null;
    current_rank: number | null;
    achievements: { id: string; name: string; description: string; earned_at: string }[];
}

interface AssessmentAnalysis {

    overallScore: number;
    totalQuestions: number;
    correctAnswers: number;
    knowledgeTiles: Array<{
        id: string;
        name: string;
        strength: "strong" | "medium" | "weak";
        score: number;
        totalQuestions: number;
        correctAnswers: number;
        needsPractice: boolean;
        priority: number;
    }>;
    learningPath: Array<{
        order: number;
        topic: string;
        emoji: string;
        status: "current" | "upcoming" | "completed";
        estimatedWeeks: number;
        reason: string;
    }>;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    assessedAt?: string;
}

export default function HomeOceanV2() {
    const [, navigate] = useLocation();
    const [hasOnboarding, setHasOnboarding] = useState(false);
    const [lastAssessment, setLastAssessment] = useState<any | null>(null);
    const [knowledgeTiles, setKnowledgeTiles] = useState<any[]>([]);
    const [assessmentAnalysis, setAssessmentAnalysis] = useState<AssessmentAnalysis | null>(null);
    const [learningPathTopics, setLearningPathTopics] = useState<any[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    const heroImages = [
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600",
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600",
        "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600"
    ];

    useEffect(() => {
        try {
            const ob = localStorage.getItem("onboarding");
            if (ob) {
                setHasOnboarding(true);
            }
        } catch { }

        const loadAssessments = async () => {
            try {
                // === Ưu tiên đọc từ localStorage (dữ liệu AI vừa phân tích) ===
                const hasAssessmentFlag = localStorage.getItem('mathocean_has_assessment') === 'true';
                const cachedAnalysis = localStorage.getItem('mathocean_last_analysis');

                if (hasAssessmentFlag && cachedAnalysis) {
                    try {
                        const analysis: AssessmentAnalysis = JSON.parse(cachedAnalysis);
                        setAssessmentAnalysis(analysis);
                        setLastAssessment({ score: analysis.overallScore, assessedAt: analysis.assessedAt });
                        if (analysis.knowledgeTiles && analysis.knowledgeTiles.length > 0) {
                            setKnowledgeTiles(analysis.knowledgeTiles);
                        }
                        return; // Không cần fetch API nếu đã có cache
                    } catch (parseErr) {
                        console.warn('Failed to parse cached analysis:', parseErr);
                    }
                }

                // === Fallback: fetch từ API cũ nếu chưa có localStorage cache ===
                const storedUser = JSON.parse(localStorage.getItem('mathocean_user') || 'null');
                const userId = storedUser?.id || 'sample-user-1';
                const res = await fetch(`/api/user-assessment-results/${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setLastAssessment({ score: data.score, assessedAt: data.assessed_at });
                        setAssessmentAnalysis({
                            overallScore: data.score,
                            totalQuestions: data.total_questions,
                            correctAnswers: data.correct_answers,
                            knowledgeTiles: typeof data.knowledge_tiles === 'string' ? JSON.parse(data.knowledge_tiles) : (data.knowledge_tiles || []),
                            learningPath: typeof data.learning_path === 'string' ? JSON.parse(data.learning_path) : (data.learning_path || []),
                            summary: data.summary || '',
                            strengths: typeof data.strengths === 'string' ? JSON.parse(data.strengths) : (data.strengths || []),
                            weaknesses: typeof data.weaknesses === 'string' ? JSON.parse(data.weaknesses) : (data.weaknesses || [])
                        });
                        try {
                            const parsed = typeof data.knowledge_tiles === 'string' ? JSON.parse(data.knowledge_tiles) : (data.knowledge_tiles || []);
                            setKnowledgeTiles(Array.isArray(parsed) ? parsed : []);
                        } catch {
                            setKnowledgeTiles([]);
                        }
                    } else {
                        setLastAssessment(null);
                        setKnowledgeTiles([]);
                    }
                } else {
                    setLastAssessment(null);
                    setKnowledgeTiles([]);
                }
            } catch (e) {
                setLastAssessment(null);
                setKnowledgeTiles([]);
            }

            // Sync Learning Path
            try {
                const storedUser = JSON.parse(localStorage.getItem('mathocean_user') || 'null');
                const userId = storedUser?.id || 'sample-user-1';
                const pathRes = await fetch(`/api/learning-paths/${userId}`);
                if (pathRes.ok) {
                    const pathData = await pathRes.json();
                    if (pathData && pathData.topics) {
                        setLearningPathTopics(pathData.topics);
                    }
                }
            } catch (e) {
                console.warn('Failed to fetch learning paths', e);
            }
        };
        loadAssessments();


        const loadUserStats = async () => {
            setLoadingStats(true);
            // Timeout 5s để tránh treo mãi nếu bảng chưa tồn tại
            const timeout = setTimeout(() => setLoadingStats(false), 5000);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setUserStats(null);
                    return;
                }

                // Fetch user_stats từ Supabase (bảng có thể chưa tồn tại)
                const { data, error } = await supabase
                    .from('user_stats')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (error || !data) {
                    // Bảng chưa có hoặc user chưa có row → hiển thị empty state
                    setUserStats({
                        total_points: 0,
                        lessons_completed: 0,
                        study_time_minutes: 0,
                        win_streak: 0,
                        total_wins: 0,
                        total_matches: 0,
                        best_rank: null,
                        current_rank: null,
                        achievements: []
                    });
                } else {
                    // Fetch achievements
                    const { data: achData } = await supabase
                        .from('user_achievements')
                        .select('achievement_id, achievement_name, achievement_description, earned_at')
                        .eq('user_id', user.id)
                        .order('earned_at', { ascending: false });

                    setUserStats({
                        total_points: data.total_points || 0,
                        lessons_completed: data.lessons_completed || 0,
                        study_time_minutes: data.study_time_minutes || 0,
                        win_streak: data.win_streak || 0,
                        total_wins: data.total_wins || 0,
                        total_matches: data.total_matches || 0,
                        best_rank: data.best_rank || null,
                        current_rank: data.current_rank || null,
                        achievements: (achData || []).map((a: any) => ({
                            id: a.achievement_id,
                            name: a.achievement_name,
                            description: a.achievement_description,
                            earned_at: a.earned_at
                        }))
                    });
                }
            } catch (e) {
                // Lỗi mạng hoặc bảng chưa tồn tại → show giá trị 0
                setUserStats({
                    total_points: 0, lessons_completed: 0, study_time_minutes: 0,
                    win_streak: 0, total_wins: 0, total_matches: 0,
                    best_rank: null, current_rank: null, achievements: []
                });
            } finally {
                clearTimeout(timeout);
                setLoadingStats(false);
            }
        };
        loadUserStats();

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const primaryCTA = useMemo(() => {
        if (!hasOnboarding) {
            return { label: "Cá Nhân Hóa", path: "/onboarding" };
        }
        if (lastAssessment) {
            return { label: "Lộ trình của bạn", path: "/learning" };
        }
        return { label: "Làm bài chẩn đoán", path: "/assessment" };
    }, [hasOnboarding, lastAssessment]);

    const resetDemo = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('mathocean_user') || 'null');
            const userId = storedUser?.id || 'sample-user-1';
            await fetch('/api/demo/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            // Clear frontend data explicitly so the dashboard resets
            localStorage.removeItem('onboarding');
            localStorage.removeItem('mathocean_has_assessment');
            localStorage.removeItem('mathocean_last_analysis');
            localStorage.removeItem('math_learning_duration');
            localStorage.removeItem('math_knowledge_map');
            window.location.reload();
        } catch (e) {
            navigate('/onboarding');
        }
    };

    const weakTopics = knowledgeTiles.filter(t => t.strength === 'weak');

    return (
        <>
            {/* Google Font Quicksand - Better Vietnamese Support */}
            <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <style>{`
        * {
          font-family: 'Quicksand', 'Nunito', sans-serif !important;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-20px); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        .particle {
          position: absolute;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: particle-float 8s ease-in-out infinite;
        }
        
        @keyframes particle-float {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-150px) scale(1); opacity: 0; }
        }
      `}</style>

            <div className="min-h-screen relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 50%, #FEF3C7 100%)'
            }}>
                {/* Animated particles */}
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            bottom: 0,
                            width: `${4 + Math.random() * 8}px`,
                            height: `${4 + Math.random() * 8}px`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 5}s`
                        }}
                    />
                ))}

                {/* Unified Header */}
                <AppHeader />

                {/* Hero Section */}
                <div className="relative z-10 pt-32 pb-16">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-6"
                            >
                                {/* Badge */}
                                <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border-3 border-[#32E0C4] text-[#0F4C75] font-black text-sm shadow-lg"
                                >
                                    <span className="text-xl">✨</span>
                                    Học Toán Vui Nhộn Cho Bé
                                </motion.div>

                                {/* Title */}
                                <h1 className="font-black text-5xl md:text-7xl leading-tight">
                                    <motion.span
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="block text-[#0F4C75]"
                                    >
                                        CHÀO MỪNG
                                    </motion.span>
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4, type: "spring" }}
                                        className="block text-[#00A8E8] relative inline-block mt-2"
                                    >
                                        BÉ YÊU!
                                        <svg className="absolute -bottom-2 left-0 w-full h-6 text-[#FF9F1C]" preserveAspectRatio="none" viewBox="0 0 100 15">
                                            <motion.path
                                                d="M0 8 Q 50 15 100 8"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeWidth="8"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ delay: 0.6, duration: 0.8 }}
                                            />
                                        </svg>
                                    </motion.span>
                                </h1>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-xl md:text-2xl text-slate-600 font-semibold max-w-md leading-relaxed"
                                >
                                    Khám phá đại dương tri thức, chinh phục các con số và trở thành nhà thám hiểm toán học tài ba!
                                </motion.p>

                                {/* CTA Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1 }}
                                    className="flex flex-wrap gap-4 pt-4"
                                >
                                    <Button
                                        onClick={() => navigate(primaryCTA.path)}
                                        className="bg-[#00A8E8] hover:bg-[#007BA8] text-white font-black py-4 px-10 rounded-full text-xl shadow-2xl hover:shadow-xl transition-all hover:-translate-y-1 border-b-[6px] border-[#0066A8] flex items-center gap-3"
                                    >
                                        <span className="text-3xl">✏️</span> {primaryCTA.label}
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/gameshow')}
                                        className="bg-white hover:bg-gray-50 text-[#FF9F1C] border-4 border-[#FF9F1C] font-black py-4 px-10 rounded-full text-xl shadow-2xl hover:shadow-xl transition-all flex items-center gap-3"
                                    >
                                        <span className="text-3xl">🏆</span> Gameshow
                                    </Button>
                                </motion.div>

                                {hasOnboarding && (
                                    <div className="mt-6 text-slate-500 font-bold">
                                        Muốn bắt đầu lại? <button className="underline text-[#00A8E8] hover:text-[#007BA8]" onClick={resetDemo}>Reset demo</button>
                                    </div>
                                )}
                            </motion.div>

                            {/* Hero Image with rotation */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 1, type: "spring" }}
                                className="relative"
                                style={{ animation: 'float 4s ease-in-out infinite' }}
                            >
                                <div className="relative w-full aspect-square max-w-lg mx-auto">
                                    <div className="absolute inset-0 bg-[#00A8E8]/20 rounded-full transform scale-110 blur-3xl"></div>

                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-white rounded-[3rem] shadow-2xl border-[6px] border-white rotate-6"></div>
                                    <div className="absolute inset-0 bg-white rounded-[3rem] shadow-2xl border-[6px] border-white -rotate-6 overflow-hidden">
                                        {heroImages.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Math ${idx + 1}`}
                                                className={`absolute w-full h-full object-cover transition-all duration-1000 ${idx === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    <motion.div
                                        animate={{ rotate: [0, 10, 0], y: [0, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -top-8 -right-8 w-20 h-20 bg-[#FF9F1C] rounded-3xl flex items-center justify-center shadow-2xl border-[6px] border-white text-white font-black text-3xl"
                                    >
                                        10+
                                    </motion.div>

                                    <div className="absolute -bottom-6 -left-6 bg-white px-6 py-4 rounded-2xl shadow-2xl border-4 border-gray-100 flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse"></div>
                                        <span className="font-black text-[#0F4C75] text-lg">Đang học...</span>
                                    </div>

                                    {/* Image dots */}
                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                                        {heroImages.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`h-3 rounded-full transition-all ${idx === currentImageIndex ? 'bg-[#00A8E8] w-8' : 'bg-gray-300 w-3'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Roadmap Section - HORIZONTAL: chỉ hiển thị khi đã có assessment */}
                {(hasOnboarding && lastAssessment) ? (
                    <div className="relative z-10 py-20">
                        <div className="max-w-7xl mx-auto px-6">
                            {/* Title */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="text-center mb-16"
                            >
                                <h2 className="font-black text-5xl md:text-6xl text-[#0F4C75] mb-6">
                                    HÀNH TRÌNH CHINH PHỤC
                                </h2>
                                <div className="w-40 h-3 bg-[#FF9F1C]/30 rounded-full mx-auto relative overflow-hidden">
                                    <motion.div
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute top-0 h-full w-1/2 bg-[#FF9F1C] rounded-full"
                                    />
                                </div>
                            </motion.div>

                            {/* Horizontal Roadmap */}
                            <div className="relative bg-white/50 backdrop-blur-md rounded-[3rem] p-8 md:p-12 border-4 border-white shadow-2xl overflow-x-auto">

                                {/* Container for milestones + line */}
                                <div className="flex flex-row items-start gap-8 md:gap-12 relative z-10 min-w-max pb-4 px-4 pt-4">
                                    {/* Connecting line */}
                                    <div className="absolute top-[30%] md:top-[35%] left-0 right-0 h-2 bg-[length:200%_auto] bg-gradient-to-r from-emerald-300 via-amber-300 via-rose-300 via-sky-300 to-purple-300 rounded-full hidden md:block -z-10 animate-gradient"></div>

                                    {(() => {
                                        const milestoneColors = [
                                            { bg: 'bg-emerald-400', text: 'text-emerald-700', border: 'border-emerald-300' },
                                            { bg: 'bg-amber-400', text: 'text-amber-700', border: 'border-amber-300' },
                                            { bg: 'bg-rose-400', text: 'text-rose-700', border: 'border-rose-300' },
                                            { bg: 'bg-sky-400', text: 'text-sky-700', border: 'border-sky-300' },
                                        ];

                                        let sourceMilestones = learningPathTopics && learningPathTopics.length > 0
                                            ? [...learningPathTopics]
                                            : [...(assessmentAnalysis?.learningPath || [
                                                { order: 1, chapter: 'Chủ đề 1', emoji: '🌱', status: 'pending', estimatedWeeks: 2, reason: '' }
                                            ])];

                                        const extractNum = (str: string) => {
                                            const m = str?.match ? str.match(/\d+/) : null;
                                            return m ? parseInt(m[0], 10) : 999;
                                        };

                                        // Ensure horizontal roadmap is ALWAYS sorted from smallest chapter to largest chapter
                                        sourceMilestones.sort((a: any, b: any) => {
                                            const nameA = a.topic || a.chapter || "";
                                            const nameB = b.topic || b.chapter || "";
                                            return extractNum(String(nameA)) - extractNum(String(nameB));
                                        });

                                        const emojis = ['🌱', '📚', '📐', '📊', '🔍', '💡', '🌟', '🧩', '🚀', '🧠'];

                                        return (
                                            <>
                                                {sourceMilestones.map((m: any, i: number) => {
                                                    const color = milestoneColors[i % milestoneColors.length];
                                                    const topicName = m.topic || m.chapter || `Chủ đề ${i + 1}`;
                                                    const status = m.status || 'pending';
                                                    const isUnlocked = status === 'current' || status === 'completed';
                                                    const subtitle = status === 'completed' ? 'Hoàn thành ✓'
                                                        : status === 'current' ? `Đang học`
                                                            : 'Sắp tới';
                                                    const emoji = m.emoji || emojis[i % emojis.length];

                                                    return (
                                                        <div key={i} title={m.reason || topicName}>
                                                            <Milestone
                                                                emoji={emoji}
                                                                name={topicName}
                                                                subtitle={subtitle}
                                                                number={String(i + 1)}
                                                                bgColor={color.bg}
                                                                textColor={color.text}
                                                                borderColor={color.border}
                                                                unlocked={isUnlocked}
                                                                delay={0.4 + i * 0.1}
                                                            />
                                                        </div>
                                                    );
                                                })}

                                                {/* Master Level - luôn ở cuối */}
                                                <motion.div
                                                    initial={{ scale: 0, rotate: 180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: 0.4 + sourceMilestones.length * 0.1 + 0.2, type: "spring", stiffness: 120 }}
                                                    className="flex flex-col items-center"
                                                >
                                                    <motion.div
                                                        whileHover={{ scale: 1.1, y: -10 }}
                                                        className={`w-28 h-28 md:w-32 md:h-32 ${lastAssessment && lastAssessment.score > 90 ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gray-300'} rounded-full flex items-center justify-center shadow-2xl border-[6px] border-white cursor-pointer relative z-10`}
                                                        style={{
                                                            animation: lastAssessment && lastAssessment.score > 90 ? 'bounce-slow 3s ease-in-out infinite' : 'none'
                                                        }}
                                                    >
                                                        <span className="text-6xl md:text-7xl">🏅</span>
                                                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center font-black text-lg border-4 border-white">
                                                            {sourceMilestones.length + 1}
                                                        </div>
                                                    </motion.div>

                                                    <div className="mt-4 bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg border-4 border-indigo-200 text-center">
                                                        <h3 className="font-black text-xl text-indigo-800">Bậc Thầy Toán</h3>
                                                        <p className="text-xs text-indigo-500 font-bold mt-1 uppercase">
                                                            {lastAssessment && lastAssessment.score > 90 ? 'Xuất Sắc!' : 'Mục Tiêu'}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            </>
                                        );
                                    })()}
                                </div>


                                {/* Decorative elements */}
                                <div className="absolute top-8 left-8 text-[#00A8E8]/10 text-6xl font-black rotate-12 select-none hidden md:block">+</div>
                                <div className="absolute bottom-8 right-8 text-[#FF9F1C]/10 text-7xl font-black -rotate-12 select-none hidden md:block">÷</div>
                                <div className="absolute top-1/2 left-12 text-[#32E0C4]/10 text-5xl font-black rotate-45 select-none hidden md:block">×</div>
                                <div className="absolute top-1/3 right-16 text-[#F43F5E]/10 text-6xl font-black -rotate-6 select-none hidden md:block">=</div>
                            </div>

                            {/* Progress Text */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="text-center mt-12"
                            >
                                {(() => {
                                    // Thay đổi logic để tính tổng số chủ đề từ knowledgeTiles (tổng hợp toàn bộ bài đánh giá) thay vì learningPath (chỉ gồm bài yếu)
                                    const total = knowledgeTiles && knowledgeTiles.length > 0 ? knowledgeTiles.length : 5;
                                    const completed = knowledgeTiles && knowledgeTiles.length > 0
                                        ? knowledgeTiles.filter((t: any) => t.strength === 'strong').length
                                        : 0;

                                    return (
                                        <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-lg rounded-3xl px-10 py-5 border-4 border-white shadow-2xl">
                                            <span className="text-3xl">✨</span>
                                            <span className="text-2xl font-black text-[#0F4C75]">
                                                {`Bạn đã chinh phục ${completed}/${total} chủ đề!`}
                                            </span>
                                            <span className="text-3xl">🚀</span>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        </div>
                    </div>
                ) : (
                    /* Banner kêu gọi cá nhân hóa khi chưa có lộ trình */
                    <div className="relative z-10 py-12">
                        <div className="max-w-4xl mx-auto px-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-10 border-4 border-white shadow-2xl text-center"
                            >
                                <div className="text-6xl mb-4">🗺️</div>
                                <h2 className="font-black text-3xl md:text-4xl text-[#0F4C75] mb-3">
                                    HÀNH TRÌNH CHINH PHỤC
                                </h2>
                                <p className="text-lg text-gray-500 font-bold mb-6">
                                    {!hasOnboarding
                                        ? 'Hoàn thành cá nhân hóa để mở lộ trình học tập của bạn!'
                                        : 'Hãy làm bài chẩn đoán để lộ trình của bạn được hiển thị!'}
                                </p>
                                <Button
                                    onClick={() => navigate(!hasOnboarding ? '/onboarding' : '/assessment')}
                                    className="bg-[#FF9F1C] hover:bg-[#E68A0A] text-white font-black py-4 px-10 rounded-full text-xl shadow-xl border-b-4 border-[#CC7700]"
                                >
                                    {!hasOnboarding ? '✏️ Bắt đầu cá nhân hóa' : '🧭 Làm bài chẩn đoán'}
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* CTA Section */}
                <div className="relative z-10 py-20">
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                onClick={() => navigate(primaryCTA.path)}
                                className="w-full bg-gradient-to-r from-[#FF9F1C] to-[#FF7F00] hover:from-[#E68A0A] hover:to-[#E67000] text-white font-black text-3xl md:text-4xl py-10 rounded-full transition-all flex items-center justify-center gap-4 group relative overflow-hidden border-b-[8px] border-[#CC7700] shadow-2xl"
                            >
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-20 rounded-t-full"></div>
                                <motion.span
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="text-5xl"
                                >
                                    🚀
                                </motion.span>
                                BẮT ĐẦU HÀNH TRÌNH NGAY!
                            </Button>
                        </motion.div>
                        <p className="mt-8 text-slate-500 font-black text-base bg-white/60 inline-block px-6 py-3 rounded-full border-2 border-white shadow-lg">
                            ✨ Đăng ký miễn phí - Không cần thẻ tín dụng
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="relative z-10 py-20">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Card 1 - Tiến Độ */}
                            <motion.div whileHover={{ y: -5, scale: 1.02 }}>
                                <Card className="bg-white/95 backdrop-blur shadow-2xl border-4 border-white rounded-3xl overflow-hidden">
                                    <CardContent className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-2xl font-black text-[#0F4C75]">Tiến Độ</h3>
                                            <span className="text-5xl">📚</span>
                                        </div>
                                        <div className="space-y-4">
                                            {(() => {
                                                const total = knowledgeTiles && knowledgeTiles.length > 0 ? knowledgeTiles.length : 1;
                                                const completed = knowledgeTiles && knowledgeTiles.length > 0
                                                    ? knowledgeTiles.filter((t: any) => t.strength === 'strong').length
                                                    : 0;
                                                const progressPercentage = Math.round((completed / total) * 100);

                                                return (
                                                    <>
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold text-gray-600">Tổng thể</span>
                                                            <span className="text-3xl font-black text-[#00A8E8]">
                                                                {lastAssessment ? `${progressPercentage}%` : '—'}
                                                            </span>
                                                        </div>
                                                        <Progress value={lastAssessment ? progressPercentage : 0} className="h-5 bg-gray-200 rounded-full" />
                                                    </>
                                                );
                                            })()}
                                            <div className="grid grid-cols-2 gap-3 mt-6">
                                                <div className="bg-green-50 rounded-2xl p-5 text-center border-3 border-green-200 shadow-md">
                                                    <div className="text-4xl font-black">
                                                        {userStats?.lessons_completed ?? 0}
                                                    </div>
                                                    <div className="text-xs font-bold text-gray-600 mt-1">Bài hoàn thành</div>
                                                </div>
                                                <div className="bg-amber-50 rounded-2xl p-5 text-center border-3 border-amber-200 shadow-md">
                                                    <div className="text-4xl font-black">
                                                        {userStats?.study_time_minutes
                                                            ? userStats.study_time_minutes >= 60
                                                                ? `${Math.floor(userStats.study_time_minutes / 60)}h`
                                                                : `${userStats.study_time_minutes}p`
                                                            : '0p'}
                                                    </div>
                                                    <div className="text-xs font-bold text-gray-600 mt-1">Thời gian học</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Card 2 - Bản Đồ Tri Thức */}
                            <motion.div whileHover={{ y: -5, scale: 1.02 }}>
                                <Card className="bg-white/95 backdrop-blur shadow-2xl border-4 border-white rounded-3xl overflow-hidden">
                                    <CardContent className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-2xl font-black text-[#0F4C75]">Bản Đồ Tri Thức</h3>
                                            <span className="text-5xl">🗺️</span>
                                        </div>
                                        {knowledgeTiles.length > 0 ? (
                                            <>
                                                <div className="grid grid-cols-3 gap-2 mb-4">
                                                    {knowledgeTiles.slice(0, 9).map((topic) => (
                                                        <motion.div
                                                            key={topic.id}
                                                            whileHover={{ scale: 1.05 }}
                                                            title={topic.name}
                                                            className={`rounded-2xl flex items-center justify-center p-2 shadow-lg cursor-pointer text-center ${topic.strength === 'strong' ? 'bg-green-400 text-white' :
                                                                topic.strength === 'medium' ? 'bg-yellow-400 text-white' : 'bg-red-400 text-white'
                                                                }`}
                                                            style={{ minHeight: '72px' }}
                                                        >
                                                            <span
                                                                className={`font-black leading-tight ${topic.name.length > 30 ? 'text-[8px]' :
                                                                    topic.name.length > 20 ? 'text-[9px]' :
                                                                        topic.name.length > 12 ? 'text-[10px]' :
                                                                            topic.name.length > 8 ? 'text-xs' : 'text-sm'
                                                                    }`}
                                                                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                                                            >
                                                                {topic.name}
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between text-xs font-bold mt-4">
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-4 h-4 bg-green-400 rounded"></span>Vững
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-4 h-4 bg-yellow-400 rounded"></span>Trung bình
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-4 h-4 bg-red-400 rounded"></span>Yếu
                                                    </span>
                                                </div>
                                                {weakTopics.length > 0 && (
                                                    <Button className="w-full mt-4 bg-[#00A8E8] hover:bg-[#007BA8] text-white font-bold rounded-2xl py-3" onClick={() => navigate('/assessment')}>
                                                        Luyện tập chủ đề yếu
                                                    </Button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-gray-600 text-sm text-center py-12 font-bold">
                                                Chưa có dữ liệu. Hãy làm bài chẩn đoán! 🧭
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Card 3 - Thành Tích */}
                            <motion.div whileHover={{ y: -5, scale: 1.02 }}>
                                <Card className="bg-white/95 backdrop-blur shadow-2xl border-4 border-white rounded-3xl overflow-hidden">
                                    <CardContent className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-2xl font-black text-[#0F4C75]">Thành Tích</h3>
                                            <span className="text-5xl">🏆</span>
                                        </div>
                                        <div className="space-y-4">
                                            {(userStats?.achievements && userStats.achievements.length > 0) ? (
                                                userStats.achievements.slice(0, 3).map((ach) => (
                                                    <motion.div
                                                        key={ach.id}
                                                        whileHover={{ x: 5 }}
                                                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-3 border-yellow-200 shadow-md"
                                                    >
                                                        <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg bg-yellow-400">
                                                            <span className="text-3xl">⭐</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-black text-[#0F4C75]">{ach.name}</div>
                                                            <div className="text-sm text-gray-600 font-bold">{ach.description}</div>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10">
                                                    <div className="text-5xl mb-3">🔒</div>
                                                    <div className="text-gray-500 font-bold text-sm">Chưa có thành tích nào.</div>
                                                    <div className="text-gray-400 text-xs mt-1">Học và luyện tập để mở khóa!</div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
