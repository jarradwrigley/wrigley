"use client";

import clientPromise from "@/app/lib/mongodb";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "../../../../store/store";
import { formatUSD } from "@/app/lib/utils";

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
  const { addItem } = useStore();

  if (loading) {
    return <div className="px-[7rem] mt-[2rem]">Loading products...</div>;
  }

  return (
    <>
      <div className="px-[7rem]">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16 justify-items-center mt-[2rem]">
          {products.map((item: any, index: any) => (
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

              <button
                onClick={() => addItem(item)} // This now works with your store
                className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-sm hover:bg-gray-800 hover:text-white cursor-pointer transition-colors"
              >
                <span>Add to Cart</span>
              </button>
            </div>
          ))}

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
    </>
  );
}
