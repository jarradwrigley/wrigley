import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongoose";
import User from "@/model/User";
import speakeasy from "speakeasy";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json(
        { success: false, error: "Email and token are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.trim() });

    if (!user || !user.totpSecret) {
      return NextResponse.json(
        { success: false, error: "User not found or TOTP not set up" },
        { status: 404 }
      );
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: "base32",
      token: token,
      window: 2,
    });

    if (verified) {
      // Update user to mark TOTP as enabled
      await User.findByIdAndUpdate(user._id, { isTotpEnabled: true });

      // Make custom API call
      try {
        await makeYourCustomApiCall(email);
      } catch (apiError) {
        console.error(
          "Custom API call failed, but TOTP was verified:",
          apiError
        );
        // Note: We still return success since TOTP verification worked
      }

      return NextResponse.json({
        success: true,
        message: "TOTP verified successfully",
        verified: true,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid TOTP code",
          verified: false,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("💥 API: Verify TOTP error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function makeYourCustomApiCall(email: string) {
  console.log(`🔄 Making custom API call for user: ${email}`);

  // Example: Call an external API
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "TOTP Verified",
        body: `User ${email} has successfully verified TOTP`,
        userId: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ API call successful:", result);
    return result;
  } catch (error) {
    console.error("❌ Custom API call failed:", error);
    throw error;
  }
}
