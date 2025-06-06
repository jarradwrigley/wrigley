import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Subscription types with their durations in days
const SUBSCRIPTION_TYPES: Record<string, number> = {
  "mobile-v4-basic": 30,
  "mobile-v4-premium": 60,
  "mobile-v4-enterprise": 90,
  "mobile-v5-basic": 30,
  "mobile-v5-premium": 60,
  "full-suite-basic": 60,
  "full-suite-premium": 90,
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId, imei, totpCode } = body;

    if (!subscriptionId || !imei || !totpCode) {
      return NextResponse.json(
        { error: "Subscription ID, IMEI, and TOTP code are required" },
        { status: 400 }
      );
    }

    // Get subscription
    // const subscription = await Subscription.findById(
    //   new ObjectId(subscriptionId)
    // );

    const subscription = await prisma.subscription.findUnique({
      where: {id: subscriptionId }
    })
    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Verify subscription belongs to user
    if (subscription.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to subscription" },
        { status: 403 }
      );
    }

    if (subscription.status !== "QUEUED") {
      return NextResponse.json(
        { error: "Subscription is not ready for activation" },
        { status: 400 }
      );
    }

    if (subscription.imei !== imei) {
      return NextResponse.json({ error: "IMEI mismatch" }, { status: 400 });
    }

    // Get device and verify TOTP
    // const device = await Device.findOne({
    //   user: new ObjectId(session.user.id),
    //   imei,
    // });

    const device = await prisma.device.findFirst({
      where: {userId: session.user.id, imei}
    })

    if (!device) {
      return NextResponse.json(
        { error: "Device not found or not set up" },
        { status: 404 }
      );
    }

    // Verify TOTP code
    const verified = speakeasy.totp.verify({
      secret: device.totpSecret,
      encoding: "base32",
      token: totpCode,
      window: 2, // Allow 2 time steps before/after current time
    });

    if (!verified) {
      return NextResponse.json({ error: "Invalid TOTP code" }, { status: 400 });
    }

    // Get subscription duration based on type
    const subscriptionType = subscription.subscriptionType;
    const durationInDays = SUBSCRIPTION_TYPES[subscriptionType];

    if (!durationInDays) {
      console.warn(
        `Unknown subscription type: ${subscriptionType}, defaulting to 30 days`
      );
      // Default to 30 days if subscription type is not found
    }

    const duration = durationInDays || 30; // Default to 30 days if not found

    // Deactivate any existing active subscription for this IMEI
    // await Subscription.updateMany(
    //   { imei, status: "active" },
    //   {
    //     $set: {
    //       status: "expired",
    //       updatedAt: new Date(),
    //     },
    //   }
    // );

    // Activate the subscription with correct duration
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + duration); // Add the specific duration in days

    const updatedSubscription = await prisma.subscription.update({
      where: {
        id: subscriptionId, // assuming `subscriptionId` is a string and maps to the `id` field
      },
      data: {
        status: "ACTIVE",
        startDate: now,
        endDate: endDate,
        // activatedAt: now,
        updatedAt: now,
      },
    });


    // Mark device as onboarded
    await prisma.device.update({
      where: {
        id: device.id, // assuming `device` has an `id` field
      },
      data: {
        isOnboarded: true,
        updatedAt: now,
      },
    });
    

    // Make your custom API call here
    try {
      await makeSubscriptionActivationApiCall(
        updatedSubscription,
        device,
        session.user
      );
    } catch (apiError) {
      console.error("Custom API call failed:", apiError);
      // Don't fail the activation if the external API call fails
    }

    console.log(
      `✅ Subscription activated: ${subscriptionType} for ${duration} days`
    );
    console.log(
      `📅 Start: ${now.toISOString()}, End: ${endDate.toISOString()}`
    );

    return NextResponse.json(
      {
        message: "Subscription activated successfully",
        subscription: updatedSubscription,
        duration: `${duration} days`,
        subscriptionType: subscriptionType,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Activate subscription error:", error);
    return NextResponse.json(
      { error: "Failed to activate subscription" },
      { status: 500 }
    );
  }
}

// Custom API call function
async function makeSubscriptionActivationApiCall(
  subscription: any,
  device: any,
  user: any
) {
  try {
    console.log(
      `🚀 Making subscription activation API call for user: ${user.email}`
    );

    // Get subscription duration for API call
    const duration = SUBSCRIPTION_TYPES[subscription.subscriptionType] || 30;

    // Example: Call an external API
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add your API key here if needed
        // 'Authorization': `Bearer ${process.env.EXTERNAL_API_KEY}`,
      },
      body: JSON.stringify({
        title: "Subscription Activated",
        body: `User ${user.email} has activated subscription ${subscription._id} for device ${device.imei}`,
        userId: subscription.userId,
        subscriptionId: subscription._id,
        imei: device.imei,
        subscriptionType: subscription.subscriptionType,
        duration: `${duration} days`,
        planName: subscription.planName,
        planPrice: subscription.planPrice,
        activatedAt: subscription.activatedAt,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        userEmail: user.email,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Subscription activation API call successful:", result);
    return result;
  } catch (error) {
    console.error("❌ Subscription activation API call failed:", error);
    throw error;
  }
}
