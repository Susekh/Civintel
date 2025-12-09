import { auth } from "@/lib/auth";
import { SpotDocument, SpotModel } from "@/lib/db/spot.model";
import { UserProfileModel } from "@/lib/db/userProfile.model";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

export async function PUT(req: NextRequest, { params }: { params: Promise<{id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const {id : projectId} = await params;
    const user = await UserProfileModel.findOne({ userId : session.user.id});
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const spot = (await SpotModel.findById(projectId)) as SpotDocument | null;
    if (!spot) {
      return NextResponse.json({ error: "Spot not found" }, { status: 404 });
    }

    const spotId = (spot._id as Types.ObjectId).toString();

    const alreadySaved = user.savedSpots.includes(spotId);

    if (alreadySaved) {
      // Unsave the spot
      user.savedSpots = user.savedSpots.filter(id => id.toString() !== spotId);
      await user.save();
      logger.info({ userId: user.id.toString(), spotId }, "Spot unsaved successfully");
      return NextResponse.json({ message: "Spot removed from saved list" }, { status: 200 });
    } else {
      // Save the spot
      user.savedSpots.push(spot.id);
      await user.save();
      logger.info({ userId: user.id.toString(), spotId }, "Spot saved successfully");
      return NextResponse.json({ message: "Spot saved successfully" }, { status: 200 });
    }
  } catch (error) {
    logger.error({ error }, "Error while saving/unsaving a spot.");
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
