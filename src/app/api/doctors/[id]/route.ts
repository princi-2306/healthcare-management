import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import DoctorProfile from "@/models/DoctorProfile";
import { requireRole } from "@/lib/rbac";

// GET /api/doctors/[id] — Get doctor details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Check if id is a DoctorProfile ID or User ID
    let profile = await DoctorProfile.findOne({
      $or: [{ userId: id }, { _id: id }],
    }).lean();

    const targetUserId = profile ? profile.userId : id;
    const user = await User.findById(targetUserId).select("-passwordHash").lean();

    if (!user || user.role !== "doctor") {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    if (!profile) {
      profile = await DoctorProfile.findOne({ userId: user._id }).lean();
    }

    return NextResponse.json({
      doctor: {
        ...user,
        _id: user._id.toString(),
        profile,
      },
    });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor" },
      { status: 500 }
    );
  }
}

// PATCH /api/doctors/[id] — Update doctor (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["admin"]);
  if (!auth.authorized) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const { name, email, ...profileData } = body;

    // Find doctor profile to get the actual userId
    let profile = await DoctorProfile.findOne({
      $or: [{ userId: id }, { _id: id }],
    });

    const targetUserId = profile ? profile.userId : id;

    if (name || email) {
      await User.findByIdAndUpdate(targetUserId, {
        ...(name && { name }),
        ...(email && { email }),
      });
    }

    if (Object.keys(profileData).length > 0) {
      profile = await DoctorProfile.findOneAndUpdate(
        { $or: [{ userId: targetUserId }, { _id: id }] },
        { $set: profileData },
        { returnDocument: "after", upsert: true }
      );
    }

    return NextResponse.json({
      message: "Doctor updated successfully",
      profile,
    });
  } catch (error: any) {
    console.error("Error updating doctor:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update doctor" },
      { status: 500 }
    );
  }
}

// DELETE /api/doctors/[id] — Delete doctor (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["admin"]);
  if (!auth.authorized) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;

    await DoctorProfile.findOneAndDelete({ userId: id });
    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json(
      { error: "Failed to delete doctor" },
      { status: 500 }
    );
  }
}
