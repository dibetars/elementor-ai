"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Globe,
  Image as ImageIcon,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import { InputMode } from "@/lib/types";

const EXAMPLE_PROMPTS = [
  "A premium architecture studio based in Copenhagen. Minimalist aesthetic, portfolio-heavy, targeting high-end residential clients.",
  "A SaaS tool for freelancers to track time and invoices. Clean, productivity-focused, needs pricing page and feature showcase.",
  "A boutique wellness retreat in Bali. Earthy, luxurious, must evoke calm. Needs booking flow, retreat packages, and testimonials.",
  "A B2B cybersecurity consultancy. Professional, authoritative, targeting CTOs. Services, case studies, and contact form.",
];

const MODES = [
  { id: "prompt" as InputMode, label: "Describe", icon: Sparkles },
  { id: "url" as InputMode, label: "Scan URL", icon: Globe },
  { id: "wireframe" as InputMode, label: "Upload Wireframe", icon: ImageIcon },
];

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<InputMode>("prompt");
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [wireframe, setWireframe] = useState<string | null>(null);
  const [wireframeName, setWireframeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Planning your site...");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWireframeName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setWireframe(base64);
    };
    reader.readAsDataURL(file);
  };

  const canSubmit =
    (mode === "prompt" && prompt.trim().length > 10) ||
    (mode === "url" && url.trim().length > 5) ||
    (mode === "wireframe" && wireframe !== null);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    try {
      let planBody: Record<string, unknown> = { mode };
      let loadingMsg = "Planning your site...";

      // URL mode: scrape first, then plan with context
      if (mode === "url" && url) {
        setLoadingMsg("Scanning URL...");
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (scrapeRes.ok) {
          const { context } = await scrapeRes.json();
          // Pass both the URL and the scraped context to the planner
          planBody = { mode: "prompt", prompt: `Analyzing URL: ${url}\n\n${context}\n\nCreate a site plan based on this analysis. Improve on what you see.` };
        } else {
          // Fallback: just use the URL directly
          planBody = { mode, url };
        }
        loadingMsg = "Building site plan...";
      } else if (mode === "prompt") {
        planBody = { mode, prompt };
      } else if (mode === "wireframe") {
        planBody = { mode, wireframeBase64: wireframe };
      }

      setLoadingMsg(loadingMsg);

      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planBody),
      });

      if (!res.ok) throw new Error("Failed to generate plan");
      const data = await res.json();

      sessionStorage.setItem("sitePlan", JSON.stringify(data.plan));
      sessionStorage.setItem("reviewData", JSON.stringify(data.review));
      router.push("/plan");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="ElementBuddy" width={140} height={36} priority />
        </div>
        <nav className="flex items-center gap-6">
          <a href="#" className="text-subtle text-sm hover:text-text transition-colors">
            Docs
          </a>
          <a href="#" className="text-subtle text-sm hover:text-text transition-colors">
            Examples
          </a>
          <button className="text-sm bg-panel border border-border text-text px-4 py-2 rounded-lg hover:border-accent transition-colors">
            Sign in
          </button>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-3xl w-full mx-auto text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-panel border border-border rounded-full px-4 py-1.5 text-xs text-subtle font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
            Phase 1–5 · Full Pipeline
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-800 tracking-tight leading-[1.05] mb-6">
            <span className="text-gradient">Generate complete</span>
            <br />
            <span className="text-gradient-accent">Elementor sites</span>
            <br />
            <span className="text-gradient">from a prompt.</span>
          </h1>

          <p className="text-subtle text-lg leading-relaxed max-w-xl mx-auto">
            Describe your site, paste a URL to inspire from, or upload a wireframe.
            The AI plans, generates, and refines a full multi-page Elementor structure —
            ready to import or push directly to WordPress.
          </p>
        </div>

        {/* Input Panel */}
        <div className="w-full max-w-2xl">
          <div className="bg-panel border border-border rounded-2xl overflow-hidden glow-sm">
            {/* Mode tabs */}
            <div className="flex border-b border-border">
              {MODES.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all",
                      mode === m.id
                        ? "text-accent border-b-2 border-accent bg-accent/5"
                        : "text-muted hover:text-subtle"
                    )}
                  >
                    <Icon size={15} />
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Input area */}
            <div className="p-6">
              {mode === "prompt" && (
                <div className="space-y-4">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your site... industry, audience, tone, key pages, goals."
                    rows={5}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder-muted text-sm resize-none focus:outline-none focus:border-accent transition-colors font-body leading-relaxed"
                  />
                  {/* Example prompts */}
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted font-mono">
                      Try an example →
                    </p>
                    {EXAMPLE_PROMPTS.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(ex)}
                        className="w-full text-left text-xs text-subtle hover:text-text bg-surface/50 hover:bg-surface border border-transparent hover:border-border rounded-lg px-3 py-2 transition-all line-clamp-1"
                      >
                        <ChevronRight size={10} className="inline mr-1 opacity-50" />
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === "url" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3 focus-within:border-accent transition-colors">
                    <Globe size={16} className="text-muted shrink-0" />
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      type="url"
                      placeholder="https://example.com"
                      className="flex-1 bg-transparent text-text placeholder-muted text-sm focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    We'll scan the page structure, color palette, typography, copy, and layout
                    patterns to inspire your new Elementor site.
                  </p>
                </div>
              )}

              {mode === "wireframe" && (
                <div className="space-y-3">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-accent/50 hover:bg-accent/5 transition-all"
                  >
                    <ImageIcon size={24} className="text-muted" />
                    <div className="text-center">
                      <p className="text-sm text-text">
                        {wireframeName || "Drop a wireframe image"}
                      </p>
                      <p className="text-xs text-muted mt-1">PNG, JPG or WebP</p>
                    </div>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="mt-3 text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className={clsx(
                  "mt-5 w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium transition-all",
                  canSubmit && !loading
                    ? "bg-accent hover:bg-accent/90 text-white glow cursor-pointer"
                    : "bg-surface border border-border text-muted cursor-not-allowed"
                )}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>{loadingMsg}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Generate Site Plan</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-muted mt-4">
            Generates a 2-pass agentic plan with reviewer validation.
            No WordPress site required to start.
          </p>
        </div>
      </main>
    </div>
  );
}
