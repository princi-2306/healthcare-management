import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DoctorProfile from "@/models/DoctorProfile";
import { requireRole } from "@/lib/rbac";
import { handleLeaveConflicts } from "@/lib/jobs/leave-conflict-handler";

// POST /api/doctors/[id]/leave — Mark leave days (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["admin"]);
  if (!auth.authorized) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const { date, reason } = body;
    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    // Add leave day to doctor profile
    await DoctorProfile.findOneAndUpdate(
      { userId: id },
      {
        $push: {
          leaveDays: { date: new Date(date), reason: reason || "" },
        },
      }
    );

    // Handle conflicts (cancel appointments, notify patients)
    const result = await handleLeaveConflicts({
      doctorId: id,
      leaveDate: new Date(date),
    });

    return NextResponse.json({
      message: "Leave day marked successfully",
      conflictsHandled: result.cancelled,
    });
  } catch (error) {
    console.error("Error marking leave:", error);
    return NextResponse.json(
      { error: "Failed to mark leave" },
      { status: 500 }
    );
  }
}
