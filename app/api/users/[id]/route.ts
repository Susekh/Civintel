import { NextRequest, NextResponse } from "next/server";
import { UserProfileModel } from "@/lib/db/userProfile.model";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{id: string }> } 
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const {id : userId} = await params;
    console.log("user Id in route :", userId);

    if(!session) {
      return NextResponse.json({ error: "session not found" }, { status: 401 });
    }
    
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const user = await UserProfileModel.findOne({userId}).select("savedSpots").select("isPro");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user saved spots:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
