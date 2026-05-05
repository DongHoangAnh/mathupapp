import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/app-header";
import { useLocation } from "wouter";

interface ChapterResult {
    id: number;
    name: string;
    subtitle: string;
    correct: number;
    total: number;
    percentage: number;
    status: 'vung' | 'kha' | 'trungbinh' | 'yeu';
}

interface Recommendation {
    icon: string;
    title: string;
    subtitle: string;
}

export default function PracticeResults() {
    const [, navigate] = useLocation();

    // Mock results data  - In real app, this would come from practice session
    const summary = {
        totalQuestions: 120,
        correctAnswers: 98,
        accuracy: 82,
        totalTime: "45:12"
    };

    const chapterResults: ChapterResult[] = [
        {
            id: 1,
            name: "CHƯƠNG 1:",
            subtitle: "Số tự nhiên trong phạm vi 100",
            correct: 25,
            total: 30,
            percentage: 83,
            status: 'vung'
        },
        {
            id: 2,
            name: "CHƯƠNG 2:",
            subtitle: "Phép cộng và phép trừ",
            correct: 22,
            total: 30,
            percentage: 73,
            status: 'kha'
        },
        {
            id: 3,
            name: "CHƯƠNG 3:",
            subtitle: "Hình học cơ bản",
            correct: 15,
            total: 30,
            percentage: 50,
            status: 'trungbinh'
        },
        {
            id: 4,
            name: "CHƯƠNG 4:",
            subtitle: "Giải toán có lời văn",
            correct: 8,
            total: 30,
            percentage: 26,
            status: 'yeu'
        }
    ];

    const recommendations: Recommendation[] = [
        {
            icon: "lightbulb",
            title: "Phép trừ có nhớ",
            subtitle: "Luyện tập thêm 15 câu"
        },
        {
            icon: "shapes",
            title: "Phân biệt hình khối",
            subtitle: "Xem video hướng dẫn"
        },
        {
            icon: "menu_book",
            title: "Toán đố về thời gian",
            subtitle: "Luyện tập bài tập mẫu"
        },
        {
            icon: "rocket_launch",
            title: "So sánh các số 3 chữ số",
            subtitle: "Thử thách nâng cao"
        }
    ];

    const getStatusClass = (status: string) => {
        const classes = {
            vung: 'bg-green-100 text-green-600',
            kha: 'bg-blue-100 text-blue-600',
            trungbinh: 'bg-yellow-100 text-yellow-600',
            yeu: 'bg-red-100 text-red-600'
        };
        return classes[status as keyof typeof classes] || '';
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            vung: 'VỮNG',
            kha: 'KHÁ',
            trungbinh: 'TRUNG BÌNH',
            yeu: 'YẾU'
        };
        return labels[status as keyof typeof labels] || '';
    };

    const getProgressBarColor = (percentage: number) => {
        if (percentage >= 80) return '#00AEEF'; // Primary blue
        if (percentage >= 60) return '#00AEEF'; // Primary blue
        if (percentage >= 40) return '#FCD34D'; // Yellow
        return '#EF4444'; // Red
    };

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Baloo+2:wght@400;600;700;800&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <style>{`
        body {
          font-family: 'Baloo 2', cursive !important;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .main-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 4px solid white;
          box-shadow: 0 20px 40px rgba(0, 174, 239, 0.1);
          border-radius: 32px;
        }
        .sidebar-card {
          background: white;
          border: 2px solid white;
          box-shadow: 0 10px 20px rgba(0, 174, 239, 0.05);
          border-radius: 24px;
        }
        .bubble-float {
          position: absolute;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          pointer-events: none;
          box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.05), inset 5px 5px 10px rgba(255, 255, 255, 0.8);
        }
        .btn-3d-orange {
          box-shadow: 0 4px 0 #E68A00;
          transition: all 0.1s ease;
        }
        .btn-3d-orange:active {
          box-shadow: 0 1px 0 #E68A00;
          transform: translateY(3px);
        }
        .btn-3d-blue {
          box-shadow: 0 4px 0 #0088BC;
          transition: all 0.1s ease;
        }
        .btn-3d-blue:active {
          box-shadow: 0 1px 0 #0088BC;
          transform: translateY(3px);
        }
        .summary-card {
          padding: 1rem;
          border-radius: 1rem;
          background: white;
          border: 2px solid #EFF6FF;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: transform 0.2s;
          box-shadow: 0 8px 15px rgba(0, 174, 239, 0.08);
        }
        .summary-card:hover {
          transform: scale(1.05);
        }
        .chapter-row {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
          border-radius: 1rem;
          background: white;
          border: 1px solid rgba(219, 234, 254, 0.5);
          margin-bottom: 0.75rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
        }
        @media (min-width: 768px) {
          .chapter-row {
            flex-direction: row;
            align-items: center;
          }
        }
        .status-badge {
          padding: 0.25rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 900;
        }
        .recommendation-card {
          background: rgba(239, 246, 255, 0.5);
          padding: 1rem;
          border-radius: 0.75rem;
          border: 2px solid white;
          transition: all 0.2s;
          cursor: pointer;
        }
        .recommendation-card:hover {
          border-color: rgba(0, 174, 239, 0.3);
        }
      `}</style>

            <div className="min-h-screen bg-[#EAF6FF]">
                {/* Floating Bubbles Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="bubble-float w-12 h-12 left-[8%] top-[15%]"></div>
                    <div className="bubble-float w-24 h-24 left-[85%] top-[12%]"></div>
                    <div className="bubble-float w-20 h-20 left-[42%] top-[75%]"></div>
                    <div className="bubble-float w-10 h-10 left-[78%] top-[85%]"></div>
                    <div className="bubble-float w-32 h-32 left-[3%] top-[65%]"></div>
                </div>

                {/* Header */}
                <AppHeader />

                {/* Main Content */}
                <main className="relative z-10 container mx-auto px-4 pt-24 pb-20">
                    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-7xl mx-auto">
                        {/* Sidebar */}
                        <aside className="lg:w-1/4 w-full">
                            <div className="sidebar-card p-6">
                                <h2 className="text-[#0A2463] font-black uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#00AEEF] text-xl">list_alt</span>
                                    NỘI DUNG
                                </h2>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => navigate('/learning')}
                                        className="w-full bg-[#00AEEF] btn-3d-blue text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">menu_book</span>
                                        HỌC TẬP
                                    </button>
                                    <button
                                        onClick={() => navigate('/practice')}
                                        className="w-full bg-[#FF9F1C] btn-3d-orange text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">fitness_center</span>
                                        ÔN LUYỆN
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* Results Content */}
                        <div className="lg:w-3/4 w-full">
                            <div className="main-card p-8 md:p-10">
                                <h1 className="text-3xl font-black text-[#0A2463] font-['Baloo_2'] uppercase tracking-tight text-center mb-10">
                                    ĐÁNH GIÁ KẾT QUẢ ÔN LUYỆN
                                </h1>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                                    <div className="summary-card">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2 shadow-inner">
                                            <span className="material-symbols-outlined text-[#00AEEF] text-3xl">quiz</span>
                                        </div>
                                        <span className="text-gray-500 text-xs font-bold uppercase">Tổng câu hỏi</span>
                                        <span className="text-2xl font-black text-[#0A2463]">{summary.totalQuestions}</span>
                                    </div>

                                    <div className="summary-card">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-2 shadow-inner">
                                            <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                                        </div>
                                        <span className="text-gray-500 text-xs font-bold uppercase">Câu đúng</span>
                                        <span className="text-2xl font-black text-[#0A2463]">{summary.correctAnswers}</span>
                                    </div>

                                    <div className="summary-card">
                                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-2 shadow-inner">
                                            <span className="material-symbols-outlined text-[#FF9F1C] text-3xl">analytics</span>
                                        </div>
                                        <span className="text-gray-500 text-xs font-bold uppercase">Độ chính xác</span>
                                        <span className="text-2xl font-black text-[#0A2463]">{summary.accuracy}%</span>
                                    </div>

                                    <div className="summary-card">
                                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-2 shadow-inner">
                                            <span className="material-symbols-outlined text-purple-500 text-3xl">schedule</span>
                                        </div>
                                        <span className="text-gray-500 text-xs font-bold uppercase">Tổng thời gian</span>
                                        <span className="text-2xl font-black text-[#0A2463]">{summary.totalTime}</span>
                                    </div>
                                </div>

                                {/* Chapter Results */}
                                <div className="mb-12">
                                    <h2 className="text-xl font-black text-[#0A2463] uppercase mb-6 flex items-center gap-2">
                                        <span className="w-2 h-8 bg-[#00AEEF] rounded-full"></span>
                                        KẾT QUẢ THEO BÀI HỌC
                                    </h2>
                                    <div className="space-y-4">
                                        {chapterResults.map((chapter) => (
                                            <div key={chapter.id} className="chapter-row">
                                                <div className="w-full md:w-1/4">
                                                    <p className="font-black text-[#0A2463]">{chapter.name}</p>
                                                    <p className="text-xs text-gray-500 font-bold uppercase">{chapter.subtitle}</p>
                                                </div>

                                                <div className="flex-grow w-full md:w-auto">
                                                    <div className="flex justify-between text-xs font-black mb-1">
                                                        <span className="text-[#0A2463]">{chapter.correct}/{chapter.total} Câu đúng</span>
                                                        <span className="text-[#00AEEF]">{chapter.percentage}%</span>
                                                    </div>
                                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{
                                                                width: `${chapter.percentage}%`,
                                                                backgroundColor: getProgressBarColor(chapter.percentage)
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="md:w-32 flex justify-end">
                                                    <span className={`status-badge ${getStatusClass(chapter.status)}`}>
                                                        {getStatusLabel(chapter.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div>
                                    <h2 className="text-xl font-black text-[#0A2463] uppercase mb-6 flex items-center gap-2">
                                        <span className="w-2 h-8 bg-[#FF9F1C] rounded-full"></span>
                                        KHUYẾN NGHỊ HỌC TẬP
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                        {recommendations.map((rec, index) => (
                                            <div key={index} className="recommendation-card flex items-center gap-4">
                                                <div className="bg-white p-2 rounded-lg text-[#00AEEF] shadow-sm">
                                                    <span className="material-symbols-outlined">{rec.icon}</span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-[#0A2463] text-sm">{rec.title}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">{rec.subtitle}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                                        <Button
                                            onClick={() => navigate('/practice')}
                                            className="flex-1 bg-[#00AEEF] btn-3d-blue hover:bg-[#0088BC] text-white font-black py-4 rounded-2xl text-lg"
                                        >
                                            <span className="material-symbols-outlined mr-2">refresh</span>
                                            Luyện Tập Lại
                                        </Button>
                                        <Button
                                            onClick={() => navigate('/learning')}
                                            className="flex-1 bg-[#FF9F1C] btn-3d-orange hover:bg-[#E68A00] text-white font-black py-4 rounded-2xl text-lg"
                                        >
                                            <span className="material-symbols-outlined mr-2">menu_book</span>
                                            Tiếp Tục Học
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Ocean Wave at Bottom */}
                <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none opacity-20 z-0">
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
