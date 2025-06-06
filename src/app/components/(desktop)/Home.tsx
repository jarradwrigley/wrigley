"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "../../../../store/store";
import { Minus, Plus } from "lucide-react";
import { formatUSD } from "@/lib/utils";
import { SizeSelectionModal } from "../SizeSelectionModal";
import Loader from "../Loader";

interface Product {
  _id: string;
  key: string;
  title: string;
  amount: number;
  image: string;
  images?: string[];
  sizes?: string[];
  requiresSize: boolean;
  promo?: string;
  type?: string;
  featured: boolean;
}

// Move the data fetching to a client-side hook since we're now using "use client"
function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        const featuredProducts = data.filter(
          (product: Product) => product.featured
        );
        setProducts(featuredProducts);
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

export default function DesktopHomePage() {
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

  const handleQuantityChange = (key: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(key);
    } else {
      updateQuantity(key, newQuantity);
    }
  };

  const handleAddToCart = (product: Product) => {
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
    // return <div className="px-[7rem] mt-[2rem]">Loading products...</div>;
    <Loader />
  }

  return (
    <>
      <div
        style={{
          background: "var(--bg-gradient)",
        }}
        className="w-full px-[5rem] py-[2rem] "
      >
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: "Anton, sans-serif",
              fontSize: "2.5rem",
            }}
          >
            FEATURED MERCH
          </span>

          <a
            href="/shop"
            className="border border-white flex hover:bg-gray-500 items-center justify-center px-[2rem] py-[0.5rem] rounded-[5px] bg-[rgba(47, 46, 46, 0.69)]  "
          >
            <span className="font-[300] text-[14px]">Shop All</span>
          </a>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16 justify-items-center mt-[2rem] ">
          {products.map((product: Product, index: number) => {
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

          {/* Video product section - keeping as is */}
          <div className="flex flex-col gap-3 w-[201px] h-full justify-between ">
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

      {/* Size Selection Modal */}
      <SizeSelectionModal
        product={sizeModalProduct}
        isOpen={isSizeModalOpen}
        onClose={closeSizeModal}
        onAddToCart={handleAddToCartFromModal}
      />

      {/* Rest of your existing JSX remains the same */}
      <div
        className="h-full flex flex-col w-full px-2 py-6"
        style={{ backgroundImage: "url('/images/guitar.avif')" }}
      >
        <div className="w-full mb-4 flex items-center justify-center">
          <Image
            src="/images/logo_red.avif"
            alt="logo"
            width={150}
            height={150}
          />
        </div>

        <img src="/images/divide.avif" alt="logo" className="w-full h-auto" />

        <div className="w-full flex items-center justify-center my-[3rem]">
          <span
            className="text-3xl font-[600]"
            style={{
              textShadow: "var(--shadowy)",
            }}
          >
            BRAND NEW MUSIC ON THE WAY!
          </span>
        </div>

        <div className="w-full flex items-center px-[10rem] ">
          <div className="w-full  h-full flex gap-[5rem] items-start">
            <Image
              src="/images/coming.avif"
              alt="coming"
              width={450}
              height={500}
            />

            <div className="h-[640px] flex flex-col gap-[5rem] justify-between">
              <div className="flex flex-col gap-[2rem]">
                <span className="text-4xl font-[800]">
                  It's been a while - but HE'S BACK!
                </span>

                <span className="text-2xl font-[200] leading-[3rem] ">
                  The new EP from Jarrad Wrigley is finally on the way. With fan
                  favorites, and brand new heartfelt stories, the Jarrad Wrigley
                  EP is set to resonate with country music lovers everywhere -
                  wherever they hail from.
                </span>
              </div>

              <span
                style={{
                  textShadow: "var(--shadowy)",
                  fontStyle: "italic",
                }}
                className="text-white/90 text-xl font-[200] leading-[1.5rem] "
              >
                Sneak peaks, album artwork and more to come...
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="h-full flex flex-col w-full px-2 py-[3rem]"
        style={{
          backgroundImage: "url('/images/graybg.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "grayscale(1)",
        }}
      >
        <img
          src="/images/divide.avif"
          alt="logo"
          className="w-full h-auto mb-[3rem]"
        />

        <span
          style={{
            textShadow: "var(--shadowy)",
            fontSize: "1.2rem",
            color: "white",
            textAlign: "center",
          }}
          className="px-[25rem]"
        >
          Join the WREBELLION to keep up to date with upcoming shows, learn all
          the news, and receive merchandise promotions
        </span>

        <div className="w-full flex items-center justify-center mt-[2rem]">
          <form className="flex flex-col ">
            <label
              style={{
                fontFamily: "Raleway, sans-serif",
              }}
              className="mb-2 text-sm"
            >
              Enter your email
            </label>

            <input
              placeholder="Enter your email here*"
              style={{
                fontFamily: "Raleway, sans-serif",
              }}
              className="w-[30rem] bg-black/50 placeholder-white  h-[2rem] p-2 text-white border border-white "
            />

            <button className="my-5 cursor-pointer hover:bg-gray-300 w-full border border-black flex items-center justify-center py-1 bg-white text-black">
              <span>JOIN THE WREBELLION</span>
            </button>
          </form>
        </div>
      </div>

      <div className="h-full flex flex-col w-full py-[2rem]">
        <div className="w-full mb-4 flex items-center justify-center">
          <Image
            src="/images/logo_red.avif"
            alt="logo"
            width={200}
            height={200}
          />
        </div>
      </div>
    </>
  );
}
