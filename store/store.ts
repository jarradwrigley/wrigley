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
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setIsCartOpen: (value) => set({ isCartOpen: value }),

      addItem: (item: any) => {
        const { cart } = get();

        // console.log('lll', item)
        // console.log("cccc", cart);
        // const price = parseFloat(item.amount.replace(/[^0-9.]/g, ""));

        const existing = cart.find((i) => i.productId === item._id);

        let updatedCart;
        if (existing) {
          updatedCart = cart.map((i) =>
            i.productId === item._id ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          updatedCart = [
            ...cart,
            {
              productId: item._id,
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

      removeItem: (productId: string) => {
        const updatedCart = get().cart.filter((i) => i.productId !== productId);
        const newTotal = updatedCart.reduce(
          (acc, i) => acc + i.price * i.quantity,
          0
        );

        set({ cart: updatedCart, total: newTotal });
      },

      updateQuantity: (productId: string, quantity: number) => {
        const updatedCart = get().cart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );

        const newTotal = updatedCart.reduce(
          (acc, i) => acc + i.price * i.quantity,
          0
        );

        set({ cart: updatedCart, total: newTotal });
      },

      clearCart: () => set({ cart: [], total: 0 }),

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
        // Create a mock storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        // Only persist the error state as NextAuth will handle auth persistence
        errors: state.errors,
        cart: state.cart,
        total: state.total,
      }),
    }
  )
);
