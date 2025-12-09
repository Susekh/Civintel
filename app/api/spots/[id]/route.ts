import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import { SpotModel } from "@/lib/db/spot.model";
import redis from "@/lib/redis";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const cacheKey = `spot:${id}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return NextResponse.json({ spot: JSON.parse(cached), cached: true });
        }

        await connectDB();
        const spot = await SpotModel.findById(id).lean();
        if (!spot) {
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
        }

        await redis.set(cacheKey, JSON.stringify(spot), "EX", 60);
        return NextResponse.json({ spot, cached: false });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
  req: NextRequest,
{ params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({headers : req.headers});
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    await connectDB();

    const spot = await SpotModel.findById(id);

    if (!spot) {
      return NextResponse.json({ error: "Spot not found." }, { status: 404 });
    }

    // Authorization check
    if (spot.createdBy.toString() !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to delete this spot." },
        { status: 403 }
      );
    }

    await SpotModel.findByIdAndDelete(id);

    return NextResponse.json(
      { msg: "Spot deleted successfully", success: true },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error in deleting spot ::", error);
    return NextResponse.json(
      { error: "Internal server Error" },
      { status: 500 }
    );
  }
}

