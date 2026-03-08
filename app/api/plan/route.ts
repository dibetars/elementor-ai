import { NextRequest, NextResponse } from "next/server";
import { generateSitePlan, reviewSitePlan } from "@/lib/claude";
import { GeneratePlanInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: GeneratePlanInput = await req.json();

    if (!body.mode) {
      return NextResponse.json({ error: "Missing input mode" }, { status: 400 });
    }

    // Pass 1: Generate the initial site plan
    console.log("[planner] Generating site plan...");
    let plan = await generateSitePlan(body);

    // Pass 2: Review and refine
    console.log("[reviewer] Reviewing site plan...");
    const review = await reviewSitePlan(plan);

    if (!review.approved && review.refinedPlan) {
      console.log("[reviewer] Applying refinements...");
      plan = review.refinedPlan;
    }

    return NextResponse.json({
      plan,
      review: {
        score: review.score,
        issues: review.issues,
        suggestions: review.suggestions,
      },
    });
  } catch (err) {
    console.error("[plan/route] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate site plan" },
      { status: 500 }
    );
  }
}
