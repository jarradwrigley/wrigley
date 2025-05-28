import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import MongoDBSingleton from "@/app/lib/mongo-instance";
import { options } from "../../auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session || session.user.role !== "admin") {
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
