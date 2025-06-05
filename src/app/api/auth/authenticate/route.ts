
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/app/lib/mongodb";
import { dbConnect } from "@/app/lib/mongoose";
import User from "@/model/User";
import { prisma } from "@/lib/prisma";
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

// export async function POST(req: NextRequest) {
//   try {
//     const { username, password } = await req.json();

//     // console.log("🔍 API: Authenticating user:", username);

//     if (!username || !password) {
//       return NextResponse.json(
//         { success: false, error: "Username and password required" },
//         { status: 400 }
//       );
//     }

//     // Find user by username using Prisma
//     const user = await prisma.user.findUnique({
//       where: {
//         username: username.trim(),
//       },
//       // Include password field (if it's excluded by default in your schema)
//       select: {
//         id: true,
//         username: true,
//         email: true,
//         firstName: true,
//         lastName: true,
//         fullName: true,
//         role: true,
//         profilePic: true,
//         password: true, // Include password for verification
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     if (!user) {
//       // console.log("❌ API: User not found:", username);
//       return NextResponse.json(
//         { success: false, error: "Invalid credentials" },
//         { status: 401 }
//       );
//     }

//     // console.log("👤 API: User found, verifying password");

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       // console.log("❌ API: Password mismatch");
//       return NextResponse.json(
//         { success: false, error: "Invalid credentials" },
//         { status: 401 }
//       );
//     }

//     // console.log("✅ API: Password verified successfully");

//     // Remove password from user object before returning
//     const { password: _password, ...userWithoutPassword } = user;

//     // console.log("👤 API: Final User", userWithoutPassword);

//     return NextResponse.json({
//       success: true,
//       user: userWithoutPassword,
//     });
//   } catch (error) {
//     console.error("💥 API: Authentication error:", error);
//     return NextResponse.json(
//       { success: false, error: "Internal server error" },
//       { status: 500 }
//     );
//   } finally {
//     // Clean up Prisma client connection
//     await prisma.$disconnect();
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import { DatabaseProviderSwitcher } from "../../health/database/route";

// // Database provider type
// type DatabaseProvider = "mongoose" | "prisma";

// interface AuthResult {
//   success: boolean;
//   user?: any;
//   error?: string;
//   status: number;
//   provider?: DatabaseProvider;
// }

// // Mongoose/MongoDB authentication
// const authenticateWithMongoose = async (
//   username: string,
//   password: string
// ): Promise<AuthResult> => {
//   try {
//     const { dbConnect } = await import("@/app/lib/mongoose");
//     const User = (await import("@/model/User")).default;

//     await dbConnect();

//     const user = await User.findOne({
//       username: username.trim(),
//     }).select("+password");

//     if (!user) {
//       return {
//         success: false,
//         error: "Invalid credentials",
//         status: 401,
//         provider: "mongoose",
//       };
//     }

//     // Check password
//     const hashedPassword =
//       typeof user.password === "string"
//         ? user.password
//         : user.password.toString();

//     const isMatch = await bcrypt.compare(password, hashedPassword);

//     if (!isMatch) {
//       return {
//         success: false,
//         error: "Invalid credentials",
//         status: 401,
//         provider: "mongoose",
//       };
//     }

//     // Convert to plain object and remove password
//     const userObj = user.toObject();
//     const { password: _password, ...userWithoutPassword } = userObj;

//     return {
//       success: true,
//       user: userWithoutPassword,
//       status: 200,
//       provider: "mongoose",
//     };
//   } catch (error) {
//     console.error("Mongoose authentication error:", error);
//     throw error;
//   }
// };

// // Prisma authentication
// const authenticateWithPrisma = async (
//   username: string,
//   password: string
// ): Promise<AuthResult> => {
//   let prisma;

//   try {
//     const prismaModule = await import("@/lib/prisma");
//     prisma = prismaModule.prisma;

//     const user = await prisma.user.findUnique({
//       where: {
//         username: username.trim(),
//       },
//       select: {
//         id: true,
//         username: true,
//         email: true,
//         firstName: true,
//         lastName: true,
//         fullName: true,
//         role: true,
//         profilePic: true,
//         password: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     if (!user) {
//       return {
//         success: false,
//         error: "Invalid credentials",
//         status: 401,
//         provider: "prisma",
//       };
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return {
//         success: false,
//         error: "Invalid credentials",
//         status: 401,
//         provider: "prisma",
//       };
//     }

//     // Remove password from user object
//     const { password: _password, ...userWithoutPassword } = user;

//     return {
//       success: true,
//       user: userWithoutPassword,
//       status: 200,
//       provider: "prisma",
//     };
//   } catch (error) {
//     console.error("Prisma authentication error:", error);
//     throw error;
//   } finally {
//     // Clean up Prisma client connection
//     if (prisma) {
//       await prisma.$disconnect();
//     }
//   }
// };

// // Authentication operation that can be executed with any provider
// const performAuthentication = async (
//   provider: DatabaseProvider,
//   username: string,
//   password: string
// ): Promise<AuthResult> => {
//   switch (provider) {
//     case "prisma":
//       return await authenticateWithPrisma(username, password);
//     case "mongoose":
//     default:
//       return await authenticateWithMongoose(username, password);
//   }
// };

// export async function POST(req: NextRequest) {
//   try {
//     const { username, password } = await req.json();

//     // Validate input
//     if (!username || !password) {
//       return NextResponse.json(
//         { success: false, error: "Username and password required" },
//         { status: 400 }
//       );
//     }

//     console.log(`🔍 Authenticating user: ${username}`);

//     // Use the automatic fallback system
//     const result = await DatabaseProviderSwitcher.executeWithFallback(
//       async (provider: DatabaseProvider) => {
//         console.log(`🔄 Attempting authentication with ${provider}`);
//         return await performAuthentication(provider, username, password);
//       }
//     );

//     console.log(
//       `✅ Authentication ${result.success ? "successful" : "failed"} using ${
//         result.provider
//       }`
//     );

//     // Return the result
//     return NextResponse.json(
//       {
//         success: result.success,
//         ...(result.success ? { user: result.user } : { error: result.error }),
//         // Optional: include provider info for debugging (remove in production)
//         ...(process.env.NODE_ENV === "development" && {
//           provider: result.provider,
//         }),
//       },
//       { status: result.status }
//     );
//   } catch (error) {
//     console.error("💥 API: Authentication error:", error);

//     // Enhanced error logging for debugging
//     console.error("Error details:", {
//       message: error instanceof Error ? error.message : "Unknown error",
//       stack: error instanceof Error ? error.stack : undefined,
//       timestamp: new Date().toISOString(),
//     });

//     return NextResponse.json(
//       {
//         success: false,
//         error: "Internal server error",
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

// // Optional: Add a simple health check endpoint in the same file
// export async function GET() {
//   try {
//     const { DatabaseHealthChecker } = await import("@/lib/dbHealthCheck");
//     const health = await DatabaseHealthChecker.checkCurrentProvider();

//     return NextResponse.json(
//       {
//         status: health.status,
//         provider: health.provider,
//         message: health.message,
//         responseTime: health.responseTime,
//         timestamp: new Date().toISOString(),
//       },
//       {
//         status: health.status === "healthy" ? 200 : 503,
//       }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       {
//         status: "error",
//         message: "Health check failed",
//         error: error instanceof Error ? error.message : "Unknown error",
//         timestamp: new Date().toISOString(),
//       },
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import bcrypt from "bcryptjs";

// // Database provider type
// type DatabaseProvider = "mongoose" | "prisma";

// // Get database provider from environment variable
// const getDatabaseProvider = (): DatabaseProvider => {
//   const provider = process.env.DATABASE_PROVIDER?.toLowerCase();
//   if (provider === "mongoose" || provider === "prisma") {
//     return provider;
//   }
//   // Default to mongoose if not specified
//   return "mongoose";
// };

// // Mongoose/MongoDB approach
// const authenticateWithMongoose = async (username: string, password: string) => {
//   const { dbConnect } = await import("@/app/lib/mongoose");
//   const User = (await import("@/model/User")).default;

//   await dbConnect();

//   const user = await User.findOne({
//     username: username.trim(),
//   }).select("+password");

//   if (!user) {
//     return { success: false, error: "Invalid credentials", status: 401 };
//   }

//   // Check password
//   const hashedPassword =
//     typeof user.password === "string"
//       ? user.password
//       : user.password.toString();

//   const isMatch = await bcrypt.compare(password, hashedPassword);

//   if (!isMatch) {
//     return { success: false, error: "Invalid credentials", status: 401 };
//   }

//   // Convert to plain object and remove password
//   const userObj = user.toObject();
//   const { password: _password, ...userWithoutPassword } = userObj;

//   return {
//     success: true,
//     user: userWithoutPassword,
//     status: 200,
//   };
// };

// // Prisma approach
// const authenticateWithPrisma = async (username: string, password: string) => {
//   const { prisma } = await import("@/lib/prisma");

//   try {
//     const user = await prisma.user.findUnique({
//       where: {
//         username: username.trim(),
//       },
//       select: {
//         id: true,
//         username: true,
//         email: true,
//         firstName: true,
//         lastName: true,
//         fullName: true,
//         role: true,
//         profilePic: true,
//         password: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     if (!user) {
//       return { success: false, error: "Invalid credentials", status: 401 };
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return { success: false, error: "Invalid credentials", status: 401 };
//     }

//     // Remove password from user object
//     const { password: _password, ...userWithoutPassword } = user;

//     return {
//       success: true,
//       user: userWithoutPassword,
//       status: 200,
//     };
//   } finally {
//     // Clean up Prisma client connection
//     await prisma.$disconnect();
//   }
// };

// export async function POST(req: NextRequest) {
//   try {
//     const { username, password } = await req.json();

//     // Validate input
//     if (!username || !password) {
//       return NextResponse.json(
//         { success: false, error: "Username and password required" },
//         { status: 400 }
//       );
//     }

//     // Get database provider from environment
//     const databaseProvider = getDatabaseProvider();

//     console.log(`🔄 Using database provider: ${databaseProvider}`);

//     let result;

//     // Switch between database providers
//     switch (databaseProvider) {
//       case "prisma":
//         console.log("🔍 Authenticating with Prisma...");
//         result = await authenticateWithPrisma(username, password);
//         break;

//       case "mongoose":
//       default:
//         console.log("🔍 Authenticating with Mongoose...");
//         result = await authenticateWithMongoose(username, password);
//         break;
//     }

//     // Return the result
//     return NextResponse.json(
//       {
//         success: result.success,
//         ...(result.success ? { user: result.user } : { error: result.error }),
//       },
//       { status: result.status }
//     );
//   } catch (error) {
//     console.error("💥 API: Authentication error:", error);

//     // Enhanced error logging for debugging
//     console.error("Error details:", {
//       message: error instanceof Error ? error.message : "Unknown error",
//       stack: error instanceof Error ? error.stack : undefined,
//       provider: getDatabaseProvider(),
//     });

//     return NextResponse.json(
//       { success: false, error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// ANOTHER SET

// app/api/auth/authenticate/route.ts
