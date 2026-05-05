import { motion } from "framer-motion";
import AppHeader from "@/components/app-header";
import { useLocation } from "wouter";
import { Plus, Users, BookOpen, Calculator, Menu } from "lucide-react";
import { useEffect, useState } from "react";

export default function TeacherClasses() {
    const [, navigate] = useLocation();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check if user is teacher
        const storedUser = localStorage.getItem('mathocean_user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.role !== 'teacher') {
                // Redirect non-teachers
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

    const classes = [
        {
            id: 1,
            name: "Toán 5A",
            teacher: "Thầy An",
            students: 25,
            icon: BookOpen,
            color: "text-coral"
        },
        {
            id: 2,
            name: "Toán 5B",
            teacher: "Cô Bình",
            students: 28,
            icon: Menu,
            color: "text-coral"
        },
        {
            id: 3,
            name: "Toán 6A",
            teacher: "Thầy Cường",
            students: 30,
            icon: Calculator,
            color: "text-coral"
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
                    box-shadow: 0 10px 30px rgba(10, 36, 99, 0.05);
                }
                .floating-math {
                    opacity: 0.1;
                    user-select: none;
                    pointer-events: none;
                }
                .class-card {
                    background-color: #FFE8E3;
                    transition: all 0.3s ease;
                }
                .class-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(255, 127, 106, 0.15);
                }
            `}</style>

            <div className="min-h-screen text-[#0A2463]">
                {/* Background Bubbles */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="bubble w-12 h-12 left-[5%] top-[15%]"></div>
                    <div className="bubble w-20 h-20 left-[85%] top-[10%]"></div>
                    <div className="bubble w-16 h-16 left-[45%] top-[80%]"></div>
                    <div className="bubble w-8 h-8 left-[75%] top-[90%]"></div>
                    <div className="bubble w-24 h-24 left-[2%] top-[65%]"></div>

                    {/* Floating Math Symbols */}
                    <div className="floating-math absolute top-40 left-10 text-4xl font-extrabold text-[#00AEEF]">Σ</div>
                    <div className="floating-math absolute bottom-20 right-20 text-5xl font-extrabold text-[#00AEEF]">π</div>
                    <div className="floating-math absolute top-1/2 left-[5%] text-4xl font-extrabold text-[#00AEEF]">x + y</div>
                    <div className="floating-math absolute top-[30%] right-[5%] text-4xl font-extrabold text-[#00AEEF]">∞</div>
                </div>

                {/* Header */}
                <AppHeader />

                {/* Main Content */}
                <main className="relative z-10 container mx-auto px-6 py-12 pt-32">
                    <div className="bg-white rounded-3xl p-8 md:p-12 content-card min-h-[600px]">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 space-y-4 md:space-y-0">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[#0A2463] text-4xl md:text-5xl font-extrabold uppercase tracking-tight"
                            >
                                DANH SÁCH LỚP
                            </motion.h1>

                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-[#FF9F1C] hover:bg-[#F08E00] text-white px-8 py-3 rounded-full font-extrabold flex items-center space-x-2 shadow-lg shadow-[#FF9F1C]/30 transition-all"
                            >
                                <Plus size={20} strokeWidth={3} />
                                <span className="uppercase tracking-wider">Thêm Lớp</span>
                            </motion.button>
                        </div>

                        {/* Classes Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {classes.map((classItem, index) => {
                                const Icon = classItem.icon;
                                return (
                                    <motion.div
                                        key={classItem.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="class-card rounded-[24px] p-8 flex flex-col items-center text-center cursor-pointer"
                                    >
                                        {/* Icon */}
                                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                            <Icon className={classItem.color} size={48} strokeWidth={2.5} />
                                        </div>

                                        {/* Class Name */}
                                        <h3 className="text-2xl font-extrabold mb-4 font-display">{classItem.name}</h3>

                                        {/* Info */}
                                        <div className="space-y-2 mb-8">
                                            <div className="flex items-center justify-center space-x-2 text-[#0A2463]/80 font-bold">
                                                <Users size={18} />
                                                <span>Giáo viên: {classItem.teacher}</span>
                                            </div>
                                            <div className="flex items-center justify-center space-x-2 text-[#0A2463]/80 font-bold">
                                                <Users size={18} />
                                                <span>Số học sinh: {classItem.students}</span>
                                            </div>
                                        </div>

                                        {/* Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => navigate(`/teacher/classes/${classItem.id}`)}
                                            className="w-full bg-[#64748B] hover:bg-[#475569] text-white py-3 rounded-xl font-extrabold uppercase tracking-wider shadow-md transition-all"
                                        >
                                            Xem Chi Tiết
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </main>

                {/* Bottom Wave */}
                <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none opacity-20 z-0">
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
