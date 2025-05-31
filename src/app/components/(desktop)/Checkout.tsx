"use client";

import {
  ChevronRight,
  Tag,
  FileText,
  Minus,
  Plus,
  Trash2,
  Lock,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "../../../../store/store";
import { useIPLocation } from "@/app/hooks/useIpLocation";
import { useRouter } from "next/navigation";

export default function DesktopCheckoutPage() {
  const { cart, total, removeItem, updateQuantity } = useStore();

  // Use IP location hook
  const {
    city,
    state,
    country,
    loading: locationLoading,
    error: locationError,
  } = useIPLocation();
const router = useRouter()
  const [promoCode, setPromoCode] = useState("");
  const [note, setNote] = useState("");
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);

  useEffect(() => {
    // When user is on cart page, allow them to access checkout
    sessionStorage.setItem("canAccessCheckout", "true");
    sessionStorage.setItem("checkoutAllowedTime", Date.now().toString());
  }, []);

  const deliveryFee = 0; // Free delivery
  const finalTotal = total + deliveryFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    console.log("Processing checkout...");
    // console.log("Delivery location:", getLocationDisplay());
    router.push('/payment')
  };

  const handlePayPalCheckout = () => {
    console.log("Processing PayPal checkout...");
    console.log("Delivery location:", getLocationDisplay());
  };

  // Format location display based on available data
  const getLocationDisplay = () => {
    if (locationLoading) {
      return "Detecting location...";
    }

    if (locationError) {
      return "Lagos, Nigeria"; // Fallback
    }

    // Build location string based on available data
    const parts = [];
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (country) parts.push(country);

    return parts.length > 0 ? parts.join(", ") : "Lagos, Nigeria";
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Section - Cart Items */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-normal">My cart</h1>
              <Link
                href="/shop"
                className="flex items-center text-neutral-300 hover:text-white transition-colors"
              >
                Continue Browsing
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Cart Items */}
            <div className="space-y-6 mb-8">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-400 mb-4">Your cart is empty</p>
                  <Link
                    href="/"
                    className="inline-block bg-white text-black px-6 py-2 rounded hover:bg-neutral-100 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="border-b border-neutral-700 pb-6"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={120}
                          height={120}
                          className="w-30 h-30 object-cover rounded"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-normal text-lg uppercase tracking-wide mb-2">
                          {item.title}
                        </h3>
                        <p className="text-white text-lg font-medium mb-4">
                          {formatPrice(item.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-neutral-600 rounded">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              className="p-2 hover:bg-neutral-800 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              className="p-2 hover:bg-neutral-800 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-white mb-2"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <p className="text-lg font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Promo Code and Note Sections */}
            {cart.length > 0 && (
              <div className="space-y-4">
                {/* Promo Code */}
                <div className="border-b border-neutral-700 pb-4">
                  <button
                    onClick={() => setShowPromoInput(!showPromoInput)}
                    className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
                  >
                    <Tag className="w-5 h-5" />
                    Enter a promo code
                  </button>
                  {showPromoInput && (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Promo code"
                        className="flex-1 bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-500"
                      />
                      <button className="bg-white text-black px-4 py-2 rounded hover:bg-neutral-100 transition-colors">
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Add Note */}
                <div>
                  <button
                    onClick={() => setShowNoteInput(!showNoteInput)}
                    className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    Add a note
                  </button>
                  {showNoteInput && (
                    <div className="mt-4">
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a note to your order..."
                        rows={3}
                        className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-500 resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-2xl font-normal mb-8">Order summary</h2>

              <div className="space-y-6">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Subtotal</span>
                  <span className="text-xl font-medium">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Delivery Section - This is where the location appears */}
                <div className="flex justify-between items-center border-b border-neutral-700 pb-6">
                  <div>
                    <p className="text-neutral-300">Delivery</p>
                    <div className="flex items-center gap-1 text-sm text-neutral-400">
                      {locationLoading && (
                        <MapPin className="w-3 h-3 animate-pulse" />
                      )}
                      <p
                        className={`underline cursor-default ${
                          locationLoading ? "animate-pulse" : ""
                        }`}
                      >
                        {getLocationDisplay()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-medium">FREE</span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center text-xl font-medium">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>

                {/* Checkout Buttons */}
                <div className="space-y-3 mt-8">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-white text-black py-4 rounded font-medium hover:bg-neutral-100 transition-colors text-lg"
                    disabled={cart.length === 0}
                  >
                    Checkout
                  </button>

                  <button
                    onClick={handlePayPalCheckout}
                    className="w-full bg-yellow-400 text-black py-4 rounded font-medium hover:bg-yellow-500 transition-colors text-lg flex items-center justify-center gap-2"
                    disabled={cart.length === 0}
                  >
                    <span className="font-bold text-blue-600">PayPal</span>
                    <span>Checkout</span>
                  </button>

                  {/* Secure Checkout */}
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-400 mt-4">
                    <Lock className="w-4 h-4" />
                    <span>Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
