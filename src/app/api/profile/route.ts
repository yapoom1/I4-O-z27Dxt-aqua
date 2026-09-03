import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getValidToken, updateAccountProfile } from "@/services/saleor";

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = await getValidToken(cookieStore);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, firstName, lastName, email } = await request.json();

    let resolvedFirst = firstName;
    let resolvedLast = lastName;

    if (!resolvedFirst && name) {
      const parts = name.trim().split(" ");
      resolvedFirst = parts[0] || "User";
      resolvedLast = parts.slice(1).join(" ") || "";
    }

    const result = await updateAccountProfile(token, {
      firstName: resolvedFirst,
      lastName: resolvedLast,
      email: email ? email.trim() : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to update profile" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: result.user
    });
  } catch (error: any) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
