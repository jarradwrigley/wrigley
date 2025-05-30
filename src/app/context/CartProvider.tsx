"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useStore } from "../../../store/store";
import { useAuthSync } from "@/hooks/useAuthSync";

export default function CartSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const { onLogin, onLogout, clearCart } = useStore();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (status === "authenticated") {
      onLogin();
      wasAuthenticated.current = true;
    }

    if (status === "unauthenticated" && wasAuthenticated.current) {
      onLogout(); // only clear if the user was logged in before
      clearCart();
      wasAuthenticated.current = false;
    }
  }, [status]);

  useAuthSync();

  return <>{children}</>;
}
