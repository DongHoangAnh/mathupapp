import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock data
const mockUsers = [
    { id: "1", fullName: "Thanh Nga", username: "thanhnga", role: "student", banned: false },
    { id: "2", fullName: "Hoàng Việt", username: "hoangviet", role: "student", banned: true },
    { id: "3", fullName: "Nguyễn Lan", username: "nguyenlan", role: "parent", banned: false },
    { id: "4", fullName: "Trần Bình", username: "tranbinh", role: "teacher", banned: false },
];

export default function ListUsers() {
    const [users, setUsers] = useState(mockUsers);
    const [search, setSearch] = useState("");

    const handleToggleBan = (id: string) => {
        setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, banned: !u.banned } : u))
        );
    };

    const filteredUsers = users.filter(
        (u) =>
            u.fullName.toLowerCase().includes(search.toLowerCase()) ||
            u.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold mb-4">Danh sách người dùng</h1>

            {/* Search */}
            <Input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4 max-w-sm"
            />

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tên</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Username</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Role</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                        <tr key={user.id}>
                            <td className="px-4 py-2">{user.fullName}</td>
                            <td className="px-4 py-2">{user.username}</td>
                            <td className="px-4 py-2 capitalize">{user.role}</td>
                            <td className="px-4 py-2">
                                {user.banned ? (
                                    <span className="text-red-500 font-semibold">Bị chặn</span>
                                ) : (
                                    <span className="text-green-500 font-semibold">Hoạt động</span>
                                )}
                            </td>
                            <td className="px-4 py-2">
                                <Button
                                    onClick={() => handleToggleBan(user.id)}
                                    className={`px-4 py-1 rounded ${
                                        user.banned ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
                                    }`}
                                >
                                    {user.banned ? "Unban" : "Ban"}
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="p-4 text-gray-500 text-center">Không tìm thấy người dùng.</div>
                )}
            </div>
        </div>
    );
}
