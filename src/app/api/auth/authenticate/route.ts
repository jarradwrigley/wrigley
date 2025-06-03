// app/api/auth/authenticate/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/app/lib/mongodb";
import { dbConnect } from "@/app/lib/mongoose";
import User from "@/model/User";
// Or if using Mongoose: import User from "@/app/models/User";

export async function POST(req: NextRequest) {
  await dbConnect();

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
    const client = await clientPromise;
    const users = client.db().collection("users");

    // Find user by username
    // const user = await users.findOne({ username });
    const user = await User.findOne({
      username: username.trim(),
    }).select("+password");

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
        : user.password.toString();

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

    const userObj = user.toObject(); // 👈 important step
    const { password: _password, ...userWithoutPassword } = userObj;

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

// Alternative using Mongoose
/*
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      user: {
        id: userResponse._id.toString(),
        username: userResponse.username,
        email: userResponse.email,
        role: userResponse.role,
        firstName: userResponse.firstName,
        lastName: userResponse.lastName,
        profilePic: userResponse.profilePic,
      },
    });

  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
*/
