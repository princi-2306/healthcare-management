import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import Slot from "@/models/Slot";
import DoctorProfile from "@/models/DoctorProfile";
import { deleteAppointmentFromCalendars } from "@/lib/calendar/appointment-sync";
import { sendCancellationEmails } from "@/lib/notifications/appointment-notifications";

// GET /api/appointments/[id] — Get appointment details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;

    const appointment = await Appointment.findById(id)
      .populate("patientId", "name email image")
      .populate("doctorId", "name email image")
      .populate("slotId")
      .lean();

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Check access
    const userId = session.user.id;
    const role = session.user.role;
    if (
      role !== "admin" &&
      appointment.patientId?._id?.toString() !== userId &&
      appointment.doctorId?._id?.toString() !== userId
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get doctor profile
    const doctorProfile = await DoctorProfile.findOne({
      userId: appointment.doctorId?._id,
    }).lean();

    return NextResponse.json({
      appointment: {
        ...appointment,
        doctorProfile,
      },
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
  }
}

// PATCH /api/appointments/[id] — Cancel or update appointment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Handle cancellation
    if (body.status === "cancelled") {
      appointment.status = "cancelled";
      appointment.cancelledAt = new Date();
      appointment.cancelReason = body.cancelReason || "";
      await appointment.save();

      // Release the slot
      await Slot.findByIdAndUpdate(appointment.slotId, { status: "available" });

      // Delete Google Calendar event and send cancellation emails to patient & doctor
      deleteAppointmentFromCalendars(appointment._id.toString()).catch((err) =>
        console.error("Async calendar deletion error:", err)
      );
      sendCancellationEmails(appointment._id.toString(), appointment.cancelReason).catch((err) =>
        console.error("Async cancellation email error:", err)
      );

      return NextResponse.json({
        message: "Appointment cancelled",
        appointment,
      });
    }

    // Handle other status updates
    if (body.status) {
      appointment.status = body.status;
    }

    await appointment.save();

    return NextResponse.json({
      message: "Appointment updated",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}
