"use client";

import {updateAccount} from "@/actions/user";
import {User} from "@prisma/client";
import React, {useActionState} from "react";

interface AccountFormProps {
  currentUser: User;
}

export default function AccountForm({currentUser}: AccountFormProps) {
  const initialState = {
    success: false,
    error: null as string | null,
  };

  const [state, action] = useActionState(updateAccount, initialState);
  return (
    <form action={action} className="space-y-4 max-w-md">
      <div className="text-lg font-semibold border-b pb-2">アカウント設定</div>

      {/* 成功/エラーメッセージの表示 */}
      {state.success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md">
          アカウント情報が更新されました。
        </div>
      )}
      {state.error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          エラー: {state.error}
        </div>
      )}

      {/* ユーザー名入力フィールド */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700">
          ユーザー名
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={currentUser.name || ""}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      {/* メールアドレス入力フィールド */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700">
          メールアドレス
        </label>
        <input
          type="email"
          id="email"
          name="email"
          defaultValue={currentUser.email}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      {/* TODO: パスワード変更機能を追加する場合はここに追加 */}

      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        更新する
      </button>
    </form>
  );
}
