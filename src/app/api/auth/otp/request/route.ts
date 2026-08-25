import { NextResponse } from "next/server";
import { requestOtp } from "@/services/saleor";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const result = await requestOtp(phone);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to request OTP" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API /api/auth/otp/request error:", error);
    return NextResponse.json({ error: error.message || "Failed to request OTP" }, { status: 500 });
  }
}
