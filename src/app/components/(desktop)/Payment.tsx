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
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useStore } from "../../../../store/store";
import { useIPLocation } from "@/app/hooks/useIpLocation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AddressInput } from "../AddressInput";
import LoadingScreen from "../LoadingScreen";
import {
  validateCheckoutForm,
  validatePhone,
  validateName,
  validateAddress,
  validateCreditCard,
  formatCardNumber,
  formatExpirationDate,
} from "@/lib/utils";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoidG9ueWRpbSIsImEiOiJjbWJhcDY1eHMwdGl2MmpxdWswMHAzbWJwIn0.0JLU7-Pj6XLjOrSwmgGh1w";

interface SavedAddress {
  id: string;
  fullAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

interface AddressData {
  fullAddress?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  coordinates?: [number, number];
}

export default function DesktopPaymentPage() {
  const {
    loading,
    cart,
    total,
    removeItem,
    updateQuantity,
    setLoading,
    setErrors,
    clearCart,
  } = useStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stage, setStage] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [note, setNote] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  const [sameAsBillingAddress, setSameAsBillingAddress] = useState(true);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] =
    useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    cardHolder: "",
  });
  const [address, setAddress] = useState<AddressData>({});
  const [deliveryAddress, setDeliveryAddress] = useState<AddressData>({});
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [flowErrors, setFlowErrors] = useState<any>({});
  const [fieldTouched, setFieldTouched] = useState<any>({});

  useEffect(() => {
    const validateCheckoutAccess = () => {
      // Check if we're currently navigating to order confirmation
      const isNavigatingToOrderConfirmation =
        window.location.pathname.includes("/orders") ||
        sessionStorage.getItem("orderProcessing") === "true";

      // Skip validation if navigating to order confirmation
      if (isNavigatingToOrderConfirmation) {
        console.log(
          "🛒 Skipping validation - navigating to order confirmation"
        );
        return;
      }

      // Check 1: Cart must not be empty
      if (!cart || cart.length === 0) {
        // Clear checkout access since cart is empty
        sessionStorage.removeItem("canAccessCheckout");
        sessionStorage.removeItem("checkoutAllowedTime");

        console.log("🛒 Cart is empty, redirecting to home");
        router.replace("/");
        return;
      }

      // Check 2: Session-based access control
      const canAccessCheckout = sessionStorage.getItem("canAccessCheckout");
      const checkoutAllowedTime = sessionStorage.getItem("checkoutAllowedTime");

      // Check if session is still valid (within 30 minutes)
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      const isSessionValid =
        checkoutAllowedTime &&
        Date.now() - parseInt(checkoutAllowedTime) < sessionTimeout;

      if (!canAccessCheckout || !isSessionValid) {
        // Clear expired session
        sessionStorage.removeItem("canAccessCheckout");
        sessionStorage.removeItem("checkoutAllowedTime");

        toast.warning("Payment session expired", {
          description: "Please go through checkout page",
          duration: 4000,
          action: {
            label: "Go to Checkout",
            onClick: () => router.push("/checkout"),
          },
        });
        router.replace("/");
        return;
      }

      // Check 3: Additional referrer validation (optional)
      const referrer = document.referrer;
      if (referrer && referrer.includes(window.location.origin)) {
        const referrerPath = new URL(referrer).pathname;
        console.log("🔍 Came from:", referrerPath);
      }

      // Success - extend session
      sessionStorage.setItem("checkoutAllowedTime", Date.now().toString());
    };

    // Only run validation after cart data is loaded
    if (cart !== undefined) {
      validateCheckoutAccess();
    }
  }, [cart, router]);

  // Clean up session when leaving checkout (optional)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes("/checkout") &&
        !currentPath.includes("/orders")
      ) {
        sessionStorage.removeItem("canAccessCheckout");
        sessionStorage.removeItem("checkoutAllowedTime");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const deliveryFee = 0; // Free delivery
  const finalTotal = total + deliveryFee;

  const isBillingAddressComplete = () => {
    const nameValidation =
      validateName(formData.firstName) && validateName(formData.lastName);
    const phoneValidation = validatePhone(formData.phone);
    const addressValidation = validateAddress(address);

    return (
      nameValidation.isValid &&
      phoneValidation.isValid &&
      addressValidation.isValid
    );
  };

  const isPaymentDetailsComplete = () => {
    const paymentValidation = validateCreditCard(formData);
    return paymentValidation.isValid;
  };

  const isDeliveryAddressComplete = () => {
    if (sameAsBillingAddress) {
      return isBillingAddressComplete();
    }

    if (selectedDeliveryAddress && selectedDeliveryAddress !== "new") {
      return true;
    }

    if (showNewAddressForm || selectedDeliveryAddress === "new") {
      const deliveryValidation = validateAddress(deliveryAddress);
      return deliveryValidation.isValid;
    }

    return false;
  };

  // Fetch saved addresses when component mounts
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      if (session?.user?.id) {
        try {
          // Replace with your actual API endpoint
          const response = await fetch(
            // `/api/users/${session.user.id}/addresses`
            `/api/users/addresses`
          );
          if (response.ok) {
            const addresses = await response.json();
            setSavedAddresses(addresses);
          }
        } catch (error) {
          console.error("Failed to fetch saved addresses:", error);
        }
      }
    };

    fetchSavedAddresses();
  }, [session]);

  // useEffect(() => {console.log('ddsss', savedAddresses)}, [savedAddresses])

  useEffect(() => {
    const finalDeliveryAddress = sameAsBillingAddress
      ? address
      : deliveryAddress;
    const validation = validateCheckoutForm(
      formData,
      address,
      finalDeliveryAddress,
      sameAsBillingAddress
    );
    setFlowErrors(validation.errors);
  }, [formData, address, deliveryAddress, sameAsBillingAddress]);

  // Handle field blur for validation
  const handleFieldBlur = (fieldName: any) => {
    setFieldTouched((prev: any) => ({ ...prev, [fieldName]: true }));
  };

  const handleCardNumberChange = (e: any) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData({ ...formData, cardNumber: formatted });

    // Real-time validation feedback
    if (formatted.length >= 19) {
      // Full card number length
      const validation = validateCreditCard({
        ...formData,
        cardNumber: formatted,
      });
      if (validation.isValid) {
        toast.success(`${validation.cardType.toUpperCase()} card detected`, {
          duration: 2000,
        });
      }
    }
  };

  const handleExpirationDateChange = (e: any) => {
    const formatted = formatExpirationDate(e.target.value);
    setFormData({ ...formData, expirationDate: formatted });
  };

  const handleCVVChange = (e: any) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 4);
    setFormData({ ...formData, cvv: value });
  };

  // Enhanced address selection with feedback
  const handleAddressSelect = (addr: any) => {
    console.log("Selected Address:", addr);
    setAddress(addr);

    if (addr.fullAddress || addr.address) {
      toast.success("Address selected", {
        description: addr.fullAddress || `${addr.address}, ${addr.city}`,
        duration: 2000,
      });
    }
  };

  const handleDeliveryAddressSelect = (addr: any) => {
    console.log("Selected Delivery Address:", addr);
    setDeliveryAddress(addr);

    if (addr.fullAddress || addr.address) {
      toast.success("Delivery address selected", {
        description: addr.fullAddress || `${addr.address}, ${addr.city}`,
        duration: 2000,
      });
    }
  };

  
  // const handleCheckout = async () => {
  //   const finalDeliveryAddress = sameAsBillingAddress
  //     ? address
  //     : deliveryAddress;

  //   // Comprehensive validation
  //   const validation = validateCheckoutForm(
  //     formData,
  //     address,
  //     finalDeliveryAddress,
  //     sameAsBillingAddress
  //   );

  //   if (!validation.isValid) {
  //     console.log("Validation failed:", validation.errors);
  //     setFlowErrors(validation.errors);

  //     // Mark all fields as touched to show validation errors
  //     setFieldTouched({
  //       firstName: true,
  //       lastName: true,
  //       phone: true,
  //       address: true,
  //       cardNumber: true,
  //       expirationDate: true,
  //       cvv: true,
  //       cardHolder: true,
  //     });

  //     // Show error toast with specific validation issues
  //     const errorMessages = [];

  //     if (validation.errors.firstName)
  //       errorMessages.push("First name is invalid");
  //     if (validation.errors.lastName)
  //       errorMessages.push("Last name is invalid");
  //     if (validation.errors.phone)
  //       errorMessages.push("Phone number is invalid");
  //     if (validation.errors.address)
  //       errorMessages.push("Billing address is incomplete");
  //     if (validation.errors.deliveryAddress)
  //       errorMessages.push("Delivery address is incomplete");
  //     if (validation.errors.payment) {
  //       if (validation.errors.payment.cardNumber)
  //         errorMessages.push("Card number is invalid");
  //       if (validation.errors.payment.expirationDate)
  //         errorMessages.push("Expiration date is invalid");
  //       if (validation.errors.payment.cvv) errorMessages.push("CVV is invalid");
  //       if (validation.errors.payment.cardHolder)
  //         errorMessages.push("Cardholder name is invalid");
  //     }

  //     toast.error("Please correct the following errors:", {
  //       description: errorMessages.join(", "),
  //       duration: 5000,
  //       action: {
  //         label: "Review Form",
  //         onClick: () => {
  //           // Scroll to first error field
  //           const firstErrorElement: any =
  //             document.querySelector(".border-red-500");
  //           if (firstErrorElement) {
  //             firstErrorElement.scrollIntoView({
  //               behavior: "smooth",
  //               block: "center",
  //             });
  //             firstErrorElement.focus();
  //           }
  //         },
  //       },
  //     });

  //     return;
  //   }

  //   // Clear any previous errors
  //   setFlowErrors({});

  //   // Show success toast for validation passed
  //   toast.success("Processing your order", {
  //     description: "Please wait...",
  //     duration: 2000,
  //   });

  //   // Proceed with checkout
  //   setLoading(true, "Processing your order...");
  //   // console.log("Processing checkout...");
  //   console.log("Billing Address:", address);
  //   console.log("Delivery Address:", finalDeliveryAddress);
  //   console.log("Payment Details:", formData);

  //   // // Simulate API call
  //   // setTimeout(() => {
  //   //   setLoading(false);

  //   //   // Simulate success/error responses
  //   //   const isSuccess = Math.random() > 0.3; // 70% success rate for demo

  //   //   if (isSuccess) {
  //   //     toast.success("Order placed successfully!", {
  //   //       description: "You will receive a confirmation email shortly.",
  //   //       duration: 4000,
  //   //       action: {
  //   //         label: "View Order",
  //   //         onClick: () => router.push("/orders"),
  //   //       },
  //   //     });
  //   //   } else {
  //   //     toast.error("Payment failed", {
  //   //       description: "Please check your payment details and try again.",
  //   //       duration: 4000,
  //   //       action: {
  //   //         label: "Retry",
  //   //         onClick: () => handleCheckout(),
  //   //       },
  //   //     });
  //   //   }
  //   // }, 5000);

  //   try {
  //     const orderData = {
  //       items: cart,
  //       billingAddress: address,
  //       deliveryAddress: finalDeliveryAddress,
  //       paymentDetails: {
  //         cardHolder: formData.cardHolder,
  //         cardNumber: formData.cardNumber,
  //         cvv: formData.cvv,
  //         expirationDate: formData.expirationDate,
  //         firstName: formData.firstName,
  //         lastName: formData.lastName,
  //         phone: formData.phone,
  //       },
  //       subtotal: total,
  //       total: finalTotal,
  //     };

  //     const response = await fetch("/api/checkout/process-order", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(orderData),
  //     });

  //     const result = await response.json();

  //     console.log("Full API response:", result); // Add this line

  //     if (!response.ok) {
  //       throw new Error(result.error || "Failed to process order");
  //     }

  //     console.log("Order object:", result.order); // Add this line
  //     console.log("Order number:", result.order?.orderNumber);

  //     clearCart();

  //     router.push(
  //       `/orders?orderNumber=${result.order.orderNumber}`
  //     );
  //   } catch (error) {
  //     console.error("Checkout error:", error);

  //     const errorMessage =
  //       error instanceof Error ? error.message : "Failed to process order";
  //     // setOrderError(error instanceof Error ? error.message : 'Failed to process order');

  //     setErrors("checkout", true, errorMessage);
  //   } finally {
  //     // setIsProcessingOrder(false);
  //     setLoading(false);
  //   }
  // };
  
  const handleCheckout = async () => {
    const finalDeliveryAddress = sameAsBillingAddress
      ? address
      : deliveryAddress;

    // Comprehensive validation
    const validation = validateCheckoutForm(
      formData,
      address,
      finalDeliveryAddress,
      sameAsBillingAddress
    );

    if (!validation.isValid) {
      console.log("Validation failed:", validation.errors);
      setFlowErrors(validation.errors);

      // Mark all fields as touched to show validation errors
      setFieldTouched({
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        cardNumber: true,
        expirationDate: true,
        cvv: true,
        cardHolder: true,
      });

      // Show error toast with specific validation issues
      const errorMessages = [];

      if (validation.errors.firstName)
        errorMessages.push("First name is invalid");
      if (validation.errors.lastName)
        errorMessages.push("Last name is invalid");
      if (validation.errors.phone)
        errorMessages.push("Phone number is invalid");
      if (validation.errors.address)
        errorMessages.push("Billing address is incomplete");
      if (validation.errors.deliveryAddress)
        errorMessages.push("Delivery address is incomplete");
      if (validation.errors.payment) {
        if (validation.errors.payment.cardNumber)
          errorMessages.push("Card number is invalid");
        if (validation.errors.payment.expirationDate)
          errorMessages.push("Expiration date is invalid");
        if (validation.errors.payment.cvv) errorMessages.push("CVV is invalid");
        if (validation.errors.payment.cardHolder)
          errorMessages.push("Cardholder name is invalid");
      }

      toast.error("Please correct the following errors:", {
        description: errorMessages.join(", "),
        duration: 5000,
        action: {
          label: "Review Form",
          onClick: () => {
            // Scroll to first error field
            const firstErrorElement: any =
              document.querySelector(".border-red-500");
            if (firstErrorElement) {
              firstErrorElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              firstErrorElement.focus();
            }
          },
        },
      });

      return;
    }

    // Clear any previous errors
    setFlowErrors({});

    // Show success toast for validation passed
    toast.success("Processing your order", {
      description: "Please wait...",
      duration: 2000,
    });

    // Proceed with checkout
    setLoading(true, "Processing your order...");

    // Set flag to indicate order is being processed
    sessionStorage.setItem("orderProcessing", "true");

    console.log("Billing Address:", address);
    console.log("Delivery Address:", finalDeliveryAddress);
    console.log("Payment Details:", formData);

    try {
      const orderData = {
        items: cart,
        billingAddress: address,
        deliveryAddress: finalDeliveryAddress,
        paymentDetails: {
          cardHolder: formData.cardHolder,
          cardNumber: formData.cardNumber,
          cvv: formData.cvv,
          expirationDate: formData.expirationDate,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        },
        subtotal: total,
        total: finalTotal,
      };

      const response = await fetch("/api/checkout/process-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      console.log("Full API response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to process order");
      }

      console.log("Order object:", result.order);
      console.log("Order number:", result.order?.orderNumber);

      // Clear the cart
      clearCart();

      // Clear checkout session
      sessionStorage.removeItem("canAccessCheckout");
      sessionStorage.removeItem("checkoutAllowedTime");

      // Navigate to order confirmation
      const orderNumber = result.order?.orderNumber;
      if (orderNumber) {
        router.push(`/orders/${orderNumber}`);
      } else {
        console.error("No order number received");
        router.push("/orders");
      }
    } catch (error) {
      console.error("Checkout error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to process order";

      setErrors("checkout", true, errorMessage);

      // Clear order processing flag on error
      sessionStorage.removeItem("orderProcessing");
    } finally {
      setLoading(false);
    }
  };
  const ErrorMessage = ({ error }: { error: any }) => {
    if (!error) return null;
    return <span className="text-red-500 text-xs mt-1">{error}</span>;
  };

  // Enhanced input component with validation
  const ValidatedInput = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    type = "text",
    required = false,
    error,
    touched,
    placeholder = "",
    className = "",
  }: any) => (
    <div className="flex flex-col gap-2">
      <label>
        {label} {required && "*"}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full border rounded-[4px] px-4 py-2 focus:outline-none ${
          error && touched ? "border-red-500" : "border-gray-400"
        } ${className}`}
      />
      {error && touched && <ErrorMessage error={error} />}
    </div>
  );

  // Form validation helpers
  // const isBillingAddressComplete = () => {
  //   return (
  //     formData.firstName.trim() &&
  //     formData.lastName.trim() &&
  //     formData.phone.trim() &&
  //     (address.fullAddress || address.address) &&
  //     address.city &&
  //     address.state &&
  //     address.zip &&
  //     address.country
  //   );
  // };

  // const isPaymentDetailsComplete = () => {
  //   return (
  //     formData.cardNumber.trim() &&
  //     formData.expirationDate.trim() &&
  //     formData.cvv.trim() &&
  //     formData.cardHolder.trim()
  //   );
  // };

  // const isDeliveryAddressComplete = () => {
  //   if (sameAsBillingAddress) {
  //     return isBillingAddressComplete();
  //   }

  //   if (selectedDeliveryAddress && selectedDeliveryAddress !== "new") {
  //     return true;
  //   }

  //   if (showNewAddressForm || selectedDeliveryAddress === "new") {
  //     return (
  //       (deliveryAddress.fullAddress || deliveryAddress.address) &&
  //       deliveryAddress.city &&
  //       deliveryAddress.state &&
  //       deliveryAddress.zip &&
  //       deliveryAddress.country
  //     );
  //   }

  //   return false;
  // };

  const isFormComplete = () => {
    return (
      isBillingAddressComplete() &&
      isPaymentDetailsComplete() &&
      isDeliveryAddressComplete()
    );
  };

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

  const handleValidateAndSubmit = () => {
    const finalDeliveryAddress = sameAsBillingAddress
      ? address
      : deliveryAddress;

    const validation = validateCheckoutForm(
      formData,
      address,
      finalDeliveryAddress,
      sameAsBillingAddress
    );

    if (!validation.isValid) {
      console.log("Validation errors:", validation.errors);
      // Display errors to user
      return;
    }

    // Proceed with checkout
    handleCheckout();
  };

  // const handleCheckout = () => {
  //   if (!isFormComplete()) {
  //     // showError("Please complete all required fields");
  //     return;
  //   }

  //   const finalDeliveryAddress = sameAsBillingAddress
  //     ? address
  //     : deliveryAddress;

  //   // setLoading(true);
  //   setLoading(true, "");
  //   console.log("Processing checkout...");
  //   console.log("Billing Address:", address);
  //   console.log("Delivery Address:", finalDeliveryAddress);
  //   console.log("Payment Details:", formData);

  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 5000);
  // };

  const handlePayPalCheckout = () => {
    console.log("Processing PayPal checkout...");
  };

  const handleNext = () => {
    if (stage < 3) setStage(stage + 1);
  };

  const handleBack = () => {
    if (stage > 1) setStage(stage - 1);
  };

  const handleSameAddressToggle = () => {
    setSameAsBillingAddress((prev) => !prev);
    if (!sameAsBillingAddress) {
      // If switching to same as billing, clear delivery address selections
      setSelectedDeliveryAddress("");
      setShowNewAddressForm(false);
      setDeliveryAddress({});
    }
  };

  const handleDeliveryAddressChange = (value: string) => {
    // console.log("vvvvv", value);
    setSelectedDeliveryAddress(value);
    if (value === "new") {
      setShowNewAddressForm(true);
      setDeliveryAddress({});
    } else if (value && value !== "new") {
      setShowNewAddressForm(false);
      // Find selected address and set it as delivery address
      const selectedAddr = savedAddresses.find(
        (addr: any) => addr._id === value
      );
      if (selectedAddr) {
        setDeliveryAddress({
          fullAddress: selectedAddr.fullAddress,
          city: selectedAddr.city,
          state: selectedAddr.state,
          zip: selectedAddr.zip,
          country: selectedAddr.country,
        });
      }
    } else {
      setShowNewAddressForm(false);
      setDeliveryAddress({});
    }
  };

  const getDeliveryAddressDisplay = () => {
    if (sameAsBillingAddress) {
      return (
        <div className="flex font-[300] text-sm flex-col">
          <span>Same as billing address</span>
          <span className="text-gray-500">
            {address.fullAddress ||
              `${address.address ?? ""}, ${address.city ?? ""}, ${
                address.state ?? ""
              } ${address.zip ?? ""}, ${address.country ?? ""}`
                .replace(/(, )+/g, ", ")
                .replace(/^,|,$/g, "")
                .trim()}
          </span>
        </div>
      );
    }

    if (selectedDeliveryAddress && selectedDeliveryAddress !== "new") {
      const selectedAddr = savedAddresses.find(
        (addr) => addr.id === selectedDeliveryAddress
      );
      return (
        <div className="flex font-[300] text-sm flex-col">
          <span>{selectedAddr?.fullAddress}</span>
        </div>
      );
    }

    if (deliveryAddress.fullAddress || deliveryAddress.address) {
      return (
        <div className="flex font-[300] text-sm flex-col">
          <span>
            {deliveryAddress.fullAddress ||
              `${deliveryAddress.address ?? ""}, ${
                deliveryAddress.city ?? ""
              }, ${deliveryAddress.state ?? ""} ${deliveryAddress.zip ?? ""}, ${
                deliveryAddress.country ?? ""
              }`
                .replace(/(, )+/g, ", ")
                .replace(/^,|,$/g, "")
                .trim()}
          </span>
        </div>
      );
    }

    return (
      <div className="flex font-[300] text-sm flex-col">
        <span className="text-red-500">Please select a delivery address</span>
      </div>
    );
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
                    name="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    onBlur={() => handleFieldBlur("firstName")}
                    className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none "
                  />
                  {flowErrors.firstName && fieldTouched.firstName && (
                    <ErrorMessage error={flowErrors.firstName} />
                  )}
                </div>
                <div className="flex flex-col gap-2 w-[50%]">
                  <label>Last name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    onBlur={() => handleFieldBlur("lastName")}
                    className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none "
                  />
                  {flowErrors.lastName && fieldTouched.lastName && (
                    <ErrorMessage error={flowErrors.lastName} />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <label>Phone *</label>
                <input
                  type="text"
                  value={formData.phone}
                  // onChange={(e) =>
                  //   setFormData({ ...formData, phone: e.target.value })
                  // }
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  onBlur={() => handleFieldBlur("phone")}
                  name="phone"
                  className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none "
                />
                {flowErrors.phone && fieldTouched.phone && (
                  <ErrorMessage error={flowErrors.phone} />
                )}
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
                  value={address.city || ""}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  onBlur={() => handleFieldBlur("address")}
                  className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none "
                />
                {flowErrors.address?.city && fieldTouched.address?.city && (
                  <ErrorMessage error={flowErrors.address?.city} />
                )}
              </div>
              <div className="flex justify-between items-center gap-[2rem]">
                <div className="flex flex-col gap-2 w-[50%]">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={address.state || ""}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                    onBlur={() => handleFieldBlur("address")}
                    className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none "
                  />
                  {flowErrors.address?.state && fieldTouched.address?.state && (
                    <ErrorMessage error={flowErrors.address?.state} />
                  )}
                </div>
                <div className="flex flex-col gap-2 w-[50%]">
                  <label>Zip / Postal code *</label>
                  <input
                    type="text"
                    name="zip"
                    value={address.zip || ""}
                    onChange={(e) =>
                      setAddress({ ...address, zip: e.target.value })
                    }
                    onBlur={() => handleFieldBlur("zip")}
                    className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none "
                  />
                  {flowErrors.address?.zip && fieldTouched.address?.zip && (
                    <ErrorMessage error={flowErrors.address?.zip} />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <label>Country/Region *</label>
                <input
                  type="text"
                  name="country"
                  value={address.country || ""}
                  onChange={(e) =>
                    setAddress({ ...address, country: e.target.value })
                  }
                  onBlur={() => handleFieldBlur("country")}
                  className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none "
                />
                {flowErrors.address?.country &&
                  fieldTouched.address?.country && (
                    <ErrorMessage error={flowErrors.address?.country} />
                  )}
              </div>
              <div className="flex  gap-[2rem] w-full justify-between">
                <button
                  onClick={() => router.push("/checkout")}
                  className="px-4 py-4 w-[50%] rounded hover:bg-gray-300 border border-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNext}
                  disabled={!isBillingAddressComplete()}
                  className={`px-4 py-2 w-[50%] rounded text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isBillingAddressComplete() ? "bg-black" : "bg-gray-400"
                  }`}
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </>
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
                    onBlur={() => handleFieldBlur("cardNumber")}
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  {flowErrors.payment?.cardNumber &&
                    fieldTouched.cardNumber && (
                      <ErrorMessage error={flowErrors.payment?.cardNumber} />
                    )}
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
                    onBlur={() => handleFieldBlur("expirationDate")}
                    placeholder="MM / YY"
                    className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  {flowErrors.payment?.expirationDate &&
                    fieldTouched.expirationDate && (
                      <ErrorMessage
                        error={flowErrors.payment?.expirationDate}
                      />
                    )}
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
                    onBlur={() => handleFieldBlur("cvv")}
                    placeholder="000"
                    className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  {flowErrors.payment?.cvv && fieldTouched.cvv && (
                    <ErrorMessage error={flowErrors.payment?.cvv} />
                  )}
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
                    onBlur={() => handleFieldBlur("cardHolder")}
                    placeholder="Full Name"
                    className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  {flowErrors.payment?.cardHolder &&
                    fieldTouched.cardHolder && (
                      <ErrorMessage error={flowErrors.payment?.cardHolder} />
                    )}
                </div>
              </div>
            </div>
            <div className="flex  gap-[2rem] w-full justify-between">
              <button
                onClick={handleNext}
                disabled={!isPaymentDetailsComplete()}
                className={`px-4 py-2 w-full rounded text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isPaymentDetailsComplete() ? "bg-black" : "bg-gray-400"
                }`}
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
              <span>•••• •••• •••• {formData.cardNumber.slice(-4)}</span>
              <span>{formData.expirationDate} •••</span>
              <span>{formData.cardHolder}</span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const renderDeliveryAddressContent = () => {
    switch (stage) {
      case 3:
        return (
          <>
            <div className="flex items-center gap-[1rem] mb-4">
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
              <div className="mb-4">
                <div className="flex flex-col gap-2">
                  <label>Choose a delivery address *</label>
                  <select
                    value={selectedDeliveryAddress}
                    onChange={(e) =>
                      handleDeliveryAddressChange(e.target.value)
                    }
                    className="w-full border border-gray-400 rounded-[4px] px-4 py-2 focus:outline-none"
                  >
                    <option value="">Select an address</option>
                    {savedAddresses.map((addr: any) => (
                      <option key={addr._id} value={addr._id}>
                        {addr.label} — {addr.address}, {addr.city}, {addr.state}{" "}
                        {addr.zip} {addr.isDefault ? " (Default)" : ""}
                      </option>
                    ))}

                    <option value="new">+ Add New Address</option>
                  </select>
                </div>

                {showNewAddressForm && (
                  <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <h4 className="text-sm font-medium mb-3">
                      New Delivery Address
                    </h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm">Address *</label>
                        <AddressInput
                          accessToken={MAPBOX_TOKEN}
                          onSelect={(addr) => {
                            console.log("Selected Delivery Address:", addr);
                            setDeliveryAddress(addr);
                          }}
                          placeholder="Enter delivery address"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={deliveryAddress.city || ""}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              city: e.target.value,
                            })
                          }
                          onBlur={() => handleFieldBlur("address")}
                          className="w-full border border-gray-400 rounded-[4px] px-3 py-2 focus:outline-none text-sm"
                        />
                        {flowErrors.deliveryAddress?.city &&
                          fieldTouched.deliveryAddress?.city && (
                            <ErrorMessage
                              error={flowErrors.deliveryAddress?.city}
                            />
                          )}
                      </div>
                      <div className="flex gap-2">
                        <div className="flex flex-col gap-2 flex-1">
                          <label className="text-sm">State *</label>
                          <input
                            type="text"
                            name="state"
                            value={deliveryAddress.state || ""}
                            onChange={(e) =>
                              setDeliveryAddress({
                                ...deliveryAddress,
                                state: e.target.value,
                              })
                            }
                            onBlur={() => handleFieldBlur("address")}
                            className="w-full border border-gray-400 rounded-[4px] px-3 py-2 focus:outline-none text-sm"
                          />
                          {flowErrors.deliveryAddress?.state &&
                            fieldTouched.deliveryAddress?.state && (
                              <ErrorMessage
                                error={flowErrors.deliveryAddress?.state}
                              />
                            )}
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                          <label className="text-sm">Zip *</label>
                          <input
                            type="text"
                            name="zip"
                            value={deliveryAddress.zip || ""}
                            onChange={(e) =>
                              setDeliveryAddress({
                                ...deliveryAddress,
                                zip: e.target.value,
                              })
                            }
                            onBlur={() => handleFieldBlur("zip")}
                            className="w-full border border-gray-400 rounded-[4px] px-3 py-2 focus:outline-none text-sm"
                          />
                          {flowErrors.deliveryAddress?.zip &&
                            fieldTouched.deliveryAddress?.zip && (
                              <ErrorMessage
                                error={flowErrors.deliveryAddress?.zip}
                              />
                            )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm">Country *</label>
                        <input
                          type="text"
                          name="country"
                          value={deliveryAddress.country || ""}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              country: e.target.value,
                            })
                          }
                          onBlur={() => handleFieldBlur("country")}
                          className="w-full border border-gray-400 rounded-[4px] px-3 py-2 focus:outline-none text-sm"
                        />
                        {flowErrors.deliveryAddress?.country &&
                          fieldTouched.deliveryAddress?.country && (
                            <ErrorMessage
                              error={flowErrors.deliveryAddress?.country}
                            />
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {getDeliveryAddressDisplay()}

            <div className="flex flex-col gap-1 border-t border-gray-400 pt-[1rem]">
              <span className="text-lg">Review & Place order</span>
              <span className="text-sm font-light">
                Review your details above and continue when you're ready.
              </span>
            </div>

            <div className="flex  gap-[2rem] w-full justify-between mt-6">
              <button
                onClick={handleCheckout}
                disabled={!isFormComplete()}
                className={`px-4 py-2 w-full rounded text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFormComplete() ? "bg-black" : "bg-gray-400"
                }`}
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
    <>
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
                        <span className="text-[12px]">
                          Qty: {item.quantity}
                        </span>
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
                  <span className="text-xl font-medium text-gray-800">
                    Total
                  </span>
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
    </>
  );
}
