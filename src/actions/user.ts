"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Server Actionの戻り値の型を定義
interface ActionState {
  success: boolean;
  error: string | null;
}

// アカウント情報更新アクション 
export async function updateAccount(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "認証が必要です。" };
  }

  const userId = parseInt(session.user.id);
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) {
    return { success: false, error: "名前とメールアドレスは必須です。" };
  }

  try {
    // メールアドレスが変更されているかチェック
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (existingUser?.email !== email) {
      // 既にそのメールアドレスが使われていないかチェック
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists && emailExists.id !== userId) {
        return { success: false, error: "このメールアドレスは既に使用されています。" };
      }
    }
    
    // ユーザー情報を更新
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name,
        email: email,
      },
    });

    // プロフィールページとアカウントページを再検証
    revalidatePath("/profile");
    revalidatePath("/account");
    
    return { success: true, error: null };
  } catch (e) {
    console.error("アカウント更新エラー:", e);
    return { success: false, error: "アカウントの更新に失敗しました。" };
  }
}