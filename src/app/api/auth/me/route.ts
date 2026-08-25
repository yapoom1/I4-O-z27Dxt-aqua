import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserProfile, getValidToken } from "@/services/saleor";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = await getValidToken(cookieStore);

    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const profile = await getUserProfile(token);
    if (!profile) {
      cookieStore.delete("saleor_auth_token");
      cookieStore.delete("saleor_refresh_token");
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("API /api/auth/me error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve profile" }, { status: 500 });
  }
}
