import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setDefaultAddressMutation, getValidToken } from "@/services/saleor";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = await getValidToken(cookieStore);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const result = await setDefaultAddressMutation(token, id);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to set default address" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API /api/addresses/default POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to set default address" }, { status: 500 });
  }
}
