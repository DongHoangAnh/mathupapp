import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import AppHeader from "@/components/app-header";
import { User, IdCard, Key, GraduationCap, ChevronDown, Loader2, AtSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function SignUp() {
    const [, navigate] = useLocation();
    const { toast } = useToast();
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState("");
    const [grade, setGrade] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!fullName || !username || !role || !password) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng điền đầy đủ các thông tin bắt buộc.",
                variant: "destructive"
            });
            return;
        }

        // Username validation (only letters, numbers, underscore, 3-20 chars)
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            toast({
                title: "Tên đăng nhập không hợp lệ",
                description: "Tên đăng nhập phải từ 3-20 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới.",
                variant: "destructive"
            });
            return;
        }

        // Password validation (minimum 6 characters)
        if (password.length < 6) {
            toast({
                title: "Mật khẩu quá ngắn",
                description: "Mật khẩu phải có ít nhất 6 ký tự.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            // Check if username already exists
            const { data: existingUser, error: checkError } = await supabase
                .from('user_profiles')
                .select('username')
                .ilike('username', username)
                .maybeSingle();

            if (existingUser) {
                toast({
                    title: "Tên đăng nhập đã tồn tại",
                    description: "Vui lòng chọn tên đăng nhập khác.",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            // Create fake email from username (Supabase requires email)
            const fakeEmail = `${username.toLowerCase()}@mathup.io`;

            // Clear all old user data before signup (fresh start for new account)
            localStorage.removeItem('onboarding');
            localStorage.removeItem('mathocean_has_assessment');
            localStorage.removeItem('mathocean_last_analysis');
            localStorage.removeItem('math_learning_duration');
            localStorage.removeItem('math_knowledge_map');
            localStorage.removeItem('mathocean_user');

            const { data, error } = await supabase.auth.signUp({
                email: fakeEmail,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        username: username.toLowerCase(),
                        role: role,
                        grade: grade
                    }
                }
            });

            if (error) {
                toast({
                    title: "Đăng ký thất bại",
                    description: error.message,
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            if (data.user) {
                // Create user profile in user_profiles table
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert({
                        user_id: data.user.id,
                        username: username.toLowerCase(),
                        full_name: fullName,
                        email: fakeEmail,
                        role: role,
                        grade: grade
                    });

                if (profileError) {
                    console.error("Error creating profile:", profileError);
                    // Don't show error to user - the trigger should handle this
                }

                // Auto login after signup
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email: fakeEmail,
                    password: password,
                });

                if (loginData.user) {
                    // Save to localStorage
                    const userForStorage = {
                        id: loginData.user.id,
                        email: fakeEmail,
                        username: username.toLowerCase(),
                        fullName: fullName,
                        role: role,
                        grade: grade,
                        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMY6Y7iBe8JiebVAqhC0v-bFt0EuAXYjQm77vfcIev-JKNoGAsEMznAy1PdP2ZQf1qyLRLJ5SaYzbD3_HQqfUyzC_w_0VJ5MusYl4u64NLNkPyQ3vEVBdnD4Lf0hOtwNBYpKPj3A57EionFLxmJ9qe_g6WftvZZzfC0wTJn9epeiYXTINqVAY_nfUqYtnQVxw7QOYt0w--AQdC0tZ042RxhFMMNhmc8dFPOOlSIoJEDssO3Rb8MAnIE4JLP47mGFeF5cKgQTDCZ7Q",
                        isPro: false,
                        plan: null
                    };

                    localStorage.setItem('mathocean_user', JSON.stringify(userForStorage));
                    window.dispatchEvent(new Event('authChange'));

                    toast({
                        title: "Đăng ký thành công!",
                        description: `Chào mừng ${fullName} đến với MathUp!`,
                        className: "bg-green-500 text-white border-none"
                    });

                    // Redirect based on role
                    if (role === 'teacher') {
                        navigate('/teacher/classes');
                    } else if (role === 'parent') {
                        navigate('/parent/children');
                    } else {
                        navigate('/');
                    }
                } else {
                    // Fallback: redirect to login
                    toast({
                        title: "Đăng ký thành công!",
                        description: "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.",
                        className: "bg-green-500 text-white border-none"
                    });
                    setTimeout(() => {
                        navigate('/login');
                    }, 1500);
                }
            }

        } catch (err) {
            console.error("Signup error:", err);
            toast({
                title: "Đã có lỗi xảy ra",
                description: "Vui lòng thử lại sau.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Google Font Quicksand */}
            <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <style>{`
        * {
          font-family: 'Quicksand', 'Nunito', sans-serif !important;
        }
        
        input::placeholder,
        select::placeholder,
        input::-webkit-input-placeholder,
        input::-moz-placeholder,
        input:-ms-input-placeholder {
          font-family: 'Quicksand', 'Nunito', sans-serif !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
          opacity: 1 !important;
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px white inset !important;
            -webkit-text-fill-color: #1e293b !important;
            font-family: 'Quicksand', 'Nunito', sans-serif !important;
            font-size: 1rem !important;
            font-weight: 600 !important;
            transition: background-color 5000s ease-in-out 0s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes bubble-up {
          0% { transform: translateY(100vh) scale(1); opacity: 0; }
          20% { opacity: 0.5; }
          80% { opacity: 0.5; }
          100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
        }
        
        .bubble {
          position: absolute;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          pointer-events: none;
          animation: bubble-up 10s linear infinite;
        }
        
        .floating-math {
          animation: float 6s ease-in-out infinite;
          opacity: 0.15;
          user-select: none;
          pointer-events: none;
        }
      `}</style>

            <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 100%)' }}>
                {/* Shared Header from Homepage */}
                <AppHeader />

                {/* Floating Elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="bubble w-4 h-4 left-1/4" style={{ animationDelay: '0s' }}></div>
                    <div className="bubble w-8 h-8 left-3/4" style={{ animationDelay: '2s' }}></div>
                    <div className="bubble w-6 h-6 left-1/2" style={{ animationDelay: '5s' }}></div>
                    <div className="bubble w-10 h-10 left-1/6" style={{ animationDelay: '7s' }}></div>
                    <div className="floating-math absolute top-20 left-20 text-4xl font-bold text-[#00AEEF]">a² + y + 2(n-z)³</div>
                    <div className="floating-math absolute top-40 right-20 text-4xl font-bold text-[#00AEEF]">3 - 2(-1) = 4</div>
                    <div className="floating-math absolute bottom-20 left-1/3 text-3xl font-bold text-[#00AEEF]">y = 3-11 / 2(z+3)²</div>
                    <div className="floating-math absolute bottom-40 right-1/4 text-4xl font-bold text-[#00AEEF]">a² + b√</div>
                </div>

                {/* Main Content */}
                <main className="relative z-10 container mx-auto px-4 pt-32 pb-24 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 min-h-screen">
                    {/* Mascot Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/3 flex flex-col items-center text-center space-y-6"
                    >
                        <div className="relative w-64 lg:w-96 flex justify-center">
                            <img
                                alt="MathUp Dolphin Logo"
                                className="w-64 h-64 object-contain drop-shadow-2xl"
                                src="/logo.png"
                            />
                            <div className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl border-2 border-[#00AEEF]/20 max-w-[200px]">
                                <p className="text-sm font-bold text-slate-700">
                                    Chào cậu! Hãy cùng tớ khám phá đại dương toán học nhé! 🐢✨
                                </p>
                                <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-[#00AEEF]/20"></div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Signup Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-lg"
                    >
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 lg:p-12 border border-white/50 shadow-2xl">
                            <h1 className="text-4xl font-extrabold text-center text-[#00AEEF] mb-8 uppercase tracking-widest">
                                Đăng Ký
                            </h1>

                            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                                {/* Full Name */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-slate-600 ml-2 uppercase">Họ và Tên</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00AEEF] transition-colors" size={20} />
                                        <input
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 bg-white focus:border-[#00AEEF] focus:ring-0 transition-all outline-none text-slate-800 font-semibold"
                                            placeholder="Nhập họ và tên của bạn"
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-slate-600 ml-2 uppercase">Tên Đăng Nhập</label>
                                    <div className="relative group">
                                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00AEEF] transition-colors" size={20} />
                                        <input
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 bg-white focus:border-[#00AEEF] focus:ring-0 transition-all outline-none text-slate-800 font-semibold"
                                            placeholder="3-20 ký tự, không dấu, không khoảng cách"
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                            maxLength={20}
                                        />
                                    </div>
                                </div>

                                {/* Role */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-slate-600 ml-2 uppercase">Vai trò</label>
                                    <div className="relative group">
                                        <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00AEEF] transition-colors" size={20} />
                                        <select
                                            className="w-full pl-12 pr-10 py-4 rounded-xl border-2 border-slate-200 bg-white focus:border-[#00AEEF] focus:ring-0 transition-all appearance-none text-slate-800 font-semibold cursor-pointer"
                                            required
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                        >
                                            <option value="">Chọn vai trò</option>
                                            <option value="student">Học sinh</option>
                                            <option value="teacher">Giáo viên</option>
                                            <option value="parent">Phụ huynh</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-slate-600 ml-2 uppercase">Mật khẩu</label>
                                    <div className="relative group">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00AEEF] transition-colors" size={20} />
                                        <input
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 bg-white focus:border-[#00AEEF] focus:ring-0 transition-all outline-none text-slate-800 font-semibold"
                                            placeholder="••••••••"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Grade */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-slate-600 ml-2 uppercase">Lớp</label>
                                    <div className="relative group">
                                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00AEEF] transition-colors" size={20} />
                                        <select
                                            className="w-full pl-12 pr-10 py-4 rounded-xl border-2 border-slate-200 bg-white focus:border-[#00AEEF] focus:ring-0 transition-all appearance-none text-slate-800 font-semibold cursor-pointer"
                                            value={grade}
                                            onChange={(e) => setGrade(e.target.value)}
                                        >
                                            <option value="">Chọn lớp của bạn</option>
                                            <option value="1">Lớp 1</option>
                                            <option value="2">Lớp 2</option>
                                            <option value="3">Lớp 3</option>
                                            <option value="4">Lớp 4</option>
                                            <option value="5">Lớp 5</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="pt-4 flex flex-col space-y-4">
                                    <button
                                        className="w-full bg-gradient-to-r from-[#FF8C00] to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-extrabold py-5 rounded-2xl shadow-xl transform hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-wide text-lg border-b-4 border-orange-700 flex items-center justify-center"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                        {loading ? "ĐANG TẠO..." : "ĐĂNG KÝ THÀNH VIÊN"}
                                    </button>

                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 h-px bg-slate-200"></div>
                                        <span className="text-xs font-bold text-slate-400 uppercase">Hoặc</span>
                                        <div className="flex-1 h-px bg-slate-200"></div>
                                    </div>

                                    <button
                                        className="w-full bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 transition-all"
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                const { error } = await supabase.auth.signInWithOAuth({
                                                    provider: 'google',
                                                    options: {
                                                        redirectTo: window.location.origin,
                                                        queryParams: {
                                                            access_type: 'offline',
                                                            prompt: 'consent',
                                                        },
                                                    },
                                                });
                                                if (error) throw error;
                                            } catch (error: any) {
                                                toast({
                                                    title: "Lỗi đăng ký Google",
                                                    description: error.message,
                                                    variant: "destructive"
                                                });
                                            }
                                        }}
                                    >
                                        <svg className="w-6 h-6" viewBox="0 0 48 48">
                                            <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335" />
                                            <path d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" fill="#4285F4" />
                                            <path d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" fill="#FBBC05" />
                                            <path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853" />
                                        </svg>
                                        <span>Đăng ký với Google</span>
                                    </button>
                                </div>
                            </form>

                            <p className="mt-8 text-center text-slate-600 font-semibold">
                                Đã có tài khoản? <a onClick={() => navigate('/login')} className="text-[#00AEEF] hover:underline cursor-pointer">Đăng nhập ngay</a>
                            </p>
                        </div>
                    </motion.div>
                </main>

                {/* Wave Footer */}
                <div className="fixed bottom-0 left-0 w-full h-32 pointer-events-none opacity-40">
                    <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 320">
                        <path
                            d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,224C672,245,768,235,864,202.7C960,171,1056,117,1152,101.3C1248,85,1344,107,1392,117.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                            fill="#00AEEF"
                            fillOpacity="1"
                        />
                    </svg>
                </div>
            </div>
        </>
    );
}
