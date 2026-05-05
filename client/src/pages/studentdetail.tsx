import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
    Flame,
    Star,
    Clock,
    Eye,
    Target,
    ClipboardCheck,
    PlayCircle,
    Trophy,
    LineChart,
    Award,
    Zap,
    Lightbulb,
    Sparkles,
    MapPin,
    Flag,
    CheckCircle,
    Circle,
    ArrowRight,
    Calculator,
    PieChart,
    Triangle,
    Ruler,
    BookOpen,
    Brain,
    Rocket
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import GamificationElements from "@/components/gamification-elements";
import { mockUser, mockLearningTopics, mockAchievements } from "@/data/mock-data";

function StudentDetailContent() {
    const [, navigate] = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [lastAssessment, setLastAssessment] = useState<any | null>(null);
    const [knowledgeTiles, setKnowledgeTiles] = useState<any[]>([]);
    const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

    const userDisplayName = "Thanh Nga";

    useEffect(() => {
        const loadAssessment = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/assessments/user/sample-student-1");
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const sorted = [...data].sort(
                        (a, b) =>
                            new Date(b.completedAt || 0).getTime() -
                            new Date(a.completedAt || 0).getTime()
                    );
                    const latest = sorted[0];
                    setLastAssessment(latest);
                    try {
                        const parsed = JSON.parse(latest.knowledgeMap || "[]");
                        setKnowledgeTiles(Array.isArray(parsed) ? parsed : []);
                    } catch {
                        setKnowledgeTiles([]);
                    }
                }
            } catch {
                setLastAssessment(null);
                setKnowledgeTiles([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadAssessment();
    }, []);

    const weakTopics = knowledgeTiles.filter((t) => t.strength === "weak");

    const primaryCTA = useMemo(() => {
        if (lastAssessment) return { label: "Xem lộ trình học", path: "/learning", icon: PlayCircle };
        return { label: "Điểm cần lưu ý", path: "/weakness", icon: ClipboardCheck };
    }, [lastAssessment]);

    const PrimaryIcon = primaryCTA.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#0093c9] to-[#ea9c48] text-white py-10">
                <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
                    <h1 className="text-3xl md:text-4xl font-bold">
                        Chi tiết học sinh: <span className="text-yellow-400">{userDisplayName}</span>
                    </h1>
                    <Button
                        onClick={() => navigate(primaryCTA.path)}
                        className="bg-white/20 hover:bg-white/30 px-5 py-3 rounded-xl flex items-center gap-2"
                    >
                        <PrimaryIcon size={18} />
                        {primaryCTA.label}
                    </Button>
                </div>
            </div>

            {/* Overview & Gamification */}
            <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Progress */}
                    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                        <CardContent>
                            <h2 className="text-2xl font-bold text-blue-900 mb-4">Tiến trình học</h2>
                            {isLoading ? (
                                <div>Đang tải...</div>
                            ) : lastAssessment ? (
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span>Điểm gần nhất</span>
                                        <span className="font-bold text-blue-900">{lastAssessment.score}%</span>
                                    </div>
                                    <Progress value={lastAssessment.score} className="h-3 mb-4" />
                                    <div className="text-sm text-gray-600">
                                        Số câu hỏi: {lastAssessment.totalQuestions}
                                    </div>
                                </div>
                            ) : (
                                <div>Chưa có bài chẩn đoán.</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Learning Topics */}
                    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                        <CardContent>
                            <h2 className="text-2xl font-bold text-blue-900 mb-4">Chủ đề học</h2>
                            {mockLearningTopics.map((topic) => (
                                <div
                                    key={topic.id}
                                    className="border-2 rounded-2xl p-4 mb-3 cursor-pointer hover:scale-[1.02] transition-all"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-blue-900">{topic.name}</h3>
                                            <p className="text-gray-600 text-sm">{topic.description}</p>
                                        </div>
                                        <div className="font-bold">{topic.progress}%</div>
                                    </div>
                                    <Progress value={topic.progress} className="h-2 mt-2" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Knowledge Map */}
                    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                        <CardContent>
                            <h2 className="text-2xl font-bold text-blue-900 mb-4">Bản đồ tri thức</h2>
                            {knowledgeTiles.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {knowledgeTiles.map((t) => (
                                        <div
                                            key={t.id}
                                            className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                                                t.strength === "strong"
                                                    ? "bg-green-400 text-white"
                                                    : t.strength === "medium"
                                                        ? "bg-yellow-400 text-white"
                                                        : "bg-red-400 text-white"
                                            }`}
                                            title={`${t.name} • ${t.score}`}
                                        >
                                            {t.id}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>Chưa có dữ liệu. Hoàn thành bài chẩn đoán để tạo bản đồ.</div>
                            )}
                            {weakTopics.length > 0 && (
                                <Button className="w-full mt-4" onClick={() => navigate("/assessment")}>
                                    Luyện tập chủ đề yếu
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Gamification */}
                    <GamificationElements
                        userLevel={mockUser.level || 3}
                        xp={mockUser.totalXP || 320}
                        streak={mockUser.streak || 7}
                        masteryScore={lastAssessment?.score || 0}
                        achievements={mockAchievements}
                        isVisible={true}
                    />

                    {/* Achievements */}
                    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                        <CardContent>
                            <h2 className="text-2xl font-bold text-blue-900 mb-4">Thành tích</h2>
                            <div className="space-y-3">
                                {mockAchievements.map((a) => {
                                    const IconComp = a.icon;
                                    return (
                                        <div
                                            key={a.id}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
                                        >
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    a.rarity === "epic" ? "bg-yellow-500" : "bg-green-500"
                                                }`}
                                            >
                                                <IconComp className="text-white" size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-blue-900">{a.name}</div>
                                                <div className="text-sm text-gray-600">{a.description}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function StudentDetail() {
    return <StudentDetailContent />;
}
