import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DoctorProfile from "@/models/DoctorProfile";
import Slot from "@/models/Slot";
import { generateSlots } from "@/lib/booking/slot-generator";
import { addDays, startOfDay, endOfDay } from "date-fns";

// GET /api/doctors/[id]/slots — Get available slots for a date range
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const days = parseInt(searchParams.get("days") || "1");

    if (!dateStr) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const doctorProfile = await DoctorProfile.findOne({ userId: id }).lean();
    if (!doctorProfile) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    const startDate = startOfDay(new Date(dateStr));
    const allSlots = [];

    for (let i = 0; i < days; i++) {
      const currentDate = addDays(startDate, i);

      // Get existing slots for this date
      const existingSlots = await Slot.find({
        doctorId: id,
        date: {
          $gte: startOfDay(currentDate),
          $lte: endOfDay(currentDate),
        },
      }).lean();

      // Generate missing available slots
      const generatedSlots = generateSlots({
        doctorProfile,
        date: currentDate,
        existingSlots,
      });

      // Persist generated slots
      if (generatedSlots.length > 0) {
        try {
          await Slot.insertMany(
            generatedSlots.map((s) => ({ ...s, doctorId: id })),
            { ordered: false }
          );
        } catch (e: any) {
          // Ignore duplicate key errors (slots already exist)
          if (e.code !== 11000) throw e;
        }
      }

      // Fetch all slots for this date (fresh from DB)
      const freshSlots = await Slot.find({
        doctorId: id,
        date: {
          $gte: startOfDay(currentDate),
          $lte: endOfDay(currentDate),
        },
      })
        .sort({ startTime: 1 })
        .lean();

      allSlots.push(...freshSlots);
    }

    return NextResponse.json({ slots: allSlots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch slots" },
      { status: 500 }
    );
  }
}
