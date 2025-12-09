import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { UserProfileModel } from "@/lib/db/userProfile.model";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const profile = await UserProfileModel.findOne({ userId: session.user.id }).lean();
    return NextResponse.json({ interests: profile?.interests || [] });
}

export async function PUT(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const interests: string[] = Array.isArray(body.interests) ? body.interests : [];
    await connectDB();
    const profile = await UserProfileModel.findOneAndUpdate(
        { userId: session.user.id },
        { $set: { interests } },
        { upsert: true, new: true }
    ).lean();
    return NextResponse.json({ interests: profile.interests });
}


