import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import PatientProfile from "@/models/PatientProfile";
import DoctorProfile from "@/models/DoctorProfile";

// GET /api/calendar/status — Return Google Calendar connection status for logged in user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id: userId, role } = session.user;

    let connected = false;

    if (role === "doctor") {
      const doctor = await DoctorProfile.findOne({ userId });
      connected = Boolean(doctor?.googleCalendarTokens?.accessToken);
    } else {
      const patient = await PatientProfile.findOne({ userId });
      connected = Boolean(patient?.googleCalendarTokens?.accessToken);
    }

    return NextResponse.json({
      connected,
      role,
    });
  } catch (error: any) {
    console.error("Error checking calendar status:", error);
    return NextResponse.json(
      { error: "Failed to check Google Calendar status" },
      { status: 500 }
    );
  }
}
