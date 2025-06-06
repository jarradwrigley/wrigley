"use client";

import { useAuthSync } from "@/hooks/useAuthSync";

export default function CartSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove all the duplicate auth logic - let useAuthSync handle everything
  useAuthSync();

  return <>{children}</>;
}
