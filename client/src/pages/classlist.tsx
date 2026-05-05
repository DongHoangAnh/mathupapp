import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Book, User, Users } from "lucide-react";
import { useState } from "react";

// Mock data
const mockClasses = [
    { id: "class-1", name: "Toán 5A", teacher: "Thầy An", studentCount: 25 },
    { id: "class-2", name: "Toán 5B", teacher: "Cô Bình", studentCount: 28 },
    { id: "class-3", name: "Toán 6A", teacher: "Thầy Cường", studentCount: 30 },
];

export default function ListClasses() {
    const [, setLocation] = useLocation();
    const [classes] = useState(mockClasses);

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-navy">Danh sách lớp</h1>

            {classes.length === 0 ? (
                <p className="text-gray-500">Không có lớp nào.</p>
            ) : (
                <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
                    {classes.map((cls) => (
                        <Card key={cls.id} className="shadow-md">
                            <CardContent className="p-4 flex flex-col space-y-2">
                                <div className="flex items-center space-x-3">
                                    <Book className="text-indigo-500" size={20} />
                                    <p className="font-semibold text-navy">{cls.name}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <User className="text-gray-500" size={16} />
                                    <p className="text-gray-500">Giáo viên: {cls.teacher}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Users className="text-gray-500" size={16} />
                                    <p className="text-gray-500">Số học sinh: {cls.studentCount}</p>
                                </div>

                                <Button
                                    onClick={() => setLocation(`/classdetail`)}
                                    className="mt-2 bg-indigo-500 text-white hover:bg-indigo-600 w-full"
                                >
                                    Chi tiết lớp học
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
