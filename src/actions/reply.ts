"use server";



import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createReply(
  prevState: { error: string | null; success: boolean },
  formData: FormData,
  postId: number
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "認証が必要です。", success: false };
  }

  const content = formData.get("content");
  if (!content) {
    return { error: "返信内容は必須です。", success: false };
  }

  const userId = parseInt(session.user.id);

  try {
    await prisma.reply.create({
      data: {
        content: content as string,
        authorId: userId,
        postId: postId,
      },
    });
    revalidatePath(`/posts/${postId}`);
    return { success: true, error: null };
  } catch (error) {
    console.error("返信の作成に失敗しました:", error);
    return { error: "返信の作成に失敗しました。", success: false };
  }
}
export async function deleteReply(replyId: number, postId: number) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "認証が必要です。" };
  }

  const userId = parseInt(session.user.id);

  try {
    const reply = await prisma.reply.findUnique({
      where: { id: replyId },
    });

    if (!reply || reply.authorId !== userId) {
      return { error: "返信を削除する権限がありません。" };
    }

    await prisma.reply.delete({
      where: { id: replyId },
    });

    revalidatePath(`/posts/${postId}`);
    return { success: true };
  } catch (error) {
    console.error("返信の削除に失敗しました:", error);
    return { error: "返信の削除に失敗しました。" };
  }
}

