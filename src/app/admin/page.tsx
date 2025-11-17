import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminUserList from "@/components/AdminUserList";
import { addBlockedWord } from "@/actions/admin"; 
import BlockedWordList from "@/components/BlockedWordList";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;

  if (!currentUserId) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { isAdmin: true },
  });

  if (!currentUser?.isAdmin) {
    return (
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-red-600">アクセス拒否</h1>
        <p>このページにアクセスする権限がありません。</p>
      </main>
    );
  }

  // すべてのユーザーとブロックワードを取得
  const allUsers = await prisma.user.findMany({
    orderBy: { id: "asc" },
  });
  
  // prisma.blockedWordはTrendモデルとは別で定義されていると仮定します
  const blockedWords = await prisma.blockedWord.findMany({
    orderBy: { blockedAt: "desc" },
  });

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">管理者ダッシュボード</h1>

      {/* ユーザー管理セクション */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">有害なユーザーのブロック管理</h2>
        {/* AdminUserListコンポーネントは、toggleUserBlockアクションを使用することを想定 */}
        <AdminUserList users={allUsers} currentAdminId={currentUserId} />
      </section>

      {/* 有害ワード管理セクション */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">有害な人気ワードのブロック管理</h2>
        
        {/* ブロックワード追加フォーム */}
        <form action={addBlockedWord} className="flex gap-2 mb-4 max-w-lg">
          <input
            type="text"
            name="word"
            placeholder="ブロックする単語を入力"
            className="flex-grow p-2 border rounded-md"
            required
          />
          <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            ブロックに追加
          </button>
        </form>

        {/* BlockedWordListコンポーネントは、removeBlockedWordアクションを使用することを想定 */}
        <BlockedWordList words={blockedWords} />
      </section>
    </main>
  );
}