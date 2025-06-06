import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
// Or if using Mongoose: import User from "@/app/models/User";

export async function POST(req: NextRequest) {
//   await dbConnect();

  try {
    const { username, password } = await req.json();

    // console.log("🔍 API: Authenticating user:", username);

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password required" },
        { status: 400 }
      );
    }

    // Using MongoDB directly
    // const client = await clientPromise;
    // const users = client.db().collection("users");

    const user = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    // Find user by username
    // const user = await users.findOne({ username });
    // const user = await User.findOne({
    //   username: username.trim(),
    // }).select("+password");

    if (!user) {
      // console.log("❌ API: User not found:", username);
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // console.log("👤 API: User found, verifying password", user);

    // Check password
    const hashedPassword =
      typeof user.password === "string"
        ? user.password
        //@ts-ignore
        : user?.password.toString();

    const isMatch = await bcrypt.compare(password, hashedPassword);
    // const testMatch = await bcrypt.compare(password, hashedPassword);
    // console.log("🧪 Password verification test:", testMatch);

    if (!isMatch) {
      // console.log("❌ API: Password mismatch");
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // console.log("✅ API: Password verified successfully");

    // Return user data (without password)
    // const userData = {
    //   id: user._id.toString(),
    //   username: user.username,
    //   email: user.email,
    //   role: user.role,
    //   firstName: user.firstName,
    //   lastName: user.lastName,
    //   profilePic: user.profilePic,
    // };

    // console.log("👤 API: Returning user data:", {
    //   id: userData.id,
    //   username: userData.username,
    //   role: userData.role,
    // });

    // const {password, ...userWithoutPassword} = user

    // const userObj = user.toObject(); // 👈 important step
    const { password: _password, ...userWithoutPassword } = user;

    // console.log("👤 API:Final User,", userWithoutPassword);

    return NextResponse.json({
      success: true,
      // user: userData,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("💥 API: Authentication error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
