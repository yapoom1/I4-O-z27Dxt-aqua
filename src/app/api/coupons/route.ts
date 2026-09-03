import { NextResponse } from "next/server";
import { getVouchers } from "@/services/saleor";

export async function GET() {
  const backendVouchers = await getVouchers(10);
  
  if (backendVouchers && backendVouchers.length > 0) {
    const mapped = backendVouchers.map((v: any) => ({
      code: v.code,
      value: v.type === "ENTIRE_ORDER" ? "10%" : "DISCOUNT",
      title: v.name || "Promo Code",
      description: `Use code ${v.code} for a discount on your order.`,
      expiry: v.endDate ? `Expires ${new Date(v.endDate).toLocaleDateString()}` : "No Expiration Date",
    }));
    return NextResponse.json(mapped);
  }

  // Fallback if backend has no active vouchers or permission is denied
  const coupons = [
    {
      code: "SAVE10",
      value: "10%",
      title: "Sitewide Discount",
      description: "Get 10% off your entire order.",
      expiry: "Expires July 20, 2026",
    }
  ];

  return NextResponse.json(coupons);
}
