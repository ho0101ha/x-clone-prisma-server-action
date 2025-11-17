"use client";

import {useActionState} from "react";
import {createPost} from "@/actions/post";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@/lib/store";
import {
  clearContent,
  clearError,
  setContent,
  setError,
} from "@/lib/features/postForm/postformSlice";
import {useRouter} from "next/navigation";

export default function PostForm() {
  // const [key, setKey] = useState(0);
  // const [content,setContent] = useState("");
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const {content} = useSelector((state: RootState) => state.postForm);
  const [state, formAction, isPending] = useActionState(
    async (currentState: {error?: string} | null, formData: FormData) => {
      const result = await createPost(formData);

      if (result?.error) {
        dispatch(setError(result.error));
        return {error: result.error};
      }

      dispatch(clearContent());
      dispatch(clearError());
      router.refresh();
      return null;
    },
    null
  );
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setContent(e.target.value));
  };

  return (
    <form
      //  key={key}
      action={formAction}
      className="mb-8">
      <textarea
        name="content"
        placeholder="What's happening?"
        className="w-full p-2 border rounded-md mb-2"
        rows={4}
        required
        disabled={isPending}
        value={content}
        onChange={handleContentChange}
      />
      {state?.error && <p className="text-red-500 mb-2">{state.error}</p>}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        disabled={isPending}>
        {isPending ? "投稿中..." : "Post"}
      </button>
    </form>
  );
}
