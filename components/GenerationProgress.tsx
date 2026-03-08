"use client";

import { useEffect, useState } from "react";
import { SitePlan } from "@/lib/types";
import { ElementorPage } from "@/lib/elementor";
import { CheckCircle, Circle, Loader, AlertCircle, Zap } from "lucide-react";
import clsx from "clsx";

interface PageStatus {
  id: string;
  name: string;
  status: "pending" | "generating" | "reviewing" | "done" | "error";
  sectionCount?: number;
}

interface GenerationProgressProps {
  plan: SitePlan;
  onComplete: (pageJsons: Record<string, ElementorPage>) => void;
}

export default function GenerationProgress({
  plan,
  onComplete,
}: GenerationProgressProps) {
  const [pages, setPages] = useState<PageStatus[]>(
    plan.pages.map((p) => ({ id: p.id, name: p.name, status: "pending" }))
  );
  const [globalMessage, setGlobalMessage] = useState("Initializing pipeline...");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });

        if (!res.body) throw new Error("No stream");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (active) {
          const { done: streamDone, value } = await reader.read();
          if (streamDone) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const event = JSON.parse(line);
              handleEvent(event);
            } catch {}
          }
        }
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : "Failed");
      }
    }

    function handleEvent(event: Record<string, unknown>) {
      const type = event.type as string;

      if (type === "start") {
        setGlobalMessage(event.message as string);
      } else if (type === "page_start") {
        setGlobalMessage(event.message as string);
        setPages((prev) =>
          prev.map((p) =>
            p.id === event.pageId ? { ...p, status: "generating" } : p
          )
        );
      } else if (type === "page_reviewing") {
        setPages((prev) =>
          prev.map((p) =>
            p.id === event.pageId ? { ...p, status: "reviewing" } : p
          )
        );
      } else if (type === "page_done") {
        setPages((prev) =>
          prev.map((p) =>
            p.id === event.pageId
              ? { ...p, status: "done", sectionCount: event.sectionCount as number }
              : p
          )
        );
      } else if (type === "complete") {
        setDone(true);
        setGlobalMessage(event.message as string);
        onComplete(event.pageJsons as Record<string, ElementorPage>);
      } else if (type === "error") {
        setError(event.message as string);
      }
    }

    run();
    return () => { active = false; };
  }, [plan, onComplete]);

  const doneCount = pages.filter((p) => p.status === "done").length;
  const progress = Math.round((doneCount / pages.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-4">
          {done ? (
            <CheckCircle size={28} className="text-success" />
          ) : error ? (
            <AlertCircle size={28} className="text-red-400" />
          ) : (
            <Zap size={28} className="text-accent animate-pulse" />
          )}
        </div>
        <h2 className="font-display text-2xl font-bold text-text">
          {done ? "Generation Complete" : error ? "Generation Failed" : "Generating Your Site"}
        </h2>
        <p className="text-subtle text-sm mt-1">{error || globalMessage}</p>
      </div>

      {/* Progress bar */}
      {!error && (
        <div className="bg-surface border border-border rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500 rounded-full"
            style={{ width: `${done ? 100 : progress}%` }}
          />
        </div>
      )}

      {/* Page list */}
      <div className="space-y-2">
        {pages.map((page, i) => (
          <div
            key={page.id}
            className={clsx(
              "flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
              page.status === "done" && "bg-success/5 border-success/20",
              page.status === "generating" && "bg-accent/5 border-accent/30",
              page.status === "reviewing" && "bg-warning/5 border-warning/20",
              page.status === "pending" && "bg-panel border-border opacity-50",
              page.status === "error" && "bg-red-500/5 border-red-500/20"
            )}
          >
            <div className="flex items-center gap-3">
              {page.status === "pending" && <Circle size={16} className="text-muted" />}
              {page.status === "generating" && <Loader size={16} className="text-accent animate-spin" />}
              {page.status === "reviewing" && <Loader size={16} className="text-warning animate-spin" />}
              {page.status === "done" && <CheckCircle size={16} className="text-success" />}
              {page.status === "error" && <AlertCircle size={16} className="text-red-400" />}
              <span className="text-sm font-medium text-text">{page.name}</span>
            </div>

            <div className="flex items-center gap-3">
              {page.sectionCount !== undefined && (
                <span className="text-xs font-mono text-muted">
                  {page.sectionCount} sections
                </span>
              )}
              <span
                className={clsx(
                  "text-[10px] font-mono px-2 py-0.5 rounded-full border",
                  page.status === "done" && "text-success border-success/30 bg-success/10",
                  page.status === "generating" && "text-accent border-accent/30 bg-accent/10",
                  page.status === "reviewing" && "text-warning border-warning/30 bg-warning/10",
                  page.status === "pending" && "text-muted border-border",
                  page.status === "error" && "text-red-400 border-red-400/30 bg-red-400/10"
                )}
              >
                {page.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Agent log */}
      <div className="bg-surface border border-border rounded-xl p-4 font-mono text-xs space-y-1 text-muted">
        <p className="text-accent mb-2">// Agentic Pipeline</p>
        <p>→ Pass 1: Site Planner ✓</p>
        <p>→ Pass 2: Reviewer & Refinement ✓</p>
        <p>→ Pass 3: Component Builder {done ? "✓" : <span className="text-accent animate-pulse">running...</span>}</p>
      </div>
    </div>
  );
}
