import { dbConnect } from "@/app/lib/mongoose";
import User from "@/model/User";
import { NextResponse } from "next/server";

// PATCH /api/users/:id
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const userId = params.id;
  const body = await req.json();

  try {
    // Optional: enforce field restrictions
    const allowedFields = [
      "firstName",
      "lastName",
      "username",
      "email",
      "phone",
      "profilePic",
      "bio",
      "location",
      "website",
      "gender",
      "dob",
      "address",
      "preferences",
    ];

    const updates: Partial<typeof body> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User updated", user: updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update error:", error);
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    );
  }
}

// import bcrypt from "bcryptjs";

// export async function POST(req: Request) {
//   await dbConnect();
//   const body = await req.json();

//   try {
//     const { firstName, lastName, username, email, password } = body;

//     if (!firstName || !lastName || !username || !email || !password) {
//       return NextResponse.json(
//         { message: "All fields are required" },
//         { status: 400 }
//       );
//     }

//     const existing = await User.findOne({ $or: [{ email }, { username }] });
//     if (existing) {
//       return NextResponse.json(
//         { message: "Email or username already exists" },
//         { status: 409 }
//       );
//     }

//     const hashed = await bcrypt.hash(password, 10);
//     const user = await User.create({
//       ...body,
//       password: hashed,
//     });

//     return NextResponse.json(
//       { message: "User created", userId: user._id },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }
