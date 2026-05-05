import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Users, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface RoleSelectionModalProps {
    isOpen: boolean;
    onRoleSelected: (role: string) => void;
    userId: string;
}

export default function RoleSelectionModal({ isOpen, onRoleSelected, userId }: RoleSelectionModalProps) {
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const roles = [
        {
            id: "student",
            label: "Học sinh",
            emoji: "🎓",
            icon: GraduationCap,
            color: "from-blue-500 to-cyan-500",
            borderColor: "border-blue-500",
            hoverColor: "hover:shadow-blue-500/50",
            description: "Tham gia học tập, làm bài kiểm tra và chơi game show"
        },
        {
            id: "teacher",
            label: "Giáo viên",
            emoji: "👨‍🏫",
            icon: BookOpen,
            color: "from-purple-500 to-pink-500",
            borderColor: "border-purple-500",
            hoverColor: "hover:shadow-purple-500/50",
            description: "Quản lý lớp học, tạo bài kiểm tra và theo dõi học sinh"
        },
        {
            id: "parent",
            label: "Phụ huynh",
            emoji: "👨‍👩‍👧",
            icon: Users,
            color: "from-orange-500 to-red-500",
            borderColor: "border-orange-500",
            hoverColor: "hover:shadow-orange-500/50",
            description: "Theo dõi tiến độ học tập của con em"
        }
    ];

    const handleSubmit = async () => {
        if (!selectedRole) {
            toast({
                title: "Vui lòng chọn vai trò",
                description: "Bạn cần chọn một vai trò để tiếp tục sử dụng MathUp",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Update user metadata in Supabase
            const { error } = await supabase.auth.updateUser({
                data: { role: selectedRole }
            });

            if (error) throw error;

            // Update localStorage
            const userStr = localStorage.getItem('mathocean_user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.role = selectedRole;
                localStorage.setItem('mathocean_user', JSON.stringify(user));
            }

            // Trigger auth change event
            window.dispatchEvent(new Event('authChange'));

            toast({
                title: "Đã thiết lập vai trò!",
                description: `Bạn đã được thiết lập là ${roles.find(r => r.id === selectedRole)?.label}`,
                className: "bg-green-500 text-white border-none"
            });

            // Call parent callback
            onRoleSelected(selectedRole);
        } catch (error: any) {
            console.error("Error updating role:", error);
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật vai trò. Vui lòng thử lại.",
                variant: "destructive"
            });
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative z-10 w-full max-w-4xl mx-4"
                    >
                        <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-3xl p-8 md:p-12 shadow-2xl border-4 border-white">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="inline-block mb-4"
                                >
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-4xl shadow-lg">
                                        🎭
                                    </div>
                                </motion.div>

                                <h2 className="text-4xl md:text-5xl font-black text-[#0A2463] mb-3 uppercase tracking-tight">
                                    Chào mừng đến MathUp!
                                </h2>
                                <p className="text-lg text-gray-600 font-semibold">
                                    Vui lòng chọn vai trò của bạn để bắt đầu hành trình khám phá
                                </p>
                            </div>

                            {/* Role Cards */}
                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                {roles.map((role, index) => {
                                    const Icon = role.icon;
                                    const isSelected = selectedRole === role.id;

                                    return (
                                        <motion.button
                                            key={role.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                            onClick={() => setSelectedRole(role.id)}
                                            className={`
                        relative p-6 rounded-2xl border-4 transition-all duration-300
                        ${isSelected
                                                    ? `bg-gradient-to-br ${role.color} ${role.borderColor} shadow-2xl scale-105 ${role.hoverColor}`
                                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xl'
                                                }
                      `}
                                        >
                                            {/* Selection Indicator */}
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                                                >
                                                    <span className="text-white text-2xl">✓</span>
                                                </motion.div>
                                            )}

                                            {/* Icon */}
                                            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-gray-100'
                                                }`}>
                                                <span className="text-5xl">{role.emoji}</span>
                                            </div>

                                            {/* Label */}
                                            <h3 className={`text-2xl font-black mb-2 uppercase ${isSelected ? 'text-white' : 'text-[#0A2463]'
                                                }`}>
                                                {role.label}
                                            </h3>

                                            {/* Description */}
                                            <p className={`text-sm font-semibold ${isSelected ? 'text-white/90' : 'text-gray-600'
                                                }`}>
                                                {role.description}
                                            </p>

                                            {/* Icon Outline */}
                                            <div className={`mt-4 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'
                                                }`}>
                                                <Icon className="w-6 h-6 mx-auto text-white" strokeWidth={3} />
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Submit Button */}
                            <div className="flex flex-col items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: selectedRole ? 1.05 : 1 }}
                                    whileTap={{ scale: selectedRole ? 0.95 : 1 }}
                                    onClick={handleSubmit}
                                    disabled={!selectedRole || isSubmitting}
                                    className={`
                    w-full max-w-md py-5 rounded-full font-black text-xl uppercase tracking-widest
                    transition-all shadow-xl
                    ${selectedRole
                                            ? 'bg-gradient-to-r from-[#FF9F1C] to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white border-b-4 border-orange-700'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }
                    ${isSubmitting ? 'opacity-50' : ''}
                  `}
                                >
                                    {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN VAI TRÒ"}
                                </motion.button>

                                <p className="text-xs text-gray-500 font-semibold text-center max-w-md">
                                    💡 Bạn có thể thay đổi vai trò sau trong phần cài đặt tài khoản
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
