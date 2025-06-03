// app/api/subscriptions/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import User from "@/model/User";
import Subscription from "@/model/Subscription";

// GET - Fetch subscription statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // await connectDB();

    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get subscription statistics
    const stats = await Subscription.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get plan distribution
    const planStats = await Subscription.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: "$plan",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = await Subscription.countDocuments({
      user: user._id,
      status: "active",
      endDate: { $lte: thirtyDaysFromNow },
    });

    // Format stats
    const formattedStats = {
      active: stats.find((s) => s._id === "active")?.count || 0,
      queued: stats.find((s) => s._id === "queued")?.count || 0,
      expired: stats.find((s) => s._id === "expired")?.count || 0,
      total: await Subscription.countDocuments({ user: user._id }),
      expiringSoon,
      planDistribution: planStats.reduce((acc, plan) => {
        acc[plan._id] = plan.count;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({ stats: formattedStats });
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
