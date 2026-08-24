import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import DoctorProfile from "@/models/DoctorProfile";

// GET /api/doctors/me — Get currently logged-in doctor profile and schedule
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Unauthorized. Doctor access required." },
        { status: 401 }
      );
    }

    await dbConnect();
    const userId = session.user.id;

    const user = await User.findById(userId).select("-passwordHash").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await DoctorProfile.findOne({ userId }).lean();

    return NextResponse.json({
      doctor: {
        ...user,
        _id: user._id.toString(),
        profile,
      },
    });
  } catch (error) {
    console.error("Error fetching current doctor profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor profile" },
      { status: 500 }
    );
  }
}
