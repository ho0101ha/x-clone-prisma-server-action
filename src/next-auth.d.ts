import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * NextAuthセッションのセッション型を拡張します。
   */
  interface Session {
    user: {
      id: string; // 👈 ここにidを追加
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}