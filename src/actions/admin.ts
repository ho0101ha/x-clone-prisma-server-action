// src/actions/admin.ts

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// 管理者権限のチェック関数
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? parseInt(session.user.id) : null;

  if (!userId) {
    return { error: "認証が必要です。", isAdmin: false };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isAdmin) {
    return { error: "管理者権限がありません。", isAdmin: false };
  }
  return { error: null, isAdmin: true };
}

// ユーザーをブロック/解除するアクション

export async function toggleUserBlock(targetUserId: number): Promise<{ error?: string; success: boolean }> {
  const adminCheck = await checkAdmin();
  if (adminCheck.error) {
    return { error: adminCheck.error, success: false };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      return { error: "ユーザーが見つかりません。", success: false };
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { isBlocked: !user.isBlocked },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("ユーザーブロックの更新に失敗しました。", e);
    return { error: "ユーザーブロックの更新に失敗しました。", success: false };
  }
}

// 有害ワードをブロックするアクション (変更なし - フォームアクション用)
export async function addBlockedWord(formData: FormData): Promise<void> {
  const adminCheck = await checkAdmin();
  if (adminCheck.error) {
    console.error(adminCheck.error);
    return;
  }

  const word = (formData.get("word") as string)?.trim();
  if (!word) {
    console.error("ブロックする単語を入力してください。");
    return;
  }

  try {
    await prisma.blockedWord.create({ data: { word } });
    revalidatePath("/admin");
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
           console.error("その単語は既にブロックされています。");
        } else {
          console.error("有害ワードの追加に失敗しました。", e);
          }
        }
      }

// ブロックされたワードを解除するアクション (変更なし - 既に修正済み)
export async function removeBlockedWord(wordId: number): Promise<{ error?: string; success: boolean }> {
  const adminCheck = await checkAdmin();
  if (adminCheck.error) {
    return { error: adminCheck.error, success: false };
  }

  try {
    await prisma.blockedWord.delete({ where: { id: wordId } });
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("有害ワードの解除に失敗しました。", e);
    return { error: "有害ワードの解除に失敗しました。", success: false };
  }
}