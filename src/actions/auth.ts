"use server";

import {prisma} from "@/lib/prisma";
import bcrypt from "bcryptjs";
// import { redirect } from "next/navigation";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

/**
 * 新規ユーザーを登録します。
 * @returns 登録成功時は { success: true }、失敗時は { error: string } を返します。
 */

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードは必須です。" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    return { success: true };
  } catch (e) {
    //  型ガードを使用してエラーの種類を判別
    if (e instanceof PrismaClientKnownRequestError) {
      // P2002 はユニーク制約違反（この場合は email の重複）
      if (e.code === "P2002") {
        return { error: "このメールアドレスは既に登録されています。" };
      }
    }
    
    // その他のエラー
    console.error(e);
    return { error: "予期せぬエラーが発生しました。" };
  }
}

/**
 * @param formData フォームデータ
 * @returns 認証成功時は { success: true }、失敗時は { error: string } を返します。
 */
export async function handleSignIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {error: "メールアドレスとパスワードは必須です。"};
  }

  const user = await prisma.user.findUnique({
    where: {email},
  });

  if (!user) {
    return {error: "メールアドレスまたはパスワードが正しくありません。"};
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return {error: "メールアドレスまたはパスワードが正しくありません。"};
  }

  // ログイン成功
  return {success: true};
}
