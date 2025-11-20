import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
// import {redirect} from "next/navigation";
import PostList from "@/components/PostList";
import {prisma} from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

interface TopicPageProps {
  params: {
    topicId: string;
  };
}

export default async function TopicPage({params}: TopicPageProps) {
  const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect("/login");
  // }

  //  URLエンコードされた文字列をデコード
  const topic = decodeURIComponent(params.topicId);


  const currentUserId = session?.user?.id ? parseInt(session.user?.id as string) : null;

  const posts = await prisma.post.findMany({
    where: {
      content: {
        contains: topic,
      },
    },
    include: {
      likes: true,
      replies: true,
      author: {
        include: {
          followers: {
            // ログインユーザーが投稿者をフォローしているかチェック
            where:currentUserId !== null ? {
              followerId: currentUserId,
            } : undefined,
            take: 1, // 存在チェックなので1つだけ取得
          },
        },
      },
    },
    orderBy: {createdAt: "desc"},
  });


  // 投稿内容が指定されたトピックを含む投稿を取得
  // const posts = await prisma.post.findMany({
  //   where: {
  //     content: {
  //       contains: topic,
  //     },
  //   },
  //   include: {
  //     author: true,
  //     likes: true,
  //   },
  //   orderBy: {createdAt: "desc"},
  // });
  return (
    <main className="container mx-auto p-4">
      <div className="container mx-auto   flex justify-end">
        {session ? (<LogoutButton />):(
          <Link href="/login">
          <span className="text-blue-600 hover:underline font-bold">ログイン</span>
      </Link>
        )}
      </div>
      <h1 className="text-2xl font-bold mb-4">お題: #{topic} の投稿</h1>
      <section>
        <PostList
          posts={posts}
          currentUserId={currentUserId}
          showDeleteButton={false}
        />
        {posts.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            このお題に関する投稿はまだありません。
          </p>
        )}
      </section>
    </main>
  );
}
