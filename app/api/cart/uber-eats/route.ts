import { NextRequest } from "next/server";

/**
 * POST /api/cart/uber-eats
 *
 * Placeholder for Uber Eats cart creation.
 * In production: takes a meal plan payload, calls Uber Eats Order API
 * to build a cart, and returns a deep-link URL for the user to checkout.
 *
 * To activate: provide UBER_API_KEY + UBER_CLIENT_ID in .env.local
 */
export const runtime = "edge";

export async function POST(_request: NextRequest) {
  return Response.json(
    {
      status: "ok",
      message:
        "Uber Eats cart placeholder — connect your UBER_API_KEY to enable cart building.",
      cartId: null,
      checkoutUrl: null,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
