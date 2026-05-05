import RoleBadge from "@/components/role-badge";
import AppHeader from "@/components/app-header";

/**
 * Demo page để test Role Badge component
 * Route: /role-demo
 */
export default function RoleDemo() {
    return (
        <>
            <AppHeader />

            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 pt-32 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-black text-[#0A2463] mb-4">
                            🎭 DEMO HỆ THỐNG ROLE
                        </h1>
                        <p className="text-xl text-gray-600 font-semibold">
                            3 Vai trò trong MathUp Platform
                        </p>
                    </div>

                    {/* Role Badges - Size Comparison */}
                    <div className="bg-white rounded-3xl p-12 shadow-2xl mb-12 border-4 border-white">
                        <h2 className="text-3xl font-black text-[#0A2463] mb-8 text-center">
                            📏 Kích Thước Badge
                        </h2>

                        {/* Small */}
                        <div className="mb-10">
                            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Small (sm) - Dùng ở Header</h3>
                            <div className="flex items-center gap-4 flex-wrap">
                                <RoleBadge role="student" size="sm" />
                                <RoleBadge role="teacher" size="sm" />
                                <RoleBadge role="parent" size="sm" />
                            </div>
                        </div>

                        {/* Medium */}
                        <div className="mb-10">
                            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Medium (md)</h3>
                            <div className="flex items-center gap-4 flex-wrap">
                                <RoleBadge role="student" size="md" />
                                <RoleBadge role="teacher" size="md" />
                                <RoleBadge role="parent" size="md" />
                            </div>
                        </div>

                        {/* Large */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Large (lg) - Dùng ở Profile</h3>
                            <div className="flex items-center gap-4 flex-wrap">
                                <RoleBadge role="student" size="lg" />
                                <RoleBadge role="teacher" size="lg" />
                                <RoleBadge role="parent" size="lg" />
                            </div>
                        </div>
                    </div>

                    {/* Role Details */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {/* Student Card */}
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all">
                            <div className="flex justify-center mb-6">
                                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl">
                                    🎓
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-center mb-4">HỌC SINH</h3>
                            <ul className="space-y-2 text-sm font-semibold">
                                <li>✓ Làm bài kiểm tra</li>
                                <li>✓ Học theo lộ trình</li>
                                <li>✓ Chơi game show</li>
                                <li>✓ Xem bảng xếp hạng</li>
                                <li>✓ Chat với AI</li>
                            </ul>
                            <div className="mt-6 flex justify-center">
                                <RoleBadge role="student" size="lg" className="bg-white/20" />
                            </div>
                        </div>

                        {/* Teacher Card */}
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all">
                            <div className="flex justify-center mb-6">
                                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl">
                                    👨‍🏫
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-center mb-4">GIÁO VIÊN</h3>
                            <ul className="space-y-2 text-sm font-semibold">
                                <li>✓ Quản lý lớp học</li>
                                <li>✓ Tạo bài kiểm tra</li>
                                <li>✓ Xem tiến độ học sinh</li>
                                <li>✓ Phân tích báo cáo</li>
                                <li>✓ Tạo lộ trình học</li>
                            </ul>
                            <div className="mt-6 flex justify-center">
                                <RoleBadge role="teacher" size="lg" className="bg-white/20" />
                            </div>
                        </div>

                        {/* Parent Card */}
                        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all">
                            <div className="flex justify-center mb-6">
                                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl">
                                    👨‍👩‍👧
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-center mb-4">PHỤ HUYNH</h3>
                            <ul className="space-y-2 text-sm font-semibold">
                                <li>✓ Xem tài khoản con</li>
                                <li>✓ Theo dõi tiến độ</li>
                                <li>✓ Nhận báo cáo định kỳ</li>
                                <li>✓ Xem thông báo</li>
                                <li>✓ Xem điểm yếu</li>
                            </ul>
                            <div className="mt-6 flex justify-center">
                                <RoleBadge role="parent" size="lg" className="bg-white/20" />
                            </div>
                        </div>
                    </div>

                    {/* Usage Examples */}
                    <div className="bg-white rounded-3xl p-12 shadow-2xl border-4 border-white mb-12">
                        <h2 className="text-3xl font-black text-[#0A2463] mb-8 text-center">
                            💻 Ví Dụ Sử Dụng
                        </h2>

                        <div className="space-y-6">
                            {/* Example 1 - Avatar with Badge */}
                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <h4 className="font-bold text-gray-700 mb-4">1. Avatar với Role Badge (Header)</h4>
                                <div className="flex items-start gap-6 flex-wrap">
                                    {/* Student */}
                                    <div className="relative">
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                                            <RoleBadge role="student" size="sm" />
                                        </div>
                                        <div className="w-12 h-12 rounded-full border-4 border-blue-500 overflow-hidden bg-gray-200">
                                            <div className="w-full h-full flex items-center justify-center text-2xl">👦</div>
                                        </div>
                                    </div>

                                    {/* Teacher */}
                                    <div className="relative">
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                                            <RoleBadge role="teacher" size="sm" />
                                        </div>
                                        <div className="w-12 h-12 rounded-full border-4 border-purple-500 overflow-hidden bg-gray-200">
                                            <div className="w-full h-full flex items-center justify-center text-2xl">👨‍🏫</div>
                                        </div>
                                    </div>

                                    {/* Parent */}
                                    <div className="relative">
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                                            <RoleBadge role="parent" size="sm" />
                                        </div>
                                        <div className="w-12 h-12 rounded-full border-4 border-orange-500 overflow-hidden bg-gray-200">
                                            <div className="w-full h-full flex items-center justify-center text-2xl">👨</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Example 2 - Profile Avatar */}
                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <h4 className="font-bold text-gray-700 mb-4">2. Profile Avatar với Large Badge</h4>
                                <div className="flex items-start gap-6 flex-wrap">
                                    <div className="relative">
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                            <RoleBadge role="student" size="lg" />
                                        </div>
                                        <div className="w-32 h-32 rounded-full border-8 border-white shadow-xl overflow-hidden bg-gradient-to-br from-blue-400 to-cyan-400">
                                            <div className="w-full h-full flex items-center justify-center text-6xl">👧</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Code Example */}
                            <div className="bg-gray-900 p-6 rounded-2xl">
                                <h4 className="font-bold text-white mb-4">3. Code Example</h4>
                                <pre className="text-green-400 text-sm overflow-x-auto">
                                    {`import RoleBadge from "@/components/role-badge";

// Sử dụng trong component
<RoleBadge role="student" size="sm" />
<RoleBadge role="teacher" size="md" />
<RoleBadge role="parent" size="lg" />`}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="text-center pb-20">
                        <a
                            href="/"
                            className="inline-block bg-[#00AEEF] hover:bg-[#0097D6] text-white font-black px-12 py-4 rounded-full text-xl transition-all transform hover:scale-105 shadow-xl"
                        >
                            ← QUAY LẠI TRANG CHỦ
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
