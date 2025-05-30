"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useStore } from "../../store/store";

export function useAuthSync() {
  const { data: session, status } = useSession();
  const { setAuthState, onLogin, onLogout, clearCart } = useStore();
  const wasAuthenticated = useRef(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Update auth state in store whenever session changes
    const isAuthenticated = status === "authenticated" && !!session;

    setAuthState({
      user: session?.user || null,
      isAuthenticated: isAuthenticated,
    });

    // Handle login
    if (status === "authenticated" && !wasAuthenticated.current) {
      console.log("User logged in, triggering onLogin");
      onLogin();
      wasAuthenticated.current = true;
      hasInitialized.current = true;
    }

    // Handle logout - only if we've been initialized and were previously authenticated
    if (
      status === "unauthenticated" &&
      wasAuthenticated.current &&
      hasInitialized.current
    ) {
      console.log("User logged out, triggering onLogout");
      onLogout();
      wasAuthenticated.current = false;
    }

    // Track authentication state
    if (status === "unauthenticated" && !hasInitialized.current) {
      hasInitialized.current = true;
    }
  }, [status, session, setAuthState, onLogin, onLogout]);

  return {
    isAuthenticated: status === "authenticated" && !!session,
    user: session?.user || null,
    status,
  };
}
