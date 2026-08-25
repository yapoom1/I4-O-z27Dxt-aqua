import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getValidToken, getUserOrders, getOrderById } from "@/services/saleor";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");

    const cookieStore = await cookies();
    const token = await getValidToken(cookieStore);

    if (orderId) {
      // Fetch details for a specific order (supports guest and logged-in users)
      const order = await getOrderById(token, orderId);
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, order });
    }

    // Otherwise, fetch the list of orders (requires user authentication)
    if (!token) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const orders = await getUserOrders(token);
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("API /api/orders GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve orders" }, { status: 500 });
  }
}
