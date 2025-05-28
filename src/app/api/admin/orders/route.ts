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
  const collection = db.collection("orders");

  switch (req.method) {
    case "GET":
      try {
        const orders = await collection.find({}).toArray();
        const serializedOrders = orders.map((order) => ({
          ...order,
          _id: order._id.toString(),
        }));
        res.status(200).json(serializedOrders);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
      }
      break;

    case "POST":
      try {
        const { userId, items, total, status, shippingAddress, paymentMethod } =
          req.body;

        const newOrder = {
          userId,
          items,
          total: parseFloat(total),
          status: status || "pending",
          shippingAddress,
          paymentMethod,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await collection.insertOne(newOrder);
        res.status(201).json({
          message: "Order created successfully",
          orderId: result.insertedId.toString(),
        });
      } catch (error) {
        res.status(500).json({ error: "Failed to create order" });
      }
      break;

    case "PUT":
      try {
        const { _id, status, shippingAddress, paymentMethod, notes } = req.body;

        if (!_id) {
          return res.status(400).json({ error: "Order ID is required" });
        }

        const updateData = {
          status,
          shippingAddress,
          paymentMethod,
          notes: notes || "",
          updatedAt: new Date(),
        };

        const result = await collection.updateOne(
          { _id: new ObjectId(_id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Order updated successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to update order" });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query;

        const result = await collection.deleteOne({
          _id: new ObjectId(id as string),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Order deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete order" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
