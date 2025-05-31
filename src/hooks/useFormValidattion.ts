"use client"

import { validateCheckoutForm } from "@/lib/utils";
import { useEffect, useState } from "react";

// Real-time validation hook (for React)
export const useFormValidation = (
  formData: any,
  address: any,
  deliveryAddress: any,
  sameAsBillingAddress: any
) => {
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validation = validateCheckoutForm(
      formData,
      address,
      deliveryAddress,
      sameAsBillingAddress
    );
    setErrors(validation.errors);
    setIsValid(validation.isValid);
  }, [formData, address, deliveryAddress, sameAsBillingAddress]);

  return { errors, isValid };
};
