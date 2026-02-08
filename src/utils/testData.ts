import crypto from "crypto";

export type ShippingAddress = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  country?: string;
};

export type CardDetails = {
  number: string;
  expiry: string;
  cvc: string;
};

export function defaultPassword(): string {
  return "P@ssw0rd123!";
}

/**
 * Generates a unique email for each test run.
 * Simple, deterministic, and parallel-safe.
 */
export function uniqueEmail(prefix = "spree"): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(3).toString("hex");
  return `${prefix}.${timestamp}.${random}@example.com`.toLowerCase();
}

/**
 * Spree demo-friendly shipping address.
 */
export function demoShippingAddress(): ShippingAddress {
  return {
    country: "United States",
    firstName: "Bruce",
    lastName: "Wayne",
    address1: "1-23 Main Street",
    address2: "Apartment, suite, etc. (optional)",
    city: "Queens",
    state: "New York",
    zip: "10001",
  };
}

/**
 * Test card details for Spree demo checkout.
 */
export function demoCardDetails(): CardDetails {
  return {
    number: "4242 4242 4242 4242",
    expiry: "12 / 26",
    cvc: "123",
  };
}
