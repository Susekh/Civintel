import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { SpotModel } from "@/lib/db/spot.model";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, tags, location, gallery } = body as {
            title: string;
            description: string;
            tags?: string[];
            location: { lat: number; lng: number };
            gallery?: string[];
        };

        if (!title || !description || !location?.lat || !location?.lng) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();

        const spot = await SpotModel.create({
            title,
            description,
            tags: Array.isArray(tags) ? tags : [],
            gallery: Array.isArray(gallery) ? gallery : [],
            location: { type: "Point", coordinates: [location.lng, location.lat] },
            createdBy: session.user.id,
        });

        return NextResponse.json({ spot }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}