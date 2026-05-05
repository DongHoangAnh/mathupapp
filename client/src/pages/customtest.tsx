import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function AddCustomTest() {
    const [testName, setTestName] = useState("");
    const [subject, setSubject] = useState("");
    const [questions, setQuestions] = useState("");

    const handleCreateTest = () => {
        if (!testName || !subject || !questions) {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }
        // Demo: chỉ log ra console
        console.log("Tạo đề kiểm tra mới:", { testName, subject, questions });
        alert("Đề kiểm tra được tạo thành công!");
        setTestName("");
        setSubject("");
        setQuestions("");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-navy mb-6">Tạo đề kiểm tra tùy chỉnh</h1>

            <Card className="w-full max-w-xl shadow-md">
                <CardContent className="p-6 flex flex-col space-y-4">
                    <div className="flex flex-col">
                        <label className="text-gray-700 font-semibold mb-1">Tên đề kiểm tra</label>
                        <Input
                            value={testName}
                            onChange={(e) => setTestName(e.target.value)}
                            placeholder="Nhập tên đề kiểm tra"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-gray-700 font-semibold mb-1">Môn học</label>
                        <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Nhập môn học"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-gray-700 font-semibold mb-1">Câu hỏi / Nội dung đề</label>
                        <Textarea
                            value={questions}
                            onChange={(e) => setQuestions(e.target.value)}
                            placeholder="Nhập các câu hỏi, mỗi câu 1 dòng"
                            rows={6}
                        />
                    </div>

                    <Button
                        onClick={handleCreateTest}
                        className="bg-teal-500 hover:bg-teal-600 text-white w-full"
                    >
                        Tạo đề kiểm tra
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
