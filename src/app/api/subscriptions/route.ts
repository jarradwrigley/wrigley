// app/api/subscriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import User from "@/model/User";
import Subscription from "@/model/Subscription";

// GET - Fetch user's subscriptions
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

    // Fetch user's subscriptions
    const subscriptions = await Subscription.find({ user: user._id })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      subscriptions,
      totalCount: subscriptions.length,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new subscription
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { deviceId, plan, startDate, endDate, status } = body;

    // Validate required fields
    if (!deviceId || !plan || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // await connectDB();

    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if device belongs to user
    const userDevice = user.devices.find(
      (device: any) => device.deviceId === deviceId
    );
    if (!userDevice) {
      return NextResponse.json(
        { error: "Device not found or doesn't belong to user" },
        { status: 400 }
      );
    }

    // Check for existing active subscription for this device
    const existingSubscription = await Subscription.findOne({
      user: user._id,
      deviceId,
      status: "active",
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "Device already has an active subscription" },
        { status: 400 }
      );
    }

    // Create new subscription
    const subscription = new Subscription({
      user: user._id,
      deviceId,
      plan,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || "queued",
    });

    await subscription.save();

    // Populate user info before returning
    await subscription.populate("user", "firstName lastName email");

    return NextResponse.json(
      {
        message: "Subscription created successfully",
        subscription,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
