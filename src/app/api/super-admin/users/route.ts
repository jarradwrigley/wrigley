import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import MongoDBSingleton from "@/app/lib/mongo-instance";
import { options } from "../../auth/[...nextauth]/options";
import { dbConnect } from "@/app/lib/mongoose";
import User from "@/model/User";

// GET - Fetch all users
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const db = await MongoDBSingleton.getInstance().connect();
    const collection = db.collection("users");

    try {
      const users = await collection.find({}).toArray();
      const sanitizedUsers = users.map((user) => ({
        ...user,
        _id: user._id.toString(),
        password: undefined, // Don't send passwords
      }));

      console.log("[API] Fetched users:", sanitizedUsers.length);

      return NextResponse.json({
        success: true,
        data: sanitizedUsers,
        meta: {
          loadTime: 0,
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        },
      });
    } catch (dbError) {
      console.error("[API Error] Failed to fetch users:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API Error] Failed to fetch home data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    console.log("📝 Creating user with data:", {
      ...body,
      // password: "[REDACTED]",
    });

    const { firstName, lastName, username, email, password, role } = body;

    // Validation
    if (!firstName || !lastName || !email || !password || !username) {
      return NextResponse.json(
        { error: "Full name, email, username and password are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    try {
      // Check if user already exists
      const existing = await User.findOne({
        $or: [
          { email: email.toLowerCase().trim() },
          { username: username.trim() },
        ],
      });

      if (existing) {
        console.log("❌ User already exists:", {
          email: existing.email,
          username: existing.username,
        });
        return NextResponse.json(
          { error: "Email or username already exists" },
          { status: 409 }
        );
      }

      // Hash password
      // const saltRounds = await bcrypt.genSalt(12);
      // const hashedPassword = await bcrypt.hash(password, saltRounds);

      // console.log("🔐 Password hashed successfully");
      // console.log("   - Original password length:", password.length);
      // console.log("   - Hashed password length:", hashedPassword.length);
      // console.log(
      //   "   - Hash starts with $2b$:",
      //   hashedPassword.startsWith("$2b$")
      // );

      // Create user object with only the necessary fields
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password,
        role, 
        followers: [],
        following: [],
        posts: [],
        // Add any other default fields your schema expects
      };

      console.log("👤 Creating user with data:", {
        ...userData,
        password: "[HASHED]",
      });

      // Create user
      const user = await User.create(userData);

      console.log("✅ User created successfully:", {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      });

      // Test the password immediately after creation
      // const testMatch = await bcrypt.compare(password, hashedPassword);
      // console.log("🧪 Password verification test:", testMatch);

      return NextResponse.json(
        {
          success: true,
          userId: user._id.toString(),
          message: "User created successfully",
          user: {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
        },
        { status: 201 }
      );
    } catch (dbError: any) {
      console.error("💥 Database error creating user:", dbError);

      // Handle specific MongoDB errors
      if (dbError.code === 11000) {
        return NextResponse.json(
          { error: "Email or username already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("💥 API error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { _id, name, email, password, role, isActive } = body;

    // Validation
    if (!_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(_id)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const db = await MongoDBSingleton.getInstance().connect();
    const collection = db.collection("users");

    try {
      // Check if user exists
      const existingUser = await collection.findOne({ _id: new ObjectId(_id) });
      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Build update object
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Validate and add fields to update
      if (name !== undefined) {
        if (!name.trim()) {
          return NextResponse.json(
            { error: "Name cannot be empty" },
            { status: 400 }
          );
        }
        updateData.name = name.trim();
      }

      if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return NextResponse.json(
            { error: "Invalid email format" },
            { status: 400 }
          );
        }

        // Check if email already exists for another user
        const emailExists = await collection.findOne({
          email: email.toLowerCase().trim(),
          _id: { $ne: new ObjectId(_id) },
        });

        if (emailExists) {
          return NextResponse.json(
            { error: "Email already in use by another user" },
            { status: 409 }
          );
        }

        updateData.email = email.toLowerCase().trim();
      }

      if (password !== undefined) {
        if (password.length < 6) {
          return NextResponse.json(
            { error: "Password must be at least 6 characters long" },
            { status: 400 }
          );
        }
        const saltRounds = 12;
        updateData.password = await bcrypt.hash(password, saltRounds);
      }

      if (role !== undefined) {
        const validRoles = ["user", "admin"];
        if (!validRoles.includes(role)) {
          return NextResponse.json(
            { error: "Invalid role. Must be 'user' or 'admin'" },
            { status: 400 }
          );
        }
        updateData.role = role;
      }

      if (isActive !== undefined) {
        if (typeof isActive !== "boolean") {
          return NextResponse.json(
            { error: "isActive must be a boolean" },
            { status: 400 }
          );
        }
        updateData.isActive = isActive;
      }

      // Update user
      const result = await collection.updateOne(
        { _id: new ObjectId(_id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Fetch updated user
      const updatedUser = await collection.findOne({ _id: new ObjectId(_id) });
      const sanitizedUser = {
        ...updatedUser,
        _id: updatedUser?._id.toString(),
        email: updatedUser?.email.toString(),
        password: undefined,
      };

      console.log("[API] Updated user:", sanitizedUser.email);

      return NextResponse.json({
        success: true,
        data: sanitizedUser,
        message: "User updated successfully",
      });
    } catch (dbError) {
      console.error("[API Error] Failed to update user:", dbError);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API Error] Failed to process request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const db = await MongoDBSingleton.getInstance().connect();
    const collection = db.collection("users");

    try {
      // Check if user exists
      const existingUser = await collection.findOne({
        _id: new ObjectId(userId),
      });
      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Prevent self-deletion
      if (session.user.id && session.user.id === userId) {
        return NextResponse.json(
          { error: "Cannot delete your own account" },
          { status: 400 }
        );
      }

      // Optional: Prevent deletion of the last admin
      if (existingUser.role === "admin") {
        const adminCount = await collection.countDocuments({ role: "admin" });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: "Cannot delete the last admin user" },
            { status: 400 }
          );
        }
      }

      // Delete user
      const result = await collection.deleteOne({ _id: new ObjectId(userId) });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: "User not found or already deleted" },
          { status: 404 }
        );
      }

      console.log("[API] Deleted user:", existingUser.email);

      return NextResponse.json({
        success: true,
        message: "User deleted successfully",
        data: {
          deletedUserId: userId,
          deletedUserEmail: existingUser.email,
        },
      });
    } catch (dbError) {
      console.error("[API Error] Failed to delete user:", dbError);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API Error] Failed to process request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
