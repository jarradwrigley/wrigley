import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { ObjectId } from "mongodb";
import Device from "@/model/Device";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imei, isOnboarded = false, name } = body;

    if (!imei || typeof imei !== "string") {
      return NextResponse.json({ error: "IMEI is required" }, { status: 400 });
    }

    // Check if device already exists
    const existing = await Device.findOne({
      user: new ObjectId(session.user.id),
      imei,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Device already exists" },
        { status: 409 }
      );
    }

    const newDevice = await Device.create({
      user: new ObjectId(session.user.id),
      imei,
      isOnboarded,
      totpSecret: "testSecret",
      deviceName: name || "Unnamed Device",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Device created successfully",
        device: {
          id: newDevice._id,
          imei: newDevice.imei,
          isOnboarded: newDevice.isOnboarded,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Device creation error:", error);
    return NextResponse.json(
      { error: "Failed to create device" },
      { status: 500 }
    );
  }
}
