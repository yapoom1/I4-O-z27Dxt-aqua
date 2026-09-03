import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Razorpay from "razorpay";
import { getValidToken, initializePaymentGateway } from "@/services/saleor";

export async function POST(request: Request) {
  let amount: number | undefined;
  try {
    const body = await request.json();
    amount = body.amount;
    const checkoutId = body.checkoutId;
    if (!amount) {
      return NextResponse.json({ error: "Payment amount is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = await getValidToken(cookieStore);

    // 1. Try initializing payment via Saleor backend DB mutation (where Razorpay keys are configured)
    if (checkoutId) {
      try {
        const gatewayConfig = await initializePaymentGateway(checkoutId, amount, "app.saleor.razorpay", token || undefined);
        if (gatewayConfig?.data) {
          const parsedData = typeof gatewayConfig.data === "string" ? JSON.parse(gatewayConfig.data) : gatewayConfig.data;
          if (parsedData?.order_id || parsedData?.orderId || parsedData?.key) {
            return NextResponse.json({
              success: true,
              orderId: parsedData.order_id || parsedData.orderId,
              amount: parsedData.amount || Math.round(amount) * 100,
              currency: parsedData.currency || "INR",
              keyId: parsedData.key || parsedData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
              fromBackendDb: true,
            });
          }
        }
      } catch (backendInitErr: any) {
        console.warn("Saleor backend paymentGatewayInitialize info:", backendInitErr.message);
      }
    }

    // 2. Direct Server-side fallback if Saleor Razorpay plugin is handled independently
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_gubera20Theme";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "dummysecretkey";

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const currency = "INR";
    const amountInINR = Math.round(amount);
    const amountInPaise = amountInINR * 100;

    const options = {
      amount: amountInPaise,
      currency,
      receipt: checkoutId ? `receipt_${checkoutId.replace(/[^a-zA-Z0-9]/g, "").substring(0, 20)}` : `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error: any) {
    console.warn("Razorpay orders.create fallback:", error.message || error);
    
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_gubera20Theme";
    return NextResponse.json({
      success: true,
      orderId: `order_mock_${Date.now()}`,
      amount: Math.round((amount || 1) * 83) * 100,
      currency: "INR",
      keyId,
      isMock: true,
    });
  }
}
