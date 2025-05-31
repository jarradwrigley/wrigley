// import { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth/next";
// import { ObjectId } from "mongodb";
// import { options } from "../../auth/[...nextauth]/options";
// import MongoDBSingleton from "@/app/lib/mongo-instance";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const session = await getServerSession(req, res, options);

//   if (!session || session.user.role !== "admin") {
//     return res.status(403).json({ error: "Access denied" });
//   }

//   const db = await MongoDBSingleton.getInstance().connect();
//   const collection = db.collection("tours");

//   switch (req.method) {
//     case "GET":
//       try {
//         const tours = await collection.find({}).toArray();
//         const serializedTours = tours.map((tour) => ({
//           ...tour,
//           _id: tour._id.toString(),
//         }));
//         res.status(200).json(serializedTours);
//       } catch (error) {
//         res.status(500).json({ error: "Failed to fetch tours" });
//       }
//       break;

//     case "POST":
//       try {
//         const { date, mon, title, location, desc, link, price, venue } =
//           req.body;

//         const newTour = {
//           date: parseInt(date),
//           mon,
//           title,
//           location,
//           desc,
//           link,
//           price: price ? parseFloat(price) : 0,
//           venue: venue || "",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         };

//         const result = await collection.insertOne(newTour);
//         res.status(201).json({
//           message: "Tour created successfully",
//           tourId: result.insertedId.toString(),
//         });
//       } catch (error) {
//         res.status(500).json({ error: "Failed to create tour" });
//       }
//       break;

//     case "PUT":
//       try {
//         const { _id, date, mon, title, location, desc, link, price, venue } =
//           req.body;

//         if (!_id) {
//           return res.status(400).json({ error: "Tour ID is required" });
//         }

//         const updateData = {
//           date: parseInt(date),
//           mon,
//           title,
//           location,
//           desc,
//           link,
//           price: price ? parseFloat(price) : 0,
//           venue: venue || "",
//           updatedAt: new Date(),
//         };

//         const result = await collection.updateOne(
//           { _id: new ObjectId(_id) },
//           { $set: updateData }
//         );

//         if (result.matchedCount === 0) {
//           return res.status(404).json({ error: "Tour not found" });
//         }

//         res.status(200).json({ message: "Tour updated successfully" });
//       } catch (error) {
//         res.status(500).json({ error: "Failed to update tour" });
//       }
//       break;

//     case "DELETE":
//       try {
//         const { id } = req.query;

//         const result = await collection.deleteOne({
//           _id: new ObjectId(id as string),
//         });

//         if (result.deletedCount === 0) {
//           return res.status(404).json({ error: "Tour not found" });
//         }

//         res.status(200).json({ message: "Tour deleted successfully" });
//       } catch (error) {
//         res.status(500).json({ error: "Failed to delete tour" });
//       }
//       break;

//     default:
//       res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
//       res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import MongoDBSingleton from "@/app/lib/mongo-instance";
import { options } from "../../auth/[...nextauth]/options";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const db = await MongoDBSingleton.getInstance().connect();
    const toursCollection = db.collection("tours");

    try {
      const tours = await toursCollection.find({}).toArray();
      const sanitizedTours = tours.map((tour) => ({
        ...tour,
        _id: tour._id.toString(),
      }));

      console.log("[API] Fetched tours:", sanitizedTours.length);

      return NextResponse.json({
        success: true,
        data: sanitizedTours,
        meta: {
          loadTime: 0,
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        },
      });
    } catch (dbError) {
      console.error("[API Error] Failed to fetch tours:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch tours" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API Error] Failed to fetch tours data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}