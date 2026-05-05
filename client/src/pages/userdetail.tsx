import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";
import { User, AtSign, Key, Award, Star, Calendar, BookOpen } from "lucide-react";

const mockUser = {
    id: "sample-user-1",
    username: "thanhnga",
    fullName: "Thanh Nga",
    role: "student" as const,
    grade: "9A3",
    subject: "math",
    points: 1250,
    streak: 7,
    level: 3,
    totalXP: 320,
};

export default function UserDetail() {
    const [, setLocation] = useLocation();
    const [showModePopup, setShowModePopup] = useState(false);

    const userFields = [
        { label: "Họ và tên", value: mockUser.fullName, icon: <User size={18} /> },
        { label: "Username", value: mockUser.username, icon: <AtSign size={18} /> },
        { label: "ID", value: mockUser.id, icon: <Key size={18} /> },
        { label: "Role", value: mockUser.role, icon: <Award size={18} /> },
        { label: "Lớp", value: mockUser.grade, icon: <BookOpen size={18} /> },
        { label: "Môn học", value: mockUser.subject, icon: <BookOpen size={18} /> },
        { label: "Số điểm", value: mockUser.points.toLocaleString(), icon: <Star size={18} /> },
        { label: "Chuỗi thắng", value: mockUser.streak, icon: <Calendar size={18} /> },
        { label: "Level", value: mockUser.level, icon: <Star size={18} /> },
        { label: "Tổng XP", value: mockUser.totalXP, icon: <Award size={18} /> },
    ];

    const firstHalf = userFields.slice(0, Math.ceil(userFields.length / 2));
    const secondHalf = userFields.slice(Math.ceil(userFields.length / 2));

    const modes = [
        { label: "Học sinh", path: "/" },
        { label: "Phụ huynh", path: "/parent" },
        { label: "Giáo viên", path: "/teacher" },
        { label: "Admin", path: "/admin" },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-6 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-navy">Thông tin người dùng</h1>

            <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
                {[firstHalf, secondHalf].map((fields, idx) => (
                    <Card key={idx} className="shadow-md">
                        <CardContent className="p-4 flex flex-col space-y-3">
                            {fields.map((field, i) => (
                                <div key={i} className="flex items-center space-x-3 bg-white/50 rounded-lg p-2">
                                    <div className="text-navy">{field.icon}</div>
                                    <div className="flex-1">
                                        <p className="text-gray-500 text-sm">{field.label}</p>
                                        <p className="text-navy font-semibold">{field.value}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between w-full max-w-4xl space-y-2 md:space-y-0 md:space-x-4">
                <Button
                    onClick={() => setLocation("/")}
                    className="bg-teal text-white hover:bg-teal/90 flex-1"
                >
                    Quay về
                </Button>

                <Button
                    onClick={() => setShowModePopup(true)}
                    className="bg-yellow-400 text-navy hover:bg-yellow-500 flex-1"
                >
                    Chọn chế độ
                </Button>
            </div>

            {/* Popup chọn chế độ */}
            {showModePopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
                        <h2 className="text-lg font-bold text-navy text-center">Chọn chế độ</h2>
                        <div className="flex flex-col space-y-3">
                            {modes.map((mode) => (
                                <Button
                                    key={mode.label}
                                    onClick={() => { setLocation(mode.path); setShowModePopup(false); }}
                                    className="w-full bg-teal text-white hover:bg-teal/90"
                                >
                                    {mode.label}
                                </Button>
                            ))}
                        </div>
                        <Button
                            onClick={() => setShowModePopup(false)}
                            className="w-full bg-gray-300 text-navy hover:bg-gray-400"
                        >
                            Hủy
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
