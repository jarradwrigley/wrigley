import { NextRequest, NextResponse } from "next/server";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { dbConnect } from "@/app/lib/mongoose";
import User from "@/model/User";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `JarradEncryptor (${email})`,
      issuer: "JarradEncryptor",
      length: 20,
    });

    // Save secret to user
    await User.findOneAndUpdate(
      { email: email.trim() },
      { totpSecret: secret.base32 },
      { new: true }
    );

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return NextResponse.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
    });
  } catch (error) {
    console.error("💥 API: Setup TOTP error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
