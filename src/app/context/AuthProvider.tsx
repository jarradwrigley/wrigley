"use client";


import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import GlobalLoadingScreen from "../components/LoadingScreen";

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
