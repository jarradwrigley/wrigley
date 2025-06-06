"use client";


import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "../../../../store/store";
import { formatUSD } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { SizeSelectionModal } from "../SizeSelectionModal";

function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchProducts = async (attempt = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch products: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setProducts(data);
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      console.error("Error fetching products:", error);

      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setError(
          "Unable to connect to the server. Please check your internet connection."
        );
      } else if (error.message.includes("500")) {
        setError(
          "Server error. Our team has been notified. Please try again later."
        );
      } else if (error.message.includes("404")) {
        setError("Products service not found. Please contact support.");
      } else {
        setError("Failed to load products. Please try again.");
      }

      // Automatic retry logic (up to 3 attempts)
      if (attempt < 3) {
        setTimeout(() => {
          fetchProducts(attempt + 1);
        }, 1000 * attempt); // Exponential backoff: 1s, 2s, 3s
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const retry = () => {
    setRetryCount((prev) => prev + 1);
    fetchProducts();
  };

  return { products, loading, error, retry, retryCount };
}


export default function DesktopShopPage() {
  const { products, loading, error } = useProducts();
  const {
    addItem,
    removeItem,
    updateQuantity,
    cart,
    openSizeModal,
    closeSizeModal,
    addItemWithSize,
    sizeModalProduct,
    isSizeModalOpen,
  } = useStore();

  // useEffect(() => {
  //   console.log("ccc", cart);
  // }, [cart]);

  useEffect(() => {
    // When user adds items to cart from shop, allow checkout access
    if (cart && cart.length > 0) {
      sessionStorage.setItem("canAccessCheckout", "true");
      sessionStorage.setItem("checkoutAllowedTime", Date.now().toString());
    }
  }, [cart]);
  

  const handleQuantityChange = (key: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(key);
    } else {
      updateQuantity(key, newQuantity);
    }
  };

  const handleAddToCart = (product: any) => {
    if (product.requiresSize) {
      openSizeModal(product);
    } else {
      // For products that don't require size, add with default size
      addItem(product, "default", 1);
    }
  };

  const handleAddToCartFromModal = (
    product: any,
    size: string,
    quantity: number
  ) => {
    addItemWithSize(product, size, quantity);
  };

  if (loading) {
    return (
      <div className="px-[7rem] mt-[2rem]">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16 justify-items-center">
          {/* Skeleton loading cards */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 w-[201px] h-full animate-pulse"
            >
              <div className="bg-gray-700 w-[201px] h-[201px] rounded"></div>
              <div className="flex flex-col gap-2">
                <div className="bg-gray-700 h-4 w-3/4 rounded"></div>
                <div className="bg-gray-700 h-3 w-1/2 rounded"></div>
              </div>
              <div className="bg-gray-700 h-10 w-full rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-[7rem] mt-[2rem]">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md">
            <div className="text-red-400 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Oops! Something went wrong
            </h3>
            {/* <p className="text-gray-400 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={retry}
                className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-gray-800 transition-colors"
              >
                Refresh Page
              </button>
            </div> */}
          </div>
        </div>
      </div>
    );
  }

  // Empty state (when API succeeds but returns no products)
  if (products.length === 0) {
    return (
      <div className="px-[7rem] mt-[2rem]">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Products Available
          </h3>
          <p className="text-gray-400 mb-4">
            We're currently updating our inventory. Please check back soon!
          </p>
          {/* <button
            onClick={retry}
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button> */}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-[7rem]">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16 justify-items-center mt-[2rem]">
          {/* {products.map((item: any, index: any) => {
            const isInCart = cart.some((cartItem) => cartItem.key === item.key);

            let itemInCart: any

            if (isInCart) {
              itemInCart = cart.find(
                (cartItem) => cartItem.key === item.key
              );
             }

            return (
              <div
                key={index}
                className="flex flex-col gap-3 w-[201px] h-full justify-between"
              >
                <div className="relative">
                  {item.promo && (
                    <div className="flex items-center justify-center absolute px-2 py-0.5 top-0 left-0 bg-white">
                      <span className="text-gray-600 text-[12px]">
                        {item.promo}
                      </span>
                    </div>
                  )}
                  <Image
                    src={item.image}
                    alt={item.title || "Product"}
                    width={201}
                    height={201}
                  />
                </div>

                <div className="flex flex-col">
                  <span>{item.title}</span>
                  <span className="font-[300] text-gray-400">
                    {formatUSD(item.amount)}
                  </span>
                </div>

                {isInCart ? (
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center border border-neutral-600 rounded">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            itemInCart.key,
                            itemInCart.quantity - 1
                          )
                        }
                        className="p-2 hover:bg-neutral-800 transition-colors text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-4 py-2 text-white text-sm font-medium min-w-[2rem] text-center">
                        {itemInCart.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            itemInCart.key,
                            itemInCart.quantity + 1
                          )
                        }
                        className="p-2 hover:bg-neutral-800 transition-colors text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => addItem(item)} // This now works with your store
                    className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-sm hover:bg-gray-800 hover:text-white cursor-pointer transition-colors"
                  >
                    <span>Add to Cart</span>
                  </button>
                )}
              </div>
            );
          })} */}
          {/* {products.map((item: any, index: any) => {
            const itemKey = `${item.key}-${item.size}`;
            const itemInCart = cart.find(
              (cartItem) => cartItem.key === itemKey
            );
            const isInCart = Boolean(itemInCart);

            return (
              <div
                key={index}
                className="flex flex-col gap-3 w-[201px] h-full justify-between"
              >
                <div className="relative">
                  {item.promo && (
                    <div className="flex items-center justify-center absolute px-2 py-0.5 top-0 left-0 bg-white">
                      <span className="text-gray-600 text-[12px]">
                        {item.promo}
                      </span>
                    </div>
                  )}
                  <Image
                    src={item.image}
                    alt={item.title || "Product"}
                    width={201}
                    height={201}
                  />
                </div>

                <div className="flex flex-col">
                  <span>{item.title}</span>
                  <span className="font-[300] text-gray-400">
                    {formatUSD(item.amount)}
                  </span>
                </div>

                {isInCart ? (
                  <div className="flex items-center gap-3 ">
                    <div className="flex justify-between items-center px-1 border w-full border-neutral-600 rounded">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            itemInCart.key,
                            itemInCart.quantity - 1
                          )
                        }
                        className="p-2 flex rounded-[4px] items-center justify-center w-[30%] hover:bg-neutral-800 transition-colors text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-4 py-2 text-white text-sm font-medium min-w-[2rem] text-center">
                        {itemInCart.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            itemInCart.key,
                            itemInCart.quantity + 1
                          )
                        }
                        className="p-2 w-[30%] rounded-[4px] flex items-center justify-center hover:bg-neutral-800 transition-colors text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : item.key === "lgwj1" ? (
                  <button className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-sm hover:bg-gray-800 hover:text-white cursor-pointer transition-colors">
                    <span>Pre-Order</span>
                  </button>
                ) : (
                  <button
                    onClick={() => addItem(item)}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-sm hover:bg-gray-800 hover:text-white cursor-pointer transition-colors"
                  >
                    <span>Add to Cart</span>
                  </button>
                )}
              </div>
            );
          })} */}

          {products.map((product: any, index: number) => {
            // For products with sizes, we need to check all possible size combinations
            const productInCart = cart.filter((item) =>
              item.key.startsWith(`${product.key}-`)
            );

            // For display purposes, we'll show quantity controls only if there's exactly one variant in cart
            // and the product doesn't require size selection (or has a default size)
            const defaultItemKey = `${product.key}-default`;
            const defaultItemInCart = cart.find(
              (cartItem) => cartItem.key === defaultItemKey
            );

            const shouldShowQuantityControls =
              !product.requiresSize && defaultItemInCart;
            const isInCart = productInCart.length > 0;

            return (
              <div
                key={index}
                className="flex flex-col gap-3 w-[201px] h-full justify-between  "
              >
                <div className="relative">
                  <div className="flex items-center justify-center absolute px-2 py-0.5 top-0 left-0 bg-white">
                    <span className="text-gray-600 text-[12px]">
                      {product.promo}
                    </span>
                  </div>
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={201}
                    height={201}
                  />
                </div>

                <div className="flex flex-col">
                  <span>{product.title}</span>
                  <span className="font-[300] text-gray-400">
                    {formatUSD(product.amount)}
                  </span>
                  {/* {product.requiresSize && (
                              <span className="text-xs text-gray-500 mt-1">
                                Multiple sizes available
                              </span>
                            )} */}
                </div>

                {shouldShowQuantityControls ? (
                  <div className="flex items-center gap-3 ">
                    <div className="flex justify-between items-center px-1 border w-full border-neutral-600 rounded">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            defaultItemInCart.key,
                            defaultItemInCart.quantity - 1
                          )
                        }
                        className="p-2 flex rounded-[4px] items-center justify-center w-[30%] hover:bg-neutral-800 transition-colors text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-4 py-2 text-white text-sm font-medium min-w-[2rem] text-center">
                        {defaultItemInCart.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            defaultItemInCart.key,
                            defaultItemInCart.quantity + 1
                          )
                        }
                        className="p-2 w-[30%] rounded-[4px] flex items-center justify-center hover:bg-neutral-800 transition-colors text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // : product.key === "lgwj1" ? (
                  //   <button className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-sm hover:bg-gray-800 hover:text-white cursor-pointer transition-colors">
                  //     <span>Pre-Order</span>
                  //   </button>
                  // )
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-sm hover:bg-gray-800 hover:text-white cursor-pointer transition-colors"
                  >
                    <span>
                      {product.requiresSize ? "Pre-Order" : "Add to Cart"}
                      {/* {isInCart && product.requiresSize && (
                                  <span className="ml-1 text-xs">
                                    ({productInCart.length} variant
                                    {productInCart.length > 1 ? "s" : ""})
                                  </span>
                                )} */}
                    </span>
                  </button>
                )}
              </div>
            );
          })}

          <div className="flex flex-col gap-3 w-[201px] h-full justify-between">
            <a className="cursor-pointer">
              <div className="relative">
                <video
                  src="/images/product4.mp4"
                  width={201}
                  height={201}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto object-cover"
                />
              </div>
            </a>
          </div>
        </div>
      </div>

      <SizeSelectionModal
        product={sizeModalProduct}
        isOpen={isSizeModalOpen}
        onClose={closeSizeModal}
        onAddToCart={handleAddToCartFromModal}
      />
    </>
  );
}
