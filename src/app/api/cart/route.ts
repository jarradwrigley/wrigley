import { getServerSession } from "next-auth";
import clientPromise from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";

export async function GET() {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const cartCollection = db.collection("carts");

    const cart = await cartCollection.findOne({ userId: session?.user?.id });

    return NextResponse.json({
      cart: cart?.items || [],
      total: cart?.total || 0,
    });
  } catch (error) {
    console.error("Error fetching user cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cart, total } = await req.json();

    const client = await clientPromise;
    const db = client.db();
    const cartCollection = db.collection("carts");

    await cartCollection.updateOne(
      { userId: session.user.id },
      {
        $set: {
          items: cart,
          total,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing cart:", error);
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}

// import { getServerSession } from "next-auth";
// import { NextResponse } from "next/server";
// import { options } from "../auth/[...nextauth]/options";

// // Database provider type
// type DatabaseProvider = "mongoose" | "prisma";

// // Cart interfaces
// interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   image?: string;
//   [key: string]: any;
// }

// interface CartResult {
//   cart: CartItem[];
//   total: number;
//   provider?: DatabaseProvider;
// }

// interface CartUpdateResult {
//   success: boolean;
//   provider?: DatabaseProvider;
// }

// // MongoDB/Mongoose cart operations
// const executeCartOperationMongoose = async (
//   operation: "get" | "update",
//   userId: string,
//   cart?: CartItem[],
//   total?: number
// ): Promise<CartResult | CartUpdateResult> => {
//   try {
//     if (operation === "get") {
//       const clientPromise = (await import("@/app/lib/mongodb")).default;
//       const client = await clientPromise;
//       const db = client.db();
//       const cartCollection = db.collection("carts");

//       const userCart = await cartCollection.findOne({ userId });

//       return {
//         cart: userCart?.items || [],
//         total: userCart?.total || 0,
//         provider: "mongoose",
//       };
//     } else {
//       // Update operation
//       const clientPromise = (await import("@/app/lib/mongodb")).default;
//       const client = await clientPromise;
//       const db = client.db();
//       const cartCollection = db.collection("carts");

//       await cartCollection.updateOne(
//         { userId },
//         {
//           $set: {
//             items: cart,
//             total,
//             updatedAt: new Date(),
//           },
//         },
//         { upsert: true }
//       );

//       return { success: true, provider: "mongoose" };
//     }
//   } catch (error) {
//     console.error("Mongoose cart operation error:", error);
//     throw error;
//   }
// };

// // Prisma cart operations
// const executeCartOperationPrisma = async (
//   operation: "get" | "update",
//   userId: string,
//   cart?: CartItem[],
//   total?: number
// ): Promise<CartResult | CartUpdateResult> => {
//   let prisma;

//   try {
//     const prismaModule = await import("@/lib/prisma");
//     prisma = prismaModule.prisma;

//     if (operation === "get") {
//       const userCart = await prisma.cart.findUnique({
//         where: { userId },
//         include: {
//           items: true,
//         },
//       });

//       // Transform Prisma cart items to match expected format
//       const cartItems =
//         userCart?.items?.map((item: any) => ({
//           id: item.productId,
//           name: item.name,
//           price: item.price,
//           quantity: item.quantity,
//           image: item.image,
//         })) || [];

//       return {
//         cart: cartItems,
//         total: userCart?.total || 0,
//         provider: "prisma",
//       };
//     } else {
//       // Update operation
//       if (!cart || total === undefined) {
//         throw new Error("Cart data required for update operation");
//       }

//       await prisma.cart.upsert({
//         where: { userId },
//         update: {
//           total,
//           updatedAt: new Date(),
//           items: {
//             deleteMany: {},
//             create: cart.map((item) => ({
//               productId: item.id,
//               name: item.name,
//               price: item.price,
//               quantity: item.quantity,
//               image: item.image,
//             })),
//           },
//         },
//         create: {
//           userId,
//           total,
//           items: {
//             create: cart.map((item) => ({
//               productId: item.id,
//               name: item.name,
//               price: item.price,
//               quantity: item.quantity,
//               image: item.image,
//             })),
//           },
//         },
//       });

//       return { success: true, provider: "prisma" };
//     }
//   } catch (error) {
//     console.error("Prisma cart operation error:", error);
//     throw error;
//   } finally {
//     if (prisma) {
//       await prisma.$disconnect();
//     }
//   }
// };

// // Generic cart operation executor
// const executeCartOperation = async (
//   provider: DatabaseProvider,
//   operation: "get" | "update",
//   userId: string,
//   cart?: CartItem[],
//   total?: number
// ): Promise<CartResult | CartUpdateResult> => {
//   switch (provider) {
//     case "prisma":
//       return await executeCartOperationPrisma(operation, userId, cart, total);
//     case "mongoose":
//     default:
//       return await executeCartOperationMongoose(operation, userId, cart, total);
//   }
// };

// // Automatic fallback system for cart operations
// const executeCartOperationWithFallback = async (
//   operation: "get" | "update",
//   userId: string,
//   cart?: CartItem[],
//   total?: number
// ): Promise<CartResult | CartUpdateResult> => {
//   const preferredProvider =
//     (process.env.DATABASE_PROVIDER?.toLowerCase() as DatabaseProvider) ||
//     "mongoose";

//   try {
//     console.log(`🛒 Attempting cart ${operation} with ${preferredProvider}`);
//     return await executeCartOperation(
//       preferredProvider,
//       operation,
//       userId,
//       cart,
//       total
//     );
//   } catch (error) {
//     console.error(
//       `❌ Cart ${operation} failed with ${preferredProvider}:`,
//       error
//     );

//     // Try alternative provider
//     const alternativeProvider: DatabaseProvider =
//       preferredProvider === "mongoose" ? "prisma" : "mongoose";

//     try {
//       console.log(`🔄 Retrying cart ${operation} with ${alternativeProvider}`);
//       return await executeCartOperation(
//         alternativeProvider,
//         operation,
//         userId,
//         cart,
//         total
//       );
//     } catch (fallbackError) {
//       console.error(
//         `❌ Cart ${operation} also failed with ${alternativeProvider}:`,
//         fallbackError
//       );
//       throw new Error(`Both database providers failed for cart ${operation}`);
//     }
//   }
// };

// export async function GET() {
//   try {
//     const session = await getServerSession(options);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     console.log(`🛒 Fetching cart for user: ${session.user.id}`);

//     // Execute cart fetch with automatic fallback
//     const result = (await executeCartOperationWithFallback(
//       "get",
//       session.user.id
//     )) as CartResult;

//     console.log(`✅ Cart fetched successfully using ${result.provider}`);

//     return NextResponse.json({
//       cart: result.cart,
//       total: result.total,
//       // Optional: include provider info for debugging (remove in production)
//       ...(process.env.NODE_ENV === "development" && {
//         provider: result.provider,
//       }),
//     });
//   } catch (error) {
//     console.error("💥 Error fetching user cart:", error);

//     // Enhanced error logging
//     console.error("Cart fetch error details:", {
//       message: error instanceof Error ? error.message : "Unknown error",
//       stack: error instanceof Error ? error.stack : undefined,
//       timestamp: new Date().toISOString(),
//     });

//     return NextResponse.json(
//       {
//         error: "Failed to fetch cart",
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

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(options);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { cart, total } = await req.json();

//     // Validate input
//     if (!Array.isArray(cart) || typeof total !== "number") {
//       return NextResponse.json(
//         { error: "Invalid cart data format" },
//         { status: 400 }
//       );
//     }

//     console.log(`🛒 Syncing cart for user: ${session.user.id}`);

//     // Execute cart update with automatic fallback
//     const result = (await executeCartOperationWithFallback(
//       "update",
//       session.user.id,
//       cart,
//       total
//     )) as CartUpdateResult;

//     console.log(`✅ Cart synced successfully using ${result.provider}`);

//     return NextResponse.json({
//       success: result.success,
//       // Optional: include provider info for debugging (remove in production)
//       ...(process.env.NODE_ENV === "development" && {
//         provider: result.provider,
//       }),
//     });
//   } catch (error) {
//     console.error("💥 Error syncing cart:", error);

//     // Enhanced error logging
//     console.error("Cart sync error details:", {
//       message: error instanceof Error ? error.message : "Unknown error",
//       stack: error instanceof Error ? error.stack : undefined,
//       timestamp: new Date().toISOString(),
//     });

//     return NextResponse.json(
//       {
//         error: "Failed to sync cart",
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

// // Optional: Health check endpoint for cart operations
// export async function HEAD() {
//   try {
//     const session = await getServerSession(options);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Quick health check - just try to fetch cart
//     const result = (await executeCartOperationWithFallback(
//       "get",
//       session.user.id
//     )) as CartResult;

//     return NextResponse.json({
//       status: "healthy",
//       provider: result.provider,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     return NextResponse.json(
//       {
//         status: "error",
//         message: "Cart operations failing",
//         error: error instanceof Error ? error.message : "Unknown error",
//         timestamp: new Date().toISOString(),
//       },
//       { status: 503 }
//     );
//   }
// }

// app/api/cart/route.ts
