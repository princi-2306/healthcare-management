import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import { syncAppointmentToCalendars, generateGoogleCalendarUrl, parseSlotDateTime } from "@/lib/calendar/appointment-sync";

// GET /api/calendar/sync/[id] — Get calendar sync info & Google Calendar URL for an appointment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await dbConnect();

    const appointment = await Appointment.findById(id)
      .populate("patientId", "name email")
      .populate("doctorId", "name email")
      .populate("slotId");

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const { slotId, patientId, doctorId } = appointment;

    if (!slotId) {
      return NextResponse.json({ error: "Slot details missing" }, { status: 400 });
    }

    const startDate = parseSlotDateTime(slotId.date, slotId.startTime || "09:00");
    const endDate = parseSlotDateTime(slotId.date, slotId.endTime || "09:30");

    const patientName = patientId?.name || "Patient";
    const doctorName = doctorId?.name || "Doctor";

    const title = `Medical Appointment: ${patientName} & Dr. ${doctorName}`;
    const description = `Healthcare Appointment\nPatient: ${patientName}\nDoctor: Dr. ${doctorName}\nReason: ${appointment.symptomForm?.chiefComplaint || "Consultation"}`;

    const googleCalendarUrl = generateGoogleCalendarUrl({
      title,
      description,
      startTime: startDate,
      endTime: endDate,
    });

    return NextResponse.json({
      googleCalendarUrl,
      googleEventId: appointment.googleEventId || null,
      appointment: {
        id: appointment._id,
        status: appointment.status,
        startTime: startDate,
        endTime: endDate,
      },
    });
  } catch (error: any) {
    console.error("Error fetching calendar info:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch calendar info" }, { status: 500 });
  }
}

// POST /api/calendar/sync/[id] — Manually trigger Google Calendar sync
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await syncAppointmentToCalendars(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error triggering calendar sync:", error);
    return NextResponse.json({ error: error.message || "Failed to trigger calendar sync" }, { status: 500 });
  }
}
