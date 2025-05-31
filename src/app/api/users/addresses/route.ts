import { getServerSession } from "next-auth";
import clientPromise from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const addressCollection = db.collection("addresses");

    const addresses = await addressCollection
      .find({ userId: session.user.id })
      .toArray();

    const safeAddresses = addresses.map((addr) => ({
      ...addr,
      _id: addr._id.toString(),
    }));

    return NextResponse.json(safeAddresses);
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch user addresses" },
      { status: 500 }
    );
  }
}
