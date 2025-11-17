"use client";

import { BlockedWord } from "@prisma/client";
import { removeBlockedWord } from "@/actions/admin";
import { useRouter } from "next/navigation";

interface BlockedWordListProps {
  words: BlockedWord[];
}

export default function BlockedWordList({ words }: BlockedWordListProps) {
  const router = useRouter();

  const handleRemoveWord = async (wordId: number) => {
    if (!window.confirm("このワードのブロックを解除しますか？")) {
      return;
    }

    const result = await removeBlockedWord(wordId);

    //  result.errorが型として存在するため、エラーは解消
    if (result.error) {
      alert(`エラー: ${result.error}`);
    } else {
      router.refresh(); // 画面を更新
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden max-w-lg">
      <ul className="divide-y divide-gray-200">
        {words.length === 0 ? (
          <li className="p-4 text-gray-500">ブロックされているワードはありません。</li>
        ) : (
          words.map((word) => (
            <li key={word.id} className="flex justify-between items-center p-4 bg-white">
              <span className="font-semibold text-lg">{word.word}</span>
              <button
                onClick={() => handleRemoveWord(word.id)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
              >
                解除
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}