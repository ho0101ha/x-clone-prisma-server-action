"use client";
import {signOut} from "next-auth/react";
import React from "react";
import {FaSignOutAlt} from "react-icons/fa";

export default  function LogoutButton() {
  const handleSignOut = async () => {
    await signOut({callbackUrl: "/login"});
  };
  return (
    <div className="mb-3 ">
      <button
        onClick={handleSignOut}
        className="flex items-center w-full p-2 rounded-md hover:bg-red-500 transition-colors">
        <FaSignOutAlt className="mr-3" />
        ログアウト
      </button>
    </div>
  );
}
