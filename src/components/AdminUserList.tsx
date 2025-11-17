"use client";

import { User } from "@prisma/client";
import { toggleUserBlock } from "@/actions/admin";
import { useRouter } from "next/navigation";

interface AdminUserListProps {
  users: User[];
  currentAdminId: number;
}

export default function AdminUserList({ users, currentAdminId }: AdminUserListProps) {
  const router = useRouter();

  const handleToggleBlock = async (userId: number) => {
    if (userId === currentAdminId) {
      alert("自分自身をブロックすることはできません。");
      return;
    }
    
    // Server Actionを呼び出し
    const result = await toggleUserBlock(userId);

    if (result.error) {
      alert(`エラー: ${result.error}`);
    } else {
      router.refresh(); // 画面を更新して状態を反映
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メール</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状態</th>
            <th className="px-6 py-3">アクション</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name || "N/A"}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {user.isBlocked ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    ブロック中
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    アクティブ
                  </span>
                )}
                {user.isAdmin && (
                  <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Admin
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleToggleBlock(user.id)}
                  disabled={user.id === currentAdminId}
                  className={`p-2 rounded text-white text-xs ${
                    user.isBlocked
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {user.isBlocked ? "ブロック解除" : "ブロック"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
