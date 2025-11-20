import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {redirect} from "next/navigation";
import PostList from "@/components/PostList";
import {prisma} from "@/lib/prisma";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect("/login");
  // }

  const currentUserId = session?.user.id ? parseInt(session.user?.id) : null;
  //  データベースのTrendモデルから人気のお題を取得
  // seed.tsで作成したTrendモデルを利用し、出現回数（count）順に上位5件を取得します。
  const popularTopics = await prisma.trend.findMany({
    orderBy: {count: "desc"},
    take: 5,
    select: {
      name: true,
    },
  });

  // 既存の投稿取得ロジック
  const allPosts = await prisma.post.findMany({
    include: {
      likes: true,
      replies: true,
      author: {
        include: {
          followers: {
            // 認証されている場合のみ、フォローチェックの where 句を追加
            where: currentUserId ? {followerId: currentUserId} : undefined,
            take: 1,
          },
        },
      },
    },
    orderBy: {createdAt: "desc"},
  });

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-center text-2xl font-bold mb-4">X-Clone Feed</h1>
      <div className="container mx-auto   flex justify-end">
        {session ? (
          <LogoutButton />
        ) : (
          <div className="mb-3 ">
            <button className="items-center w-full p-2 rounded-md border hover:bg-red-500 transition-colors">
              <Link href="/login">login</Link>
            </button>
          </div>
        )}
      </div>
      {/* 人気のお題のリンクを動的に表示 */}
      <section className="mb-8">
        <h2 className="text-ce text-xl font-semibold mb-2">人気のお題</h2>
        <div className="flex flex-wrap gap-2">
          {popularTopics.length > 0 ? (
            popularTopics.map((topic) => (
              <Link key={topic.name} href={`/topics/${topic.name}`}>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full hover:bg-blue-200 cursor-pointer">
                  #{topic.name}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-gray-500">まだ人気のお題はありません。</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">全ての投稿</h2>
        <PostList
          posts={
            allPosts
            // as any
          }
          currentUserId={currentUserId}
          showDeleteButton={false}
        />
      </section>
    </main>
  );
}
