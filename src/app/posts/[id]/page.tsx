// app/post/[id]/page.tsx

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import PostList from "@/components/PostList";
import ReplyForm from "@/components/ReplyForm";
import ReplyList from "@/components/ReplyList";
import LogoutButton from "@/components/LogoutButton";

interface PostPageProps {
  params: {
    id: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) { 
    redirect("/login");
  }

  const postId = parseInt(params.id);
  const currentUserId = parseInt(session.user.id);

  if (isNaN(postId)) {
    return <div>無効な投稿IDです。</div>;
  }

  // 1. 投稿データを取得
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      likes: true,
      replies: true, 
      author: {
        include: {
          followers: {
            // ログインユーザーがこの投稿者をフォローしているかチェック
            where: {
              followerId: currentUserId,
            },
            take: 1, // 存在チェックなので1つだけ取得
          },
        },
      },
    },
  });

  // 2. 返信データを取得
  const replies = await prisma.reply.findMany({
    where: { postId: postId },
    include: {
      author: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!post) {
    return <div>投稿が見つかりませんでした。</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <div className="container mx-auto flex justify-end">
        <LogoutButton />
      </div>
      <h1 className="text-2xl font-bold mb-4">投稿詳細</h1>
      <PostList
        posts={[post]} // PostWithDetailsに強制アサート (PostList側で型定義が統一されていれば as any は不要です)
        currentUserId={currentUserId}
        showDeleteButton={post.authorId === currentUserId}
      />
      <ReplyForm postId={postId} />
      {/* 返信データをpropsとしてReplyListに渡す */}
      <ReplyList postId={postId} replies={replies} />
    </main>
  );
}

// import {prisma} from "@/lib/prisma";
// import {getServerSession} from "next-auth";
// import {authOptions} from "@/auth";
// import {redirect} from "next/navigation";
// import PostList from "@/components/PostList";
// import ReplyForm from "@/components/ReplyForm";
// import ReplyList from "@/components/ReplyList";
// import LogoutButton from "@/components/LogoutButton";

// interface PostPageProps {
//   params: {
//     id: string;
//   };
// }

// export default async function PostPage({params}: PostPageProps) {
//   const session = await getServerSession(authOptions);

//   if (!session) {
//     redirect("/login");
//   }

//   const postId = parseInt(params.id);

//   if (isNaN(postId)) {
//     return <div>無効な投稿IDです。</div>;
//   }

//   const post = await prisma.post.findUnique({
//     where: {id: postId},
//     include: {
//       author: true,
//       likes: true,
//     },
//   });

//   //  返信データをサーバー側で取得
//   const replies = await prisma.reply.findMany({
//     where: {postId: postId},
//     include: {
//       author: true,
//     },
//     orderBy: {createdAt: "asc"},
//   });

//   if (!post) {
//     return <div>投稿が見つかりませんでした。</div>;
//   }

//   const currentUserId = parseInt(session.user?.id as string);

//   return (
//     <main className="container mx-auto p-4">
//       <div className="container mx-auto   flex justify-end">
//         <LogoutButton />
//       </div>
//       <h1 className="text-2xl font-bold mb-4">投稿詳細</h1>
//       <PostList
//         posts={[post]}
//         currentUserId={currentUserId}
//         showDeleteButton={post.authorId === currentUserId}
//       />
//       <ReplyForm postId={postId} />
//       {/*  返信データをpropsとしてReplyListに渡す */}
//       <ReplyList postId={postId} replies={replies} />
//     </main>
//   );
// }
