"use client";

import { useSession } from "next-auth/react";
import { useActionState } from "react";
import { createReply } from "@/actions/reply";

export default function ReplyForm({ postId }: { postId: number }) {
  const { status } = useSession();

  const [state, action] = useActionState(
    async (prevState: { error: string | null; success: boolean }, formData: FormData) => {
      return await createReply(prevState, formData, postId);
    },
    {
      error: null,
      success: false,
    }
  );

  if (status !== "authenticated") {
    return null;
  }

  return (
    <form action={action} className="mt-4 border-t pt-4">
      <textarea
        name="content"
        placeholder="この投稿に返信..."
        className="w-full p-2 border rounded-md resize-none"
        rows={3}
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        返信する
      </button>
      {state.error && <p className="text-red-500 mt-2">{state.error}</p>}
    </form>
  );
}
