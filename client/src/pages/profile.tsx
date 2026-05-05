import { motion } from "framer-motion";
import AppHeader from "@/components/app-header";
import RoleBadge from "@/components/role-badge";
import { useLocation } from "wouter";
import { User, ChartBar, Coins, Medal, Trophy, Flame, Play, Edit, Bot, LogOut, Check, X, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface UserProfile {
    id?: string;
    user_id?: string;
    full_name: string;
    username: string;
    email: string;
    role: 'student' | 'teacher' | 'parent';
    grade: string;
    avatar: string;
}

interface GameStats {
    total_points: number;
    current_rank: number | null;
    best_rank: number | null;
    win_streak: number;
    total_wins: number;
    total_matches: number;
}

export default function Profile() {
    const [, navigate] = useLocation();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [gameStats, setGameStats] = useState<GameStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // Get initial user info from localStorage
    const storedUser = JSON.parse(localStorage.getItem('mathocean_user') || 'null');

    // State for profile data
    const [profile, setProfile] = useState<UserProfile>({
        full_name: storedUser?.fullName || '',
        username: storedUser?.username || '',
        email: storedUser?.email || '',
        role: storedUser?.role || 'student',
        grade: storedUser?.grade || '',
        avatar: storedUser?.avatar || ''
    });

    // State for edit form
    const [editForm, setEditForm] = useState<UserProfile>(profile);

    // Fetch profile from Supabase on mount
    useEffect(() => {
        if (storedUser?.id) {
            fetchProfile(storedUser.id);
            fetchGameStats(storedUser.id);
        } else {
            setLoadingStats(false);
        }
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            // 1. Get Token from LocalStorage
            let accessToken = null;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    try {
                        const sessionStr = localStorage.getItem(key);
                        if (sessionStr) {
                            const session = JSON.parse(sessionStr);
                            accessToken = session.access_token;
                            if (accessToken) break;
                        }
                    } catch (e) {
                        // silent catch
                    }
                }
            }

            if (!accessToken) {
                return;
            }

            // 2. Direct Fetch with Anti-Cache
            const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.${userId}&select=*`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                return;
            }

            const dataArr = await response.json();
            const data = dataArr && dataArr.length > 0 ? dataArr[0] : null;

            if (data) {
                const profileData: UserProfile = {
                    id: data.id,
                    user_id: data.user_id,
                    full_name: data.full_name || '',
                    username: data.username || '',
                    email: storedUser?.email || '',
                    role: data.role || 'student',
                    grade: data.grade || '',
                    avatar: data.avatar_url || storedUser?.avatar || ''
                };
                setProfile(profileData);
                setEditForm(profileData);

                // Sync latest data to localStorage so it persists even if offline later
                const updatedStoredUser = {
                    ...storedUser,
                    id: data.user_id,
                    fullName: data.full_name,
                    username: data.username,
                    role: data.role,
                    grade: data.grade,
                    avatar: data.avatar_url
                };
                localStorage.setItem('mathocean_user', JSON.stringify(updatedStoredUser));

                // FORCE UPDATE HEADER immediately after fetching fresh data
                window.dispatchEvent(new Event('authChange'));
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchGameStats = async (userId: string) => {
        setLoadingStats(true);
        // Timeout 5s để tránh treo nếu bảng chưa tồn tại
        const timeout = setTimeout(() => {
            setGameStats({ total_points: 0, current_rank: null, best_rank: null, win_streak: 0, total_wins: 0, total_matches: 0 });
            setLoadingStats(false);
        }, 5000);
        try {
            const { data: statsData } = await supabase
                .from('user_stats')
                .select('total_points, current_rank, best_rank, win_streak, total_wins, total_matches')
                .eq('user_id', userId)
                .maybeSingle();

            setGameStats({
                total_points: statsData?.total_points || 0,
                current_rank: statsData?.current_rank || null,
                best_rank: statsData?.best_rank || null,
                win_streak: statsData?.win_streak || 0,
                total_wins: statsData?.total_wins || 0,
                total_matches: statsData?.total_matches || 0
            });
        } catch (e) {
            // Bảng chưa tồn tại → hiển thị 0
            setGameStats({ total_points: 0, current_rank: null, best_rank: null, win_streak: 0, total_wins: 0, total_matches: 0 });
        } finally {
            clearTimeout(timeout);
            setLoadingStats(false);
        }
    };

    const handleEditClick = () => {
        setEditForm({ ...profile });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setEditForm({ ...profile });
        setIsEditing(false);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);

        try {
            // Try to get user ID from localStorage first
            let userId = storedUser?.id;

            // If not found, get from Supabase session
            if (!userId) {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    userId = user.id;

                    // Update localStorage with the ID
                    const updatedStoredUser = {
                        ...storedUser,
                        id: user.id,
                        email: user.email
                    };
                    localStorage.setItem('mathocean_user', JSON.stringify(updatedStoredUser));
                } else {
                    throw new Error("Không tìm thấy thông tin user. Vui lòng đăng nhập lại.");
                }
            }

            // 1. Get Access Token directly from LocalStorage (Bypass Supabase Client session management to prevent hanging)
            let accessToken = null;
            // Iterate over all keys to find the one starting with 'sb-' and ending with '-auth-token'
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    try {
                        const sessionStr = localStorage.getItem(key);
                        if (sessionStr) {
                            const session = JSON.parse(sessionStr);
                            accessToken = session.access_token;
                            if (accessToken) break;
                        }
                    } catch (e) {
                        // silent catch
                    }
                }
            }

            // Fallback: If not in localStorage, try supabase client
            if (!accessToken) {
                const { data: { session } } = await supabase.auth.getSession();
                accessToken = session?.access_token;
            }

            if (!accessToken) throw new Error("No access token found. Please login again.");

            // 2. Direct fetch (Fixed: Removed invalid _t param)
            const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.${userId}`;

            const response = await fetch(apiUrl, {
                method: 'PATCH',
                headers: {
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                body: JSON.stringify({
                    full_name: editForm.full_name,
                    username: editForm.username,
                    role: editForm.role,
                    grade: editForm.grade,
                    avatar_url: editForm.avatar,
                    updated_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                // Ignore 406 Not Acceptable errors which can happen if representation is empty but update worked
                if (response.status !== 406) {
                    throw new Error(`Supabase API Error: ${response.status} ${errorText}`);
                }
            }

            let data = null;
            try {
                const result = await response.json();
                data = result.length > 0 ? result[0] : null;
            } catch (e) {
                // silent
            }

            // Update localStorage
            const updatedUser = {
                ...storedUser,
                id: userId, // Ensure ID is saved
                fullName: editForm.full_name,
                username: editForm.username,
                role: editForm.role,
                grade: editForm.grade,
                avatar: editForm.avatar
            };
            localStorage.setItem('mathocean_user', JSON.stringify(updatedUser));

            // Update local state
            setProfile(editForm);
            setIsEditing(false);

            // Trigger auth change to update header
            window.dispatchEvent(new Event('authChange'));

            toast({
                title: "Cập nhật thành công!",
                description: "Thông tin cá nhân đã được cập nhật.",
                className: "bg-green-500 text-white border-none"
            });

        } catch (error: any) {
            console.error("❌ Error saving profile:", error);

            let errorMessage = "Không thể cập nhật thông tin. Vui lòng thử lại.";

            // Provide specific error messages
            if (error.message?.includes('user_profiles')) {
                errorMessage = "Lỗi: Bảng user_profiles chưa tồn tại. Vui lòng chạy migration SQL.";
            } else if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
                errorMessage = "Lỗi phân quyền. Vui lòng đăng nhập lại hoặc kiểm tra RLS policies.";
            } else if (error.message?.includes('đăng nhập')) {
                errorMessage = error.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast({
                title: "Lỗi cập nhật",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const user = storedUser;

    const handleLogout = async () => {
        // Show loading toast immediately
        toast({
            title: "Đang đăng xuất...",
            description: "Vui lòng đợi trong giây lát",
            className: "bg-blue-500 text-white border-none"
        });

        try {
            // Create a promise with timeout - wait max 5 seconds for Supabase
            const signOutWithTimeout = Promise.race([
                supabase.auth.signOut(),
                new Promise<{ error: Error }>((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 2000)
                )
            ]);

            await signOutWithTimeout;
        } catch (error) {
            // silent catch
        }

        // Clear all auth state
        localStorage.removeItem('mathocean_user');

        // Also try to clear Supabase storage keys
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('sb-') && key.includes('-auth-token')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            // silent
        }

        // Trigger auth change event
        window.dispatchEvent(new Event('authChange'));

        // Show toast
        toast({
            title: "Đã đăng xuất",
            description: "Bạn đã đăng xuất thành công!",
            className: "bg-green-500 text-white border-none"
        });

        // Navigate to login with delay to let toast show
        setTimeout(() => {
            window.location.href = '/login';
        }, 300);
    };

    if (!user) {
        // Redirect if not logged in (simple protection)
        setTimeout(() => navigate('/login'), 100);
        return null;
    }

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Baloo+2:wght@400;600;700;800&display=swap" rel="stylesheet" />
            <style>{`
                 body {
                    font-family: 'Baloo 2', cursive;
                    overflow-x: hidden;
                }
                .font-display {
                    font-family: 'Nunito', sans-serif;
                }
                .bubble-container {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 3px solid white;
                    box-shadow: 0 10px 30px rgba(0, 174, 239, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.5);
                    border-radius: 32px;
                }
                .bg-underwater {
                    background: linear-gradient(180deg, #EAF6FF 0%, #BEE3F8 100%);
                    position: relative;
                }
                .bubble-float {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    border-radius: 50%;
                    pointer-events: none;
                    box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.05), inset 5px 5px 10px rgba(255, 255, 255, 0.8);
                }
                .btn-bubble {
                    box-shadow: 0 6px 0 #0088cc;
                    transition: all 0.1s ease;
                }
                .btn-bubble:active {
                    box-shadow: 0 0px 0 #0088cc;
                    transform: translateY(6px);
                }
                .stat-card {
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 8px 15px rgba(0,0,0,0.05);
                    transition: transform 0.2s ease;
                }
                .stat-card:hover {
                    transform: scale(1.02);
                }
                .text-primary { color: #00AEEF; }
                .text-secondary { color: #FF9F1C; }
                .text-navy-blue { color: #0A2463; }
                .bg-primary { background-color: #00AEEF; }
                .bg-secondary { background-color: #FF9F1C; }
                .border-primary { border-color: #00AEEF; }

      `}</style>
            <div className="min-h-screen bg-underwater">
                {/* Unified Header */}
                <AppHeader />

                {/* Floating Bubbles */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="bubble-float w-12 h-12 left-[10%] top-[20%]"></div>
                    <div className="bubble-float w-20 h-20 left-[80%] top-[15%]"></div>
                    <div className="bubble-float w-16 h-16 left-[45%] top-[65%]"></div>
                    <div className="bubble-float w-8 h-8 left-[75%] top-[80%]"></div>
                    <div className="bubble-float w-32 h-32 left-[5%] top-[70%]"></div>
                </div>

                <main className="relative z-10 container mx-auto px-4 py-12 pt-32">
                    <div className="flex flex-col items-center mb-12">
                        <div className="relative">
                            {/* Role Badge - Floating on top of avatar */}
                            <motion.div
                                initial={{ scale: 0, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15,
                                    delay: 0.3
                                }}
                                className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                            >
                                <RoleBadge role={user.role || 'student'} size="lg" />
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className={`w-40 h-40 rounded-full ${user.isPro ? 'bg-[conic-gradient(from_0deg,#4285F4,#EA4335,#FBBC05,#34A853,#4285F4)] p-[4px]' : 'border-8 border-white'} shadow-2xl bg-white mb-4 relative flex items-center justify-center`}
                            >
                                <div className={`w-full h-full rounded-full overflow-hidden ${user.isPro ? 'border-4 border-white bg-white' : ''}`}>
                                    <img
                                        alt="User Avatar"
                                        className="w-full h-full object-cover rounded-full"
                                        src={user.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBMY6Y7iBe8JiebVAqhC0v-bFt0EuAXYjQm77vfcIev-JKNoGAsEMznAy1PdP2ZQf1qyLRLJ5SaYzbD3_HQqfUyzC_w_0VJ5MusYl4u64NLNkPyQ3vEVBdnD4Lf0hOtwNBYpKPj3A57EionFLxmJ9qe_g6WftvZZzfC0wTJn9epeiYXTINqVAY_nfUqYtnQVxw7QOYt0w--AQdC0tZ042RxhFMMNhmc8dFPOOlSIoJEDssO3Rb8MAnIE4JLP47mGFeF5cKgQTDCZ7Q"}
                                    />
                                </div>
                            </motion.div>
                            <button
                                onClick={handleEditClick}
                                disabled={isEditing}
                                className={`absolute bottom-4 right-0 ${isEditing ? 'bg-gray-400' : 'bg-secondary hover:bg-[#E68A0A]'} text-white p-2 rounded-full border-4 border-white shadow-lg cursor-pointer transition-colors disabled:cursor-not-allowed`}
                            >
                                <Edit size={20} />
                            </button>
                        </div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl font-extrabold text-navy-blue"
                        >
                            {user.fullName || "Người dùng"}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-primary font-bold text-xl"
                        >
                            Thám hiểm đại dương • Cấp độ 12
                        </motion.p>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="mt-4 flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
                        >
                            <LogOut size={20} /> Đăng xuất
                        </button>

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        <div className="bubble-container p-10 flex flex-col space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-black text-navy-blue flex items-center gap-2">
                                    <User className="text-primary" size={28} /> THÔNG TIN CÁ NHÂN
                                </h2>
                                {isEditing && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={isSaving}
                                            className="flex items-center gap-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            <X size={16} /> Hủy
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="flex items-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            <Check size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu'}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                {/* Full Name */}
                                <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl">
                                    <span className="font-bold text-slate-500">HỌ VÀ TÊN:</span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.full_name}
                                            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                            className="font-black text-navy-blue uppercase bg-white px-3 py-1 rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="Nhập họ và tên"
                                        />
                                    ) : (
                                        <span className="font-black text-navy-blue uppercase">{profile.full_name || "Chưa cập nhật"}</span>
                                    )}
                                </div>

                                {/* Username */}
                                <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl">
                                    <span className="font-bold text-slate-500">USERNAME:</span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.username}
                                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                            className="font-black text-navy-blue bg-white px-3 py-1 rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="Nhập username"
                                        />
                                    ) : (
                                        <span className="font-black text-navy-blue">{profile.username || "user123"}</span>
                                    )}
                                </div>

                                {/* Email - Read Only */}
                                <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl">
                                    <span className="font-bold text-slate-500">EMAIL:</span>
                                    <span className="font-black text-navy-blue">{profile.email || "user@example.com"}</span>
                                </div>

                                {/* Role */}
                                <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl">
                                    <span className="font-bold text-slate-500">VAI TRÒ:</span>
                                    {isEditing ? (
                                        <select
                                            value={editForm.role}
                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'student' | 'teacher' | 'parent' })}
                                            className="font-black text-primary uppercase bg-white px-3 py-1 rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="student">Học sinh</option>
                                            <option value="teacher">Giáo viên</option>
                                            <option value="parent">Phụ huynh</option>
                                        </select>
                                    ) : (
                                        <span className="font-black text-primary uppercase">
                                            {profile.role === 'student' ? 'Học sinh' : profile.role === 'teacher' ? 'Giáo viên' : 'Phụ huynh'}
                                        </span>
                                    )}
                                </div>

                                {/* Grade */}
                                <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl">
                                    <span className="font-bold text-slate-500">LỚP:</span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.grade}
                                            onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                                            className="font-black text-navy-blue bg-white px-3 py-1 rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="Ví dụ: 3A2"
                                        />
                                    ) : (
                                        <span className="font-black text-navy-blue">
                                            {profile.grade || "Chưa cập nhật"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bubble-container p-10 flex flex-col space-y-6">
                            <h2 className="text-2xl font-black text-navy-blue flex items-center gap-2 mb-4">
                                <ChartBar className="text-secondary" size={28} /> THÀNH TÍCH HỌC TẬP
                            </h2>
                            {!gameStats || (gameStats.total_matches === 0 && gameStats.total_points === 0) ? (
                                /* Chưa có dữ liệu */
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Lock size={48} className="text-gray-300 mb-4" />
                                    <p className="font-black text-gray-400 text-lg">Chưa có thành tích</p>
                                    <p className="text-gray-400 text-sm mt-2">Tham gia Gameshow để có thống kê!</p>
                                    <button
                                        onClick={() => navigate('/gameshow')}
                                        className="mt-6 bg-primary text-white font-black py-3 px-8 rounded-full text-base hover:bg-[#0097D6] transition-colors"
                                    >
                                        🏆 Vào Gameshow
                                    </button>
                                </div>
                            ) : (
                                /* Có dữ liệu */
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="stat-card p-5 border-b-4 border-yellow-400 flex flex-col items-center text-center">
                                            <div className="w-12 h-12 mb-2 bg-yellow-100 rounded-full flex items-center justify-center">
                                                <Coins className="text-yellow-500" size={32} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 uppercase">Số điểm</span>
                                            <span className="text-2xl font-black text-navy-blue">
                                                {gameStats.total_points.toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className="stat-card p-5 border-b-4 border-orange-400 flex flex-col items-center text-center">
                                            <div className="w-12 h-12 mb-2 bg-orange-100 rounded-full flex items-center justify-center">
                                                <Medal className="text-orange-500" size={32} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 uppercase">Vị trí trên BXH</span>
                                            <span className="text-2xl font-black text-navy-blue">
                                                {gameStats.current_rank ? `#${gameStats.current_rank}` : '—'}
                                            </span>
                                        </div>
                                        <div className="stat-card p-5 border-b-4 border-blue-400 flex flex-col items-center text-center">
                                            <div className="w-12 h-12 mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Trophy className="text-blue-500" size={32} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 uppercase">Vị trí cao nhất</span>
                                            <span className="text-2xl font-black text-navy-blue">
                                                {gameStats.best_rank ? `#${gameStats.best_rank}` : '—'}
                                            </span>
                                        </div>
                                        <div className="stat-card p-5 border-b-4 border-red-400 flex flex-col items-center text-center">
                                            <div className="w-12 h-12 mb-2 bg-red-100 rounded-full flex items-center justify-center">
                                                <Flame className="text-red-500" size={32} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 uppercase">Chuỗi thắng</span>
                                            <span className="text-2xl font-black text-navy-blue">
                                                {gameStats.win_streak} Trận
                                            </span>
                                        </div>
                                    </div>
                                    <div className="stat-card p-5 border-b-4 border-green-400 flex justify-between items-center w-full">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-full">
                                                <Play className="text-green-500" size={24} />
                                            </div>
                                            <span className="font-bold text-slate-600">TỆ LỆ THắNG</span>
                                        </div>
                                        <span className="text-2xl font-black text-green-600">
                                            {gameStats.total_matches > 0
                                                ? `${Math.round((gameStats.total_wins / gameStats.total_matches) * 100)}%`
                                                : '—'
                                            }
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center mt-12 mb-24">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-primary btn-bubble text-white font-black py-4 px-12 rounded-full text-2xl uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:bg-[#0097D6]"
                        >
                            QUAY LẠI
                        </button>
                    </div>
                </main>

                <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none opacity-40">
                    <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
                        <path
                            d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                            fill="#00AEEF"></path>
                    </svg>
                </div>


            </div>
        </>
    );
}
