import { auth } from "@/lib/auth"
import { SpotModel } from "@/lib/db/spot.model";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    logger.info("Fetching nearby spots...");
    try {
        const session = await auth.api.getSession({headers : req.headers});
        if(!session?.user) return NextResponse.json({error : 'Unauthorized'}, {status : 401});
        const user = session.user;

        const spots = await SpotModel.find({createdBy : user.id});
        logger.debug({ count: spots.length, user: user.email }, "Spots fetched");
        return NextResponse.json({spots}, {status : 200});       

    } catch (error) {
        logger.error({ error }, "Error fetching spots");
        return NextResponse.json({error : 'Internal Server error'}, {status : 500});
    }
}