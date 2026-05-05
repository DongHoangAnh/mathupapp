import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, BarChart2, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";

// Giả lập dữ liệu knowledge map
const mockKnowledgeMap = [
    { id: "M1", name: "Phép cộng", score: 95, strength: "strong" },
    { id: "M2", name: "Phép trừ", score: 60, strength: "medium" },
    { id: "M3", name: "Phép nhân", score: 40, strength: "weak" },
    { id: "M4", name: "Phép chia", score: 35, strength: "weak" },
    { id: "M5", name: "Phân số", score: 50, strength: "medium" },
];

export default function ViewWeaknessAreas() {
    const [weakTopics, setWeakTopics] = useState<typeof mockKnowledgeMap>([]);

    useEffect(() => {
        const weak = mockKnowledgeMap.filter((t) => t.strength === "weak");
        setWeakTopics(weak);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-6">
                <h1 className="text-3xl font-bold text-blue-900 mb-6">
                    Điểm cần lưu ý với các em
                </h1>
                <p className="text-gray-600 mb-8">
                    Xem các chủ đề yếu và khoảng trống kiến thức của học sinh để tập trung luyện tập.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Cards từng chủ đề yếu */}
                    {weakTopics.map((topic) => (
                        <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="border-red-400 shadow-md hover:scale-[1.03] transition-transform">
                                <CardContent>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="text-red-500" size={20} />
                                            <h2 className="font-bold text-red-600">{topic.name}</h2>
                                        </div>
                                        <span className="text-gray-700 font-medium">{topic.score}%</span>
                                    </div>
                                    <Progress value={topic.score} className="h-3" />
                                    <p className="text-sm text-gray-500 mt-2">
                                        Chủ đề này học sinh cần luyện tập nhiều hơn.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Overview chart */}
                <Card className="mt-10">
                    <CardContent>
                        <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <BarChart2 size={20} /> Knowledge Gaps Overview
                        </h2>
                        <div className="flex flex-col md:flex-row gap-4">
                            {mockKnowledgeMap.map((topic) => (
                                <div key={topic.id} className="flex-1">
                                    <div className="text-sm text-gray-600 mb-1">{topic.name}</div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-3 ${
                                                topic.strength === "weak"
                                                    ? "bg-red-500"
                                                    : topic.strength === "medium"
                                                        ? "bg-yellow-400"
                                                        : "bg-green-400"
                                            }`}
                                            style={{ width: `${100 - topic.score}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Gap: {100 - topic.score}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
