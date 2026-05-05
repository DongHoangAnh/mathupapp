import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import RoleBadge from "@/components/role-badge";
import { Home, Star, BookOpen, Gamepad2, CreditCard, GraduationCap, Users } from "lucide-react";

export default function AppHeader() {
    const [location, navigate] = useLocation();
    const [user, setUser] = useState<any>(null);

    // Check auth state on mount and listen for changes
    useEffect(() => {
        const checkUser = () => {
            const storedUser = localStorage.getItem('mathocean_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                setUser(null);
            }
        };

        checkUser(); // Initial check

        // Listen for custom event
        window.addEventListener('authChange', checkUser);
        return () => window.removeEventListener('authChange', checkUser);
    }, []);

    const getNavClass = (path: string) => {
        const isActive = location === path ||
            (path === '/teacher/classes' && location.startsWith('/teacher')) ||
            (path === '/parent/children' && location.startsWith('/parent'));
        return isActive
            ? "px-4 py-2.5 rounded-xl bg-[#00A8E8]/15 text-[#00A8E8] font-extrabold flex items-center gap-2 border-2 border-[#00A8E8]/30 shadow-sm transition-all duration-200"
            : "px-4 py-2.5 rounded-xl text-[#0F4C75] font-bold hover:bg-[#00A8E8]/10 hover:text-[#00A8E8] transition-all duration-200 flex items-center gap-2 border-2 border-transparent";
    };

    return (
        <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b-2 border-[#00A8E8]/10">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.05 }}
                        className="transition-transform"
                    >
                        <img src="/logo.png" alt="MathUp Logo" className="h-12 w-auto" />
                    </motion.div>
                    <span className="font-extrabold text-2xl text-[#0F4C75] tracking-tight hidden md:inline">
                        Math<span className="text-[#00A8E8]">Up</span>
                    </span>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {user?.role === 'teacher' ? (
                        // Teacher Menu
                        <>
                            <button onClick={() => navigate('/teacher/classes')} className={getNavClass('/teacher/classes')}>
                                <Users size={18} strokeWidth={2.5} />
                                <span className="text-sm font-extrabold tracking-wide">LỚP HỌC</span>
                            </button>
                            <button onClick={() => navigate('/assessment')} className={getNavClass('/assessment')}>
                                <Star size={18} strokeWidth={2.5} />
                                <span className="text-sm font-extrabold tracking-wide">ĐÁNH GIÁ</span>
                            </button>
                        </>
                    ) : user?.role === 'parent' ? (
                        // Parent Menu
                        <>
                            <button onClick={() => navigate('/parent/children')} className={getNavClass('/parent/children')}>
                                <Star size={18} strokeWidth={2.5} />
                                <span className="text-sm font-extrabold tracking-wide">ĐÁNH GIÁ</span>
                            </button>
                        </>
                    ) : (
                        // Student Menu (chưa đăng nhập: chỉ TRANG CHỦ + GAME SHOW; đã đăng nhập: đầy đủ)
                        <>
                            <button onClick={() => navigate('/')} className={getNavClass('/')}>
                                <Home size={18} strokeWidth={2.5} />
                                <span className="text-sm font-extrabold tracking-wide">TRANG CHỦ</span>
                            </button>
                            {user && (
                                <>
                                    <button onClick={() => navigate('/assessment')} className={getNavClass('/assessment')}>
                                        <Star size={18} strokeWidth={2.5} />
                                        <span className="text-sm font-extrabold tracking-wide">ĐÁNH GIÁ</span>
                                    </button>
                                    <button onClick={() => navigate('/learning')} className={getNavClass('/learning')}>
                                        <BookOpen size={18} strokeWidth={2.5} />
                                        <span className="text-sm font-extrabold tracking-wide">HỌC TẬP</span>
                                    </button>
                                </>
                            )}
                            <button onClick={() => navigate('/gameshow')} className={getNavClass('/gameshow')}>
                                <Gamepad2 size={18} strokeWidth={2.5} />
                                <span className="text-sm font-extrabold tracking-wide">GAME SHOW</span>
                            </button>
                            {user && (
                                <button onClick={() => navigate('/payment')} className={getNavClass('/payment')}>
                                    <CreditCard size={18} strokeWidth={2.5} />
                                    <span className="text-sm font-extrabold tracking-wide">THANH TOÁN</span>
                                </button>
                            )}
                        </>
                    )}
                </nav>

                {/* Right Side - Auth or Profile */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/profile')}
                            className="cursor-pointer relative group"
                        >
                            {/* Role Badge */}
                            <motion.div
                                initial={{ scale: 0, y: 10 }}
                                animate={{ scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="absolute -top-2 left-1/2 -translate-x-1/2 z-10"
                            >
                                <RoleBadge role={user.role || 'student'} size="sm" />
                            </motion.div>

                            {/* Avatar */}
                            <div className={`w-11 h-11 rounded-full ${user.isPro ? 'bg-[conic-gradient(from_0deg,#4285F4,#EA4335,#FBBC05,#34A853,#4285F4)] p-[2.5px] cursor-pointer' : 'border-3 border-[#00A8E8] p-0.5'} bg-white shadow-md relative`}>
                                <div className={`w-full h-full rounded-full overflow-hidden ${user.isPro ? 'border-[1.5px] border-white bg-white' : ''}`}>
                                    <img
                                        src={user.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBMY6Y7iBe8JiebVAqhC0v-bFt0EuAXYjQm77vfcIev-JKNoGAsEMznAy1PdP2ZQf1qyLRLJ5SaYzbD3_HQqfUyzC_w_0VJ5MusYl4u64NLNkPyQ3vEVBdnD4Lf0hOtwNBYpKPj3A57EionFLxmJ9qe_g6WftvZZzfC0wTJn9epeiYXTINqVAY_nfUqYtnQVxw7QOYt0w--AQdC0tZ042RxhFMMNhmc8dFPOOlSIoJEDssO3Rb8MAnIE4JLP47mGFeF5cKgQTDCZ7Q"}
                                        alt="User Avatar"
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Hover Tooltip */}
                            <div className="absolute top-14 right-0 w-max bg-[#0A2463] text-white text-xs font-bold py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 z-50">
                                <p className="font-extrabold flex items-center gap-1">
                                    Chào, {user.fullName || user.username}!
                                    {user.isPro && <span className="text-yellow-400" title="Tài khoản PRO">✨</span>}
                                </p>
                                <p className="text-[10px] text-white/70 mt-0.5 font-semibold">
                                    {user.role === 'student' ? '🎓 Học sinh' : user.role === 'teacher' ? '👨‍🏫 Giáo viên' : '👨‍👩‍👧 Phụ huynh'}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            <Button
                                onClick={() => navigate('/login')}
                                className="bg-[#00A8E8] hover:bg-[#0097D6] text-white font-extrabold py-2 px-6 rounded-full shadow-sm hover:shadow-md transition-all text-sm border-b-4 border-[#0085C0]"
                            >
                                ĐĂNG NHẬP
                            </Button>
                            <Button
                                onClick={() => navigate('/signup')}
                                className="bg-[#FF9F1C] hover:bg-[#E68A0A] text-white font-extrabold py-2 px-6 rounded-full shadow-sm hover:shadow-md transition-all text-sm border-b-4 border-[#CC7700]"
                            >
                                ĐĂNG KÝ
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
