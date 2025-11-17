"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";


/**
 * 投稿内容からハッシュタグを抽出し、Trendモデルを更新するヘルパー関数。
 * @param content 投稿内容
 */
async function updateTrendsFromContent(content: string) {
    // #に続く空白文字以外の連続する単語を正規表現で抽出
    const hashtags = content.match(/#(\S+)/g);

    if (hashtags) {
        for (const tag of hashtags) {
            const trendName = tag.substring(1); // #を削除
            
            // データベース内でトレンドのカウントをインクリメント（または新規作成）
            await prisma.trend.upsert({
                where: { name: trendName },
                update: { count: { increment: 1 } },
                create: {
                    name: trendName,
                    count: 1,
                },
            });
        }
    }
}

// 投稿

export async function createPost(formData: FormData) {
  const content = formData.get("content") as string;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Not authenticated." };
  }

  if (!content) {
    return { error: "投稿内容は必須です。" };
  }

  try {
    // 1. 投稿の作成
    await prisma.post.create({
      data: {
        content,
        authorId: parseInt(session.user.id),
      },
    });
    
    // 2. ハッシュタグを抽出し、Trendを更新
    await updateTrendsFromContent(content);

    // 成功時にキャッシュを無効化し、ページを再レンダリング
    revalidatePath("/");
    return null;
  } catch (e) {
    console.error(e);
    return { error: "投稿に失敗しました。" };
  }
}


export async function deletePost(postId: number) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Not authenticated." };
  }

  const userId = parseInt(session.user.id);

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post || post.authorId !== userId) {
    return { error: "投稿を削除できませんでした" };
  }

  try {
    // 投稿に紐づくすべての返信を削除
    await prisma.reply.deleteMany({
      where: { postId: postId },
    });
    
    // 投稿に紐づくすべてのいいねを削除
    await prisma.like.deleteMany({
      where: { postId: postId },
    });

    // 投稿を削除
    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/profile");
    revalidatePath("/");
  } catch (e) {
    console.error(e);
    return { error: "投稿の削除に失敗しました。" };
  }
}


// いいね/フォローアクション


export async function toggleLike(postId: number) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Not authenticated." };
  }

  const userId = parseInt(session.user.id);

  const existingLike = await prisma.like.findFirst({
    where: {
      userId,
      postId,
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
  } else {
    await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });
  }

  // 成功時にキャッシュを無効化し、ページを再レンダリング
  revalidatePath("/");
}

export async function toggleFollow(followingId: number) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Not authenticated." };
  }

  const followerId = parseInt(session.user.id);

  if (followerId === followingId) {
    return { error: "自分自身をフォローできません" };
  }

  const existingFollow = await prisma.follow.findFirst({
    where: {
      followerId,
      followingId,
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });
  } else {
    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  revalidatePath("/");
}


//follow,follower

export async function getFollowLists() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    // 認証されていない場合は null またはエラーを返す
    return { followers: [], following: [], error: "Not authenticated." };
  }

  const userId = parseInt(session.user.id);

  try {
    // フォロワー (自分をfollowingIdとしてFollowレコードを取得)
    const followersData = await prisma.follow.findMany({
      where: { followingId: userId },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // フォロー中のユーザー (自分をfollowerIdとしてFollowレコードを取得)
    const followingData = await prisma.follow.findMany({
      where: { followerId: userId },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // 必要なユーザー情報のみを抽出
    const followers = followersData.map((f) => f.follower);
    const following = followingData.map((f) => f.following);

    return { followers, following, error: null };
  } catch (e) {
    console.error(e);
    return { followers: [], following: [], error: "データの取得に失敗しました。" };
  }
}
