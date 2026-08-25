import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getUserCheckout,
  addCheckoutPromoCode,
  removeCheckoutPromoCode,
  getValidToken
} from "@/services/saleor";

function mapCheckoutToCartItems(checkout: any) {
  if (!checkout || !checkout.lines) return [];
  return checkout.lines.map((line: any) => {
    const variant = line.variant;
    const product = variant.product;
    const mediaUrl = variant.media?.url || product.thumbnail?.url || "";
    const priceAmount = variant.pricing?.price?.gross?.amount || 0;
    
    const variantParts = variant.name.split("/").map((s: string) => s.trim());
    const size = variantParts[0] || "Standard";
    const color = variantParts[1] || "";

    return {
      id: variant.id,
      variantId: variant.id,
      productId: product.id,
      checkoutLineId: line.id,
      name: product.name,
      price: `$${priceAmount.toFixed(2)}`,
      numericPrice: priceAmount,
      image: mediaUrl || "!",
      quantity: line.quantity,
      size,
      color
    };
  });
}

// POST: Apply coupon code
export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = await getValidToken(cookieStore);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    let checkout = await getUserCheckout(token);
    if (!checkout) {
      return NextResponse.json({ error: "No active checkout found to apply coupon" }, { status: 404 });
    }

    checkout = await addCheckoutPromoCode(token, checkout.id, code);

    return NextResponse.json({
      success: true,
      appliedCoupon: checkout?.voucherCode || null,
      discountAmount: checkout?.discount?.amount || 0,
      subtotal: checkout?.subtotalPrice?.gross?.amount || 0,
      shippingCost: checkout?.shippingPrice?.gross?.amount || 0,
      totalAmount: checkout?.totalPrice?.gross?.amount || 0,
      items: mapCheckoutToCartItems(checkout)
    });
  } catch (error: any) {
    console.error("POST /api/cart/coupon error:", error);
    return NextResponse.json({ error: error.message || "Failed to apply coupon" }, { status: 500 });
  }
}

// DELETE: Remove coupon code
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    const cookieStore = await cookies();
    const token = await getValidToken(cookieStore);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    let checkout = await getUserCheckout(token);
    if (!checkout) {
      return NextResponse.json({ error: "No active checkout found to remove coupon" }, { status: 404 });
    }

    const targetCode = code || checkout.voucherCode;
    if (!targetCode) {
      return NextResponse.json({ error: "No active coupon code to remove" }, { status: 400 });
    }

    checkout = await removeCheckoutPromoCode(token, checkout.id, targetCode);

    return NextResponse.json({
      success: true,
      appliedCoupon: checkout?.voucherCode || null,
      discountAmount: checkout?.discount?.amount || 0,
      subtotal: checkout?.subtotalPrice?.gross?.amount || 0,
      shippingCost: checkout?.shippingPrice?.gross?.amount || 0,
      totalAmount: checkout?.totalPrice?.gross?.amount || 0,
      items: mapCheckoutToCartItems(checkout)
    });
  } catch (error: any) {
    console.error("DELETE /api/cart/coupon error:", error);
    return NextResponse.json({ error: error.message || "Failed to remove coupon" }, { status: 500 });
  }
}
