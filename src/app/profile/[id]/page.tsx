import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostList from "@/components/PostList";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { toggleFollow } from "@/actions/post"; // フォロー/フォロー解除用

// propsから動的パラメータを受け取る型定義
type ProfilePageProps = {
  params: {
    id: string; // URLから取得するユーザーID (文字列)
  };
};

export default async function OtherProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions);

  // if (!session?.user?.id) {
  //   redirect("/login");
  // }

  // 現在ログインしているユーザーのID
  const currentUserId =session?.user?.id ? parseInt(session.user.id)  : null;
  // URLから取得したプロフィール表示対象のユーザーID
  const targetUserId = parseInt(params.id);

  if (isNaN(targetUserId)) {
    return <div className="p-8 max-w-2xl mx-auto text-red-500">無効なユーザーIDです。</div>;
  }
  const isOwnProfile = currentUserId === targetUserId;

  
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    return <div className="p-8 max-w-2xl mx-auto text-red-500">ユーザーが見つかりませんでした。</div>;
  }
  
  let isFollowing = false;
  if(currentUserId !== null){
    const followRecord = await prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });
    isFollowing = !! followRecord;
  }
  
  
  const userPosts = await prisma.post.findMany({
    where: {
      authorId: targetUserId,
    },
    include: {
      likes: true,
      replies: true, 
      author: {
        include: {
          followers: {
            where: currentUserId !== null ? {
              // ログインユーザーがこのターゲットユーザーをフォローしているかチェック
              followerId: currentUserId,
              followingId: targetUserId,
            } : undefined,
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. ログインユーザーがターゲットユーザーをフォローしているかチェック
 

 

  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold">{targetUser.name || "名無しユーザー"}のプロフィール</h1>
          <p className="text-gray-500">{targetUser.email}</p>
        </div>
        {currentUserId !== null && (
            isOwnProfile ? (
                // 自分のプロフィールならログアウトボタンなどを表示
                <LogoutButton />
            ) : (
                // 他人のプロフィールならフォロー/フォロー解除ボタンを表示
                <form action={async () => {
                    "use server";
                    // toggleFollowを呼び出す
                    await toggleFollow(targetUserId);
                }}>
                    <button
                        type="submit"
                        className={`px-4 py-2 text-sm rounded-full transition-colors font-bold ${
                            isFollowing
                                ? "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-400"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                    >
                        {isFollowing ? "フォロー中" : "フォロー"}
                    </button>
                </form>
            )
        )}
        {currentUserId === null && (
          <Link href="/login" className="px-4 py-2 text-sm rounded-full bg-blue-500 text-white hover:bg-blue-600 font-bold">
          ログインしてフォロー
      </Link>
        )}
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">{targetUser.name || "ユーザー"}の投稿一覧</h2>
        <PostList
          posts={userPosts 
            // as any
          } // 型エラーを避けるため any を使用しましたが、PostList側の型が適切であれば不要
          currentUserId={currentUserId}
          showDeleteButton={false} // 他人の投稿なので削除ボタンは非表示
        />
      </section>
    </main>
  );
}