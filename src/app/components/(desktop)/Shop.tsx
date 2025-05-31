"use client";

import clientPromise from "@/app/lib/mongodb";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "../../../../store/store";
import { formatUSD } from "@/app/lib/utils";
import { Minus, Plus } from "lucide-react";
import { SizeSelectionModal } from "../SizeSelectionModal";

// Move the data fetching to a client-side hook since we're now using "use client"
function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products"); // You'll need to create this API route
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading };
}

export default function DesktopShopPage() {
  const { products, loading } = useProducts();
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
    return <div className="px-[7rem] mt-[2rem]">Loading products...</div>;
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
