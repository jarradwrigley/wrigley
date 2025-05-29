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
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "../../../../store/store";
import { useIPLocation } from "@/app/hooks/useIpLocation";

export default function DesktopPaymentPage() {
  const { cart, total, removeItem, updateQuantity } = useStore();

  const [promoCode, setPromoCode] = useState("");
  const [note, setNote] = useState("");
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);

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
  };

  const handlePayPalCheckout = () => {
    console.log("Processing PayPal checkout...");
    // console.log("Delivery location:", getLocationDisplay());
  };

  return (
    <div className="min-h-screen ">
      <div className="w-full border-b border-gray-400 py-[1.37rem] px-[9rem] flex justify-between items-center">
        <div className="flex items-center gap-[.5rem]">
          <Image
            src="/images/logo_red.avif"
            alt="logo"
            width={55}
            height={55}
          />
          <span
            style={{ fontFamily: "museo", letterSpacing: "2px" }}
            className="font-[600] text-[1.3rem] "
          >
            CHECKOUT
          </span>
        </div>

        <Link href="/shop" className="">
          <span
            style={{ textDecoration: "underline" }}
            className="text-black/70 hover:text-black"
          >
            Continue Browsing
          </span>
        </Link>
      </div>

      <div className="py-[2rem] px-[9rem] flex gap-[2rem]">
        <div className="w-[60%] h-full ">
          <div className="w-full pt-[1.8rem] px-4 pb-6 border border-gray-300 rounded-[4px] relative">
            <span className="absolute top-[-10%] text-[14px] left-[35%] px-2 bg-white text-black">
              Express Checkout
            </span>

            <button className="hover:bg-[#ffc439]/85 rounded-[4px] bg-[#ffc439] w-full py-[.6rem]">
              <div className="flex items-center justify-center gap-2">
                <Image
                  src="/images/paypal.svg"
                  alt="logo"
                  width={55}
                  height={60}
                />
                <span>Checkout</span>
              </div>
            </button>
          </div>
        </div>
        {/* <div className="w-[40%] h-[1rem] bg-[
#f0f0f0] rounded-[4px]"></div> */}
        <div className="min-w-[40%] flex gap-[1rem] flex-col items-center">
          <div className="w-full mx-auto bg-gray-100 p-6 rounded-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-medium text-gray-800">
                Order summary ({cart.length})
              </span>
              <button className="text-gray-800 text-sm underline hover:no-underline">
                Edit Cart
              </button>
            </div>

            {/* Product Item */}
            {/* <div className="flex items-center mb-6 pb-6 border-b border-gray-300">
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23e5e7eb'/%3E%3Ctext x='40' y='40' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='12' fill='%23666'%3ECap Image%3C/text%3E%3C/svg%3E"
              alt="JW Cattle Brand Cap"
              className="w-20 h-20 object-cover rounded mr-4"
            />
            <div className="flex-1">
              <h3 className="text-gray-800 font-medium mb-1">
                JW CATTLE BRAND CAP
              </h3>
              <p className="text-gray-600 text-sm">Qty: 1</p>
            </div>
            <div className="text-gray-800 font-medium">$45.00</div>
          </div> */}
            <div className="overflow-y-auto max-h-[20rem] mb-6">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={40}
                    height={40}
                    className=" object-cover rounded"
                  />
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col">
                      <span
                        className="inline-block text-[14px] font-[600] overflow-hidden whitespace-nowrap text-ellipsis align-middle"
                        style={{ width: "12rem" }}
                      >
                        {item.title}
                      </span>
                      <span className="text-[12px]">Qty: 2</span>
                    </div>
                    <span className="text-[12px] font-[600]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <div className="mb-6">
              <button className="flex flex-col text-gray-700 hover:text-gray-900">
                <div className="flex  items-celter">
                  <span className="mr-2">🏷️</span>
                  <button onClick={() => setShowPromoInput(!showPromoInput)}>
                    <span className="underline text-sm">
                      Enter a promo code
                    </span>
                  </button>
                </div>
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
              </button>
            </div>

            {/* Order Details */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-800">Subtotal</span>
                <span className="text-gray-800">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-800">Delivery</span>
                <span className="text-gray-800">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-800">GST</span>
                <span className="text-gray-800">$0.00</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-medium text-gray-800">Total</span>
              <span className="text-xl font-medium text-gray-800">
                {formatPrice(total)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-2/5 h-4 bg-gray-300 rounded"></div>
          </div>
          <div className="flex items-center gap-3">
            <Lock size={18} />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
