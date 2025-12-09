import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import { CommentModel } from "@/lib/db/comment.model";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        await connectDB();
        const comments = await CommentModel.find({ spotId: id }).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ comments });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const body = await req.json();
        const { content } = body as { content: string };
        if (!content || !content.trim()) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        await connectDB();
        const comment = await CommentModel.create({
            spotId: id,
            username : session.user.name,
            userId: session.user.id,
            content: content.trim(),
        });
        logger.debug({comment}, "comment created");
        return NextResponse.json({ comment }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


