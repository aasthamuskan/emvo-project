import { NextRequest, NextResponse } from "next/server";
import { parseCampaignIntent } from "@/lib/openai";
import { countAudience } from "@/lib/audience";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a campaign description (at least 5 characters)" },
        { status: 400 }
      );
    }

    // Step 1: Parse natural language intent → structured filters
    const plan = await parseCampaignIntent(query.trim());

    // Step 2: Count audience matching the parsed filters
    const audienceCount = await countAudience(plan.filters);

    return NextResponse.json({
      ...plan,
      audienceCount,
    });
  } catch (error: unknown) {
    console.error("[/api/ai/plan] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate campaign plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
