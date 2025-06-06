import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imei, deviceName } = body;

    if (!imei) {
      return NextResponse.json({ error: "IMEI is required" }, { status: 400 });
    }

    // Get user email for QR code
    // const user = await User.findById(new ObjectId(session?.user?.id));
    const user = await prisma.user.findUnique({
      where: { id: session?.user?.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${user.email} (${imei.slice(-4)})`,
      issuer: "SubscriptionApp",
      length: 20,
    });

    // Save or update device
    await prisma.device.upsert({
      where: {
        userId_imei: {
          userId: session.user.id,
          imei,
        },
      },
      update: {
        totpSecret: secret.base32,
        deviceName: deviceName || "Mobile Device",
        isOnboarded: false,
      },
      create: {
        userId: session.user.id,
        imei,
        totpSecret: secret.base32,
        deviceName: deviceName || "Mobile Device",
        isOnboarded: false,
      },
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return NextResponse.json(
      {
        qrCode: qrCodeUrl,
        secret: secret.base32,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Setup device TOTP error:", error);
    return NextResponse.json(
      { error: "Failed to setup device TOTP" },
      { status: 500 }
    );
  }
}
