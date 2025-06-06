import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: true,
      },
    });

    // Transform Prisma cart items to match Zustand store format
    const cartItems =
      userCart?.items?.map((item: any) => ({
        productId: item.productId,
        key: item.key,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        title: item.title, // Changed from 'name' to 'title'
        image: item.image,
      })) || [];

    return NextResponse.json({
      cart: cartItems,
      total: userCart?.total || 0,
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

    console.log("Cart data received:", cart);

    // Validate input
    if (!Array.isArray(cart) || typeof total !== "number") {
      return NextResponse.json(
        { error: "Invalid cart data format" },
        { status: 400 }
      );
    }

    // Normalize cart items to handle both old and new formats
    // const normalizedCart = cart
    //   .map((item) => {
    //     // Handle both old format (id, name) and new format (productId, key, size, title)
    //     const productId = item.productId || item.id;
    //     const title = item.title || item.name;
    //     const key = item.key || `${productId}-${item.size || "default"}`;
    //     const size = item.size || "default";

    //     // Skip items that don't have essential data
    //     if (!productId || !title) {
    //       console.warn("Skipping invalid cart item:", item);
    //       return null;
    //     }

    //     return {
    //       productId: String(productId),
    //       key: String(key),
    //       size: String(size),
    //       title: String(title),
    //       price: Number(item.price),
    //       quantity: Number(item.quantity),
    //       image: String(item.image || ""),
    //     };
    //   })
    //   .filter(Boolean); // Remove null items

    // console.log("Normalized cart items:", normalizedCart);

    await prisma.cart.upsert({
      where: { userId: session.user.id },
      update: {
        total,
        updatedAt: new Date(),
        items: {
          deleteMany: {}, // Clear existing items
          create: cart,
          //   create: normalizedCart,
        },
      },
      create: {
        userId: session.user.id,
        total,
        items: {
          create: cart,
        //   create: normalizedCart,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing cart:", error);
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}
