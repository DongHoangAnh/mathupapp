import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { User, Users, AtSign, Star } from "lucide-react";
import { useState } from "react";

// Mock data
const mockChildren = [
    {
        id: "sample-user-1",
        username: "thanhnga",
        fullName: "Thanh Nga",
        points: 1250,
        grade: "9A3",
        role: "student",
    },
    {
        id: "sample-user-1",
        fullName: "Hoàng Việt",
        username: "hoangviet",
        points: 750,
        grade: "7B1",
        role: "student",
    },
];

export default function ListChildAccounts() {
    const [, setLocation] = useLocation();
    const [children] = useState(mockChildren);

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-navy">Danh sách tài khoản con</h1>

            {children.length === 0 ? (
                <p className="text-gray-500">Không có tài khoản con nào.</p>
            ) : (
                <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
                    {children.map((child) => (
                        <Card key={child.id} className="shadow-md">
                            <CardContent className="p-4 flex flex-col space-y-2">
                                <div className="flex items-center space-x-3">
                                    <User className="text-navy" size={20} />
                                    <p className="font-semibold text-navy">{child.fullName}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <AtSign className="text-gray-500" size={16} />
                                    <p className="text-gray-500">{child.username}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Star className="text-yellow-400" size={16} />
                                    <p className="text-gray-500">{child.points.toLocaleString()} điểm</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Users className="text-gray-500" size={16} />
                                    <p className="text-gray-500">Lớp: {child.grade}</p>
                                </div>

                                <Button
                                    onClick={() => setLocation(`/studentdetail`)}
                                    className="mt-2 bg-teal text-white hover:bg-teal/90 w-full"
                                >
                                    Xem chi tiết
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
