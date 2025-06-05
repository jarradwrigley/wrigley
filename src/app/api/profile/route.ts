
import clientPromise from "../../lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import User from "../../../model/User";
// import User from "@/model/User";

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
      _id: new ObjectId(session?.user?.id),
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

// import { NextRequest, NextResponse } from "next/server";
// import { options } from "../auth/[...nextauth]/options";
// import { getServerSession } from "next-auth";

// // Force dynamic rendering and server-side runtime
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// // Database provider type
// type DatabaseProvider = "mongoose" | "prisma";

// // Profile interfaces
// interface ProfileData {
//   id: string;
//   firstName?: string;
//   lastName?: string;
//   fullName?: string;
//   phone?: string;
//   profilePic?: string;
//   bio?: string;
//   website?: string;
//   gender?: string;
//   dob?: string;
//   address?: {
//     fullAddress?: string;
//     street?: string;
//     city?: string;
//     state?: string;
//     country?: string;
//     postalCode?: string;
//     zip?: string;
//   };
//   updatedAt?: Date;
//   createdAt?: Date;
//   [key: string]: any;
// }

// interface ProfileResult {
//   profile: ProfileData;
//   provider?: DatabaseProvider;
// }

// interface ProfileUpdateResult {
//   success: boolean;
//   profile: ProfileData;
//   provider?: DatabaseProvider;
// }

// // Mongoose profile operations
// const executeProfileOperationMongoose = async (
//   operation: "get" | "update",
//   userId: string,
//   updateData?: any,
//   unsetData?: any
// ): Promise<ProfileResult | ProfileUpdateResult> => {
//   try {
//     const { ObjectId } = await import("mongodb");
//     const User = (await import("@/model/User")).default;

//     if (operation === "get") {
//       const profile = await User.findOne({
//         _id: new ObjectId(userId),
//       }).select("-password");

//       if (!profile) {
//         throw new Error("Profile not found");
//       }

//       return {
//         profile: profile.toObject(),
//         provider: "mongoose",
//       };
//     } else {
//       // Update operation
//       if (!updateData && !unsetData) {
//         throw new Error("Update data required for update operation");
//       }

//       // Prepare the update operation
//       const updateOperation: any = {};
//       if (updateData && Object.keys(updateData).length > 0) {
//         updateOperation.$set = updateData;
//       }
//       if (unsetData && Object.keys(unsetData).length > 0) {
//         updateOperation.$unset = unsetData;
//       }

//       // Update the user profile
//       const updatedProfile = await User.findOneAndUpdate(
//         { _id: new ObjectId(userId) },
//         updateOperation,
//         {
//           new: true, // Return updated document
//           select: "-password", // Exclude password field
//           runValidators: true, // Run mongoose validators
//         }
//       );

//       if (!updatedProfile) {
//         throw new Error("Profile not found");
//       }

//       return {
//         success: true,
//         profile: updatedProfile.toObject(),
//         provider: "mongoose",
//       };
//     }
//   } catch (error) {
//     console.error("Mongoose profile operation error:", error);
//     throw error;
//   }
// };

// // Prisma profile operations
// const executeProfileOperationPrisma = async (
//   operation: "get" | "update",
//   userId: string,
//   updateData?: any,
//   unsetData?: any
// ): Promise<ProfileResult | ProfileUpdateResult> => {
//   let prisma;

//   try {
//     const prismaModule = await import("@/lib/prisma");
//     prisma = prismaModule.prisma;

//     if (operation === "get") {
//       const profile = await prisma.user.findUnique({
//         where: { id: userId },
//         select: {
//           id: true,
//           username: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           fullName: true,
//           phone: true,
//           profilePic: true,
//           bio: true,
//           website: true,
//           gender: true,
//           dob: true,
//           address: true,
//           createdAt: true,
//           updatedAt: true,
//           // Exclude password
//           password: false,
//         },
//       });

//       if (!profile) {
//         throw new Error("Profile not found");
//       }

//       return {
//         profile: profile as ProfileData,
//         provider: "prisma",
//       };
//     } else {
//       // Update operation
//       if (!updateData && !unsetData) {
//         throw new Error("Update data required for update operation");
//       }

//       // Handle unset operations by setting fields to null
//       const finalUpdateData = { ...updateData };

//       // Convert unset operations to null values for Prisma
//       if (unsetData) {
//         Object.keys(unsetData).forEach((field) => {
//           if (field.startsWith("address.")) {
//             // Handle nested address fields
//             const addressField = field.replace("address.", "");
//             if (!finalUpdateData.address) {
//               finalUpdateData.address = {};
//             }
//             finalUpdateData.address[addressField] = null;
//           } else {
//             finalUpdateData[field] = null;
//           }
//         });
//       }

//       const updatedProfile = await prisma.user.update({
//         where: { id: userId },
//         data: finalUpdateData,
//         select: {
//           id: true,
//           username: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           fullName: true,
//           phone: true,
//           profilePic: true,
//           bio: true,
//           website: true,
//           gender: true,
//           dob: true,
//           address: true,
//           createdAt: true,
//           updatedAt: true,
//           // Exclude password
//           password: false,
//         },
//       });

//       return {
//         success: true,
//         profile: updatedProfile as ProfileData,
//         provider: "prisma",
//       };
//     }
//   } catch (error) {
//     console.error("Prisma profile operation error:", error);
//     throw error;
//   } finally {
//     if (prisma) {
//       await prisma.$disconnect();
//     }
//   }
// };

// // Generic profile operation executor
// const executeProfileOperation = async (
//   provider: DatabaseProvider,
//   operation: "get" | "update",
//   userId: string,
//   updateData?: any,
//   unsetData?: any
// ): Promise<ProfileResult | ProfileUpdateResult> => {
//   switch (provider) {
//     case "prisma":
//       return await executeProfileOperationPrisma(
//         operation,
//         userId,
//         updateData,
//         unsetData
//       );
//     case "mongoose":
//     default:
//       return await executeProfileOperationMongoose(
//         operation,
//         userId,
//         updateData,
//         unsetData
//       );
//   }
// };

// // Automatic fallback system for profile operations
// const executeProfileOperationWithFallback = async (
//   operation: "get" | "update",
//   userId: string,
//   updateData?: any,
//   unsetData?: any
// ): Promise<ProfileResult | ProfileUpdateResult> => {
//   const preferredProvider =
//     (process.env.DATABASE_PROVIDER?.toLowerCase() as DatabaseProvider) ||
//     "mongoose";

//   try {
//     console.log(`👤 Attempting profile ${operation} with ${preferredProvider}`);
//     return await executeProfileOperation(
//       preferredProvider,
//       operation,
//       userId,
//       updateData,
//       unsetData
//     );
//   } catch (error) {
//     console.error(
//       `❌ Profile ${operation} failed with ${preferredProvider}:`,
//       error
//     );

//     // Try alternative provider
//     const alternativeProvider: DatabaseProvider =
//       preferredProvider === "mongoose" ? "prisma" : "mongoose";

//     try {
//       console.log(
//         `🔄 Retrying profile ${operation} with ${alternativeProvider}`
//       );
//       return await executeProfileOperation(
//         alternativeProvider,
//         operation,
//         userId,
//         updateData,
//         unsetData
//       );
//     } catch (fallbackError) {
//       console.error(
//         `❌ Profile ${operation} also failed with ${alternativeProvider}:`,
//         fallbackError
//       );
//       throw new Error(
//         `Both database providers failed for profile ${operation}`
//       );
//     }
//   }
// };

// // Helper functions for validation
// function isValidUrl(string: string): boolean {
//   try {
//     new URL(string);
//     return true;
//   } catch (_) {
//     // Check if it's a relative URL or domain without protocol
//     const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
//     return domainRegex.test(string);
//   }
// }

// function isValidDate(dateString: string): boolean {
//   const date = new Date(dateString);
//   return date instanceof Date && !isNaN(date.getTime());
// }

// export async function GET(req: NextRequest): Promise<NextResponse> {
//   try {
//     const session = await getServerSession(options);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     console.log(`👤 Fetching profile for user: ${session.user.id}`);

//     // Execute profile fetch with automatic fallback
//     const result = (await executeProfileOperationWithFallback(
//       "get",
//       session.user.id
//     )) as ProfileResult;

//     console.log(`✅ Profile fetched successfully using ${result.provider}`);

//     return NextResponse.json(
//       {
//         profile: result.profile,
//         // Optional: include provider info for debugging (remove in production)
//         ...(process.env.NODE_ENV === "development" && {
//           provider: result.provider,
//         }),
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("💥 Profile retrieval error:", error);

//     // Enhanced error logging
//     console.error("Profile fetch error details:", {
//       message: error instanceof Error ? error.message : "Unknown error",
//       stack: error instanceof Error ? error.stack : undefined,
//       timestamp: new Date().toISOString(),
//     });

//     if (error instanceof Error && error.message === "Profile not found") {
//       return NextResponse.json({ error: "Profile not found" }, { status: 404 });
//     }

//     return NextResponse.json(
//       {
//         error: "Failed to retrieve profile",
//         // Include additional debug info in development
//         ...(process.env.NODE_ENV === "development" && {
//           debug: {
//             message: error instanceof Error ? error.message : "Unknown error",
//             timestamp: new Date().toISOString(),
//           },
//         }),
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function PATCH(req: NextRequest): Promise<NextResponse> {
//   try {
//     const session = await getServerSession(options);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await req.json();

//     // Define allowed fields for update
//     const allowedFields = [
//       "firstName",
//       "lastName",
//       "fullName",
//       "phone",
//       "profilePic",
//       "bio",
//       "website",
//       "gender",
//       "dob",
//       "address",
//     ];

//     // Extract and validate update data
//     const updateData: any = {};
//     const unsetData: any = {}; // Fields to unset (clear)

//     // Handle simple fields
//     allowedFields.forEach((field) => {
//       if (field in body && body[field] !== undefined) {
//         const value = body[field];

//         // Handle empty strings and null values - decide whether to clear or skip
//         if (value === "" || value === null) {
//           // For optional fields, we'll unset them to clear the value
//           if (["phone", "bio", "website", "gender", "dob"].includes(field)) {
//             unsetData[field] = 1;
//           }
//           // Skip required fields like firstName, lastName, fullName if empty
//           return;
//         }

//         // Special validation for specific fields
//         if (field === "phone" && value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
//           throw new Error("Invalid phone number format");
//         }

//         if (field === "website" && value && !isValidUrl(value)) {
//           throw new Error("Invalid website URL format");
//         }

//         if (field === "dob" && value && !isValidDate(value)) {
//           throw new Error("Invalid date of birth format");
//         }

//         updateData[field] = value;
//       }
//     });

//     // Handle address object separately with validation
//     if (body.address && typeof body.address === "object") {
//       const addressFields = [
//         "fullAddress",
//         "street",
//         "city",
//         "state",
//         "country",
//         "postalCode",
//         "zip",
//       ];

//       const addressData: any = {};
//       const addressUnsetData: any = {};

//       addressFields.forEach((field) => {
//         if (field in body.address && body.address[field] !== undefined) {
//           const value = body.address[field];

//           // Handle empty strings and null values for address fields
//           if (value === "" || value === null) {
//             addressUnsetData[`address.${field}`] = 1;
//             return;
//           }

//           // Validate postal code and zip if provided
//           if ((field === "postalCode" || field === "zip") && value) {
//             if (!/^[A-Za-z0-9\s\-]+$/.test(value)) {
//               throw new Error(`Invalid ${field} format`);
//             }
//           }
//           addressData[field] = value;
//         }
//       });

//       if (Object.keys(addressData).length > 0) {
//         updateData.address = addressData;
//       }

//       // Add address unset operations
//       Object.assign(unsetData, addressUnsetData);
//     }

//     // Handle fullName logic when firstName or lastName changes
//     if (updateData.firstName || updateData.lastName) {
//       console.log("🔄 Handling fullName update in API");

//       // If both firstName and lastName are being updated
//       if (updateData.firstName && updateData.lastName) {
//         updateData.fullName = `${updateData.firstName} ${updateData.lastName}`;
//         console.log(
//           "✅ Both names updated, fullName set to:",
//           updateData.fullName
//         );
//       } else {
//         // If only one is being updated, fetch current user to get the other name
//         console.log("🔍 Only one name updated, fetching current user");
//         try {
//           const currentProfile = (await executeProfileOperationWithFallback(
//             "get",
//             session.user.id
//           )) as ProfileResult;

//           if (currentProfile.profile) {
//             const newFirstName =
//               updateData.firstName || currentProfile.profile.firstName;
//             const newLastName =
//               updateData.lastName || currentProfile.profile.lastName;
//             updateData.fullName = `${newFirstName} ${newLastName}`;
//             console.log("✅ fullName updated to:", updateData.fullName);
//           }
//         } catch (error) {
//           console.error(
//             "❌ Error fetching current user for fullName update:",
//             error
//           );
//         }
//       }
//     }

//     // Check if there's anything to update
//     if (
//       Object.keys(updateData).length === 0 &&
//       Object.keys(unsetData).length === 0
//     ) {
//       return NextResponse.json(
//         { error: "No valid fields to update" },
//         { status: 400 }
//       );
//     }

//     // Add timestamp for last update
//     updateData.updatedAt = new Date();

//     console.log(`👤 Updating profile for user: ${session.user.id}`);

//     // Execute profile update with automatic fallback
//     const result = (await executeProfileOperationWithFallback(
//       "update",
//       session.user.id,
//       updateData,
//       unsetData
//     )) as ProfileUpdateResult;

//     console.log(`✅ Profile updated successfully using ${result.provider}`);

//     return NextResponse.json(
//       {
//         message: "Profile updated successfully",
//         profile: result.profile,
//         // Optional: include provider info for debugging (remove in production)
//         ...(process.env.NODE_ENV === "development" && {
//           provider: result.provider,
//         }),
//       },
//       { status: 200 }
//     );
//   } catch (error: any) {
//     console.error("💥 Profile update error:", error);

//     // Enhanced error logging
//     console.error("Profile update error details:", {
//       message: error instanceof Error ? error.message : "Unknown error",
//       stack: error instanceof Error ? error.stack : undefined,
//       timestamp: new Date().toISOString(),
//     });

//     // Handle validation errors
//     if (error instanceof Error && error.message.includes("Invalid")) {
//       return NextResponse.json({ error: error.message }, { status: 400 });
//     }

//     // Handle MongoDB validation errors
//     if (error.name === "ValidationError") {
//       return NextResponse.json(
//         { error: "Validation failed", details: error.message },
//         { status: 400 }
//       );
//     }

//     if (error instanceof Error && error.message === "Profile not found") {
//       return NextResponse.json({ error: "Profile not found" }, { status: 404 });
//     }

//     return NextResponse.json(
//       {
//         error: "Failed to update profile",
//         // Include additional debug info in development
//         ...(process.env.NODE_ENV === "development" && {
//           debug: {
//             message: error instanceof Error ? error.message : "Unknown error",
//             timestamp: new Date().toISOString(),
//           },
//         }),
//       },
//       { status: 500 }
//     );
//   }
// }

// // Optional: Health check endpoint for profile operations
// export async function HEAD(req: NextRequest): Promise<NextResponse> {
//   try {
//     const session = await getServerSession(options);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Quick health check - just try to fetch profile
//     const result = (await executeProfileOperationWithFallback(
//       "get",
//       session.user.id
//     )) as ProfileResult;

//     return NextResponse.json({
//       status: "healthy",
//       provider: result.provider,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     return NextResponse.json(
//       {
//         status: "error",
//         message: "Profile operations failing",
//         error: error instanceof Error ? error.message : "Unknown error",
//         timestamp: new Date().toISOString(),
//       },
//       { status: 503 }
//     );
//   }
// }


