"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Sparkles, Globe, Image as ImageIcon, ArrowRight,
  ChevronRight, Zap, FileJson, Upload, Check,
  Layers, ScanLine, Eye, Brain,
} from "lucide-react";
import clsx from "clsx";
import { InputMode } from "@/lib/types";

// ─── Data ─────────────────────────────────────────────────────────────────────

const EXAMPLE_PROMPTS = [
  "A premium architecture studio based in Copenhagen. Minimalist aesthetic, portfolio-heavy, targeting high-end residential clients.",
  "A SaaS tool for freelancers to track time and invoices. Clean, productivity-focused, needs pricing page and feature showcase.",
  "A boutique wellness retreat in Bali. Earthy, luxurious, must evoke calm. Needs booking flow, retreat packages, and testimonials.",
  "A B2B cybersecurity consultancy. Professional, authoritative, targeting CTOs. Services, case studies, and contact form.",
];

const MODES = [
  { id: "prompt" as InputMode, label: "Describe it", icon: Sparkles },
  { id: "url" as InputMode, label: "Scan a URL", icon: Globe },
  { id: "wireframe" as InputMode, label: "Upload Wireframe", icon: ImageIcon },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Describe your site",
    desc: "Type a prompt, paste a competitor URL, or upload a wireframe. ElementBuddy understands your vision.",
    icon: Brain,
    color: "bg-teal/10 text-teal-dim",
  },
  {
    step: "02",
    title: "AI plans & reviews",
    desc: "A planner agent creates a full multi-page site plan. A reviewer agent checks it and auto-resolves issues.",
    icon: Layers,
    color: "bg-accent/10 text-accent",
  },
  {
    step: "03",
    title: "Export to WordPress",
    desc: "Download clean Elementor JSON or push directly to your WordPress site with one click.",
    icon: Upload,
    color: "bg-teal/10 text-teal-dim",
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "Prompt to full site plan",
    desc: "Describe your business in plain English. Get a complete multi-page architecture with sections, content hints, and design tokens.",
  },
  {
    icon: Brain,
    title: "2-pass AI review",
    desc: "Every plan is checked by a reviewer agent that auto-fixes missing sections, duplicate slugs, and weak content hints.",
  },
  {
    icon: ScanLine,
    title: "URL scanner",
    desc: "Paste any website URL. ElementBuddy scrapes structure, colors, fonts, and copy to inspire a better version.",
  },
  {
    icon: Eye,
    title: "Wireframe to site",
    desc: "Upload a sketch or wireframe image. The AI reads the layout and turns it into a fully structured Elementor plan.",
  },
  {
    icon: FileJson,
    title: "Clean JSON export",
    desc: "Generated JSON uses only free Elementor widgets — no Pro required. Download as ZIP or per-page files.",
  },
  {
    icon: Zap,
    title: "Push to WordPress",
    desc: "Connect your WordPress site with an Application Password and push all pages as drafts in one click.",
  },
];

const TRUST_ITEMS = [
  { label: "Free Elementor only", icon: Check },
  { label: "No credit card", icon: Check },
  { label: "Exports in seconds", icon: Check },
  { label: "WP push included", icon: Check },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

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
      let msg = "Planning your site...";

      if (mode === "url" && url) {
        setLoadingMsg("Scanning URL...");
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (scrapeRes.ok) {
          const { context } = await scrapeRes.json();
          planBody = { mode: "prompt", prompt: `Analyzing URL: ${url}\n\n${context}\n\nCreate a site plan based on this analysis. Improve on what you see.` };
        } else {
          planBody = { mode, url };
        }
        msg = "Building site plan...";
      } else if (mode === "prompt") {
        planBody = { mode, prompt };
      } else if (mode === "wireframe") {
        planBody = { mode, wireframeBase64: wireframe };
      }

      setLoadingMsg(msg);

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
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Image src="/logo.png" alt="ElementBuddy" width={140} height={36} priority />
          <nav className="hidden md:flex items-center gap-8">
            {[["Features", "#features"], ["How it works", "#how-it-works"], ["Docs", "#"]].map(([label, href]) => (
              <a key={label} href={href}
                className="text-sm text-subtle hover:text-text transition-colors font-medium">
                {label}
              </a>
            ))}
          </nav>
          <button
            onClick={() => document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-2 bg-accent hover:bg-accent-dim text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors glow-sm">
            Start Building Free
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 badge-teal rounded-full px-4 py-1.5 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse-slow" />
            AI-Powered · Free Elementor Only · No Pro Required
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-800 tracking-tight leading-[1.05] mb-6 max-w-4xl mx-auto">
            <span className="text-gradient">Build complete</span>
            <br />
            <span className="text-gradient-accent">WordPress sites</span>
            <br />
            <span className="text-gradient">from a prompt.</span>
          </h1>

          <p className="text-subtle text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Describe your site, paste a URL, or upload a wireframe.
            ElementBuddy plans, reviews, and generates a full multi-page
            Elementor structure — ready to export or push to WordPress.
          </p>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-5 mb-12">
            {TRUST_ITEMS.map(({ label, icon: Icon }) => (
              <span key={label} className="flex items-center gap-1.5 text-sm text-subtle">
                <span className="w-5 h-5 rounded-full bg-teal/15 flex items-center justify-center">
                  <Icon size={11} className="text-teal-dim" />
                </span>
                {label}
              </span>
            ))}
          </div>

          {/* ── Input Panel ─────────────────────────────────────────────── */}
          <div id="builder" className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
              {/* Mode tabs */}
              <div className="flex border-b border-border">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button key={m.id} onClick={() => setMode(m.id)}
                      className={clsx(
                        "flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all",
                        mode === m.id
                          ? "text-accent border-b-2 border-accent bg-surface"
                          : "text-muted hover:text-subtle hover:bg-surface/50"
                      )}>
                      <Icon size={14} />
                      {m.label}
                    </button>
                  );
                })}
              </div>

              <div className="p-6">
                {mode === "prompt" && (
                  <div className="space-y-3">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your site... industry, audience, tone, key pages, goals."
                      rows={4}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder-muted text-sm resize-none focus:outline-none focus:border-teal transition-colors leading-relaxed"
                    />
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted">Try an example →</p>
                      {EXAMPLE_PROMPTS.map((ex, i) => (
                        <button key={i} onClick={() => setPrompt(ex)}
                          className="w-full text-left text-xs text-subtle hover:text-text bg-surface hover:bg-white border border-transparent hover:border-border rounded-lg px-3 py-2 transition-all line-clamp-1">
                          <ChevronRight size={10} className="inline mr-1 opacity-40" />
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {mode === "url" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3 focus-within:border-teal transition-colors">
                      <Globe size={16} className="text-muted shrink-0" />
                      <input value={url} onChange={(e) => setUrl(e.target.value)}
                        type="url" placeholder="https://example.com"
                        className="flex-1 bg-transparent text-text placeholder-muted text-sm focus:outline-none" />
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      We&apos;ll scan the page structure, color palette, typography, and copy to inspire your new site.
                    </p>
                  </div>
                )}

                {mode === "wireframe" && (
                  <div className="space-y-3">
                    <button onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-teal hover:bg-teal/5 transition-all">
                      <ImageIcon size={24} className="text-muted" />
                      <div className="text-center">
                        <p className="text-sm text-text font-medium">
                          {wireframeName || "Drop a wireframe image"}
                        </p>
                        <p className="text-xs text-muted mt-1">PNG, JPG or WebP</p>
                      </div>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*"
                      className="hidden" onChange={handleFileUpload} />
                  </div>
                )}

                {error && (
                  <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <button onClick={handleSubmit} disabled={!canSubmit || loading}
                  className={clsx(
                    "mt-5 w-full flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold transition-all",
                    canSubmit && !loading
                      ? "bg-accent hover:bg-accent-dim text-white glow cursor-pointer"
                      : "bg-surface border border-border text-muted cursor-not-allowed"
                  )}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{loadingMsg}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Generate Site Plan
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-muted mt-3">
              2-pass AI plan + reviewer validation. No WordPress site required to start.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 badge-navy rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
              How it works
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-800 text-text tracking-tight mb-4">
              From idea to Elementor
              <br />
              <span className="text-gradient-accent">in three steps.</span>
            </h2>
            <p className="text-subtle text-lg max-w-xl mx-auto">
              No designer needed. No Elementor Pro required. Just describe what you need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon, color }) => (
              <div key={step} className="bg-white border border-border rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 group">
                <div className="flex items-start gap-4 mb-5">
                  <div className={clsx("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", color)}>
                    <Icon size={20} />
                  </div>
                  <span className="font-display text-5xl font-800 text-border leading-none mt-1">{step}</span>
                </div>
                <h3 className="font-display text-lg font-700 text-text mb-2">{title}</h3>
                <p className="text-subtle text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 badge-teal rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
              Everything included
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-800 text-text tracking-tight mb-4">
              Built for the full
              <br />
              <span className="text-gradient-accent">WordPress workflow.</span>
            </h2>
            <p className="text-subtle text-lg max-w-xl mx-auto">
              From first prompt to live WordPress page — every step is covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="bg-white border border-border rounded-2xl p-7 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 group">
                <div className="w-11 h-11 rounded-xl bg-accent/[0.08] flex items-center justify-center mb-5 group-hover:bg-teal/10 transition-colors">
                  <Icon size={20} className="text-accent group-hover:text-teal-dim transition-colors" />
                </div>
                <h3 className="font-display text-base font-700 text-text mb-2">{title}</h3>
                <p className="text-subtle text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Input mode showcase ─────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 badge-navy rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
                Three ways to start
              </div>
              <h2 className="font-display text-4xl font-800 text-text tracking-tight mb-6">
                Start from wherever
                <br />
                <span className="text-gradient-accent">you are.</span>
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Sparkles, label: "Text Prompt", desc: "Describe your business, audience, and goals in plain English. The AI infers pages, sections, and design direction." },
                  { icon: Globe, label: "Scan URL", desc: "Paste a competitor or inspiration site. We extract structure, colors, fonts, and copy to build something better." },
                  { icon: ImageIcon, label: "Upload Wireframe", desc: "Have a sketch or mockup? Upload it and the AI reads the layout to generate a matching Elementor structure." },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={18} className="text-teal-dim" />
                    </div>
                    <div>
                      <p className="font-semibold text-text text-sm mb-1">{label}</p>
                      <p className="text-subtle text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual mockup card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal/10 to-accent/10 rounded-3xl blur-3xl scale-90" />
              <div className="relative bg-white border border-border rounded-2xl shadow-card overflow-hidden">
                {/* Fake browser chrome */}
                <div className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-300" />
                    <div className="w-3 h-3 rounded-full bg-yellow-300" />
                    <div className="w-3 h-3 rounded-full bg-green-300" />
                  </div>
                  <div className="flex-1 bg-white border border-border rounded-md px-3 py-1 text-xs text-muted">
                    elementbuddy.app
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex gap-2">
                    {["Describe it", "Scan URL", "Wireframe"].map((t, i) => (
                      <div key={t} className={clsx(
                        "text-xs px-3 py-1.5 rounded-lg font-medium",
                        i === 0 ? "bg-accent text-white" : "bg-surface text-muted border border-border"
                      )}>{t}</div>
                    ))}
                  </div>
                  <div className="bg-surface border border-border rounded-xl p-3 text-xs text-subtle leading-relaxed min-h-[60px]">
                    A SaaS tool for freelancers to track time and invoices. Clean, productivity-focused...
                  </div>
                  <div className="space-y-1.5">
                    {["Architecture studio · Copenhagen", "Wellness retreat · Bali", "Cybersecurity consultancy"].map((ex) => (
                      <div key={ex} className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-muted flex items-center gap-2">
                        <ChevronRight size={10} className="text-muted/50" />
                        {ex}
                      </div>
                    ))}
                  </div>
                  <div className="bg-accent rounded-xl py-3 text-center text-xs text-white font-semibold flex items-center justify-center gap-2">
                    <Sparkles size={12} />
                    Generate Site Plan
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-accent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal/10 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse-slow" />
            Ready in minutes
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-800 text-white tracking-tight mb-6">
            Start building your
            <br />
            Elementor site today.
          </h2>
          <p className="text-white/70 text-lg mb-10">
            No account needed. No Elementor Pro. Just your idea and a few seconds.
          </p>
          <button
            onClick={() => document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dim text-white font-semibold px-8 py-4 rounded-xl transition-colors glow-teal text-base">
            Generate My Site Plan
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-text py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Image src="/logo.png" alt="ElementBuddy" width={120} height={30}
              className="brightness-0 invert opacity-70" />
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} ElementBuddy · Build WordPress sites with AI.
            </p>
            <div className="flex gap-6">
              {["Features", "Docs", "GitHub"].map((item) => (
                <a key={item} href="#"
                  className="text-sm text-white/40 hover:text-white/70 transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
