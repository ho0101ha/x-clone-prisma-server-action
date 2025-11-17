"use client";

import Link from "next/link";
import {
  FaHome,
  FaSignOutAlt,
  FaTimes,
  FaCog,
  FaShieldAlt,
  FaUsers,
  FaArrowRight,
} from "react-icons/fa"; // FaUsersとFaArrowRightを追加
import {signOut, useSession} from "next-auth/react";

import {closeSidebar} from "@/lib/features/ui/uiSlice";
import {useAppDispatch} from "@/lib/store";

interface SidebarProps {
  isOpen: boolean;
  activePathname: string;
}

export default function Sidebar({isOpen, activePathname}: SidebarProps) {
  const dispatch = useAppDispatch();
  const {data: session} = useSession();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session?.user as any)?.isAdmin;

  const handleSignOut = async () => {
    await signOut({callbackUrl: "/login"});
  };

  const handleClose = () => {
    dispatch(closeSidebar());
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={handleClose}></div>
      )}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold">Menu</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>
        <nav className="p-4">
          <ul>
            {/* 管理者リンク */}
            {isAdmin && (
              <li className="mb-2">
                <Link href="/admin" onClick={handleClose}>
                  <span
                    className={`flex items-center p-2 rounded-md transition-colors ${
                      activePathname === "/admin"
                        ? "bg-gray-200 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}>
                    <FaShieldAlt className="mr-3" />
                    管理者ページ
                  </span>
                </Link>
              </li>
            )}

            {/* アカウント情報へのリンク */}
            <li className="mb-2">
              <Link href="/account" onClick={handleClose}>
                <span
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    activePathname === "/account"
                      ? "bg-gray-200 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}>
                  <FaCog className="mr-3" />
                  アカウント情報
                </span>
              </Link>
            </li>

            {/* ホームリンク */}
            <li className="mb-2">
              <Link href="/" onClick={handleClose}>
                <span
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    activePathname === "/"
                      ? "bg-gray-200 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}>
                  <FaHome className="mr-3" />
                  ホーム
                </span>
              </Link>
            </li>

            <li className="mb-2">
              <Link href="/profile/follow" onClick={handleClose}>
                <span
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    activePathname === "/following"
                      ? "bg-gray-200 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}>
                  <FaArrowRight className="mr-3" />
                  フォロー,フォロワーリスト
                </span>
              </Link>
            </li>

            {/* <li className="mb-2">
              <Link href="/followers" onClick={handleClose}>
                <span
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    activePathname === "/followers"
                      ? "bg-gray-200 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}>
                  <FaUsers className="mr-3" />
                  フォロワーリスト
                </span>
              </Link>
            </li> */}

            {/* 以前の「リスト」リンクは削除、または上記リンクで代替 */}
            {/* ログアウトボタン */}
            <li className="mb-2">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full p-2 rounded-md text-red-500 hover:bg-red-100 transition-colors">
                <FaSignOutAlt className="mr-3" />
                ログアウト
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
