import {authOptions} from "@/auth";
import AccountForm from "@/components/AccountForm";
import LogoutButton from "@/components/LogoutButton";
import {prisma} from "@/lib/prisma";
import {getServerSession} from "next-auth";
import {redirect} from "next/navigation";
import React from "react";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const currentUserId = parseInt(session.user.id);

  const currentUser = await prisma.user.findUnique({
    where: {id: currentUserId},
  });

  if (!currentUser) {
    return <div>ユーザーデータが見つかりませんでした</div>;
  }
  return (
    <main className="container mx-auto p-4">
      <div className="container mx-auto   flex justify-end">
        <LogoutButton />
      </div>
      <h1 className="text-3xl font-bold mb-6">アカウント情報</h1>
      <AccountForm currentUser={currentUser} />
    </main>
  );
}
