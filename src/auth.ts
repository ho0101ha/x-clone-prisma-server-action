// src/auth.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs"; // bcryptjs を使用
import { prisma } from "./lib/prisma";

// NextAuthOptionsの定義
export const authOptions: NextAuthOptions = {
  // セッション戦略をJWTに設定 (NextAuthのデフォルトはJWTですが明示的に記述)
  session: {
    strategy: "jwt",
  },
  
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        //  isAdminを含めてユーザーを取得
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true, // パスワード検証のために必要
            isAdmin: true,  //  isAdminを含める
          }
        });

        if (!user) {
          return null;
        }

        // bcrypt.compare を使用
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // 認証成功時、isAdminを含めて返す
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          isAdmin: user.isAdmin, //  isAdminを含める
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // 1. JWTトークンにisAdminを追加
    jwt: async ({ token, user }) => {
      if (user) {
        // userオブジェクトはauthorizeで返された情報を含む
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (token as any).isAdmin = (user as any).isAdmin; //  isAdminをトークンに追加
      }
      return token;
    },
    // 2. トークン情報からisAdminをセッションに追加
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).isAdmin = (token as any).isAdmin; 
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };



// import NextAuth, { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";

// import bcrypt from "bcryptjs";
// import { prisma } from "./lib/prisma";



// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }

//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         });

//         if (!user) {
//           return null;
//         }

//         const isPasswordValid = await bcrypt.compare(
//           credentials.password,
//           user.password
//         );

//         if (!isPasswordValid) {
//           return null;
//         }

//         return {
//           id: user.id.toString(),
//           email: user.email,
//           name: user.name,
//           image: user.image,
//         };
//       },
//     }),
//   ],
//   pages: {
//     signIn: "/login",
//   },
//   callbacks: {
//     jwt: async ({ token, user }) => {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//         token.name = user.name;
//         token.image = user.image;
//       }
//       return token;
//     },
//     session: async ({ session, token }) => {
//       if (session.user) {
//         session.user.id = token.id as string;
//       }
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };