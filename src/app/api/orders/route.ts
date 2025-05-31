import clientPromise from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

// Add these exports to force dynamic rendering
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch all orders for the authenticated user
    const orders = await db
      .collection("orders")
      .find({
        userId: session.user.id,
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .toArray();

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve orders" },
      { status: 500 }
    );
  }
}
