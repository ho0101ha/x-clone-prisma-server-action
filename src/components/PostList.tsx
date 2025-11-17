"use client";

import {Post, User, Like, Follow} from "@prisma/client";
import {deletePost, toggleFollow, toggleLike} from "@/actions/post";
import {useRouter} from "next/navigation";
import Link from "next/link";

type PostWithDetails = Post & {
  likes: Like[];
  author: User & {
    followers: Follow[];
  };
};
export default function PostList({
  posts,
  currentUserId,
  showDeleteButton,
}: {
  posts: PostWithDetails[];
  currentUserId: number;
  showDeleteButton: boolean;
}) {
  const router = useRouter();

  const handleToggleLike = async (postId: number) => {
    await toggleLike(postId);
    router.refresh();
  };

  const handleToggleFollow = async (followingId: number) => {
    if (followingId === currentUserId) {
      alert("自分自身をフォローすることはできません");
      return;
    }

    const result = await toggleFollow(followingId);
    if (result?.error) {
      alert(result.error);
    }

    router.refresh();
  };

  const handleDeletePost = async (postId: number) => {
    if (window.confirm("この投稿を本当に削除しますか？")) {
      await deletePost(postId);
      router.refresh();
    }
  };

  return (
    <div>
      {posts.map((post) => {
        const isFollowing = (post.author.followers?.length || 0) > 0;
        const isOwnPost = post.authorId === currentUserId;

        return (
          <div key={post.id} className="border p-4 rounded-md mb-4">
            <div className="flex items-center justify-between">
              <Link href={`/posts/${post.id}`} className="flex-grow">
                <p className="font-semibold">
                  {post.author.name || "Anonymous"}
                </p>
              </Link>

              {/* 自分の投稿ではない場合のみフォローボタンを表示 */}
              {!isOwnPost && (
                <button
                  onClick={() => handleToggleFollow(post.authorId)}
                  className={`ml-4 px-3 py-1 text-sm rounded-full transition-colors font-bold ${
                    isFollowing
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-400" // フォロー中のスタイル
                      : "bg-blue-500 text-white hover:bg-blue-600" // 未フォローのスタイル
                  }`}>
                  {isFollowing ? "フォロー中" : "フォロー"}
                </button>
              )}
            </div>
            <p className="mt-2">{post.content}</p>
            <div className="mt-2 flex items-center">
              <button
                onClick={() => handleToggleLike(post.id)}
                className={`p-1 rounded-full ${
                  post.likes.some((like) => like.userId === currentUserId)
                    ? "text-red-500"
                    : "text-gray-500"
                }`}>
                ❤️ {post.likes.length}
              </button>
              {showDeleteButton && (
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="ml-4 text-red-500 hover:text-red-700">
                  削除
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

//   <div>
//     {posts.map((post) => (
//       <div key={post.id} className="border p-4 rounded-md mb-4">
//         <Link href={`/posts/${post.id}`}>
//           <p className="font-semibold">{post.author.name || "Anonymous"}</p>
//         </Link>
//         <p className="mt-2">{post.content}</p>
//         <div className="mt-2">
//           <button
//             onClick={() => handleToggleLike(post.id)}
//             className={`p-1 rounded-full ${
//               post.likes.some((like) => like.userId === currentUserId)
//                 ? "text-red-500"
//                 : "text-gray-500"
//             }`}
//           >
//             ❤️ {post.likes.length}
//           </button>
//           {showDeleteButton && (
//             <button
//               onClick={() => handleDeletePost(post.id)}
//               className="ml-4 text-red-500 hover:text-red-700"
//             >
//               削除
//             </button>
//           )}
//         </div>
//       </div>
//     ))}
//   </div>

// );
// }
