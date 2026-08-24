import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PatientProfile from "@/models/PatientProfile";
import DoctorProfile from "@/models/DoctorProfile";
import { getTokensFromCode } from "@/lib/calendar/google-client";

// GET /api/calendar/callback — Handle Google OAuth callback
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const stateStr = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL("/dashboard?calendar=error", req.url)
      );
    }

    if (!code || !stateStr) {
      return NextResponse.redirect(
        new URL("/dashboard?calendar=missing-params", req.url)
      );
    }

    const state = JSON.parse(stateStr);
    const tokens = await getTokensFromCode(code);

    await dbConnect();

    // Store tokens based on user role
    const tokenData = {
      googleCalendarTokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
    };

    if (state.role === "doctor") {
      await DoctorProfile.findOneAndUpdate(
        { userId: state.userId },
        tokenData
      );
    } else {
      await PatientProfile.findOneAndUpdate(
        { userId: state.userId },
        tokenData
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard?calendar=connected", req.url)
    );
  } catch (error) {
    console.error("Calendar callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?calendar=error", req.url)
    );
  }
}
