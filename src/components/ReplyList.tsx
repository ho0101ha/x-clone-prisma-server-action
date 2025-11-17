"use client";

import { User, Reply } from "@prisma/client";
import { deleteReply } from "@/actions/reply";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type ReplyWithAuthor = Reply & {
  author: User;
};

export default function ReplyList({
  postId,
  replies,
}: {
  postId: number;
  replies: ReplyWithAuthor[];
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const currentUserId = parseInt(session?.user?.id as string);

  const handleDeleteReply = async (replyId: number) => {
    if (window.confirm("この返信を本当に削除しますか？")) {
      const result = await deleteReply(replyId, postId);
      if (result?.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    }
  };

  if (replies.length === 0) {
    return <div className="mt-4 text-gray-500">まだ返信がありません。</div>;
  }

  return (
    <div className="mt-4 border-t pt-4">
      <h2 className="text-xl font-semibold mb-2">返信</h2>
      {replies.map((reply) => (
        <div key={reply.id} className="border p-3 rounded-md mb-2 bg-gray-50 flex justify-between items-center">
          <div>
            <p className="font-semibold">{reply.author.name || "Anonymous"}</p>
            <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
          </div>
          {status === "authenticated" && reply.authorId === currentUserId && (
            <button
              onClick={() => handleDeleteReply(reply.id)}
              className="text-red-500 hover:text-red-700 ml-4"
            >
              削除
            </button>
          )}
        </div>
      ))}
    </div>
  );
}