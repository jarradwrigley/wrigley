"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { signIn, signOut } from "next-auth/react";
import { toast } from "sonner";
import { CircleCheckBig } from "lucide-react";
import React from "react";

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
}

interface ErrorState {
  [key: string]: { hasError: boolean; message: string };
}

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  // other product details
}

interface AppState {
  auth: AuthState;
  loading: boolean;
  errors: ErrorState;

  // Cart State
  isCartOpen: boolean;
  setIsCartOpen: (value: boolean) => void;
  cart: any[];
  total: number;
  addItem: (item: any) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  syncCartToServer: () => void;
  loadCartFromServer: () => void;
  onLogin: () => void;
  onLogout: () => void;

  cartSynced: boolean; // Add this flag
  setCartSynced: (synced: boolean) => void;

  // UI state actions
  setLoading: (loading: boolean) => void;
  setErrors: (
    field: string,
    hasError: boolean,
    message?: string,
    showToast?: boolean
  ) => void;
  clearErrors: () => void;
  resetStore: () => void;
}

const initialState = {
  auth: {
    user: null,
    isAuthenticated: false,
  },
  loading: false,
  errors: {},
  isCartOpen: false,
  cart: [],
  total: 0,
  cartSynced: false,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setIsCartOpen: (value) => set({ isCartOpen: value }),

      addItem: (item: any) => {
        const { cart } = get();
        const itemKey = `${item.key}-${item.size}`; // Composite key

        const existing = cart.find((i) => i.key === itemKey);

        let updatedCart;
        if (existing) {
          updatedCart = cart.map((i) =>
            i.key === itemKey ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          updatedCart = [
            ...cart,
            {
              productId: item._id,
              key: itemKey,
              size: item.size,
              quantity: 1,
              price: item.amount,
              title: item.title,
              image: item.image,
            },
          ];
        }

        const newTotal = updatedCart.reduce(
          (acc, i) => acc + i.price * i.quantity,
          0
        );

        set({ cart: updatedCart, total: newTotal });
      },

      removeItem: (key: string) => {
        const updatedCart = get().cart.filter((i) => i.key !== key);
        const newTotal = updatedCart.reduce(
          (acc, i) => acc + i.price * i.quantity,
          0
        );

        set({ cart: updatedCart, total: newTotal });
      },

      updateQuantity: (key: string, quantity: number) => {
        const updatedCart = get().cart.map((item) =>
          item.key === key ? { ...item, quantity } : item
        );

        const newTotal = updatedCart.reduce(
          (acc, i) => acc + i.price * i.quantity,
          0
        );

        set({ cart: updatedCart, total: newTotal });
      },

      clearCart: () => set({ cart: [], total: 0 }),

      syncCartToServer: async () => {
        const { cart, total } = get();
        const res = await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart, total }),
        });

        if (!res.ok) toast.error("Failed to sync cart");
      },

      loadCartFromServer: async () => {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          set({ cart: data.cart, total: data.total });
        }
      },

      setCartSynced: (synced) => set({ cartSynced: synced }),

      onLogin: async () => {
        try {
          // 1. Load the user's saved cart from the database
          const res = await fetch("/api/cart");
          let dbCart = [];

          if (res.ok) {
            const data = await res.json();
            dbCart = data.cart || [];
          }

          // 2. Get the current guest cart
          const guestCart = get().cart;

          // 3. Create a map of DB cart items for easier lookup
          const dbCartMap = new Map();
          dbCart.forEach((item: any) => {
            dbCartMap.set(item.key, item);
          });

          // 4. Merge the carts - add quantities when items match
          const mergedCart = [...dbCart]; // Start with DB cart
          let hasNewItems = false;

          guestCart.forEach((guestItem) => {
            const existingIndex = mergedCart.findIndex(
              (dbItem) => dbItem.key === guestItem.key
            );

            if (existingIndex >= 0) {
              // Item exists in both carts - add quantities together
              const existingItem = mergedCart[existingIndex];
              const dbQuantity = dbCartMap.get(guestItem.key)?.quantity || 0;

              // Only add if the guest quantity is different from what we expect
              // This prevents the reload increment issue
              if (guestItem.quantity !== dbQuantity) {
                mergedCart[existingIndex] = {
                  ...existingItem,
                  quantity: dbQuantity + guestItem.quantity,
                };
                hasNewItems = true;
              }
            } else {
              // Item only exists in guest cart - add it completely
              mergedCart.push(guestItem);
              hasNewItems = true;
            }
          });

          // 5. Calculate the new total
          const newTotal = mergedCart.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          );

          // 6. Update the local state with merged cart
          set({ cart: mergedCart, total: newTotal });

          // 7. Sync the merged cart back to the server if there were changes
          if (hasNewItems) {
            await get().syncCartToServer();

            toast.success("Welcome back! Your cart has been updated.", {
              icon: React.createElement(CircleCheckBig, {
                className: "h-4 w-4",
              }),
            });
          }
        } catch (error) {
          console.error("Login cart merge error:", error);
          toast.error("Failed to restore your cart");

          // Fallback: just load from server if merge fails
          await get().loadCartFromServer();
        }
      },

      onLogout: async () => {
        try {
          await get().syncCartToServer();
          await signOut({ redirect: false });

          set({
            cart: [],
            total: 0,
            cartSynced: false, // Reset sync flag
            auth: {
              user: null,
              isAuthenticated: false,
            },
          });
        } catch (error) {
          console.error("Logout error:", error);
        }
      },

      setLoading: (loading) => set({ loading }),

      setErrors: (field, hasError, message = "", showToast = true) => {
        set((state) => ({
          errors: {
            ...state.errors,
            [field]: { hasError, message },
          },
        }));

        // Show toast notification if there's an error with a message
        if (hasError && message && showToast) {
          toast.error(message);
        }
      },

      clearErrors: () => set({ errors: {} }),

      resetStore: () => set(initialState),
    }),
    {
      name: "letsgetwrigley",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        errors: state.errors,
        cart: state.cart,
        total: state.total,
        cartSynced: state.cartSynced, // Persist the sync flag
      }),
    }
  )
);
