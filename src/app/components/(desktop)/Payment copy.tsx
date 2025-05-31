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
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AddressInput } from "../AddressInput";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoidG9ueWRpbSIsImEiOiJjbWJhcDY1eHMwdGl2MmpxdWswMHAzbWJwIn0.0JLU7-Pj6XLjOrSwmgGh1w";

export default function DesktopPaymentPage() {
  const { cart, total, removeItem, updateQuantity } = useStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stage, setStage] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [note, setNote] = useState("");
  const [sameAsBillingAddress, setSameAsBillingAddress] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    cardHolder: "",
  });
  const [address, setAddress] = useState<any>({});
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

  const handleNext = () => {
    if (stage < 3) setStage(stage + 1);
  };

  const handleBack = () => {
    if (stage > 1) setStage(stage - 1);
  };

  const renderBillingDetailsContent = () => {
    switch (stage) {
      case 1:
        return (
          <>
            <div
              className="flex flex-col gap-4"
              style={{ fontFamily: "Cabin" }}
            >
              <div className="flex justify-between items-center gap-[2rem]">
                <div className="flex flex-col gap-2 w-[50%]">
                  <label>First name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none "
                  />
                </div>
                <div className="flex flex-col gap-2 w-[50%]">
                  <label>Last name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none "
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <label>Phone *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none "
                />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label>Address *</label>
                <AddressInput
                  accessToken={MAPBOX_TOKEN}
                  onSelect={(addr) => {
                    console.log("Selected Address:", addr);
                    setAddress(addr);
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none "
                />
              </div>
              <div className="flex justify-between items-center gap-[2rem]">
                <div className="flex flex-col gap-2 w-[50%]">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                    className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none "
                  />
                </div>
                <div className="flex flex-col gap-2 w-[50%]">
                  <label>Zip / Postal code *</label>
                  <input
                    type="text"
                    name="zip"
                    value={address.zip}
                    onChange={(e) =>
                      setAddress({ ...address, zip: e.target.value })
                    }
                    className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none "
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <label>Country/Region *</label>
                <input
                  type="text"
                  name="country"
                  value={address.country}
                  onChange={(e) =>
                    setAddress({ ...address, country: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none "
                />
              </div>
              <div className="flex  gap-[2rem] w-full justify-between">
                <button
                  onClick={() => router.push("/cart")}
                  // disabled={stage <= 1}
                  className="px-4 py-4 w-[50%] rounded hoverbg-gray-300 border border-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNext}
                  disabled={stage > 3}
                  className="px-4 py-2 w-[50%] rounded bg-black text-white hover:bg-black/90 disabled:opacity-50"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </>

          // <>
          //   <span className="text-lg">Delivery Address</span>

          //   <div className="flex items-center gap-[1rem]">
          //     <input
          //       type="checkbox"
          //       id="sameAsBillingAddress"
          //       checked={sameAsBillingAddress}
          //       onChange={handleSameAddressToggle}
          //       className="w-4 h-4 "
          //     />
          //     <span className="font-light">Same as billing address</span>
          //   </div>

          //   {!sameAsBillingAddress && (
          //     <div>
          //       <div className="flex flex-col">
          //         <label className="text-sm font-light">Choose a delivery address</label>
          //         <select>
          //           <option>Currently Filled Billing Address</option>
          //           {/* <option>Delivery Address from db addresses state 1 (if any)</option> */}
          //           {/* A button within the select dropdown menu for adding a new address (i.e. one that is neither the billing address nor in the addresses state of the user which can be found in next-auth session) when clicked and the address form displays, the pay button should be disabled until address is completely entered. I want to use an address api in the component so that as the user enters, it auto fills to ensure accuracy */}
          //         </select>
          //       </div>
          //     </div>
          //   )}

          //   <div className="flex gap-4">
          //     <button
          //       onClick={handleBack}
          //       disabled={stage < 2}
          //       className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
          //     >
          //       Back
          //     </button>
          //     <button
          //       onClick={handleNext}
          //       // disabled={stage === 3}
          //       className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          //     >
          //       Next
          //     </button>
          //   </div>

          //   <div className="flex  gap-[2rem] w-full justify-between">
          //     <button
          //       onClick={handleNext}
          //       disabled={stage > 3}
          //       className="px-4 py-2 w-full rounded bg-black text-white hover:bg-black/90 disabled:opacity-50"
          //     >
          //       Place Order & Pay
          //     </button>
          //   </div>
          // </>
        );
      case 2:
      case 3:
        return (
          <>
            <div className="flex font-[300] text-sm flex-col">
              <span>
                {formData.firstName} {formData.lastName}
              </span>
              <span>{session?.user?.email ?? "..."}</span>
              <span>
                {address.fullAddress ||
                  `${address.address ?? ""}, ${address.city ?? ""}, ${
                    address.state ?? ""
                  } ${address.zip ?? ""}, ${address.country ?? ""}`
                    .replace(/(, )+/g, ", ")
                    .replace(/^,|,$/g, "")
                    .trim()}
              </span>
              <span>{formData.phone}</span>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const renderCardDetailsContent = () => {
    switch (stage) {
      case 2:
        return (
          <>
            <div className="">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg">Payment Details</span>

                {stage > 2 && (
                  <button
                    onClick={handleBack}
                    disabled={stage < 2}
                    className="hover:scale-105"
                  >
                    <span className="text-sm ">Change</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label
                    htmlFor="cardNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, cardNumber: e.target.value })
                    }
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label
                    htmlFor="expirationDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    name="expirationDate"
                    id="expirationDate"
                    value={formData.expirationDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expirationDate: e.target.value,
                      })
                    }
                    placeholder="MM / YY"
                    className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label
                    htmlFor="cvv"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    id="cvv"
                    value={formData.cvv}
                    onChange={(e) =>
                      setFormData({ ...formData, cvv: e.target.value })
                    }
                    placeholder="000"
                    className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label
                    htmlFor="cardHolder"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Card Holder
                  </label>
                  <input
                    type="text"
                    name="cardHolder"
                    id="cardHolder"
                    value={formData.cardHolder}
                    onChange={(e) =>
                      setFormData({ ...formData, cardHolder: e.target.value })
                    }
                    placeholder="Full Name"
                    className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex  gap-[2rem] w-full justify-between">
              <button
                onClick={handleNext}
                disabled={stage > 3}
                className="px-4 py-2 w-full rounded bg-black text-white hover:bg-black/90 disabled:opacity-50"
              >
                Save & Continue
              </button>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="flex justify-between items-center ">
              <span className="text-lg">Payment Details</span>

              {stage > 2 && (
                <button
                  onClick={() => setStage(2)}
                  disabled={stage < 2}
                  className="hover:scale-105"
                >
                  <span className="text-sm ">Change</span>
                </button>
              )}
            </div>
            <div className="flex font-[300] text-sm flex-col">
              <span>{formData.cardNumber}</span>
              <span>
                {formData.expirationDate} {formData.cvv}
              </span>
              <span>{formData.cardHolder}</span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const handleSameAddressToggle = () => {
    setSameAsBillingAddress((prev) => !prev);
  };

  const renderDeliveryAddressContent = () => {
    switch (stage) {
      case 3:
        return (
          <>
            <span className="text-lg">Delivery Address</span>

            <div className="flex items-center gap-[1rem]">
              <input
                type="checkbox"
                id="sameAsBillingAddress"
                checked={sameAsBillingAddress}
                onChange={handleSameAddressToggle}
                className="w-4 h-4 "
              />
              <span className="font-light">Same as billing address</span>
            </div>

            {!sameAsBillingAddress && (
              <div>
                <div className="flex flex-col">
                  <label>Choose a delivery address</label>
                  <select>
                    <option>Currently Filled Billing Address</option>
                    {/* <option>Delivery Address from db addresses state 1 (if any)</option> */}
                    {/* A button within the select dropdown menu for adding a new address (i.e. one that is neither the billing address nor in the addresses state of the user which can be found in next-auth session) when clicked and the address form displays, the pay button should be disabled until address is completely entered. I want to use an address api in the component so that as the user enters, it auto fills to ensure accuracy */}
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                disabled={stage < 2}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                // disabled={stage === 3}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>

            <div className="flex  gap-[2rem] w-full justify-between">
              <button
                onClick={handleNext}
                disabled={stage > 3}
                className="px-4 py-2 w-full rounded bg-black text-white hover:bg-black/90 disabled:opacity-50"
              >
                Place Order & Pay
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="w-full border-b border-gray-400 py-[1.37rem] px-[9rem] flex justify-between items-center flex-shrink-0">
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

      {/* Main Content - Flexible */}
      <div className="flex-1 py-[1rem] px-[9rem] flex gap-[2rem] overflow-hidden">
        {/* Left Side - Scrollable */}
        <div className="w-[60%] flex flex-col gap-[2rem] overflow-y-auto pr-4 pt-4 pb-[3rem] no-scrollbar">
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

          <div className="w-full h-[.5rem] relative">
            <div className="w-full h-[1px] bg-gray-300" />
            <span className="absolute bg-white translate-y-[-.71rem] left-[46%] px-1">
              or
            </span>
          </div>

          <div className="py-4 rounded-[4px] px-3 bg-[#f0f0f0] flex items-center justify-between">
            <span className="text-sm ">
              Logged in as {session?.user?.email ?? "..."}
            </span>

            <Link href="/api/auth/signout" className="hover:scale-105">
              <span className="text-sm  p-1">Log out</span>
            </Link>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-lg">Billing Details</span>

            {stage > 1 && (
              <button
                onClick={() => setStage(1)}
                disabled={stage < 2}
                className="hover:scale-105"
              >
                <span className="text-sm ">Change</span>
              </button>
            )}
          </div>

          {renderBillingDetailsContent()}

          {renderCardDetailsContent()}

          {renderDeliveryAddressContent()}
        </div>

        {/* Right Side - Fixed/Non-scrollable */}
        <div className="min-w-[40%] flex gap-[.5rem] flex-col items-center overflow-hidden">
          <div className="w-full mx-auto bg-gray-100 p-6 rounded-lg flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <span className="text-lg font-medium text-gray-800">
                Order summary ({cart.length})
              </span>
              <button className="text-gray-800 text-sm underline hover:no-underline">
                Edit Cart
              </button>
            </div>

            {/* Product Items - Scrollable if needed */}
            <div className="flex-1 overflow-y-auto no-scrollbar mb-6">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center gap-2 mb-4">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={40}
                    height={40}
                    className="object-cover rounded"
                  />
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col">
                      <span
                        className="inline-block text-[14px] font-[600] overflow-hidden whitespace-nowrap text-ellipsis align-middle"
                        style={{ width: "12rem" }}
                      >
                        {item.title}
                      </span>
                      <span className="text-[12px]">Qty: {item.quantity}</span>
                    </div>
                    <span className="text-[12px] font-[600]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Section - Fixed */}
            <div className="flex-shrink-0">
              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex flex-col text-gray-700 hover:text-gray-900">
                  <button
                    onClick={() => setShowPromoInput(!showPromoInput)}
                    className="flex items-center"
                  >
                    <span className="mr-2">🏷️</span>
                    <span className="underline text-sm">
                      Enter a promo code
                    </span>
                  </button>

                  {showPromoInput && (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Promo code"
                        className="flex-1 bg-white border border-gray-400 rounded px-3 py-2 focus:outline-none focus:border-gray-500"
                      />
                      <button className="bg-black text-white px-4 py-2 rounded hover:bg-black/90 transition-colors">
                        Apply
                      </button>
                    </div>
                  )}
                </div>
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
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Lock size={14} />
            <span className="text-sm">Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
