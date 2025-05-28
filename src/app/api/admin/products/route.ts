import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { options } from "../../auth/[...nextauth]/options";
import MongoDBSingleton from "@/app/lib/mongo-instance";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, options);

  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const db = await MongoDBSingleton.getInstance().connect();
  const collection = db.collection("products");

  switch (req.method) {
    case "GET":
      try {
        const products = await collection.find({}).toArray();
        const serializedProducts = products.map((product) => ({
          ...product,
          _id: product._id.toString(),
        }));
        res.status(200).json(serializedProducts);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
      }
      break;

    case "POST":
      try {
        const { name, description, price, category, image, stock, featured } =
          req.body;

        const newProduct = {
          name,
          description,
          price: parseFloat(price),
          category,
          image: image || "/images/default-product.jpg",
          stock: parseInt(stock) || 0,
          featured: featured || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await collection.insertOne(newProduct);
        res.status(201).json({
          message: "Product created successfully",
          productId: result.insertedId.toString(),
        });
      } catch (error) {
        res.status(500).json({ error: "Failed to create product" });
      }
      break;

    case "PUT":
      try {
        const {
          _id,
          name,
          description,
          price,
          category,
          image,
          stock,
          featured,
        } = req.body;

        if (!_id) {
          return res.status(400).json({ error: "Product ID is required" });
        }

        const updateData = {
          name,
          description,
          price: parseFloat(price),
          category,
          image,
          stock: parseInt(stock),
          featured: featured || false,
          updatedAt: new Date(),
        };

        const result = await collection.updateOne(
          { _id: new ObjectId(_id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ message: "Product updated successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to update product" });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query;

        const result = await collection.deleteOne({
          _id: new ObjectId(id as string),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete product" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
