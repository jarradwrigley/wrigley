"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useStore } from "store/store";

export function useAuthSync() {
  const { data: session, status } = useSession();
  const { setAuthState, onLogin, onLogout } = useStore();
  const wasAuthenticated = useRef(false);
  const hasInitialized = useRef(false);
  const isProcessingAuth = useRef(false);

  useEffect(() => {
    // Prevent multiple simultaneous auth processes
    if (isProcessingAuth.current) {
      return;
    }

    const isAuthenticated = status === "authenticated" && !!session;

    console.log("Auth sync effect triggered:", {
      status,
      isAuthenticated,
      wasAuthenticated: wasAuthenticated.current,
      hasInitialized: hasInitialized.current,
    });

    // Always update auth state in store whenever session changes
    setAuthState({
      user: session?.user || null,
      isAuthenticated: isAuthenticated,
    });

    // Handle login - only trigger once when transitioning to authenticated
    if (
      status === "authenticated" &&
      !wasAuthenticated.current &&
      !isProcessingAuth.current
    ) {
      console.log("🔑 User logged in, triggering onLogin");
      isProcessingAuth.current = true;

      onLogin()
        .then(() => {
          console.log("✅ onLogin completed successfully");
          wasAuthenticated.current = true;
          hasInitialized.current = true;
        })
        .catch((error: any) => {
          console.error("❌ onLogin failed:", error);
        })
        .finally(() => {
          isProcessingAuth.current = false;
        });
    }

    // Handle logout - only if we've been initialized and were previously authenticated
    if (
      status === "unauthenticated" &&
      wasAuthenticated.current &&
      hasInitialized.current &&
      !isProcessingAuth.current
    ) {
      console.log("🚪 User logged out, triggering onLogout");
      isProcessingAuth.current = true;

      onLogout()
        .then(() => {
          console.log("✅ onLogout completed successfully");
          wasAuthenticated.current = false;
        })
        .catch((error) => {
          console.error("❌ onLogout failed:", error);
        })
        .finally(() => {
          isProcessingAuth.current = false;
        });
    }

    // Initialize tracking for first load
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
