"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { formatUSD } from "@/app/lib/utils";

interface Product {
  _id: string;
  key: string;
  title: string;
  amount: number;
  image: string;
  images?: string[]; // Array of additional images
  sizes: string[]; // Available sizes
  requiresSize: boolean;
}

interface SizeSelectionModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
}

export function SizeSelectionModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: SizeSelectionModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  const images = product.images?.length ? product.images : [product.image];

  const handleAddToCart = () => {
    if (!selectedSize && product.requiresSize) return;

    onAddToCart(product, selectedSize || "default", quantity);

    // Reset modal state
    setSelectedSize("");
    setQuantity(1);
    setCurrentImageIndex(0);
    onClose();
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleClose = () => {
    setSelectedSize("");
    setQuantity(1);
    setCurrentImageIndex(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] no-scrollbar bg-white overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {product.title}
            </DialogTitle>
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-8 pt-4">
          {/* Image Slider Section */}
          <div className="flex-1">
            <div className="relative">
              <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={images[currentImageIndex]}
                  alt={`${product.title} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                />

                {/* Navigation arrows - only show if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Image indicators - only show if multiple images */}
              {images.length > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex
                          ? "bg-gray-800"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-2xl font-semibold mb-2">{product.title}</h3>
              <p className="text-xl font-medium text-gray-700">
                {formatUSD(product.amount)}
              </p>
            </div>

            {/* Size Selection */}
            {product.requiresSize && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Size *
                </label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size} className="cursor-pointer bg-gray-300">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.requiresSize && !selectedSize}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart - {formatUSD(product.amount * quantity)}
              </Button>

              {product.requiresSize && !selectedSize && (
                <p className="text-sm text-red-500 mt-2">
                  Please select a size to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
