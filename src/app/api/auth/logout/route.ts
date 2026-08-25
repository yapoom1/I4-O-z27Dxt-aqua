import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("saleor_auth_token");
    cookieStore.delete("saleor_refresh_token");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API /api/auth/logout error:", error);
    return NextResponse.json({ error: error.message || "Failed to log out" }, { status: 500 });
  }
}
