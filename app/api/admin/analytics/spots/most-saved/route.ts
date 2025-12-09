import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { UserProfileModel } from "@/lib/db/userProfile.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    // Aggregate most saved spots
    const mostSaved = await UserProfileModel.aggregate([
      { $unwind: "$savedSpots" }, // explode savedSpots array
      {
        $group: {
          _id: "$savedSpots", // group by spot ID (string)
          saveCount: { $sum: 1 },
        },
      },
      { $sort: { saveCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "spots", // MongoDB collection name
          let: { spotId: { $toObjectId: "$_id" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$spotId"] } } },
            {
              $project: {
                _id: 1,
                title: 1,
                description: 1,
                location: 1,
                tags: 1,
                createdBy: 1,
                createdAt: 1,
              },
            },
          ],
          as: "spot",
        },
      },
      { $unwind: "$spot" },
      {
        $project: {
          _id: 0,
          spotId: "$spot._id",
          title: "$spot.title",
          description: "$spot.description",
          location: "$spot.location",
          tags: "$spot.tags",
          createdBy: "$spot.createdBy",
          createdAt: "$spot.createdAt",
          saveCount: 1,
        },
      },
    ]);
    
    return NextResponse.json({ success: true, data: mostSaved });
  } catch (err) {
    console.error("Error fetching most-saved spots:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch most-saved spots." },
      { status: 500 }
    );
  }
}
