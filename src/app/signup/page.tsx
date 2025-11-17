"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/actions/auth";

export default function SignUpPage() {
  // useActionState を使用してフォームの実行状態を管理
  // signUp アクションが返すオブジェクトをstateとして保持
  const [state, formAction, isPending] = useActionState(
    async (
      currentState: { error?: string, success?: boolean } | null,
      formData: FormData
    ) => {
      // Server Actionを実行
      const result = await signUp(formData);
      return result; // 結果をそのまま返す
    },
    null // 初期状態
  );

  // 登録成功時の表示
  if (state?.success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center p-8 bg-green-100 rounded-md shadow-md">
          <h2 className="text-2xl font-bold text-green-700 mb-4">
            登録が完了しました！
          </h2>
          <p className="text-gray-800">
            ログインページに移動してサインインしてください。
          </p>
          <Link href="/login">
            <span className="mt-4 inline-block bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors">
              ログインページへ
            </span>
          </Link>
        </div>
      </main>
    );
  }

  // フォームの表示
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-8">新規ユーザー登録</h1>
      <form action={formAction} className="flex flex-col gap-4 w-80">
        <input
          type="text"
          name="name"
          placeholder="ユーザー名（任意）"
          className="p-2 border rounded-md"
          disabled={isPending}
        />
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
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
          disabled={isPending}
        >
          {isPending ? "登録中..." : "登録"}
        </button>
      </form>
      {state?.error && <p className="text-red-500 mt-4 text-center">{state.error}</p>}
      <div className="mt-4">
        <p className="text-sm">
          アカウントをお持ちですか？{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            サインイン
          </Link>
        </p>
      </div>
    </main>
  );
}