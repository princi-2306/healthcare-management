import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import DoctorProfile from "@/models/DoctorProfile";
import { requireRole } from "@/lib/rbac";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email/client";
import { getDoctorWelcomeEmailHtml } from "@/lib/email/templates/doctor-welcome";

// GET /api/doctors — Search doctors (public for patients)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const specialisation = searchParams.get("specialisation");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build doctor profile query
    const profileQuery: any = {};
    if (specialisation && specialisation !== "all") {
      profileQuery.specialisation = { $regex: specialisation, $options: "i" };
    }

    const profiles = await DoctorProfile.find(profileQuery)
      .populate("userId", "name email image")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Apply name search filter
    let results = profiles.map((profile: any) => ({
      _id: profile.userId?._id,
      name: profile.userId?.name,
      email: profile.userId?.email,
      image: profile.userId?.image,
      profile: {
        _id: profile._id,
        specialisation: profile.specialisation,
        qualification: profile.qualification,
        experience: profile.experience,
        bio: profile.bio,
        consultationFee: profile.consultationFee,
        slotDurationMins: profile.slotDurationMins,
      },
    }));

    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (r: any) =>
          r.name?.toLowerCase().includes(searchLower) ||
          r.profile?.specialisation?.toLowerCase().includes(searchLower)
      );
    }

    // Get unique specialisations for filter dropdown
    const specialisations = await DoctorProfile.distinct("specialisation");

    const total = await DoctorProfile.countDocuments(profileQuery);

    return NextResponse.json({
      doctors: results,
      specialisations,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}

// POST /api/doctors — Create doctor (admin only)
export async function POST(req: NextRequest) {
  const auth = await requireRole(["admin"]);
  if (!auth.authorized) return auth.response;

  try {
    await dbConnect();

    const body = await req.json();
    const { name, email, password, ...profileData } = body;

    // Check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    // Create user with doctor role
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "doctor",
    });

    // Create doctor profile
    const profile = await DoctorProfile.create({
      userId: user._id,
      ...profileData,
    });

    // Send credentials to doctor's email
    const loginUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login`;
    const emailHtml = getDoctorWelcomeEmailHtml({
      doctorName: user.name,
      email: user.email,
      password,
      loginUrl,
    });

    await sendEmail({
      to: user.email,
      subject: "Welcome to Healthcare Platform - Your Login Credentials",
      html: emailHtml,
      text: `Welcome, Dr. ${user.name}!\n\nAn account has been created for you.\nEmail: ${user.email}\nPassword: ${password}\nLogin at: ${loginUrl}`,
    });

    return NextResponse.json(
      {
        message: "Doctor created successfully and credential email sent",
        doctor: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profile,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating doctor:", error);
    return NextResponse.json(
      { error: "Failed to create doctor" },
      { status: 500 }
    );
  }
}

