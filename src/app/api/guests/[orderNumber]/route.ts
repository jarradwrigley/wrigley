import clientPromise from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongoose";
import Order from "@/model/Order";

// Add these exports to force dynamic rendering
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    orderNumber: string;
  };
}

export async function POST(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await dbConnect();

    const { orderNumber } = params;

    const body: any = await req.json();
    // const { email } = req.body;

    if (!orderNumber || !body.email) {
      return NextResponse.json(
        { error: "Fill required fields" },
        { status: 400 }
      );
    }

    // const client = await clientPromise;
    // const db = client.db();

    // const order = await db.collection("orders").findOne({
    //   orderNumber,
    // //   userId: session.user.id,
    // });

    console.log(`${orderNumber}+${body.email}`)

    const order = await Order.findOne({
      orderNumber,
      isGuestOrder: true,
      userEmail: body.email.toLowerCase(),
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve order" },
      { status: 500 }
    );
  }
}
