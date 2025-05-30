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

// interface CartItem {
//   productId: string;
//   key: string; // composite key: ${productKey}-${size}
//   size: string;
//   quantity: number;
//   price: number;
//   title: string;
//   image: string;
// }

// interface Product {
//   _id: string;
//   key: string;
//   title: string;
//   amount: number;
//   image: string;
//   images?: string[];
//   sizes?: string[];
//   requiresSize: boolean;
//   promo?: string;
//   type?: string;
// }

interface AppState {
  auth: AuthState;
  loading: boolean;
  errors: ErrorState;

  // Cart State
  isCartOpen: boolean;
  setIsCartOpen: (value: boolean) => void;
  cart: any[];
  total: number;
  addItem: (item: any, size?: string, quantity?: number) => void;
  removeItem: (itemKey: string) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  clearCart: () => void;

  // Size Modal State
  sizeModalProduct: any | null;
  isSizeModalOpen: boolean;
  openSizeModal: (product: any) => void;
  closeSizeModal: () => void;
  addItemWithSize: (product: any, size: string, quantity: number) => void;

  // Auth actions
  setAuthState: (authState: AuthState) => void;

  syncCartToServer: () => void;
  autoSyncCart: () => void;
  loadCartFromServer: () => void;
  onLogin: () => void;
  onLogout: () => void;

  cartSynced: boolean;
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
  sizeModalProduct: null,
  isSizeModalOpen: false,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setIsCartOpen: (value) => set({ isCartOpen: value }),

      // Size Modal Actions
      openSizeModal: (product) =>
        set({
          sizeModalProduct: product,
          isSizeModalOpen: true,
        }),

      closeSizeModal: () =>
        set({
          sizeModalProduct: null,
          isSizeModalOpen: false,
        }),

      addItemWithSize: (product, size, quantity) => {
        get().addItem(product, size, quantity);
      },

      addItem: (item: any, size = "default", quantity = 1) => {
        const { cart } = get();
        const itemKey = `${item.key}-${size}`; // Composite key

        const existing = cart.find((i) => i.key === itemKey);

        let updatedCart;
        if (existing) {
          updatedCart = cart.map((i) =>
            i.key === itemKey ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          const newCartItem: any = {
            productId: item._id,
            key: itemKey,
            size: size,
            quantity: quantity,
            price: item.amount,
            title: item.title,
            image: item.image,
          };
          updatedCart = [...cart, newCartItem];
        }

        const newTotal = updatedCart.reduce(
          (acc, i) => acc + i.price * i.quantity,
          0
        );

        set({
          cart: updatedCart,
          total: newTotal,
          cartSynced: false, // Mark as unsynced after modification
        });

        // Auto-sync for authenticated users
        get().autoSyncCart();

        // Show success toast
        const sizeText = size !== "default" ? ` (Size: ${size})` : "";
        toast.success(`${item.title}${sizeText} added to cart!`, {
          icon: React.createElement(CircleCheckBig, {
            className: "h-4 w-4",
          }),
        });
      },

      removeItem: (key: string) => {
        console.log(`Store: Removing item with key: ${key}`);
        const { cart } = get();

        // Log current cart state
        console.log(`Store: Current cart before removal:`, cart);

        const updatedCart = cart.filter((i) => i.key !== key);
        const newTotal = updatedCart.reduce(
          (acc, i) => acc + i.price * i.quantity,
          0
        );

        console.log(`Store: Updated cart after removal:`, updatedCart);
        console.log(`Store: New total: ${newTotal}`);

        set({
          cart: updatedCart,
          total: newTotal,
          cartSynced: false, // Mark as unsynced after modification
        });

        // Auto-sync for authenticated users
        console.log(`Store: Triggering auto-sync after item removal`);
        get().autoSyncCart();
      },

      updateQuantity: (key: string, quantity: number) => {
        console.log(`Store: Updating quantity for key: ${key} to ${quantity}`);
        const { cart } = get();

        // Log current cart state
        console.log(`Store: Current cart before quantity update:`, cart);

        const updatedCart = cart.map((item) =>
          item.key === key ? { ...item, quantity } : item
        );

        const newTotal = updatedCart.reduce(
          (acc, i) => acc + i.price * i.quantity,
          0
        );

        console.log(`Store: Updated cart after quantity change:`, updatedCart);
        console.log(`Store: New total: ${newTotal}`);

        set({
          cart: updatedCart,
          total: newTotal,
          cartSynced: false, // Mark as unsynced after modification
        });

        // Auto-sync for authenticated users
        console.log(`Store: Triggering auto-sync after quantity update`);
        get().autoSyncCart();
      },

      clearCart: () => {
        set({
          cart: [],
          total: 0,
          cartSynced: false, // Mark as unsynced after modification
        });

        // Auto-sync for authenticated users
        get().autoSyncCart();
      },

      setAuthState: (authState) => set({ auth: authState }),

      syncCartToServer: async () => {
        const { cart, total, auth } = get();

        console.log(`Sync to server: Starting...`);
        console.log(`Sync to server: Cart data:`, cart);
        console.log(`Sync to server: Total:`, total);
        console.log(`Sync to server: Auth state:`, auth);

        // Only sync if user is authenticated
        if (!auth.isAuthenticated) {
          console.log(`Sync to server: Skipped - user not authenticated`);
          return;
        }

        try {
          console.log(`Sync to server: Making API call...`);
          const res = await fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart, total }),
          });

          console.log(`Sync to server: API response status:`, res.status);

          if (!res.ok) {
            const errorText = await res.text();
            console.error(`Sync to server: API error:`, errorText);
            throw new Error(
              `Failed to sync cart: ${res.status} ${res.statusText}`
            );
          }

          const responseData = await res.json();
          console.log(`Sync to server: API response:`, responseData);

          // Mark cart as synced
          set({ cartSynced: true });
          console.log(`Sync to server: Cart marked as synced`);
        } catch (error) {
          console.error("Sync to server: Error occurred:", error);
          set({ cartSynced: false });
          toast.error("Failed to sync cart to server");
        }
      },

      // Auto-sync helper that can be called after cart modifications
      autoSyncCart: async () => {
        const { auth, cartSynced, cart, total } = get();

        console.log(
          `Auto-sync triggered. Auth: ${auth.isAuthenticated}, Synced: ${cartSynced}`
        );
        console.log(`Current cart for sync:`, cart);
        console.log(`Current total for sync:`, total);

        // Only auto-sync if user is authenticated and cart is not already synced
        if (auth.isAuthenticated && !cartSynced) {
          console.log(`Auto-sync: Starting sync process...`);

          // Debounce the sync to avoid too many requests
          setTimeout(async () => {
            try {
              console.log(`Auto-sync: Executing sync to server...`);
              await get().syncCartToServer();
              console.log(`Auto-sync: Sync completed successfully`);
            } catch (error) {
              console.error(`Auto-sync: Sync failed:`, error);
            }
          }, 1000);
        } else {
          if (!auth.isAuthenticated) {
            console.log(`Auto-sync: Skipped - user not authenticated`);
          } else if (cartSynced) {
            console.log(`Auto-sync: Skipped - cart already synced`);
          }
        }
      },

      loadCartFromServer: async () => {
        try {
          const res = await fetch("/api/cart");
          if (res.ok) {
            const data = await res.json();
            set({ cart: data.cart || [], total: data.total || 0 });
          }
        } catch (error) {
          console.error("Load cart error:", error);
        }
      },

      setCartSynced: (synced) => set({ cartSynced: synced }),

      onLogin: async () => {
        try {
          // 1. Load the user's saved cart from the database
          const res = await fetch("/api/cart");
          let dbCart: any[] = [];

          if (res.ok) {
            const data = await res.json();
            dbCart = data.cart || [];
          }

          // 2. Get the current guest cart
          const guestCart = get().cart;

          // 3. Create a map of DB cart items for easier lookup
          const dbCartMap = new Map<string, any>();
          dbCart.forEach((item) => {
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
          const { cart, total } = get();

          // Show loading state during logout
          set({ loading: true });

          // Only sync if there are items in cart or if cart state has changed
          if (cart.length > 0 || total > 0) {
            console.log("Syncing cart to server before logout...", {
              cart,
              total,
            });

            const syncResponse = await fetch("/api/cart/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cart, total }),
            });

            if (!syncResponse.ok) {
              console.error("Failed to sync cart during logout");
              toast.error("Failed to save cart changes. Please try again.");
              set({ loading: false });
              return; // Don't proceed with logout if sync fails
            }

            console.log("Cart successfully synced to server");
            toast.success("Cart saved successfully!", {
              icon: React.createElement(CircleCheckBig, {
                className: "h-4 w-4",
              }),
            });
          }

          // Proceed with sign out
          await signOut({ redirect: false });

          // Clear local state after successful logout
          set({
            cart: [],
            total: 0,
            cartSynced: false,
            loading: false,
            auth: {
              user: null,
              isAuthenticated: false,
            },
            // Also close any open modals
            sizeModalProduct: null,
            isSizeModalOpen: false,
          });

          console.log("Logout completed successfully");
        } catch (error) {
          console.error("Logout error:", error);
          set({ loading: false });

          // Show error but still attempt to sign out
          toast.error(
            "Error during logout. Your cart may not have been saved."
          );

          try {
            await signOut({ redirect: false });
            set({
              cart: [],
              total: 0,
              cartSynced: false,
              auth: {
                user: null,
                isAuthenticated: false,
              },
              sizeModalProduct: null,
              isSizeModalOpen: false,
            });
          } catch (signOutError) {
            console.error("Failed to sign out:", signOutError);
            toast.error(
              "Failed to sign out completely. Please refresh the page."
            );
          }
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
        cartSynced: state.cartSynced,
      }),
    }
  )
);
