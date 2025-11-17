import {getFollowLists} from "@/actions/post";
import Link from "next/link";

export default async function FollowPage() {
  const {followers, following, error} = await getFollowLists();

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">フォロー・フォロワー</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">あなたのフォロー・フォロワー</h1>

      {/* --- フォロワーリスト --- */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
          フォロワー ({followers.length})
        </h2>
        {followers.length === 0 ? (
          <p className="text-gray-600">まだフォロワーはいません。</p>
        ) : (
          <div className="space-y-3">
            {followers.map((user) => (
              <div
                key={user.id}
                className="p-4 border rounded-lg shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* アバター画像があればここに表示（user.imageを使用） */}
                  {/* <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" /> */}
                  <div>
                    <p className="font-bold text-lg">
                      {user.name || "名無しユーザー"}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                {/* プロフィールへのリンク */}
                <Link
                  href={`/profile/${user.id}`}
                  className="text-blue-500 hover:underline px-4 py-2 border rounded-md">
                  プロフィールへ
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <hr className="my-8" />

      {/* --- フォロー中リスト --- */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
          フォロー中 ({following.length})
        </h2>
        {following.length === 0 ? (
          <p className="text-gray-600">まだ誰もフォローしていません。</p>
        ) : (
          <div className="space-y-3">
            {following.map((user) => (
              <div
                key={user.id}
                className="p-4 border rounded-lg shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* アバター画像があればここに表示（user.imageを使用） */}
                  {/* <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" /> */}
                  <div>
                    <p className="font-bold text-lg">
                      {user.name || "名無しユーザー"}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                {/* プロフィールへのリンク */}
                <Link
                  href={`/profile/${user.id}`}
                  className="text-blue-500 hover:underline px-4 py-2 border rounded-md">
                  相手のページ
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
