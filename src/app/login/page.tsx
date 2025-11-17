"use client";

import { useActionState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { handleSignIn } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();

  // useActionState を使用してフォームの実行状態を管理
  const [state, formAction, isPending] = useActionState(
    async (
      currentState: { error?: string } | null,
      formData: FormData
    ) => {
      // Server Actionで認証情報を検証
      const validationResult = await handleSignIn(formData);

      if (validationResult?.error) {
        // エラーがある場合はエラーオブジェクトを返す
        return { error: validationResult.error };
      }

      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      // 認証情報が正しい場合、クライアント側でログイン
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { error: "ログインに失敗しました。" };
      }

      // ログイン成功後はリダイレクト
      router.push("/");
      
      // 成功時は状態をクリア
      return null;
    },
    null // 初期状態
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-8">ログイン</h1>
      <form action={formAction} className="flex flex-col gap-4 w-80">
        <input
          type="email"
          name="email"
          placeholder="メールアドレス"
          required
          className="p-2 border rounded-md"
          disabled={isPending}
        />
        <input
          type="password"
          name="password"
          placeholder="パスワード"
          required
          className="p-2 border rounded-md"
          disabled={isPending}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          disabled={isPending}
        >
          {isPending ? "認証中..." : "サインイン"}
        </button>
      </form>
      {state?.error && <p className="text-red-500 mt-4 text-center">{state.error}</p>}
      <div className="mt-4">
        <p className="text-sm">
          アカウントをお持ちではありませんか？{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            サインアップ
          </Link>
        </p>
      </div>
    </main>
  );
}