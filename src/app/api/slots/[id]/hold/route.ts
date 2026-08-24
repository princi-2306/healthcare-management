import { NextRequest, NextResponse } from "next/server";
import { requireRole, RequireRoleSuccess } from "@/lib/rbac";
import { holdSlot } from "@/lib/booking/hold-slot";

// POST /api/slots/[id]/hold — Create a temporary hold on a slot
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["patient"]);
  if (!auth.authorized) return auth.response;

  try {
    const { id: slotId } = await params;
    const patientId = (auth as RequireRoleSuccess).session.user.id;

    const result = await holdSlot({ slotId, patientId });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message: result.message || "Slot held successfully",
      hold: result.hold,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("Error holding slot:", error);
    return NextResponse.json(
      { error: "Failed to hold slot" },
      { status: 500 }
    );
  }
}
