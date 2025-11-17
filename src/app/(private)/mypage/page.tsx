import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import PostList from "@/components/PostList";
import PostForm from "@/components/PostForm";
import LogoutButton from "@/components/LogoutButton";

export default async function MyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const currentUserId = parseInt(session.user.id);

  // ユーザー自身の投稿のみを取得する
  const userPosts = await prisma.post.findMany({
    where: {
      authorId: currentUserId,
    },
    include: {
      author: {
        include: {
          followers: {
            // ログインユーザーが投稿者をフォローしているかチェック (自身が自分をフォロー)
            where: {
              followerId: currentUserId,
            },
            take: 1, // 存在チェックなので1つだけ取得
          },
        },
      },
      likes: true,
      replies: true,
    },
    orderBy: {createdAt: "desc"},
  });

  return (
    <main className="container mx-auto p-4">
      <div className="container mx-auto   flex justify-end">
        <LogoutButton />
      </div>
      <h1 className="text-2xl font-bold mb-4">マイページ</h1>
      <section>
        <h2 className="text-xl font-semibold mb-4">投稿一覧</h2>
        <PostList
          posts={userPosts}
          currentUserId={currentUserId}
          showDeleteButton={true}
        />
        <PostForm />
      </section>
    </main>
  );
}
