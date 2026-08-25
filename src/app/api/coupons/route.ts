import { NextResponse } from "next/server";

export async function GET() {
  // Available promotions returned dynamically
  const coupons = [
    {
      code: "SAVE10",
      value: "10%",
      title: "Sitewide Discount",
      description: "Get 10% off your entire order.",
      expiry: "Expires July 20, 2026",
    },
    {
      code: "FREESHIP",
      value: "FREE",
      title: "Free Standard Shipping",
      description: "Free standard home delivery on orders exceeding $100.",
      expiry: "Expires August 01, 2026",
    },
    {
      code: "WELCOME5",
      value: "$5",
      title: "Welcome Coupon",
      description: "Special sign-up gift of $5.00 off for first-time orders.",
      expiry: "No Expiration Date",
    },
    {
      code: "FREEGIFT",
      value: "FREE",
      title: "Free Shipping Special",
      description: "Free shipping on any order with no minimum spend.",
      expiry: "Limited Time Only",
    }
  ];

  return NextResponse.json(coupons);
}
