

// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Search,
//   Mail,
//   Package,
//   CheckCircle,
//   Clock,
//   Truck,
//   ArrowLeft,
// } from "lucide-react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";

// export default function GuestOrderTracking() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // Get URL parameters for confirmation mode
//   const urlOrderNumber = searchParams.get("orderNumber");
//   const urlEmail = searchParams.get("email");
//   const isConfirmationMode = Boolean(urlOrderNumber && urlEmail);

//   const [orderNumber, setOrderNumber] = useState(urlOrderNumber || "");
//   const [email, setEmail] = useState(urlEmail || "");
//   const [order, setOrder] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [emailSent, setEmailSent] = useState(false);
//   const [isInitialLoad, setIsInitialLoad] = useState(isConfirmationMode);

//   // Auto-load order if in confirmation mode
//   useEffect(() => {
//     if (isConfirmationMode && !order && !loading) {
//       trackOrderInternal(urlOrderNumber!, urlEmail!);
//     }
//   }, [isConfirmationMode, urlOrderNumber, urlEmail]);

//   const trackOrderInternal = async (orderNum: string, emailAddr: string) => {
//     if (!orderNum.trim() || !emailAddr.trim()) {
//       setError("Please enter both order number and email address");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const response = await fetch(`/api/guests/${orderNum}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email: emailAddr }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Order not found");
//       }

//       setOrder(data.order);
//       setIsInitialLoad(false);
//     } catch (err: any) {
//       setError(
//         err.message ||
//           "Failed to find order. Please check your order number and email address."
//       );
//       setOrder(null);
//       setIsInitialLoad(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const trackOrder = async (e: any) => {
//     e.preventDefault();
//     await trackOrderInternal(orderNumber, email);
//   };

//   const resendConfirmation = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch("/api/orders/resend-confirmation", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ orderNumber, email }),
//       });

//       if (response.ok) {
//         setEmailSent(true);
//         setTimeout(() => setEmailSent(false), 5000);
//       }
//     } catch (err) {
//       setError("Failed to resend confirmation email");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusIcon = (status: any) => {
//     switch (status) {
//       case "confirmed":
//         return <CheckCircle className="w-5 h-5 text-green-500" />;
//       case "processing":
//         return <Clock className="w-5 h-5 text-yellow-500" />;
//       case "shipped":
//         return <Truck className="w-5 h-5 text-blue-500" />;
//       case "delivered":
//         return <Package className="w-5 h-5 text-green-600" />;
//       default:
//         return <Clock className="w-5 h-5 text-gray-500" />;
//     }
//   };

//   const formatPrice = (price: any) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//     }).format(price);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4">
//         {/* Header - Different for confirmation vs tracking */}
//         <div className="text-center mb-8">
//           {isConfirmationMode ? (
//             <>
//               <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                 Order Confirmed!
//               </h1>
//               <p className="text-gray-600">
//                 Thank you for your order. Your order details are shown below.
//               </p>
//               {isInitialLoad && (
//                 <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
//                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
//                   <span>Loading your order details...</span>
//                 </div>
//               )}
//             </>
//           ) : (
//             <>
//               <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                 Track Your Order
//               </h1>
//               <p className="text-gray-600">
//                 Enter your order details to view status and tracking information
//               </p>
//             </>
//           )}
//         </div>

//         {/* Navigation for confirmation mode */}
//         {isConfirmationMode && (
//           <div className="mb-6">
//             <Link
//               href="/shop"
//               className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Continue Shopping
//             </Link>
//           </div>
//         )}

//         {/* Order Lookup Form - Hidden in confirmation mode when order is loaded */}
//         {(!isConfirmationMode || (!order && !isInitialLoad)) && (
//           <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//             <div className="space-y-4">
//               <div className="grid md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Order Number *
//                   </label>
//                   <input
//                     type="text"
//                     value={orderNumber}
//                     onChange={(e) => setOrderNumber(e.target.value)}
//                     placeholder="ORD-1234567890-ABC123"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address *
//                   </label>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="your@email.com"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                   />
//                 </div>
//               </div>

//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                   <p className="text-red-700 text-sm">{error}</p>
//                 </div>
//               )}

//               {emailSent && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                   <p className="text-green-700 text-sm">
//                     <Mail className="w-4 h-4 inline mr-2" />
//                     Confirmation email sent successfully!
//                   </p>
//                 </div>
//               )}

//               <button
//                 type="button"
//                 onClick={trackOrder}
//                 disabled={loading}
//                 className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
//                 ) : (
//                   <Search className="w-5 h-5" />
//                 )}
//                 {loading ? "Searching..." : "Track Order"}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Order Details */}
//         {order && (
//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             {/* Order Header */}
//             <div className="bg-gray-900 text-white p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h2 className="text-xl font-bold mb-2">
//                     Order #{order.orderNumber}
//                   </h2>
//                   <p className="text-gray-300">
//                     Placed on {new Date(order.createdAt).toLocaleDateString()}
//                   </p>
//                   {isConfirmationMode && (
//                     <p className="text-green-300 mt-2 font-medium">
//                       ✓ Payment processed successfully
//                     </p>
//                   )}
//                 </div>
//                 <div className="text-right">
//                   <div className="flex items-center gap-2 mb-2">
//                     {getStatusIcon(order.status)}
//                     <span className="capitalize font-medium">
//                       {order.status}
//                     </span>
//                   </div>
//                   <button
//                     onClick={resendConfirmation}
//                     disabled={loading}
//                     className="text-blue-300 hover:text-blue-100 text-sm underline disabled:opacity-50"
//                   >
//                     Resend confirmation email
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Confirmation Message */}
//             {isConfirmationMode && (
//               <div className="bg-green-50 border-b border-green-200 p-6">
//                 <div className="flex items-start gap-3">
//                   <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
//                   <div>
//                     <h3 className="font-semibold text-green-900 mb-2">
//                       Your order has been confirmed!
//                     </h3>
//                     <p className="text-green-700 text-sm mb-2">
//                       We've sent a confirmation email to{" "}
//                       <strong>{email}</strong> with your order details.
//                     </p>
//                     <p className="text-green-700 text-sm">
//                       You can track your order anytime by returning to this page
//                       with your order number and email.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Order Status Timeline */}
//             <div className="p-6 border-b">
//               <h3 className="text-lg font-semibold mb-4">Order Status</h3>
//               <div className="space-y-4">
//                 {[
//                   {
//                     status: "confirmed",
//                     label: "Order Confirmed",
//                     completed: true,
//                   },
//                   {
//                     status: "processing",
//                     label: "Processing",
//                     completed: order.status !== "confirmed",
//                   },
//                   {
//                     status: "shipped",
//                     label: "Shipped",
//                     completed: ["shipped", "delivered"].includes(order.status),
//                   },
//                   {
//                     status: "delivered",
//                     label: "Delivered",
//                     completed: order.status === "delivered",
//                   },
//                 ].map((step, index) => (
//                   <div key={step.status} className="flex items-center gap-4">
//                     <div
//                       className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                         step.completed
//                           ? "bg-green-100 text-green-600"
//                           : "bg-gray-100 text-gray-400"
//                       }`}
//                     >
//                       {getStatusIcon(step.status)}
//                     </div>
//                     <span
//                       className={`${
//                         step.completed ? "text-gray-900" : "text-gray-400"
//                       }`}
//                     >
//                       {step.label}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Order Items */}
//             <div className="p-6 border-b">
//               <h3 className="text-lg font-semibold mb-4">Order Items</h3>
//               <div className="space-y-4">
//                 {order.items.map((item: any, index: any) => (
//                   <div
//                     key={index}
//                     className="flex items-center gap-4 p-4 border rounded-lg"
//                   >
//                     <img
//                       src={item.image}
//                       alt={item.title}
//                       className="w-16 h-16 object-cover rounded"
//                     />
//                     <div className="flex-1">
//                       <h4 className="font-medium">{item.title}</h4>
//                       <p className="text-gray-600">Quantity: {item.quantity}</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-semibold">
//                         {formatPrice(item.price * item.quantity)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Shipping Address */}
//             <div className="p-6 border-b">
//               <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
//               <div className="text-gray-600">
//                 <p>
//                   {order.guestInfo?.firstName} {order.guestInfo?.lastName}
//                 </p>
//                 <p>
//                   {order.deliveryAddress.fullAddress ||
//                     `${order.deliveryAddress.address}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zip}`}
//                 </p>
//                 <p>{order.guestInfo?.phone}</p>
//                 <p>{order.guestInfo?.email || email}</p>
//               </div>
//             </div>

//             {/* Order Summary */}
//             <div className="p-6">
//               <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
//               <div className="space-y-2">
//                 <div className="flex justify-between">
//                   <span>Subtotal</span>
//                   <span>{formatPrice(order.subtotal)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Shipping</span>
//                   <span>Free</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Tax</span>
//                   <span>$0.00</span>
//                 </div>
//                 <div className="border-t pt-2 flex justify-between font-bold text-lg">
//                   <span>Total</span>
//                   <span>{formatPrice(order.total)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Help Section */}
//         <div className="mt-8 bg-blue-50 rounded-lg p-6">
//           <h3 className="text-lg font-semibold text-blue-900 mb-2">
//             Need Help?
//           </h3>
//           <p className="text-blue-700 mb-4">
//             {isConfirmationMode
//               ? "Questions about your order? We're here to help!"
//               : "Can't find your order or need assistance? We're here to help!"}
//           </p>
//           <div className="flex flex-wrap gap-4">
//             <a
//               href="/contact"
//               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//             >
//               Contact Support
//             </a>
//             <a
//               href="/help/orders"
//               className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
//             >
//               Order Help
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  Search,
  Mail,
  Package,
  CheckCircle,
  Clock,
  Truck,
  ArrowLeft,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LoadingFallback from "../components/FallbackLoading";

// Separate component for the search params logic
function GuestOrderTrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL parameters for confirmation mode
  const urlOrderNumber = searchParams.get("orderNumber");
  const urlEmail = searchParams.get("email");
  const isConfirmationMode = Boolean(urlOrderNumber && urlEmail);

  const [orderNumber, setOrderNumber] = useState(urlOrderNumber || "");
  const [email, setEmail] = useState(urlEmail || "");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(isConfirmationMode);

  // Auto-load order if in confirmation mode
  useEffect(() => {
    if (isConfirmationMode && !order && !loading) {
      trackOrderInternal(urlOrderNumber!, urlEmail!);
    }
  }, [isConfirmationMode, urlOrderNumber, urlEmail]);

  const trackOrderInternal = async (orderNum: string, emailAddr: string) => {
    if (!orderNum.trim() || !emailAddr.trim()) {
      setError("Please enter both order number and email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/guests/${orderNum}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailAddr }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Order not found");
      }

      setOrder(data.order);
      setIsInitialLoad(false);
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to find order. Please check your order number and email address."
      );
      setOrder(null);
      setIsInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  const trackOrder = async (e: any) => {
    e.preventDefault();
    await trackOrderInternal(orderNumber, email);
  };

  const resendConfirmation = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders/resend-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderNumber, email }),
      });

      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000);
      }
    } catch (err) {
      setError("Failed to resend confirmation email");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-500" />;
      case "delivered":
        return <Package className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header - Different for confirmation vs tracking */}
        <div className="text-center mb-8">
          {isConfirmationMode ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order Confirmed!
              </h1>
              <p className="text-gray-600">
                Thank you for your order. Your order details are shown below.
              </p>
              {isInitialLoad && (
                <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                  <span>Loading your order details...</span>
                </div>
              )}
            </>
          ) : (
            <>
              <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Track Your Order
              </h1>
              <p className="text-gray-600">
                Enter your order details to view status and tracking information
              </p>
            </>
          )}
        </div>

        {/* Navigation for confirmation mode */}
        {isConfirmationMode && (
          <div className="mb-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        )}

        {/* Order Lookup Form - Hidden in confirmation mode when order is loaded */}
        {(!isConfirmationMode || (!order && !isInitialLoad)) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="ORD-1234567890-ABC123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {emailSent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 text-sm">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Confirmation email sent successfully!
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={trackOrder}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {loading ? "Searching..." : "Track Order"}
              </button>
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Order Header */}
            <div className="bg-gray-900 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    Order #{order.orderNumber}
                  </h2>
                  <p className="text-gray-300">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  {isConfirmationMode && (
                    <p className="text-green-300 mt-2 font-medium">
                      ✓ Payment processed successfully
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(order.status)}
                    <span className="capitalize font-medium">
                      {order.status}
                    </span>
                  </div>
                  <button
                    onClick={resendConfirmation}
                    disabled={loading}
                    className="text-blue-300 hover:text-blue-100 text-sm underline disabled:opacity-50"
                  >
                    Resend confirmation email
                  </button>
                </div>
              </div>
            </div>

            {/* Confirmation Message */}
            {isConfirmationMode && (
              <div className="bg-green-50 border-b border-green-200 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2">
                      Your order has been confirmed!
                    </h3>
                    <p className="text-green-700 text-sm mb-2">
                      We've sent a confirmation email to{" "}
                      <strong>{email}</strong> with your order details.
                    </p>
                    <p className="text-green-700 text-sm">
                      You can track your order anytime by returning to this page
                      with your order number and email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Status Timeline */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold mb-4">Order Status</h3>
              <div className="space-y-4">
                {[
                  {
                    status: "confirmed",
                    label: "Order Confirmed",
                    completed: true,
                  },
                  {
                    status: "processing",
                    label: "Processing",
                    completed: order.status !== "confirmed",
                  },
                  {
                    status: "shipped",
                    label: "Shipped",
                    completed: ["shipped", "delivered"].includes(order.status),
                  },
                  {
                    status: "delivered",
                    label: "Delivered",
                    completed: order.status === "delivered",
                  },
                ].map((step, index) => (
                  <div key={step.status} className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {getStatusIcon(step.status)}
                    </div>
                    <span
                      className={`${
                        step.completed ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item: any, index: any) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
              <div className="text-gray-600">
                <p>
                  {order.guestInfo?.firstName} {order.guestInfo?.lastName}
                </p>
                <p>
                  {order.deliveryAddress.fullAddress ||
                    `${order.deliveryAddress.address}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zip}`}
                </p>
                <p>{order.guestInfo?.phone}</p>
                <p>{order.guestInfo?.email || email}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Need Help?
          </h3>
          <p className="text-blue-700 mb-4">
            {isConfirmationMode
              ? "Questions about your order? We're here to help!"
              : "Can't find your order or need assistance? We're here to help!"}
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/contact"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Contact Support
            </a>
            <a
              href="/help/orders"
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              Order Help
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component


// Main component with Suspense wrapper
export default function GuestOrderTracking() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GuestOrderTrackingContent />
    </Suspense>
  );
}