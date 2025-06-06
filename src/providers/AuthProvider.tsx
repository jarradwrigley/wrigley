"use client";

import GlobalLoadingScreen from "@/app/components/LoadingScreen";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Toaster />

      {children}
      <GlobalLoadingScreen iconSrc="/icons/logo.avif" />
    </SessionProvider>
  );
}
