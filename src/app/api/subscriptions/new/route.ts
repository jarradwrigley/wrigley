import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { options } from "../../auth/[...nextauth]/options";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function generateRandomString(length = 32): string {
  return crypto.randomBytes(length).toString("hex"); // 64 chars if length is 32
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// TypeScript interfaces
interface UploadedFile {
  secure_url: string;
  public_id: string;
  original_filename: string;
  format: string;
  bytes: number;
}

interface SubscriptionData {
  user: string;
  deviceName: string;
  imei: string;
  phoneNumber: string;
  email: string;
  subscriptionType: string;
  subscriptionCards: string[];
  subscriptionCardDetails: UploadedFile[];
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SavedSubscription extends SubscriptionData {
  _id: string;
}

interface CloudinaryUploadOptions {
  folder?: string;
  resource_type?: string;
  public_id?: string;
  tags?: string[];
}

function getSubscriptionDuration(subscriptionType: string): number {
  const SUBSCRIPTION_TYPES: Record<string, number> = {
    "mobile-v4-basic": 30,
    "mobile-v4-premium": 60,
    "mobile-v4-enterprise": 90,
    "mobile-v5-basic": 30,
    "mobile-v5-premium": 60,
    "full-suite-basic": 60,
    "full-suite-premium": 90,
  };

  return SUBSCRIPTION_TYPES[subscriptionType] || 30;
}
  

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = async (
  buffer: Buffer,
  filename: string,
  options: any = {}
): Promise<UploadApiResponse> => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "subscription_cards",
            resource_type: "auto",
            public_id: `${Date.now()}_${filename}`,
            tags: ["subscription_card"],
            ...options,
          },
          (error: any, result: UploadApiResponse | undefined) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error("Upload failed"));
          }
        )
        .end(buffer);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

async function saveSubscriptionToDatabase(
  subscriptionData: SubscriptionData
): Promise<SavedSubscription> {
//   const existing = await Device.findOne({
//     user: new ObjectId(subscriptionData.user),
//     imei: subscriptionData.imei,
//   });
 const existing = await prisma.device.findUnique({
   where: { userId: subscriptionData.user, imei: subscriptionData.imei },
 });

  let newQueuedSubscription;

  if (existing) {
    // newQueuedSubscription = await Subscription.create({
    
    //   user: new ObjectId(subscriptionData.user),
    //   imei: subscriptionData.imei,
    //   status: "pending",
    //   subscriptionType: subscriptionData.subscriptionType,
    //   subscriptionCards: subscriptionData.subscriptionCards,
    //   phone: subscriptionData.phoneNumber,
    //   email: subscriptionData.email,
    //   deviceName: subscriptionData.deviceName || "Unnamed Device",
    // });

    newQueuedSubscription = await prisma.subscription.create({
      data: {
        userId: subscriptionData.user,
        imei: subscriptionData.imei,
        status: "PENDING",
        subscriptionType: subscriptionData.subscriptionType,
        subscriptionCards: subscriptionData.subscriptionCards,
        phone: subscriptionData.phoneNumber,
        email: subscriptionData.email,
        deviceName: subscriptionData.deviceName || "Unnamed Device",
      },
    });

    // return { ...subscriptionData, _id: newQueuedSubscription._id };
  } else {
    // const newDevice = await Device.create({
    //   user: new ObjectId(subscriptionData.user),
    //   imei: subscriptionData.imei,
    //   isOnboarded: false,
    //   totpSecret: generateRandomString(10),
    //   deviceName: subscriptionData.deviceName || "Unnamed Device",
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // });

    const newDevice = await prisma.device.create({
      data: {
        userId: subscriptionData.user,
        imei: subscriptionData.imei,
        isOnboarded: false,
        totpSecret: generateRandomString(10),
        deviceName: subscriptionData.deviceName || "Unnamed Device",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    newQueuedSubscription = await prisma.subscription.create({
      data: {
        userId: subscriptionData.user,
        imei: subscriptionData.imei,
        status: "PENDING",
        subscriptionType: subscriptionData.subscriptionType,
        subscriptionCards: subscriptionData.subscriptionCards,
        phone: subscriptionData.phoneNumber,
        email: subscriptionData.email,
        deviceName: subscriptionData.deviceName || "Unnamed Device",
      },
    });
  }

  // Replace with your actual database implementation
  // console.log("Saving subscription to database:", subscriptionData);
  return { ...subscriptionData, _id: newQueuedSubscription.id };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse form data using native Web API
    const formData = await request.formData();

    // Extract form fields
    const deviceName = formData.get("deviceName") as string;
    const imei = formData.get("imei") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const email = formData.get("email") as string;
    const subscriptionType = formData.get("subscriptionType") as string;

    // Validate required fields
    if (!deviceName || !imei || !phoneNumber || !email || !subscriptionType) {
      return NextResponse.json(
        {
          message: "Missing required fields",
          required: [
            "deviceName",
            "imei",
            "phoneNumber",
            "email",
            "subscriptionType",
          ],
        },
        { status: 400 }
      );
    }

    // Validate IMEI format (15 digits)
    if (!/^\d{15}$/.test(imei)) {
      return NextResponse.json(
        {
          message: "Invalid IMEI format. Must be 15 digits.",
        },
        { status: 400 }
      );
    }

    // Process uploaded files
    const uploadedFiles: UploadedFile[] = [];
    const subscriptionCards = formData.getAll("subscriptionCards") as File[];

    if (subscriptionCards.length === 0) {
      return NextResponse.json(
        {
          message: "At least one subscription card image is required",
        },
        { status: 400 }
      );
    }

    for (const file of subscriptionCards) {
      if (file instanceof File && file.size > 0) {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            {
              message: `File ${file.name} exceeds 5MB limit`,
            },
            { status: 400 }
          );
        }

        try {
          // Convert file to buffer
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Upload to Cloudinary
          const cloudinaryResponse = await uploadToCloudinary(
            buffer,
            file.name,
            {
              tags: ["subscription_card", session.user.id],
            }
          );

          uploadedFiles.push({
            secure_url: cloudinaryResponse.secure_url,
            public_id: cloudinaryResponse.public_id,
            original_filename: file.name,
            format: cloudinaryResponse.format,
            bytes: cloudinaryResponse.bytes,
          });
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          return NextResponse.json(
            {
              message: `Failed to upload file ${file.name}`,
            },
            { status: 500 }
          );
        }
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        {
          message: "No valid files were uploaded",
        },
        { status: 400 }
      );
    }

    // Calculate subscription dates
    const startDate = new Date();
    const subscriptionDuration = getSubscriptionDuration(subscriptionType);
    const endDate = new Date(
      startDate.getTime() + subscriptionDuration * 24 * 60 * 60 * 1000
    );

    // Create subscription object
    const subscriptionData: SubscriptionData = {
      user: session.user.id,
      deviceName,
      imei,
      phoneNumber,
      email,
      subscriptionType,
      subscriptionCards: uploadedFiles.map((file) => file.secure_url),
      subscriptionCardDetails: uploadedFiles,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to database
    const savedSubscription = await saveSubscriptionToDatabase(
      subscriptionData
    );

    // Send success response
    return NextResponse.json(
      {
        message: "Subscription created successfully",
        subscription: savedSubscription,
        uploadedFiles: uploadedFiles.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subscription creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";

    return NextResponse.json(
      {
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? errorMessage
            : "Something went wrong",
      },
      { status: 500 }
    );
  }
}
