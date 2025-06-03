// app/api/subscriptions/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import User from "@/model/User";
import Subscription from "@/model/Subscription";

// POST - Bulk operations on subscriptions
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, subscriptionIds } = body;

    if (
      !action ||
      !Array.isArray(subscriptionIds) ||
      subscriptionIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // await connectDB();

    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let result;

    switch (action) {
      case "delete":
        result = await Subscription.deleteMany({
          _id: { $in: subscriptionIds },
          user: user._id,
        });
        break;

      case "activate":
        result = await Subscription.updateMany(
          {
            _id: { $in: subscriptionIds },
            user: user._id,
          },
          { status: "active" }
        );
        break;

      case "deactivate":
        result = await Subscription.updateMany(
          {
            _id: { $in: subscriptionIds },
            user: user._id,
          },
          { status: "expired" }
        );
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      message: `Bulk ${action} completed successfully`,
      modifiedCount:
        action === "delete"
          ? (result as { deletedCount: number }).deletedCount
          : (result as { modifiedCount: number }).modifiedCount,
    });
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
