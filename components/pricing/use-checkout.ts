"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { productCatalog } from "@/lib/products";

export function useCheckout() {
  const plan = productCatalog[0];
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          customerName,
          email,
        }),
      });

      const payload = (await response.json()) as { error?: string; url?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Checkout could not be created.");
      }

      window.location.href = payload.url;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout could not be created.",
      );
      setPending(false);
    }
  }

  return {
    plan,
    customerName,
    setCustomerName,
    email,
    setEmail,
    error,
    pending,
    handleCheckout,
  };
}
