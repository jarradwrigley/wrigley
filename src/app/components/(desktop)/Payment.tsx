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
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/images/product1.avif"
            alt="logo"
            width={50}
            height={50}
          />
          <span>CHECKOUT</span>
        </div>

        <Link href="/shop">
          <span>Continue Browsing</span>
        </Link>
      </div>
    </div>
  );
}
