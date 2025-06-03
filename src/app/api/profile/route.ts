import clientPromise from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import User from "@/model/User";

// Force dynamic rendering and server-side runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // console.log('ddd', session)

    const profile = await User.findOne({
      _id: new ObjectId(session.user.id),
    }).select("-password");

    // Convert user ID to ObjectId if needed
    // const profile = await db.collection("users").findOne({
    //   _id: new ObjectId(session.user.id),
    // });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("Profile retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Define allowed fields for update
    const allowedFields = [
      "firstName",
      "lastName",
      "fullName",
      "phone",
      "profilePic",
      "bio",
      "website",
      "gender",
      "dob",
      "address",
    ];

    // Extract and validate update data
    const updateData: any = {};
    const unsetData: any = {}; // Fields to unset (clear)

    // Handle simple fields
    allowedFields.forEach((field) => {
      if (field in body && body[field] !== undefined) {
        const value = body[field];

        // Handle empty strings and null values - decide whether to clear or skip
        if (value === "" || value === null) {
          // For optional fields, we'll unset them to clear the value
          if (["phone", "bio", "website", "gender", "dob"].includes(field)) {
            unsetData[field] = 1;
          }
          // Skip required fields like firstName, lastName, fullName if empty
          return;
        }

        // Special validation for specific fields
        if (field === "phone" && value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
          throw new Error("Invalid phone number format");
        }

        if (field === "website" && value && !isValidUrl(value)) {
          throw new Error("Invalid website URL format");
        }

        if (field === "dob" && value && !isValidDate(value)) {
          throw new Error("Invalid date of birth format");
        }

        updateData[field] = value;
      }
    });

    // Handle address object separately with validation
    if (body.address && typeof body.address === "object") {
      const addressFields = [
        "fullAddress",
        "street",
        "city",
        "state",
        "country",
        "postalCode",
        "zip",
      ];

      const addressData: any = {};
      const addressUnsetData: any = {};

      addressFields.forEach((field) => {
        if (field in body.address && body.address[field] !== undefined) {
          const value = body.address[field];

          // Handle empty strings and null values for address fields
          if (value === "" || value === null) {
            addressUnsetData[`address.${field}`] = 1;
            return;
          }

          // Validate postal code and zip if provided
          if ((field === "postalCode" || field === "zip") && value) {
            if (!/^[A-Za-z0-9\s\-]+$/.test(value)) {
              throw new Error(`Invalid ${field} format`);
            }
          }
          addressData[field] = value;
        }
      });

      if (Object.keys(addressData).length > 0) {
        updateData.address = addressData;
      }

      // Add address unset operations
      Object.assign(unsetData, addressUnsetData);
    }

    if (updateData.firstName || updateData.lastName) {
      console.log("🔄 Handling fullName update in API");

      // If both firstName and lastName are being updated
      if (updateData.firstName && updateData.lastName) {
        updateData.fullName = `${updateData.firstName} ${updateData.lastName}`;
        console.log(
          "✅ Both names updated, fullName set to:",
          updateData.fullName
        );
      } else {
        // If only one is being updated, fetch current user to get the other name
        console.log("🔍 Only one name updated, fetching current user");
        try {
          const currentUser = await User.findById(session.user.id).select(
            "firstName lastName"
          );
          if (currentUser) {
            const newFirstName = updateData.firstName || currentUser.firstName;
            const newLastName = updateData.lastName || currentUser.lastName;
            updateData.fullName = `${newFirstName} ${newLastName}`;
            console.log("✅ fullName updated to:", updateData.fullName);
          }
        } catch (error) {
          console.error(
            "❌ Error fetching current user for fullName update:",
            error
          );
        }
      }
    }

    // Check if there's anything to update
    if (
      Object.keys(updateData).length === 0 &&
      Object.keys(unsetData).length === 0
    ) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

   

    // Add timestamp for last update
    updateData.updatedAt = new Date();

    // Prepare the update operation
    const updateOperation: any = {};
    if (Object.keys(updateData).length > 0) {
      updateOperation.$set = updateData;
    }
    if (Object.keys(unsetData).length > 0) {
      updateOperation.$unset = unsetData;
    }

    // Update the user profile
    const updatedProfile = await User.findOneAndUpdate(
      { _id: new ObjectId(session.user.id) },
      updateOperation,
      {
        new: true, // Return updated document
        select: "-password", // Exclude password field
        runValidators: true, // Run mongoose validators
      }
    );

    if (!updatedProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        profile: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile update error:", error);

    // Handle validation errors
    if (error instanceof Error && error.message.includes("Invalid")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

// Helper functions for validation
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    // Check if it's a relative URL or domain without protocol
    const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    return domainRegex.test(string);
  }
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}
