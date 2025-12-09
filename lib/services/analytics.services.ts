import { UserProfileModel } from "../db/userProfile.model";
import { SpotModel } from "../db/spot.model";

export interface AnalyticsData {
  users: {
    total: number;
    newLast1Month: number;
    newLast3Months: number;
    newLast6Months: number;
  };
  spots: {
    total: number;
    createdLast1Month: number;
    createdLast3Months: number;
    createdLast6Months: number;
  };
}

/**
 * Calculates analytics for users and spots, showing total counts
 * and distinct non-overlapping 1, 3, and 6-month creation spans.
 */
export async function getAnalyticsData(): Promise<AnalyticsData> {
  const now = new Date();

  // Define boundaries
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);

  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  // 🧮 Run all queries in parallel
  const [
    // User counts
    totalUsers,
    newLast1MonthUsers,
    newLast3MonthsUsers,
    newLast6MonthsUsers,

    // Spot counts
    totalSpots,
    createdLast1MonthSpots,
    createdLast3MonthsSpots,
    createdLast6MonthsSpots,
  ] = await Promise.all([
    // --- USERS ---
    UserProfileModel.countDocuments(),

    // Within last 1 month
    UserProfileModel.countDocuments({ createdAt: { $gte: oneMonthAgo } }),

    // Between 1–3 months ago
    UserProfileModel.countDocuments({
      createdAt: { $gte: threeMonthsAgo, $lt: oneMonthAgo },
    }),

    // Between 3–6 months ago
    UserProfileModel.countDocuments({
      createdAt: { $gte: sixMonthsAgo, $lt: threeMonthsAgo },
    }),

    // --- SPOTS ---
    SpotModel.countDocuments(),

    // Within last 1 month
    SpotModel.countDocuments({ createdAt: { $gte: oneMonthAgo } }),

    // Between 1–3 months ago
    SpotModel.countDocuments({
      createdAt: { $gte: threeMonthsAgo, $lt: oneMonthAgo },
    }),

    // Between 3–6 months ago
    SpotModel.countDocuments({
      createdAt: { $gte: sixMonthsAgo, $lt: threeMonthsAgo },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      newLast1Month: newLast1MonthUsers,
      newLast3Months: newLast3MonthsUsers,
      newLast6Months: newLast6MonthsUsers,
    },
    spots: {
      total: totalSpots,
      createdLast1Month: createdLast1MonthSpots,
      createdLast3Months: createdLast3MonthsSpots,
      createdLast6Months: createdLast6MonthsSpots,
    },
  };
}
