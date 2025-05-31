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

// export const validatePhone = (phone: any) => {
//   const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
//   const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
//   return {
//     isValid: phoneRegex.test(cleanPhone) && cleanPhone.length >= 10,
//     message:
//       phoneRegex.test(cleanPhone) && cleanPhone.length >= 10
//         ? ""
//         : "Please enter a valid phone number (at least 10 digits)",
//   };
// };

export const validatePhone = (phone: any) => {
  const phoneRegex = /^[\+]?[0-9]{10,16}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  return {
    isValid: phoneRegex.test(cleanPhone),
    message: phoneRegex.test(cleanPhone)
      ? ""
      : "Please enter a valid phone number (10 to 16 digits)",
  };
};

// Address validation
export const validateAddress = (address: any) => {
  const errors: any = {};

  // Check required fields
  if (!address.fullAddress && !address.address) {
    errors.address = "Street address is required";
  }

  if (!address.city || address.city.trim().length < 2) {
    errors.city = "Please enter a valid city name";
  }

  if (!address.state || address.state.trim().length < 2) {
    errors.state = "Please enter a valid state/province";
  }

  if (!address.zip || !validateZipCode(address.zip, address.country)) {
    errors.zip = "Please enter a valid postal/zip code";
  }

  if (!address.country || address.country.trim().length < 2) {
    errors.country = "Please select a country";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Zip code validation based on country
export const validateZipCode = (zip: any, country: any) => {
  if (!zip) return false;

  const zipPatterns: any = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
    UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
    AU: /^\d{4}$/,
    DE: /^\d{5}$/,
    FR: /^\d{5}$/,
    JP: /^\d{3}-\d{4}$/,
    IN: /^\d{6}$/,
    default: /^.{3,10}$/, // Generic pattern for other countries
  };

  const pattern = zipPatterns[country?.toUpperCase()] || zipPatterns.default;
  return pattern.test(zip.trim());
};

// Credit card validation
export const validateCreditCard = (formData: any) => {
  const errors: any = {};

  // Card number validation (Luhn algorithm)
  const cardNumber = formData.cardNumber.replace(/\s/g, "");
  if (!cardNumber) {
    errors.cardNumber = "Card number is required";
  } else if (!isValidCardNumber(cardNumber)) {
    errors.cardNumber = "Please enter a valid card number";
  }

  // Expiration date validation
  // if (!formData.expirationDate) {
  //   errors.expirationDate = "Expiration date is required";
  // } else 
  if (!isValidExpirationDate(formData.expirationDate)) {
    errors.expirationDate = "Please enter a valid expiration date (MM/YY)";
  }

  // CVV validation
  if (!formData.cvv) {
    errors.cvv = "CVV is required";
  } else if (!isValidCVV(formData.cvv, cardNumber)) {
    errors.cvv = "Please enter a valid CVV";
  }

  // Card holder name validation
  if (!formData.cardHolder || formData.cardHolder.trim().length < 2) {
    errors.cardHolder = "Please enter the cardholder name";
  } else if (!/^[a-zA-Z\s\-\.\']+$/.test(formData.cardHolder)) {
    errors.cardHolder = "Please enter a valid name (letters only)";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cardType: getCardType(cardNumber),
  };
};

// Luhn algorithm for credit card validation
export const isValidCardNumber = (cardNumber: any) => {
  if (!/^\d{13,19}$/.test(cardNumber)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Expiration date validation
export const isValidExpirationDate = (expDate: any) => {
  const cleanDate = expDate.replace(/\s/g, "");
  const match = cleanDate.match(/^(\d{2})\/(\d{2})$/);

  if (!match) return false;

  const month = parseInt(match[1]);
  const year = parseInt(`20${match[2]}`);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }

  return true;
};

// CVV validation
export const isValidCVV = (cvv: any, cardNumber: any) => {
  if (!/^\d{3,4}$/.test(cvv)) return false;

  const cardType = getCardType(cardNumber);
  if (cardType === "amex" && cvv.length !== 4) return false;
  if (cardType !== "amex" && cvv.length !== 3) return false;

  return true;
};

// Get card type from card number
export const getCardType = (cardNumber: any) => {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    dinersclub: /^3[0689]/,
    jcb: /^35/,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) return type;
  }

  return "unknown";
};

// Name validation
export const validateName = (name: any, fieldName = "Name") => {
  if (!name || name.trim().length < 2) {
    return {
      isValid: false,
      message: `${fieldName} must be at least 2 characters long`,
    };
  }

  if (!/^[a-zA-Z\s\-\.\']+$/.test(name)) {
    return {
      isValid: false,
      message: `${fieldName} can only contain letters, spaces, hyphens, periods, and apostrophes`,
    };
  }

  return { isValid: true, message: "" };
};

export const validateGuestEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    error: emailRegex.test(email) ? null : "Please enter a valid email address",
  };
};

// Comprehensive form validation function
export const validateCheckoutForm = (
  formData: any,
  address: any,
  deliveryAddress: any,
  sameAsBillingAddress: any
) => {
  const errors: any = {};

  // Validate names
  const firstNameValidation = validateName(formData.firstName, "First name");
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.message;
  }

  const lastNameValidation = validateName(formData.lastName, "Last name");
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.message;
  }

  // Validate phone
  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.message;
  }

  // Validate billing address
  const addressValidation = validateAddress(address);
  if (!addressValidation.isValid) {
    errors.address = addressValidation.errors;
  }

  // Validate delivery address (if different from billing)
  if (!sameAsBillingAddress && deliveryAddress) {
    const deliveryValidation = validateAddress(deliveryAddress);
    if (!deliveryValidation.isValid) {
      errors.deliveryAddress = deliveryValidation.errors;
    }
  }

  // Validate payment details
  const paymentValidation = validateCreditCard(formData);
  if (!paymentValidation.isValid) {
    errors.payment = paymentValidation.errors;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cardType: paymentValidation.cardType,
  };
};



// Format card number for display
export const formatCardNumber = (value: any) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(" ");
  } else {
    return v;
  }
};

// Format expiration date
export const formatExpirationDate = (value: any) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  if (v.length >= 2) {
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  }
  return v;
};