import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { User, AtSign, Star, Home, Book, List } from "lucide-react";
import { useState } from "react";

// Mock data
const mockStudents = [
    { id: "student-1", fullName: "Thanh Nga", username: "thanhnga", points: 1200, grade: "5A" },
    { id: "student-2", fullName: "Trần Thị B", username: "tranthib", points: 950, grade: "5A" },
    { id: "student-3", fullName: "Lê Văn C", username: "levanc", points: 1100, grade: "5A" },
];

export default function ListStudentsInClass() {
    const [, setLocation] = useLocation();
    const [students] = useState(mockStudents);

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Task bar bên trái */}
            <div className="w-40 flex flex-col py-6 fixed h-screen bg-gray-800 items-center">
                <Button
                    onClick={() => setLocation("/")}
                    className="flex items-center w-36 h-14 mb-4 px-4 bg-gray-700 hover:bg-teal-500 text-white rounded-md shadow justify-start space-x-3"
                >
                    <Home size={24} />
                    <span className="text-base font-semibold">Home</span>
                </Button>
                <Button
                    onClick={() => setLocation("/teacher")}
                    className="flex items-center w-36 h-14 mb-4 px-4 bg-gray-700 hover:bg-teal-500 text-white rounded-md shadow justify-start space-x-3"
                >
                    <Book size={24} />
                    <span className="text-base font-semibold">Lớp</span>
                </Button>
                <Button
                    onClick={() => setLocation("/customtest")}
                    className="flex items-center w-36 h-14 mb-4 px-4 bg-gray-700 hover:bg-teal-500 text-white rounded-md shadow justify-start space-x-3"
                >
                    <List size={24} />
                    <span className="text-base font-semibold">Tạo bài</span>
                </Button>
                {/* Các nút khác nếu cần */}
            </div>

            {/* Nội dung chính */}
            <div className="flex-1 ml-40 p-6 flex flex-col items-center space-y-6">
                <h1 className="text-2xl md:text-3xl font-bold text-navy">Danh sách học sinh</h1>

                {students.length === 0 ? (
                    <p className="text-gray-500">Không có học sinh nào trong lớp.</p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
                        {students.map((student) => (
                            <Card key={student.id} className="shadow-md">
                                <CardContent className="p-4 flex flex-col space-y-2">
                                    <div className="flex items-center space-x-3">
                                        <User className="text-navy" size={20} />
                                        <p className="font-semibold text-navy">{student.fullName}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <AtSign className="text-gray-500" size={16} />
                                        <p className="text-gray-500">{student.username}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Star className="text-yellow-400" size={16} />
                                        <p className="text-gray-500">{student.points.toLocaleString()} điểm</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <p className="text-gray-500">Lớp: {student.grade}</p>
                                    </div>

                                    <Button
                                        onClick={() => setLocation(`/studentdetail`)}
                                        className="mt-2 bg-teal-500 text-white hover:bg-teal-600 w-full"
                                    >
                                        Xem chi tiết
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
