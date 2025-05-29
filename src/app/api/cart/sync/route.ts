// app/api/cart/route.ts

import { getServerSession } from "next-auth";
import clientPromise from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";

export async function GET() {
  try {
    const session = await getServerSession(options);


    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const cartCollection = db.collection("carts");

    const cart = await cartCollection.findOne({ userId: session?.user?.id });

    return NextResponse.json({
      cart: cart?.items || [],
      total: cart?.total || 0,
    });
  } catch (error) {
    console.error("Error fetching user cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);

    // console.log("sss", session);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cart, total } = await req.json();

    if (!cart.length) {
      console.log("Skipping cart sync on logout or empty cart");
      return NextResponse.json({ message: "Empty cart not synced" });
    }

    const client = await clientPromise;
    const db = client.db();
    const cartCollection = db.collection("carts");

    await cartCollection.updateOne(
      { userId: session.user.id },
      {
        $set: {
          items: cart,
          total,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing cart:", error);
    return NextResponse.json(
      { error: "Failed to sync cart" },
      { status: 500 }
    );
  }
}
