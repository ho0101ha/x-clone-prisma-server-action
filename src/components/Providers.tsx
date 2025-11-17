"use client";

import { SessionProvider } from "next-auth/react";
import StoreProvider from "@/lib/store/provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <SessionProvider>{children}</SessionProvider>
    </StoreProvider>
  );
}