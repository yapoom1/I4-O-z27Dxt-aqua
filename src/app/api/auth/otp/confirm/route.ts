import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { confirmOtp } from "@/services/saleor";

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP code are required" }, { status: 400 });
    }

    const result = await confirmOtp(phone, otp);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to verify OTP" }, { status: 400 });
    }

    // Securely set HttpOnly cookies for both access token and refresh token
    const cookieStore = await cookies();
    
    if (result.token) {
      cookieStore.set("saleor_auth_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }

    if (result.refreshToken) {
      cookieStore.set("saleor_refresh_token", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return NextResponse.json({
      success: true,
      user: result.user
    });
  } catch (error: any) {
    console.error("API /api/auth/otp/confirm error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify OTP" }, { status: 500 });
  }
}
