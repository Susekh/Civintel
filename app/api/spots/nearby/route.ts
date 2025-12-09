import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { SpotModel } from "@/lib/db/spot.model";
import { PipelineStage } from "mongoose";
import redis from "@/lib/redis";
import { UserProfileModel } from "@/lib/db/userProfile.model";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const tagsParam = searchParams.get("tags");
    const q = (searchParams.get("q") || "").trim();
    const global = searchParams.get("global") === "1";

    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id;

    const tags = tagsParam
      ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    await connectDB();

    let userInterests: string[] = [];
    if (userId) {
      const profile = await UserProfileModel.findOne({ userId }).lean();
      if (profile?.interests?.length) {
        userInterests = profile.interests;
      }
    }

    const interestsHash = crypto
      .createHash("md5")
      .update(userInterests.join(","))
      .digest("hex");

    const cacheKey = `spots:${lat}:${lng}:${global}:${tags.join(",")}:${q}:${userId}:${interestsHash}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("✅ Cache HIT:", cacheKey);
      return NextResponse.json(JSON.parse(cached));
    }

    console.log("⚠️ Cache MISS → Fetching from DB:", cacheKey);

    const pipeline: PipelineStage[] = [];

    if (!global) {
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distanceMeters",
          spherical: true,
          maxDistance: 10000,
        },
      });
    } else {
      const EARTH_RADIUS_METERS = 6371000;
      pipeline.push({
        $addFields: {
          distanceMeters: {
            $multiply: [
              2,
              EARTH_RADIUS_METERS,
              {
                $asin: {
                  $sqrt: {
                    $add: [
                      {
                        $pow: [
                          {
                            $sin: {
                              $divide: [
                                {
                                  $subtract: [
                                    {
                                      $degreesToRadians: {
                                        $arrayElemAt: ["$location.coordinates", 1],
                                      },
                                    },
                                    { $degreesToRadians: lat },
                                  ],
                                },
                                2,
                              ],
                            },
                          },
                          2,
                        ],
                      },
                      {
                        $multiply: [
                          { $cos: { $degreesToRadians: lat } },
                          {
                            $cos: {
                              $degreesToRadians: {
                                $arrayElemAt: ["$location.coordinates", 1],
                              },
                            },
                          },
                          {
                            $pow: [
                              {
                                $sin: {
                                  $divide: [
                                    {
                                      $subtract: [
                                        {
                                          $degreesToRadians: {
                                            $arrayElemAt: ["$location.coordinates", 0],
                                          },
                                        },
                                        { $degreesToRadians: lng },
                                      ],
                                    },
                                    2,
                                  ],
                                },
                              },
                              2,
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      });
    }

    if (tags.length) {
      pipeline.push({ $match: { tags: { $in: tags } } });
    }

    if (q) {
      const regex = new RegExp(q, "i");
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: regex } },
            { description: { $regex: regex } },
            { tags: { $elemMatch: { $regex: regex } } },
          ],
        },
      });
    }

    pipeline.push({
      $addFields: {
        distanceKm: { $round: [{ $divide: ["$distanceMeters", 1000] }, 2] },
      },
    });

    pipeline.push({
      $addFields: {
        relevance: {
          $add: [
            userInterests.length
              ? { $size: { $setIntersection: ["$tags", userInterests] } }
              : 0,
            tags.length
              ? { $size: { $setIntersection: ["$tags", tags] } }
              : 0,
          ],
        },
      },
    });

    pipeline.push({
      $addFields: {
        hybridScore: {
          $add: [
            { $multiply: ["$relevance", 10] },
            { $divide: [1, { $add: ["$distanceMeters", 1] }] },
          ],
        },
      },
    });

    pipeline.push({
      $sort: { hybridScore: -1, createdAt: -1 },
    });

    pipeline.push({ $limit: 20 });

    const spots = await SpotModel.aggregate(pipeline);

    console.log("✅ DB QUERY executed: Retrieved", spots.length, "spots");

    const responseData = { spots };

    await redis.set(cacheKey, JSON.stringify(responseData), "EX", 60);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Nearby Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
