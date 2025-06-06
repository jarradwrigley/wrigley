"use client";

import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";
import { useStore } from "store/store";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, total, removeItem, updateQuantity, clearCart } = useStore();

  // useEffect(() => {
  //   console.log("ccc", cart);
  // }, [cart]);
  
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleQuantityChange = (key: string, newQuantity: number) => {
    console.log(
      `Cart Drawer: Changing quantity for key ${key} to ${newQuantity}`
    );

    if (newQuantity <= 0) {
      console.log(`Cart Drawer: Removing item with key ${key}`);
      removeItem(key);
    } else {
      console.log(
        `Cart Drawer: Updating quantity for key ${key} to ${newQuantity}`
      );
      updateQuantity(key, newQuantity);
    }
  };

  const handleRemoveItem = (key: string) => {
    console.log(`Cart Drawer: Directly removing item with key ${key}`);
    removeItem(key);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = "/cart";
    onClose();
  };

  // Helper function to get display title (remove size from key for cleaner display)
  const getDisplayTitle = (item: any) => {
    // If you want to show the actual title instead of the key
    return item.title;
  };

  // Helper function to get size from the composite key
  const getSizeFromKey = (key: string) => {
    // Add safety check for undefined/null key
    if (!key || typeof key !== "string") {
      return "";
    }

    const parts = key.split("-");
    const size = parts[parts.length - 1];
    return size === "default" ? "" : size;
  };
  
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40  transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-dvh w-96 bg-neutral-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-normal">
              Cart{" "}
              {cart.length > 0 &&
                `(${cart.length} item${cart.length > 1 ? "s" : ""})`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 rounded transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-[85%]">
          {cart.length === 0 ? (
            /* Empty Cart */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <ShoppingBag className="w-16 h-16 text-neutral-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-neutral-400 mb-6">
                Add some items to get started
              </p>
              <button
                onClick={onClose}
                className="bg-white text-black px-6 py-2 rounded hover:bg-neutral-100 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                <div className="space-y-6">
                  {cart.map((item) => {
                    const itemSize = getSizeFromKey(item.key);

                    return (
                      <div key={item.key} className="flex gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-normal text-white text-sm uppercase tracking-wide">
                            {getDisplayTitle(item)}
                            {itemSize && (
                              <span className="text-xs text-neutral-400 ml-2">
                                Size: {itemSize}
                              </span>
                            )}
                          </h3>
                          {/* <p className="text-xs text-neutral-500 mt-1">
                            Key: {item.key}
                          </p> */}
                          <p className="text-white mt-2 font-medium">
                            {formatPrice(item.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mt-4">
                            <div className="flex items-center border border-neutral-600 rounded">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.key,
                                    item.quantity - 1
                                  )
                                }
                                className="p-2 hover:bg-neutral-800 transition-colors text-white"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-4 py-2 text-sm font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.key,
                                    item.quantity + 1
                                  )
                                }
                                className="p-2 hover:bg-neutral-800 transition-colors text-white"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Remove Button & Item Total */}
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => handleRemoveItem(item.key)}
                            className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-white"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <p className="font-medium text-white">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-700 p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-lg">
                  <span className="text-neutral-300">Subtotal</span>
                  <span className="font-medium text-white">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Debug Info (remove in production) */}
                {/* <div className="text-xs text-neutral-500 border-t border-neutral-700 pt-2">
                  <p>Cart items: {cart.length}</p>
                  <p>Total: {formatPrice(total)}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer">
                      Debug Cart State
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto max-h-20">
                      {JSON.stringify(cart, null, 2)}
                    </pre>
                  </details>
                </div> */}

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-white text-black py-1 rounded font-medium hover:bg-neutral-100 transition-colors"
                >
                  View Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
