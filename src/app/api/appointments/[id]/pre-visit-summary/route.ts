import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { generatePreVisitSummaryHelper } from "@/lib/llm/pre-visit-service";

// POST /api/appointments/[id]/pre-visit-summary — Generate AI pre-visit summary
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["doctor", "admin"]);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;

    const summary = await generatePreVisitSummaryHelper(id);

    if (!summary) {
      return NextResponse.json(
        { error: "Failed to generate summary or appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      summary,
      generated: true,
    });
  } catch (error) {
    console.error("Error generating pre-visit summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
