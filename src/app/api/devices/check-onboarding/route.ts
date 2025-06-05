import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { ObjectId } from "mongodb";
import Device from "@/model/Device";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imei } = body;

    if (!imei) {
      return NextResponse.json({ error: "IMEI is required" }, { status: 400 });
    }

    // console.log("lll", `${session?.user?.id}+${imei}`);
    
    const device = await Device.findOne({
      user: new ObjectId(session?.user?.id),
      imei,
    });

    // console.log('dfd', device)


    return NextResponse.json(
      {
        isOnboarded: device?.isOnboarded || false,
        deviceExists: !!device,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Check onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to check device onboarding" },
      { status: 500 }
    );
  }
}
