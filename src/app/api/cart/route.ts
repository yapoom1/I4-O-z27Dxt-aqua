import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getUserCheckout,
  createCheckout,
  addCheckoutLines,
  updateCheckoutLines,
  deleteCheckoutLines,
  getValidToken,
  rewriteSaleorMediaUrl
} from "@/services/saleor";

function mapCheckoutToCartItems(checkout: any) {
  if (!checkout || !checkout.lines) return [];
  return checkout.lines.map((line: any) => {
    const variant = line.variant;
    const product = variant.product;
    const rawMedia = variant.media?.url || product?.thumbnail?.url || "";
    const mediaUrl = rewriteSaleorMediaUrl(rawMedia);
    const priceAmount = variant.pricing?.price?.gross?.amount || 0;
    
    // Parse size and color from variant name (e.g., "M / Red")
    const variantParts = variant.name ? variant.name.split("/").map((s: string) => s.trim()) : ["Standard"];
    const size = variantParts[0] || "Standard";
    const color = variantParts[1] || "";

    return {
      id: variant.id,
      variantId: variant.id,
      productId: product?.id,
      checkoutLineId: line.id,
      name: product?.name || variant.name || "Product",
      price: `\u20b9${priceAmount.toFixed(0)}`,
      numericPrice: priceAmount,
      image: mediaUrl || "",
      quantity: line.quantity,
      size,
      color
    };
  });
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = await getValidToken(cookieStore);

    if (!token) {
      return NextResponse.json({
        success: true,
        checkoutId: null,
        appliedCoupon: null,
        discountAmount: 0,
        subtotal: 0,
        shippingCost: 0,
        totalAmount: 0,
        items: []
      });
    }

    const checkout = await getUserCheckout(token);
    return NextResponse.json({
      success: true,
      checkoutId: checkout?.id || null,
      appliedCoupon: checkout?.voucherCode || null,
      discountAmount: checkout?.discount?.amount || 0,
      subtotal: checkout?.subtotalPrice?.gross?.amount || 0,
      shippingCost: checkout?.shippingPrice?.gross?.amount || 0,
      totalAmount: checkout?.totalPrice?.gross?.amount || 0,
      items: mapCheckoutToCartItems(checkout)
    });
  } catch (error: any) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = await getValidToken(cookieStore);

    if (!token) {
      return NextResponse.json({
        success: true,
        checkoutId: null,
        appliedCoupon: null,
        discountAmount: 0,
        subtotal: 0,
        shippingCost: 0,
        totalAmount: 0,
        items: []
      });
    }

    const { items, variantId, quantity } = await request.json();
    let checkout = await getUserCheckout(token);

    if (items && Array.isArray(items)) {
      if (items.length === 0) {
        return NextResponse.json({
          success: true,
          checkoutId: checkout?.id || null,
          appliedCoupon: checkout?.voucherCode || null,
          discountAmount: checkout?.discount?.amount || 0,
          subtotal: checkout?.subtotalPrice?.gross?.amount || 0,
          shippingCost: checkout?.shippingPrice?.gross?.amount || 0,
          totalAmount: checkout?.totalPrice?.gross?.amount || 0,
          items: mapCheckoutToCartItems(checkout)
        });
      }

      if (!checkout) {
        checkout = await createCheckout(token, items);
      } else {
        checkout = await addCheckoutLines(token, checkout.id, items);
      }
    } else if (variantId && quantity) {
      if (!checkout) {
        checkout = await createCheckout(token, [{ variantId, quantity }]);
      } else {
        checkout = await addCheckoutLines(token, checkout.id, [{ variantId, quantity }]);
      }
    }

    return NextResponse.json({
      success: true,
      checkoutId: checkout?.id || null,
      appliedCoupon: checkout?.voucherCode || null,
      discountAmount: checkout?.discount?.amount || 0,
      subtotal: checkout?.subtotalPrice?.gross?.amount || 0,
      shippingCost: checkout?.shippingPrice?.gross?.amount || 0,
      totalAmount: checkout?.totalPrice?.gross?.amount || 0,
      items: mapCheckoutToCartItems(checkout)
    });
  } catch (error: any) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = await getValidToken(cookieStore);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { variantId, lineId, quantity } = await request.json();
    let checkout = await getUserCheckout(token);

    if (!checkout) {
      return NextResponse.json({ error: "No active checkout found" }, { status: 404 });
    }

    checkout = await updateCheckoutLines(token, checkout.id, [{ variantId, lineId, quantity }]);

    return NextResponse.json({
      success: true,
      checkoutId: checkout?.id || null,
      appliedCoupon: checkout?.voucherCode || null,
      discountAmount: checkout?.discount?.amount || 0,
      subtotal: checkout?.subtotalPrice?.gross?.amount || 0,
      shippingCost: checkout?.shippingPrice?.gross?.amount || 0,
      totalAmount: checkout?.totalPrice?.gross?.amount || 0,
      items: mapCheckoutToCartItems(checkout)
    });
  } catch (error: any) {
    console.error("PUT /api/cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lineIds = searchParams.getAll("lineId");

    if (lineIds.length === 0) {
      return NextResponse.json({ error: "At least one Line ID is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = await getValidToken(cookieStore);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let checkout = await getUserCheckout(token);
    if (!checkout) {
      return NextResponse.json({ error: "No active checkout found" }, { status: 404 });
    }

    checkout = await deleteCheckoutLines(token, checkout.id, lineIds);

    return NextResponse.json({
      success: true,
      checkoutId: checkout?.id || null,
      appliedCoupon: checkout?.voucherCode || null,
      discountAmount: checkout?.discount?.amount || 0,
      subtotal: checkout?.subtotalPrice?.gross?.amount || 0,
      shippingCost: checkout?.shippingPrice?.gross?.amount || 0,
      totalAmount: checkout?.totalPrice?.gross?.amount || 0,
      items: mapCheckoutToCartItems(checkout)
    });
  } catch (error: any) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
