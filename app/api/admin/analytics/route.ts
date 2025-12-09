import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; 
import { getAnalyticsData, AnalyticsData } from "@/lib/services/analytics.services"
import { logger } from "@/lib/logger";


export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        const user = session?.user;
        console.log("user :", user);
        
        if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
            logger.warn({ email: user?.email ?? "null" }, "Unauthorized attempt to access analytics API");

            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        };

        const analyticsData: AnalyticsData = await getAnalyticsData();

        return NextResponse.json(analyticsData, { status: 200 });

    } catch (error) {
        logger.error({ error }, "Failed to retrieve analytics data from the API");

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}