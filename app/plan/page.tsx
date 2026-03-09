"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SitePlan } from "@/lib/types";
import SitePlanView from "@/components/SitePlanView";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<SitePlan | null>(null);
  const [review, setReview] = useState<{
    score: number;
    issues: string[];
    suggestions: string[];
  } | null>(null);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("sitePlan");
    const storedReview = sessionStorage.getItem("reviewData");
    if (!stored) {
      router.push("/");
      return;
    }
    setPlan(JSON.parse(stored));
    if (storedReview) setReview(JSON.parse(storedReview));
  }, [router]);

  const handleApprove = async () => {
    setApproving(true);
    sessionStorage.setItem("sitePlan", JSON.stringify(plan));
    router.push("/export");
  };

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted hover:text-text transition-colors text-sm"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <div className="w-px h-4 bg-border" />
          <Image src="/logo.png" alt="ElementBuddy" width={110} height={28} />
        </div>

        <div className="flex items-center gap-3">
          {/* AI Review score */}
          {review && (
            <div className="flex items-center gap-2 bg-panel border border-border rounded-full px-3 py-1.5">
              <CheckCircle size={12} className="text-success" />
              <span className="text-xs font-mono text-subtle">
                AI Score:{" "}
                <span className="text-success font-medium">{review.score}/100</span>
              </span>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 text-xs text-muted font-mono">
            <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">1</span>
            <span className="text-accent">Plan</span>
            <span className="text-border mx-1">→</span>
            <span className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center text-[10px]">2</span>
            <span>Generate</span>
            <span className="text-border mx-1">→</span>
            <span className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center text-[10px]">3</span>
            <span>Export</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-10">
        {/* Page title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full">
              ✓ Plan Generated & Reviewed
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-text">
            Your Site Plan
          </h1>
          <p className="text-subtle mt-1 text-sm">
            Review the structure, design tokens, and section layout. Approve to
            kick off JSON generation.
          </p>
        </div>

        {/* Review issues */}
        {review?.issues && review.issues.length > 0 && (
          <div className="mb-6 bg-warning/5 border border-warning/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} className="text-warning" />
              <p className="text-xs font-medium text-warning">
                AI Reviewer flagged {review.issues.length} issue(s) — auto-resolved
              </p>
            </div>
            <ul className="space-y-1">
              {review.issues.map((issue, i) => (
                <li key={i} className="text-xs text-muted pl-4 border-l border-warning/20">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Approved state */}
        {approved ? (
          <div className="bg-panel border border-success/30 rounded-2xl p-12 text-center">
            <CheckCircle size={40} className="text-success mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-text mb-2">
              Plan Approved!
            </h2>
            <p className="text-subtle mb-6">
              Phase 2 (JSON generation) is coming next. Your plan is saved and
              ready.
            </p>
            <div className="bg-surface border border-border rounded-xl p-4 text-left font-mono text-xs text-muted max-w-lg mx-auto">
              <p className="text-accent mb-2">// Next: Phase 2</p>
              <p>→ Generate Elementor JSON per page</p>
              <p>→ Reviewer validates widget schema</p>
              <p>→ Download ZIP or push to WordPress</p>
            </div>
          </div>
        ) : (
          <SitePlanView
            plan={plan}
            onApprove={handleApprove}
            approving={approving}
          />
        )}
      </main>
    </div>
  );
}
