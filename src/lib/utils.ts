import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Utility functions for cart management

// export interface CartItem {
//   productId: string;
//   key: string; // composite key: ${productKey}-${size}
//   size: string;
//   quantity: number;
//   price: number;
//   title: string;
//   image: string;
// }

// export interface Product {
//   _id: string;
//   key: string;
//   title: string;
//   amount: number;
//   image: string;
//   images?: string[];
//   sizes?: string[];
//   requiresSize: boolean;
//   promo?: string;
//   type?: string;
// }

/**
 * Creates a unique cart key for a product and size combination
 */
export function createCartKey(productKey: string, size: string = "default"): string {
  return `${productKey}-${size}`;
}

/**
 * Parses a cart key to extract product key and size
 */
export function parseCartKey(cartKey: string): { productKey: string; size: string } {
  const lastDashIndex = cartKey.lastIndexOf('-');
  if (lastDashIndex === -1) {
    return { productKey: cartKey, size: "default" };
  }
  
  return {
    productKey: cartKey.substring(0, lastDashIndex),
    size: cartKey.substring(lastDashIndex + 1)
  };
}

/**
 * Gets all cart items for a specific product (across all sizes)
 */
export function getProductCartItems(cart: any[], productKey: string): any[] {
  return cart.filter(item => {
    const { productKey: itemProductKey } = parseCartKey(item.key);
    return itemProductKey === productKey;
  });
}

/**
 * Calculates total quantity for a product across all sizes
 */
export function getProductTotalQuantity(cart: any[], productKey: string): number {
  return getProductCartItems(cart, productKey)
    .reduce((total, item) => total + item.quantity, 0);
}

/**
 * Gets available sizes for a product that aren't already in cart
 */
export function getAvailableSizes(product: any, cart: any[]): string[] {
  if (!product.sizes || product.sizes.length === 0) {
    return [];
  }

  const cartItems = getProductCartItems(cart, product.key);
  const sizesInCart = cartItems.map(item => item.size);
  
  return product.sizes.filter((size: any) => !sizesInCart.includes(size));
}

/**
 * Checks if a specific product + size combination is in cart
 */
export function isProductSizeInCart(cart: any[], productKey: string, size: string): boolean {
  const cartKey = createCartKey(productKey, size);
  return cart.some(item => item.key === cartKey);
}

/**
 * Gets the cart item for a specific product + size combination
 */
export function getCartItem(cart: any[], productKey: string, size: string): any | undefined {
  const cartKey = createCartKey(productKey, size);
  return cart.find(item => item.key === cartKey);
}

/**
 * Formats size display text
 */
export function formatSizeDisplay(size: string): string {
  if (size === "default") return "";
  return size;
}

/**
 * Creates a cart item from a product
 */
export function createCartItem(
  product: any, 
  size: string = "default", 
  quantity: number = 1
): any {
  return {
    productId: product._id,
    key: createCartKey(product.key, size),
    size: size,
    quantity: quantity,
    price: product.amount,
    title: product.title,
    image: product.image,
  };
}

/**
 * Validates if a size is valid for a product
 */
export function isValidSize(product: any, size: string): boolean {
  if (!product.requiresSize && size === "default") return true;
  if (!product.sizes) return false;
  return product.sizes.includes(size);
}

/**
 * Gets display text for cart items with size info
 */
export function getCartItemDisplayText(item: any): string {
  const sizeText = item.size !== "default" ? ` (${item.size})` : "";
  return `${item.title}${sizeText}`;
}