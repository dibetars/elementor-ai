"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SitePlan } from "@/lib/types";
import { ElementorPage } from "@/lib/elementor";
import GenerationProgress from "@/components/GenerationProgress";
import ExportPanel from "@/components/ExportPanel";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ExportPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<SitePlan | null>(null);
  const [pageJsons, setPageJsons] = useState<Record<string, ElementorPage> | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("sitePlan");
    if (!stored) { router.push("/"); return; }
    setPlan(JSON.parse(stored));
  }, [router]);

  const handleComplete = useCallback((jsons: Record<string, ElementorPage>) => {
    setPageJsons(jsons);
  }, []);

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
            href="/plan"
            className="flex items-center gap-2 text-muted hover:text-text transition-colors text-sm"
          >
            <ArrowLeft size={14} />
            Back to Plan
          </Link>
          <div className="w-px h-4 bg-border" />
          <Image src="/logo.png" alt="ElementBuddy" width={110} height={28} />
        </div>

        {/* Steps */}
        <div className="flex items-center gap-1.5 text-xs text-muted font-mono">
          <span className="w-5 h-5 rounded-full bg-success/20 text-success border border-success/30 flex items-center justify-center text-[10px]">✓</span>
          <span className="text-success">Plan</span>
          <span className="text-border mx-1">→</span>
          <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">2</span>
          <span className="text-accent">Generate</span>
          <span className="text-border mx-1">→</span>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${pageJsons ? "bg-success/20 text-success border border-success/30" : "bg-surface border border-border"}`}>
            {pageJsons ? "✓" : "3"}
          </span>
          <span className={pageJsons ? "text-success" : ""}>Export</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-text">
            {pageJsons ? "Ready to Export" : "Generating Your Site"}
          </h1>
          <p className="text-subtle mt-1 text-sm">
            {pageJsons
              ? `${plan.pages.length} pages built — download as ZIP or push directly to WordPress.`
              : `Building Elementor JSON for all ${plan.pages.length} pages...`}
          </p>
        </div>

        <div className="grid grid-cols-5 gap-8">
          {/* Left column: progress or summary */}
          <div className="col-span-3">
            {!pageJsons ? (
              <div className="bg-panel border border-border rounded-2xl p-8">
                <GenerationProgress plan={plan} onComplete={handleComplete} />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={16} className="text-success" />
                  <p className="text-sm font-medium text-text">All pages generated</p>
                </div>
                {plan.pages.map((page) => {
                  const json = pageJsons[page.id];
                  return (
                    <div
                      key={page.id}
                      className="bg-panel border border-success/20 rounded-xl px-4 py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-text">{page.name}</p>
                        <p className="text-[11px] font-mono text-muted">
                          /{page.slug} · {json?.content?.length ?? 0} sections · {
                            JSON.stringify(json).length > 1024
                              ? `${(JSON.stringify(json).length / 1024).toFixed(1)}KB`
                              : `${JSON.stringify(json).length}B`
                          }
                        </p>
                      </div>
                      <CheckCircle size={14} className="text-success" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column: export options */}
          <div className="col-span-2">
            {pageJsons ? (
              <div className="bg-panel border border-border rounded-2xl p-6">
                <ExportPanel plan={plan} pageJsons={pageJsons} />
              </div>
            ) : (
              <div className="bg-panel border border-border rounded-2xl p-6 opacity-40 pointer-events-none">
                <p className="text-sm font-display font-semibold text-text mb-2">Export Options</p>
                <p className="text-xs text-muted">Available once generation completes...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
