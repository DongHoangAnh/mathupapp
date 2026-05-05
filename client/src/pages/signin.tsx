import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import AppHeader from "@/components/app-header";
import { User, Lock, IdCard, ChevronDown, ArrowLeft, Mail, Loader2, AtSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function SignIn() {
    const [, navigate] = useLocation();
    const { toast } = useToast();
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let email = usernameOrEmail;

            // If input doesn't contain @, treat it as username and look up email
            if (!usernameOrEmail.includes('@')) {
                // Query directly from user_profiles table
                const { data: profileData, error: lookupError } = await supabase
                    .from('user_profiles')
                    .select('email')
                    .ilike('username', usernameOrEmail)
                    .maybeSingle();

                if (lookupError) {
                    console.error('Lookup error:', lookupError);
                    toast({
                        title: "Đăng nhập thất bại",
                        description: "Lỗi kết nối cơ sở dữ liệu",
                        variant: "destructive"
                    });
                    setLoading(false);
                    return;
                }

                if (!profileData || !profileData.email) {
                    toast({
                        title: "Đăng nhập thất bại",
                        description: "Tên đăng nhập không tồn tại",
                        variant: "destructive"
                    });
                    setLoading(false);
                    return;
                }
                email = profileData.email;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast({
                    title: "Đăng nhập thất bại",
                    description: error.message === "Invalid login credentials"
                        ? "Tên đăng nhập/Email hoặc mật khẩu không chính xác"
                        : error.message,
                    variant: "destructive"
                });
                return;
            }

            if (data.user) {
                // Get user metadata
                const metadata = data.user.user_metadata || {};

                // Double check pro status directly from DB to avoid any delay
                let isPro = metadata.isPro || false;
                let plan = metadata.plan || null;
                try {
                    const { data: subData, error: subError } = await supabase
                        .from('subscriptions')
                        .select('plan_type, end_date, status')
                        .eq('user_id', data.user.id)
                        .eq('status', 'active')
                        .order('end_date', { ascending: false })
                        .limit(1);

                    if (!subError && subData && subData.length > 0) {
                        const currentSub = subData[0];
                        const endDate = currentSub.end_date ? new Date(currentSub.end_date) : new Date(8640000000000000);
                        if (endDate > new Date()) {
                            isPro = true;
                            plan = currentSub.plan_type;
                        }
                    }
                } catch (e) {
                    console.error('Failed to fetch subscription on login:', e);
                }

                // Fetch username and grade from user_profiles
                let username = metadata.username || metadata.full_name || (data.user.email ? data.user.email.split('@')[0] : 'User');
                let userGrade = metadata.grade || '';
                try {
                    const { data: profileData } = await supabase
                        .from('user_profiles')
                        .select('username, full_name, grade')
                        .eq('user_id', data.user.id)
                        .maybeSingle();

                    if (profileData) {
                        username = profileData.username || username;
                        userGrade = profileData.grade || userGrade;
                    }
                } catch (e) {
                    console.error('Failed to fetch profile:', e);
                }

                // Check if user has assessment data in database
                // If not, clear localStorage to start fresh
                try {
                    const { data: assessmentData } = await supabase
                        .from('user_assessment_results')
                        .select('id')
                        .eq('user_id', data.user.id)
                        .maybeSingle();

                    if (!assessmentData) {
                        // New user or no assessment - clear old data from other accounts
                        localStorage.removeItem('onboarding');
                        localStorage.removeItem('mathocean_has_assessment');
                        localStorage.removeItem('mathocean_last_analysis');
                        localStorage.removeItem('math_learning_duration');
                        localStorage.removeItem('math_knowledge_map');
                    }
                } catch (e) {
                    // If table doesn't exist or error, clear to be safe
                    localStorage.removeItem('onboarding');
                    localStorage.removeItem('mathocean_has_assessment');
                    localStorage.removeItem('mathocean_last_analysis');
                    localStorage.removeItem('math_learning_duration');
                    localStorage.removeItem('math_knowledge_map');
                }

                // Construct user object for local storage compatibility
                const userForStorage = {
                    id: data.user.id,
                    email: data.user.email,
                    username: username,
                    fullName: metadata.full_name || username,
                    role: metadata.role || '', // Don't default - let modal show if needed
                    grade: userGrade,
                    avatar: metadata.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBMY6Y7iBe8JiebVAqhC0v-bFt0EuAXYjQm77vfcIev-JKNoGAsEMznAy1PdP2ZQf1qyLRLJ5SaYzbD3_HQqfUyzC_w_0VJ5MusYl4u64NLNkPyQ3vEVBdnD4Lf0hOtwNBYpKPj3A57EionFLxmJ9qe_g6WftvZZzfC0wTJn9epeiYXTINqVAY_nfUqYtnQVxw7QOYt0w--AQdC0tZ042RxhFMMNhmc8dFPOOlSIoJEDssO3Rb8MAnIE4JLP47mGFeF5cKgQTDCZ7Q",
                    isPro,
                    plan
                };

                localStorage.setItem('mathocean_user', JSON.stringify(userForStorage));

                // Notify other components (Header) about the change
                window.dispatchEvent(new Event('authChange'));

                toast({
                    title: "Đăng nhập thành công!",
                    description: `Chào mừng quay trở lại, ${userForStorage.fullName || userForStorage.username}!`,
                    className: "bg-green-500 text-white border-none"
                });

                // Redirect based on role or return URL
                const redirectTo = new URLSearchParams(window.location.search).get('redirect');
                if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
                    navigate(redirectTo);
                } else if (metadata.role === 'teacher') {
                    navigate('/teacher/classes');
                } else if (metadata.role === 'parent') {
                    navigate('/parent/children');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            console.error("Login error:", err);
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
          font-size: 1.125rem !important;
          font-weight: 700 !important;
          opacity: 1 !important;
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #f8fafc inset !important;
            -webkit-text-fill-color: #0A2463 !important;
            font-family: 'Quicksand', 'Nunito', sans-serif !important;
            font-size: 1.125rem !important;
            font-weight: 700 !important;
            transition: background-color 5000s ease-in-out 0s;
        }
        
        .bubble {
          position: absolute;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          pointer-events: none;
          box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.05), inset 5px 5px 10px rgba(255, 255, 255, 0.8);
        }
        
        .floating-math {
          opacity: 0.1;
          user-select: none;
          pointer-events: none;
        }
      `}</style>

            <div className="min-h-screen" style={{ background: '#EAF6FF' }}>
                {/* Shared Header from Homepage */}
                <AppHeader />

                {/* Floating Elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="bubble w-12 h-12 left-[10%] top-[20%]"></div>
                    <div className="bubble w-20 h-20 left-[80%] top-[15%]"></div>
                    <div className="bubble w-16 h-16 left-[40%] top-[70%]"></div>
                    <div className="bubble w-8 h-8 left-[70%] top-[85%]"></div>
                    <div className="bubble w-24 h-24 left-[5%] top-[60%]"></div>
                    <div className="floating-math absolute top-32 left-1/4 text-5xl font-extrabold text-[#00AEEF]">1 + 1 = 2</div>
                    <div className="floating-math absolute bottom-32 right-1/4 text-5xl font-extrabold text-[#00AEEF]">x &gt; y</div>
                    <div className="floating-math absolute top-1/2 left-1/2 text-5xl font-extrabold text-[#00AEEF]">√16</div>
                </div>

                {/* Main Content */}
                <main className="relative z-10 container mx-auto px-4 pt-32 pb-24 flex flex-col lg:flex-row items-center justify-center gap-16 min-h-screen">
                    {/* Mascot Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/3 flex flex-col items-center"
                    >
                        <div className="relative w-72 lg:w-full max-w-md flex justify-center">
                            <img
                                alt="MathUp Dolphin Logo"
                                className="w-64 h-64 object-contain drop-shadow-2xl"
                                src="/logo.png"
                            />
                            <div className="absolute -top-12 -right-8 bg-white p-5 rounded-3xl shadow-xl border-2 border-[#00AEEF]/10 max-w-[220px]">
                                <p className="text-sm font-bold text-[#0A2463] leading-relaxed">
                                    Chào mừng bạn trở lại! Hãy đăng nhập để tiếp tục thám hiểm đại dương nhé! 🐢✨
                                </p>
                                <div className="absolute -bottom-2 left-6 w-5 h-5 bg-white rotate-45 border-r-2 border-b-2 border-[#00AEEF]/5"></div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Login Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-lg"
                    >
                        <div className="bg-white rounded-3xl p-10 lg:p-14 border border-white/60 shadow-2xl">
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
                                    <User size={40} className="text-slate-400" />
                                </div>
                            </div>

                            <h1 className="text-3xl font-extrabold text-center text-[#0A2463] mb-10 uppercase tracking-wider">
                                ĐĂNG NHẬP
                            </h1>

                            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                                {/* Username or Email */}
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00AEEF]/60 group-focus-within:text-[#00AEEF] transition-colors" size={20} />
                                        <input
                                            className="w-full pl-14 pr-6 py-5 rounded-full border-2 border-slate-100 bg-slate-50 focus:border-[#00AEEF] focus:bg-white focus:ring-0 transition-all outline-none text-[#0A2463] font-bold text-lg"
                                            placeholder="TÊN ĐĂNG NHẬP HOẶC EMAIL"
                                            type="text"
                                            required
                                            value={usernameOrEmail}
                                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00AEEF]/60 group-focus-within:text-[#00AEEF] transition-colors" size={20} />
                                        <input
                                            className="w-full pl-14 pr-6 py-5 rounded-full border-2 border-slate-100 bg-slate-50 focus:border-[#00AEEF] focus:bg-white focus:ring-0 transition-all outline-none text-[#0A2463] font-bold text-lg"
                                            placeholder="MẬT KHẨU"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Links: Register & Forgot Password */}
                                <div className="flex items-center justify-between px-1 pt-2">
                                    <a
                                        onClick={() => navigate('/signup')}
                                        className="text-[#FF9F1C] hover:text-[#E68A0A] font-bold text-sm transition-colors border-b-2 border-transparent hover:border-[#FF9F1C] uppercase tracking-wide cursor-pointer"
                                    >
                                        ĐĂNG KÝ TÀI KHOẢN
                                    </a>
                                    <a className="text-[#00AEEF] hover:text-[#0A2463] font-bold text-sm transition-colors border-b-2 border-transparent hover:border-[#00AEEF] uppercase tracking-wide cursor-pointer">
                                        QUÊN MẬT KHẨU
                                    </a>
                                </div>

                                {/* Submit Buttons */}
                                <div className="pt-4 space-y-4">
                                    <button
                                        className="w-full bg-[#FF9F1C] hover:bg-[#E68A0A] text-white font-extrabold py-5 rounded-full shadow-lg text-xl uppercase tracking-widest transition-all transform hover:-translate-y-1 border-b-4 border-[#CC7700] flex items-center justify-center"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                        {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
                                    </button>

                                    <button
                                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-4 rounded-full font-bold text-[#0A2463] hover:bg-slate-50 transition-colors shadow-sm"
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
                                                    title: "Lỗi đăng nhập Google",
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
                                        <span>Đăng nhập với Google</span>
                                    </button>
                                </div>
                            </form>

                            <p className="mt-8 text-center text-slate-400 font-bold">
                                <a onClick={() => navigate('/')} className="text-[#0A2463]/60 hover:text-[#00AEEF] transition-colors flex items-center justify-center gap-2 cursor-pointer">
                                    <ArrowLeft size={16} /> Quay lại trang chủ
                                </a>
                            </p>
                        </div>
                    </motion.div>
                </main>

                {/* Wave Footer */}
                <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none opacity-30">
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
