// app/api/subscriptions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import User from "@/model/User";
import Subscription from "@/model/Subscription";

// GET - Fetch specific subscription
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find subscription by ID and ensure it belongs to the user
    const subscription = await Subscription.findOne({
      _id: params.id,
      user: user._id,
    }).populate("user", "firstName lastName email");

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update subscription
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { deviceId, plan, startDate, endDate, status } = body;

    // await connectDB();

    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find subscription by ID and ensure it belongs to the user
    const subscription = await Subscription.findOne({
      _id: params.id,
      user: user._id,
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // If deviceId is being changed, verify the new device belongs to user
    if (deviceId && deviceId !== subscription.deviceId) {
      const userDevice = user.devices.find(
        (device: any) => device.deviceId === deviceId
      );
      if (!userDevice) {
        return NextResponse.json(
          { error: "Device not found or doesn't belong to user" },
          { status: 400 }
        );
      }

      // Check for existing active subscription for the new device
      const existingSubscription = await Subscription.findOne({
        _id: { $ne: params.id },
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
    }

    // Update subscription fields
    const updateData: any = {};
    if (deviceId) updateData.deviceId = deviceId;
    if (plan) updateData.plan = plan;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (status) updateData.status = status;

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("user", "firstName lastName email");

    return NextResponse.json({
      message: "Subscription updated successfully",
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete subscription
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find and delete subscription (ensure it belongs to the user)
    const subscription = await Subscription.findOneAndDelete({
      _id: params.id,
      user: user._id,
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
