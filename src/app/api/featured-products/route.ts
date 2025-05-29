import clientPromise from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const productsCollection = db.collection("products");

    const products = await productsCollection.find({}).toArray();

    // Convert MongoDB ObjectId to string
    const formattedProducts = products.map((product: any) => ({
      ...product,
      _id: product._id.toString(),
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
