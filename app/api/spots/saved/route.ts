import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { UserProfileModel } from "@/lib/db/userProfile.model";
import { SpotModel } from "@/lib/db/spot.model";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      logger.warn("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };
    const user = session.user;
    logger.info({info : "Fetching saved spots.", userName : user.name, userEmail : user.email});

    const profile = await UserProfileModel.findOne({ userId: user.id });
    if (!profile) {
      logger.info({ userId: user.id }, "No profile found for user");
      return NextResponse.json({ spots: [] }, { status: 200 });
    };

    // Get all spots whose _id is in savedSpots
    if (!profile.savedSpots || profile.savedSpots.length === 0) {
      logger.debug({ userId: user.id }, "User has no saved spots");
      return NextResponse.json({ spots: [] }, { status: 200 });
    };

    const spots = await SpotModel.find({
      _id: { $in: profile.savedSpots },
    });

    logger.info(
      { count: spots.length, user: user.email },
      "Fetched saved spots successfully"
    );

    return NextResponse.json({ spots }, { status: 200 });
  } catch (error) {
    logger.error({ error }, "Error fetching saved spots");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
