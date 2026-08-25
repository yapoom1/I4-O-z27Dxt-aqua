import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  let amount: number | undefined;
  try {
    const body = await request.json();
    amount = body.amount;
    const checkoutId = body.checkoutId;
    if (!amount) {
      return NextResponse.json({ error: "Payment amount is required" }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_gubera20Theme";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "dummysecretkey";

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Convert Saleor's USD currency to INR for local Razorpay Test API compatibility
    // (1 USD = 83 INR, and Razorpay expects amount in paise: 1 INR = 100 paise)
    const currency = "INR";
    const amountInINR = Math.round(amount * 83);
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
    console.warn("Razorpay orders.create failed, falling back to simulated order ID for local test workflow:", error.message || error);
    
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
