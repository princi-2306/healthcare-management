import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import Slot from "@/models/Slot";
import User from "@/models/User";
import DoctorProfile from "@/models/DoctorProfile";
import { requireRole, RequireRoleSuccess } from "@/lib/rbac";
import { bookSlot } from "@/lib/booking/book-slot";

// POST /api/appointments — Book an appointment
export async function POST(req: NextRequest) {
  const auth = await requireRole(["patient"]);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { slotId, symptomForm } = body;

    if (!slotId) {
      return NextResponse.json(
        { error: "Slot ID is required" },
        { status: 400 }
      );
    }

    // Get slot to find doctor ID
    await dbConnect();
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return NextResponse.json(
        { error: "Slot not found" },
        { status: 404 }
      );
    }

    const result = await bookSlot({
      slotId,
      patientId: (auth as RequireRoleSuccess).session.user.id,
      doctorId: slot.doctorId,
      symptomForm,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "Appointment booked successfully",
        appointment: result.appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error booking appointment:", error);
    return NextResponse.json(
      { error: "Failed to book appointment" },
      { status: 500 }
    );
  }
}

// GET /api/appointments — List appointments
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const query: any = {};

    // Role-based filtering
    if (session.user.role === "patient") {
      query.patientId = session.user.id;
    } else if (session.user.role === "doctor") {
      query.doctorId = session.user.id;
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate("patientId", "name email image")
      .populate("doctorId", "name email image")
      .populate("slotId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Appointment.countDocuments(query);

    // Fetch doctor profiles for the appointments
    const doctorIds = [...new Set(appointments.map((a: any) => a.doctorId?._id?.toString()))];
    const doctorProfiles = await DoctorProfile.find({
      userId: { $in: doctorIds },
    }).lean();

    const profileMap = new Map(
      doctorProfiles.map((p: any) => [p.userId.toString(), p])
    );

    const enriched = appointments.map((a: any) => ({
      ...a,
      doctorProfile: profileMap.get(a.doctorId?._id?.toString()) || null,
    }));

    return NextResponse.json({
      appointments: enriched,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
