import { motion } from "framer-motion";
import AppHeader from "@/components/app-header";
import { useLocation, useRoute } from "wouter";
import { Plus, Star, GraduationCap, ArrowLeft, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function TeacherClassDetail() {
    const [, navigate] = useLocation();
    const [, params] = useRoute("/teacher/classes/:id");
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check if user is teacher
        const storedUser = localStorage.getItem('mathocean_user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.role !== 'teacher') {
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

    // Mock data - In real app, fetch based on params.id
    const classInfo = {
        name: "Toán 5A",
        teacher: "Thầy An",
        totalStudents: 2
    };

    const students = [
        {
            id: 1,
            name: "Thanh Nga",
            username: "@thanhnga",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuiIyzRDRpqWnghwKSc1USCd0Ac2V0am69GZeezGGe5nDWyQZITyNIYpr3wO_vVjy_lDT4LHd3hIfCfcDOJhtj26WT8VN4ml43Znt1Mjfy1xlEP581sM75GMddmuTuY-VvQUZCGbnDalFvIdjKdVSMQMO4e48e9aP_mybZbvpyyeByFR2pYg4D-dlKhma4f6TF2-5TduvyuKLQB_G3Zb2T5xaZfaju8hzEYjN37auGJ2tZbSmGjxdDDKtiWTC06SB2x7BH7B5suZ0",
            points: 1250,
            grade: "3A2"
        },
        {
            id: 2,
            name: "Hoàng Ngọc",
            username: "@hoangngoc",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjR4dgCBpIb-XBDvi8h2F8rxHuxtM11QHWdL0RTqU8Mn4Qu3EmnwgmhtqHCEIOZEM5NgCBc_DM0s8a4jyHlFNKjYtySEbccflZWaXIHHFPFkPc9abFeIoEY7UQpoHBDaLBTHXwN7EnQIqf5b8ry246O5qnydpeBa6sIitBwW-y7JyGUvjz5S0utpUECI7xCUKwp43xvyx3QckQs-O0alEM_K7OMcvKOd0Mr3K1zT3Bklkj4wpd7B2_LK0lAT4jy1GHhe1q6yeiJQM",
            points: 750,
            grade: "3A2"
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
                .student-card {
                    background-color: #FFE8E3;
                    transition: all 0.3s ease;
                }
                .student-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(255, 127, 106, 0.15);
                }
                .btn-3d {
                    box-shadow: 0 4px 0 #475569;
                }
                .btn-3d:active {
                    box-shadow: 0 0px 0 #475569;
                    transform: translateY(4px);
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
                    <div className="bg-white rounded-3xl p-8 md:p-12 content-card min-h-[600px] flex flex-col">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 space-y-4 md:space-y-0">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[#0A2463] text-3xl md:text-4xl font-extrabold uppercase tracking-tight"
                            >
                                DANH SÁCH THÀNH VIÊN LỚP {classInfo.name}
                            </motion.h1>

                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-[#FF9F1C] hover:bg-[#F08E00] text-white px-8 py-3 rounded-full font-extrabold flex items-center space-x-2 shadow-lg shadow-[#FF9F1C]/30 transition-all"
                            >
                                <Plus size={20} strokeWidth={3} />
                                <span className="uppercase tracking-wider">Thành Viên</span>
                            </motion.button>
                        </div>

                        {/* Students Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-auto">
                            {students.map((student, index) => (
                                <motion.div
                                    key={student.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="student-card rounded-[24px] p-6 flex flex-col items-center"
                                >
                                    {/* Avatar */}
                                    <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg mb-4">
                                        <img
                                            alt={student.name}
                                            className="w-full h-full object-cover"
                                            src={student.avatar}
                                        />
                                    </div>

                                    {/* Name & Username */}
                                    <h3 className="text-2xl font-extrabold mb-1 font-display">{student.name}</h3>
                                    <p className="text-[#0A2463]/60 font-bold mb-4">{student.username}</p>

                                    {/* Stats */}
                                    <div className="w-full space-y-2 mb-6 text-sm font-bold text-[#0A2463]">
                                        <div className="flex items-center space-x-3 bg-white/50 p-2 rounded-lg">
                                            <Star className="text-coral" size={20} fill="#FF7F6A" />
                                            <span>{student.points.toLocaleString()} điểm</span>
                                        </div>
                                        <div className="flex items-center space-x-3 bg-white/50 p-2 rounded-lg">
                                            <GraduationCap className="text-[#00AEEF]" size={20} />
                                            <span>Lớp: {student.grade}</span>
                                        </div>
                                    </div>

                                    {/* Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-[#64748B] hover:bg-[#475569] text-white py-3 rounded-xl font-extrabold uppercase tracking-wider btn-3d transition-all"
                                    >
                                        Xem Chi Tiết
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Back Button */}
                        <div className="mt-12 flex justify-start">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/teacher/classes')}
                                className="bg-[#00AEEF] hover:bg-[#0092c8] text-white px-8 py-3 rounded-xl font-extrabold flex items-center space-x-2 shadow-lg transition-all"
                            >
                                <ArrowLeft size={20} strokeWidth={3} />
                                <span className="uppercase tracking-wider">Quay Lại</span>
                            </motion.button>
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
