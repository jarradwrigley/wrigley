"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  Truck,
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  ArrowLeft,
  Download,
  Share,
} from "lucide-react";
import LoadingFallback from "@/app/components/FallbackLoading";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface Address {
  city: string;
  coordinates: [number, number];
  country: string;
  fullAddress: string;
  state: string;
  zip: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  billingAddress: Address;
  deliveryAddress: Address;
  paymentDetails: {
    firstName: string;
    lastName: string;
    phone: string;
    cardHolder: string;
    cardNumber: string;
    expirationDate: string;
  };
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Loading component
// function LoadingFallback() {
//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="text-center">
//         <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//         <p className="text-gray-600">Loading order details...</p>
//       </div>
//     </div>
//   );
// }

export default function OrderPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get orderNumber from URL params
  const orderNumber = params.orderNumber as string;

  useEffect(() => {
    if (!orderNumber) {
      setError("Order number not found");
      setLoading(false);
      return;
    }

    fetchOrder();
  }, [orderNumber]);

  const fetchOrder = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/orders/guests/${orderNumber}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch order");
      }

      // console.log('rrr', result);
      setOrder(result.order);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handlePrint = (): void => {
    window.print();
  };

  const handleShare = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order ${orderNumber}`,
          text: `My order confirmation from Your Store`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return <LoadingFallback />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error ||
              "The order you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-black/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image
                  src="/images/logo_red.avif"
                  alt="logo"
                  width={50}
                  height={50}
                  className="cursor-pointer"
                />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order Details
                </h1>
                <p className="text-gray-600">Order #{orderNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Banner - Only show if status is recent */}
      {(order.status === "pending" || order.status === "processing") && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-green-900">
                  Order Placed Successfully!
                </h2>
                <p className="text-green-700">
                  We've received your order and will process it shortly. You'll
                  receive an email confirmation at{" "}
                  <span className="font-medium">{order.userEmail}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Details
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Order Number:</span>
                  <p className="font-medium">{order.orderNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">Order Date:</span>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <p className="font-medium text-lg">
                    {formatPrice(order.total)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Payment Method:</span>
                  <p className="font-medium">
                    Credit Card (...{order.paymentDetails.cardNumber.slice(-4)})
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Items Ordered
              </h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={80}
                      height={80}
                      className="object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Price: {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Billing Address */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Billing Address
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {order.paymentDetails.firstName}{" "}
                    {order.paymentDetails.lastName}
                  </p>
                  <p>{order.billingAddress.fullAddress}</p>
                  <p>{order.paymentDetails.phone}</p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {order.paymentDetails.firstName}{" "}
                    {order.paymentDetails.lastName}
                  </p>
                  <p>{order.deliveryAddress.fullAddress}</p>
                  <p>{order.paymentDetails.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-gray-900">
                    {order.deliveryFee === 0
                      ? "Free"
                      : formatPrice(order.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">$0.00</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What's Next?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Email Confirmation
                    </p>
                    <p className="text-sm text-gray-600">
                      You'll receive an email confirmation shortly with your
                      order details.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Package className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Order Processing
                    </p>
                    <p className="text-sm text-gray-600">
                      Our team will process your order within 1-2 business days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Truck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Shipping Updates
                    </p>
                    <p className="text-sm text-gray-600">
                      We'll send you tracking information once your order ships.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/orders"
                className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-black/90 transition-colors text-center block"
              >
                View All Orders
              </Link>
              <Link
                href="/shop"
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
