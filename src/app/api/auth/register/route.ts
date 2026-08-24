import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import PatientProfile from "@/models/PatientProfile";
import { registerSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const validated = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    // Restrict public registration to patients only
    if (validated.role && validated.role !== "patient") {
      return NextResponse.json(
        { error: "Only patient registration is allowed here. Doctor accounts must be created by the Administrator." },
        { status: 403 }
      );
    }

    // Create user (role locked to patient)
    const user = await User.create({
      name: validated.name,
      email: validated.email,
      passwordHash,
      role: "patient",
    });

    // Create patient profile
    await PatientProfile.create({
      userId: user._id,
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
