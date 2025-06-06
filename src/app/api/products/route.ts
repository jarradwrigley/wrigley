import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["USER", "ADMIN", "SUPERADMIN"]).optional(),
});

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    body.email = body.email?.toLowerCase().trim();
    body.username = body.username?.trim();

    const { firstName, lastName, username, email, password, role } =
      createUserSchema.parse(body);

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or username already exists" },
        { status: 409 }
      );
    }

    const saltRounds = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const fullName = `${firstName} ${lastName}`;

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        fullName,
        username,
        email,
        password: hashedPassword,
        role,
      },
    });

    const { password: _, ...safeUser } = user;

    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
