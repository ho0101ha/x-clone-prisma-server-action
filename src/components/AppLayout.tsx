"use client";

import { FaBars } from "react-icons/fa";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { toggleSidebar } from "@/lib/features/ui/uiSlice";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <>
      {status === "authenticated" && (
        <button
          onClick={handleToggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md text-gray-700"
        >
          <FaBars size={24} />
        </button>
      )}
      <Sidebar isOpen={isSidebarOpen} activePathname={pathname} /> {/* ✅ onCloseを削除 */}
      <div className="min-h-screen">
        {children}
      </div>
    </>
  );
}